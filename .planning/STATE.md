# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-26)

**Core value:** Citizens can verify, with official sources linked, how their purchasing power and quality of life have evolved over time compared to the political class that governs them.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 7 (Foundation)
Plan: 0 of 4 in current phase
Status: Ready to plan
Last activity: 2026-02-26 — Roadmap created; all 61 v1 requirements mapped to 7 phases

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: none yet
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-phase]: i18n (next-intl) MUST be configured in Phase 1 — App Router routing tree cannot be restructured after the fact
- [Pre-phase]: Data unit normalization rules (EUR/year for salaries, rate per 100k for crime) must be established in DB schema before any data is ingested
- [Pre-phase]: Missing data stored as NULL, never 0 — enforced at ETL ingestion layer
- [Pre-phase]: All chart titles must be strictly neutral (describe axis, not conclusion) — political sensitivity defense
- [Pre-phase]: Manual CSV seeds for v1 while automated ETL is built in Phase 6 — don't automate wrong data

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 2]: Eurostat dataset codes for each economy metric need manual research during planning (e.g., earn_ses_pub4s, ilc_li02) — cannot be assumed
- [Phase 3]: BOE historical data structure varies by year; pre-2015 data may require manual PDF extraction — scope to be assessed during Phase 3 planning
- [Phase 4]: Frontex data format changes annually; UNODC Excel structure varies — verify during immigration/crime planning

## Session Continuity

Last session: 2026-02-26
Stopped at: Roadmap written; STATE.md initialized; REQUIREMENTS.md traceability updated
Resume file: None
