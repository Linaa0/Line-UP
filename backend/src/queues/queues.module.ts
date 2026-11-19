import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';

import { AuthGuard, UserId } from '../auth/auth.guard.js';
import { addMinutes, minutesBetween } from '../common/kigali-time.js';
import { PrismaService } from '../database/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { TransitService } from '../routes/transit.service.js';
import { TicketsService } from '../tickets/tickets.service.js';

/** Boarding opens this many minutes before the scheduled departure. */
const BOARDING_WINDOW_MIN = 3;

@Injectable()
export class QueuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tickets: TicketsService,
    private readonly transit: TransitService,
    private readonly notifications: NotificationsService,
  ) {}

  async join(userId: string, ticketId: string) {
    const ticket = await this.tickets.find(userId, ticketId);
    if (ticket.queueEntry) return this.view(userId, ticket.queueEntry.id);
    if (ticket.status !== 'PAID') throw new BadRequestException('Pay for the ticket before joining the queue.');
    if (ticket.departureAt < addMinutes(new Date(), -2)) {
      throw new BadRequestException('This bus has already left.');
    }
    const entry = await this.prisma.queueEntry.create({
      data: {
        ticketId,
        userId,
        routeId: ticket.routeId,
        stopId: ticket.fromStopId,
        departureAt: ticket.departureAt,
      },
    });
    const view = await this.view(userId, entry.id);
    await this.notifications.create(userId, {
      type: 'QUEUE',
      title: `You're #${view.position} in the queue`,
      body: `Bus ${view.route.code} to ${view.to.name} leaves ${view.from.name}${view.from.bay ? `, ${view.from.bay}` : ''} at ${view.departureLabel}.`,
    });
    return view;
  }

  async active(userId: string) {
    const entry = await this.prisma.queueEntry.findFirst({
      where: { userId, ticket: { arrivalAt: { gt: addMinutes(new Date(), -15) } } },
      orderBy: { departureAt: 'asc' },
    });
    return entry ? this.view(userId, entry.id) : null;
  }

  async board(userId: string, id: string) {
    const entry = await this.prisma.queueEntry.findFirst({ where: { id, userId } });
    if (!entry) throw new NotFoundException('Queue entry not found.');
    if (!entry.boardedAt) {
      await this.prisma.$transaction([
        this.prisma.queueEntry.update({ where: { id }, data: { boardedAt: new Date() } }),
        this.prisma.ticket.update({ where: { id: entry.ticketId }, data: { status: 'BOARDED' } }),
      ]);
    }
    return this.view(userId, id);
  }

  async view(userId: string, id: string) {
    const entry = await this.prisma.queueEntry.findFirst({ where: { id, userId } });
    if (!entry) throw new NotFoundException('Queue entry not found.');
    const ticket = this.tickets.view(await this.tickets.find(userId, entry.ticketId));
    const route = await this.transit.loadRoute(entry.routeId);

    const position = await this.prisma.queueEntry.count({
      where: {
        routeId: entry.routeId,
        stopId: entry.stopId,
        departureAt: entry.departureAt,
        createdAt: { lte: entry.createdAt },
      },
    });

    const now = new Date();
    const minutesToDeparture = Math.round(minutesBetween(now, entry.departureAt));
    const arrived = now > ticket.arrivalAt;
    const status = entry.boardedAt
      ? arrived
        ? 'COMPLETED'
        : 'ON_BUS'
      : minutesToDeparture <= BOARDING_WINDOW_MIN
        ? 'BOARDING'
        : 'WAITING';

    const fromIdx = this.transit.stopIndex(route, ticket.from.id);
    const toIdx = this.transit.stopIndex(route, ticket.to.id);
    const journey = route.stops.slice(fromIdx, toIdx + 1).map((s) => {
      const time = addMinutes(ticket.tripStartAt, s.minutesFromStart);
      return { id: s.stop.id, name: s.stop.name, time, passed: time <= now };
    });
    const nextStop = journey.find((s) => !s.passed) ?? null;

    return {
      id: entry.id,
      status,
      position,
      peopleAhead: position - 1,
      minutesToDeparture,
      departureAt: entry.departureAt,
      departureLabel: entry.departureAt.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Kigali',
      }),
      boardedAt: entry.boardedAt,
      route: ticket.route,
      from: ticket.from,
      to: ticket.to,
      bus: ticket.bus,
      ticket: { id: ticket.id, code: ticket.code },
      journey,
      nextStop,
      remainingMin: Math.max(0, Math.round(minutesBetween(now, ticket.arrivalAt))),
      estimated: true,
    };
  }
}

@Controller('queues')
@UseGuards(AuthGuard)
export class QueuesController {
  constructor(private readonly queues: QueuesService) {}

  @Post()
  join(@UserId() userId: string, @Body({ schema: z.object({ ticketId: z.uuid() }) }) body: { ticketId: string }) {
    return this.queues.join(userId, body.ticketId);
  }

  /** The user's current queue entry or trip, or null. */
  @Get('active')
  async active(@UserId() userId: string) {
    return { entry: await this.queues.active(userId) };
  }

  @Get(':id')
  get(@UserId() userId: string, @Param('id', { schema: z.uuid() }) id: string) {
    return this.queues.view(userId, id);
  }

  /** Confirms the passenger is on the bus (stands in for the conductor's QR scan). */
  @Post(':id/board')
  @HttpCode(200)
  board(@UserId() userId: string, @Param('id', { schema: z.uuid() }) id: string) {
    return this.queues.board(userId, id);
  }
}

@Module({ controllers: [QueuesController], providers: [QueuesService] })
export class QueuesModule {}
