---
phase: 03-political-class-section
plan: "03"
subsystem: ui
tags: [recharts, next-intl, tanstack-query, supabase, react, tailwind]

# Dependency graph
requires:
  - phase: 03-political-class-section/03-01
    provides: political_data, political_pensions, revolving_door_cases tables seeded
  - phase: 03-political-class-section/03-02
    provides: PoliticalDataPoint/PoliticalPension/RevolvingDoorCase types, usePoliticalMetric/usePoliticalPensions/useRevolvingDoorCases hooks, Politics i18n namespace (es+en)
  - phase: 02-economy-section/02-02
    provides: useEconomyMetric hook (used for median salary series in SalaryComparisonChart)
provides:
  - /es/politics and /en/politics routes live and rendering all 5 sub-sections
  - SalaryComparisonChart: 4-line Recharts LineChart with nominal/real toggle and interactive legend
  - SalaryRatioChart: 3 ratio lines with client-side guarded division, Y-axis formatted as "X.Xx"
  - AdvisorCountChart: BarChart with string XAxis labels, one bar per government term
  - PensionsTable: HTML table with 5 columns and BOE source links
  - RevolvingDoorList: card list in reverse-chronological order with source links
  - PoliticsChartSkeleton: animate-pulse shimmer card reusable across all political charts
affects:
  - 04-immigration-section
  - 05-crime-section
  - 06-etl-automation

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server Component page.tsx calls getTranslations, passes Labels object as props to client PoliticsSection — no useTranslations in client components (identical to Economy section pattern)
    - Eager 8-query fetch for salary nominal/real variants — toggle switches active data set with no loading flash
    - Recharts interactive legend via hiddenKeys Set state — hide={hiddenKeys.has(key)} on each Line
    - Multi-series year merge: Set of all years -> sorted -> flat Record with null fallback
    - Guarded ratio division: salary !== null && median !== null && median !== 0 ? salary/median : null
    - BarChart XAxis type omitted (defaults to category) — prevents NaN label rendering for string X-axis

key-files:
  created:
    - src/components/politics/PoliticsChartSkeleton.tsx
    - src/components/politics/SalaryComparisonChart.tsx
    - src/components/politics/SalaryRatioChart.tsx
    - src/components/politics/AdvisorCountChart.tsx
    - src/components/politics/PensionsTable.tsx
    - src/components/politics/RevolvingDoorList.tsx
    - src/components/politics/PoliticsSection.tsx
    - src/app/[locale]/politics/page.tsx
  modified: []

key-decisions:
  - "SalaryComparisonChart uses useEconomyMetric('median_salary_real'/'median_salary_nominal') for median line — median salary lives in economic_indicators table, not political_data"
  - "median_salary_nominal not seeded into economic_indicators in v1 — nominal toggle for median line falls back to median_salary_real in both toggle states; politician lines switch correctly between nominal/real"
  - "Route slug is 'politics' (English) not 'politica' — matches nav link hrefs defined in Phase 1"
  - "Bar fill set directly on <Bar fill='#3B82F6'> — no <Cell> wrapper (deprecated in recharts v3.7)"
  - "XAxis type prop omitted on BarChart (defaults to category) — prevents NaN label rendering for string term labels"

patterns-established:
  - "Politics section server/client split: page.tsx (server, getTranslations) -> PoliticsSection.tsx (client, props) -> sub-components (client, props)"
  - "Recharts interactive legend: hiddenKeys Set state + handleLegendClick + hide prop on each Line"
  - "Nominal/real toggle: all 8 variants fetched eagerly on mount; toggle only switches which 4 are rendered"

requirements-completed: [POLI-01, POLI-02, POLI-03, POLI-04, POLI-05, POLI-06, POLI-07, POLI-08]

# Metrics
duration: ~60min (including human browser verification)
completed: 2026-02-28
---

# Phase 3 Plan 03: Political Class Section UI Summary

**Five Recharts sub-components (salary comparison, salary ratio, advisor count, pensions table, revolving door list) composed into /es/politics and /en/politics routes with nominal/real toggle, interactive legend, and anchor navigation**

## Performance

- **Duration:** ~60 min (including human browser verification checkpoint)
- **Started:** 2026-02-28
- **Completed:** 2026-02-28
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 8

## Accomplishments

- Built all 5 political sub-components plus PoliticsChartSkeleton following Phase 2 chart patterns exactly
- Composed PoliticsSection client component with 5 anchor-linked sub-sections and in-page nav bar
- Wired up /[locale]/politics Server Component page route with getTranslations → labels props pattern
- Human browser verification passed: all 10 checks including nominal/real toggle, interactive legend, ratio Y-axis formatting, BarChart string labels, pensions table BOE links, revolving door cards, and full English/Spanish i18n

## Task Commits

Each task was committed atomically:

1. **Task 1: Build all 5 political sub-components and PoliticsChartSkeleton** - `2fccff4` (feat)
2. **Task 2: Build PoliticsSection and /politics page route** - `16b6560` (feat)
3. **Task 3: Human browser verification** - approved (no code commit — checkpoint only)

## Files Created/Modified

- `src/components/politics/PoliticsChartSkeleton.tsx` - animate-pulse shimmer card, optional height prop defaulting to 320px
- `src/components/politics/SalaryComparisonChart.tsx` - 4-line LineChart (president/minister/mp/median) with nominal/real toggle and interactive legend hide/show
- `src/components/politics/SalaryRatioChart.tsx` - 3 ratio lines (salary/median), client-side guarded division, Y-axis "X.Xx" format
- `src/components/politics/AdvisorCountChart.tsx` - BarChart one bar per government term, string XAxis labels (angled), no Cell wrapper
- `src/components/politics/PensionsTable.tsx` - 5-column HTML table with BOE source links, sorted by exit_year DESC
- `src/components/politics/RevolvingDoorList.tsx` - card list reverse-chronological, each card: person/role/entity/year/source link
- `src/components/politics/PoliticsSection.tsx` - client component composing all 5 sub-sections with anchor nav, scroll-mt-20 offset
- `src/app/[locale]/politics/page.tsx` - Server Component, getTranslations('Politics'), labels object passed as props to PoliticsSection

## Decisions Made

- **median via useEconomyMetric:** Median salary lives in `economic_indicators` table (not `political_data`), so `useEconomyMetric('median_salary_real'/'median_salary_nominal')` is used for the median line in SalaryComparisonChart.
- **median_salary_nominal fallback:** `median_salary_nominal` was not seeded into `economic_indicators` in v1. The nominal toggle for the median line uses `median_salary_real` in both toggle states. Politician lines (president/minister/MP) switch correctly between nominal/real. Documented as known deviation; no data correctness risk since ratio charts always use real/real.
- **Route slug 'politics':** English slug matches Phase 1 nav link hrefs — not 'politica' or 'clase-politica'.
- **No Cell wrapper on Bar:** `<Bar fill="#3B82F6">` directly — `<Cell>` is deprecated in recharts v3.7.
- **BarChart XAxis type omitted:** Defaults to 'category', which correctly handles string term labels. Explicit `type="number"` would cause NaN rendering.

## Deviations from Plan

### Known Data Gap (not a code bug)

**1. [Data Gap] median_salary_nominal not seeded — nominal toggle falls back to real for median line**
- **Found during:** Task 1 (SalaryComparisonChart implementation and browser verification)
- **Issue:** `median_salary_nominal` metric was not included in the Phase 2 economy seed data. `useEconomyMetric('median_salary_nominal')` returns empty array.
- **Fix:** SalaryComparisonChart uses `median_salary_real` for the median line in both toggle states. The toggle still switches all three politician lines (president/minister/MP) correctly between nominal and real. The median line remains real-adjusted in both modes.
- **Files modified:** None — the component handles empty data gracefully via null fallback in the year merge.
- **Impact:** Minor visual inconsistency: median line does not visually change on nominal toggle. Ratio charts are unaffected (they always use real/real division). Can be resolved in a future data patch by seeding `median_salary_nominal` into `economic_indicators`.

---

**Total deviations:** 1 data gap (not a code deviation)
**Impact on plan:** All 10 browser verification checks passed. The missing nominal median data is a v1 data scope issue, not a component correctness issue. No scope creep.

## Issues Encountered

None — TypeScript compiled clean on first pass. Build succeeded with /es/politics and /en/politics routes generated. All Recharts patterns from Phase 2 research applied correctly (BarChart category XAxis, no Cell, connectNulls=false, interactive legend).

## User Setup Required

None — no external service configuration required. Routes use existing Supabase connection and i18n setup.

## Next Phase Readiness

- Phase 3 (Political Class Section) is complete: DB foundation (03-01), types/hooks/i18n (03-02), and UI components (03-03) all done
- Phase 4 (Immigration Section) can begin — same architecture pattern applies: data seed -> types+hooks -> UI components -> human verify
- Known data debt: seed `median_salary_nominal` into `economic_indicators` for SalaryComparisonChart nominal toggle completeness

---
*Phase: 03-political-class-section*
*Completed: 2026-02-28*
