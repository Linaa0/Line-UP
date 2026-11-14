# Line-Up Design Assets

This folder is the single source of truth for everything exported from Figma.
It is **reference material**, not application code. Nothing in this folder is
served to users. Production assets are copied from here into
`frontend/public/` when a screen is implemented.

```
design/
├── figma-references/        # Pictures of screens (what a screen should LOOK like)
│   ├── screen-overviews/    # Full-canvas / multi-screen Figma exports
│   └── individual-screens/  # One PNG per mobile screen, grouped by passenger journey
├── exported-assets/         # Production-ready building blocks (logos, icons, …)
│   ├── logos/
│   ├── icons/
│   ├── illustrations/
│   ├── images/
│   └── fonts/
└── design-system/           # Written tokens: colors, typography, spacing, components
```

The key rule: **screenshots of screens never go in `exported-assets/`, and
production assets never go in `figma-references/`.** A screen reference is a
picture to compare against; an exported asset is a file the app will ship.

> Empty folders contain a `.gitkeep` file so Git tracks them. Delete the
> `.gitkeep` once the folder has real files in it (optional).

---

## 1. Full-screen Figma exports → `figma-references/screen-overviews/`

Use this for exports that show **many screens at once** — a whole Figma page,
a user-flow board, or a section of the canvas.

- Export at **1x or 2x PNG** (large canvases at 1x are fine).
- Name by what the board shows:
  `overview-<topic>.png` — e.g. `overview-full-passenger-journey.png`,
  `overview-ticket-purchase-flow.png`, `overview-design-system.png`.

## 2. Individual screen references → `figma-references/individual-screens/`

One file per mobile screen (one Figma frame), placed in the folder for its
stage in the passenger journey:

| Folder                 | Contains                                                   |
| ---------------------- | ---------------------------------------------------------- |
| `01-onboarding`        | Splash, welcome / intro carousel, permissions prompts       |
| `02-authentication`    | Sign up, log in, OTP / phone verification, password reset   |
| `03-home`              | Home dashboard, quick actions                               |
| `04-route-discovery`   | Search, route results, map of routes, stop search           |
| `05-route-details`     | A single route: stops, schedule, fare, bus info             |
| `06-ticket-purchase`   | Selecting trip / passengers / fare, order summary           |
| `07-payments`          | Payment method choice, MoMo / card flows, success, failure  |
| `08-tickets`           | My tickets list, ticket detail, QR code, history            |
| `09-live-transport`    | Live bus location, ETA, trip-in-progress                    |
| `10-queues`            | Joining a stop queue, queue position, queue status          |
| `11-notifications`     | Notification list, notification detail                      |
| `12-profile-settings`  | Profile, edit profile, language, preferences, settings      |
| `13-support`           | Help center, FAQ, contact support, report an issue          |

- Export each frame at **2x PNG** so details are readable.
- Export state variants (empty, loading, error, filled) as separate files.

## 3. Logos and icons → `exported-assets/logos/` and `exported-assets/icons/`

- **Logos:** export as **SVG** (plus a PNG fallback if needed). Keep every
  variation: `logo-primary.svg`, `logo-white.svg`, `logo-dark.svg`,
  `logo-mark.svg` (symbol only), `logo-wordmark.svg`, `app-icon-512.png`.
- **Icons:** export as **SVG**, 24×24 frame, outlined strokes, no hard-coded
  background. Name `icon-<name>.svg`, e.g. `icon-bus.svg`, `icon-ticket.svg`,
  `icon-map-pin.svg`. If an icon has filled/outline variants, suffix them:
  `icon-home-filled.svg`, `icon-home-outline.svg`.

## 4. Illustrations and images → `exported-assets/illustrations/` and `exported-assets/images/`

- **Illustrations** (vector artwork: onboarding art, empty states, success
  states): prefer **SVG**; use PNG 2x only if the artwork has raster effects.
  Name `illustration-<context>.svg`, e.g. `illustration-onboarding-1.svg`,
  `illustration-empty-tickets.svg`.
- **Images** (photos, map backgrounds, raster graphics): export **WebP or
  PNG at 2x**. Name `image-<context>.webp`, e.g. `image-kigali-bus-stop.webp`.
- **Fonts** → `exported-assets/fonts/`: the original font files (`.woff2`
  preferred, `.ttf` acceptable) with their licence file.

## 5. Where production assets end up

When a screen is implemented, copy only the assets it needs:

| From `design/exported-assets/` | To `frontend/public/`         | Used in code as                       |
| ------------------------------ | ----------------------------- | ------------------------------------- |
| `logos/`                       | `assets/logos/`               | `/assets/logos/logo-primary.svg`      |
| `icons/`                       | `assets/icons/`               | `/assets/icons/icon-bus.svg`          |
| `illustrations/`               | `assets/illustrations/`       | `/assets/illustrations/…`             |
| `images/`                      | `assets/images/`              | `/assets/images/…`                    |
| `fonts/`                       | `fonts/`                      | loaded via `next/font/local`          |

Optimise before copying (run SVGs through SVGO, compress raster images).
Never copy anything from `figma-references/` into the frontend.

## 6. Naming exported screens

Pattern:

```
<journey-number>-<screen-number>-<screen-name>[--<state>].png
```

- `journey-number` — the two-digit folder number (`01`–`13`).
- `screen-number` — two-digit order of the screen inside that stage.
- `screen-name` — lowercase, hyphen-separated, matches the Figma frame name.
- `state` (optional, after a double hyphen) — `empty`, `loading`, `error`,
  `success`, `filled`, `dark`, etc.

Examples:

```
01-onboarding/01-01-splash.png
01-onboarding/01-02-welcome.png
02-authentication/02-03-verify-otp.png
02-authentication/02-03-verify-otp--error.png
06-ticket-purchase/06-02-select-fare.png
08-tickets/08-01-my-tickets--empty.png
```

Rules: lowercase only, no spaces, no dates or "final-v2" in names (Git keeps
the history). Rename the Figma frames to match before exporting so the two
always line up.
