# Implementation Roadmap

Each phase is approved before the next begins.

## Phase 0 — Foundation ✅

- [x] Monorepo structure (`mobile/`, `backend/`, `design/`, `docs/`)
- [x] Expo React Native app (SDK 58, Expo Router, TypeScript, `@/*` alias, theme tokens)
- [x] Switched from Next.js web app to a native mobile app
- [x] NestJS app (config + env validation, health check, Prisma module)
- [x] Prisma initialised (datasource + generator only)
- [x] Documentation and environment examples

## Phase 1 — Design system

- [x] Export Figma screens into `design/` and map the flow (`design/SCREEN_FLOW.md`)
- [x] Design missing screens: notifications, profile & settings, support (mockups)
- [x] Colors sampled into `design/design-system/colors.md` and `mobile/src/constants/theme.ts`
- [ ] Export the logo, icons and illustrations into `design/exported-assets/`
- [ ] Resolve the design inconsistencies listed in `design/SCREEN_FLOW.md`
- [ ] Confirm fonts and fill in typography / spacing docs
- [ ] Replace the default app icon and splash with the Line-Up logo
- [ ] Build UI primitives (Button, Input, Card, Pill) and the bottom tab bar

## Phase 2 — Data model

- [ ] Design Prisma models (User, Route, Stop, Bus, Trip, Fare, Ticket, Payment, Queue, Notification)
- [ ] First migration + development seed data

## Phase 3 — Passenger journey (screen by screen, following the design folders)

1. [ ] Onboarding
2. [ ] Authentication (backend `auth`, `users`)
3. [ ] Home
4. [ ] Route discovery (backend `routes`, `stops`)
5. [ ] Route details (backend `fares`, `trips`, `buses`)
6. [ ] Ticket purchase (backend `tickets`)
7. [ ] Payments (backend `payments` — real provider integration)
8. [ ] Tickets
9. [ ] Live transport
10. [ ] Queues (backend `queues`)
11. [ ] Notifications (backend `notifications`)
12. [ ] Profile & settings
13. [ ] Support

## Phase 4 — Hardening & release

- [ ] Automated tests for critical flows
- [ ] CI (lint, type-check, test, build) on GitHub Actions
- [ ] App builds with EAS (Android APK/AAB, iOS) and store submission
- [ ] Deployment (API hosting, managed PostgreSQL)
