---
phase: 01-foundation
plan: "03"
subsystem: infra
tags: [supabase, supabase-ssr, tanstack-query, react-query, next-intl, nextjs]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js 14 scaffold with TypeScript and Tailwind
  - phase: 01-02
    provides: next-intl routing, NextIntlClientProvider, locale layout

provides:
  - Supabase browser client factory (createBrowserClient via @supabase/ssr)
  - Supabase server client factory (createServerClient with cookie handling via @supabase/ssr)
  - TanStack Query provider (QueryClient per-request via useState, ReactQueryDevtools)
  - QueryProvider wired into [locale]/layout.tsx inside NextIntlClientProvider

affects:
  - 01-04 (database schema — needs server client to verify connectivity)
  - All phases 2-5 (every data-fetching hook depends on QueryProvider being available at root)

# Tech tracking
tech-stack:
  added:
    - "@supabase/supabase-js ^2"
    - "@supabase/ssr ^0"
    - "@tanstack/react-query ^5"
    - "@tanstack/react-query-devtools ^5"
  patterns:
    - Dual Supabase client pattern: browser (createBrowserClient) vs server (createServerClient) — never cross-use
    - QueryClient created in useState(() => new QueryClient(...)) — never at module scope (prevents shared state between SSR requests)
    - ReactQueryDevtools renders automatically only in development (no manual NODE_ENV check needed)
    - staleTime 60s + refetchOnWindowFocus:false — correct for economic data that changes infrequently

key-files:
  created:
    - src/lib/supabase/client.ts
    - src/lib/supabase/server.ts
    - src/providers/QueryProvider.tsx
  modified:
    - src/app/[locale]/layout.tsx
    - package.json
    - package-lock.json

key-decisions:
  - "Use @supabase/ssr (not deprecated @supabase/auth-helpers-nextjs) — supports Next.js App Router SSR cookie handling correctly"
  - "QueryProvider placed inside NextIntlClientProvider in locale layout — all client components have both i18n and query context"
  - "staleTime: 60s, refetchOnWindowFocus: false — economic data is mostly static, avoid unnecessary re-fetches"
  - "Supabase project: eurodata, region EU West, credentials in .env.local (gitignored) and Vercel env vars"

patterns-established:
  - "Pattern 1: Browser/server Supabase split — client.ts for 'use client' only, server.ts for Server Components/Route Handlers only. Never import from the wrong file."
  - "Pattern 2: QueryClient in useState — always use useState(() => new QueryClient(...)) in providers, never module-level singleton."
  - "Pattern 3: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (not ANON_KEY) — matches Supabase dashboard's 'Publishable key' naming in newer projects."

requirements-completed: [INFRA-03, INFRA-09]

# Metrics
duration: ~30min
completed: 2026-02-27
---

# Phase 01 Plan 03: Supabase SSR Dual-Client and TanStack Query Provider Summary

**Supabase SSR dual-client setup (@supabase/ssr) with browser/server factories, and TanStack Query provider wired into locale layout with per-request QueryClient**

## Performance

- **Duration:** ~30 min (including human-action checkpoint for Supabase project creation)
- **Started:** 2026-02-26T23:28:56Z
- **Completed:** 2026-02-27T00:00:00Z
- **Tasks:** 2/2 (Task 1: human-action checkpoint; Task 2: auto)
- **Files modified:** 6

## Accomplishments

- Supabase project "eurodata" created (EU West region), credentials stored in .env.local (gitignored) and Vercel environment variables
- Browser client factory (`src/lib/supabase/client.ts`) using `createBrowserClient` from `@supabase/ssr` — for use only in Client Components
- Server client factory (`src/lib/supabase/server.ts`) using `createServerClient` with full cookie read/write handling — for Server Components, Route Handlers, and Actions
- TanStack Query provider (`src/providers/QueryProvider.tsx`) with per-request QueryClient (via `useState`) and ReactQueryDevtools
- QueryProvider wired inside `NextIntlClientProvider` in `src/app/[locale]/layout.tsx` — all client components now have access to both i18n context and QueryClient
- `npm run build` and `npx tsc --noEmit` both pass with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Supabase project and configure environment variables** - human-action checkpoint (no code commit — .env.local is gitignored)
2. **Task 2: Install packages, create client factories, wire TanStack Query** - `159bcc7` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `src/lib/supabase/client.ts` - createBrowserClient factory for use in Client Components only
- `src/lib/supabase/server.ts` - Async createServerClient factory with cookie getAll/setAll for Server Components
- `src/providers/QueryProvider.tsx` - TanStack Query provider; QueryClient in useState with staleTime 60s; ReactQueryDevtools included
- `src/app/[locale]/layout.tsx` - Added QueryProvider import and wrapping inside NextIntlClientProvider
- `package.json` - Added 4 new dependencies (@supabase/supabase-js, @supabase/ssr, @tanstack/react-query, @tanstack/react-query-devtools)
- `package-lock.json` - Updated lockfile (16 new packages)

## Decisions Made

- Used `@supabase/ssr` (not the deprecated `@supabase/auth-helpers-nextjs`) — correct package for Next.js App Router with SSR cookie support
- Env var name is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not `ANON_KEY`) — matches Supabase dashboard "Publishable key" naming
- `QueryProvider` placed inside `NextIntlClientProvider` so both contexts are available to all client components in the tree
- `staleTime: 60 * 1000` and `refetchOnWindowFocus: false` — appropriate defaults for economic data that changes infrequently

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- 4 pre-existing high severity npm audit warnings in Next.js 14.2.35 and eslint-config-next (glob vulnerability, Next.js DoS vulnerabilities). These are pre-existing, unrelated to this plan's changes. Fix requires upgrading to Next.js 16 (breaking change — architectural decision). Logged to deferred-items.

## User Setup Required

Supabase project created and configured during this plan:

- Supabase project: `eurodata` (EU West region)
- Project URL: stored in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
- Publishable key: stored in `.env.local` as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Both variables added to Vercel (Production + Preview + Development environments)
- `.env.local` is gitignored — credentials are not committed to source control

## Next Phase Readiness

- Plan 01-04 (database schema) can now proceed — server client factory is available for connectivity verification
- All data-fetching hooks in Phases 2-5 have TanStack Query available at the root
- No blockers for remaining foundation plans

---
*Phase: 01-foundation*
*Completed: 2026-02-27*
