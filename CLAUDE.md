# CLAUDE.md

Guidance for AI assistants working in this repository.

## Project

Line-Up — public transport platform for passengers in Kigali, Rwanda.
Monorepo with two **independent** apps:

- `frontend/` — Next.js (App Router) + React + TypeScript + Tailwind CSS v4 + shadcn/ui
- `backend/` — NestJS + TypeScript REST API, Prisma ORM, PostgreSQL
- `design/` — Figma exports (reference only, never imported by code)
- `docs/` — architecture, API, database, dev guide, roadmap

## Commands

Run from the app folder (`cd frontend` or `cd backend`); there is no root package.json.

| Task       | Frontend           | Backend                    |
| ---------- | ------------------ | -------------------------- |
| Install    | `npm install`      | `npm install`              |
| Dev        | `npm run dev` (:3000) | `npm run start:dev` (:4000) |
| Build      | `npm run build`    | `npm run build`            |
| Lint       | `npm run lint`     | `npm run lint`             |
| Type-check | `npm run typecheck`| `npm run typecheck`        |
| Test       | —                  | `npm test`, `npm run test:e2e` |
| Prisma     | —                  | `npm run prisma:generate`, `npm run prisma:migrate` |

Health check: `GET http://localhost:4000/api/v1/health`.

## Rules

- **Do not implement features or screens unless the current task asks for it.**
  Work proceeds phase by phase per `docs/IMPLEMENTATION_ROADMAP.md`, with user approval.
- Keep frontend and backend independent — no shared imports, no root workspace.
- TypeScript everywhere, strict mode.
- Frontend:
  - `src/app/` is routing only; pages render components from `src/features/<feature>/`.
  - Feature-specific code stays in its feature folder; promote to `components/shared`,
    `hooks/`, `lib/` only when a second feature needs it.
  - shadcn/ui primitives go in `src/components/ui/` (`npx shadcn@latest add <name>`).
  - Design tokens live as CSS variables in `src/app/globals.css`; take values from
    `design/design-system/*.md` / Figma — never invent brand colors.
  - Import alias `@/*` → `src/*`.
- Backend:
  - One Nest module per domain folder (controller → service → PrismaService).
  - Validate input with zod schemas (`StandardSchemaValidationPipe`); read config only via `ConfigService`.
  - ESM project (NestJS 12): relative imports end in `.js`; tests are Vitest (`vi.fn()`). See `backend/AGENTS.md`.
  - Prisma 7: client generated to `src/generated/prisma` (git-ignored); CLI config in `prisma.config.ts`.
  - Add every new env var to `src/config/env.validation.ts` and `backend/.env.example`.
  - Routes are under `/api/v1`.
- Implement screens by comparing against `design/figma-references/individual-screens/`.
  Copy production assets from `design/exported-assets/` into `frontend/public/assets/`.
- No secrets in committed files; only `*.example` env files are tracked.
- No mock integrations that pretend to be real (payments, maps, SMS).
- No unnecessary dependencies or abstractions; don't create empty placeholder files.
- Inspect files before overwriting them.
