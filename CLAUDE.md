# CLAUDE.md

Guidance for AI assistants working in this repository.

## Project

Line-Up — mobile public transport app for passengers in Kigali, Rwanda.
Monorepo with two **independent** apps:

- `mobile/` — React Native + Expo (SDK 58) + Expo Router + TypeScript. See `mobile/AGENTS.md`.
- `backend/` — NestJS + TypeScript REST API, Prisma ORM, PostgreSQL. See `backend/AGENTS.md`.
- `design/` — Figma exports + mockups (reference only, never imported by code).
  `design/SCREEN_FLOW.md` maps every screen and how they connect.
- `docs/` — architecture, API, database, dev guide, roadmap

## Commands

Run from the app folder (`cd mobile` or `cd backend`); there is no root package.json.

| Task       | Mobile                          | Backend                    |
| ---------- | ------------------------------- | -------------------------- |
| Install    | `npm install`                   | `npm install`              |
| Dev        | `npm start` (Expo Go), `npm run web` (:3003) | `npm run start:dev` (:4000) |
| Lint       | `npm run lint`                  | `npm run lint`             |
| Type-check | `npm run typecheck`             | `npm run typecheck`        |
| Test       | —                               | `npm test`, `npm run test:e2e` |
| Add a package | `npx expo install <pkg>`     | `npm install <pkg>`        |
| Prisma     | —                               | `npm run prisma:generate`, `npm run prisma:migrate` |

Health check: `GET http://localhost:4000/api/v1/health`.
Re-render design mockups: `node design/mockups/render.mjs` (needs Edge/Chrome).

## Rules

- **Do not implement features or screens unless the current task asks for it.**
  Work proceeds phase by phase per `docs/IMPLEMENTATION_ROADMAP.md`, with user approval.
- Keep mobile and backend independent — no shared imports, no root workspace.
- TypeScript everywhere, strict mode.
- Mobile:
  - `src/app/` is routes only (Expo Router); route files render screens from `src/features/<feature>/`.
  - Feature-specific code stays in its feature folder; promote to `components/shared`,
    `hooks/`, `lib/` only when a second feature needs it.
  - Style with `StyleSheet` + tokens from `src/constants/theme.ts`; take values from
    `design/design-system/*.md` / Figma — never invent brand colors.
  - Always `npx expo install` packages; never edit generated `ios/` / `android/` folders.
  - Build screens from the primitives in `src/components/ui/` (Button, TextField, Card, Pill,
    Chip, IconTile, ListRow, Toggle, Text) and `Screen` / `ScreenHeader`; icons are Feather via `Icon`.
  - Preview components at `/dev/ui-kit` (dev builds only).
  - Import alias `@/*` → `src/*`.
- Backend:
  - One Nest module per domain folder (controller → service → PrismaService).
  - Validate input with zod schemas (`StandardSchemaValidationPipe`); read config only via `ConfigService`.
  - ESM project (NestJS 12): relative imports end in `.js`; tests are Vitest (`vi.fn()`).
  - Prisma 7: client generated to `src/generated/prisma` (git-ignored); CLI config in `prisma.config.ts`.
  - Add every new env var to `src/config/env.validation.ts` and `backend/.env.example`.
  - Routes are under `/api/v1`.
- Implement screens by comparing against `design/figma-references/individual-screens/`.
  Copy production assets from `design/exported-assets/` into `mobile/assets/images/`.
- No secrets in committed files; only `*.example` env files are tracked.
- No mock integrations that pretend to be real (payments, maps, SMS).
- No unnecessary dependencies or abstractions; don't create empty placeholder files.
- Inspect files before overwriting them.
