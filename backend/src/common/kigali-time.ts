/** Kigali uses Central Africa Time: UTC+2 all year (no daylight saving). */
export const KIGALI_OFFSET_MIN = 120;
const MINUTE = 60_000;

/** Minutes after midnight in Kigali for the given instant (fractional). */
export function kigaliMinuteOfDay(date: Date): number {
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  return (utcMinutes + KIGALI_OFFSET_MIN) % 1440;
}

/** The UTC instant of midnight (00:00 Kigali) of the Kigali day containing `date`. */
export function kigaliDayStart(date: Date): Date {
  const local = new Date(date.getTime() + KIGALI_OFFSET_MIN * MINUTE);
  const midnightLocalAsUtc = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  return new Date(midnightLocalAsUtc - KIGALI_OFFSET_MIN * MINUTE);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MINUTE);
}

export function minutesBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / MINUTE;
}
