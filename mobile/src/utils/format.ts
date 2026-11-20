/**
 * Language-neutral display helpers. Anything with words (days, "min",
 * greetings, line types) lives in `useFormat()` in src/i18n.
 */
export { formatTime } from '@/i18n';

export function formatRwf(amount: number): string {
  return `RWF ${amount.toLocaleString('en-US')}`;
}

/** "+250788123456" → "+250 788 123 456" */
export function formatPhone(phone: string): string {
  const m = phone.match(/^\+250(\d{3})(\d{3})(\d{3})$/);
  return m ? `+250 ${m[1]} ${m[2]} ${m[3]}` : phone;
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

/** Payment brands accepted on a route (brand names are not translated). */
export function payLabel(route: { acceptsTapGo: boolean; acceptsMomo: boolean }): string {
  return [route.acceptsTapGo && 'Tap&Go', route.acceptsMomo && 'MoMo'].filter(Boolean).join(' / ');
}
