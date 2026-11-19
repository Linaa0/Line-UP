import { type INestApplication, StandardSchemaValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './config/env.validation.js';

/** Local and home-network addresses used by Expo during development (web on :8081, :3003, …). */
const LOCAL_DEV_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/;

/** True if a browser at `origin` may call the API. Native apps send no Origin and are always allowed. */
export function isAllowedOrigin(origin: string | undefined, allowed: string[], production: boolean): boolean {
  if (!origin) return true;
  if (allowed.includes(origin)) return true;
  return !production && LOCAL_DEV_ORIGIN.test(origin);
}

/**
 * Global HTTP setup shared by main.ts and the e2e tests,
 * so tests exercise the same routes (/api/v1/...) as production.
 */
export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService<Env, true>);
  const allowed = config.get('CORS_ORIGIN', { infer: true });
  const production = config.get('NODE_ENV', { infer: true }) === 'production';

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  // Production: only CORS_ORIGIN. Development: also any localhost / LAN address,
  // so the Expo web preview works on whatever port Expo picks.
  app.enableCors({
    origin: (origin: string | undefined, done: (err: Error | null, allow?: boolean) => void) =>
      done(null, isAllowedOrigin(origin, allowed, production)),
  });
  // Validates @Body/@Query/@Param values against their zod schemas.
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableShutdownHooks();
}
