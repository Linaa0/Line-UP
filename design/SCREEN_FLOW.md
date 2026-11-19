# Screen Flow

All 28 screens, in passenger-journey order. Files live in
`figma-references/individual-screens/<stage>/`.

Source: **Figma** = exported from your Figma file. **Mockup** = designed in
the same theme to fill gaps (HTML source in `design/mockups/`, rendered with
`node design/mockups/render.mjs`). Recreate mockups in Figma when convenient.

## Main journey

```
01-01 Splash ─▶ 01-02 Welcome ─┬─ Get Started ─▶ 01-03 Intro: Smarter Transport
                               │                 ─▶ 01-04 Intro: Why LINE-UP
                               │                 ─▶ 01-05 Intro: How It Works
                               │                 ─▶ 02-01 Create Account ─▶ 02-02 Verify OTP ─┐
                               └─ Log In ───────────▶ 02-03 Log In ───────────────────────────┤
                                                                                             ▼
                                                                                      03-01 Home
Home search / Routes tab ─▶ 04-01 Find a Route ─▶ 04-02 Available Routes ─▶ 05-01 Route Details
05-01 "Join Queue" ─▶ 06-01 Confirm Journey ─▶ 07-01 Payment (MoMo PIN) ─▶ 07-02 Payment Success
07-02 "View Digital Ticket" ─▶ 08-01 Digital Ticket
Ticket bought ─▶ 10-01 Virtual Queue ─▶ 10-02 Boarding Ready ─▶ 09-02 Trip In Progress
Live Map tab ─▶ 09-01 Live Map ─▶ "View Route" ─▶ 05-01 Route Details
```

## Bottom tabs

| Tab      | Root screen              |
| -------- | ------------------------ |
| Home     | 03-01 Home               |
| Routes   | 04-01 Find a Route       |
| Tickets  | 08-01 Digital Ticket (a "My Tickets" list is still to be designed) |
| Live Map | 09-01 Live Map           |
| Profile  | 12-01 Profile            |

## Secondary screens

| From                                   | Goes to                      |
| -------------------------------------- | ---------------------------- |
| Bell icon (Home, Live Map, Profile)    | 11-01 Notifications (11-02 when empty) |
| Profile → edit icon / Personal info    | 12-02 Edit Profile           |
| Profile → Settings                     | 12-03 Settings               |
| Profile → Help & support, Home → Help Desk, Trip → Emergency Support | 13-01 Help Center |
| Help Center → Live chat                | 13-03 Live Chat              |
| Help Center / ticket → report a problem | 13-02 Report an Issue       |

## Screen index

| File | Screen | Source |
| ---- | ------ | ------ |
| `01-onboarding/01-01-splash-loading.png` | Splash with loader | Figma |
| `01-onboarding/01-02-welcome.png` | Welcome — Get Started / Log In | Figma |
| `01-onboarding/01-03-intro-smarter-transport.png` | Intro 1 — Smarter Transport | Figma |
| `01-onboarding/01-04-intro-why-line-up.png` | Intro 2 — Why LINE-UP | Figma |
| `01-onboarding/01-05-intro-how-it-works.png` | Intro 3 — How It Works | Figma |
| `02-authentication/02-01-create-account.png` | Create Account | Figma |
| `02-authentication/02-02-verify-otp.png` | Verify Account (OTP) | Figma |
| `02-authentication/02-03-log-in.png` | Welcome Back (Log In) | Figma |
| `03-home/03-01-home.png` | Home dashboard | Figma |
| `04-route-discovery/04-01-find-route.png` | Find a Route (search) | Figma |
| `04-route-discovery/04-02-available-routes.png` | Available Routes (results) | Figma |
| `05-route-details/05-01-route-details.png` | Route Details | Figma |
| `06-ticket-purchase/06-01-confirm-journey.png` | Confirm Journey | Figma |
| `07-payments/07-01-payment-method-momo-pin.png` | Payment method + MoMo PIN | Figma |
| `07-payments/07-02-payment-success.png` | Ticket Purchased | Figma |
| `08-tickets/08-01-digital-ticket.png` | My Ticket (QR) | Figma |
| `09-live-transport/09-01-live-map.png` | Live Kigali Map | Figma |
| `09-live-transport/09-02-trip-in-progress.png` | Trip In Progress | Figma |
| `10-queues/10-01-virtual-queue.png` | Virtual Queue | Figma |
| `10-queues/10-02-boarding-ready.png` | Boarding Ready | Figma |
| `11-notifications/11-01-notifications.png` | Notifications | Mockup |
| `11-notifications/11-02-notifications--empty.png` | Notifications (empty) | Mockup |
| `12-profile-settings/12-01-profile.png` | Profile | Mockup |
| `12-profile-settings/12-02-edit-profile.png` | Edit Profile | Mockup |
| `12-profile-settings/12-03-settings.png` | Settings | Mockup |
| `13-support/13-01-help-center.png` | Help Center | Mockup |
| `13-support/13-02-report-issue.png` | Report an Issue | Mockup |
| `13-support/13-03-live-chat.png` | Live Chat | Mockup |

## Design inconsistencies (how the app resolves them)

1. **Logo mark varies** between screens (bus icon, map pin, "L" square, grid
   icon). The app will use the bus icon from the splash/welcome screens unless
   you choose otherwise. **Resolved:** the app uses the bus mark everywhere.
2. **Fares differ for the same trip**: A024 Nyabugogo → Kicukiro is RWF 450 on
   Home and RWF 800 elsewhere. **Resolved:** fares come from the database (A024 = RWF 800).
3. **"Join Queue" vs. purchase order**: Route Details' button says "Join Queue"
   but leads into ticket purchase; the queue screens come after payment.
   **Resolved:** the button is "Get Ticket"; the queue is joined after payment.
4. **Bottom tab icons** differ slightly between Home, Find a Route and Live Map.
5. **"Tap&Go" / "Tap & Go"** spelling varies.
6. A **My Tickets list** (several tickets, history) is not designed yet; the
   Tickets tab currently has only the single-ticket view. **Resolved:** a My Tickets list was built in the same style.
