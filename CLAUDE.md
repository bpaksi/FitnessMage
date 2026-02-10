# FitnessMage — Project Conventions

## Tech Stack

- Next.js 16.1.6 (App Router, `src/` directory)
- pnpm package manager
- TypeScript, Tailwind CSS, Shadcn/ui
- Supabase (Auth, PostgreSQL, RLS) via `@supabase/ssr`
- SWR for data fetching
- No tests for MVP

## Next.js 16 Patterns

- **`proxy.ts` replaces `middleware.ts`** — export `proxy()`, runs on Node.js (not Edge)
- **Async Request APIs** — `cookies()`, `headers()`, `params`, `searchParams` all return Promises, must `await`
- **Type helpers** — run `npx next typegen` for `PageProps`, `LayoutProps`, `RouteContext`

## File Naming

- **kebab-case** for all files (`macro-progress-bar.tsx`)
- **PascalCase** for component exports (`MacroProgressBar`)
- Imports: `@/*` alias resolves to `src/*`

## API Routes

- Always use `resolveUser()` from `@/lib/auth/resolve-user` for auth
- Return via `ok()`, `error()`, `unauthorized()` from `@/lib/api/response`
- Rate limit auth verification and external API routes

## Mobile Pages

- Always use `apiClient` from `@/lib/mobile/api-client` — never raw `fetch`
- Token stored in localStorage via `@/lib/mobile/token-store`

## Data Fetching

- SWR hooks in `src/hooks/`
- All write operations use `mutate()` with `optimisticData` for instant UI — revert on error
- Never use raw `fetch` in components

## State Management

- React Context for shared mobile state (`MobileContext`): selected date, user settings cache
- No global state libraries

## Components

- Shadcn/ui only — no custom UI primitives
- Dynamic import heavy libs (`html5-qrcode`) via `next/dynamic`

## Food Display

- Always show serving size: `"${food.name} (${food.serving_size})"`
- Never display a food name without its serving context

## Motion Design

- Progress bars: `transition-all duration-500 ease-out`
- Toasts: slide-up with `animate-slide-up`
- Haptic: `navigator.vibrate(50)` on add/delete actions on mobile
- Respect `prefers-reduced-motion` — disable animations when set

## Accessibility

- Semantic HTML: `<nav>`, `<main>`, `<section>`
- ARIA on progress bars: `role="progressbar"`, `aria-valuenow`, `aria-valuemax`
- WCAG AA contrast ratios
- `prefers-reduced-motion` media query

## Empty States

- Every list/screen has a designed empty state: icon + message + CTA button
- Examples: Home → "Log your first meal" with CTA to Add

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54361
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

## Auth Architecture

- **Web**: Supabase session auth via cookies
- **Mobile**: Device tokens in localStorage, linked via QR code, no login on mobile
- `resolveUser()` tries session first, falls back to `Authorization: Bearer <token>` header

## Design System Colors

```
bg: #020817, surface: #0f172a, border: #1e293b, muted: #64748b, text: #f8fafc
primary: #3b82f6, primary-hover: #2563eb
calories: #22c55e, protein: #ef4444, carbs: #3b82f6, fat: #eab308
over-goal: #f59e0b (amber)
```
