import { Body, Controller, Delete, Get, HttpCode, Module, Patch, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { AuthGuard, UserId } from '../auth/auth.guard.js';
import { addMinutes } from '../common/kigali-time.js';
import { PrismaService } from '../database/prisma.service.js';
import { TransitService } from '../routes/transit.service.js';
import { toUserView } from './user.view.js';

const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(80).optional(),
  email: z.union([z.email('Enter a valid email address'), z.literal('').transform(() => null), z.null()]).optional(),
  homeStopId: z.uuid().nullable().optional(),
});

const preferencesSchema = z.object({
  language: z.enum(['rw', 'en', 'fr']).optional(),
  notifyArrivals: z.boolean().optional(),
  notifyQueue: z.boolean().optional(),
  notifyReceipts: z.boolean().optional(),
  notifyOffers: z.boolean().optional(),
});

@Controller('users/me')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transit: TransitService,
  ) {}

  @Patch()
  async update(@UserId() userId: string, @Body({ schema: profileSchema }) body: z.infer<typeof profileSchema>) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: body, include: { homeStop: true } });
    return toUserView(user);
  }

  @Patch('preferences')
  async preferences(@UserId() userId: string, @Body({ schema: preferencesSchema }) body: z.infer<typeof preferencesSchema>) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: body, include: { homeStop: true } });
    return toUserView(user);
  }

  @Get('summary')
  async summary(@UserId() userId: string) {
    const recent = addMinutes(new Date(), -30);
    const [tripsTaken, activeTickets, savedRoutes] = await Promise.all([
      this.prisma.ticket.count({ where: { userId, status: 'BOARDED' } }),
      this.prisma.ticket.count({ where: { userId, status: { in: ['PAID', 'BOARDED'] }, arrivalAt: { gt: recent } } }),
      this.prisma.savedRoute.count({ where: { userId } }),
    ]);
    return { tripsTaken, activeTickets, savedRoutes };
  }

  @Get('saved-routes')
  async saved(@UserId() userId: string) {
    const rows = await this.prisma.savedRoute.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return Promise.all(rows.map(async (r) => this.transit.summary(await this.transit.loadRoute(r.routeId))));
  }

  /** Permanently deletes the account and its tickets, payments and history. */
  @Delete()
  @HttpCode(200)
  async remove(@UserId() userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { deleted: true };
  }
}

@Module({ controllers: [UsersController] })
export class UsersModule {}
