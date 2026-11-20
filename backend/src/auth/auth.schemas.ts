import { z } from 'zod';

import { LANGUAGES } from '../common/i18n.js';
import { rwandaPhone } from '../common/phone.js';

const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Use at most 72 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number');

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(80),
  phone: rwandaPhone,
  password,
  /** The language chosen in the app before signing up. */
  language: z.enum(LANGUAGES).optional(),
});

export const phoneSchema = z.object({ phone: rwandaPhone });

export const verifySchema = z.object({
  phone: rwandaPhone,
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export const loginSchema = z.object({
  phone: rwandaPhone,
  password: z.string().min(1, 'Enter your password'),
});

export const resetPasswordSchema = z.object({
  phone: rwandaPhone,
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  password,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
