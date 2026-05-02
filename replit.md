# YatraWheels Workspace

## Overview

pnpm workspace monorepo using TypeScript. AI-powered vehicle booking and travel planning marketplace for India.

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24 | **TypeScript**: 5.9
- **Frontend**: React + Vite + Tailwind CSS v4 + Framer Motion + Wouter + Shadcn/ui
- **Backend**: Express 5 + MongoDB + JWT + Razorpay
- **AI**: OpenAI gpt-4o-mini (via `/api/ai/chat`)
- **Map**: Leaflet + react-leaflet (RouteMap component)
- **Email**: Zapier webhook (`ZAPIER_WEBHOOK_URL`) for booking confirmations

## Artifacts

### YatraWheels (`artifacts/yatrawheels`) — Preview: `/`

React+Vite frontend. Full multi-role marketplace (User, Vendor, Driver, Admin).

**Theme system**: `ThemeContext.tsx` — dark/light mode, persisted in `localStorage` as `yw_theme`. Applied as `.dark` / `.light` class on `<html>`. Default: dark.

**Pages (User)**:
- `/` — Home/Landing
- `/booking` — Vehicle fleet with filters
- `/booking/:id` — Booking details + Leaflet route map + Razorpay payment
- `/planner` — ChatGPT-style AI chatbot trip planner (YatraBot)
- `/explore` — Destinations + routes explorer
- `/dashboard` — User bookings dashboard
- `/auth` — Login / Signup
- `/pricing` — Plans & pricing
- `/profile` — User profile (Profile / Security / Appearance tabs)

**Pages (Vendor)**:
- `/vendor` — Vendor dashboard
- `/vendor/vehicles` — Manage vehicles
- `/vendor/bookings` — View bookings
- `/vendor/profile` — Personal/business info only (ProfilePage)
- `/vendor/settings` — Security, Appearance, Billing, Notifications (VendorAccountSettings)

**Pages (Driver)**:
- `/driver` — Driver dashboard
- `/driver/bookings` — My trips
- `/driver/profile` — Personal info (ProfilePage)
- `/driver/settings` — Account settings (VendorAccountSettings)

**Pages (Admin)**:
- `/admin`, `/admin/users`, `/admin/vehicles`, `/admin/bookings`, `/admin/drivers`

**Key components**:
- `Navbar.tsx` — User dropdown (My Profile → `/profile`, My Bookings, Appearance, Plans & Billing), theme toggle, Upgrade button
- `PanelTopNav.tsx` — Vendor/Driver top nav with separate My Profile + Account Settings links + theme toggle
- `RouteMap.tsx` — Leaflet map with city-coordinate lookup for 50+ Indian cities, shows pickup→dropoff route

**Key files**:
- `src/context/ThemeContext.tsx` — Theme system
- `src/context/BookingContext.tsx` — Selected vehicle + trip params + auth user
- `src/services/authService.ts` — `fetchMe`, `updateProfile`, `changePassword`, `setStoredUser`, `authHeaders`, `getToken`
- `src/services/api.ts` — Booking, payment, vehicle API calls

### API Server (`artifacts/api-server`) — Preview: `/api`

Express 5 + MongoDB backend. All routes under `/api`.

**Auth routes**: `/api/auth/` — register, login, me, update-profile, change-password  
**Vehicle routes**: `/api/vehicles/`  
**Booking routes**: `/api/bookings/`  
**Payment routes**: `/api/payments/` — create order, verify (triggers Zapier confirmation email)  
**AI chat**: `POST /api/ai/chat` — `{ messages: [{role, content}] }` → `{ content }` (YatraBot, gpt-4o-mini)  
**Vendor routes**: `/api/vendor/`  
**Driver routes**: `/api/driver/`  
**Admin routes**: `/api/admin/`  

**Key files**:
- `src/controllers/aiChatController.ts` — OpenAI chat with YatraBot system prompt + `[PLAN]...[/PLAN]` structured output
- `src/controllers/paymentController.ts` — Razorpay order + verify + fires booking confirmation email
- `src/services/emailService.ts` — Zapier webhook email sender
- `src/services/paymentService.ts` — Razorpay SDK wrapper

**Secrets required**: `MONGODB_URI`, `OPENAI_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SESSION_SECRET`, `ZAPIER_WEBHOOK_URL`

### Canvas (`artifacts/mockup-sandbox`) — Preview: `/__mockup`

Design mockup sandbox for UI prototyping.

## Key Commands

```bash
pnpm run typecheck          # full typecheck across all packages
pnpm run build              # typecheck + build
pnpm --filter @workspace/api-server run dev   # run API server locally
```

## Important Notes

- `PANEL_PREFIXES` in `App.tsx`: `/vendor`, `/driver`, `/admin`, `/auth` — hides global Navbar/Footer
- User `/profile` is NOT a panel — shows Navbar
- Leaflet map (`RouteMap`) lazy-imports leaflet to avoid SSR issues; needs leaflet CSS served
- AI chat endpoint returns `{ content }` field (not `reply`)
- Booking confirmation email fires asynchronously after payment verify — non-blocking
