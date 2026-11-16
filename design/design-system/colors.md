# Colors

Values sampled from the Figma exports (pixel colors, so ±1–2 off the exact
Figma styles). Confirm against Figma color styles when you can. The code
source of truth is `mobile/src/constants/theme.ts` — keep both in sync.

## Brand

| Token       | Hex       | Seen in                                         |
| ----------- | --------- | ----------------------------------------------- |
| `forest900` | `#0E3924` | Primary buttons (Next, Get Started, Verify)     |
| `forest700` | `#0D5C3A` | Log In button, active tab                       |
| `forest600` | `#0B5536` | Splash / Welcome background (gradient start)    |
| `forest950` | `#002513` | Splash / Welcome background (gradient end)      |
| `emerald`   | `#059669` | Live status, map route, success check, View Route button |
| `emerald50` | `#E7F8EF` | Icon tiles behind feature icons                 |
| `mint`      | `#70FBBE` | "Get Started" on dark, "UP" in wordmark         |
| `mint100`   | `#CBFFE8` | Pills / badges (Best, On Time, Live System)     |
| `mint200`   | `#C4F1DC` | Queue number hero card                          |

## Neutrals

| Token           | Hex       | Usage                     |
| --------------- | --------- | ------------------------- |
| `background`    | `#F4FAF6` | Screen background         |
| `card`          | `#FFFFFF` | Cards, inputs             |
| `border`        | `#E3EEE8` | Card / input borders      |
| `text`          | `#111827` | Headings and body         |
| `textSecondary` | `#4B5563` | Secondary text            |
| `muted`         | `#94A3B8` | Placeholders, section labels |

## Feedback & brands

| Token      | Hex       | Usage                          |
| ---------- | --------- | ------------------------------ |
| `danger`   | `#DC2626` | Destination pin, delete, SOS   |
| `warning`  | `#D97706` | Route-change alerts            |
| `momo`     | `#FFCB05` | MTN Mobile Money tile          |
| `airtel`   | `#E4312B` | Airtel Money tile              |

## Dark mode

Not designed. The app runs in light mode only (`userInterfaceStyle: light`).
