# Line-Up

Mobile public transport app for passengers in Kigali, Rwanda — find routes and
stops, buy and pay for tickets, join stop queues and follow buses live.

> **Status:** working app. All screens are built and connected to the API.
> SMS codes, Mobile Money payments and bus positions are demo/estimated and
> labelled as such in the app (see [docs/API.md](docs/API.md)).

## Tech stack

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Mobile   | React Native, Expo (SDK 58), Expo Router, TypeScript              |
| Backend  | NestJS, Node.js, TypeScript, REST                                 |
| Database | PostgreSQL, Prisma ORM                                            |
| Tooling  | Git, GitHub, ESLint (mobile), oxlint + Prettier + Vitest (backend) |

## Repository structure

```
line-up/
├── mobile/     # Expo React Native passenger app (Android + iOS)
├── backend/    # NestJS REST API + Prisma   → http://localhost:4000/api/v1
├── design/     # Figma exports, screen flow & design-system notes (reference only)
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

Requirements: Node.js 22.22+ (or 24 LTS), npm, PostgreSQL 16+, and the
**Expo Go** app on your phone (or an Android emulator / iOS simulator).

```bash
# Backend
cd backend
npm install
cp .env.example .env          # set DATABASE_URL and JWT_SECRET
npx prisma migrate deploy     # create the tables
npm run prisma:seed           # load Kigali sample routes
npm run start:dev             # http://localhost:4000/api/v1/health
```

```bash
# Mobile (second terminal)
cd mobile
npm install
cp .env.example .env.local
npm start                     # scan the QR code with Expo Go
```

`npm run web` in `mobile/` previews the app in a browser on port 3003.

## Documentation

- [Project overview](docs/PROJECT_OVERVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [API](docs/API.md)
- [Development guide](docs/DEVELOPMENT_GUIDE.md)
- [Implementation roadmap](docs/IMPLEMENTATION_ROADMAP.md)
- [Design assets guide](design/README.md)
- [Screen flow](design/SCREEN_FLOW.md)
