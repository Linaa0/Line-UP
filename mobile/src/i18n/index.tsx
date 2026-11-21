import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { setApiLanguage } from '@/lib/api';
import { storage } from '@/lib/storage';

import { en } from './en';
import { fr } from './fr';
import { rw } from './rw';
import { sw } from './sw';

export type Lang = 'en' | 'rw' | 'fr' | 'sw';

/** Every language the app speaks, in the order shown in pickers. */
export const LANGUAGES: { code: Lang; name: string; english: string }[] = [
  { code: 'en', name: 'English', english: 'English' },
  { code: 'rw', name: 'Ikinyarwanda', english: 'Kinyarwanda' },
  { code: 'fr', name: 'Français', english: 'French' },
  { code: 'sw', name: 'Kiswahili', english: 'Swahili' },
];

const DICTIONARIES = { en, rw, fr, sw } as const;
const STORAGE_KEY = 'lineup.language';

/** A message with singular and plural forms, chosen by `count`. */
type Plural = { one: string; other: string };

/** Dot paths to every message, e.g. "home.nearby". */
type Paths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string | Plural ? `${P}${K}` : Paths<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MessageKey = Paths<typeof en>;
export type Params = Record<string, string | number>;

function lookup(lang: Lang, key: string): unknown {
  const walk = (dict: unknown) =>
    key.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), dict);
  return walk(DICTIONARIES[lang]) ?? walk(en);
}

function fill(text: string, params?: Params) {
  return params ? text.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`)) : text;
}

export function translate(lang: Lang, key: MessageKey, params?: Params): string {
  const value = lookup(lang, key);
  if (typeof value === 'string') return fill(value, params);
  if (value && typeof value === 'object' && 'other' in value) {
    const plural = value as Plural;
    return fill(Number(params?.count) === 1 ? plural.one : plural.other, params);
  }
  return key;
}

/** The phone's language if we support it, otherwise English. */
function deviceLanguage(): Lang {
  try {
    const code = Intl.DateTimeFormat().resolvedOptions().locale.slice(0, 2).toLowerCase();
    return (['en', 'rw', 'fr', 'sw'] as const).find((l) => l === code) ?? 'en';
  } catch {
    return 'en';
  }
}

/** Tells the API client which language to request and how to word network errors. */
function syncApi(lang: Lang) {
  setApiLanguage(lang, {
    cantReach: translate(lang, 'common.cantReach'),
    serverError: translate(lang, 'common.serverError'),
    requestFailed: translate(lang, 'common.requestFailed'),
  });
}

type I18nState = {
  lang: Lang;
  /** Changes the app language and remembers it on this device. */
  setLang: (lang: Lang) => void;
  /** True once someone picked a language on this device (now or on an earlier visit). */
  chosen: boolean;
  t: (key: MessageKey, params?: Params) => string;
};

const I18nContext = createContext<I18nState | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(deviceLanguage);
  const [chosen, setChosen] = useState(false);

  useEffect(() => {
    void storage.get(STORAGE_KEY).then((saved) => {
      if (saved && saved in DICTIONARIES) {
        setLangState(saved as Lang);
        setChosen(true);
      }
    });
  }, []);

  useEffect(() => {
    syncApi(lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    syncApi(next);
    setLangState(next);
    setChosen(true);
    void storage.set(STORAGE_KEY, next);
  }, []);

  const value = useMemo<I18nState>(
    () => ({ lang, setLang, chosen, t: (key, params) => translate(lang, key, params) }),
    [lang, setLang, chosen],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

/** Shorthand for screens that only need `t`. */
export function useT() {
  return useI18n().t;
}

// ---------- Dates, times and durations ----------

const KIGALI_OFFSET_MS = 2 * 60 * 60 * 1000;

const CALENDAR: Record<Lang, { days: string[]; months: string[]; pattern: (d: string, n: number, m: string) => string }> = {
  en: {
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    pattern: (d, n, m) => `${d} ${n} ${m}`,
  },
  fr: {
    days: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    months: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    pattern: (d, n, m) => `${d} ${n} ${m}`,
  },
  rw: {
    days: ['Ku cyumweru', 'Ku wa mbere', 'Ku wa kabiri', 'Ku wa gatatu', 'Ku wa kane', 'Ku wa gatanu', 'Ku wa gatandatu'],
    months: ['Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicurasi', 'Kamena', 'Nyakanga', 'Kanama', 'Nzeri', 'Ukwakira', 'Ugushyingo', 'Ukuboza'],
    pattern: (d, n, m) => `${d}, ${n} ${m}`,
  },
  sw: {
    days: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
    months: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
    pattern: (d, n, m) => `${d} ${n} ${m}`,
  },
};

function kigaliParts(date: Date) {
  const local = new Date(date.getTime() + KIGALI_OFFSET_MS);
  return { day: local.getUTCDay(), date: local.getUTCDate(), month: local.getUTCMonth(), year: local.getUTCFullYear(), hour: local.getUTCHours() };
}

/** Language-aware formatters (times are always shown in Kigali time). */
export function useFormat() {
  const { lang, t } = useI18n();
  return useMemo(() => {
    const sameDay = (a: Date, b: Date) => {
      const x = kigaliParts(a);
      const y = kigaliParts(b);
      return x.date === y.date && x.month === y.month && x.year === y.year;
    };
    const formatDay = (iso: string | Date) => {
      const d = new Date(iso);
      const now = new Date();
      if (sameDay(d, now)) return t('time.today');
      if (sameDay(d, new Date(now.getTime() + 86_400_000))) return t('time.tomorrow');
      const p = kigaliParts(d);
      const cal = CALENDAR[lang];
      return cal.pattern(cal.days[p.day], p.date, cal.months[p.month]);
    };
    const formatMinutes = (minutes: number) => {
      if (minutes <= 0) return t('time.now');
      if (minutes < 60) return t('time.minutes', { count: minutes });
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m ? t('time.hoursMinutes', { h, m }) : t('time.hours', { h });
    };
    const relativeTime = (iso: string) => {
      const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
      if (diff < 1) return t('time.now');
      if (diff < 60) return t('time.minutesAgo', { count: diff });
      return sameDay(new Date(iso), new Date()) ? formatTime(iso) : `${formatDay(iso)}, ${formatTime(iso)}`;
    };
    const greeting = () => {
      const hour = kigaliParts(new Date()).hour;
      return hour < 12 ? t('time.goodMorning') : hour < 17 ? t('time.goodAfternoon') : t('time.goodEvening');
    };
    /** "Bay 3" (as stored by the API) in the current language. */
    const bay = (value: string | null | undefined) => {
      if (!value) return null;
      const n = value.match(/^Bay (\d+)$/)?.[1];
      return n ? t('transit.bay', { n }) : value;
    };
    const kind = (k: 'EXPRESS' | 'REGULAR' | 'DIRECT') =>
      t(k === 'EXPRESS' ? 'transit.express' : k === 'DIRECT' ? 'transit.direct' : 'transit.regular');
    return { formatDay, formatMinutes, relativeTime, greeting, bay, kind };
  }, [lang, t]);
}

/** "10:06" in Kigali time (the same in every language). */
export function formatTime(iso: string | Date): string {
  const d = new Date(new Date(iso).getTime() + KIGALI_OFFSET_MS);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}
