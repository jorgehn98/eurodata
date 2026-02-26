# Stack Research

**Domain:** Civic data transparency dashboard (public statistics, political data, EU)
**Researched:** 2026-02-26
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 14.x (App Router) | Frontend framework | SSG/ISR for near-static data pages; ideal for SEO on public dashboards; Vercel-native |
| TypeScript | 5.x | Language | Strict typing critical for data pipelines where shape mismatches cause silent errors |
| Supabase | 2.x | PostgreSQL + API + Edge Functions | Unified data platform; pg_cron built-in; RLS for future auth; REST API auto-generated |
| Tailwind CSS | 3.x | Styling | Dominant in Next.js ecosystem; tree-shaking keeps bundles lean |
| TanStack Query | 5.x | Client-side data fetching | Stale-while-revalidate cache; loading/error states; avoids prop drilling data |
| next-intl | 3.x | i18n (bilingual ES/EN) | Best-in-class for Next.js App Router; file-based message dictionaries; SEO-friendly routes |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Recharts | 2.x | Chart components | Primary chart library — composable, TypeScript-native, responsive |
| Tremor | 3.x | Dashboard UI components | MetricCard, ProgressBar, BadgeDelta for KPI displays; layered on top of Recharts |
| Zustand | 4.x | Client state | Country selector state, active filters — lightweight, no boilerplate |
| date-fns | 3.x | Date utilities | Safer than native Date; tree-shakeable; format/parse/compare year ranges |
| Papa Parse | 5.x | CSV parsing | Essential for Banco de España and other CSV-only sources; runs in browser or Node |
| zod | 3.x | Schema validation | Validate API responses from Eurostat/INE before writing to DB — catch format changes |
| p-limit | 5.x | Concurrency limiter | Rate-limit API calls in Edge Functions when batching historical data from Eurostat |
| @supabase/supabase-js | 2.x | Supabase client | Official client for browser + server |
| @supabase/ssr | 0.x | SSR cookie handling | Required for Next.js App Router + Supabase |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint + @next/eslint | Linting | Catches data handling issues early |
| Prettier | Formatting | Consistent code style across data pipeline code |
| Supabase CLI | Local dev + migrations | `supabase db diff` for schema migrations; local Edge Function testing |
| tsx | Run TypeScript scripts | For one-off data import scripts without full build |

## Installation

```bash
# Core
npm install next@14 react react-dom typescript @types/node @types/react

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# UI / Charts
npm install @tremor/react recharts tailwindcss

# Data fetching and state
npm install @tanstack/react-query zustand

# i18n (CRITICAL — add from start)
npm install next-intl

# Data utilities
npm install date-fns papaparse zod p-limit

# Dev dependencies
npm install -D eslint @next/eslint-config-next prettier supabase tsx
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| next-intl | next-i18next | next-i18next requires Pages Router; not compatible with App Router |
| next-intl | react-i18next | Works but lacks Next.js App Router optimizations (server components) |
| Recharts | D3.js | Only if needing highly custom, non-standard chart types (e.g., Sankey flows) |
| Recharts | Chart.js | Chart.js has weaker TypeScript support; Recharts is more composable |
| Tremor | shadcn/ui + custom | Valid alternative; Tremor has more pre-built data dashboard primitives |
| Zustand | Jotai | Both valid; Zustand has simpler API for this use case |
| Papa Parse | node-csv | Papa Parse works both browser and Node; better for this mixed-environment need |
| zod | yup / valibot | Zod has best TypeScript integration; valibot is smaller but less ecosystem support |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| getServerSideProps | Pages Router pattern; not available in App Router | Server Components + `fetch` |
| next-i18next | Incompatible with App Router — will cause SSR issues | next-intl |
| moment.js | 67KB bundle, deprecated | date-fns (tree-shakeable) |
| axios | Adds 14KB for functionality native fetch provides | Native fetch + zod for validation |
| SWR | TanStack Query has better DevTools, more features; both from same creators conceptually | TanStack Query v5 |
| Prisma | Overkill when Supabase already provides typed client; adds build complexity | @supabase/supabase-js |

## Stack Patterns by Variant

**For data-heavy pages (Economy, Crime sections) with infrequent updates:**
- Use Next.js `generateStaticParams` + ISR with `revalidate: 3600` (hourly)
- Data fetched server-side at build/revalidation time
- TanStack Query only for client interactions (country selector changes)

**For the Country Comparator (dynamic, user-driven):**
- Use Server Components for initial render + TanStack Query for client-side filter changes
- Pass country selection as URL search params (shareable links)

**For Edge Functions (data sync pipeline):**
- Use Deno + TypeScript (Supabase Edge Functions runtime)
- zod for validating external API responses before upsert
- p-limit for rate limiting parallel API calls

**For bilingual content (next-intl):**
- Route structure: `/[locale]/economia`, `/[locale]/politica`
- Locale detection via middleware
- Messages in `/messages/es.json` and `/messages/en.json`

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next@14 | react@18 | React 19 support comes in Next.js 15+ |
| @tremor/react@3 | recharts@2 | Tremor 3.x bundles Recharts 2.x internally — don't import conflicting versions |
| @supabase/ssr@0.x | next@14 | @supabase/ssr is specifically designed for Next.js App Router |
| next-intl@3 | next@14 | next-intl@3 requires Next.js 13.4+; App Router required |
| @tanstack/react-query@5 | react@18 | v5 requires React 18+ |

## Sources

- Next.js official docs (nextjs.org) — App Router patterns, ISR, Server Components
- next-intl docs (next-intl.dev) — App Router i18n setup
- Tremor docs (tremor.so) — component compatibility with Recharts versions
- Supabase docs (supabase.com) — Edge Functions, pg_cron, SSR client
- TanStack Query v5 migration guide — breaking changes from v4

---
*Stack research for: civic data transparency dashboard (Next.js + Supabase)*
*Researched: 2026-02-26*
