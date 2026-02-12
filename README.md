# FitnessMage

A macro-nutrient tracking app with a web dashboard and mobile PWA. Log meals on your phone, manage your food library on desktop, and track progress toward daily macro goals.

## Features

**Mobile (PWA)**
- Daily macro progress dashboard (calories, protein, carbs, fat)
- Food logging with barcode scanner, USDA search, and manual entry
- Meal tracking grouped by breakfast/lunch/dinner/snack
- Saved meals and favorite foods for quick logging
- Weekly overview with daily totals
- Passwordless device linking via QR code

**Web**
- Food library management with USDA and Open Food Facts import
- Saved meal presets with configurable servings
- Reports with calorie trends, goal achievement, and streaks
- Settings for daily macro goals, units, and meal time boundaries
- Device management for linked mobile devices

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Data Fetching:** SWR with optimistic updates
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker Desktop (for local Supabase)

### Setup

```bash
# Install dependencies
pnpm install

# Start local Supabase
pnpm db:start

# Generate TypeScript types from the database schema
pnpm db:typegen

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the project root:

```
SUPABASE_URL=http://127.0.0.1:54361
SUPABASE_PUBLISHABLE_KEY=<anon key from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<service role key from supabase start output>
```

All env vars are server-only — no `NEXT_PUBLIC_` prefix. Client-side code communicates through Next.js API routes.

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm dev:https` | Dev server with HTTPS (for mobile testing) |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm db:start` | Start local Supabase |
| `pnpm db:stop` | Stop local Supabase |
| `pnpm db:reset` | Reset database and re-run migrations |
| `pnpm db:push` | Push schema changes to Supabase |
| `pnpm db:typegen` | Generate TypeScript types from schema |

## Project Structure

```
src/
├── app/
│   ├── (mobile)/     # Mobile PWA pages (home, track, add, weekly, link)
│   ├── (web)/        # Desktop pages (foods, meals, reports, settings, devices)
│   ├── (auth)/       # Login and signup
│   ├── api/          # API routes
│   └── landing/      # Marketing page
├── components/       # Shared UI components
├── hooks/            # SWR data-fetching hooks
└── lib/              # Utilities, auth, API helpers
supabase/
├── migrations/       # Database migrations
└── seed.sql          # Seed data for local development
```

## Auth Architecture

- **Web:** Supabase session auth via cookies
- **Mobile:** Device tokens stored in localStorage, linked via QR code scan
- `resolveUser()` tries session auth first, then falls back to device token from the `Authorization` header
