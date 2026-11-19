# API

REST/JSON API served by the NestJS backend.

- **Base URL (local):** `http://localhost:4000/api/v1`
- **Auth:** `Authorization: Bearer <token>` (from `/auth/verify`, `/auth/login` or `/auth/reset-password`). 🔒 = requires it.
- **Validation:** zod schemas; invalid input returns `400` with `message: ["field: reason", …]`.
- **Times** are ISO-8601 UTC; the app shows them in Kigali time (UTC+2). **Money** is integer RWF.

## What is real and what is demo

| Area | Status |
| ---- | ------ |
| Accounts, passwords (scrypt), login tokens (JWT) | Real |
| Stops, routes, fares, timetables | Real data model; **seed values are sample data** |
| Route search, next departures, bus load % | Real, computed from the timetable and ticket sales |
| Bus positions on the map, ETAs | **Estimated from the timetable** (no GPS feed). Responses carry `estimated: true` |
| SMS one-time codes | **Demo:** no SMS provider. With `OTP_DEMO_MODE=true` the code is returned as `demoCode` and the app labels it |
| Mobile Money payments | **Demo:** no provider. Payments are stored with `provider: "DEMO"` and the app labels them; no money moves |

## Endpoints

### Health
| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/health` | `{ status, database }` |

### Auth
| Method | Path | Body | Returns |
| ------ | ---- | ---- | ------- |
| POST | `/auth/register` | `{ fullName, phone, password }` | `{ phone, expiresAt, resendAfterSeconds, demoCode? }` |
| POST | `/auth/verify` | `{ phone, code }` | `{ token, user }` |
| POST | `/auth/resend-code` | `{ phone }` | like register (45 s cooldown, `429` if too soon) |
| POST | `/auth/login` | `{ phone, password }` | `{ token, user }`; `403 PHONE_NOT_VERIFIED` (+ new code) if unverified |
| POST | `/auth/forgot-password` | `{ phone }` | like register |
| POST | `/auth/reset-password` | `{ phone, code, password }` | `{ token, user }` |
| GET 🔒 | `/auth/me` | | `user` |

Phone numbers are accepted as `0788123456`, `788123456` or `+250 788 123 456` and stored as `+250788123456`. Passwords: 8–72 characters with a letter and a number. Codes expire after 10 minutes and lock after 5 wrong attempts.

### Users 🔒
| Method | Path | Body |
| ------ | ---- | ---- |
| PATCH | `/users/me` | `{ fullName?, email?, homeStopId? }` |
| PATCH | `/users/me/preferences` | `{ language?: rw\|en\|fr, notifyArrivals?, notifyQueue?, notifyReceipts?, notifyOffers? }` |
| GET | `/users/me/summary` | → `{ tripsTaken, activeTickets, savedRoutes }` |
| GET | `/users/me/saved-routes` | → route summaries |
| DELETE | `/users/me` | Permanently deletes the account and its data |

### Stops, routes, live
| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/stops?q=` | Search by name or area; includes `routeCount` |
| GET | `/stops/:id/departures?limit=5` | Next bus on each route calling here (Home "Nearby buses") |
| GET | `/routes/search?from=&to=&at=` | Routes serving both stops in order; sorted by arrival; first is `best` |
| GET | `/routes/:id?from=&to=` | Stops with times, next 3 departures, bus, load %, `saved` (if logged in) |
| PUT 🔒 / DELETE 🔒 | `/routes/:id/save` | Save / unsave a route |
| GET | `/live/buses?routeId=` | Buses on the road with estimated positions, plus each line's path |

### Tickets, payments, queues 🔒
| Method | Path | Body / notes |
| ------ | ---- | ------------ |
| POST | `/tickets` | `{ routeId, fromStopId, toStopId, tripStartAt? }` → ticket in `PENDING_PAYMENT` |
| GET | `/tickets` | `{ active, past }` |
| GET | `/tickets/:id` | Ticket with QR code value, validity, payment |
| POST | `/payments` | `{ ticketId, method: MTN_MOMO\|AIRTEL_MONEY, phone }` → `{ demo: true, ticket }` |
| POST | `/queues` | `{ ticketId }` → queue entry (ticket must be paid) |
| GET | `/queues/active` | `{ entry }` — current queue/trip or `null` |
| GET | `/queues/:id` | `status` WAITING → BOARDING (3 min before departure) → ON_BUS → COMPLETED, position, people ahead, journey progress |
| POST | `/queues/:id/board` | Marks the passenger on the bus (stands in for the conductor's QR scan) |

### Notifications & support 🔒
| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/notifications` | `{ unread, items }` (created on sign-up, payment, queue join, report) |
| POST | `/notifications/read-all` | |
| POST | `/notifications/:id/read` | |
| POST | `/support/reports` | `{ category, description, ticketId? }` |
| GET | `/support/reports` | The user's reports |

## Seed data

`npm run prisma:seed` loads 18 Kigali stops (approximate coordinates) and 8
sample lines in both directions (A024, A031, A036, A041, B102, B210, C305,
C410) with timetables and two buses each. These are **sample values** for
development and demos, not official operator data.
