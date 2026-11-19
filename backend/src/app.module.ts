import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module.js';
import { validateEnv } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { QueuesModule } from './queues/queues.module.js';
import { RoutesModule } from './routes/routes.module.js';
import { SupportModule } from './support/support.module.js';
import { TicketsModule } from './tickets/tickets.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    NotificationsModule,
    RoutesModule,
    TicketsModule,
    PaymentsModule,
    QueuesModule,
    UsersModule,
    SupportModule,
  ],
})
export class AppModule {}
