# Implementation Roadmap

Each phase is approved before the next begins.

## Phase 0 — Foundation ✅

- [x] Monorepo structure (`mobile/`, `backend/`, `design/`, `docs/`)
- [x] Expo React Native app (SDK 58, Expo Router, TypeScript, `@/*` alias, theme tokens)
- [x] Switched from Next.js web app to a native mobile app
- [x] NestJS app (config + env validation, health check, Prisma module)
- [x] Documentation and environment examples

## Phase 1 — Design system ✅

- [x] Export Figma screens into `design/` and map the flow (`design/SCREEN_FLOW.md`)
- [x] Design missing screens: notifications, profile & settings, support (mockups)
- [x] Colors sampled into `design/design-system/colors.md` and `mobile/src/constants/theme.ts`
- [x] Fonts: Plus Jakarta Sans (headings) + Inter (body)
- [x] App icon, splash and bus mark drawn from the splash logo; illustrations cropped from the Figma exports
- [x] Design inconsistencies resolved in code (see `design/SCREEN_FLOW.md`)
- [x] UI primitives and the bottom tab bar; dev-only UI kit at `/dev/ui-kit`
- [ ] Export the original logo and illustrations at full resolution into `design/exported-assets/`

## Phase 2 — Data model ✅

- [x] Prisma models: User, OtpCode, Stop, Route, RouteStop, Bus, Ticket, Payment, QueueEntry, Notification, SavedRoute, SupportReport
- [x] Migrations + Kigali sample seed (18 stops, 8 lines × 2 directions, 32 buses)

## Phase 3 — Passenger journey ✅

All 28 designed screens plus a My Tickets list are built and connected to the
API (see `docs/API.md`):

1. [x] Onboarding (splash, welcome, 3 intro slides)
2. [x] Authentication (sign up, OTP, log in, forgot/reset password)
3. [x] Home (nearby buses, active trip, quick actions)
4. [x] Route discovery (stop search, results, filters, recent and saved routes)
5. [x] Route details (stops, departures, load, save)
6. [x] Ticket purchase (confirm journey)
7. [x] Payments (MTN MoMo / Airtel Money — **demo provider**)
8. [x] Tickets (list + QR digital ticket)
9. [x] Live transport (schematic map, trip in progress — **estimated positions**)
10. [x] Queues (virtual queue, boarding ready)
11. [x] Notifications
12. [x] Profile & settings
13. [x] Support (help center, FAQ, report an issue)

Demo-only parts are labelled in the app: SMS codes, Mobile Money payments and
bus positions.

## Phase 4 — Hardening & release

- [ ] Real integrations: SMS provider, MTN MoMo Collections / Airtel Money, operator GPS feed
- [ ] Kinyarwanda and French translations (the language preference is already saved)
- [ ] More automated tests (mobile component tests, more API e2e flows)
- [ ] CI (lint, type-check, test, build) on GitHub Actions
- [ ] App builds with EAS (Android APK/AAB, iOS) and store submission
- [ ] Deployment (API hosting, managed PostgreSQL)
