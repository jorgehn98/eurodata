# Project Research Summary

**Project:** EuroData
**Domain:** Civic data transparency dashboard (EU political, economic, crime, immigration statistics)
**Researched:** 2026-02-26
**Confidence:** HIGH

## Executive Summary

EuroData is a public data dashboard in a well-established category (civic transparency, open government data) pioneered by projects like Our World in Data and Gapminder — but with a distinctive angle: integrating political class compensation directly alongside citizen quality-of-life metrics. This contrast is the project's unique hook and doesn't exist in any major EU-focused platform today.

The user's pre-selected stack (Next.js 14, Supabase, Tremor + Recharts, TanStack Query, Vercel) is well-suited for this domain with one critical gap: **i18n (next-intl) must be added from day 1**. The bilingual ES/EN commitment combined with Next.js App Router makes retrofitting i18n later extremely costly — the entire routing tree must be restructured.

The primary risks are (1) external API schema changes silently corrupting data — mitigated by zod validation in all ETL functions, and (2) political controversy framing — mitigated by strict neutral chart title conventions. Data unit normalization across sources (Eurostat reports EUR/year, INE reports EUR/month) is a silent correctness risk that must be addressed in the database schema phase.

## Key Findings

### Recommended Stack

The user's chosen stack is validated and appropriate. Key additions:

**Core technologies:**
- **Next.js 14 App Router**: ISR (`revalidate`) for near-static data sections — fast loads, no per-user DB queries
- **next-intl 3.x**: CRITICAL addition — only i18n library fully compatible with Next.js App Router + Server Components. Add in Phase 1.
- **zod 3.x**: CRITICAL addition for ETL validation — catches Eurostat/INE API schema changes before they corrupt data
- **Papa Parse 5.x**: CSV parsing for Banco de España, Transparencia Internacional, UNODC sources

Full details: `.planning/research/STACK.md`

### Expected Features

**Must have (table stakes):**
- Interactive charts with hover tooltips and zoom
- Source attribution with clickable URL on every metric
- Last updated date per dataset
- Historical time series (10+ years)
- Mobile-responsive layout
- Shareable URL state for comparisons

**Should have (competitive):**
- Politicians vs Citizens comparison view — the core differentiator
- Multi-country EU side-by-side comparator
- Methodology page per data source (academic credibility)
- Downloadable CSV/JSON for each dataset

**Defer (v2+):**
- Embeddable chart widgets for media
- Email alerts on significant metric changes
- Additional EU country coverage beyond initial 5

Full details: `.planning/research/FEATURES.md`

### Architecture Approach

Three-layer architecture: external APIs → ETL pipeline (Supabase Edge Functions) → PostgreSQL → Next.js Server Components with ISR. TanStack Query handles client-side dynamic interactions (country selector). All external API calls happen in ETL pipeline only — never from user requests. This prevents Eurostat/INE downtime from affecting the live site and respects rate limits.

**Major components:**
1. **ETL Pipeline** (Edge Functions + pg_cron) — Extract, validate with zod, transform units, upsert to DB
2. **PostgreSQL** (Supabase) — Normalized time-series storage with composite indexes on `(country_code, metric, year)`
3. **Next.js App Router** — Server Components with ISR for static sections; TanStack Query for dynamic comparator

Full details: `.planning/research/ARCHITECTURE.md`

### Critical Pitfalls

1. **API schema changes** — Eurostat changes JSON structure silently; use zod validation in all ETL functions or syncs corrupt data
2. **i18n not set up from day 1** — Retrofitting next-intl into existing Next.js App Router requires restructuring entire `app/` directory; 2-3 days of refactoring
3. **Data unit normalization** — Eurostat (EUR/year) vs INE (EUR/month) creates 12x comparison errors; normalize to canonical units in ETL
4. **Missing data stored as zero** — Eurostat uses `:` for missing values; must store as NULL not 0 or charts show false zeros
5. **Political framing in chart titles** — Factually accurate but value-laden titles attract bias accusations; strict neutral language rule required

Full details: `.planning/research/PITFALLS.md`

## Implications for Roadmap

### Phase 1: Foundation & Infrastructure
**Rationale:** i18n, DB schema, and data pipeline architecture must be decided first — everything else depends on them. Retrofitting is expensive.
**Delivers:** Next.js + Supabase + next-intl configured; DB schema with all tables; CI/CD on Vercel
**Addresses:** All i18n pitfalls; unit normalization rules established in schema; migration system in place
**Avoids:** i18n retrofit pitfall; DB schema without migrations pitfall

### Phase 2: Economy Section (Spain, historical data)
**Rationale:** Highest-value section; simplest data sourcing (Eurostat + INE have good APIs); validates ETL pipeline
**Delivers:** Economy page with 5+ metrics, 10+ year history, interactive charts, source attribution
**Uses:** Eurostat API client + zod validation; TanStack Query; Recharts
**Avoids:** Unit normalization errors (EUR/year canonical); missing data as zero pitfall

### Phase 3: Political Class Section
**Rationale:** The core differentiator — must be built early to validate the project's unique angle
**Delivers:** Political compensation vs citizen comparison; historical salary evolution; advisors count; revolving doors
**Uses:** BOE historical data (manual seed); `political_data` table with year granularity
**Avoids:** Political framing pitfall (neutral chart titles enforced)

### Phase 4: Immigration & Crime Sections
**Rationale:** Politically sensitive sections with methodology complexity — benefit from established patterns
**Delivers:** Immigration flows; crime rate by type; both using Eurostat/UNODC standardized datasets only
**Avoids:** Crime methodology inconsistency pitfall (Eurostat dataset only, not national sources)

### Phase 5: EU Country Comparator
**Rationale:** Requires data from all target countries first; comparator is the final layer
**Delivers:** Multi-country selector; side-by-side comparison; EU rankings per indicator
**Uses:** Eurostat data already ingested for EU countries

### Phase 6: Data Automation & Quality
**Rationale:** ETL automation replaces manual seeds; adds sync monitoring
**Delivers:** Edge Functions for Eurostat, INE automated sync; pg_cron schedules; sync_log table; error alerting
**Implements:** Full ETL architecture with zod validation

### Phase 7: SEO, Performance & Launch
**Rationale:** Journalist discovery depends on SEO; share-ability is the distribution mechanism
**Delivers:** OG tags, hreflang, structured data; performance optimization; shareable URL state; downloadable CSVs

### Phase Ordering Rationale

- i18n in Phase 1 because App Router routing is impossible to restructure later
- Economy before political data because ETL patterns are established first on simpler data
- Immigration/Crime after political because they require established neutral framing conventions
- Comparator last because it requires multi-country data from multiple preceding phases
- Automation after manual seed proves data quality — don't automate wrong data

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Economy ETL):** Eurostat dataset codes need manual research (`databrowser` UI); INE series IDs require API exploration
- **Phase 3 (Political Data):** BOE historical data structure varies by year; may need custom scraping for pre-2010 data
- **Phase 4 (Crime/Immigration):** UNODC and Frontex data formats vary significantly year to year

Phases with standard patterns (research already covered):
- **Phase 1 (Foundation):** next-intl + Supabase + Next.js setup is well-documented
- **Phase 5 (Comparator):** Standard multi-select filter UI + URL state — no novel patterns
- **Phase 7 (SEO/Launch):** Next.js metadata API is well-documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | User's choices validated; next-intl and zod additions are well-established |
| Features | HIGH | Benchmarked against Our World in Data, Gapminder, Transparencia Internacional |
| Architecture | HIGH | ETL + ISR pattern is standard for data dashboards; Supabase Edge Functions proven |
| Pitfalls | HIGH | All pitfalls based on real failure modes in this specific domain |

**Overall confidence:** HIGH

### Gaps to Address

- **Eurostat dataset codes for each metric:** Need to research specific codes during Phase 2 planning (e.g., `earn_ses_pub4s` for public sector salaries, `ilc_li02` for poverty risk)
- **INE series IDs:** INE API requires knowing specific series codes; research during Phase 2 planning
- **Political historical data availability:** Pre-2015 data may require manual BOE PDF extraction; assess depth during Phase 3 planning

## Sources

### Primary (HIGH confidence)
- Eurostat REST API docs (ec.europa.eu/eurostat/web/json-and-unicode-web-services) — API format and dataset organization
- next-intl docs (next-intl.dev) — App Router compatibility confirmed
- Supabase docs (supabase.com) — Edge Functions, pg_cron, SSR client
- Our World in Data (ourworldindata.org) — feature benchmark, architectural reference

### Secondary (MEDIUM confidence)
- INE API docs (ine.es/dyngs/DataLab) — REST API endpoints and series format
- Gapminder (gapminder.org) — UX patterns for country comparators
- Transparencia Internacional España — political data presentation patterns

### Tertiary (LOW confidence)
- Frontex data format — changes annually; verify during immigration phase planning
- UNODC Excel format — structure varies; parse carefully during crime phase planning

---
*Research completed: 2026-02-26*
*Ready for roadmap: yes*
