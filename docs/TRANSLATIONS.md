# Translations

LINE-UP speaks four languages: **English (en)**, **Ikinyarwanda (rw)**,
**Français (fr)** and **Kiswahili (sw)**.

## How people choose a language

- **First launch:** the phone's language is used if it is one of the four,
  otherwise English. The globe button (top right of the welcome and account
  screens) opens the language list.
- **Any time later:** Profile → Language, or Settings → Language.
- The choice is remembered on the device and, once logged in, saved on the
  account (`preferences.language`). Logging in on a new phone uses the
  account's language.

## Where the words live

| What | File |
| ---- | ---- |
| App screens (source) | `mobile/src/i18n/en.ts` |
| App screens (translations) | `mobile/src/i18n/rw.ts`, `fr.ts`, `sw.ts` |
| Server error messages and notifications | `backend/src/common/i18n.ts` |

The app sends `Accept-Language: <code>` with every request, so the API's
error messages ("That code is not correct…") and notifications come back in
the same language. Notifications are stored as a template plus values and are
rendered when listed, so switching language also translates old ones.

## Changing or adding text

1. Add the English text to `mobile/src/i18n/en.ts` under the right screen.
2. Add the same key to `rw.ts`, `fr.ts` and `sw.ts`. The app **will not
   compile** until all four have it, so nothing ships half-translated.
3. In the screen, use `const t = useT();` and `t('section.key')`.
   Values go in braces: `t('home.arrivingIn', { count: 3 })` with
   `'Arriving in {count} min'` in the file.
4. Singular/plural: use `{ one: '…', other: '…' }` and pass `count`.
5. Dates, durations and greetings: use `useFormat()` (`formatDay`,
   `formatMinutes`, `relativeTime`, `greeting`, `kind`, `bay`).

Never put user-facing text directly in a screen.

Names stay as they are in every language: stop and area names, route codes,
LINE-UP, MTN Mobile Money, Airtel Money, MoMo, Tap&Go.

## Review before launch

The French and Kiswahili texts follow standard usage. The **Kinyarwanda**
texts were written carefully using common Kigali transport terms (icyapa =
bus stop, itike = ticket, ingengabihe = timetable, umurongo = queue), but they
should be **read by a native speaker** before a public launch, as should any
wording your team wants to adjust. Edit the files above; no code changes are
needed.
