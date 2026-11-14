# Database

- **Engine:** PostgreSQL (16+ recommended)
- **ORM:** Prisma — schema in `backend/prisma/schema.prisma`
- **Connection:** `DATABASE_URL` in `backend/.env`

## Current state

The schema contains only the `datasource` and `generator` blocks. No models
are defined yet — they will be designed feature by feature, starting from the
Figma screens and the roadmap.

## Expected domain entities (to be designed)

Listed for orientation only; fields and relations are not decided yet.

User · Route · Stop · Bus · Trip · Fare · Ticket · Payment · Queue ·
Notification

## Local setup

1. Install PostgreSQL locally (or run it in Docker:
   `docker run --name lineup-db -e POSTGRES_PASSWORD=<choose-one> -p 5432:5432 -d postgres:16`).
2. Create a database, e.g. `lineup`.
3. Set `DATABASE_URL` in `backend/.env`:
   `postgresql://<user>:<password>@localhost:5432/lineup?schema=public`

## Common commands (run in `backend/`)

| Command                                  | Purpose                                         |
| ---------------------------------------- | ----------------------------------------------- |
| `npm run prisma:generate`                | Regenerate the Prisma Client after schema edits |
| `npm run prisma:migrate -- --name <name>`| Create + apply a migration (development)        |
| `npm run prisma:studio`                  | Browse data in Prisma Studio                    |
| `npm run prisma:seed`                    | Run `prisma/seed.ts`                            |
| `npx prisma migrate deploy`              | Apply migrations (staging / production)         |

## Conventions

- Model names: `PascalCase` singular (`Ticket`); table names mapped to
  `snake_case` plural with `@@map("tickets")`.
- Field names: `camelCase` in Prisma, mapped to `snake_case` columns with
  `@map` where helpful.
- Primary keys: `String @id @default(uuid())` unless there is a reason not to.
- Every model has `createdAt` and `updatedAt`.
- Money is stored as integers in RWF (no floats).
- Never edit an applied migration; create a new one.
