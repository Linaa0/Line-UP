import { z } from 'zod';

/**
 * Rwandan mobile numbers: 07X XXX XXXX locally, +250 7X XXX XXXX internationally.
 * Accepts "0788123456", "788123456", "+250 788 123 456" and returns "+250788123456".
 */
export function normalizeRwandaPhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, '');
  let local: string;
  if (digits.startsWith('250') && digits.length === 12) local = digits.slice(3);
  else if (digits.startsWith('0') && digits.length === 10) local = digits.slice(1);
  else if (digits.length === 9) local = digits;
  else return null;
  return /^7[2389]\d{7}$/.test(local) ? `+250${local}` : null;
}

export const rwandaPhone = z.string().transform((value, ctx) => {
  const phone = normalizeRwandaPhone(value);
  if (!phone) {
    ctx.addIssue({ code: 'custom', message: 'Enter a valid Rwandan mobile number, e.g. 0788 123 456' });
    return z.NEVER;
  }
  return phone;
});
