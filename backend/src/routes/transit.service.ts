import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { addMinutes, minutesBetween } from '../common/kigali-time.js';
import { activeTripStarts, nextTripsAtStop, positionAlongPath } from '../common/schedule.js';
import { PrismaService } from '../database/prisma.service.js';
import type { Bus, Route, RouteStop, Stop } from '../generated/prisma/client.js';

export type LoadedRoute = Route & { stops: (RouteStop & { stop: Stop })[]; buses: Bus[] };

const routeInclude = {
  stops: { include: { stop: true }, orderBy: { order: 'asc' } },
  buses: true,
} as const;

/**
 * Route search, departures and bus positions. Times come from each route's
 * timetable (no GPS feed is integrated), so responses mark them `estimated`.
 * Bus load is real: paid tickets for that trip divided by bus capacity.
 */
@Injectable()
export class TransitService {
  constructor(private readonly prisma: PrismaService) {}

  async loadRoute(routeId: string): Promise<LoadedRoute> {
    const route = await this.prisma.route.findUnique({ where: { id: routeId }, include: routeInclude });
    if (!route) throw new NotFoundException('Route not found.');
    return route;
  }

  stopIndex(route: LoadedRoute, stopId: string) {
    return route.stops.findIndex((s) => s.stopId === stopId);
  }

  /** Validates a from → to pair on a route and returns both route stops. */
  segment(route: LoadedRoute, fromStopId: string, toStopId: string) {
    const fromIdx = this.stopIndex(route, fromStopId);
    const toIdx = this.stopIndex(route, toStopId);
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= toIdx) {
      throw new BadRequestException(`Route ${route.code} does not go from that stop to that stop.`);
    }
    return { from: route.stops[fromIdx], to: route.stops[toIdx], fromIdx, toIdx };
  }

  async tripLoadPercent(route: LoadedRoute, tripStartAt: Date) {
    const sold = await this.prisma.ticket.count({
      where: { routeId: route.id, tripStartAt, status: { in: ['PAID', 'BOARDED'] } },
    });
    const capacity = route.buses[0]?.capacity ?? 70;
    return Math.min(100, Math.round((sold / capacity) * 100));
  }

  /** The bus assigned to a trip: buses on a route take turns. */
  busForTrip(route: LoadedRoute, tripStartAt: Date) {
    if (!route.buses.length) return null;
    const slot = Math.floor(tripStartAt.getTime() / 60_000 / route.frequencyMin);
    return route.buses[slot % route.buses.length];
  }

  summary(route: LoadedRoute) {
    const first = route.stops[0];
    const last = route.stops[route.stops.length - 1];
    return {
      id: route.id,
      code: route.code,
      direction: route.direction,
      kind: route.kind,
      operator: route.operator,
      via: route.via,
      fare: route.fare,
      frequencyMin: route.frequencyMin,
      acceptsTapGo: route.acceptsTapGo,
      acceptsMomo: route.acceptsMomo,
      origin: { id: first.stop.id, name: first.stop.name },
      terminus: { id: last.stop.id, name: last.stop.name },
    };
  }

  async searchStops(query?: string) {
    const stops = await this.prisma.stop.findMany({
      where: query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { area: { contains: query, mode: 'insensitive' } }] } : {},
      orderBy: { name: 'asc' },
      include: { routeStops: { select: { route: { select: { code: true } } } } },
    });
    // Each line exists in both directions; count each line once.
    return stops.map(({ routeStops, ...s }) => ({
      ...s,
      routeCount: new Set(routeStops.map((rs) => rs.route.code)).size,
    }));
  }

  async search(fromStopId: string, toStopId: string, at: Date) {
    if (fromStopId === toStopId) throw new BadRequestException('Choose two different stops.');
    const [from, to] = await Promise.all([
      this.prisma.stop.findUnique({ where: { id: fromStopId } }),
      this.prisma.stop.findUnique({ where: { id: toStopId } }),
    ]);
    if (!from || !to) throw new NotFoundException('Stop not found.');

    const candidates = await this.prisma.route.findMany({
      where: { AND: [{ stops: { some: { stopId: fromStopId } } }, { stops: { some: { stopId: toStopId } } }] },
      include: routeInclude,
    });

    const results = [];
    for (const route of candidates) {
      const fromIdx = this.stopIndex(route, fromStopId);
      const toIdx = this.stopIndex(route, toStopId);
      if (fromIdx >= toIdx) continue;
      const fromStop = route.stops[fromIdx];
      const toStop = route.stops[toIdx];
      const [next] = nextTripsAtStop(route, fromStop.minutesFromStart, at, 1);
      if (!next) continue;
      const durationMin = toStop.minutesFromStart - fromStop.minutesFromStart;
      results.push({
        route: this.summary(route),
        from: { id: from.id, name: from.name, bay: fromStop.bay },
        to: { id: to.id, name: to.name },
        stopsCount: toIdx - fromIdx,
        durationMin,
        fare: route.fare,
        departureAt: next.atStop,
        arrivalAt: addMinutes(next.atStop, durationMin),
        minutesAway: Math.max(0, Math.round(minutesBetween(at, next.atStop))),
        loadPercent: await this.tripLoadPercent(route, next.tripStartAt),
        estimated: true,
      });
    }
    results.sort((a, b) => a.arrivalAt.getTime() - b.arrivalAt.getTime());
    return {
      from: { id: from.id, name: from.name },
      to: { id: to.id, name: to.name },
      results: results.map((r, i) => ({ ...r, best: i === 0 })),
    };
  }

  async routeDetails(routeId: string, fromStopId: string | undefined, toStopId: string | undefined, userId: string | null) {
    const route = await this.loadRoute(routeId);
    const fromRs = fromStopId ? route.stops[this.stopIndex(route, fromStopId)] : route.stops[0];
    const toRs = toStopId ? route.stops[this.stopIndex(route, toStopId)] : route.stops[route.stops.length - 1];
    if (!fromRs || !toRs || fromRs.order >= toRs.order) {
      throw new BadRequestException(`Route ${route.code} does not go from that stop to that stop.`);
    }
    const now = new Date();
    const upcoming = nextTripsAtStop(route, fromRs.minutesFromStart, now, 3);
    const next = upcoming[0];
    const tripStartAt = next?.tripStartAt ?? now;
    const saved = userId
      ? !!(await this.prisma.savedRoute.findUnique({ where: { userId_routeId: { userId, routeId } } }))
      : false;

    return {
      route: this.summary(route),
      from: { id: fromRs.stop.id, name: fromRs.stop.name, bay: fromRs.bay },
      to: { id: toRs.stop.id, name: toRs.stop.name },
      durationMin: toRs.minutesFromStart - fromRs.minutesFromStart,
      fare: route.fare,
      saved,
      estimated: true,
      nextDepartures: upcoming.map((t) => ({
        tripStartAt: t.tripStartAt,
        departureAt: t.atStop,
        minutesAway: Math.max(0, Math.round(minutesBetween(now, t.atStop))),
      })),
      bus: this.busForTrip(route, tripStartAt),
      loadPercent: next ? await this.tripLoadPercent(route, next.tripStartAt) : 0,
      stops: route.stops
        .filter((s) => s.order >= fromRs.order && s.order <= toRs.order)
        .map((s) => ({
          id: s.stop.id,
          name: s.stop.name,
          lat: s.stop.lat,
          lng: s.stop.lng,
          bay: s.bay,
          time: addMinutes(tripStartAt, s.minutesFromStart),
          role: s.order === fromRs.order ? 'departure' : s.order === toRs.order ? 'arrival' : 'intermediate',
        })),
    };
  }

  /** Next buses calling at a stop, across all routes (Home "Nearby buses"). */
  async departures(stopId: string, limit: number) {
    const stop = await this.prisma.stop.findUnique({ where: { id: stopId } });
    if (!stop) throw new NotFoundException('Stop not found.');
    const routes = await this.prisma.route.findMany({
      where: { stops: { some: { stopId } } },
      include: routeInclude,
    });
    const now = new Date();
    const items = [];
    for (const route of routes) {
      const idx = this.stopIndex(route, stopId);
      if (idx === route.stops.length - 1) continue; // the bus terminates here
      const rs = route.stops[idx];
      const [next] = nextTripsAtStop(route, rs.minutesFromStart, now, 1);
      if (!next) continue;
      const elapsed = minutesBetween(next.tripStartAt, now);
      const stopsAway = elapsed < 0 ? idx : Math.max(0, idx - positionAlongPath(route.stops, elapsed).segment - 1);
      const terminus = route.stops[route.stops.length - 1];
      items.push({
        route: this.summary(route),
        from: { id: stop.id, name: stop.name, bay: rs.bay },
        to: { id: terminus.stop.id, name: terminus.stop.name },
        departureAt: next.atStop,
        minutesAway: Math.max(0, Math.round(minutesBetween(now, next.atStop))),
        stopsAway,
        fare: route.fare,
        loadPercent: await this.tripLoadPercent(route, next.tripStartAt),
        estimated: true,
      });
    }
    items.sort((a, b) => a.departureAt.getTime() - b.departureAt.getTime());
    return { stop: { id: stop.id, name: stop.name }, items: items.slice(0, limit) };
  }

  /** Buses currently on the road, with positions estimated from the timetable. */
  async liveBuses(routeId?: string) {
    const routes = await this.prisma.route.findMany({ where: routeId ? { id: routeId } : {}, include: routeInclude });
    const now = new Date();
    const buses = [];
    for (const route of routes) {
      const total = route.stops[route.stops.length - 1].minutesFromStart;
      for (const start of activeTripStarts(route, total, now)) {
        const elapsed = minutesBetween(start, now);
        const { segment, fraction } = positionAlongPath(route.stops, elapsed);
        const a = route.stops[segment].stop;
        const b = route.stops[Math.min(segment + 1, route.stops.length - 1)];
        buses.push({
          routeId: route.id,
          code: route.code,
          direction: route.direction,
          plate: this.busForTrip(route, start)?.plate ?? null,
          lat: a.lat + (b.stop.lat - a.lat) * fraction,
          lng: a.lng + (b.stop.lng - a.lng) * fraction,
          nextStop: { id: b.stop.id, name: b.stop.name },
          minutesToNextStop: Math.max(0, Math.round(b.minutesFromStart - elapsed)),
          terminus: route.stops[route.stops.length - 1].stop.name,
          loadPercent: await this.tripLoadPercent(route, start),
        });
      }
    }
    const lines = routes.map((r) => ({
      routeId: r.id,
      code: r.code,
      direction: r.direction,
      path: r.stops.map((s) => ({ id: s.stop.id, name: s.stop.name, lat: s.stop.lat, lng: s.stop.lng })),
    }));
    return { generatedAt: now, estimated: true, buses, lines };
  }
}
