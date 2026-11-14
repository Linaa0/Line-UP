# API

REST/JSON API served by the NestJS backend.

- **Base URL (local):** `http://localhost:4000/api/v1`
- **Versioning:** URI versioning — `/api/v1/...`
- **Format:** JSON request and response bodies
- **Validation:** invalid bodies return `400` with a list of messages

## Endpoints

### Health

`GET /api/v1/health`

Reports whether the API is running and whether the database is reachable.

```json
{
  "status": "ok",
  "timestamp": "2026-11-14T10:00:00.000Z",
  "uptime": 12.34,
  "database": "up"
}
```

`database` is `"up"` or `"down"` (a `SELECT 1` failed or timed out after 5 s).
`status` is `"ok"` when the database is up, otherwise `"degraded"`. The
endpoint answers `200` whenever the API process is running.

## Planned resource groups

Documented here as each module is implemented:

| Prefix               | Module         |
| -------------------- | -------------- |
| `/auth`              | auth           |
| `/users`             | users          |
| `/routes`            | routes         |
| `/stops`             | stops          |
| `/buses`             | buses          |
| `/trips`             | trips          |
| `/fares`             | fares          |
| `/tickets`           | tickets        |
| `/payments`          | payments       |
| `/queues`            | queues         |
| `/notifications`     | notifications  |

## Conventions

- Plural nouns for resources: `GET /routes`, `GET /routes/:id`.
- `POST` create, `PATCH` partial update, `DELETE` remove.
- Error shape (NestJS default):
  `{ "statusCode": 400, "message": ["..."], "error": "Bad Request" }`
- Dates are ISO-8601 strings in UTC.
- Money amounts are integers in RWF.
