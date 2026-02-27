# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-26)

**Core value:** Citizens can verify, with official sources linked, how their purchasing power and quality of life have evolved over time compared to the political class that governs them.
**Current focus:** Phase 2 — Economy Section

## Current Position

Phase: 2 of 7 (Economy Section)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-02-27 — Plan 01-04 complete: Phase 1 Foundation finished — 6-table Postgres schema pushed to Supabase, EU-27 countries seeded

Progress: [████░░░░░░] 14%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: ~30 min
- Total execution time: ~2 hours (human-action checkpoints included)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 4/4 | ~2.75h | ~40m |

**Recent Trend:**
- Last 5 plans: 01-01 (scaffold + CI/CD), 01-02 (next-intl i18n), 01-03 (Supabase + TanStack Query), 01-04 (DB schema + EU-27 seed)
- Trend: On track — Phase 1 complete

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-phase]: i18n (next-intl) MUST be configured in Phase 1 — App Router routing tree cannot be restructured after the fact
- [Pre-phase]: Data unit normalization rules (EUR/year for salaries, rate per 100k for crime) must be established in DB schema before any data is ingested
- [Pre-phase]: Missing data stored as NULL, never 0 — enforced at ETL ingestion layer
- [Pre-phase]: All chart titles must be strictly neutral (describe axis, not conclusion) — political sensitivity defense
- [Pre-phase]: Manual CSV seeds for v1 while automated ETL is built in Phase 6 — don't automate wrong data
- [01-01]: next.config stays as .mjs (not .ts) — avoids edge case with next-intl plugin; .mjs is stable for Next.js 14
- [01-01]: Tailwind v3 color tokens in theme.extend.colors, not CSS custom properties
- [01-01]: Production branch is master (not main) — Vercel connected to master; all future pushes must target master
- [01-03]: Use @supabase/ssr (not deprecated @supabase/auth-helpers-nextjs) — correct package for Next.js App Router SSR cookie handling
- [01-03]: Env var name is NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (not ANON_KEY) — matches Supabase dashboard "Publishable key" naming in newer projects
- [01-03]: QueryClient created in useState(() => new QueryClient(...)) — never at module scope (prevents shared state between SSR requests)
- [01-03]: QueryProvider placed inside NextIntlClientProvider in locale layout — all client components have both i18n and query context
- [01-04]: Migration files use fixed timestamps (20260226000001, 20260226000002) matching documented names — not CLI-generated to avoid timestamp mismatch
- [01-04]: sync_log.source_url is nullable (TEXT, no NOT NULL) — sync jobs may not always have a canonical URL; all other source columns are NOT NULL
- [01-04]: supabase db query not available in Scoop-installed CLI version — migration list confirmation accepted as sufficient push verification

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 2]: Eurostat dataset codes for each economy metric need manual research during planning (e.g., earn_ses_pub4s, ilc_li02) — cannot be assumed
- [Phase 3]: BOE historical data structure varies by year; pre-2015 data may require manual PDF extraction — scope to be assessed during Phase 3 planning
- [Phase 4]: Frontex data format changes annually; UNODC Excel structure varies — verify during immigration/crime planning

## Session Continuity

Last session: 2026-02-27
Stopped at: Completed 01-04-PLAN.md — Phase 1 Foundation complete; 6-table Postgres schema pushed to Supabase via migration files, EU-27 countries seeded
Resume file: None
