# Line-Up — Backend

NestJS 12 (ESM) REST API with Prisma 7 and PostgreSQL. See the root
[README](../README.md), [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) and
[docs/DATABASE.md](../docs/DATABASE.md).

```bash
npm install                # also runs `prisma generate`
cp .env.example .env       # set DATABASE_URL
npm run start:dev          # http://localhost:4000/api/v1/health
```

| Script                    | Purpose                              |
| ------------------------- | ------------------------------------ |
| `npm run start:dev`       | Dev server (watch mode)              |
| `npm run build`           | Compile to `dist/`                   |
| `npm run start:prod`      | Run the compiled build               |
| `npm run lint`            | oxlint                               |
| `npm run typecheck`       | TypeScript check                     |
| `npm test`                | Unit tests (Vitest)                  |
| `npm run test:e2e`        | End-to-end tests                     |
| `npm run prisma:generate` | Generate Prisma Client               |
| `npm run prisma:migrate`  | Create/apply a dev migration         |
| `npm run prisma:studio`   | Prisma Studio                        |
| `npm run prisma:seed`     | Run `prisma/seed.ts`                 |

The app refuses to start if environment variables are missing or invalid —
see `src/config/env.validation.ts`.
