---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in_progress
last_updated: "2026-02-28T00:00:00.000Z"
progress:
  total_phases: 7
  completed_phases: 3
  total_plans: 10
  completed_plans: 10
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-26)

**Core value:** Citizens can verify, with official sources linked, how their purchasing power and quality of life have evolved over time compared to the political class that governs them.
**Current focus:** Phase 4 — Immigration Section (next up)

## Current Position

Phase: 3 of 7 (Political Class Section) — COMPLETE
Plan: 3 of 3 — COMPLETE
Status: Phase 3 complete — all three plans done (03-01 DB foundation, 03-02 types/hooks/i18n, 03-03 UI components); Phase 4 (Immigration Section) is next
Last activity: 2026-02-28 — Plan 03-03 complete: all 5 political sub-components, PoliticsSection, /politics page route built and human-verified in browser

Progress: [███████░░░] 57%

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: ~45 min (including checkpoint wait time)
- Total execution time: ~3.5 hours (human-action checkpoints included)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 4/4 | ~2.75h | ~40m |
| 02-economy-section | 3/3 | ~125m | ~42m |

**Recent Trend:**
- Last 5 plans: 02-03 (chart UI + page route), 03-01 (political DB seed), 03-02 (types + hooks + i18n), 03-03 (political UI components + page route)
- Trend: On track — Phase 3 fully complete; Phase 4 (Immigration Section) ready to begin

*Updated after each plan completion*
| Phase 02-economy-section P03 | 70min | 3 tasks | 8 files |
| Phase 03-political-class P01 | 5min | 2 tasks | 9 files |
| Phase 03-political-class-section P02 | 2min | 2 tasks | 6 files |
| Phase 03-political-class-section P03 | 60min | 3 tasks | 8 files |

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
- [02-01]: dotenv must be installed explicitly for tsx seed scripts — Next.js does not load .env.local for non-Next.js runtimes; dotenv.config({ path: '.env.local' }) required
- [02-01]: SUPABASE_SERVICE_ROLE_KEY required for all seed/ETL scripts — anon key blocked by RLS on insert; service role key retrieved from Supabase Dashboard > Settings > API
- [02-01]: Papa Parse dynamicTyping must be false in all seed scripts — explicit parseValue() function handles NULL mapping from empty CSV strings
- [02-02]: EconomyMetric union type derived from ECONOMY_METRICS as const array — single source of truth; compile-time error for mistyped metric strings
- [02-02]: staleTime: 5 min in useEconomyMetric overrides global 1 min — economy data is stable within a session
- [02-02]: NULL values preserved in mapped hook return (not filtered/coerced to 0) — chart components need null to render year gaps
- [02-02]: createClient() called inside hook body (not module scope) — safe for SSR/concurrent requests
- [Phase 02-economy-section]: recharts connectNulls=false preserves null gaps as visible line breaks — do not set true
- [Phase 02-economy-section]: Data through [year] label derived from max(data.year) — satisfies ECON-06 without schema change
- [Phase 02-economy-section]: EconomySection receives all labels as props from Server Component page.tsx — no useTranslations in client components
- [Phase 02-economy-section]: CpiChart merges four EconomyDataPoint[] by year into flat Record objects for AreaChart data prop
- [02-03]: Route folder named after English slug (economy), not Spanish (economia) — matches nav link hrefs defined in Phase 1
- [03-01]: political_pensions and revolving_door_cases UNIQUE constraints defined inline in CREATE TABLE DDL — not via separate ALTER TABLE; migration applied once cleanly
- [03-01]: advisor_count uses year_start as the year column key — Rajoy II minority government (2016, no data) merged with Rajoy II main term to avoid duplicate year=2016 collision on (country_id,metric,year) unique constraint
- [03-01]: salary CSVs use multi-metric format year,metric,value,unit,source,source_url — allows nominal and real variants in same file (same pattern as cpi-categories.csv from Phase 2)
- [Phase 03-political-class-section]: usePoliticalPensions and useRevolvingDoorCases omit country_id filter — political_pensions and revolving_door_cases are Spain-specific tables with no country_id column in v1
- [Phase 03-political-class-section]: Politics i18n namespace chart titles are neutral axis descriptions only (POLI-07 compliant) — 'Salario bruto anual (EUR)' describes Y-axis unit, not a conclusion
- [03-03]: SalaryComparisonChart uses useEconomyMetric for median salary line — median lives in economic_indicators, not political_data
- [03-03]: median_salary_nominal not seeded in v1 — nominal median toggle falls back to real; politician lines switch correctly; ratio charts unaffected (always use real/real)
- [03-03]: Route slug 'politics' (English) not 'politica' — matches Phase 1 nav link hrefs
- [03-03]: Bar fill set directly on <Bar fill="..."> — no <Cell> wrapper (deprecated in recharts v3.7)
- [03-03]: BarChart XAxis type prop omitted (defaults to category) — prevents NaN rendering for string term labels

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 3]: BOE historical data structure varies by year; pre-2015 data may require manual PDF extraction — scope to be assessed during Phase 3 planning
- [Phase 4]: Frontex data format changes annually; UNODC Excel structure varies — verify during immigration/crime planning

## Session Continuity

Last session: 2026-02-28
Stopped at: Completed 03-03-PLAN.md — Phase 3 complete; Phase 4 (Immigration Section) is next
Resume file: None
