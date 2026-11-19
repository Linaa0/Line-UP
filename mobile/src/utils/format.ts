/** Display helpers. All times are shown in Kigali time (CAT, UTC+2). */

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Kigali',
});

const dayFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'Africa/Kigali',
});

export function formatTime(iso: string | Date): string {
  return timeFormatter.format(new Date(iso));
}

export function formatDay(iso: string | Date): string {
  const date = new Date(iso);
  const key = (d: Date) => dayFormatter.format(d);
  if (key(date) === key(new Date())) return 'Today';
  if (key(date) === key(new Date(Date.now() + 86_400_000))) return 'Tomorrow';
  return key(date);
}

export function formatRwf(amount: number): string {
  return `RWF ${amount.toLocaleString('en-US')}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return 'Now';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** "+250788123456" → "+250 788 123 456" */
export function formatPhone(phone: string): string {
  const m = phone.match(/^\+250(\d{3})(\d{3})(\d{3})$/);
  return m ? `+250 ${m[1]} ${m[2]} ${m[3]}` : phone;
}

export function relativeTime(iso: string): string {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMin < 1) return 'Now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const sameDay = formatDay(iso) === 'Today';
  return sameDay ? formatTime(iso) : `${formatDay(iso)}, ${formatTime(iso)}`;
}

export function greeting(date = new Date()): string {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Africa/Kigali' }).format(date));
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function initials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export const KIND_LABEL = { EXPRESS: 'Express line', REGULAR: 'Regular line', DIRECT: 'Direct metro' } as const;

export function payLabel(route: { acceptsTapGo: boolean; acceptsMomo: boolean }): string {
  return [route.acceptsTapGo && 'Tap&Go', route.acceptsMomo && 'MoMo'].filter(Boolean).join(' / ');
}
