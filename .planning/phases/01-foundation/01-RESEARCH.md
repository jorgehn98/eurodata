# Phase 1: Foundation - Research

**Researched:** 2026-02-26
**Domain:** Next.js 14 App Router + next-intl i18n routing + Supabase SSR clients + DB schema migrations + TanStack Query + Tailwind CSS
**Confidence:** HIGH (core stack), MEDIUM (version-specific pitfalls)

## Summary

Phase 1 establishes four irreversible structural decisions that all downstream phases depend on: i18n routing via next-intl, Supabase client architecture (browser + server), database schema via migration files, and the translation-key discipline enforced from day one. These four cannot be retrofitted — an App Router project built without `[locale]` in the directory tree requires a full restructure to add it later, and a Supabase schema deployed without migration files cannot be version-controlled retroactively.

The stack (Next.js 14 App Router, next-intl, Supabase SSR, TanStack Query, Tailwind CSS) is fully mature in 2026. next-intl is at v4.8.3 (released February 2026) with breaking changes from v3 in API surface (ESM-only, new type registration pattern). The requirement specifies Next.js 14, which next-intl v4 supports via its `>=13` peer dependency. Supabase SSR requires the `@supabase/ssr` package (not the deprecated `@supabase/auth-helpers-nextjs`) and two distinct client factories: `createBrowserClient` for Client Components and `createServerClient` for Server Components/Actions/Route Handlers.

The database schema design decision to store `source TEXT`, `source_url TEXT`, and use `NULL` (never `0`) for missing values is a data quality convention that must be encoded as NOT NULL constraints on source columns and left nullable on metric values — migration files enforce this at the Postgres level rather than trusting application code alone.

**Primary recommendation:** Scaffold in this exact order: (1) create-next-app with TypeScript + Tailwind, (2) install and wire next-intl middleware and `[locale]` directory before any page content, (3) install `@supabase/ssr` and create both client factories, (4) write migration files for all tables and push to Supabase, (5) seed `countries` table with EU-27. Any deviation from this order risks building pages that must be restructured.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Project deployed to Vercel with automatic CI/CD on push to main | Vercel for GitHub integration: connect repo once, every push to main triggers production build; preview deployments auto-created for PRs |
| INFRA-02 | Next.js 14 App Router with TypeScript configured with strict mode | `create-next-app --typescript` scaffolds tsconfig.json with strict: true; reactStrictMode defaults to true in App Router since Next.js 13.5.1 |
| INFRA-03 | Supabase project connected (browser client + server client for SSR) | `@supabase/ssr` package: `createBrowserClient` for 'use client' components, `createServerClient` for Server Components/Actions; middleware proxy for cookie refresh |
| INFRA-04 | Bilingual routing via next-intl (`/es/...` and `/en/...` with locale detection middleware) | next-intl v4.8.3: `defineRouting()` in i18n/routing.ts, `createMiddleware(routing)` in middleware.ts (called proxy.ts in v4 docs), `[locale]` dynamic segment in app directory |
| INFRA-05 | All UI strings use `t('key')` — zero hardcoded Spanish or English in components | next-intl `useTranslations()` hook in Client Components, `getTranslations()` in Server Components; translation files in `messages/es.json` and `messages/en.json` |
| INFRA-06 | Database schema created via migration files: all five data tables | Supabase CLI: `supabase migration new <name>` creates timestamped SQL file in `supabase/migrations/`; `supabase db push` deploys to remote project |
| INFRA-07 | `countries` table seeded with EU-27 country codes, names (ES + EN), and flag emoji | 27 countries confirmed (AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE); seed via `supabase/seed.sql` or a separate migration |
| INFRA-08 | Tailwind CSS configured with custom design tokens for dashboard palette | `tailwind.config.ts` `theme.extend.colors` for custom palette; v3 (not v4) ships with create-next-app by default when selecting Tailwind |
| INFRA-09 | TanStack Query provider configured at root layout | `QueryClientProvider` in `'use client'` wrapper component; wrap `app/[locale]/layout.tsx` body; use `useState(() => new QueryClient())` to avoid shared state between requests |
| DATA-01 | Every metric stores `source TEXT` and `source_url TEXT` | Encode as `NOT NULL` columns on all metric tables in migration SQL; prevents incomplete ingestion silently passing |
| DATA-02 | Missing data stored as NULL, never 0 | Metric value columns left nullable (`NUMERIC` without `NOT NULL`); application + ETL layer must respect this; charts must handle null gaps (Phase 2+) |
| DATA-03 | All metric values normalized to canonical units during ingestion | Enforced in ingestion code (Phase 6), but column types and COMMENT in migration SQL can document the expected unit (e.g., `-- EUR/year`, `-- rate per 100k`) |
| DATA-04 | Historical data seed covers at minimum 10 years | Seed SQL in `supabase/seed.sql`; Phase 1 only requires schema + countries table; full historical data is seeded in Phases 2–4 per section |
| DATA-05 | `sync_log` table records when each data source was last successfully updated | Simple table: `id`, `source_name`, `source_url`, `synced_at TIMESTAMPTZ`, `status` (success/failure), `error_message TEXT`; created via migration file |
| UX-05 | Language switcher accessible from all pages | `LocaleSwitcher` Client Component using `usePathname` + `useRouter` from `@/i18n/navigation`; call `router.replace(pathname, { locale: newLocale })` then `router.refresh()`; mount in locale layout so it appears on every page |
| UX-06 | Dashboard has navigation between all 5 sections | Nav component (sidebar or top bar) mounted in `[locale]/layout.tsx`; links use `Link` from `@/i18n/navigation` so they preserve locale prefix automatically |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 14.x | React framework with App Router | Project constraint; Vercel's own framework; App Router is the modern default |
| typescript | 5.x | Type safety | Bundled with create-next-app; strict mode catches i18n and Supabase typing issues |
| next-intl | 4.8.3 (latest) | i18n routing, translations, locale detection | Dominant App Router i18n library; framework-native; supports Server Components |
| @supabase/supabase-js | 2.x | Supabase JS client | Official client; used by both SSR utilities |
| @supabase/ssr | latest | SSR-safe browser and server client factories | Replaced deprecated `@supabase/auth-helpers-nextjs`; required for Next.js App Router |
| @tanstack/react-query | 5.x | Server state management, caching, loading states | Project constraint; v5 is stable; pairs with Supabase query hooks |
| tailwindcss | 3.x | Utility CSS with design tokens | Project constraint; v3 is the create-next-app default (v4 is opt-in) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| supabase CLI | latest | Migration file management, local dev, db push | Required for `supabase migration new` and `supabase db push` |
| @tanstack/react-query-devtools | 5.x | Query debugging in dev | Include in Providers.tsx, only renders in development |
| postcss | bundled | Tailwind processing | Auto-configured by create-next-app |
| eslint-config-next | bundled | Linting | Enforces no-hardcoded-text patterns when combined with i18n lint rules |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-intl | next-i18next | next-i18next is Pages Router-first; App Router support is unofficial and requires workarounds |
| next-intl | i18next + react-i18next | Works but requires manual routing integration; next-intl owns the routing layer natively |
| @supabase/ssr | @supabase/auth-helpers-nextjs | auth-helpers is deprecated; SSR package is the official replacement |
| Tailwind v3 | Tailwind v4 | v4 uses CSS-first config (no tailwind.config.ts); breaking change; project constraint specifies Tailwind — v3 is safer for Next.js 14 |
| TanStack Query v5 | SWR | Project constraint specifies TanStack Query; SWR has less control over cache invalidation |

**Installation:**
```bash
# Scaffold
npx create-next-app@14 eurodata --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# i18n
npm install next-intl

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# TanStack Query
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## Architecture Patterns

### Recommended Project Structure

```
eurodata/
├── messages/
│   ├── es.json                # Primary language (Spanish)
│   └── en.json                # Secondary language (English)
├── supabase/
│   ├── migrations/            # Timestamped SQL migration files
│   │   ├── 20260226000001_initial_schema.sql
│   │   └── 20260226000002_seed_countries.sql
│   └── seed.sql               # Dev seed data (optional)
├── src/
│   ├── app/
│   │   └── [locale]/          # ALL routes live here
│   │       ├── layout.tsx     # Root locale layout (nav + providers)
│   │       ├── page.tsx       # Home / dashboard entry
│   │       └── ...            # Section pages added in later phases
│   ├── components/
│   │   ├── ui/                # Reusable primitives (button, card, etc.)
│   │   └── layout/            # Nav, LocaleSwitcher, Sidebar
│   ├── i18n/
│   │   ├── routing.ts         # defineRouting({locales, defaultLocale})
│   │   ├── navigation.ts      # createNavigation(routing) — locale-aware Link, useRouter
│   │   └── request.ts         # getRequestConfig — loads messages per locale
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts      # createBrowserClient (Client Components)
│   │       └── server.ts      # createServerClient (Server Components)
│   └── providers/
│       └── QueryProvider.tsx  # 'use client' TanStack Query wrapper
├── middleware.ts              # next-intl locale detection + redirect
└── next.config.ts             # createNextIntlPlugin() wrapper
```

### Pattern 1: next-intl Locale Routing

**What:** All routes nested under `src/app/[locale]/` with middleware handling locale detection and redirect from `/` to `/es/` or `/en/` based on Accept-Language header and cookie.

**When to use:** Always — this is the mandatory structure for next-intl App Router routing.

**Example:**
```typescript
// src/i18n/routing.ts
// Source: https://next-intl.dev/docs/routing/setup
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es'  // Spanish is primary language
});
```

```typescript
// middleware.ts (project root)
// Source: https://next-intl.dev/docs/routing/setup
import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
```

```typescript
// src/i18n/navigation.ts
// Source: https://next-intl.dev/docs/routing/setup
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
// Use these instead of next/navigation equivalents — they auto-prefix locale
```

```typescript
// src/i18n/request.ts
// Source: https://next-intl.dev/docs/routing/setup
import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {locale};
});
```

```typescript
// next.config.ts
// Source: https://next-intl.dev/docs/usage/plugin
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {};
export default withNextIntl(nextConfig);
```

```typescript
// src/app/[locale]/layout.tsx
// Source: https://next-intl.dev/docs/routing/setup
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          {/* Nav and LocaleSwitcher go here */}
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Pattern 2: Language Switcher

**What:** A Client Component that reads the current pathname (without locale prefix) and calls `router.replace(pathname, { locale })` to switch locale without a full reload.

**When to use:** Mounted in `[locale]/layout.tsx` so it appears on every page.

**Example:**
```typescript
// src/components/layout/LocaleSwitcher.tsx
// Source: https://next-intl.dev/docs/routing/navigation
'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    if (newLocale !== locale) {
      router.replace(pathname, {locale: newLocale});
      router.refresh();
    }
  };

  return (
    <div>
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          disabled={loc === locale}
          className={loc === locale ? 'font-bold' : ''}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

### Pattern 3: Supabase SSR Dual Clients

**What:** Two separate factory files — one for Client Components (browser), one for Server Components/Actions. Never use the browser client in a server context.

**When to use:** Always. The SSR package requires this split due to different cookie handling contexts.

**Example:**
```typescript
// src/lib/supabase/client.ts
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client
import {createBrowserClient} from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
```

```typescript
// src/lib/supabase/server.ts
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({name, value, options}) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookie writes ignored (handled by middleware)
          }
        }
      }
    }
  );
}
```

### Pattern 4: TanStack Query Provider

**What:** A `'use client'` wrapper component that creates a `QueryClient` per-request (via `useState`) and wraps children with `QueryClientProvider`.

**When to use:** Wrap the entire `[locale]/layout.tsx` body content so all client components have access to the query client.

**Example:**
```typescript
// src/providers/QueryProvider.tsx
// Source: https://tanstack.com/query/v5/docs/framework/react/examples/nextjs
'use client';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {useState} from 'react';

export default function QueryProvider({children}: {children: React.ReactNode}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,  // 1 minute — data is mostly static
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Pattern 5: Database Migration Files

**What:** SQL migration files created via Supabase CLI, committed to version control, and applied to the remote project via `supabase db push`.

**When to use:** All schema changes must go through migration files — never apply ad-hoc SQL directly to the remote project.

**Example:**
```sql
-- supabase/migrations/20260226000001_initial_schema.sql
-- Source: https://supabase.com/docs/guides/local-development/overview

CREATE TABLE countries (
  id        SERIAL PRIMARY KEY,
  code      CHAR(2)     NOT NULL UNIQUE,       -- ISO 3166-1 alpha-2
  name_es   TEXT        NOT NULL,
  name_en   TEXT        NOT NULL,
  flag_emoji TEXT       NOT NULL
);

CREATE TABLE economic_indicators (
  id          BIGSERIAL   PRIMARY KEY,
  country_id  INTEGER     NOT NULL REFERENCES countries(id),
  metric      TEXT        NOT NULL,            -- e.g. 'median_salary_real'
  year        SMALLINT    NOT NULL,
  value       NUMERIC,                         -- NULL = data not available
  unit        TEXT        NOT NULL,            -- e.g. 'EUR/year'
  source      TEXT        NOT NULL,
  source_url  TEXT        NOT NULL,
  UNIQUE (country_id, metric, year)
);

CREATE TABLE political_data (
  id          BIGSERIAL   PRIMARY KEY,
  country_id  INTEGER     NOT NULL REFERENCES countries(id),
  metric      TEXT        NOT NULL,
  year        SMALLINT    NOT NULL,
  value       NUMERIC,                         -- NULL = data not available
  unit        TEXT        NOT NULL,
  source      TEXT        NOT NULL,
  source_url  TEXT        NOT NULL,
  UNIQUE (country_id, metric, year)
);

CREATE TABLE crime_statistics (
  id          BIGSERIAL   PRIMARY KEY,
  country_id  INTEGER     NOT NULL REFERENCES countries(id),
  metric      TEXT        NOT NULL,            -- e.g. 'homicide_rate_per_100k'
  year        SMALLINT    NOT NULL,
  value       NUMERIC,                         -- NULL = data not available
  unit        TEXT        NOT NULL,
  source      TEXT        NOT NULL,
  source_url  TEXT        NOT NULL,
  UNIQUE (country_id, metric, year)
);

CREATE TABLE migration_data (
  id          BIGSERIAL   PRIMARY KEY,
  country_id  INTEGER     NOT NULL REFERENCES countries(id),
  metric      TEXT        NOT NULL,
  year        SMALLINT    NOT NULL,
  value       NUMERIC,                         -- NULL = data not available
  unit        TEXT        NOT NULL,
  source      TEXT        NOT NULL,
  source_url  TEXT        NOT NULL,
  UNIQUE (country_id, metric, year)
);

CREATE TABLE sync_log (
  id              BIGSERIAL       PRIMARY KEY,
  source_name     TEXT            NOT NULL,
  source_url      TEXT,
  synced_at       TIMESTAMPTZ     NOT NULL DEFAULT now(),
  status          TEXT            NOT NULL CHECK (status IN ('success', 'failure')),
  error_message   TEXT            -- NULL on success
);
```

```sql
-- supabase/migrations/20260226000002_seed_countries.sql
INSERT INTO countries (code, name_es, name_en, flag_emoji) VALUES
  ('AT', 'Austria',        'Austria',        '🇦🇹'),
  ('BE', 'Bélgica',        'Belgium',        '🇧🇪'),
  ('BG', 'Bulgaria',       'Bulgaria',       '🇧🇬'),
  ('HR', 'Croacia',        'Croatia',        '🇭🇷'),
  ('CY', 'Chipre',         'Cyprus',         '🇨🇾'),
  ('CZ', 'Chequia',        'Czechia',        '🇨🇿'),
  ('DK', 'Dinamarca',      'Denmark',        '🇩🇰'),
  ('EE', 'Estonia',        'Estonia',        '🇪🇪'),
  ('FI', 'Finlandia',      'Finland',        '🇫🇮'),
  ('FR', 'Francia',        'France',         '🇫🇷'),
  ('DE', 'Alemania',       'Germany',        '🇩🇪'),
  ('GR', 'Grecia',         'Greece',         '🇬🇷'),
  ('HU', 'Hungría',        'Hungary',        '🇭🇺'),
  ('IE', 'Irlanda',        'Ireland',        '🇮🇪'),
  ('IT', 'Italia',         'Italy',          '🇮🇹'),
  ('LV', 'Letonia',        'Latvia',         '🇱🇻'),
  ('LT', 'Lituania',       'Lithuania',      '🇱🇹'),
  ('LU', 'Luxemburgo',     'Luxembourg',     '🇱🇺'),
  ('MT', 'Malta',          'Malta',          '🇲🇹'),
  ('NL', 'Países Bajos',   'Netherlands',    '🇳🇱'),
  ('PL', 'Polonia',        'Poland',         '🇵🇱'),
  ('PT', 'Portugal',       'Portugal',       '🇵🇹'),
  ('RO', 'Rumanía',        'Romania',        '🇷🇴'),
  ('SK', 'Eslovaquia',     'Slovakia',       '🇸🇰'),
  ('SI', 'Eslovenia',      'Slovenia',       '🇸🇮'),
  ('ES', 'España',         'Spain',          '🇪🇸'),
  ('SE', 'Suecia',         'Sweden',         '🇸🇪');
```

### Pattern 6: Translation File Structure

**What:** JSON files under `messages/` keyed by page/component namespace, consumed via `useTranslations('Namespace')`.

**Example:**
```json
// messages/es.json
{
  "Navigation": {
    "economy": "Economía",
    "politics": "Clase Política",
    "immigration": "Inmigración",
    "crime": "Criminalidad",
    "comparator": "Comparador"
  },
  "LocaleSwitcher": {
    "label": "Idioma"
  },
  "HomePage": {
    "title": "EuroData",
    "subtitle": "Datos oficiales. Sin editoriales."
  }
}
```

```json
// messages/en.json
{
  "Navigation": {
    "economy": "Economy",
    "politics": "Political Class",
    "immigration": "Immigration",
    "crime": "Crime",
    "comparator": "Comparator"
  },
  "LocaleSwitcher": {
    "label": "Language"
  },
  "HomePage": {
    "title": "EuroData",
    "subtitle": "Official data. No editorials."
  }
}
```

### Anti-Patterns to Avoid

- **Root-level `app/` without `[locale]`:** If you scaffold routes at `app/page.tsx` before wiring next-intl, you will need to move every file into `app/[locale]/`. Do the i18n setup first.
- **Using `next/link` and `next/navigation` directly:** These don't know about locales. Always use `Link`, `useRouter`, `usePathname` from `@/i18n/navigation`.
- **Hardcoding locale strings in components:** Even one `"Economía"` literal in a component makes INFRA-05 fail code review. Use `t('key')` exclusively.
- **Using `@supabase/auth-helpers-nextjs`:** This package is deprecated. Use `@supabase/ssr` exclusively.
- **Using the browser client in Server Components:** Will fail or produce stale data. The server client uses `cookies()` from `next/headers`; use it in Server Components and Route Handlers.
- **Creating schema via Supabase dashboard UI without exporting as migration:** The dashboard's Table Editor does not create migration files. Any table created this way is invisible to version control.
- **Applying ad-hoc SQL to remote without migration file:** Breaks sync between local and remote; future `supabase db reset` will not reproduce the state.
- **`queryClient` created outside `useState` at module level:** Causes state to be shared across SSR requests in Next.js. Always use `useState(() => new QueryClient())`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale detection from Accept-Language | Custom middleware parsing | `createMiddleware(routing)` from next-intl | next-intl uses RFC 4647 `@formatjs/intl-localematcher` for best-fit; handles cookie persistence, redirect loops, and static routes |
| Locale-aware Link component | Wrapping next/link with locale prefix | `Link` from `@/i18n/navigation` | Auto-prefixes locale, handles locale changes, avoids double-prefix bugs |
| Browser/server Supabase client split | Two manual client configs | `createBrowserClient` / `createServerClient` from `@supabase/ssr` | Handles cookie-based session tokens correctly in both contexts |
| Translation loading | Fetching JSON manually | next-intl's `getRequestConfig` + `messages` pattern | Integrates with Server Component rendering and static rendering |
| Migration file versioning | Manual SQL scripts | Supabase CLI `supabase migration new` | Generates timestamps, tracks applied state, supports `db push` and `db reset` |

**Key insight:** The i18n routing layer is the most deceptive "simple" problem in this phase. Custom solutions break on: redirect loops at the root, static pre-rendering, `Link` double-prefixing, and cookie-based locale persistence. next-intl handles all of these.

## Common Pitfalls

### Pitfall 1: middleware.ts in wrong location

**What goes wrong:** Middleware is placed inside `src/app/` instead of the project root (or `src/`). Next.js only runs middleware found at the root or `src/` level.

**Why it happens:** Confusion about App Router file conventions — special files like `layout.tsx` live in `app/`, but `middleware.ts` is a Next.js root convention.

**How to avoid:** Place `middleware.ts` at the project root (same level as `package.json`) or inside `src/` if using src-dir layout. The Supabase middleware for token refresh must also live at this level.

**Warning signs:** Locale detection does not trigger; all routes serve the default locale with no redirect.

### Pitfall 2: next-intl v4 ESM-only breaks next.config.js (CommonJS)

**What goes wrong:** next-intl v4 is ESM-only, but `next.config.js` still uses CommonJS (`require()`). The `createNextIntlPlugin` import fails.

**Why it happens:** next-intl v4 dropped CJS output (except for `next-intl/plugin` which remains dual-format for this exact reason).

**How to avoid:** Use `next.config.ts` (TypeScript) with `import` syntax, or use `next.config.mjs`. The `next-intl/plugin` entry is specifically kept CJS-compatible, but the cleanest solution is migrating `next.config` to TypeScript.

**Warning signs:** Build error: "require() of ES Module" or "The 'next-intl/plugin' package could not be found."

### Pitfall 3: `params` must be awaited in Next.js 14+ App Router layouts

**What goes wrong:** In newer Next.js builds, `params` in layouts and pages is a `Promise<{locale: string}>`. Destructuring it directly without `await` gives undefined locale.

**Why it happens:** Next.js changed `params` to be a Promise as part of async-first RSC model (Next.js 15+). next-intl v4 documentation reflects this in examples.

**How to avoid:** Always `await params`: `const {locale} = await params;` in layout/page components.

**Warning signs:** `locale` is `undefined`; `notFound()` is triggered for every request; middleware runs but routes still fail.

### Pitfall 4: Supabase middleware missing causes authentication cookie staleness

**What goes wrong:** Without a Supabase middleware that calls `supabase.auth.getClaims()` (or the `updateSession` utility), auth tokens expire and are not refreshed. For this project (no auth), this pitfall is less critical, but the middleware is still needed for cookie-based session context in SSR queries.

**Why it happens:** Next.js Server Components cannot write cookies, so a middleware proxy is needed to intercept the response and refresh the token before it reaches the Server Component.

**How to avoid:** Since this project uses Supabase purely for data (no user auth), a simplified middleware that only chains the next-intl middleware with Supabase cookie handling is sufficient. Keep them as separate middleware or compose them.

**Warning signs:** Supabase server client throws "Auth session missing" or returns stale results.

### Pitfall 5: Schema deployed without migration files

**What goes wrong:** Tables created via Supabase dashboard cannot be reproduced by running `supabase db reset` locally. Team members or future redeploys start from an empty database.

**Why it happens:** Dashboard Table Editor does not generate migration SQL. It modifies the remote directly.

**How to avoid:** Always use `supabase migration new <name>` → write SQL in the generated file → `supabase db push`. Or use `supabase db diff` to capture changes made in the dashboard and export them as a migration.

**Warning signs:** `supabase db reset` locally does not produce the same tables as production.

### Pitfall 6: `useTranslations` in Server Components requires async variant

**What goes wrong:** `useTranslations` is a hook — hooks cannot be called in Server Components. Using it in a Server Component causes a React error.

**Why it happens:** The distinction between Client and Server Components is easy to confuse when starting out.

**How to avoid:** In Server Components, use `const t = await getTranslations('Namespace')` from `next-intl/server`. In Client Components (marked `'use client'`), use `useTranslations('Namespace')`.

**Warning signs:** Error: "Hooks can only be called inside of the body of a function component."

### Pitfall 7: Tailwind v4 installed instead of v3

**What goes wrong:** Newer scaffolding tools may default to Tailwind v4, which uses CSS-first configuration (`@theme` in CSS) instead of `tailwind.config.ts`. v4's config approach is incompatible with v3 patterns the project may follow.

**Why it happens:** Tailwind CSS released v4 in 2025. create-next-app may start defaulting to v4 in newer scaffolding versions.

**How to avoid:** Verify installed version with `npm list tailwindcss`. If v4, check that dashboard palette design tokens are configured via `@theme` in CSS. If v3, use `theme.extend.colors` in `tailwind.config.ts`. Pin the version explicitly in `package.json`.

**Warning signs:** `tailwind.config.ts` has no effect; custom colors not applied.

## Code Examples

Verified patterns from official sources:

### Using translations in a Server Component

```typescript
// Source: https://next-intl.dev/docs/usage/configuration
import {getTranslations} from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('HomePage');
  return <h1>{t('title')}</h1>;
}
```

### Using translations in a Client Component

```typescript
// Source: https://next-intl.dev/docs/usage/configuration
'use client';
import {useTranslations} from 'next-intl';

export default function NavItem() {
  const t = useTranslations('Navigation');
  return <span>{t('economy')}</span>;
}
```

### Supabase query in a Server Component (data fetch)

```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client
import {createClient} from '@/lib/supabase/server';

export default async function CountriesPage() {
  const supabase = await createClient();
  const {data: countries, error} = await supabase
    .from('countries')
    .select('code, name_es, name_en, flag_emoji')
    .order('name_es');

  if (error) throw error;
  return <pre>{JSON.stringify(countries, null, 2)}</pre>;
}
```

### Supabase migration: deploy to remote

```bash
# Source: https://supabase.com/docs/guides/local-development/overview

# Create a new migration file
supabase migration new initial_schema

# Edit the generated SQL file in supabase/migrations/

# Push to remote Supabase project
supabase db push

# Verify applied migrations
supabase migration list
```

### Vercel deployment: connect GitHub repo

```bash
# Source: https://vercel.com/docs/git/vercel-for-github
# Done via Vercel dashboard — no CLI steps needed for initial CI/CD:
# 1. vercel.com → New Project → Import Git Repository → select repo
# 2. Configure: Framework Preset = Next.js (auto-detected)
# 3. Environment Variables: add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# 4. Deploy — subsequent pushes to main auto-deploy
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2023-2024 | auth-helpers is deprecated; SSR package is the official standard |
| `middleware.ts` (next-intl < v4) | `proxy.ts` (v4 docs call it this) | next-intl v4 (2026) | Conceptual rename in docs; Next.js still uses `middleware.ts` filename; functionally identical |
| next-intl `getTranslator` | `getTranslations` | next-intl v3 | Async Server Component ergonomics; v4 continues same API |
| `queryClient` at module scope | `useState(() => new QueryClient())` | React Query v5 / Next.js App Router | Prevents shared state between SSR requests |
| Tailwind `tailwind.config.js` | `tailwind.config.ts` | Tailwind v3+ | TypeScript config preferred; type inference for theme values |
| Pages Router i18n (`i18n` in next.config) | next-intl with App Router `[locale]` segment | Next.js 13 App Router | Built-in Pages Router i18n is incompatible with App Router |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr`. Do not install.
- `next-i18next`: Pages Router-centric. Does not natively support App Router Server Components.
- next-intl `getTranslator`: Replaced by `getTranslations` since v3. v4 removed the old API.
- next.config.js `i18n` block (Next.js built-in): Only works with Pages Router. App Router ignores it.

## Open Questions

1. **next-intl v4 vs project requirement for Next.js 14**
   - What we know: next-intl v4.8.3 lists peer dependency `next >= 13`; v4 documentation examples show Next.js 15 `params` as `Promise<>` (which is also present in Next.js 14 with `--experimental-typedRoutes` or recent builds).
   - What's unclear: Whether the `Promise<params>` pattern in layout components is required in Next.js 14.x or only Next.js 15+. If Next.js 14 does not return `params` as a Promise, the `await params` pattern would be a no-op (still safe) rather than required.
   - Recommendation: Use `await params` in all layouts regardless. It is safe in both versions and future-proofs against Next.js 15 upgrade. Alternatively, pin Next.js to `14.x` but use `next-intl@3.x` to avoid any v4/Next.js 14 edge cases, since next-intl v3 was explicitly built for Next.js 14 App Router.

2. **Supabase middleware composition with next-intl middleware**
   - What we know: Both next-intl and Supabase need a middleware at the same level. Next.js only supports one `middleware.ts` file.
   - What's unclear: The cleanest way to compose both (next-intl locale detection + Supabase token refresh) in a single middleware.
   - Recommendation: Since this project has no user auth (public read-only dashboard), the Supabase middleware for token refresh is not strictly needed in Phase 1. Use only the next-intl middleware in `middleware.ts`. If Supabase auth is ever added later, compose by calling `supabase.auth.getSession()` inside the same middleware function after `createMiddleware(routing)` runs.

3. **Tailwind version: v3 or v4**
   - What we know: create-next-app with Tailwind may install v3 or v4 depending on the version of create-next-app used. v4 uses CSS-first config.
   - What's unclear: Which version `npx create-next-app@14` installs in early 2026.
   - Recommendation: After scaffolding, run `npm list tailwindcss` to confirm the version. If v4 is installed and the team prefers v3 conventions (`tailwind.config.ts`), pin to v3: `npm install tailwindcss@3`. If v4 is acceptable, use `@theme` CSS variables for design tokens. The research finding "v3 is the create-next-app default" applies to older create-next-app versions; verify after scaffolding.

## Sources

### Primary (HIGH confidence)
- https://next-intl.dev/docs/routing/setup - Locale routing setup, middleware, navigation, layout patterns
- https://next-intl.dev/blog/next-intl-4-0 - v4 breaking changes (ESM-only, AppConfig type registration, GDPR cookie, reduced bundle)
- https://supabase.com/docs/guides/auth/server-side/creating-a-client - createBrowserClient, createServerClient, @supabase/ssr package
- https://supabase.com/docs/guides/local-development/overview - Migration CLI commands, supabase/migrations/ structure
- https://vercel.com/docs/git/vercel-for-github - Automatic CI/CD from GitHub push to main
- https://next-intl.dev/docs/getting-started/app-router - App Router setup with plugin

### Secondary (MEDIUM confidence)
- https://tanstack.com/query/v5/docs/framework/react/examples/nextjs - TanStack Query v5 Next.js App Router pattern (useState QueryClient)
- https://www.npmjs.com/package/next-intl - Package page confirming v4.8.3 as latest (as of February 2026)
- https://next-intl.dev/docs/routing/navigation - Language switcher pattern with usePathname + useRouter

### Tertiary (LOW confidence)
- Community search results re: Tailwind v3 vs v4 in create-next-app defaults — contradictory across sources; verify post-scaffold

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages are official, versions confirmed from npm/GitHub
- Architecture: HIGH — patterns sourced directly from next-intl and Supabase official docs
- DB schema design: HIGH — straightforward PostgreSQL; data quality conventions (NULL vs 0, NOT NULL on source) are simple and unambiguous
- Pitfalls: MEDIUM — some (middleware location, ESM issue) sourced from docs; others (params Promise in Next.js 14) are inferred from version matrix and warrant verification during scaffolding

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (30 days — stack is stable; next-intl v4 is recent so check for patch releases)
