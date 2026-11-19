import { Controller, Delete, Get, Global, HttpCode, Module, Param, Put, Query, UseGuards, Headers } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { z } from 'zod';

import { AuthGuard, UserId } from '../auth/auth.guard.js';
import { PrismaService } from '../database/prisma.service.js';
import { TransitService } from './transit.service.js';

const id = z.uuid();

@Controller()
export class RoutesController {
  constructor(
    private readonly transit: TransitService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  @Get('stops')
  stops(@Query('q', { schema: z.string().trim().max(60).optional() }) q?: string) {
    return this.transit.searchStops(q || undefined);
  }

  @Get('stops/:id/departures')
  departures(
    @Param('id', { schema: id }) stopId: string,
    @Query('limit', { schema: z.coerce.number().int().min(1).max(20).default(5) }) limit: number,
  ) {
    return this.transit.departures(stopId, limit);
  }

  @Get('routes/search')
  search(
    @Query('from', { schema: id }) from: string,
    @Query('to', { schema: id }) to: string,
    @Query('at', { schema: z.coerce.date().optional() }) at?: Date,
  ) {
    return this.transit.search(from, to, at ?? new Date());
  }

  @Get('live/buses')
  live(@Query('routeId', { schema: id.optional() }) routeId?: string) {
    return this.transit.liveBuses(routeId);
  }

  /** Public, but tells a logged-in user whether the route is saved. */
  @Get('routes/:id')
  async details(
    @Param('id', { schema: id }) routeId: string,
    @Query('from', { schema: id.optional() }) from: string | undefined,
    @Query('to', { schema: id.optional() }) to: string | undefined,
    @Headers('authorization') authorization?: string,
  ) {
    let userId: string | null = null;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (token) {
      userId = await this.jwt.verifyAsync<{ sub: string }>(token).then((p) => p.sub).catch(() => null);
    }
    return this.transit.routeDetails(routeId, from, to, userId);
  }

  @Put('routes/:id/save')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async save(@UserId() userId: string, @Param('id', { schema: id }) routeId: string) {
    await this.transit.loadRoute(routeId);
    await this.prisma.savedRoute.upsert({
      where: { userId_routeId: { userId, routeId } },
      update: {},
      create: { userId, routeId },
    });
    return { saved: true };
  }

  @Delete('routes/:id/save')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async unsave(@UserId() userId: string, @Param('id', { schema: id }) routeId: string) {
    await this.prisma.savedRoute.deleteMany({ where: { userId, routeId } });
    return { saved: false };
  }
}

@Global()
@Module({
  controllers: [RoutesController],
  providers: [TransitService],
  exports: [TransitService],
})
export class RoutesModule {}
