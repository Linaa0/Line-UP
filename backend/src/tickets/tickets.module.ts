import { Body, Controller, Get, Global, Module, Param, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { AuthGuard, UserId } from '../auth/auth.guard.js';
import { TicketsService } from './tickets.service.js';

const createTicketSchema = z.object({
  routeId: z.uuid(),
  fromStopId: z.uuid(),
  toStopId: z.uuid(),
  /** A specific departure (from the route details "next departures"); defaults to the next bus. */
  tripStartAt: z.coerce.date().optional(),
});

@Controller('tickets')
@UseGuards(AuthGuard)
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  /** Reserves a ticket in PENDING_PAYMENT state; pay it with POST /payments. */
  @Post()
  create(@UserId() userId: string, @Body({ schema: createTicketSchema }) body: z.infer<typeof createTicketSchema>) {
    return this.tickets.create(userId, body);
  }

  @Get()
  list(@UserId() userId: string) {
    return this.tickets.list(userId);
  }

  @Get(':id')
  get(@UserId() userId: string, @Param('id', { schema: z.uuid() }) id: string) {
    return this.tickets.get(userId, id);
  }
}

@Global()
@Module({
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
