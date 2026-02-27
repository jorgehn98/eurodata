---
phase: 02-economy-section
plan: "02"
subsystem: api
tags: [tanstack-query, supabase, typescript, hooks, types]

# Dependency graph
requires:
  - phase: 02-01
    provides: "120 rows of Spain economic_indicators seeded (8 metrics, 2010-2024)"
  - phase: 01-03
    provides: "TanStack Query v5 QueryProvider and Supabase browser client configured"
provides:
  - "EconomyDataPoint type — data shape for all economy chart components"
  - "ECONOMY_METRICS constant — 8 metric strings matching DB seed values"
  - "EconomyMetric union type — compile-time validation of metric strings"
  - "SPAIN_COUNTRY_ID = 26 — named constant for country filter in all hooks"
  - "useEconomyMetric(metric) hook — TanStack Query v5 hook for economic_indicators"
affects: [02-03, 03-legislation-section, future-economy-charts]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Custom React hooks in src/hooks/ using TanStack Query v5 useQuery"
    - "Typed query keys ['economy', metric] for per-metric cache isolation"
    - "Supabase NUMERIC columns mapped to number | null (not filtered) in hook"

key-files:
  created:
    - src/types/economy.ts
    - src/lib/constants.ts
    - src/hooks/useEconomyMetric.ts
  modified: []

key-decisions:
  - "EconomyMetric union type from 'as const' array — compile-time error for mistyped metric strings"
  - "staleTime: 5 min in hook overrides global 1 min — economy data is stable within a session"
  - "NULL values preserved in mapped array (not filtered/coerced to 0) — charts render gaps for missing years"
  - "SPAIN_COUNTRY_ID = 26 as named constant — no hardcoded integers in hook logic"

patterns-established:
  - "Hook pattern: create Supabase client inside hook body (not module scope) — safe for SSR/concurrent requests"
  - "Type pattern: export union type from 'as const' array — single source of truth for valid string literals"
  - "Null pattern: map Supabase NUMERIC rows to number | null explicitly — never filter missing data points"

requirements-completed: [ECON-01, ECON-02, ECON-03, ECON-04, ECON-05, ECON-06]

# Metrics
duration: 10min
completed: 2026-02-27
---

# Phase 2 Plan 02: Economy Data Contract (Types + Hook) Summary

**EconomyDataPoint type and useEconomyMetric TanStack Query v5 hook — typed data contract layer for all five economy chart components**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-02-27T11:48:57Z
- **Completed:** 2026-02-27T11:58:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Defined `EconomyDataPoint` type matching DB columns (year, value, source, source_url) with `value: number | null` for gap rendering
- Created `ECONOMY_METRICS` constant array and `EconomyMetric` union type — mistyped metric strings are compile-time errors not runtime failures
- Built `useEconomyMetric(metric: EconomyMetric)` hook querying `economic_indicators` filtered by `SPAIN_COUNTRY_ID` and metric, with 5-min staleTime
- TypeScript strict mode and full Next.js production build pass with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Define types and constants** - `e0d1cd0` (feat)
2. **Task 2: Build the useEconomyMetric hook** - `fd86caa` (feat)

**Plan metadata:** `(pending — final docs commit)`

## Files Created/Modified

- `src/types/economy.ts` — EconomyDataPoint type, ECONOMY_METRICS constant (8 metric strings), EconomyMetric union type
- `src/lib/constants.ts` — SPAIN_COUNTRY_ID = 26 (ES is 26th in EU-27 alphabetical seed)
- `src/hooks/useEconomyMetric.ts` — TanStack Query v5 hook, queries economic_indicators for Spain by metric, preserves null values

## Decisions Made

- `EconomyMetric` union type derived from `ECONOMY_METRICS as const` — single source of truth; adding a new metric only requires updating the constant array
- `staleTime: 5 * 60 * 1000` (5 min) overrides global 1-min staleTime — economy data doesn't change mid-session, so 5 min is appropriate
- NULL values preserved in mapped return array (not filtered or coerced to 0) — chart components need null to render year gaps visually
- `createClient()` called inside hook body (not module scope) — correct pattern for SSR safety; each render gets a fresh client with current cookies

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Data contract layer complete — plan 02-03 (UI chart components) can build against `useEconomyMetric` and `EconomyDataPoint` without exploring the codebase
- Any client component can call `useEconomyMetric('median_salary_real')` and receive `{ data: EconomyDataPoint[], isPending: boolean, error: Error | null }`
- No blockers for 02-03

---
*Phase: 02-economy-section*
*Completed: 2026-02-27*
