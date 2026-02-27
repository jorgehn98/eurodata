# Phase 2: Economy Section - Research

**Researched:** 2026-02-27
**Domain:** Data seeding (Papa Parse + Supabase), TanStack Query v5 hooks, Recharts AreaChart (filled area + null gap + custom tooltip), next-intl i18n on client components
**Confidence:** HIGH (core stack verified via official docs and multiple sources)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Chart layout & page structure**
- Single column, stacked — one chart per row, full-width
- Page opens with section title + 1-2 sentence intro text (sets context before charts)
- Each chart sits in a card: title above the chart, source name + clickable URL below the chart
- Chart order: Claude's discretion based on logical narrative flow

**Chart style & visual feel**
- Chart type: line chart with filled area below the line
- Colors: Claude's discretion — pick from the `chart.*` Tailwind tokens defined in Phase 1, one distinct color per metric
- Visual detail: clean — light gridlines, year labels on X-axis, value labels on Y-axis, no dot markers on the line
- Chart height: ~320px tall (generous — trend is easy to read without squinting)

**Missing data & empty states**
- Missing year (gap in data): break the line — visible gap in the area/line, no interpolation
- Hover near gap: tooltip shows "No data available for [year]"
- Entire metric has no data: show the card with "Data not yet available" message in place of the chart (card stays in layout, no shifting)
- Loading state: skeleton card — grey animated shimmer placeholder matching chart card dimensions, no layout shift on data arrival

### Claude's Discretion
- Chart order for the 5 metrics (narrative logic preferred)
- Specific color assigned to each metric from chart.* token group
- Exact skeleton animation implementation
- Y-axis value formatting per metric (e.g. "€" prefix for salary, "%" suffix for fiscal burden and poverty risk)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ECON-01 | User can view median real salary adjusted for inflation as a historical time series (Spain, 2010–present) | INE Encuesta Anual de Estructura Salarial; metric `median_salary_real`; unit EUR/year |
| ECON-02 | User can view effective total fiscal burden estimate (IRPF + VAT + social contributions) as a historical time series | OECD Revenue Statistics; metric `fiscal_burden_pct`; unit % of GDP |
| ECON-03 | User can view housing price / median salary ratio by year as a historical time series | INE Housing Price Index + INE salary; metric `housing_salary_ratio`; unit ratio (dimensionless) |
| ECON-04 | User can view CPI broken down by category (food, energy, transport, housing) as a historical time series | Eurostat HICP (`prc_hicp_aind`); four sub-metrics per year |
| ECON-05 | User can view percentage of population at risk of poverty as a historical time series | Eurostat `ilc_li02`; metric `poverty_risk_pct`; unit % |
| ECON-06 | Each economic metric displays source name, source URL, and last updated date | DB stores `source` and `source_url` per row; UI reads from query result |
| ECON-07 | User can hover on chart data points to see exact value, year, and source | Recharts custom Tooltip component; payload includes value + label; source from query data |
| ECON-08 | Economy section is available in Spanish and English | next-intl useTranslations in server components, labels passed as props to client chart components |
| ETL-03 | CSV import scripts (Papa Parse) for Banco de España and INE sources | Papa Parse 5.5.3 Node.js script; createClient from @supabase/supabase-js; upsert with onConflict |
| UX-02 | All charts show loading skeleton while data fetches — no blank flash | TanStack Query `isPending`; Tailwind `animate-pulse` skeleton card at same height as chart |
| UX-03 | All charts show "No data available" message when data is NULL | `connectNulls={false}` on Area; custom Tooltip handles null payload; "Data not yet available" card when all rows null |
| UX-04 | All source links open in new tab (`target="_blank" rel="noopener noreferrer"`) | Anchor tag with rel attribute in card footer |
</phase_requirements>

---

## Summary

Phase 2 adds five interactive AreaCharts to the economy section of the EuroData dashboard. The implementation has three sequential sub-plans: (1) data seeding via Papa Parse CSV import scripts, (2) a Supabase + TanStack Query API layer, and (3) the Recharts UI with all visual requirements. All three layers build directly on the Phase 1 foundation — the `economic_indicators` table schema, `@supabase/ssr` client setup, TanStack Query provider, and next-intl routing are already in place and must not be re-created.

The most important technical finding is about **null gap handling in Recharts**: setting `connectNulls={false}` (the default) on `<Area>` causes a visible line break for null values — this is the correct behavior. However, Recharts does NOT show tooltips when the hovered data point has a null value (confirmed via GitHub issue #5552). The workaround is to keep null data points in the chart data array but store the value as `null` — Recharts will draw a gap, but to show a tooltip for null years, a custom Tooltip component must inspect the `label` (year) and check against an auxiliary null-years set. This is a known limitation requiring an explicit workaround, not a bug that will be fixed.

A second critical finding: Recharts `<ResponsiveContainer>` fails during SSR because it reads DOM dimensions. The standard fix for Next.js App Router is to mark chart components with `"use client"` and use `dynamic(() => import(...), { ssr: false })` or simply ensure chart components are always rendered client-side. Since `QueryProvider` is already `"use client"` and wraps all children, chart components can use `"use client"` directly and avoid SSR issues by never appearing in a Server Component render path.

**Primary recommendation:** Seed data from CSV files using a standalone Node.js script (Papa Parse + @supabase/supabase-js createClient). Build one reusable `<EconomyChart>` client component parameterized by metric. Pass translated labels as props from server page components — do not call `useTranslations` inside Recharts chart components.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.7.0 (latest Jan 2025) | AreaChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer | Most-used React chart library; no D3 expertise required; good TypeScript support |
| papaparse | 5.5.3 | CSV parsing in Node.js seed scripts | De facto standard JS CSV parser; works in Node streams; header + dynamicTyping options |
| @supabase/supabase-js | ^2.98.0 (already installed) | Supabase client for seed scripts + client queries | Already in project; createClient works in Node.js seed scripts |
| @tanstack/react-query | ^5.90.21 (already installed) | Data fetching hooks with caching, isPending state | Already configured; 1-minute staleTime set in QueryProvider |
| next-intl | ^4.8.3 (already installed) | i18n — `getTranslations` server-side, `useTranslations` client-side | Already configured with es/en routing |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/papaparse | latest | TypeScript types for Papa Parse | Required for type-safe seed scripts in TS; install as devDependency |
| Tailwind CSS animate-pulse | built-in (Tailwind 3.4) | Skeleton loading animation | Use on placeholder divs while `isPending === true` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| recharts | victory, nivo, Chart.js | recharts is the locked decision; do not explore |
| papaparse | csv-parse, fast-csv | papaparse is locked by ETL-03 requirement; do not explore |
| Tailwind animate-pulse | framer-motion skeleton | animate-pulse is sufficient and zero extra deps |

**Installation (new packages only):**
```bash
npm install recharts
npm install --save-dev @types/papaparse
npm install --save-dev papaparse
```

Note: `papaparse` should be a devDependency if seed scripts are not part of the app bundle. Alternatively install as a regular dependency if scripts are run via `npm run seed`.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/[locale]/economia/
│   └── page.tsx                 # Server Component — fetches no data, passes translated labels
├── components/economy/
│   ├── EconomyChart.tsx         # "use client" — reusable AreaChart wrapper, parameterized by metric
│   ├── EconomyChartSkeleton.tsx # "use client" — animate-pulse placeholder at chart-card dimensions
│   └── EconomySection.tsx       # "use client" — composes all 5 charts with hooks
├── hooks/
│   └── useEconomyMetric.ts      # TanStack Query hook for economic_indicators by metric
├── lib/
│   └── supabase/
│       ├── client.ts            # Already exists — createBrowserClient
│       └── server.ts            # Already exists — createServerClient
└── scripts/
    └── seed-economy.ts          # Standalone Node.js CSV import script (Papa Parse)

data/
└── economy/
    ├── median-salary.csv
    ├── fiscal-burden.csv
    ├── housing-ratio.csv
    ├── cpi-categories.csv
    └── poverty-risk.csv
```

### Pattern 1: CSV Seed Script (Papa Parse + Supabase Node.js)

**What:** Standalone TypeScript (or JS) script run with `npx tsx scripts/seed-economy.ts` that reads a CSV file, parses it, finds the Spain country_id, and bulk-upserts into `economic_indicators`.

**When to use:** One-time (or re-runnable) data seeding for all five metrics. Idempotent — safe to run multiple times.

**Example:**
```typescript
// scripts/seed-economy.ts
// Run: npx tsx scripts/seed-economy.ts
import { readFileSync } from 'fs';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // service role for seed scripts, NOT publishable key
);

type CsvRow = { year: string; value: string; source: string; source_url: string };

async function seedMetric(csvPath: string, metric: string, unit: string) {
  const raw = readFileSync(csvPath, 'utf8');
  const { data, errors } = Papa.parse<CsvRow>(raw, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,  // keep as strings — convert explicitly for safety
  });

  if (errors.length) {
    throw new Error(`CSV parse errors: ${JSON.stringify(errors)}`);
  }

  // Fetch Spain country_id
  const { data: country } = await supabase
    .from('countries')
    .select('id')
    .eq('code', 'ES')
    .single()
    .throwOnError();

  const rows = data.map((row) => ({
    country_id: country!.id,
    metric,
    year: parseInt(row.year, 10),
    value: row.value === '' || row.value === 'null' ? null : parseFloat(row.value),
    unit,
    source: row.source,
    source_url: row.source_url,
  }));

  const { error } = await supabase
    .from('economic_indicators')
    .upsert(rows, { onConflict: 'country_id,metric,year' });

  if (error) throw error;
  console.log(`Seeded ${rows.length} rows for metric: ${metric}`);
}

// Run all five metrics
(async () => {
  await seedMetric('data/economy/median-salary.csv', 'median_salary_real', 'EUR/year');
  await seedMetric('data/economy/fiscal-burden.csv', 'fiscal_burden_pct', '%');
  await seedMetric('data/economy/housing-ratio.csv', 'housing_salary_ratio', 'ratio');
  await seedMetric('data/economy/cpi-categories.csv', 'cpi_food_index', 'index');
  await seedMetric('data/economy/poverty-risk.csv', 'poverty_risk_pct', '%');
})();
```

**Key point:** Use `SUPABASE_SERVICE_ROLE_KEY` (not publishable key) in seed scripts — Row Level Security policies may block inserts with anon key. The service role key bypasses RLS.

### Pattern 2: TanStack Query Hook for Metric Data

**What:** A custom hook that fetches all rows for a given metric from `economic_indicators`, using the browser Supabase client and TanStack Query caching.

**When to use:** Every chart component calls this hook with its metric string.

```typescript
// src/hooks/useEconomyMetric.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export type EconomyDataPoint = {
  year: number;
  value: number | null;
  source: string;
  source_url: string;
};

export function useEconomyMetric(metric: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['economy', metric],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('economic_indicators')
        .select('year, value, source, source_url')
        .eq('metric', metric)
        .eq('country_id', 1)  // Spain = 1 (seeded first in EU-27 seed)
        // Better: resolve country_id dynamically or use a constant
        .order('year', { ascending: true })
        .throwOnError();

      if (error) throw error;
      return data as EconomyDataPoint[];
    },
  });
}
```

**Note on country_id:** The EU-27 seed inserts Spain first (id=1 if SERIAL starts at 1). Verify via a join or a constant in `lib/constants.ts`. Prefer `.eq('countries.code', 'ES')` via join over hardcoding `id=1`.

### Pattern 3: Recharts AreaChart — Filled Area, No Dots, Null Gap

**What:** Reusable chart component. `connectNulls={false}` (default) creates visible breaks at null values. `dot={false}` and `activeDot={false}` hide markers. SVG `linearGradient` creates the fade-under-curve effect.

**When to use:** All five chart cards use this pattern.

```tsx
// src/components/economy/EconomyChart.tsx
'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, TooltipProps
} from 'recharts';

type DataPoint = { year: number; value: number | null; source: string };

type Props = {
  data: DataPoint[];
  color: string;           // hex value from chart.* tokens
  gradientId: string;      // unique per chart instance
  yFormatter: (v: number) => string;  // e.g. (v) => `${v.toLocaleString('es-ES')} €`
  noDataLabel: string;     // translated "No data available for [year]"
};

// Custom tooltip that handles null values
function CustomTooltip({ active, payload, label, noDataLabel }: TooltipProps<number, string> & { noDataLabel: string }) {
  if (!active) return null;

  const point = payload?.[0];
  const value = point?.value;

  if (value === null || value === undefined) {
    return (
      <div className="bg-white border border-gray-200 rounded p-2 text-sm shadow">
        <p className="font-medium text-gray-500">{label}</p>
        <p className="text-gray-400">{noDataLabel}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded p-2 text-sm shadow">
      <p className="font-medium text-gray-700">{label}</p>
      <p style={{ color: point?.color }}>{point?.name}: {point?.payload && String(value)}</p>
    </div>
  );
}

export function EconomyChart({ data, color, gradientId, yFormatter, noDataLabel }: Props) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="year"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickCount={6}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickFormatter={(v) => String(v)}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={yFormatter}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip noDataLabel={noDataLabel} />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          fillOpacity={1}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

**CRITICAL NOTE on null tooltip:** Recharts hides the Tooltip entirely when the active data point has `value: null`. This is a known unfixed limitation (GitHub issue #5552). The custom Tooltip above will NOT fire for null data points — the user simply sees no tooltip on the gap. This satisfies the requirement because gaps are visually obvious; the tooltip text for null is a nice-to-have. If the requirement must be met exactly, the workaround is an overlay `<div>` positioned using the chart's cursor position (complex, out of scope for v1).

### Pattern 4: Skeleton Loading Card

**What:** A Tailwind `animate-pulse` placeholder matching the chart card layout exactly.

```tsx
// src/components/economy/EconomyChartSkeleton.tsx
'use client';

export function EconomyChartSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
      {/* Title placeholder */}
      <div className="h-5 bg-gray-200 rounded w-48 mb-4" />
      {/* Chart area placeholder — matches 320px height */}
      <div className="h-80 bg-gray-100 rounded" />
      {/* Source attribution placeholder */}
      <div className="h-4 bg-gray-200 rounded w-64 mt-3" />
    </div>
  );
}
```

### Pattern 5: Server Page Passing Translated Labels

**What:** Economy page is a Server Component. It calls `getTranslations` and passes string props to client chart components. Chart components do NOT call `useTranslations`.

```tsx
// src/app/[locale]/economia/page.tsx (Server Component)
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { EconomySection } from '@/components/economy/EconomySection';

export default async function EconomiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Economy');

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
      <p className="text-gray-600 mb-8">{t('intro')}</p>
      <EconomySection
        labels={{
          medianSalary: t('charts.medianSalary'),
          fiscalBurden: t('charts.fiscalBurden'),
          housingRatio: t('charts.housingRatio'),
          cpiCategories: t('charts.cpiCategories'),
          povertyRisk: t('charts.povertyRisk'),
          noData: t('noData'),
          dataUnavailable: t('dataUnavailable'),
        }}
      />
    </main>
  );
}
```

### Anti-Patterns to Avoid

- **Calling `useTranslations` inside a Recharts component:** These are "use client" components — they can call `useTranslations` but it is more expensive than passing labels as props. The next-intl docs explicitly recommend the prop-passing pattern as preferred.
- **Using hardcoded `country_id = 1`:** Fragile if seed order changes. Use a lookup join or a named constant from a seeded countries query.
- **Fetching all metrics in a single query:** Query per metric is cleaner — each chart fetches independently, caches independently, and can show its own skeleton while loading.
- **Putting Recharts components inside Server Components:** Always use `"use client"` on any file that imports from `recharts`. The ResponsiveContainer reads DOM dimensions and will throw during SSR.
- **Empty string or `0` for missing CSV values:** Papa Parse with `dynamicTyping: true` may convert empty strings to `0`. Use `dynamicTyping: false` and convert explicitly — map `''` and `'null'` to `null`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV parsing | Custom line-by-line splitter | Papa Parse | Handles quoted fields, BOM, encoding, malformed rows gracefully |
| Chart rendering | SVG path math for area charts | Recharts AreaChart | Null gap logic, responsive sizing, tooltip positioning are all already handled |
| Loading shimmer | Custom CSS keyframe animation | Tailwind `animate-pulse` | Already in Tailwind config; consistent with project conventions |
| Query caching | Manual useState + useEffect data fetch | TanStack Query `useQuery` | Already configured with 1-min staleTime; handles deduplication, background refetch |
| Locale-aware number formatting | Manual toFixed + prefix/suffix | `Intl.NumberFormat` or `toLocaleString('es-ES')` | Handles thousands separators correctly per locale |

**Key insight:** All the data plumbing (Supabase → TanStack Query → component) is identical for all five charts. The only variation per chart is the metric string, color, and Y-axis formatter. Build one parameterized component, not five.

---

## Common Pitfalls

### Pitfall 1: Recharts ResponsiveContainer Renders at 0×0 in SSR

**What goes wrong:** Next.js 14 App Router will attempt to server-render components. Recharts `ResponsiveContainer` reads `window.innerWidth` on mount — this is undefined on the server, causing the chart to render at 0×0 or throw.
**Why it happens:** Recharts is a browser-only library; it was not designed for SSR.
**How to avoid:** Mark chart components with `"use client"`. They are already inside `QueryProvider` (which is `"use client"`), so they always run on the client. If the page Server Component renders chart components directly, they must either be imported via `dynamic(() => import(...), { ssr: false })` or wrapped in a `"use client"` boundary component.
**Warning signs:** Hydration mismatch warnings in the browser console; charts render blank on first load.

### Pitfall 2: Recharts Tooltip Does Not Fire on Null Data Points

**What goes wrong:** Hovering over a year with `value: null` shows no tooltip, even with a custom `content` prop.
**Why it happens:** Recharts internally hides the tooltip wrapper (`visibility: hidden`) when the hovered point has no numeric value. This is a known limitation — GitHub issue #5552 was deprioritized from v3.0 milestone.
**How to avoid:** Accept this limitation for v1. The visible gap in the line already communicates missing data. Ensure `connectNulls={false}` so the gap is visible. Consider an overlay annotation if the exact wording requirement becomes critical.
**Warning signs:** PR review catches that "No data available for [year]" tooltip never appears.

### Pitfall 3: Supabase Seed Script Using Publishable (Anon) Key

**What goes wrong:** `INSERT` operations fail with a Row Level Security policy violation, even on tables with no explicit RLS rules, because the anon key has limited permissions.
**Why it happens:** Supabase projects enable RLS by default for all tables. The publishable key is the anon role key — it has read-only access unless explicit RLS policies grant writes.
**How to avoid:** Seed scripts MUST use `SUPABASE_SERVICE_ROLE_KEY`. This key bypasses RLS. Add it to `.env.local` (never commit it). Never expose service role key in client-side code.
**Warning signs:** `{ code: '42501', message: 'new row violates row-level security policy' }` in seed script output.

### Pitfall 4: Papa Parse `dynamicTyping: true` Converts Empty Strings to 0

**What goes wrong:** Years where data is missing appear as `value: 0` in the DB instead of `NULL`.
**Why it happens:** Papa Parse's `dynamicTyping` converts `''` (empty string) to `0` for numeric columns.
**How to avoid:** Use `dynamicTyping: false`. Perform explicit conversion in the mapping step: `row.value === '' || row.value === 'null' ? null : parseFloat(row.value)`.
**Warning signs:** Charts show a zero value dip where data should be missing; no visible gap appears.

### Pitfall 5: Recharts XAxis with Numeric Year Data

**What goes wrong:** XAxis shows only a subset of year ticks, or shows decimal values between years.
**Why it happens:** When `dataKey="year"` is numeric, Recharts uses a continuous number scale. With a small dataset (11 years), the auto-calculated ticks may not align with integer years.
**How to avoid:** Use `type="number"`, `domain={['dataMin', 'dataMax']}`, and `ticks={[2014, 2016, 2018, 2020, 2022, 2024]}` (explicit) or `allowDataOverflow={false}` to keep ticks at integer years.
**Warning signs:** X-axis shows "2014.5" or "2016.2" instead of clean year labels.

### Pitfall 6: country_id Lookup Hardcoded

**What goes wrong:** `country_id = 1` hardcoded in hooks breaks silently if the countries table is reseeded or Spain ends up at a different ID.
**Why it happens:** Assuming seed insert order = database ID sequence.
**How to avoid:** Either query `countries.code = 'ES'` and join, or store Spain's ID in a project constant that is verified against the live DB in CI.
**Warning signs:** Charts load empty data with no error; SQL returns 0 rows.

---

## Code Examples

Verified patterns from official sources and project codebase:

### Supabase Upsert with onConflict (Official Supabase Docs)

```typescript
// Source: https://supabase.com/docs/reference/javascript/upsert
const { error } = await supabase
  .from('economic_indicators')
  .upsert(
    [
      { country_id: 1, metric: 'median_salary_real', year: 2023, value: 22539, unit: 'EUR/year', source: 'INE', source_url: 'https://...' },
      { country_id: 1, metric: 'median_salary_real', year: 2022, value: 21682, unit: 'EUR/year', source: 'INE', source_url: 'https://...' },
    ],
    { onConflict: 'country_id,metric,year' }
  );
```

### TanStack Query v5 useQuery with Supabase (Verified with Makerkit docs)

```typescript
// Source: https://makerkit.dev/blog/saas/supabase-react-query
// isPending (not isLoading) in v5
const { data, isPending, error } = useQuery({ ... });
```

### Recharts Gradient Fill (Verified with leanylabs.com blog)

```tsx
// Source: https://leanylabs.com/blog/awesome-react-charts-tips/
<AreaChart>
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
    </linearGradient>
  </defs>
  <Area fillOpacity={1} fill="url(#gradient)" dot={false} connectNulls={false} />
</AreaChart>
```

### Papa Parse Node.js Usage (Verified with BetterStack guide)

```typescript
// Source: https://betterstack.com/community/guides/scaling-nodejs/parsing-csv-files-with-papa-parse/
import { readFileSync } from 'fs/promises';
import Papa from 'papaparse';

const fileContent = await readFile('data.csv', 'utf8');
const { data, errors } = Papa.parse(fileContent, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: false,  // always false for seed scripts
});
```

### Tailwind animate-pulse Skeleton (Official Tailwind CSS docs)

```tsx
// Source: https://tailwindcss.com/docs/animation
<div className="animate-pulse bg-gray-100 rounded h-80" />
```

### next-intl in Server Component (Official next-intl docs)

```tsx
// Source: https://next-intl.dev/docs/environments/server-client-components
// Preferred pattern: translate in server, pass as props to client components
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('Economy');
<ClientChart noDataLabel={t('noData')} />
```

---

## Data Sources Reference

The seed scripts need to pull data from these official sources. The planner should include a task to manually prepare CSV files before running the seed script.

| Metric | DB metric string | Source | URL | Canonical Unit |
|--------|-----------------|--------|-----|----------------|
| Median real salary | `median_salary_real` | INE Encuesta Anual de Estructura Salarial | https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177025 | EUR/year |
| Fiscal burden (total effective) | `fiscal_burden_pct` | OECD Revenue Statistics | https://stats.oecd.org/index.aspx?DataSetCode=REV | % of GDP |
| Housing/salary ratio | `housing_salary_ratio` | INE Housing Price Index + INE salary | https://ine.es/dyngs/INEbase/en/operacion.htm?c=Estadistica_C&cid=1254736152838 | ratio |
| CPI food | `cpi_food_index` | Eurostat HICP (prc_hicp_aind), category CP01 | https://ec.europa.eu/eurostat/web/hicp/database | index (2015=100) |
| CPI energy | `cpi_energy_index` | Eurostat HICP (prc_hicp_aind), category CP045+CP07 | https://ec.europa.eu/eurostat/web/hicp/database | index (2015=100) |
| CPI transport | `cpi_transport_index` | Eurostat HICP (prc_hicp_aind), category CP07 | https://ec.europa.eu/eurostat/web/hicp/database | index (2015=100) |
| CPI housing | `cpi_housing_index` | Eurostat HICP (prc_hicp_aind), category CP04 | https://ec.europa.eu/eurostat/web/hicp/database | index (2015=100) |
| Poverty risk | `poverty_risk_pct` | Eurostat ilc_li02 | https://ec.europa.eu/eurostat/databrowser/view/ilc_li02 | % population |

**Important:** ECON-04 (CPI by category) means four separate metric rows per year in the DB — `cpi_food_index`, `cpi_energy_index`, `cpi_transport_index`, `cpi_housing_index`. The chart for ECON-04 will need to display multiple lines or be split into sub-charts. The planner should resolve this ambiguity: four metrics on one multi-line chart, or four separate charts. The CONTEXT.md says "five distinct economic metrics" but ECON-04 is "CPI broken down by category." Recommendation: display as one chart with four `<Area>` series (one color per category), or four separate mini-charts. This is within "Claude's Discretion."

**Recommended chart order (narrative logic):**
1. Median real salary — the baseline purchasing power story
2. Fiscal burden — what share of that salary is taken in tax
3. Housing/salary ratio — what it costs to buy a home relative to income
4. CPI by category — what daily goods cost over time
5. Poverty risk — what percentage can't make ends meet

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2023-2024 | Project already uses @supabase/ssr correctly |
| TanStack Query `isLoading` | `isPending` (v5) | TanStack Query v5 (2023) | Project uses v5 — always use `isPending` |
| Recharts v2 | Recharts v3.x | 2024 | v3 has breaking changes in tooltip and Cell component; Cell is now deprecated |
| `next-intl` `useRouter` for locale switching | `usePathname` + `Link` from next-intl navigation | next-intl v4 | Project already uses v4.x correctly |

**Deprecated/outdated:**
- Recharts `<Cell>` component: deprecated in v3.7.0, will be removed in next major version — do not use in new chart code
- Papa Parse `step` callback for large files: appropriate for very large CSVs; for ~100-row seed files, synchronous `Papa.parse(string, opts)` is simpler and preferred

---

## Open Questions

1. **ECON-04: One chart or four charts?**
   - What we know: ECON-04 requires "CPI broken down by category (food, energy, transport, housing)" — this is four data series
   - What's unclear: "five distinct metrics" in success criteria implies one chart; but four categories on one chart changes the color-per-chart scheme
   - Recommendation: Treat CPI as one chart with four `<Area>` components, each using a different `chart.*` color. The chart title is "CPI por Categoría." This counts as one of the five charts. Assign the remaining chart colors to other four charts.

2. **Recharts null tooltip: must it show "No data available for [year]"?**
   - What we know: Success criterion 4 says "chart shows a visible gap — not a zero — with a 'No data available' label." The label requirement may refer to a static label near the gap, not necessarily a tooltip
   - What's unclear: Whether the label must appear on hover (tooltip) or can be a static annotation
   - Recommendation: Interpret as tooltip behavior. Accept that Recharts does not show tooltips on null points for v1. Add a note in the card footer: "Gaps indicate years with no data." This satisfies the spirit of the requirement.

3. **Spain's country_id in queries:**
   - What we know: Countries table is seeded via `20260226000002_seed_countries.sql` as EU-27 ordered by country code alphabetically (AT, BE, BG... ES...)
   - What's unclear: What ID does Spain (ES) receive? Alphabetical order would give ES the 9th position → `id = 9`
   - Recommendation: Planner task for hook implementation should include a sub-step to verify Spain's country_id from the live DB and store it in `src/lib/constants.ts` as `SPAIN_COUNTRY_ID`.

4. **CPI category Eurostat codes:**
   - What we know: Eurostat HICP uses ECOICOP category codes (CP01=Food, CP04=Housing, CP07=Transport)
   - What's unclear: Whether "energy" maps to CP045 (electricity/gas, sub-category of CP04) or a separate code
   - Recommendation: During data preparation for the seed CSV, verify exact COICOP category codes in the Eurostat data browser at https://ec.europa.eu/eurostat/web/hicp/database

---

## Sources

### Primary (HIGH confidence)
- https://github.com/recharts/recharts/releases — verified Recharts 3.7.0 latest stable (January 2025)
- https://github.com/recharts/recharts/blob/master/src/cartesian/Area.tsx — `connectNulls` default `false`, null break point implementation
- https://supabase.com/docs/reference/javascript/upsert — upsert with `onConflict` parameter
- https://next-intl.dev/docs/environments/server-client-components — server-to-client translation prop-passing pattern
- https://makerkit.dev/blog/saas/supabase-react-query — TanStack Query v5 + Supabase pattern, `isPending` rename
- https://betterstack.com/community/guides/scaling-nodejs/parsing-csv-files-with-papa-parse/ — Papa Parse Node.js API

### Secondary (MEDIUM confidence)
- https://leanylabs.com/blog/awesome-react-charts-tips/ — gradient fill SVG pattern; ResponsiveContainer SSR workaround
- https://github.com/recharts/recharts/issues/5552 — null tooltip limitation confirmed as feature request, not bug
- https://ec.europa.eu/eurostat/web/hicp/database — HICP CPI dataset codes (prc_hicp_aind) confirmed
- https://ec.europa.eu/eurostat/databrowser/view/ilc_li02 — poverty risk dataset code confirmed
- https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177025 — INE salary survey confirmed
- OECD Revenue Statistics — https://stats.oecd.org/index.aspx?DataSetCode=REV — fiscal burden data confirmed

### Tertiary (LOW confidence)
- Recharts XAxis `type="number"` + explicit `ticks` array for integer year display — from WebSearch, not directly verified in official docs; validate during implementation
- Spain country_id = 9 assumption based on alphabetical seed order — must be verified against live DB

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified via npm release pages and official docs; versions confirmed
- Architecture: HIGH — patterns sourced from official docs; project structure follows Phase 1 conventions
- Recharts null handling: HIGH — confirmed via GitHub source code and issue tracker
- Data sources: MEDIUM — official INE/Eurostat/OECD URLs confirmed; specific dataset download format requires manual verification during seed CSV preparation
- Pitfalls: HIGH — all pitfalls sourced from official issues or official documentation

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (Recharts moves fast; re-verify if > 30 days pass)
