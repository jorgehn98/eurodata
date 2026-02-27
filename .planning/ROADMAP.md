# Roadmap: EuroData

## Overview

EuroData is built in seven phases that move from an immovable foundation (i18n + database schema) through four content sections (economy, political class, immigration/crime, comparator), then automate the data pipeline, and finally polish for launch. Each phase delivers a coherent, verifiable capability. The sequence is dictated by hard technical constraints (i18n cannot be retrofitted into App Router), data dependencies (the comparator requires multi-country data from earlier phases), and strategic priorities (political class section must ship early to validate the project's unique angle).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Next.js + Supabase + next-intl + DB schema — everything downstream depends on this
- [ ] **Phase 2: Economy Section** - Spain economy and purchasing power dashboard with interactive charts and source attribution
- [ ] **Phase 3: Political Class Section** - Politicians vs citizens comparison — the project's core differentiating angle
- [ ] **Phase 4: Immigration & Crime Sections** - Standardized flow and crime rate data using Eurostat/UNODC/Frontex only
- [ ] **Phase 5: Country Comparator** - Multi-country selector, side-by-side comparison, and EU rankings across all metrics
- [ ] **Phase 6: Data Automation & ETL** - Edge Functions + pg_cron replace manual seeds with automated, validated syncs
- [ ] **Phase 7: UI Polish, SEO & Launch** - Mobile pass, OG metadata, and shareable URL state for journalist distribution

## Phase Details

### Phase 1: Foundation
**Goal**: The project skeleton is deployed and immovable constraints are locked — i18n routing, database schema, and data quality conventions are established before any content section is built
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INFRA-07, INFRA-08, INFRA-09, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, UX-05, UX-06
**Success Criteria** (what must be TRUE):
  1. The site is live on Vercel at `/es/` and `/en/` routes — locale detection redirects to the correct language automatically
  2. The language switcher appears on every page and correctly switches between Spanish and English without a full page reload
  3. Every database table (`countries`, `economic_indicators`, `political_data`, `crime_statistics`, `migration_data`, `sync_log`) exists in Supabase and was created via migration files
  4. The `countries` table contains all EU-27 entries with country codes, bilingual names, and flag emoji
  5. Any UI string added to a component must use `t('key')` — hardcoding a Spanish or English word in a component fails a code review
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Next.js 14 App Router + TypeScript strict mode + Tailwind custom palette configured; Vercel CI/CD connected
- [x] 01-02-PLAN.md — next-intl v4 locale routing middleware, `[locale]` directory structure, language switcher, section navigation, translation file scaffold
- [x] 01-03-PLAN.md — Supabase @supabase/ssr browser + server client factories; TanStack Query provider wired into locale layout
- [x] 01-04-PLAN.md — Migration files for all 6 tables; `countries` table seeded with all EU-27 member states; data quality constraints enforced at DB level

### Phase 2: Economy Section
**Goal**: Users can explore Spain's economic and purchasing power story through interactive historical charts, with every figure linked to its official source
**Depends on**: Phase 1
**Requirements**: ECON-01, ECON-02, ECON-03, ECON-04, ECON-05, ECON-06, ECON-07, ECON-08, ETL-03, UX-02, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. User can view five distinct economic metrics as interactive time series charts covering at minimum 2014–2024 (median real salary, fiscal burden, housing ratio, CPI by category, poverty risk)
  2. Each chart shows source name and a clickable source URL that opens the official data page in a new tab
  3. Hovering on any chart data point shows the exact value, year, and source in a tooltip
  4. When data is missing for a year, the chart shows a visible gap — not a zero — with a "No data available" label
  5. Charts show a loading skeleton while data fetches — no blank flash or layout shift on page load
  6. The entire economy section renders correctly in both Spanish and English
**Plans**: TBD

Plans:
- [ ] 02-01: Economy data seed — CSV import scripts (Papa Parse) for Banco de España and INE sources; seed `economic_indicators` table with 10+ year history for all five metrics
- [ ] 02-02: Economy API layer — Supabase queries + TanStack Query hooks for all five economy metrics; ISR configuration
- [ ] 02-03: Economy UI — Economy page with five chart components (Recharts), source attribution display, tooltip implementation, null-gap handling, loading skeletons

### Phase 3: Political Class Section
**Goal**: Users can see the factual, year-by-year comparison between political compensation and citizen purchasing power in Spain — the core differentiating feature of EuroData
**Depends on**: Phase 2
**Requirements**: POLI-01, POLI-02, POLI-03, POLI-04, POLI-05, POLI-06, POLI-07, POLI-08
**Success Criteria** (what must be TRUE):
  1. User can view a single chart that plots politician salaries (president, ministers, MPs) against the national median salary on the same axis over time
  2. User can view the politician-to-median-salary ratio as its own time series, showing how many times the median salary each politician role earns
  3. User can view the count of political advisors and appointed positions broken down by government term with year granularity
  4. User can view former presidents' and ministers' pensions with source attribution linking to the official BOE entry
  5. User can view the revolving door case list — each entry links to an official or press source and has an associated year
  6. Every chart title describes the data axis only — no title implies a conclusion or editorial judgment
**Plans**: TBD

Plans:
- [ ] 03-01: Political data seed — manual data entry from BOE historical records and Transparencia Internacional into `political_data` table; covers president, ministers, MPs since 2010
- [ ] 03-02: Political API layer — queries and TanStack Query hooks for salary comparison, advisor counts, pensions, revolving door list
- [ ] 03-03: Political UI — comparison chart (politicians vs median), ratio time series, advisor count table, pensions display, revolving door list; neutral title enforcement

### Phase 4: Immigration & Crime Sections
**Goal**: Users can explore immigration flows and crime rates using only standardized international datasets, with methodology provenance visible on every metric
**Depends on**: Phase 3
**Requirements**: MIGR-01, MIGR-02, MIGR-03, MIGR-04, MIGR-05, MIGR-06, MIGR-07, CRIM-01, CRIM-02, CRIM-03, CRIM-04, CRIM-05, CRIM-06
**Success Criteria** (what must be TRUE):
  1. User can view legal migration flows (first residence permits) and irregular arrivals as separate time series for Spain, sourced exclusively from Eurostat and Frontex respectively
  2. User can select a subset of EU countries to compare migration flows side-by-side in a single chart
  3. User can view estimated public services costs with the academic source citation visible inline
  4. User can view crime rates per 100,000 inhabitants for homicide, robbery, and sexual assault for Spain over 10+ years, sourced from UNODC or Eurostat standardized datasets only
  5. User can compare crime rates across European countries for any crime type
  6. Every immigration and crime metric displays the source dataset code and a brief methodology note explaining the Eurostat permit type or UNODC legal definition used
**Plans**: TBD

Plans:
- [ ] 04-01: Immigration data seed — CSV imports from Eurostat migration datasets and Frontex; seed `migration_data` table for Spain and initial EU country set
- [ ] 04-02: Immigration UI — flows chart with country selector, irregular arrivals chart, public services cost display with citation
- [ ] 04-03: Crime data seed — CSV imports from UNODC and Eurostat crime datasets; seed `crime_statistics` table for Spain and initial EU country set
- [ ] 04-04: Crime UI — crime rate by type chart, temporal evolution chart, EU country comparison, origin breakdown where data exists

### Phase 5: Country Comparator
**Goal**: Users can construct their own EU country comparisons across any metric available in the dashboard and share the resulting view via URL
**Depends on**: Phase 4
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06
**Success Criteria** (what must be TRUE):
  1. User can select up to 5 EU countries via a multi-select dropdown and see data for all selected countries rendered on the same chart
  2. User can switch the active metric (any indicator from the economy, immigration, or crime sections) without losing the country selection
  3. User can view a sorted EU ranking table for any indicator, showing all countries for which data exists
  4. The selected countries and active metric are reflected in the URL (`?countries=ES,FR,DE&metric=median_salary`) — pasting the URL into a new tab restores the exact view
  5. The comparator works for at minimum Spain, France, Germany, Italy, Sweden, and Portugal across all available metrics
**Plans**: TBD

Plans:
- [ ] 05-01: Multi-country data backfill — ensure `economic_indicators`, `crime_statistics`, `migration_data` tables have records for France, Germany, Italy, Sweden, Portugal alongside Spain; use existing CSV import scripts
- [ ] 05-02: Comparator UI — multi-select country picker, metric selector, side-by-side chart, EU rankings table, URL state serialization and restoration

### Phase 6: Data Automation & ETL
**Goal**: The manual CSV seeds are replaced (and validated) by automated, idempotent sync pipelines — the site can refresh its own data without human intervention
**Depends on**: Phase 5
**Requirements**: ETL-01, ETL-02, ETL-04, ETL-05
**Success Criteria** (what must be TRUE):
  1. A Eurostat Edge Function runs on schedule (daily at 6 AM UTC via pg_cron), fetches the configured datasets, validates the response against a zod schema, and upserts to the database — a schema change from Eurostat causes a loud failure logged to `sync_log`, not a silent data corruption
  2. An INE Edge Function runs on schedule (weekly via pg_cron) with the same zod validation and idempotent upsert behavior
  3. Re-running any sync function multiple times produces the same database state — no duplicate rows
  4. The `sync_log` table records the timestamp, source, and success/failure status of every sync run — a developer can query it to see when each source was last successfully updated
**Plans**: TBD

Plans:
- [ ] 06-01: Eurostat Edge Function — zod schema for Eurostat API response, fetch + validate + transform + upsert logic, loud failure on schema mismatch
- [ ] 06-02: INE Edge Function — zod schema for INE API response, same validation/upsert pattern
- [ ] 06-03: pg_cron schedules + sync_log — configure daily/weekly cron triggers; `sync_log` table writes on every run; idempotency verified by test re-run

### Phase 7: UI Polish, SEO & Launch
**Goal**: The dashboard is fully mobile-accessible, discoverable by journalists via search and social sharing, and every page can be cited with a persistent URL
**Depends on**: Phase 6
**Requirements**: UX-01, UX-07
**Success Criteria** (what must be TRUE):
  1. Every page in the dashboard renders correctly at 375px viewport width — no horizontal overflow, no overlapping chart labels, no truncated navigation items
  2. Sharing a section URL on social media or a messaging app shows the correct OG title, description, and image — journalist can link directly to a specific metric page and it previews meaningfully
  3. Both `/es/` and `/en/` versions of each page have correct `hreflang` alternate links so search engines index both language versions independently
**Plans**: TBD

Plans:
- [ ] 07-01: Mobile responsive audit — viewport testing at 375px, 768px, 1024px; fix chart overflow, navigation collapse, typography scaling
- [ ] 07-02: SEO metadata — page-level OG tags, meta descriptions, hreflang alternate links for all routes in both locales

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete | 2026-02-27 |
| 2. Economy Section | 0/3 | Not started | - |
| 3. Political Class Section | 0/3 | Not started | - |
| 4. Immigration & Crime Sections | 0/4 | Not started | - |
| 5. Country Comparator | 0/2 | Not started | - |
| 6. Data Automation & ETL | 0/3 | Not started | - |
| 7. UI Polish, SEO & Launch | 0/2 | Not started | - |
