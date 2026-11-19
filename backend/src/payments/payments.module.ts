import { BadRequestException, Body, Controller, Injectable, Module, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { AuthGuard, UserId } from '../auth/auth.guard.js';
import { paymentReference } from '../common/codes.js';
import { rwandaPhone } from '../common/phone.js';
import { PrismaService } from '../database/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { TicketsService } from '../tickets/tickets.service.js';

const paySchema = z.object({
  ticketId: z.uuid(),
  method: z.enum(['MTN_MOMO', 'AIRTEL_MONEY']),
  phone: rwandaPhone,
});

const METHOD_NAMES = { MTN_MOMO: 'MTN Mobile Money', AIRTEL_MONEY: 'Airtel Money' } as const;

/**
 * DEMO PAYMENTS. No payment provider is integrated yet, so no money moves:
 * the payment is recorded with provider "DEMO" and marked successful, and
 * every response says `demo: true` so the app can label it. Replace
 * `charge()` with MTN MoMo Collections / Airtel Money APIs before launch.
 */
@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tickets: TicketsService,
    private readonly notifications: NotificationsService,
  ) {}

  async pay(userId: string, input: z.infer<typeof paySchema>) {
    const ticket = await this.tickets.find(userId, input.ticketId);
    if (ticket.status !== 'PENDING_PAYMENT') throw new BadRequestException('This ticket is already paid.');
    if (ticket.departureAt < new Date()) {
      throw new BadRequestException('This bus has already left. Choose a later departure.');
    }

    await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          ticketId: ticket.id,
          userId,
          amount: ticket.fare,
          method: input.method,
          phone: input.phone,
          provider: 'DEMO',
          reference: paymentReference(),
          status: 'SUCCEEDED',
        },
      }),
      this.prisma.ticket.update({ where: { id: ticket.id }, data: { status: 'PAID' } }),
    ]);

    await this.notifications.create(userId, {
      type: 'PAYMENT',
      title: 'Payment successful',
      body: `RWF ${ticket.fare} paid with ${METHOD_NAMES[input.method]} (demo) for ticket #${ticket.code}.`,
    });

    return { demo: true, ticket: await this.tickets.get(userId, ticket.id) };
  }
}

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post()
  pay(@UserId() userId: string, @Body({ schema: paySchema }) body: z.infer<typeof paySchema>) {
    return this.payments.pay(userId, body);
  }
}

@Module({ controllers: [PaymentsController], providers: [PaymentsService] })
export class PaymentsModule {}
