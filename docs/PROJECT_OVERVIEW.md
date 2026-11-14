# Project Overview

**Line-Up** is a public transport platform for passengers in Kigali, Rwanda.
It helps passengers find routes and stops, buy tickets, pay digitally, join
queues at stops, and follow buses live.

## Users

- **Passengers** — the primary audience of the first release (mobile-first
  web app).
- Operator / admin tooling is out of scope for now; the architecture leaves
  room for it as another route group (`(operator)`, `(admin)`) or a separate
  app later.

## Passenger journey

The Figma design and the code are both organised around this journey:

1. Onboarding
2. Authentication
3. Home
4. Route discovery
5. Route details
6. Ticket purchase
7. Payments
8. Tickets
9. Live transport
10. Queues
11. Notifications
12. Profile & settings
13. Support

## Repository at a glance

| Folder      | What it is                                               |
| ----------- | -------------------------------------------------------- |
| `frontend/` | Next.js passenger web app                                |
| `backend/`  | NestJS REST API + Prisma (PostgreSQL)                     |
| `design/`   | Figma exports and design-system notes (not shipped)      |
| `docs/`     | Project documentation                                    |

## Current status

Foundation only: project structure, tooling, configuration and
documentation. No features or screens are implemented yet — see
[IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md).
