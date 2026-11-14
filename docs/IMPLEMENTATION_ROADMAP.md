# Implementation Roadmap

Each phase is approved before the next begins.

## Phase 0 — Foundation ✅ (this stage)

- [x] Monorepo structure (`frontend/`, `backend/`, `design/`, `docs/`)
- [x] Next.js app (TypeScript, App Router, Tailwind, ESLint, `@/*` alias, shadcn/ui config)
- [x] NestJS app (config + env validation, health check, Prisma module)
- [x] Prisma initialised (datasource + generator only)
- [x] Documentation and environment examples

## Phase 1 — Design system

- [ ] Export Figma assets into `design/` (see `design/README.md`)
- [ ] Fill in `design/design-system/*.md` from Figma styles
- [ ] Translate tokens into `frontend/src/app/globals.css`
- [ ] Load brand fonts in `layout.tsx`
- [ ] Add shadcn/ui primitives as needed (`npx shadcn@latest add button …`)
- [ ] Build layout + navigation components (app shell, bottom nav)

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
- [ ] Deployment (frontend hosting, API hosting, managed PostgreSQL)
