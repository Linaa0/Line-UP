# Development Guide

## Prerequisites

| Tool       | Version            |
| ---------- | ------------------ |
| Node.js    | 22.22+ or 24 LTS   |
| npm        | 10+                |
| PostgreSQL | 16+ (local or Docker) |
| Git        | any recent         |
| Expo Go    | latest, on your Android/iOS phone (or an emulator) |

## First-time setup

```bash
git clone <repository-url> line-up
cd line-up

# Mobile
cd mobile
npm install
cp .env.example .env.local   # set EXPO_PUBLIC_API_URL

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

**Mobile**:

```bash
cd mobile
npm start
```

- **Phone:** install Expo Go, connect to the same Wi-Fi as your computer and
  scan the QR code. Set `EXPO_PUBLIC_API_URL` to your computer’s LAN IP
  (`ipconfig` → IPv4 address), e.g. `http://192.168.1.20:4000/api/v1` —
  `localhost` on a phone means the phone itself.
- **Android emulator:** press `a`; use `http://10.0.2.2:4000/api/v1`.
- **Browser preview:** `npm run web` → http://localhost:3003.

## Scripts

### Mobile (`mobile/`)

| Script              | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `npm start`         | Metro dev server (Expo Go / dev build)    |
| `npm run android`   | Open on Android emulator / device         |
| `npm run ios`       | Open on iOS simulator (macOS only)        |
| `npm run web`       | Browser preview on port 3003              |
| `npm run lint`      | ESLint (Expo config)                      |
| `npm run typecheck` | TypeScript check, no emit                 |

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
| mobile   | `mobile/.env.local`   | `mobile/.env.example`    |
| backend  | `backend/.env`        | `backend/.env.example`   |

Only `*.example` files are committed. The backend refuses to start if a
variable is missing or invalid (see `backend/src/config/env.validation.ts`).
Mobile variables must start with `EXPO_PUBLIC_` and are bundled into the
app — never put secrets in them.

## Adding things

- **Mobile package:** `cd mobile && npx expo install <package>` (picks the
  version that matches the Expo SDK).
- **Backend module:** `cd backend && npx nest g resource tickets --no-spec`
  then register it in `app.module.ts` if the CLI did not.
- **Mobile screen:** build it in `src/features/<feature>/screens/`; the route
  file in `src/app/(group)/<route>.tsx` just renders it.
- **Design assets:** follow `design/README.md`; copy production files into
  `mobile/assets/images/...` only when implementing the screen.

## Git workflow

- `main` is always runnable.
- Branch per piece of work: `feature/<name>`, `fix/<name>`, `chore/<name>`.
- Small commits with imperative messages (`Add ticket list screen`).
- Open a pull request into `main`; run `lint`, `typecheck`/`build` first.

## Code style

- TypeScript everywhere, `strict` mode.
- 2-space indentation, LF line endings (`.editorconfig`).
- Backend: Prettier formats, oxlint lints. Mobile: ESLint (Expo config).
- File names: `kebab-case.tsx` for components and modules; React components
  exported in `PascalCase`.
