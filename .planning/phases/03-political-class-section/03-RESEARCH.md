# Phase 3: Political Class Section - Research

**Researched:** 2026-02-27
**Domain:** Recharts LineChart + BarChart + Legend toggle; Supabase schema extension (new tables for pensions and revolving door); Papa Parse seed scripts; next-intl i18n; inflation-adjusted toggle state
**Confidence:** HIGH (core stack verified from Phase 2 implementation; new patterns verified via official Recharts API docs and GitHub issues)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Page structure**
- Single scrollable page — same pattern as the Economy section
- Section order (top to bottom): Salary comparison → Salary ratio → Advisor count → Pensions → Revolving door
- Same intro pattern as Economy section: section title + short neutral description at top
- In-page anchor navigation at Claude's discretion (based on content length)

**Salary comparison chart**
- 4 lines on one chart: President, Ministers (average), MPs (average), National Median Salary
- Full year range displayed: 2010 through latest available year — no truncation
- Nominal vs. real (inflation-adjusted) toggle — user can switch between views
- Interactive legend — clicking a legend item toggles that line on/off (same pattern as Phase 2 charts)

**Salary ratio chart**
- Separate chart below the salary comparison — shows politician salary ÷ median salary over time
- One line per politician role (President, Ministers, MPs) — ratios as Y-axis, years as X-axis
- Exact chart type and interaction at Claude's discretion, consistent with above

**Advisor count**
- Bar chart — one bar per government term
- Each bar labeled: PM name + year range (e.g., "Zapatero 2004–08")
- Hover tooltip shows exact count
- No table accompanying the chart

**Pensions display**
- Table format with columns: Name | Role | Annual pension (EUR) | Years in office | Source (BOE link)
- No comparison column (no "X× median" ratio) — raw amounts with source attribution only
- Sorted at Claude's discretion (likely by most recent exit from office)

**Revolving door list**
- Card list — one card per case, vertically stacked
- Fields per card: Person name, Political role held, Entity moved to, Year, Source link
- Sorted: reverse chronological (newest case first)
- No filter or search — static list; manual curation keeps it under ~30 entries

**Neutral title enforcement (POLI-07)**
- All chart titles describe the data axis only — no editorial conclusion implied
- Applies to all 5 sub-sections; specific wording at Claude's discretion following this rule

### Claude's Discretion
- In-page anchor nav (decide based on total page length)
- Salary ratio chart type and exact interaction
- Pension table sort order
- Exact chart colors and spacing (match Economy section style)
- Loading skeleton and error state design (match Phase 2 pattern)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| POLI-01 | User can view annual salary of president, ministers, and MPs compared to national median salary on the same chart (Spain, historical) | Recharts LineChart with 4 `<Line>` series; `political_data` table with metrics `president_salary`, `minister_salary_avg`, `mp_salary_avg`; median salary reuses `economic_indicators.median_salary_real` |
| POLI-02 | User can view the ratio of politician salary to median citizen salary over time (Spain) | Derived ratio computed client-side from political salary ÷ median salary; second LineChart with 3 ratio series; no separate DB metric needed |
| POLI-03 | User can view number of political advisors and appointed positions per government term | `political_data` table with metric `advisor_count`; one row per government term with `year` as term start year; Recharts BarChart; `XAxis` dataKey uses string label (PM name + years); requires separate `political_terms` table or CSV encoding |
| POLI-04 | User can view former presidents' and ministers' pensions with source attribution | Requires new DB table `political_pensions` (name, role, pension_annual_eur, years_in_office, source, source_url, exit_year); not storable in `political_data` generic schema |
| POLI-05 | User can view documented revolving door cases linked to official/media source (static list) | Requires new DB table `revolving_door_cases` (person_name, political_role, entity_moved_to, year, source_url); not storable in `political_data` generic schema |
| POLI-06 | All political figures' data has year granularity (no "current value only") | `political_data` rows per year 2010–present; advisor bar chart uses year range labels; pensions use exit_year column |
| POLI-07 | Chart titles are strictly neutral — describe the data axis, not the conclusion | No chart title may imply editorial judgment; all titles name the data axis (e.g., "Annual gross salary (EUR)" not "Politicians earn much more than citizens") |
| POLI-08 | Political section is available in Spanish and English | All strings in `messages/es.json` and `messages/en.json` under `Politics` namespace; labels passed as props from Server Component page.tsx, same pattern as Phase 2 |
</phase_requirements>

---

## Summary

Phase 3 builds the Political Class Section, the core differentiating feature of EuroData. It follows the same structural pattern as Phase 2 (Economy Section) — a Server Component page at `/app/[locale]/politics/page.tsx`, a client-side section component, hooks fetching from Supabase, and Recharts chart components. The major difference from Phase 2 is that this phase requires five distinct visual sub-components (two line charts, one bar chart, one table, one card list) and three new data structures.

The most important architectural finding is the **database schema gap**: the existing `political_data` table (generic `country_id, metric, year, value, unit, source, source_url`) can store salary time-series and advisor counts, but cannot store pensions or revolving door cases, which have named individuals, roles, and entity fields. Two new tables are required: `political_pensions` and `revolving_door_cases`. These must be added via a new Supabase migration before data seeding.

The second important technical finding is the **nominal vs. real toggle** for the salary comparison chart. Real (inflation-adjusted) values require dividing nominal salary by CPI and multiplying by the base year CPI. The project already seeds CPI data in `economic_indicators` (metrics `cpi_food_index` etc.) but lacks a general CPI index metric. For salary real adjustment, the plan must include either (a) storing nominal AND real politician salaries as separate metrics, or (b) querying the CPI deflator from `economic_indicators` and computing real values client-side. Option (a) is simpler and more robust — store both variants in `political_data`.

The **interactive legend toggle** in Recharts is implemented by maintaining a `hiddenKeys` state set, handling `<Legend onClick>`, and setting `hide={hiddenKeys.has(dataKey)}` on each `<Line>` component. The `hide` prop is confirmed available on Recharts `<Line>` (verified in official API docs).

**Primary recommendation:** Three-plan structure: (1) DB migration + data seeding; (2) types, hooks, and data access layer; (3) UI components and page route. All patterns follow Phase 2 conventions exactly, extended for the five new sub-sections.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.7.0 (already installed) | LineChart, BarChart, Legend, Tooltip, ResponsiveContainer | Already in project; Phase 2 patterns proven; interactive legend via `hide` prop on `<Line>` |
| @supabase/supabase-js | ^2.98.0 (already installed) | Supabase client for seed scripts and client queries | Already in project with service role key pattern for seeds |
| @tanstack/react-query | ^5.90.21 (already installed) | Data fetching hooks, `isPending` loading state | Already configured in QueryProvider |
| next-intl | ^4.8.3 (already installed) | i18n — `getTranslations` server-side, labels passed as props | Same pattern as Phase 2 |
| papaparse | ^5.5.3 (already installed as devDependency) | CSV parsing in Node.js seed scripts | Same pattern as Phase 2 seed scripts |

**No new npm packages required.** All libraries are already installed.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind animate-pulse | built-in (Tailwind 3.4) | Skeleton loading while data fetches | On all chart/table cards while `isPending === true` |
| Tailwind chart.* color tokens | built-in (project config) | Chart line colors, consistent with Phase 2 | Assign one color per series — do NOT add new CSS |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client-side ratio computation | Store ratios in DB as separate metric | Client-side is simpler — avoids data duplication; ratios derived from two already-fetched series |
| CPI from economic_indicators | Store real salary directly in political_data | Storing pre-adjusted real salary is simpler — avoids cross-table derivation and second query |
| Two new tables for pensions/revolving door | Generic `political_data` with text encoding in `unit` field | Custom tables give proper column types, constraints, and queryability — generic encoding is a hack |

**Installation:** No new packages to install.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/[locale]/politics/
│   └── page.tsx                     # Server Component — passes translated labels to PoliticsSection
├── components/politics/
│   ├── PoliticsSection.tsx          # "use client" — composes all 5 sub-sections
│   ├── SalaryComparisonChart.tsx    # "use client" — LineChart with 4 lines + legend toggle + nominal/real toggle
│   ├── SalaryRatioChart.tsx         # "use client" — LineChart with 3 ratio lines
│   ├── AdvisorCountChart.tsx        # "use client" — BarChart with one bar per term
│   ├── PensionsTable.tsx            # "use client" — HTML table with BOE source links
│   ├── RevolvingDoorList.tsx        # "use client" — card list, reverse chronological
│   └── PoliticsChartSkeleton.tsx    # "use client" — animate-pulse skeleton (reuses pattern from Phase 2)
├── hooks/
│   ├── usePoliticalMetric.ts        # TanStack Query hook for political_data by metric
│   ├── usePoliticalPensions.ts      # TanStack Query hook for political_pensions table
│   └── useRevolvingDoorCases.ts     # TanStack Query hook for revolving_door_cases table
└── types/
    └── politics.ts                  # PoliticalDataPoint, PoliticalPension, RevolvingDoorCase types

data/
└── politics/
    ├── president-salary.csv         # year, nominal_value, real_value, source, source_url
    ├── minister-salary.csv          # year, nominal_value, real_value, source, source_url
    ├── mp-salary.csv                # year, nominal_value, real_value, source, source_url
    ├── advisor-count.csv            # pm_name, term_label, year_start, year_end, count, source, source_url
    ├── pensions.csv                 # name, role, pension_eur, years_in_office, exit_year, source, source_url
    └── revolving-door.csv           # person_name, political_role, entity_moved_to, year, source_url

scripts/
└── seed-politics.ts                 # Standalone Node.js CSV import script

supabase/migrations/
└── 20260227000003_political_tables.sql   # New tables: political_pensions, revolving_door_cases
```

### Pattern 1: Nominal vs. Real Toggle on Salary Comparison Chart

**What:** The salary comparison chart needs to show both nominal (current EUR) and inflation-adjusted (real, 2015-adjusted EUR) values. The toggle switches between the two views.

**Implementation decision:** Store BOTH nominal and real values in `political_data` as separate metrics. This avoids a cross-table CPI derivation at render time.

**Metric naming convention:**
- `president_salary_nominal` — current EUR, as published in BOE
- `president_salary_real` — 2015-adjusted EUR (pre-computed from BOE nominal + INE CPI)
- `minister_salary_nominal`, `minister_salary_real`
- `mp_salary_nominal`, `mp_salary_real`

The median salary real is already stored in `economic_indicators` as `median_salary_real`. A nominal median is not currently in the DB; add `median_salary_nominal` to `economic_indicators` as part of the seed for this phase.

**Toggle state:**
```typescript
// In SalaryComparisonChart.tsx
const [showReal, setShowReal] = useState(true);  // default: real (inflation-adjusted)

// Use real or nominal data based on toggle
const presidentData = showReal ? presidentRealQuery.data : presidentNominalQuery.data;
```

**When to use:** Salary comparison chart only. Ratio chart always uses real values (ratio of real to real is the same as nominal to nominal, so the choice is nominal — ratios are unit-less).

### Pattern 2: Recharts LineChart with Interactive Legend Toggle

**What:** Multi-series LineChart where clicking a legend item hides/shows that line. Implemented using Recharts `<Legend onClick>` and the `hide` prop on `<Line>`.

**Confirmed API:** The `hide` prop on `<Line>` is documented in the official Recharts API docs (https://recharts.github.io/en-US/api/Line):
> "Hides the whole graphical element when true. Hiding an element is different from removing it from the chart: Hidden graphical elements are still visible in Legend, and can be included in axis domain calculations."

**Example:**
```typescript
// Source: Recharts official API docs https://recharts.github.io/en-US/api/Line
// and GitHub discussion https://github.com/recharts/recharts/discussions/3940

'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type HiddenSet = Set<string>;

export function SalaryComparisonChart({ data, labels }: Props) {
  const [hiddenKeys, setHiddenKeys] = useState<HiddenSet>(new Set());

  const handleLegendClick = (e: { dataKey?: string }) => {
    if (!e.dataKey) return;
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(e.dataKey!)) {
        next.delete(e.dataKey!);
      } else {
        next.add(e.dataKey!);
      }
      return next;
    });
  };

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={mergedData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey="year" type="number" domain={[2010, 'dataMax']} tickFormatter={String} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `${v.toLocaleString('es-ES')} €`} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={80} />
        <Tooltip content={<MultiLineTooltip labels={labels} />} />
        <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer' }} />
        <Line type="monotone" dataKey="president" stroke="#1E40AF" strokeWidth={2} dot={false} activeDot={{ r: 4 }} hide={hiddenKeys.has('president')} name={labels.president} connectNulls={false} />
        <Line type="monotone" dataKey="minister" stroke="#0F766E" strokeWidth={2} dot={false} activeDot={{ r: 4 }} hide={hiddenKeys.has('minister')} name={labels.minister} connectNulls={false} />
        <Line type="monotone" dataKey="mp" stroke="#F97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} hide={hiddenKeys.has('mp')} name={labels.mp} connectNulls={false} />
        <Line type="monotone" dataKey="median" stroke="#6B7280" strokeWidth={2} dot={false} activeDot={{ r: 4 }} hide={hiddenKeys.has('median')} name={labels.median} connectNulls={false} strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**Data merging:** All four salary series must be merged by year into a flat object array — same technique as `CpiChart` in Phase 2:

```typescript
// Merge four series into one data array keyed by year
const allYears = [...new Set([
  ...presidentData.map(d => d.year),
  ...ministerData.map(d => d.year),
  ...mpData.map(d => d.year),
  ...medianData.map(d => d.year),
])].sort();

const mergedData = allYears.map(year => ({
  year,
  president: presidentData.find(d => d.year === year)?.value ?? null,
  minister:  ministerData.find(d => d.year === year)?.value ?? null,
  mp:        mpData.find(d => d.year === year)?.value ?? null,
  median:    medianData.find(d => d.year === year)?.value ?? null,
}));
```

### Pattern 3: Recharts BarChart for Advisor Count

**What:** One bar per government term. X-axis shows string labels (PM name + year range). Y-axis shows count.

**Key difference from Phase 2:** X-axis uses `dataKey` as a string label, NOT numeric year. Use `type="category"` (default for XAxis) — do NOT use `type="number"`.

**Example:**
```typescript
// Source: https://recharts.github.io/en-US/api/BarChart
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TermRow = { label: string; count: number; source: string; source_url: string };

export function AdvisorCountChart({ data, labels }: Props) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="label"           // string label, e.g. "Zapatero 2004–08"
          tick={{ fontSize: 11, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
          angle={-35}               // angled labels to fit long PM names
          textAnchor="end"
          interval={0}              // show all ticks
        />
        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={50} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            return (
              <div className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm shadow-sm">
                <p className="font-medium text-gray-700">{payload[0].payload.label}</p>
                <p className="text-brand-primary">{labels.advisorCount}: {payload[0].value}</p>
              </div>
            );
          }}
        />
        <Bar dataKey="count" fill="#3B82F6" radius={[3, 3, 0, 0]} maxBarSize={60} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### Pattern 4: Pensions Table

**What:** Standard HTML table with Tailwind styling. No Recharts involved — this is a plain data table.

**Column order:** Name | Role | Annual pension (EUR) | Years in office | Source

```typescript
// In PensionsTable.tsx
'use client';

type PensionRow = {
  name: string;
  role: string;
  pension_annual_eur: number;
  years_in_office: number;
  source_url: string;
  source: string;
};

export function PensionsTable({ data, labels }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border text-gray-500 text-left">
            <th className="pb-2 pr-4 font-medium">{labels.name}</th>
            <th className="pb-2 pr-4 font-medium">{labels.role}</th>
            <th className="pb-2 pr-4 font-medium text-right">{labels.pensionAnnual}</th>
            <th className="pb-2 pr-4 font-medium text-right">{labels.yearsInOffice}</th>
            <th className="pb-2 font-medium">{labels.source}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-surface-muted">
              <td className="py-2 pr-4 font-medium text-brand-neutral">{row.name}</td>
              <td className="py-2 pr-4 text-gray-600">{row.role}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{row.pension_annual_eur.toLocaleString('es-ES')} €</td>
              <td className="py-2 pr-4 text-right tabular-nums">{row.years_in_office}</td>
              <td className="py-2">
                <a href={row.source_url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline truncate block max-w-[200px]">
                  {row.source}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Pattern 5: Revolving Door Card List

**What:** Vertically stacked cards, newest-first. Each card shows name, political role, entity moved to, year, and source link.

```typescript
// In RevolvingDoorList.tsx
'use client';

type RevolvingDoorCase = {
  person_name: string;
  political_role: string;
  entity_moved_to: string;
  year: number;
  source_url: string;
};

export function RevolvingDoorList({ cases, labels }: Props) {
  // Data is pre-sorted reverse chronological from DB query (order by year DESC)
  return (
    <div className="flex flex-col gap-3">
      {cases.map((c, i) => (
        <div key={i} className="bg-white border border-surface-border rounded-lg p-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-brand-neutral">{c.person_name}</p>
            <p className="text-sm text-gray-600 mt-0.5">{c.political_role} → {c.entity_moved_to}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-sm font-medium text-gray-500">{c.year}</span>
            <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:underline">
              {labels.source}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Pattern 6: New DB Tables via Migration

**What:** Two new tables required for pensions and revolving door data. Must be added via a new migration file before the seed script runs.

```sql
-- supabase/migrations/20260227000003_political_tables.sql

CREATE TABLE political_pensions (
  id                  BIGSERIAL   PRIMARY KEY,
  name                TEXT        NOT NULL,           -- full name of person
  role                TEXT        NOT NULL,           -- e.g. 'Presidente del Gobierno'
  pension_annual_eur  NUMERIC     NOT NULL,           -- annual pension in EUR
  years_in_office     SMALLINT    NOT NULL,           -- total years in qualifying role
  exit_year           SMALLINT    NOT NULL,           -- year they left office (for sort order)
  source              TEXT        NOT NULL,           -- e.g. 'BOE'
  source_url          TEXT        NOT NULL            -- direct link to BOE publication
);

CREATE TABLE revolving_door_cases (
  id              BIGSERIAL   PRIMARY KEY,
  person_name     TEXT        NOT NULL,               -- full name
  political_role  TEXT        NOT NULL,               -- e.g. 'Ministro de Fomento'
  entity_moved_to TEXT        NOT NULL,               -- e.g. 'Iberdrola S.A.'
  year            SMALLINT    NOT NULL,               -- year of move/appointment
  source_url      TEXT        NOT NULL                -- official or press source link
);

-- Index for revolving door reverse-chronological default sort
CREATE INDEX revolving_door_year_desc ON revolving_door_cases (year DESC);
```

**Note:** These tables intentionally differ from `political_data`. They store named individuals, not time-series metrics. They do NOT follow the `(country_id, metric, year, value)` pattern because the data model is fundamentally different.

### Pattern 7: Hook for Political Time-Series Data

**What:** Analogous to `useEconomyMetric.ts` — fetches from `political_data` by metric string.

```typescript
// src/hooks/usePoliticalMetric.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SPAIN_COUNTRY_ID } from '@/lib/constants';
import type { PoliticalDataPoint } from '@/types/politics';

export function usePoliticalMetric(metric: string) {
  const supabase = createClient();

  return useQuery<PoliticalDataPoint[]>({
    queryKey: ['political', metric],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('political_data')
        .select('year, value, source, source_url')
        .eq('country_id', SPAIN_COUNTRY_ID)
        .eq('metric', metric)
        .order('year', { ascending: true });

      if (error) throw new Error(error.message);

      return (data ?? []).map((row) => ({
        year: row.year as number,
        value: row.value !== null ? Number(row.value) : null,
        source: row.source as string,
        source_url: row.source_url as string,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

### Pattern 8: Salary Ratio Computation (Client-Side)

**What:** POLI-02 requires the ratio of politician salary ÷ median salary over time. Ratios are derived client-side from two already-fetched series — no separate DB metric needed.

```typescript
// In PoliticsSection.tsx or SalaryRatioChart.tsx

// Given fetched data arrays (real-adjusted values):
// presidentData: PoliticalDataPoint[]
// medianData: PoliticalDataPoint[] (from economic_indicators)

const ratioData = allYears.map(year => {
  const presVal = presidentData.find(d => d.year === year)?.value;
  const medianVal = medianData.find(d => d.year === year)?.value;

  return {
    year,
    presidentRatio: presVal && medianVal ? Number((presVal / medianVal).toFixed(2)) : null,
    ministerRatio:  ministerVal && medianVal ? Number((ministerVal / medianVal).toFixed(2)) : null,
    mpRatio:        mpVal && medianVal ? Number((mpVal / medianVal).toFixed(2)) : null,
  };
});
```

**When to use:** Salary ratio chart always uses real (inflation-adjusted) values. Ratio of real÷real = ratio of nominal÷nominal (same result), so displaying real ratios is consistent.

### Pattern 9: Advisor Count — DB Storage Decision

**What:** Advisor count is per government term, not per year. The `political_data` schema has `year` (SMALLINT). For term-based data, store one row per `year_start` of the term, with the bar label encoded as a separate string.

**Decision:** Store in `political_data` with:
- `metric = 'advisor_count'`
- `year = term_start_year` (e.g., 2004 for Zapatero's first term)
- `value = count`
- `unit = 'count'`
- `source = label|PM Name YYYY–YY` — encode the bar label in a special format OR store it in a separate column

**Problem:** `political_data` has no `label` column. Options:
1. Encode label in `source` field (hack — source is supposed to be a source name)
2. Create a separate `political_terms` table with a `label` column
3. Derive the label from a static mapping in code using the year

**Recommendation:** Use option 3 — derive the bar label in the component from a static constant mapping `year_start → label`. This avoids schema changes and keeps advisor count in `political_data`. The CSV seed includes a `term_label` column which the seed script reads but ignores for the DB insert; the label is stored in the component's constant.

```typescript
// In AdvisorCountChart.tsx — static mapping drives bar labels
const TERM_LABELS: Record<number, string> = {
  2004: 'Zapatero 2004–08',
  2008: 'Zapatero 2008–11',
  2011: 'Rajoy 2011–15',
  2015: 'Rajoy 2015–16',
  2016: 'Rajoy 2016–18',
  2018: 'Sánchez 2018–19',
  2019: 'Sánchez 2019–23',
  2023: 'Sánchez 2023–',
};
```

### Anti-Patterns to Avoid

- **Calling `useTranslations` inside chart components:** Pass all labels as props from the Server Component page — same pattern as Phase 2.
- **Storing pensions or revolving door data in `political_data`:** The generic schema cannot represent named individuals. Use the new dedicated tables.
- **Computing real salaries at query time:** Pre-compute and store in DB — avoids cross-table joins and complex client-side derivation.
- **Using `type="number"` on BarChart XAxis:** The advisor bar chart has string labels (PM name + years). Use the default `type="category"` on XAxis.
- **Hardcoding `country_id`:** Always use `SPAIN_COUNTRY_ID` from `src/lib/constants.ts` (value: 26).
- **Recharts `<Legend>` without `onClick`:** Without the click handler, legend items are decorative only. Interactive legend requires `<Legend onClick={handleLegendClick}>`.
- **`hide` prop causing axis recalculation:** When a line is hidden with `hide={true}`, its values may still be included in YAxis domain. If domain jumps are undesirable, use `includeHidden={false}` on `<YAxis>`. Test this behavior during implementation.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-series chart merging by year | Custom data transform function | Reuse `CpiChart` merge pattern from Phase 2 (exact same logic) | Already proven correct in EconomyChart.tsx |
| Legend toggle visibility | CSS `display: none` | Recharts `hide` prop on `<Line>` | Prop is declarative, connects to Legend state correctly |
| Loading states | Custom spinner | Tailwind `animate-pulse` skeleton (same as `EconomyChartSkeleton`) | Already in project; consistent UX |
| Data table styling | Custom CSS table | Tailwind utility classes (same card border/padding as economy charts) | Consistent with established design system |
| Inflation adjustment at runtime | Cross-table CPI query | Pre-compute real values during data seeding, store both nominal + real | Simpler, more performant, no cross-table dependency |

---

## Common Pitfalls

### Pitfall 1: `political_data` Cannot Store Pensions or Revolving Door Cases

**What goes wrong:** Trying to fit pension data (named person, role, pension amount) into the generic `(country_id, metric, year, value)` schema. The `source` field gets abused to encode names, which breaks the provenance requirement.
**Why it happens:** The initial Phase 1 schema was designed for time-series metrics. Pensions and revolving door cases are entity records, not metrics.
**How to avoid:** Create new migration with `political_pensions` and `revolving_door_cases` tables (see Pattern 6). Push migration BEFORE running seed script.
**Warning signs:** Seed script encounters errors trying to store non-numeric values; data queries require complex string parsing.

### Pitfall 2: BarChart XAxis Uses `type="number"` Instead of `type="category"`

**What goes wrong:** Setting `type="number"` on an XAxis with string labels causes Recharts to convert labels to NaN. Bars may not render or may cluster at position 0.
**Why it happens:** Phase 2 used `type="number"` for year-based XAxis. The advisor count chart has string labels (PM name + year range) — the default `type="category"` is correct.
**How to avoid:** Do NOT copy the `type="number"` XAxis from EconomyChart for the bar chart. Omit `type` entirely (defaults to "category") or explicitly set `type="category"`.
**Warning signs:** All bars render at the leftmost position; X-axis shows NaN labels.

### Pitfall 3: Recharts `hide` Prop Does Not Remove Line from YAxis Domain

**What goes wrong:** After hiding a line (e.g., the president's salary), the YAxis domain remains expanded to accommodate the hidden line's max value. This means the visible lines (median salary) appear compressed at the bottom.
**Why it happens:** Recharts documentation explicitly states: "can be included in axis domain calculations, depending on `includeHidden` props of your XAxis/YAxis."
**How to avoid:** Set `includeHidden={false}` on `<YAxis>` to exclude hidden lines from domain calculation. Test during implementation — this may or may not be desirable depending on the chart.
**Warning signs:** After clicking a legend to hide a high-value line, the remaining visible lines appear flattened.

### Pitfall 4: Multiple TanStack Query Calls for Salary Comparison Chart

**What goes wrong:** The salary comparison chart fetches up to 8 metrics (president_salary_nominal, president_salary_real, minister_salary_nominal, minister_salary_real, mp_salary_nominal, mp_salary_real, median_salary_nominal, median_salary_real). With the toggle, only 4 are shown at once, but all 8 may be loaded.
**Why it happens:** Pre-fetching both nominal and real variants eagerly before user toggles.
**How to avoid:** Fetch both real and nominal variants eagerly on page load (they cache independently in TanStack Query) — the data is small (15 rows each) and the staleTime is 5 minutes. The cost of 8 small queries is negligible. Alternatively, fetch only the currently selected variant and re-fetch on toggle (adds a loading flash on toggle). **Recommendation:** Fetch all 8 eagerly. No flicker on toggle.
**Warning signs:** Toggle between nominal/real shows a loading skeleton flash on every switch.

### Pitfall 5: Salary Ratio Chart Shows `Infinity` When Median Salary Is Zero or Null

**What goes wrong:** Computing `politician_salary / median_salary` throws `Infinity` or `NaN` when median is 0 or null for a given year.
**Why it happens:** Data quality — years with null median salary (gap years) cause division errors.
**How to avoid:** Always guard the division: `presVal && medianVal && medianVal !== 0 ? presVal / medianVal : null`. The null result renders as a chart gap (same `connectNulls={false}` pattern from Phase 2).
**Warning signs:** Chart renders a line that shoots to infinity or shows `Infinity` in tooltip.

### Pitfall 6: Pension Table Source Link Text Truncation

**What goes wrong:** BOE source URLs are long and overflow the table cell, breaking the table layout on narrow viewports.
**Why it happens:** `<a>` tags in table cells don't wrap by default.
**How to avoid:** Use `truncate` Tailwind class with `block max-w-[200px]` on the anchor. The link label should be "BOE" or a short string, not the full URL. Store a short `source` name ("BOE 2023") and the full URL separately.
**Warning signs:** Table overflows its container on mobile; horizontal scroll appears.

### Pitfall 7: Migration File Timestamp Collision

**What goes wrong:** The new migration file `20260227000003_political_tables.sql` uses a timestamp-based name. If another migration with the same prefix exists, Supabase CLI rejects the push.
**Why it happens:** The Phase 1 migrations used `20260226000001` and `20260226000002`. A new one on 2026-02-27 should use `20260227000001` or a padded suffix like `20260227000003`.
**How to avoid:** Use `20260227000003_political_tables.sql` (continuing the `000003` sequence regardless of date — Supabase sorts by lexicographic order). Do NOT use `supabase migration new` (generates different timestamps). Create the file manually with the exact name.
**Warning signs:** `supabase db push` rejects with "migration already applied" or "duplicate migration" error.

---

## Code Examples

Verified patterns from the existing project codebase and official sources:

### Recharts `hide` Prop on `<Line>` (Official Recharts API Docs)
```typescript
// Source: https://recharts.github.io/en-US/api/Line
// hide prop confirmed: "Hides the whole graphical element when true"
<Line
  dataKey="president"
  hide={hiddenKeys.has('president')}   // true = line hidden but still in legend
  stroke="#1E40AF"
  strokeWidth={2}
/>
```

### Recharts `<Legend onClick>` Handler Pattern (GitHub Discussion #3940)
```typescript
// Source: https://github.com/recharts/recharts/discussions/3940
const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

const handleLegendClick = (e: { dataKey?: string }) => {
  if (!e.dataKey) return;
  setHiddenKeys(prev => {
    const next = new Set(prev);
    next.has(e.dataKey!) ? next.delete(e.dataKey!) : next.add(e.dataKey!);
    return next;
  });
};

<Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer' }} />
```

### Supabase New Table Migration Pattern (Phase 1 precedent)
```sql
-- supabase/migrations/20260227000003_political_tables.sql
-- Do NOT use supabase migration new (timestamp mismatch)
-- Create file manually with exact filename

CREATE TABLE political_pensions (
  id                  BIGSERIAL   PRIMARY KEY,
  name                TEXT        NOT NULL,
  role                TEXT        NOT NULL,
  pension_annual_eur  NUMERIC     NOT NULL,
  years_in_office     SMALLINT    NOT NULL,
  exit_year           SMALLINT    NOT NULL,
  source              TEXT        NOT NULL,
  source_url          TEXT        NOT NULL
);

CREATE TABLE revolving_door_cases (
  id              BIGSERIAL   PRIMARY KEY,
  person_name     TEXT        NOT NULL,
  political_role  TEXT        NOT NULL,
  entity_moved_to TEXT        NOT NULL,
  year            SMALLINT    NOT NULL,
  source_url      TEXT        NOT NULL
);
```

### Nominal vs. Real Toggle State (React useState)
```typescript
// In SalaryComparisonChart.tsx
const [showReal, setShowReal] = useState(true);

// Toggle button renders in card header
<button
  onClick={() => setShowReal(r => !r)}
  className="text-xs px-2 py-1 rounded border border-surface-border text-gray-600 hover:bg-surface-muted"
>
  {showReal ? labels.switchToNominal : labels.switchToReal}
</button>

// Metric strings are conditionally computed
const presidentMetric = showReal ? 'president_salary_real' : 'president_salary_nominal';
```

### Supabase Query for political_pensions (sorted by exit_year DESC)
```typescript
// Source: @supabase/supabase-js official pattern
const { data, error } = await supabase
  .from('political_pensions')
  .select('name, role, pension_annual_eur, years_in_office, exit_year, source, source_url')
  .order('exit_year', { ascending: false });
```

### Supabase Query for revolving_door_cases (sorted newest first)
```typescript
// Source: @supabase/supabase-js official pattern
const { data, error } = await supabase
  .from('revolving_door_cases')
  .select('person_name, political_role, entity_moved_to, year, source_url')
  .order('year', { ascending: false });
```

---

## Data Reference for Seed CSV Files

The seed script must prepare CSV files for all political data. Data must come from official sources (BOE, Portal Transparencia, RTVE Transparencia, Transparencia Internacional España).

### Political Salary Time-Series (political_data table)

| Metric string | Description | Official Source | URL |
|---------------|-------------|-----------------|-----|
| `president_salary_nominal` | President annual gross salary (EUR, nominal) | BOE — Real Decreto retribuciones | https://www.boe.es/buscar/act.php?id=BOE-A-2014-5441 |
| `president_salary_real` | President annual gross salary (EUR, 2015-adjusted) | BOE nominal ÷ INE IPC base 2015 | Derived from above + INE IPC |
| `minister_salary_nominal` | Ministers average annual gross salary (EUR, nominal) | BOE | https://www.boe.es/buscar/act.php?id=BOE-A-2014-5441 |
| `minister_salary_real` | Ministers average salary (EUR, 2015-adjusted) | Derived | — |
| `mp_salary_nominal` | MPs average annual gross salary (EUR, nominal) | Congreso retribuciones | https://www.congreso.es/web/guest/retribuciones |
| `mp_salary_real` | MPs average salary (EUR, 2015-adjusted) | Derived | — |
| `advisor_count` | Count of political advisors per term | Portal Transparencia / Gobierno de España | https://transparencia.gob.es/ |

The national median salary for comparison is already seeded as `median_salary_real` in `economic_indicators`. A nominal variant (`median_salary_nominal`) needs to be added to `economic_indicators` as part of Phase 3 seeding.

### Pensions (political_pensions table)

| Person | Role | Source |
|--------|------|--------|
| Felipe González | Presidente del Gobierno | BOE + Fundación Felipe González disclosure |
| José María Aznar | Presidente del Gobierno | BOE |
| José Luis Rodríguez Zapatero | Presidente del Gobierno | BOE |
| Mariano Rajoy | Presidente del Gobierno | BOE |
| Former ministers with active pensions | Varies | BOE |

Source search: BOE section II — Autoridades y personal; search "pensión" + name.

### Revolving Door Cases (revolving_door_cases table)

Source: Transparencia Internacional España — "Informe sobre la puerta giratoria" and media investigations (El País, elDiario.es with verifiable dates and entity names). Limit to ~20–25 well-documented cases with clear source links.

---

## Phase 3 Plan Structure Recommendation

Based on Phase 2's 3-plan structure, Phase 3 should follow the same pattern:

| Plan | Scope | Key Output |
|------|-------|------------|
| 03-01 | DB migration (new tables) + data seed (all 5 CSVs + seed script) | `political_pensions`, `revolving_door_cases` tables deployed; all political_data metrics seeded; seed script committed |
| 03-02 | Types, hooks, data access layer | `types/politics.ts`, `hooks/usePoliticalMetric.ts`, `hooks/usePoliticalPensions.ts`, `hooks/useRevolvingDoorCases.ts`; i18n keys in messages/es.json + en.json |
| 03-03 | UI components + page route | All 5 sub-components; `PoliticsSection.tsx`; `app/[locale]/politics/page.tsx` |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts Legend: filter data array on click | Recharts `hide` prop on `<Line>` | Recharts v2+ | `hide` prop is the correct API; filtering data array requires re-merge computation |
| Recharts v2 XAxis `tick` string handling | v3 same API — no breaking change for XAxis | v3.0 (2024) | No migration needed for XAxis pattern |
| Recharts `<Cell>` for bar styling | `<Bar fill>` prop directly | v3.7.0 | `<Cell>` deprecated in v3; use `fill` on `<Bar>` for single-color bars |

**Deprecated/outdated:**
- Recharts `<Cell>` component: deprecated in v3.7.0 — do not use in Phase 3 bar charts. Use `fill="#3B82F6"` directly on `<Bar>`.
- Any `@supabase/auth-helpers-nextjs` imports: not used in this project (already on `@supabase/ssr`).

---

## Open Questions

1. **Advisor count data — term boundaries**
   - What we know: Government terms in Spain since 2004 are well-documented. Advisor count data requires manual compilation from Transparencia.gob.es reports.
   - What's unclear: Whether annual counts or term-total counts are published; some terms had early elections (2015 Rajoy minority government lasted only months).
   - Recommendation: Plan 03-01 should treat this as a manual data preparation task. The executor prepares the CSV; if partial data exists, store what is available and mark gap years as NULL.

2. **Median salary nominal variant**
   - What we know: `median_salary_real` is already seeded in `economic_indicators`. The salary comparison chart's nominal view requires `median_salary_nominal`.
   - What's unclear: Whether to add this to `economic_indicators` or derive it at runtime from `median_salary_real × CPI_index`.
   - Recommendation: Add `median_salary_nominal` to `economic_indicators` in the Plan 03-01 seed step. The INE data publishes nominal salary — it's the same source as real, just without CPI adjustment.

3. **Revolving door `source_url` requirement for all cases**
   - What we know: POLI-05 requires "linked to official or press source." The `revolving_door_cases` table has `source_url NOT NULL`.
   - What's unclear: Some cases may not have a single canonical URL (they appear in multiple news sources or only in books).
   - Recommendation: For cases without a direct URL, link to the most authoritative published source (Transparencia Internacional report PDF page, or the most detailed press investigation URL). Do not include cases with no verifiable URL.

4. **Interactive legend — visual feedback for hidden lines**
   - What we know: Recharts `hide` prop removes the line but legend item remains visible. There is no built-in "greyed out" style for hidden legend items.
   - What's unclear: Whether to visually grey out the legend text of a hidden line (better UX) or leave it at full opacity (simpler implementation).
   - Recommendation: Grey out hidden legend items using a custom `Legend` content renderer. Pass `hiddenKeys` set into the legend renderer and apply `opacity: 0.4` on items whose dataKey is in the set. This is Claude's discretion per CONTEXT.md.

---

## Sources

### Primary (HIGH confidence)
- Phase 2 existing implementation — `src/components/economy/EconomyChart.tsx`, `src/hooks/useEconomyMetric.ts`, `scripts/seed-economy.ts` — direct inspection of working code
- https://recharts.github.io/en-US/api/Line — `hide` prop confirmed: "Hides the whole graphical element when true"
- https://recharts.github.io/en-US/api/BarChart — BarChart API, Bar, XAxis category type
- https://supabase.com/docs/reference/javascript/select — `.order()` and `.eq()` pattern for structured queries
- Project schema `supabase/migrations/20260226000001_initial_schema.sql` — existing `political_data` table structure confirmed

### Secondary (MEDIUM confidence)
- https://github.com/recharts/recharts/discussions/3940 — maintainer confirmed `hide` prop approach for legend toggle; storybook example referenced
- https://github.com/recharts/recharts/issues/590 — legend toggle history; `hide` prop is the current solution over data-filtering workarounds
- https://transparencia.gob.es/ — data source for advisor counts (site confirmed; exact data format requires manual verification)
- https://www.boe.es/ — confirmed source for salary and pension official publications

### Tertiary (LOW confidence)
- Recharts `includeHidden` prop on `<YAxis>` — mentioned in API docs extract but not directly verified in official docs page; validate during implementation
- BOE salary data availability pre-2015 — historical BOE data varies in format; some years require PDF extraction (confirmed as a known concern in STATE.md)
- Transparencia Internacional España revolving door report URLs — need manual verification during data preparation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed in existing package.json; versions verified
- Architecture (new tables, migration pattern): HIGH — follows established Phase 1 schema pattern; two new tables required is a confirmed finding
- Recharts LineChart interactive legend (`hide` prop): HIGH — confirmed in official API docs
- Recharts BarChart with string XAxis: HIGH — standard Recharts API, no breaking changes in v3 for this usage
- Data sources (BOE, Transparencia): MEDIUM — official sources confirmed; exact data format/availability requires manual verification during seed preparation
- Pitfalls: HIGH — most sourced from existing Phase 2 research and official docs

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (Recharts v3 moves fast; re-verify if > 30 days pass)
