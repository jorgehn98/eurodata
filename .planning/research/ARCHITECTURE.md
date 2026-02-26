# Architecture Research

**Domain:** Civic data transparency dashboard (ETL pipeline + PostgreSQL + Next.js)
**Researched:** 2026-02-26
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     EXTERNAL DATA SOURCES                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Eurostat  │  │  INE     │  │  OCDE    │  │ CSVs     │   │
│  │REST API  │  │REST API  │  │REST API  │  │(manual)  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼──────────────┼─────────┘
        ↓             ↓             ↓              ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATA PIPELINE (Supabase Edge Functions)     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Extract → Validate (zod) → Transform → Upsert     │    │
│  │  pg_cron schedules: daily/weekly/annual             │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATA STORE (Supabase PostgreSQL)            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ economic_  │  │ political_ │  │  crime_    │            │
│  │ indicators │  │   data     │  │ statistics │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐                             │
│  │ migration_ │  │ countries  │                             │
│  │   data     │  │ (lookup)   │                             │
│  └────────────┘  └────────────┘                             │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS APP (Vercel Edge Network)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ /economia│  │/politica │  │/crimen   │  │/comparador│  │
│  │  page.tsx│  │ page.tsx │  │ page.tsx │  │ page.tsx │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │  Server Components         │              │          │
│       └────────────┬───────────────┘              │          │
│                    ↓                              ↓          │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │ Supabase Server Client   │  │ TanStack Query (client)  │ │
│  │ (ISR + static data)      │  │ (country selector, etc.) │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Edge Functions | Extract data from external APIs, validate, upsert to DB | Deno TypeScript + zod + supabase-js |
| pg_cron | Schedule Edge Function invocations | SQL: `cron.schedule('sync-eurostat', '0 6 * * *', ...)` |
| PostgreSQL (Supabase) | Normalized time-series storage | Tables per domain: economic_indicators, political_data, etc. |
| Server Components | Fetch data from Supabase at build/ISR time | `createServerClient()` + direct query |
| TanStack Query | Client-side state for dynamic filters (country selector) | `useQuery` hooks wrapping Supabase client |
| next-intl middleware | Locale detection and routing | `/[locale]/...` routes; hreflang tags |
| Zustand | Shared UI state (selected countries, active year range) | Single store, URL-synced |

## Recommended Project Structure

```
eurodata/
├── app/
│   └── [locale]/                   # next-intl locale routing
│       ├── layout.tsx              # Locale provider wrapper
│       ├── page.tsx                # Landing / home
│       ├── economia/
│       │   └── page.tsx            # Server Component — fetches at ISR time
│       ├── politica/
│       │   └── page.tsx
│       ├── inmigracion/
│       │   └── page.tsx
│       ├── criminalidad/
│       │   └── page.tsx
│       └── comparador/
│           └── page.tsx
│
├── components/
│   ├── charts/
│   │   ├── TimeSeriesChart.tsx     # Recharts wrapper with source attribution
│   │   ├── ComparisonBar.tsx       # Side-by-side bar for political vs citizen
│   │   └── CountryRanking.tsx      # EU ranking horizontal bar
│   ├── dashboard/
│   │   ├── MetricCard.tsx          # Tremor Card + source badge
│   │   ├── CountrySelector.tsx     # Multi-select with Zustand sync
│   │   ├── YearRangeSlider.tsx     # Year range filter
│   │   └── SourceBadge.tsx         # Source URL with last-updated
│   └── layout/
│       ├── Sidebar.tsx
│       ├── LanguageSwitcher.tsx
│       └── SectionNav.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client (singleton)
│   │   └── server.ts               # Server client (per-request)
│   ├── data/
│   │   ├── economic.ts             # Query functions: getEconomicIndicators()
│   │   ├── political.ts            # Query functions: getPoliticalData()
│   │   ├── crime.ts
│   │   └── migration.ts
│   └── formatters.ts               # formatCurrency, formatPercent, formatYear
│
├── queries/                        # TanStack Query hooks (client-side only)
│   ├── useCountryComparison.ts
│   └── useYearRange.ts
│
├── store/
│   └── filters.ts                  # Zustand: selectedCountries, yearRange
│
├── messages/
│   ├── es.json                     # Spanish UI strings
│   └── en.json                     # English UI strings
│
├── supabase/
│   ├── migrations/                 # Schema migrations (versioned)
│   └── functions/
│       ├── sync-eurostat/
│       │   └── index.ts            # ETL: Eurostat → DB
│       ├── sync-ine/
│       │   └── index.ts
│       └── sync-crime/
│           └── index.ts
│
├── types/
│   ├── database.ts                 # Supabase-generated types
│   └── metrics.ts                  # App-level metric type definitions
│
├── constants/
│   ├── countries.ts                # EU country codes + names + flags
│   └── metrics.ts                  # Metric IDs, labels, source URLs
│
└── middleware.ts                   # next-intl locale detection
```

## Architectural Patterns

### Pattern 1: ISR for Static Data Sections

**What:** Economy, Crime, Immigration pages use Next.js ISR — data fetched at build time and revalidated hourly/daily.
**When to use:** Data that changes at most daily (Eurostat, INE annual data)
**Trade-offs:** Fast page loads (no DB query per user request); stale data for up to `revalidate` seconds

```typescript
// app/[locale]/economia/page.tsx
export const revalidate = 3600 // Revalidate every hour

export default async function EconomiaPage() {
  const indicators = await getEconomicIndicators({ country: 'ES', years: 10 })
  return <EconomiaSection data={indicators} />
}
```

### Pattern 2: URL-Synced Filter State

**What:** Country selector and year range are stored in URL search params, not just Zustand. This enables shareable URLs and back/forward navigation.
**When to use:** Any user-configurable filter that should be shareable
**Trade-offs:** More complex to implement; requires sync between URL and Zustand

```typescript
// URL: /es/comparador?countries=ES,FR,DE&years=2015-2024
// Zustand store initialized from URL params on mount
// URL updated via router.push on filter change
```

### Pattern 3: ETL with Zod Validation

**What:** All external API responses are validated with zod schemas before DB upsert. If schema changes (Eurostat breaking change), the sync fails loudly with a log rather than silently corrupting data.
**When to use:** Always — every external data source
**Trade-offs:** Adds schema maintenance overhead; prevents silent data corruption

```typescript
// supabase/functions/sync-eurostat/index.ts
const EurostatResponseSchema = z.object({
  dimension: z.object({ geo: z.object({ category: z.object({ label: z.record(z.string()) }) }) }),
  value: z.record(z.number().nullable())
})

const parsed = EurostatResponseSchema.safeParse(apiResponse)
if (!parsed.success) {
  console.error('Eurostat schema changed:', parsed.error)
  return // Fail loudly, don't corrupt DB
}
```

## Data Flow

### ETL Pipeline Flow (automated sync)

```
pg_cron triggers Edge Function
    ↓
Edge Function calls Eurostat REST API
    ↓
zod validates response schema
    ↓ (fail → log error, exit)
Transform: normalize country codes, year extraction, metric mapping
    ↓
Supabase upsert (ON CONFLICT DO UPDATE) into economic_indicators
    ↓
Update sync_log table (timestamp, rows_affected, source)
```

### User Request Flow (ISR page)

```
User hits /es/economia
    ↓
Vercel Edge checks ISR cache
    ↓ (cache hit → serve instantly)
    ↓ (cache miss → revalidate)
Server Component calls getEconomicIndicators()
    ↓
Supabase query: economic_indicators WHERE country='ES' AND year >= 2014
    ↓
Server Component renders HTML with data
    ↓
Client hydrates; TanStack Query takes over for dynamic interactions
```

### Country Comparator Flow (dynamic)

```
User selects FR, DE via CountrySelector
    ↓
Zustand updates + URL search params updated (router.push)
    ↓
TanStack Query fires: useQuery(['comparison', ['FR','DE']])
    ↓
Supabase client queries economic_indicators WHERE country IN ('FR','DE')
    ↓
Chart re-renders with comparison data
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10k monthly visits | Current architecture — ISR handles all load; Supabase free tier sufficient |
| 10k-100k visits | Add Supabase connection pooling (pgBouncer); consider CDN caching for API routes |
| 100k+ visits | Evaluate read replicas; consider moving static data to CDN-hosted JSON; review Supabase plan |

### Scaling Priorities

1. **First bottleneck:** Supabase connection limits on free tier — add connection pooling early
2. **Second bottleneck:** ISR revalidation stampede — use `stale-while-revalidate` + staggered revalidation times per section

## Anti-Patterns

### Anti-Pattern 1: Fetching all countries all years on every page load

**What people do:** `SELECT * FROM economic_indicators` and filter in JavaScript
**Why it's wrong:** Could be 50k+ rows; kills DB performance and network
**Do this instead:** Always filter in SQL: `WHERE country = $1 AND year BETWEEN $2 AND $3 AND metric = $4`

### Anti-Pattern 2: Storing i18n strings in the database

**What people do:** Adding `label_es` and `label_en` columns to every table
**Why it's wrong:** Schema changes required to add languages; mixing concerns
**Do this instead:** Store metric IDs in DB; resolve labels in `messages/es.json` and `messages/en.json` via next-intl

### Anti-Pattern 3: Calling external APIs on every user request

**What people do:** Fetching from Eurostat API in Server Components directly
**Why it's wrong:** Eurostat has rate limits; latency adds to TTFB; API downtime breaks the site
**Do this instead:** ETL pipeline populates DB; frontend always reads from Supabase (your DB)

### Anti-Pattern 4: Skipping migration files for schema changes

**What people do:** Altering tables directly in Supabase Studio
**Why it's wrong:** Changes aren't tracked; reverting is impossible; team sync breaks
**Do this instead:** All schema changes via `supabase/migrations/` files + `supabase db push`

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Eurostat REST API | Edge Function ETL; fetch JSON dataset by code (e.g., `earn_ses_pub4s`) | Rate limit: no explicit limit but batch responsibly with p-limit |
| INE REST API | Edge Function ETL; series-based queries | Requires series ID research per metric |
| OCDE API | Edge Function ETL; SDMX-JSON format (different schema from Eurostat) | More complex parsing; validate carefully with zod |
| Banco de España | CSV download → manual seed initially; automate later | No REST API; wget + Papa Parse |
| Transparencia Internacional | Annual CSV download | Manual import once per year |
| UNODC | Annual CSV / Excel | Manual import; transform to crime_statistics schema |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Edge Functions ↔ PostgreSQL | Supabase client (service role key) | Functions use service role; never expose to frontend |
| Server Components ↔ PostgreSQL | Supabase server client (anon key + RLS) | RLS currently open-read; add restrictions if needed |
| Client Components ↔ PostgreSQL | Supabase client (anon key) via TanStack Query | Only for dynamic queries (comparator, filter changes) |

## Sources

- Next.js App Router docs — ISR patterns, Server Components
- Supabase docs — Edge Functions, pg_cron, connection pooling
- Eurostat API documentation (ec.europa.eu/eurostat/web/json-and-unicode-web-services)
- Our World in Data GitHub — open-source civic data architecture patterns

---
*Architecture research for: civic data transparency dashboard*
*Researched: 2026-02-26*
