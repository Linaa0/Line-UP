import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { ticketCode } from '../common/codes.js';
import { addMinutes, minutesBetween } from '../common/kigali-time.js';
import { nextTripsAtStop } from '../common/schedule.js';
import { PrismaService } from '../database/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { TransitService } from '../routes/transit.service.js';

export const ticketInclude = {
  route: { include: { stops: { include: { stop: true }, orderBy: { order: 'asc' } }, buses: true } },
  fromStop: true,
  toStop: true,
  payment: true,
  queueEntry: true,
  user: true,
} satisfies Prisma.TicketInclude;

export type FullTicket = Prisma.TicketGetPayload<{ include: typeof ticketInclude }>;

/** A ticket stays valid until 30 minutes after its scheduled arrival. */
const VALID_AFTER_ARRIVAL_MIN = 30;

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transit: TransitService,
  ) {}

  async create(userId: string, input: { routeId: string; fromStopId: string; toStopId: string; tripStartAt?: Date }) {
    const route = await this.transit.loadRoute(input.routeId);
    const { from, to } = this.transit.segment(route, input.fromStopId, input.toStopId);
    const now = new Date();

    let tripStartAt: Date;
    if (input.tripStartAt) {
      tripStartAt = input.tripStartAt;
      const upcoming = nextTripsAtStop(route, from.minutesFromStart, addMinutes(now, -1), 200);
      if (!upcoming.some((t) => t.tripStartAt.getTime() === tripStartAt.getTime())) {
        throw new BadRequestException('That bus has already left or is not on the timetable. Pick another departure.');
      }
    } else {
      const [next] = nextTripsAtStop(route, from.minutesFromStart, now, 1);
      if (!next) throw new BadRequestException('No more buses on this route today.');
      tripStartAt = next.tripStartAt;
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const ticket = await this.prisma.ticket.create({
          data: {
            code: ticketCode(),
            userId,
            routeId: route.id,
            fromStopId: from.stopId,
            toStopId: to.stopId,
            tripStartAt,
            departureAt: addMinutes(tripStartAt, from.minutesFromStart),
            arrivalAt: addMinutes(tripStartAt, to.minutesFromStart),
            fare: route.fare,
          },
          include: ticketInclude,
        });
        return this.view(ticket);
      } catch (error) {
        const duplicateCode = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
        if (!duplicateCode) throw error;
      }
    }
    throw new BadRequestException('Could not create a ticket. Try again.');
  }

  async list(userId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId, status: { not: 'CANCELLED' } },
      include: ticketInclude,
      orderBy: { departureAt: 'desc' },
      take: 50,
    });
    const views = tickets.map((t) => this.view(t));
    return {
      active: views.filter((t) => t.state === 'active' || t.state === 'awaiting_payment').reverse(),
      past: views.filter((t) => t.state === 'expired' || t.state === 'used'),
    };
  }

  async get(userId: string, id: string) {
    return this.view(await this.find(userId, id));
  }

  async find(userId: string, id: string): Promise<FullTicket> {
    const ticket = await this.prisma.ticket.findFirst({ where: { id, userId }, include: ticketInclude });
    if (!ticket) throw new NotFoundException('Ticket not found.');
    return ticket;
  }

  view(ticket: FullTicket) {
    const now = new Date();
    const validUntil = addMinutes(ticket.arrivalAt, VALID_AFTER_ARRIVAL_MIN);
    const fromRs = ticket.route.stops.find((s) => s.stopId === ticket.fromStopId);
    const state =
      ticket.status === 'PENDING_PAYMENT'
        ? ticket.departureAt < now
          ? 'expired'
          : 'awaiting_payment'
        : now > validUntil
          ? ticket.status === 'BOARDED'
            ? 'used'
            : 'expired'
          : 'active';

    return {
      id: ticket.id,
      code: ticket.code,
      status: ticket.status,
      state,
      fare: ticket.fare,
      passenger: ticket.user.fullName,
      route: this.transit.summary(ticket.route),
      from: { id: ticket.fromStop.id, name: ticket.fromStop.name, bay: fromRs?.bay ?? null },
      to: { id: ticket.toStop.id, name: ticket.toStop.name },
      tripStartAt: ticket.tripStartAt,
      departureAt: ticket.departureAt,
      arrivalAt: ticket.arrivalAt,
      durationMin: Math.round(minutesBetween(ticket.departureAt, ticket.arrivalAt)),
      validUntil,
      bus: this.transit.busForTrip(ticket.route, ticket.tripStartAt)?.plate ?? null,
      payment: ticket.payment
        ? {
            method: ticket.payment.method,
            phone: ticket.payment.phone,
            reference: ticket.payment.reference,
            status: ticket.payment.status,
            demo: ticket.payment.provider === 'DEMO',
            paidAt: ticket.payment.createdAt,
          }
        : null,
      queueEntryId: ticket.queueEntry?.id ?? null,
      createdAt: ticket.createdAt,
    };
  }
}
