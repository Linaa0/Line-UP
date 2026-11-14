# Line-Up

Public transport platform for passengers in Kigali, Rwanda — find routes and
stops, buy and pay for tickets, join stop queues and follow buses live.

> **Status:** project foundation. No features are implemented yet.

## Tech stack

| Layer     | Technology                                                   |
| --------- | ------------------------------------------------------------ |
| Frontend  | Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend   | NestJS, Node.js, TypeScript, REST                            |
| Database  | PostgreSQL, Prisma ORM                                       |
| Tooling   | Git, GitHub, ESLint (frontend), oxlint + Prettier + Vitest (backend) |

## Repository structure

```
line-up/
├── frontend/   # Next.js passenger web app       → http://localhost:3000
├── backend/    # NestJS REST API + Prisma        → http://localhost:4000/api/v1
├── design/     # Figma exports & design-system notes (reference only)
├── docs/       # Project documentation
├── .editorconfig
├── .env.example
├── .gitignore
├── CLAUDE.md
└── README.md
```

The two applications are fully independent: separate dependencies, configs
and env files. Install and run each one from its own folder.

## Quick start

Requirements: Node.js 20.9+ (22 LTS recommended), npm, PostgreSQL 16+.

```bash
# Backend
cd backend
npm install
cp .env.example .env          # set DATABASE_URL
npm run prisma:generate
npm run start:dev             # http://localhost:4000/api/v1/health
```

```bash
# Frontend (second terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev                   # http://localhost:3000
```

## Documentation

- [Project overview](docs/PROJECT_OVERVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [API](docs/API.md)
- [Development guide](docs/DEVELOPMENT_GUIDE.md)
- [Implementation roadmap](docs/IMPLEMENTATION_ROADMAP.md)
- [Design assets guide](design/README.md)
