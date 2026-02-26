# EuroData

## What This Is

Public, non-partisan dashboard that shows the real evolution of quality of life for European citizens using only official data sources. Displays economic indicators, political class compensation, immigration flows, and crime statistics — always with source attribution, never with editorial opinion. Bilingual (Spanish + English) from launch.

## Core Value

Citizens can verify, with official sources linked, how their purchasing power and quality of life have evolved over time compared to the political class that governs them.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Economy & Purchasing Power (Spain)**
- [ ] Median real salary adjusted for inflation (historical series)
- [ ] Effective total fiscal burden (IRPF + VAT + social contributions estimate)
- [ ] Housing price / median salary ratio by year
- [ ] CPI by category: food, energy, transport, housing
- [ ] Population percentage at risk of poverty

**Political Class**
- [ ] Salary of president, ministers, MPs vs national median salary
- [ ] Comparative evolution over time (politicians vs citizens)
- [ ] Number of advisors and political appointees per government
- [ ] Former presidents and ministers' pensions
- [ ] Documented revolving door cases (source: official records + press)

**Immigration**
- [ ] Legal and irregular migration flows by year and country
- [ ] Comparison between European countries
- [ ] Estimated cost in public services (official academic sources)

**Crime**
- [ ] Rates by crime type (homicide, robbery, sexual assault)
- [ ] Temporal evolution by country
- [ ] European comparison
- [ ] Breakdown by origin where official published data exists

**Country Comparator**
- [ ] Multi-country selector
- [ ] Side-by-side comparison of any metric
- [ ] European rankings by indicator

**Infrastructure**
- [ ] Automated data sync from Eurostat, INE, OCDE via Supabase Edge Functions + pg_cron
- [ ] Source URL and last updated date visible on every metric
- [ ] Bilingual interface (Spanish + English)

### Out of Scope

- Mobile app — web-first, responsive design sufficient for v1
- User accounts / personalization — public read-only dashboard, no auth needed
- Opinion/editorial content — strict data-only principle, no interpretation layer
- Real-time data — annual/quarterly cadence is sufficient for these metrics
- Paid features or subscriptions — personal/portfolio project, free forever

## Context

- **Existing infrastructure:** Supabase (PostgreSQL) and Vercel already in use by the developer — project builds on existing accounts
- **Data sensitivity strategy:** Data shown with source only, no methodological disclaimers or contextual framing — maximum neutrality
- **Political sensitivity:** The political class section and immigration/crime sections will inevitably attract scrutiny — the defense is strict sourcing (every figure links to its official origin)
- **Audience:** Any curious citizen, journalists needing sourced data, European residents — designed for all profiles
- **Language:** Spanish primary audience but bilingual ES/EN from day one for European reach

## Constraints

- **Tech stack:** Next.js 14 (App Router), TypeScript, Supabase (PostgreSQL), Vercel, Tremor + Recharts, TanStack Query, Tailwind CSS — fixed, no alternatives
- **Data sources:** Only official sources (Eurostat, INE, OCDE, Banco de España, Transparencia Internacional, UNODC, Frontex) — no unofficial or crowd-sourced data
- **Neutrality:** Zero editorial opinion — titles describe data, never interpret it; principle cannot be compromised
- **Reproducibility:** Any user must be able to verify every figure at its original source

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| All 5 sections in v1 | Full dashboard needed for the contrast effect to land — economy alone loses the political comparison angle | — Pending |
| Bilingual from day 1 | European audience requires English; retrofitting i18n later is painful | — Pending |
| Supabase as data store | Already in use, RLS native, REST API automatic, pg_cron for sync jobs | — Pending |
| Data without methodological disclaimers | Maximum data neutrality — source link is the only context needed | — Pending |
| Static data for initial metrics | Manual CSV seed for v1 while automated sync is built in parallel | — Pending |

---
*Last updated: 2026-02-26 after initialization*
