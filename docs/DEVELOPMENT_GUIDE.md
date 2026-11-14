# Development Guide

## Prerequisites

| Tool       | Version            |
| ---------- | ------------------ |
| Node.js    | 20.9+ (22 LTS recommended) |
| npm        | 10+                |
| PostgreSQL | 16+ (local or Docker) |
| Git        | any recent         |

## First-time setup

```bash
git clone <repository-url> line-up
cd line-up

# Frontend
cd frontend
npm install
cp .env.example .env.local

# Backend
cd ../backend
npm install
cp .env.example .env        # then set DATABASE_URL
npm run prisma:generate
```

## Running locally

Run each app in its own terminal.

**Backend** (http://localhost:4000/api/v1):

```bash
cd backend
npm run start:dev
```

Check it: `curl http://localhost:4000/api/v1/health`

**Frontend** (http://localhost:3000):

```bash
cd frontend
npm run dev
```

## Scripts

### Frontend (`frontend/`)

| Script            | Purpose                         |
| ----------------- | ------------------------------- |
| `npm run dev`     | Dev server with hot reload      |
| `npm run build`   | Production build                |
| `npm run start`   | Serve the production build      |
| `npm run lint`    | ESLint                          |
| `npm run typecheck` | TypeScript check, no emit     |

### Backend (`backend/`)

| Script                      | Purpose                              |
| --------------------------- | ------------------------------------ |
| `npm run start:dev`         | Dev server with watch mode           |
| `npm run build`             | Compile to `dist/`                   |
| `npm run start:prod`        | Run the compiled build               |
| `npm run lint`              | oxlint                               |
| `npm run typecheck`         | TypeScript check, no emit            |
| `npm run test`              | Unit tests (Vitest, `*.spec.ts`)     |
| `npm run test:e2e`          | End-to-end tests (`test/`)           |
| `npm run prisma:generate`   | Generate Prisma Client               |
| `npm run prisma:migrate`    | Create/apply a dev migration         |
| `npm run prisma:studio`     | Open Prisma Studio                   |
| `npm run prisma:seed`       | Run the seed script                  |

## Environment variables

| App      | File                  | Template                 |
| -------- | --------------------- | ------------------------ |
| frontend | `frontend/.env.local` | `frontend/.env.example`  |
| backend  | `backend/.env`        | `backend/.env.example`   |

Only `*.example` files are committed. The backend refuses to start if a
variable is missing or invalid (see `backend/src/config/env.validation.ts`).
Frontend variables exposed to the browser must start with `NEXT_PUBLIC_` —
never put secrets in them.

## Adding things

- **shadcn/ui component:** `cd frontend && npx shadcn@latest add button`
  (lands in `src/components/ui/`).
- **Backend module:** `cd backend && npx nest g resource tickets --no-spec`
  then register it in `app.module.ts` if the CLI did not.
- **Frontend feature code:** inside `src/features/<feature>/`; the matching
  page in `src/app/(group)/<route>/page.tsx` just renders it.
- **Design assets:** follow `design/README.md`; copy production files into
  `frontend/public/assets/...` only when implementing the screen.

## Git workflow

- `main` is always runnable.
- Branch per piece of work: `feature/<name>`, `fix/<name>`, `chore/<name>`.
- Small commits with imperative messages (`Add ticket list screen`).
- Open a pull request into `main`; run `lint`, `typecheck`/`build` first.

## Code style

- TypeScript everywhere, `strict` mode.
- 2-space indentation, LF line endings (`.editorconfig`).
- Backend: Prettier formats, oxlint lints. Frontend: ESLint (Next config).
- File names: `kebab-case.tsx` for components and modules; React components
  exported in `PascalCase`.
