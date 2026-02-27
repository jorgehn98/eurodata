# Requirements: EuroData

**Defined:** 2026-02-26
**Core Value:** Ciudadanos pueden verificar, con fuentes oficiales enlazadas, cómo ha evolucionado su poder adquisitivo y calidad de vida frente a la clase política que les gobierna.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Infrastructure

- [x] **INFRA-01**: Project is deployed to Vercel with automatic CI/CD on push to main
- [x] **INFRA-02**: Next.js 14 (App Router) with TypeScript configured with strict mode
- [x] **INFRA-03**: Supabase project connected (browser client + server client for SSR)
- [x] **INFRA-04**: Bilingual routing configured via next-intl (`/es/...` and `/en/...` routes with locale detection middleware)
- [x] **INFRA-05**: All UI strings use translation keys (`t('key')`) — zero hardcoded Spanish or English in components
- [x] **INFRA-06**: Database schema created via migration files: `countries`, `economic_indicators`, `political_data`, `crime_statistics`, `migration_data` tables
- [x] **INFRA-07**: `countries` lookup table seeded with EU-27 country codes, names (ES + EN), and flag emoji
- [x] **INFRA-08**: Tailwind CSS configured with custom design tokens for the dashboard palette
- [x] **INFRA-09**: TanStack Query provider configured at root layout

### Economy Section

- [ ] **ECON-01**: User can view median real salary adjusted for inflation as a historical time series (Spain, 2010–present)
- [ ] **ECON-02**: User can view effective total fiscal burden estimate (IRPF + VAT + social contributions) as a historical time series (Spain)
- [ ] **ECON-03**: User can view housing price / median salary ratio by year as a historical time series (Spain)
- [ ] **ECON-04**: User can view CPI broken down by category (food, energy, transport, housing) as a historical time series (Spain)
- [ ] **ECON-05**: User can view percentage of population at risk of poverty as a historical time series (Spain)
- [ ] **ECON-06**: Each economic metric displays source name, source URL, and last updated date
- [ ] **ECON-07**: User can hover on chart data points to see exact value, year, and source
- [ ] **ECON-08**: Economy section is available in Spanish and English

### Political Class Section

- [ ] **POLI-01**: User can view annual salary of president, ministers, and MPs compared to national median salary on the same chart (Spain, historical)
- [ ] **POLI-02**: User can view the ratio of politician salary to median citizen salary over time (Spain)
- [ ] **POLI-03**: User can view number of political advisors and appointed positions per government term
- [ ] **POLI-04**: User can view former presidents' and ministers' pensions with source attribution
- [ ] **POLI-05**: User can view documented revolving door cases linked to official/media source (static list, manually curated)
- [ ] **POLI-06**: All political figures' data has year granularity (no "current value only")
- [ ] **POLI-07**: Chart titles are strictly neutral — describe the data axis, not the conclusion
- [ ] **POLI-08**: Political section is available in Spanish and English

### Immigration Section

- [ ] **MIGR-01**: User can view legal migration flows (first residence permits) by year for Spain and selected EU countries
- [ ] **MIGR-02**: User can view irregular migration arrivals by year (Frontex data, EU external borders)
- [ ] **MIGR-03**: User can compare migration flows across European countries via a selector
- [ ] **MIGR-04**: User can view estimated public services cost from official academic sources with citation
- [ ] **MIGR-05**: All immigration data uses Eurostat-standardized datasets (not raw national figures with different methodologies)
- [ ] **MIGR-06**: Each metric displays source dataset code and methodology note (Eurostat permit type definition)
- [ ] **MIGR-07**: Immigration section is available in Spanish and English

### Crime Section

- [ ] **CRIM-01**: User can view crime rates per 100,000 inhabitants by crime type (homicide, robbery, sexual assault) for Spain
- [ ] **CRIM-02**: User can view temporal evolution of crime rates over 10+ years (Spain)
- [ ] **CRIM-03**: User can compare crime rates across European countries
- [ ] **CRIM-04**: Where official published data exists, user can view breakdown by perpetrator origin (UNODC or national statistics that publish this)
- [ ] **CRIM-05**: All crime data uses UNODC or Eurostat standardized datasets (not national ministry raw figures with different legal definitions)
- [ ] **CRIM-06**: Crime section is available in Spanish and English

### Country Comparator

- [ ] **COMP-01**: User can select multiple EU countries (up to 5) via a multi-select dropdown
- [ ] **COMP-02**: User can compare any metric side-by-side across selected countries
- [ ] **COMP-03**: User can see EU ranking for any indicator (sorted by value, showing all countries with data)
- [ ] **COMP-04**: Selected countries are reflected in the URL (shareable state: `/es/comparador?countries=ES,FR,DE&metric=median_salary`)
- [ ] **COMP-05**: Comparator is available in Spanish and English
- [ ] **COMP-06**: Initial country dataset covers at minimum: Spain, France, Germany, Italy, Sweden, Portugal

### Data Quality & Trust

- [x] **DATA-01**: Every metric in the DB stores `source TEXT` (source name) and `source_url TEXT` (direct link to source)
- [x] **DATA-02**: Missing data is stored as NULL, never as 0 — charts show gaps not false zeros
- [x] **DATA-03**: All metric values normalized to canonical units during ingestion (EUR/year for salaries, rate per 100k for crime, etc.)
- [x] **DATA-04**: Historical data seed covers at minimum 10 years for each metric (2014–2024 or available range)
- [x] **DATA-05**: A `sync_log` table records when each data source was last successfully updated

### Data Ingestion (ETL)

- [ ] **ETL-01**: Supabase Edge Function for Eurostat sync validates API response with zod schema — fails loudly on schema change rather than silently corrupting data
- [ ] **ETL-02**: Supabase Edge Function for INE sync validates API response with zod schema
- [ ] **ETL-03**: CSV import scripts (Papa Parse) for Banco de España, Transparencia Internacional, UNODC sources
- [ ] **ETL-04**: pg_cron schedules for automated sync: Eurostat (daily at 6 AM UTC), INE (weekly)
- [ ] **ETL-05**: Upsert uses `ON CONFLICT DO UPDATE` — re-running sync is idempotent

### UI/UX

- [ ] **UX-01**: All pages render correctly on mobile (375px minimum viewport)
- [ ] **UX-02**: All charts show loading skeleton while data fetches — no blank flash
- [ ] **UX-03**: All charts show "No data available for [Country] / [Year]" message when data is NULL
- [ ] **UX-04**: All source links open in new tab (`target="_blank" rel="noopener noreferrer"`)
- [x] **UX-05**: Language switcher accessible from all pages — switches between `/es/...` and `/en/...`
- [x] **UX-06**: Dashboard has navigation between all 5 sections (Sidebar or top nav)
- [ ] **UX-07**: Page-level OG tags and meta descriptions for journalist link sharing

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Analytics & Growth

- **V2-01**: Downloadable CSV/JSON per dataset
- **V2-02**: Embeddable chart widgets for media outlets (iframe-safe render route)
- **V2-03**: Methodology page per data source (extended academic credibility)
- **V2-04**: "How does this compare?" EU percentile rank callouts (e.g., "Spain ranks 18th of 27 in...")

### Extended Coverage

- **V2-05**: Additional EU countries beyond initial 6 (all EU-27)
- **V2-06**: Regional data within Spain (CCAA breakdown where Eurostat/INE provides it)
- **V2-07**: OCDE data integration for international comparisons beyond EU

### Platform Features

- **V2-08**: User-configurable email alerts on significant metric changes (requires auth)
- **V2-09**: Dark mode

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts / authentication | Read-only public dashboard; no personalization needed for v1 |
| User comments or discussion | Moderation nightmare on politically sensitive data; violates zero-opinion principle |
| AI-generated interpretation of data | Violates core neutrality principle; generates controversy regardless of accuracy |
| Real-time data feeds | Political/economic data updates annually or quarterly; real-time is false precision |
| Mobile app (iOS/Android) | Web-first; responsive web covers mobile use case |
| User-submitted data corrections | Quality control impossible; only official sources accepted |
| Social media auto-commentary | Auto-generated text on sensitive data = liability |
| Paid features or subscriptions | Personal/portfolio project, free forever |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| INFRA-05 | Phase 1 | Complete |
| INFRA-06 | Phase 1 | Complete |
| INFRA-07 | Phase 1 | Complete |
| INFRA-08 | Phase 1 | Complete |
| INFRA-09 | Phase 1 | Complete |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Complete |
| DATA-04 | Phase 1 | Complete |
| DATA-05 | Phase 1 | Complete |
| UX-05 | Phase 1 | Complete |
| UX-06 | Phase 1 | Complete |
| ECON-01 | Phase 2 | Pending |
| ECON-02 | Phase 2 | Pending |
| ECON-03 | Phase 2 | Pending |
| ECON-04 | Phase 2 | Pending |
| ECON-05 | Phase 2 | Pending |
| ECON-06 | Phase 2 | Pending |
| ECON-07 | Phase 2 | Pending |
| ECON-08 | Phase 2 | Pending |
| ETL-03 | Phase 2 | Pending |
| UX-02 | Phase 2 | Pending |
| UX-03 | Phase 2 | Pending |
| UX-04 | Phase 2 | Pending |
| POLI-01 | Phase 3 | Pending |
| POLI-02 | Phase 3 | Pending |
| POLI-03 | Phase 3 | Pending |
| POLI-04 | Phase 3 | Pending |
| POLI-05 | Phase 3 | Pending |
| POLI-06 | Phase 3 | Pending |
| POLI-07 | Phase 3 | Pending |
| POLI-08 | Phase 3 | Pending |
| MIGR-01 | Phase 4 | Pending |
| MIGR-02 | Phase 4 | Pending |
| MIGR-03 | Phase 4 | Pending |
| MIGR-04 | Phase 4 | Pending |
| MIGR-05 | Phase 4 | Pending |
| MIGR-06 | Phase 4 | Pending |
| MIGR-07 | Phase 4 | Pending |
| CRIM-01 | Phase 4 | Pending |
| CRIM-02 | Phase 4 | Pending |
| CRIM-03 | Phase 4 | Pending |
| CRIM-04 | Phase 4 | Pending |
| CRIM-05 | Phase 4 | Pending |
| CRIM-06 | Phase 4 | Pending |
| COMP-01 | Phase 5 | Pending |
| COMP-02 | Phase 5 | Pending |
| COMP-03 | Phase 5 | Pending |
| COMP-04 | Phase 5 | Pending |
| COMP-05 | Phase 5 | Pending |
| COMP-06 | Phase 5 | Pending |
| ETL-01 | Phase 6 | Pending |
| ETL-02 | Phase 6 | Pending |
| ETL-04 | Phase 6 | Pending |
| ETL-05 | Phase 6 | Pending |
| UX-01 | Phase 7 | Pending |
| UX-07 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 61 total
- Mapped to phases: 61
- Unmapped: 0

---
*Requirements defined: 2026-02-26*
*Last updated: 2026-02-27 after Phase 1 completion — all Phase 1 requirements marked complete*
