import { Body, Controller, Get, Module, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { AuthGuard, UserId } from '../auth/auth.guard.js';
import { PrismaService } from '../database/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

const reportSchema = z.object({
  category: z.enum(['PAYMENT', 'TICKET', 'DELAY', 'CONDUCT', 'LOST_ITEM', 'OTHER']),
  description: z.string().trim().min(10, 'Describe the issue in at least 10 characters').max(500),
  ticketId: z.uuid().optional(),
});

@Controller('support')
@UseGuards(AuthGuard)
export class SupportController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @Post('reports')
  async report(@UserId() userId: string, @Body({ schema: reportSchema }) body: z.infer<typeof reportSchema>) {
    if (body.ticketId) {
      const owns = await this.prisma.ticket.count({ where: { id: body.ticketId, userId } });
      if (!owns) throw new NotFoundException('Ticket not found.');
    }
    const report = await this.prisma.supportReport.create({ data: { userId, ...body } });
    await this.notifications.create(userId, 'ALERT', 'report', { ref: report.id.slice(0, 8).toUpperCase() });
    return report;
  }

  @Get('reports')
  reports(@UserId() userId: string) {
    return this.prisma.supportReport.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
}

@Module({ controllers: [SupportController] })
export class SupportModule {}
