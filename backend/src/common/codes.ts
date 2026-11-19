import { createHash, randomInt } from 'node:crypto';

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Ticket code shown on the digital ticket and encoded in its QR, e.g. LNU-9842-BB0Q. */
export function ticketCode(): string {
  const digits = String(randomInt(0, 10_000)).padStart(4, '0');
  const suffix = Array.from({ length: 4 }, () => LETTERS[randomInt(0, LETTERS.length)]).join('');
  return `LNU-${digits}-${suffix}`;
}

/** Reference for a payment record, e.g. PAY-7XK2M9QD. */
export function paymentReference(): string {
  return `PAY-${Array.from({ length: 8 }, () => LETTERS[randomInt(0, LETTERS.length)]).join('')}`;
}

export function otpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

/** One-way hash for storing OTP codes; the pepper is the server secret. */
export function hashOtp(code: string, pepper: string): string {
  return createHash('sha256').update(`${pepper}:${code}`).digest('hex');
}
