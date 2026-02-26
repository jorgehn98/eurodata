# Feature Research

**Domain:** Civic data transparency dashboard (political + economic + crime + immigration statistics)
**Researched:** 2026-02-26
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in any data dashboard. Missing these = product feels broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Interactive charts (zoom, hover tooltips) | Every modern data site (Our World in Data, Gapminder) has this | MEDIUM | Recharts handles this natively |
| Source attribution on every data point | Core trust mechanism — users Google-verify suspicious numbers | LOW | Must be visible without extra clicks |
| Last updated date per dataset | Users need to know data freshness before citing it | LOW | Store `updated_at` in DB; display inline |
| Mobile-responsive layout | >50% traffic on mobile, even for data-heavy sites | MEDIUM | Tailwind + Tremor handles most of this |
| Historical time series (at least 10 years) | Single-year data is meaningless without context | HIGH | Requires proper historical ingestion |
| Country/region selection | Even single-country dashboards need this for comparison context | MEDIUM | Zustand + URL params |
| Loading states on data fetch | Tables/charts that blank-flash destroy trust | LOW | TanStack Query skeleton states |
| Empty state handling | "No data available for this year/country" needs graceful messaging | LOW | Often forgotten in first pass |
| Page-level SEO (title, description, OG tags) | Journalists share links — broken OG cards lose distribution | LOW | Next.js metadata API |
| Shareable URL state | User selects France/Germany comparison → URL reflects it → shareable | MEDIUM | URL search params for filters |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Politicians vs Citizens comparison view | Core hook — no mainstream site does this integrated with economic data | HIGH | Requires political DB + economic DB join/visualization |
| Downloadable data (CSV/JSON) | Journalists and researchers need raw data; signals confidence in sources | LOW | Supabase direct query or presigned URL |
| Multi-country side-by-side comparator | Gapminder does this but not for EU political class data | HIGH | Country selector UI + parallel data fetch |
| Embedded chart widgets | Media outlets can embed specific charts | HIGH | iframe-safe render route; defer to v2 |
| Methodology page per dataset | Differentiates from low-quality aggregators; builds academic credibility | MEDIUM | Static MDX page per data source |
| Change-over-time highlighting | "This metric changed X% since [year]" computed automatically | MEDIUM | Derived column or computed on frontend |
| "How does this compare" contextual callout | Automatic percentile rank ("Spain ranks 18th of 27 EU countries in...") | HIGH | Requires all-country data to compute |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| User comments / discussion | Increases engagement | Moderation nightmare on politically sensitive topics; destroys "zero opinion" brand | None — keep it data-only |
| Real-time data updates | "Live" feels modern | Political/economic data is annual or quarterly; real-time is false precision | Clear "Data updated: Q3 2024" labels |
| AI interpretation of data | "What does this mean?" | Violates core neutrality principle; generates controversy | Source links + methodology docs |
| Social sharing with auto-generated commentary | Viral potential | AI/auto-generated text on sensitive data = liability | Share raw URL + chart screenshot |
| User-submitted data corrections | Community sourcing | Quality control impossible; opens to manipulation | Official source only, with changelog |
| Dark/editorial framing in chart titles | More engaging | Violates "zero opinion" principle | Neutral descriptive titles only |

## Feature Dependencies

```
[Time series charts]
    └──requires──> [Historical data in DB (10+ years)]
                       └──requires──> [ETL pipeline or manual seed]

[Country comparator]
    └──requires──> [Multi-country data in DB]
                       └──requires──> [Eurostat sync (not just INE)]

[Politicians vs Citizens view]
    └──requires──> [political_data table]
    └──requires──> [economic_indicators table]
    └──requires──> [Synchronized year ranges in both tables]

[Shareable URL state]
    └──requires──> [URL search params for country/year/metric filters]

[Bilingual UI]
    └──requires──> [next-intl setup from Phase 1]
    └──enhances──> [SEO] (hreflang tags, locale-specific URLs)

[Downloadable data]
    └──enhances──> [Source attribution] (natural extension)
    └──conflicts──> [Data rate limits] (Supabase free tier limits)
```

### Dependency Notes

- **Historical data requires ETL early:** Can't retrofit 10 years of history after launch — data ingestion architecture must be designed in Phase 1
- **Bilingual requires next-intl from the start:** Retrofitting i18n into an existing Next.js app is extremely painful — every string must be extracted
- **Country comparator requires multi-country data:** Phase 1 Spain-only data must be schema-compatible with future EU countries

## MVP Definition

The user has specified all 5 sections must be live for v1. Given that, priority within v1:

### Launch With (v1)

- [ ] Economy section (Spain) with 5+ historical metrics — **validates core concept**
- [ ] Political class section with salary comparison — **the hook that differentiates**
- [ ] Immigration section with annual flow data — **completes the scope**
- [ ] Crime statistics section — **completes the scope**
- [ ] EU country comparator (at least 5 major countries) — **European reach**
- [ ] Source attribution on every data point — **non-negotiable trust element**
- [ ] Bilingual ES/EN — **committed from day 1**
- [ ] Mobile responsive layout — **majority of traffic**
- [ ] Shareable URL state for comparisons — **journalist sharing is key distribution**

### Add After Validation (v1.x)

- [ ] Downloadable CSV/JSON — add when journalists start citing the site
- [ ] Methodology pages per data source — when credibility becomes a concern
- [ ] "How does this compare" EU ranking callouts — after all-country data exists
- [ ] Automated data sync (Eurostat Edge Functions) — replace manual seed when proven

### Future Consideration (v2+)

- [ ] Embedded chart widgets for media — complex iframe sandboxing
- [ ] Additional EU countries beyond initial 5 — depends on data availability
- [ ] Email alerts on significant metric changes — requires auth/accounts

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Economic indicators (Spain, historical) | HIGH | MEDIUM | P1 |
| Politicians vs Citizens comparison | HIGH | MEDIUM | P1 |
| Source attribution per metric | HIGH | LOW | P1 |
| Bilingual (ES/EN) | HIGH | MEDIUM | P1 |
| Immigration section | MEDIUM | MEDIUM | P1 |
| Crime section | MEDIUM | MEDIUM | P1 |
| EU country comparator | HIGH | HIGH | P1 |
| Historical time series charts | HIGH | MEDIUM | P1 |
| Shareable URL state | MEDIUM | LOW | P1 |
| Downloadable data | MEDIUM | LOW | P2 |
| Automated ETL sync | MEDIUM | HIGH | P2 |
| Methodology docs | MEDIUM | LOW | P2 |
| Embedded chart widgets | LOW | HIGH | P3 |

## Competitor Feature Analysis

| Feature | Our World in Data | Gapminder | Transparencia Internacional | Our Approach |
|---------|-------------------|-----------|-----------------------------|--------------|
| Political class data | Not present | Not present | Corruption index only | Full political compensation vs median citizen |
| Interactive charts | Excellent | Excellent | Static PDFs | Recharts interactive |
| Country comparisons | Excellent | Excellent | Limited | EU-focused comparator |
| Source attribution | Excellent | Good | Good | Source link on every figure |
| Bilingual | English only | English + languages | Multiple | Spanish + English |
| Mobile | Good | Good | Poor | First-class responsive |
| Immigration + crime data | Economic focus | Economic focus | Not present | Integrated |

## Sources

- Our World in Data (ourworldindata.org) — feature benchmark for data transparency dashboards
- Gapminder (gapminder.org) — country comparator UX patterns
- Transparencia Internacional España (transparencia.org.es) — political data presentation
- Portal Transparencia Gobierno de España — existing political data UX
- Eurostat Statistics (ec.europa.eu/eurostat) — data API and existing visualization patterns

---
*Feature research for: civic data transparency dashboard*
*Researched: 2026-02-26*
