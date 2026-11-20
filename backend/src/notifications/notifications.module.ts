import { Controller, Get, Global, HttpCode, Module, Param, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { AuthGuard, UserId } from '../auth/auth.guard.js';
import type { Lang } from '../common/i18n.js';
import { ReqLang } from '../common/lang.decorator.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@UserId() userId: string, @ReqLang() lang: Lang) {
    return this.notifications.list(userId, lang);
  }

  @Post('read-all')
  @HttpCode(200)
  readAll(@UserId() userId: string) {
    return this.notifications.markAllRead(userId);
  }

  @Post(':id/read')
  @HttpCode(200)
  read(@UserId() userId: string, @Param('id', { schema: z.uuid() }) id: string) {
    return this.notifications.markRead(userId, id);
  }
}

/** Global so ticketing, payments and queues can create notifications. */
@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
