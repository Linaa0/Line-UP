import { z } from 'zod';

/**
 * Single source of truth for the backend's environment variables.
 * The app refuses to start if any value is missing or invalid.
 * Add new variables here AND in backend/.env.example.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (value) =>
        value.startsWith('postgresql://') || value.startsWith('postgres://'),
      'DATABASE_URL must be a PostgreSQL connection string',
    ),
  /** "true" or "no-verify" for hosted databases that require SSL (see src/database/pg-ssl.ts). */
  DATABASE_SSL: z.enum(['false', 'true', 'no-verify']).default('false'),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:3003')
    .transform((value) => value.split(',').map((origin) => origin.trim())),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters (use a long random value)'),
  JWT_EXPIRES_IN_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  /**
   * No SMS provider is integrated yet. When true, the API returns the
   * verification code in its response so the app can show it, clearly
   * labelled as a demo code. Must be false once real SMS is connected.
   */
  OTP_DEMO_MODE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}
