---
phase: 03-political-class-section
plan: "01"
subsystem: database
tags: [supabase, csv, papa-parse, seed-script, political-data, pensions, revolving-door]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: DB schema (political_data, economic_indicators tables with unique constraints)
  - phase: 02-economy-section
    provides: seed-economy.ts pattern (dotenv, Papa Parse, upsert pattern)
provides:
  - political_pensions table with UNIQUE(name, exit_year) constraint — 8 rows of former president/minister pensions
  - revolving_door_cases table with UNIQUE(person_name, entity_moved_to, year) constraint — 22 documented cases
  - political_data populated: president/minister/mp salary nominal+real 2010–2024 (90 rows), advisor_count per government term (7 rows)
  - economic_indicators populated: median_salary_nominal 2010–2024 (15 rows)
  - scripts/seed-politics.ts — idempotent seed script for all political data
affects: [03-02-political-ui, any future political data queries, salary comparison charts]

# Tech tracking
tech-stack:
  added: []
  patterns: [Papa Parse CSV seed script with onConflict upsert, political_data generic metric table for salary time-series, entity tables (political_pensions, revolving_door_cases) for records not fitting metric schema]

key-files:
  created:
    - supabase/migrations/20260227000003_political_tables.sql
    - data/politics/president-salary.csv
    - data/politics/minister-salary.csv
    - data/politics/mp-salary.csv
    - data/politics/advisor-count.csv
    - data/politics/pensions.csv
    - data/politics/revolving-door.csv
    - data/economy/median-salary-nominal.csv
    - scripts/seed-politics.ts
  modified: []

key-decisions:
  - "political_pensions and revolving_door_cases UNIQUE constraints defined in migration DDL (not via ALTER TABLE after push) — migration applied once, constraints in-place from creation"
  - "advisor_count uses year_start as the year column for political_data upsert key — merges Rajoy II minority government into Rajoy II main term to avoid duplicate year_start=2016 collision with (country_id,metric,year) unique constraint"
  - "revolving-door.csv source_url fixed to single URL per row — multiple comma-separated URLs in source_url field would cause Papa Parse to detect extra columns"
  - "salary CSV files use year,metric,value,unit,source,source_url columns (multi-metric format) not single-metric format — allows president_salary_nominal and president_salary_real in same CSV file"

patterns-established:
  - "Pattern: Entity tables (political_pensions, revolving_door_cases) for records that don't fit the generic (country_id, metric, year, value) schema — use when data is a named entity not a time-series metric"
  - "Pattern: UNIQUE constraint name follows PostgreSQL convention: {table}_{col1}_{col2}_key — specified in CREATE TABLE DDL for clarity"
  - "Pattern: advisor_count seed maps term to year_start, stores term label in source column — allows chart to label bars without extra schema columns"

requirements-completed: [POLI-01, POLI-02, POLI-03, POLI-04, POLI-05, POLI-06]

# Metrics
duration: 5min
completed: 2026-02-27
---

# Phase 03 Plan 01: Political Data Foundation Summary

**Two new Supabase tables (political_pensions, revolving_door_cases) created and seeded alongside full salary time-series (president/minister/MP) and median nominal salary via idempotent Papa Parse seed script**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-27T22:50:47Z
- **Completed:** 2026-02-27T22:55:50Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Created `supabase/migrations/20260227000003_political_tables.sql` with `political_pensions` and `revolving_door_cases` tables including UNIQUE constraints for idempotent upsert — applied successfully via `supabase db push`
- Seeded 90 salary rows (president/minister/MP × nominal/real × 2010–2024) + 7 advisor_count rows into `political_data`, 8 pension rows into `political_pensions`, 22 revolving door cases into `revolving_door_cases`, and 15 `median_salary_nominal` rows into `economic_indicators`
- `scripts/seed-politics.ts` verified idempotent — second run produces identical output with no duplicate rows

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Supabase migration and all CSV data files** - `c079d2b` (feat)
2. **Task 2: Write and run seed-politics.ts script** - `4f683ee` (feat)

## Files Created/Modified
- `supabase/migrations/20260227000003_political_tables.sql` — DDL for political_pensions and revolving_door_cases with UNIQUE constraints
- `data/politics/president-salary.csv` — President nominal + real salary 2010–2024 (BOE source)
- `data/politics/minister-salary.csv` — Minister nominal + real salary 2010–2024 (BOE source)
- `data/politics/mp-salary.csv` — MP nominal + real salary 2010–2024 (Congreso source)
- `data/politics/advisor-count.csv` — Advisor count per government term 2004–present (Portal Transparencia)
- `data/politics/pensions.csv` — Former president/minister pensions 1996–2018 (BOE source)
- `data/politics/revolving-door.csv` — 22 documented revolving door cases with verifiable press/official source URLs
- `data/economy/median-salary-nominal.csv` — Nominal median salary 2010–2024 (INE EES source)
- `scripts/seed-politics.ts` — Idempotent seed script with 5 seeding functions

## Decisions Made
- UNIQUE constraints placed inline in CREATE TABLE DDL rather than via separate ALTER TABLE — migration applied once cleanly, constraints in place from table creation
- Advisor count maps `year_start` as the `year` key — Rajoy II (minority, no count data) merged with Rajoy II (main term) to avoid duplicate `year=2016` collision on `(country_id,metric,year)` unique constraint
- Salary CSVs use multi-metric format `year,metric,value,unit,source,source_url` — allows both nominal and real variants in one file, consistent with `cpi-categories.csv` pattern from Phase 2

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed duplicate URLs in revolving-door.csv source_url column**
- **Found during:** Task 1 (CSV data file creation)
- **Issue:** Four rows had two comma-separated URLs in the source_url field (e.g., `https://transparencia.gob.es/,https://...`). Papa Parse treats commas as field separators, which would cause parse errors or extra columns.
- **Fix:** Kept only the most specific/verifiable press URL for each affected row; removed generic transparencia.gob.es prefix URL
- **Files modified:** `data/politics/revolving-door.csv`
- **Verification:** CSV parses correctly — 22 rows × 5 columns confirmed
- **Committed in:** `4f683ee` (included in Task 2 commit via advisor-count.csv fix)

**2. [Rule 1 - Bug] Fixed advisor_count duplicate year_start conflict**
- **Found during:** Task 2 (seed script execution)
- **Issue:** Rajoy II (minority, 2016) and Rajoy III (2016–2018) both had `year_start=2016`, causing `ON CONFLICT DO UPDATE command cannot affect row a second time` error from Supabase
- **Fix:** Removed the minority Rajoy II entry (no count data anyway); renamed Rajoy III to Rajoy II in the CSV to reflect the consolidated government period 2016–2018
- **Files modified:** `data/politics/advisor-count.csv`
- **Verification:** Seed script exits 0 with 7 advisor_count rows; second run (idempotency) produces same result
- **Committed in:** `4f683ee` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - bug fixes)
**Impact on plan:** Both fixes required for seed script correctness. No scope change. CSV data integrity improved.

## Issues Encountered
- Rajoy II / Rajoy III 2016 year collision in advisor_count data — resolved by consolidating the two entries into one term period (2016–2018)

## User Setup Required
None - no external service configuration required. Supabase credentials were already configured in `.env.local`.

## Next Phase Readiness
- All political data is queryable from Supabase — Phase 03-02 (Political UI) can begin immediately
- political_data: 6 salary metrics × 15 years = 90 rows; advisor_count: 7 terms
- political_pensions: 8 rows (former presidents + notable ministers)
- revolving_door_cases: 22 rows sorted newest-first
- economic_indicators: median_salary_nominal 2010–2024 added for nominal toggle in salary comparison chart

---
*Phase: 03-political-class-section*
*Completed: 2026-02-27*
