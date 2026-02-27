---
phase: 02-economy-section
plan: "03"
subsystem: ui
tags: [recharts, next-intl, tanstack-query, tailwindcss, react, area-chart, i18n]

# Dependency graph
requires:
  - phase: 02-economy-section/02-02
    provides: EconomyDataPoint type, useEconomyMetric hook, EconomyMetric union
  - phase: 01-foundation/01-03
    provides: QueryProvider wrapping layout, next-intl NextIntlClientProvider
  - phase: 01-foundation/01-01
    provides: chart.* Tailwind color tokens in theme.extend.colors
provides:
  - Interactive economy dashboard at /es/economia and /en/economia
  - EconomyChart: reusable single-metric AreaChart with null-gap support and custom tooltip
  - CpiChart: multi-series AreaChart merging four CPI metrics onto one chart
  - EconomyChartSkeleton: animate-pulse shimmer card matching chart dimensions
  - EconomySection: client component composing all five chart cards
  - Full Spanish/English translations in Economy namespace
affects: [03-politics-section, 04-immigration-section, 05-crime-section, 06-etl-pipeline]

# Tech tracking
tech-stack:
  added: [recharts@^3.7.0]
  patterns:
    - Server Component page.tsx fetches translations via getTranslations and passes as props to client EconomySection
    - Chart components are 'use client' — never in Server Components (Recharts requirement)
    - XAxis uses type="number" with explicit tick array every 2 years to prevent decimal year labels
    - connectNulls={false} preserves null gaps as visible line breaks
    - Data currency (ECON-06) derived from Math.max(...data.map(d => d.year)) — no schema change needed
    - CpiChart merges series by year into flat Record objects before passing to AreaChart data prop

key-files:
  created:
    - src/components/economy/EconomyChart.tsx
    - src/components/economy/EconomyChartSkeleton.tsx
    - src/components/economy/EconomySection.tsx
    - src/app/[locale]/economia/page.tsx
  modified:
    - messages/es.json
    - messages/en.json
    - package.json
    - package-lock.json

key-decisions:
  - "recharts connectNulls={false} (default) preserves null as visible gap — do NOT set true"
  - "dot={false} hides line markers; activeDot={{ r: 4, strokeWidth: 0 }} shows hover dot only"
  - "Data through [year] label derived from max(data.year) — satisfies ECON-06 without schema change"
  - "CpiChart merges four EconomyDataPoint[] arrays by year into Record<string, number|null> for Recharts"
  - "EconomySection receives all labels as props from page.tsx — no useTranslations inside client component"
  - "Recharts Tooltip does not fire for null data points (GitHub #5552) — accepted for v1; gap + footer note communicates missing data"

patterns-established:
  - "Chart section pattern: Server Component page.tsx calls getTranslations → passes Labels object to client section component"
  - "Chart card pattern: ChartCard wrapper with title, source link, Data through [year], and gaps note footer"
  - "Skeleton pattern: EconomyChartSkeleton with animate-pulse matching exact card/chart dimensions"
  - "Multi-series merge pattern: flatMap all years → Set dedup → sort → map to Record with null fallback"

requirements-completed: [ECON-06, ECON-07, ECON-08, UX-02, UX-03, UX-04]

# Metrics
duration: 25min
completed: 2026-02-27
---

# Phase 2 Plan 3: Economy Section UI Summary

**Five interactive Recharts AreaChart cards at /es/economia and /en/economia with null-gap handling, source attribution links, "Data through [year]" currency labels, loading skeletons, and full Spanish/English i18n**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-02-27T00:00:00Z
- **Completed:** 2026-02-27
- **Tasks:** 2/2 automated tasks complete (Task 3 is human verification checkpoint)
- **Files modified:** 8

## Accomplishments

- Installed recharts@^3.7.0 and built EconomyChart (single-metric) and CpiChart (multi-series) components
- Built EconomySection client component composing all five chart cards with proper loading/error/empty states
- Created /[locale]/economia page route; build confirms /es/economia and /en/economia generated at 158KB bundle
- Added Economy namespace to both es.json and en.json with all chart titles, CPI series labels, data currency strings
- Satisfied ECON-06 (data currency) by deriving "Data through [year]" from max(data.year) — no schema needed

## Task Commits

Each task was committed atomically:

1. **Task 1: Install recharts and build chart components** - `54c4754` (feat)
2. **Task 2: Build EconomySection, page route, and translations** - `141f804` (feat)

## Files Created/Modified

- `src/components/economy/EconomyChart.tsx` - Reusable AreaChart (EconomyChart + CpiChart exports), null-gap support, custom tooltip
- `src/components/economy/EconomyChartSkeleton.tsx` - animate-pulse shimmer skeleton matching 320px chart card height
- `src/components/economy/EconomySection.tsx` - Client component composing 5 chart cards, loading/empty state handling
- `src/app/[locale]/economia/page.tsx` - Server Component page; getTranslations('Economy') props passed to EconomySection
- `messages/es.json` - Added Economy namespace (title, intro, chart titles, CPI labels, gapsNote, dataThrough)
- `messages/en.json` - Added Economy namespace (English equivalents)
- `package.json` - Added recharts@^3.7.0 dependency
- `package-lock.json` - Updated lockfile

## Decisions Made

- `recharts connectNulls={false}` preserves null as a visible gap (not a zero dip) — plan requirement
- `dot={false}` / `activeDot={{ r: 4, strokeWidth: 0 }}` — no markers on line, hover-only dot per CONTEXT.md
- "Data through [year]" derived from `Math.max(...data.map(d => d.year))` — satisfies ECON-06 without any DB schema change
- `CpiChart` merges four `EconomyDataPoint[]` arrays by year into flat `Record<string, number|null>` objects for AreaChart data prop
- All translation strings passed as props from Server Component — `useTranslations` not called inside client EconomySection

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required beyond what was already set up in prior phases (Supabase env vars).

## Next Phase Readiness

- Economy dashboard UI is complete. Awaiting human verification (Task 3 checkpoint).
- After verification approval, Phase 2 is complete and Phase 3 (Politics Section) is unblocked.
- The same chart section pattern (Server Component page + client section component receiving labels as props) should be reused for Phase 3 and beyond.

---
*Phase: 02-economy-section*
*Completed: 2026-02-27*

## Self-Check: PASSED

- FOUND: src/components/economy/EconomyChart.tsx
- FOUND: src/components/economy/EconomyChartSkeleton.tsx
- FOUND: src/components/economy/EconomySection.tsx
- FOUND: src/app/[locale]/economia/page.tsx
- FOUND: messages/es.json
- FOUND: messages/en.json
- FOUND: .planning/phases/02-economy-section/02-03-SUMMARY.md
- FOUND commit: 54c4754 (Task 1)
- FOUND commit: 141f804 (Task 2)
