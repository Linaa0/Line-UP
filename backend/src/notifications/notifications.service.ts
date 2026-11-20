import { Injectable, NotFoundException } from '@nestjs/common';

import { type Lang, type NotificationTemplate, renderNotification } from '../common/i18n.js';
import { PrismaService } from '../database/prisma.service.js';
import type { NotificationType } from '../generated/prisma/client.js';

type Params = Record<string, string | number>;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Stores a notification as a template so it can be shown in any language later. */
  create(userId: string, type: NotificationType, template: NotificationTemplate, params: Params) {
    const english = renderNotification(template, params, 'en');
    return this.prisma.notification.create({
      data: { userId, type, template, params, title: english.title, body: english.body },
    });
  }

  async list(userId: string, lang: Lang) {
    const [rows, unread] = await Promise.all([
      this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    const items = rows.map(({ template, params, ...n }) => {
      if (!template) return n;
      const text = renderNotification(template as NotificationTemplate, (params ?? {}) as Params, lang);
      return { ...n, ...text };
    });
    return { unread, items };
  }

  async markAllRead(userId: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: count };
  }

  async markRead(userId: string, id: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
    if (!count) throw new NotFoundException('Notification not found.');
    return { updated: count };
  }
}
