---
phase: 01-foundation
plan: "01"
subsystem: infra
tags: [nextjs, typescript, tailwindcss, vercel, ci-cd]

requires: []
provides:
  - Next.js 14.2.35 App Router project with TypeScript strict mode
  - Tailwind v3 with brand/surface/chart color palette
  - Vercel CI/CD pipeline connected to jorgehn98/eurodata master branch
  - Production URL https://eurodata.vercel.app/
  - .env.local.example documenting required Supabase environment variables
affects:
  - 01-02 (i18n layer — will restructure src/app/ under [locale])
  - 01-03 (Supabase — needs NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel env vars)
  - all-phases (every plan builds on this Next.js 14 + TypeScript + Tailwind foundation)

tech-stack:
  added:
    - next@14.2.35
    - react@18
    - typescript@5
    - tailwindcss@3.4.x
    - postcss@8
    - eslint@8 + eslint-config-next@14.2.35
  patterns:
    - App Router (src/app/) — all pages use React Server Components by default
    - TypeScript strict mode — noImplicitAny, strictNullChecks enforced
    - Tailwind v3 theme.extend.colors — design tokens in config, not CSS variables
    - ESM config — next.config.mjs with export default (not CommonJS require)

key-files:
  created:
    - package.json
    - tsconfig.json
    - tailwind.config.ts
    - next.config.mjs
    - postcss.config.mjs
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
    - .gitignore
    - .env.local.example
    - vercel.json
  modified:
    - tailwind.config.ts (added brand/surface/chart color tokens)
    - src/app/globals.css (stripped to Tailwind directives only)
    - next.config.mjs (added next-intl comment, clean export)
    - tsconfig.json (jsx set to "preserve" for Next.js 14 App Router)

key-decisions:
  - "next.config stays as .mjs (not .ts) — Next.js 14 resolves .mjs before .ts, and .mjs avoids a type import edge case with the next-intl plugin coming in Plan 02"
  - "Tailwind v3 color tokens in theme.extend.colors, not CSS custom properties — avoids Tailwind v4 migration confusion and keeps tokens colocated with config"
  - "Production branch is master (not main) — matches Vercel connection; all future plans must push to master"

patterns-established:
  - "Tailwind token pattern: brand.primary, brand.secondary, brand.accent, brand.neutral for UI; chart.blue/teal/orange/purple/red/green for data visualization"
  - "Environment vars pattern: NEXT_PUBLIC_ prefix for client-visible Supabase keys; documented in .env.local.example"

requirements-completed: [INFRA-01, INFRA-02, INFRA-08]

duration: ~2 sessions (human-action checkpoints required for TTY scaffolding and Vercel dashboard)
completed: 2026-02-27
---

# Phase 1 Plan 01: Next.js 14 Project Scaffold + Vercel CI/CD Summary

**Next.js 14.2.35 App Router with TypeScript strict mode, Tailwind v3 EuroData color palette, and Vercel CI/CD auto-deploying master to https://eurodata.vercel.app/**

## Performance

- **Duration:** ~2 sessions (blocked at human-action checkpoints)
- **Started:** 2026-02-27T00:00:00Z
- **Completed:** 2026-02-27
- **Tasks:** 3/3
- **Files modified:** 11

## Accomplishments

- Next.js 14.2.35 scaffolded with TypeScript strict mode (`strict: true`) — `npx tsc --noEmit` exits 0
- Tailwind v3 configured with full EuroData dashboard color palette (brand, surface, chart tokens)
- Vercel project connected to `jorgehn98/eurodata` master branch — every push auto-deploys to production
- Production URL confirmed live: https://eurodata.vercel.app/
- `.env.local.example` documents the two Supabase keys required for Plan 03

## Task Commits

Each task was committed atomically:

1. **Task 1: Create GitHub repo and scaffold Next.js project** - `30e8443` (chore) — human-performed
2. **Task 1 fix: Pin to Next.js 14 and restore next.config.mjs** - `5195d12` (fix) — human-performed
3. **Task 2: Configure Tailwind design tokens and next.config.ts** - `65d70f8` (feat)
4. **Task 3: Add vercel.json and activate CI/CD pipeline** - `f838ff2` (feat)

## Files Created/Modified

- `package.json` — next@14.2.35, react@18, typescript@5, tailwindcss@3.4.x, eslint@8
- `tsconfig.json` — strict: true, jsx: "preserve", moduleResolution: bundler, @/* alias
- `tailwind.config.ts` — brand/surface/chart color tokens, v3 theme.extend.colors format
- `next.config.mjs` — clean ESM export with next-intl comment placeholder
- `src/app/globals.css` — Tailwind directives only (@tailwind base/components/utilities)
- `src/app/layout.tsx` — root layout with Inter font
- `src/app/page.tsx` — default home page (will be replaced in Plan 02 with [locale] routing)
- `.env.local.example` — NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- `.gitignore` — .env*.local, .next/, .vercel/, node_modules, *.tsbuildinfo
- `vercel.json` — framework: nextjs, buildCommand: npm run build, outputDirectory: .next
- `postcss.config.mjs` — tailwindcss + autoprefixer plugins

## Decisions Made

1. **next.config stays .mjs**: create-next-app generated `.mjs`; user reverted when `.ts` caused a Vercel build issue. `.mjs` is the stable choice for Next.js 14 — next-intl plugin in Plan 02 will work with both formats.

2. **Tailwind v3 confirmed at 3.4.x**: `npm list tailwindcss` shows `tailwindcss@3.4.19`. No downgrade was needed. The plan's fallback (downgrade from v4) was not triggered.

3. **Production branch is master**: Vercel is connected to the `master` branch (not `main`). All plan pushes must target `master`.

4. **Node.js version**: Next.js 14.2.35 (latest patch) is installed. Vercel infers Node.js version from its platform defaults.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] next.config.mjs restored after .ts conversion caused Vercel build failure**
- **Found during:** Task 2 (next.config.ts creation) / Task 3 (Vercel deployment)
- **Issue:** Agent replaced `next.config.mjs` with `next.config.ts`. While this passed local build, user's Vercel deployment encountered an issue and reverted the change.
- **Fix:** User manually reverted to `next.config.mjs` (commit `5195d12`). Agent accepted this and proceeded — `.mjs` satisfies the plan's intent (TypeScript-style export default with ESM syntax).
- **Files modified:** next.config.mjs (restored), next.config.ts (removed)
- **Verification:** `npm run build` passes, Vercel deployment succeeds
- **Committed in:** `5195d12` (user commit), `f838ff2` (task 3 commit proceeds without conflict)

---

**Total deviations:** 1 auto-accepted (config format)
**Impact on plan:** No functional impact. next.config.mjs with `export default` satisfies all must-haves. next-intl (Plan 02) supports both .mjs and .ts configs.

## Issues Encountered

- `create-next-app@14` scaffolded with Next.js 16.1.6 initially (npm resolves @14 as latest stable 16 due to tag aliasing). User pinned to `next@14.2.35` explicitly — correct behavior, no data loss.
- `next.config.ts` was generated by agent but caused a Vercel deployment issue — user reverted to `.mjs`. Both are valid; `.mjs` retained.

## User Setup Required

**For Plan 03 (Supabase):** After creating the Supabase project, add the following to Vercel environment variables (Settings → Environment Variables):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Also create `.env.local` locally from `.env.local.example`.

## Next Phase Readiness

- App Router foundation is clean and builds successfully
- No content pages exist yet inside `src/app/` — ready for Plan 02 to insert `[locale]` routing
- Tailwind color tokens are in place — all dashboard components in later phases can reference `brand.*`, `surface.*`, `chart.*`
- Vercel CI/CD active — every push to `master` deploys automatically
- **IMPORTANT for Plan 02:** The `src/app/` directory currently has only `layout.tsx` and `page.tsx` — do NOT add any routes before Plan 02 restructures under `[locale]`

---
*Phase: 01-foundation*
*Completed: 2026-02-27*

## Self-Check: PASSED

- FOUND: .planning/phases/01-foundation/01-01-SUMMARY.md
- FOUND: vercel.json (`f838ff2`)
- FOUND: .env.local.example (`65d70f8`)
- FOUND: tailwind.config.ts (`65d70f8`)
- FOUND: next.config.mjs (`5195d12`)
- Commits verified: 30e8443, 65d70f8, 5195d12, f838ff2
