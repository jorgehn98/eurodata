---
phase: 03-political-class-section
plan: "02"
subsystem: ui
tags: [typescript, tanstack-query, supabase, i18n, next-intl, hooks, types]

# Dependency graph
requires:
  - phase: 03-political-class-section
    plan: "01"
    provides: political_data, political_pensions, revolving_door_cases tables seeded in Supabase
  - phase: 02-economy-section
    provides: useEconomyMetric pattern (createClient inside hook, staleTime, null preservation)
provides:
  - src/types/politics.ts — PoliticalDataPoint, PoliticalPension, RevolvingDoorCase types; POLITICAL_METRICS const (7 items); PoliticalMetric union
  - src/hooks/usePoliticalMetric.ts — TanStack Query hook for political_data table filtered by country_id + metric
  - src/hooks/usePoliticalPensions.ts — TanStack Query hook for political_pensions table ordered by exit_year DESC
  - src/hooks/useRevolvingDoorCases.ts — TanStack Query hook for revolving_door_cases table ordered by year DESC
  - messages/es.json Politics namespace — all Spanish UI strings for political section
  - messages/en.json Politics namespace — all English UI strings for political section
affects: [03-03-political-ui, any future political data queries, salary comparison charts, pensions table, revolving door list]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PoliticalMetric union derived from POLITICAL_METRICS as const array — single source of truth, compile-time error for mistyped strings (mirrors EconomyMetric pattern)"
    - "Entity hooks (usePoliticalPensions, useRevolvingDoorCases) omit country_id filter — Spain-specific tables have no country_id column in v1"
    - "Politics i18n namespace mirrors Economy namespace structure — anchors, toggle, charts, series, pensions, revolvingDoor sub-keys"

key-files:
  created:
    - src/types/politics.ts
    - src/hooks/usePoliticalMetric.ts
    - src/hooks/usePoliticalPensions.ts
    - src/hooks/useRevolvingDoorCases.ts
  modified:
    - messages/es.json
    - messages/en.json

key-decisions:
  - "usePoliticalPensions and useRevolvingDoorCases omit country_id filter — political_pensions and revolving_door_cases tables are Spain-specific (no country_id column in v1 schema)"
  - "Politics i18n namespace chart titles are neutral axis descriptions only (POLI-07) — 'Salario bruto anual (EUR)' describes Y-axis unit, not a conclusion"
  - "POLITICAL_METRICS const array as single source of truth for PoliticalMetric union type — compile-time error if metric string is mistyped in any consumer"

patterns-established:
  - "Pattern: Entity hooks (non-metric tables) follow same TanStack Query structure as metric hooks but omit country_id filter and use table-specific queryKey segments like 'pensions' or 'revolving-door'"
  - "Pattern: i18n Politics namespace keys (anchors, toggle, series) align with UI component requirements for salary comparison charts with nominal/real toggle"

requirements-completed: [POLI-01, POLI-02, POLI-03, POLI-04, POLI-05, POLI-06, POLI-07, POLI-08]

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 03 Plan 02: Political Class Types, Hooks, and i18n Summary

**TypeScript types (PoliticalDataPoint, PoliticalPension, RevolvingDoorCase), three TanStack Query hooks for political_data/political_pensions/revolving_door_cases, and full Politics i18n namespace in both Spanish and English**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-27T22:59:58Z
- **Completed:** 2026-02-27T23:01:55Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created `src/types/politics.ts` with all 4 exported types/constants matching DB column names exactly — POLITICAL_METRICS const array with 7 metric strings, PoliticalMetric union derived from it
- Created 3 TanStack Query hooks following the useEconomyMetric pattern exactly — createClient() inside hook body, staleTime 5 min, null preservation, explicit column selection and cast
- Added Politics namespace to both `messages/es.json` and `messages/en.json` with all UI strings for salary section (title, intro, anchors, toggle, charts, series, pensions, revolvingDoor sub-keys)
- `npx tsc --noEmit` passes with zero errors across all new files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create politics types and hooks** - `8a48380` (feat)
2. **Task 2: Add Politics namespace to i18n translation files** - `79231cb` (feat)

**Plan metadata:** (docs commit — see state update)

## Files Created/Modified
- `src/types/politics.ts` — PoliticalDataPoint, PoliticalPension, RevolvingDoorCase types; POLITICAL_METRICS const (7 items); PoliticalMetric union
- `src/hooks/usePoliticalMetric.ts` — queries political_data filtered by country_id + metric, queryKey ['politics', metric]
- `src/hooks/usePoliticalPensions.ts` — queries political_pensions ordered by exit_year DESC, queryKey ['politics', 'pensions']
- `src/hooks/useRevolvingDoorCases.ts` — queries revolving_door_cases ordered by year DESC, queryKey ['politics', 'revolving-door']
- `messages/es.json` — Politics namespace added with 13 top-level keys and full sub-key structure
- `messages/en.json` — Politics namespace added with matching English translations

## Decisions Made
- `usePoliticalPensions` and `useRevolvingDoorCases` omit country_id filter — these tables are Spain-specific with no country_id column (unlike political_data which has country_id for multi-country future use)
- Chart title strings in i18n namespace are neutral axis descriptions only (POLI-07 compliance) — "Salario bruto anual (EUR)" describes the Y-axis unit, "Ratio salario político / salario mediano" describes the mathematical relationship, not a conclusion

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All type contracts and hooks are stable — Plan 03-03 (UI components) can begin immediately
- usePoliticalMetric accepts any PoliticalMetric string; compile-time error if consumer mistypes
- Both i18n namespaces complete — UI components can call useTranslations('Politics') and access all keys
- 03-03 UI plan should pass all labels from Server Component page.tsx as props (same pattern as Economy section)

---
*Phase: 03-political-class-section*
*Completed: 2026-02-27*

## Self-Check: PASSED

- FOUND: src/types/politics.ts
- FOUND: src/hooks/usePoliticalMetric.ts
- FOUND: src/hooks/usePoliticalPensions.ts
- FOUND: src/hooks/useRevolvingDoorCases.ts
- FOUND: .planning/phases/03-political-class-section/03-02-SUMMARY.md
- FOUND commit: 8a48380 (Task 1)
- FOUND commit: 79231cb (Task 2)
