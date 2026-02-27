---
phase: 02-economy-section
plan: "01"
subsystem: database
tags: [papaparse, csv, supabase, etl, seed, economic-indicators, spain]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "economic_indicators table with UNIQUE(country_id, metric, year) constraint, countries table with Spain at id=26"
provides:
  - "120 rows of historical economy data in economic_indicators for Spain (2010-2024)"
  - "5 CSV source files in data/economy/ covering all 8 metric strings"
  - "Idempotent seed script scripts/seed-economy.ts using Papa Parse + Supabase upsert"
affects:
  - 02-economy-section (plans 02 and 03 depend on this data to build and test charts)
  - 06-etl-automation (same CSV structure will inform automated ETL design)

# Tech tracking
tech-stack:
  added:
    - papaparse ^5.x (CSV parsing, devDependency)
    - "@types/papaparse (TypeScript types, devDependency)"
    - dotenv ^17.3.1 (env loading for seed scripts, installed during checkpoint)
  patterns:
    - "Seed scripts use SUPABASE_SERVICE_ROLE_KEY (not anon/publishable key) to bypass RLS"
    - "dynamicTyping: false in Papa Parse — all values parsed explicitly via parseValue()"
    - "Empty string or 'null' in CSV maps to SQL NULL (never 0 for missing years)"
    - "Upsert with onConflict: 'country_id,metric,year' for idempotent reruns"
    - "Multi-metric CSVs use a metric column; single-metric CSVs pass metric at call site"

key-files:
  created:
    - data/economy/median-salary.csv
    - data/economy/fiscal-burden.csv
    - data/economy/housing-ratio.csv
    - data/economy/cpi-categories.csv
    - data/economy/poverty-risk.csv
    - scripts/seed-economy.ts
  modified:
    - package.json (added papaparse, @types/papaparse, dotenv devDependencies)

key-decisions:
  - "dotenv installed as devDependency (^17.3.1) — seed scripts run via tsx, not Next.js, so NEXT_PUBLIC_ env loading does not apply; dotenv.config() reads .env.local explicitly"
  - "SUPABASE_SERVICE_ROLE_KEY stored in .env.local (gitignored) and never committed — RLS blocks anon key on insert"
  - ".env.local URL corrected from .supabase.com to .supabase.co — wrong TLD caused connection failure during checkpoint"
  - "Missing years stored as empty string in CSV and mapped to NULL in DB — never 0, per pre-phase decision"
  - "Spain country_id=26 hardcoded (verified: 26th country alphabetically in EU-27 seed AT=1...ES=26...SE=27)"

patterns-established:
  - "ETL pattern: CSV files in data/{domain}/ + seed script in scripts/seed-{domain}.ts"
  - "Service role key pattern: seed scripts always use SUPABASE_SERVICE_ROLE_KEY, never publishable key"
  - "Idempotency pattern: all DB writes use upsert with onConflict on the UNIQUE constraint"
  - "Missing data pattern: empty CSV value -> parseValue() returns null -> stored as SQL NULL"

requirements-completed: [ETL-03]

# Metrics
duration: ~90min (including human-action checkpoint for SUPABASE_SERVICE_ROLE_KEY)
completed: 2026-02-27
---

# Phase 2 Plan 01: Economy Data Seed Summary

**Papa Parse CSV import seeding 120 rows of Spain economic indicators (2010-2024) across 8 metrics into Supabase via idempotent upsert script**

## Performance

- **Duration:** ~90 min (including human-action checkpoint for service role key provisioning)
- **Started:** 2026-02-27T09:00:00Z (estimated)
- **Completed:** 2026-02-27T11:31:16Z
- **Tasks:** 2 (plus Task 1.5 seed script write)
- **Files modified:** 7 (6 created, 1 modified)

## Accomplishments

- 5 CSV data files created in `data/economy/` covering all 8 economy metric strings for Spain (2010-2024) with official INE, OECD, and Eurostat data
- Seed script `scripts/seed-economy.ts` written using Papa Parse + `@supabase/supabase-js` direct client (service role, bypasses RLS)
- 120 rows successfully upserted into `economic_indicators` table — 15 rows per metric, 8 metrics (4 CPI variants counted as 60 rows)
- Idempotency confirmed: second run produced identical output with no errors
- Missing years (e.g., 2024 salary, 2024 poverty) stored as NULL per data design rules

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create CSV data files** - `1871eb2` (feat)
2. **Task 1.5 / Task 2: Write seed script** - `24156d6` (feat)
3. **Task 2: Run seed script** - human-verified (no new commit — DB state confirmed, script already committed)

## Files Created/Modified

- `data/economy/median-salary.csv` - INE real median salary 2010-2024, EUR/year (15 rows, 2024=NULL)
- `data/economy/fiscal-burden.csv` - OECD total tax burden % GDP 2010-2024 (15 rows, 2024=NULL)
- `data/economy/housing-ratio.csv` - INE housing price / median salary ratio 2010-2024, ratio (15 rows, all values present)
- `data/economy/cpi-categories.csv` - Eurostat HICP CPI 2010-2024 for 4 categories, index 2015=100 (60 rows total)
- `data/economy/poverty-risk.csv` - Eurostat ilc_li02 at-risk-of-poverty % 2010-2024 (15 rows, 2024=NULL)
- `scripts/seed-economy.ts` - Standalone tsx seed script: Papa Parse parse -> Supabase upsert
- `package.json` - Added papaparse, @types/papaparse, dotenv as devDependencies

## Decisions Made

- **dotenv as devDependency:** Seed scripts run via `npx tsx`, not the Next.js runtime. Next.js does not load `.env.local` for tsx scripts, so `dotenv.config({ path: '.env.local' })` must be called explicitly. Package `dotenv@^17.3.1` added during the checkpoint phase when the script failed to read env vars.
- **Service role key in .env.local:** `SUPABASE_SERVICE_ROLE_KEY` placed in `.env.local` (already gitignored). RLS blocks inserts from the anon/publishable key — service role is required for all seed/ETL scripts.
- **URL typo corrected (.com -> .co):** `.env.local` had `SUPABASE_URL` ending in `.supabase.com` instead of `.supabase.co`. Corrected during checkpoint — caused all Supabase calls to fail silently with connection error.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] dotenv package missing — seed script could not read .env.local**
- **Found during:** Task 2 (Run seed script) — human-action checkpoint
- **Issue:** `npx tsx scripts/seed-economy.ts` failed because `dotenv` was imported but not in package.json; tsx does not load Next.js env automatically
- **Fix:** `npm install --save-dev dotenv@^17.3.1` — added during checkpoint resolution
- **Files modified:** package.json, package-lock.json (committed in `24156d6`)
- **Verification:** Script ran successfully after dotenv install and URL fix
- **Committed in:** `24156d6` (Task 1.5 / seed script commit)

**2. [Rule 1 - Bug] SUPABASE_URL had wrong TLD (.com instead of .co)**
- **Found during:** Task 2 (Run seed script) — human-action checkpoint
- **Issue:** `.env.local` contained `https://[project].supabase.com` — invalid hostname, all Supabase calls failed
- **Fix:** User corrected `.env.local` URL to `https://[project].supabase.co` during checkpoint
- **Files modified:** `.env.local` (not committed — gitignored)
- **Verification:** Seed script completed successfully with corrected URL
- **Committed in:** Not committed (env file is gitignored by design)

---

**Total deviations:** 2 auto-fixed (1 blocking dependency, 1 env config bug)
**Impact on plan:** Both fixes were necessary for the script to execute at all. No scope creep — fixes confined to env loading and dependency resolution.

## Issues Encountered

- `SUPABASE_SERVICE_ROLE_KEY` was not yet set in `.env.local` — required a human-action checkpoint for the user to retrieve it from Supabase Dashboard > Settings > API. This is expected for first-time DB write operations requiring elevated privileges.
- dotenv was listed in the seed script import but not installed — required adding as devDependency during checkpoint.
- `.env.local` Supabase URL had wrong TLD (`.com` vs `.co`) — silent connection failure until corrected.

## User Setup Required

None for subsequent runs — `.env.local` is now correctly configured with `SUPABASE_SERVICE_ROLE_KEY` and correct Supabase URL.

## Next Phase Readiness

- `economic_indicators` table now contains 120 rows for Spain across all 8 metric strings — all chart queries in plan 02-02 can be built and tested against real data
- Seed script is idempotent — can be re-run safely if data corrections are needed
- CSV files serve as source-of-truth for Spain v1 data; automated ETL (Phase 6) will replace this pattern for future countries
- Plans 02-02 (chart API routes) and 02-03 (chart UI components) are unblocked

---
*Phase: 02-economy-section*
*Completed: 2026-02-27*
