# Pitfalls Research

**Domain:** Civic data transparency dashboard (EU political + economic + crime data)
**Researched:** 2026-02-26
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: External API Schema Changes Break Silent Syncs

**What goes wrong:**
Eurostat or INE changes their JSON response structure. The ETL function runs, receives a 200 OK, parses incorrectly, and upserts null/garbage values — silently overwriting valid historical data.

**Why it happens:**
Eurostat's SDMX-JSON format has evolved over time. Dataset codes are reorganized. The `dimension` key structure changes. Without validation, parsers extract wrong fields with no error.

**How to avoid:**
- Validate every API response with zod before upsert
- Use `safeParse` (not `parse`) — on failure, log and abort the sync entirely
- Never `ON CONFLICT DO UPDATE` nulls — add `WHERE excluded.value IS NOT NULL` to upsert

**Warning signs:**
- Eurostat sync logs show success but `updated_at` advances with no `rows_affected` change
- Chart shows sudden gap or flat line at a specific year
- Metric value jumps to 0 unexpectedly

**Phase to address:** Phase 1 (database schema) + data pipeline phases

---

### Pitfall 2: Retrofitting i18n After Build

**What goes wrong:**
All UI strings are hardcoded in Spanish. 3 phases in, adding English means extracting every string from dozens of components, rebuilding routing (`/[locale]/...`), and rewriting metadata.

**Why it happens:**
i18n feels like "we can add it later." In Next.js App Router, the locale segment affects the entire routing tree — retrofitting requires restructuring `app/` directory.

**How to avoid:**
- Set up next-intl + `[locale]` routing in Phase 1, day 1
- Even if only Spanish exists initially, use `t('metric.median_salary')` not `"Salario Mediano"`
- Create `messages/es.json` and `messages/en.json` from the start (EN can be identical to ES temporarily)

**Warning signs:**
- Components use hardcoded Spanish strings
- `app/` directory has no `[locale]` segment
- `middleware.ts` has no locale detection logic

**Phase to address:** Phase 1 (project setup) — cannot be deferred

---

### Pitfall 3: Mixing Official Data Units Across Sources

**What goes wrong:**
Eurostat reports median salary in EUR/year. INE reports in EUR/month. OCDE reports PPP-adjusted in USD. Stored without normalization → comparison charts show Spanish salary as 12x higher than reported.

**Why it happens:**
Each data source uses its own conventions. Developers store the raw value without documenting the unit and don't discover the mismatch until a chart looks obviously wrong.

**How to avoid:**
- Define canonical unit for each metric in `constants/metrics.ts` (e.g., `median_salary: { unit: 'EUR/year', source_unit_map: { eurostat: 'EUR/year', INE: 'EUR/month' } }`)
- Transform to canonical unit during ETL, never on frontend
- Store `unit` alongside `value` in the DB for auditability

**Warning signs:**
- Metrics from different sources show implausible ratios
- `value` column stores raw numbers without documented unit
- ETL functions don't mention unit conversion

**Phase to address:** Phase 1 (database schema) + ETL functions

---

### Pitfall 4: Political Data Without Year Granularity

**What goes wrong:**
Political salary data is stored as current value without year. Historical comparison ("politicians' salaries vs citizens over 20 years") becomes impossible.

**Why it happens:**
Political compensation data is harder to scrape historically. The easy path: store "current salary" and move on.

**How to avoid:**
- `political_data` table must have `year INTEGER NOT NULL` — enforce at DB level
- Source historical political salary data from: BOE (Boletín Oficial del Estado) PDFs, parliamentary records, academic papers on political compensation
- Accept gaps in early years — a partial historical series is better than no history

**Warning signs:**
- `political_data` table has no `year` column
- Chart shows only current year data point for political figures
- "Evolution over time" comparison is missing political data points

**Phase to address:** Database schema phase + Political data ingestion phase

---

### Pitfall 5: Crime/Immigration Data Without Methodological Consistency

**What goes wrong:**
Crime rate for Spain uses Ministerio del Interior definition of "robbery." Germany uses a different legal classification. Chart shows Germany with "higher crime" when the difference is definitional.

**Why it happens:**
Civic dashboards treat crime/immigration statistics as comparable when methodologies differ significantly by country.

**How to avoid:**
- Restrict crime comparisons to Eurostat/UNODC standardized datasets (they normalize definitions across countries)
- Avoid direct comparison of national crime statistics with different legal systems
- For immigration: distinguish Eurostat-standardized "first residence permits" from national "asylum applications" — not the same

**Warning signs:**
- Crime data sourced from multiple national ministries without standardization
- No note about which Eurostat dataset code was used
- Immigration figures from Frontex mixed with INE resident registration figures

**Phase to address:** Crime and immigration data ingestion phases

---

### Pitfall 6: Missing Data vs Zero Data

**What goes wrong:**
Country X has no data for 2018 GDP indicator → stored as `0` → chart shows country had zero GDP that year.

**Why it happens:**
Default null handling in ETL: `value ?? 0` seems safe but treats missing data as zero.

**How to avoid:**
- Store missing data as `NULL` in DB, never as `0`
- Frontend: render gap in line chart (Recharts supports `connectNulls={false}`)
- Add tooltip: "No data available for this year"
- ETL: explicitly check for Eurostat's `:` notation (= missing/confidential) and insert NULL

**Warning signs:**
- Line charts show sudden drop to zero for a country in a specific year
- ETL code uses `?? 0` for numeric values
- No distinction between "truly zero" and "no data" in the DB

**Phase to address:** Phase 1 (database schema) — `value NUMERIC NULL` not `NOT NULL`

---

### Pitfall 7: Political Controversy Risk from Framing

**What goes wrong:**
Even with "zero opinion" data, chart titles, color choices, or sorting order can imply narrative. "Politicians earn 4x more than citizens (2024)" is a factual title that will attract accusations of bias.

**Why it happens:**
Wanting to make data "easy to understand" leads to value-laden framing, even when technically accurate.

**How to avoid:**
- Chart titles: describe the axis, not the conclusion ("Median annual salary by role, Spain, 2014–2024")
- Color: use neutral palette — avoid red for politicians, green for citizens
- Sort: alphabetical or chronological by default, not by magnitude (magnitude sorting implies ranking)
- Never use words: "alarming," "shocking," "despite," "yet"

**Warning signs:**
- Chart titles include comparisons or judgments in the title text
- Red/green used for political vs citizen comparison
- Social media captions include editorial commentary

**Phase to address:** UI/UX phase — enforce as design system rule

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding year ranges (2014-2024) | Faster development | Breaks when data reaches 2025 | Never — use `MAX(year)` from DB |
| Manual CSV import for all sources | Avoids ETL complexity | Data becomes stale; trust erodes | Phase 1 seed only — automate by Phase 2 |
| Skipping unit normalization | Faster ETL | Silent comparison errors | Never |
| No migration files, using Supabase Studio | Faster schema iteration | Changes untracked; undoable | Never after Phase 1 |
| Hardcoded country list | No lookup table needed | Hard to add countries | Only during development |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Eurostat API | Fetching by dataset URL without knowing the dataset code | Research dataset codes at `ec.europa.eu/eurostat/databrowser` before building ETL |
| Eurostat API | Assuming consistent format across all datasets | Each dataset has different `dimension` structure; write dataset-specific parser |
| INE API | Using the deprecated XML API | Use the newer JSON REST API at `servicios.ine.es/wstempus/js/` |
| OCDE API | Assuming SDMX-JSON = Eurostat SDMX-JSON | OCDE uses different nesting; write separate parser |
| Supabase pg_cron | Cron expression timezone | pg_cron runs in UTC; schedule syncs at off-peak hours (6 AM UTC) |
| Supabase Edge Functions | Hitting Eurostat with 100 parallel requests | Eurostat may rate-limit; use `p-limit(5)` for max 5 concurrent requests |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No DB indexes on filter columns | Country comparator takes 3+ seconds | Add indexes: `(country_code, metric, year)` composite index | >100k rows in table |
| Fetching all metrics on page load | Economy page loads 500ms+ | Fetch only metrics needed for visible section | Always — implement from start |
| TanStack Query with no stale time | Refetches on every window focus | Set `staleTime: 1000 * 60 * 60` (1 hour) for historical data | Immediately noticeable in UX |
| ISR revalidation on all pages simultaneously | Supabase connection spike at revalidation time | Stagger revalidation: economia=3600, politica=7200, crimen=86400 | High traffic sites |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing Supabase service role key in client | Full DB write access from browser | Service role only in Edge Functions server-side; anon key for browser |
| No RLS on political_data table | If auth added later, all data exposed | Enable RLS from day 1 even if policy is `USING (true)` for public read |
| Allowing raw SQL in API routes | SQL injection | Always use parameterized queries; never string interpolation |
| Cron credentials in Edge Function code | Secret rotation is painful | Use Supabase Vault for API keys used in Edge Functions |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Charts with no loading skeleton | Blank space → user thinks page is broken | Always show Tremor skeleton/placeholder while data loads |
| Mobile chart overflow | X-axis labels overlap; chart unreadable | Use abbreviated year labels on mobile; horizontal scroll for comparison charts |
| No "data not available" state | Empty chart → user confused | Explicit "No data available for [Country] before [Year]" message |
| Source URL opens in same tab | User loses their place | All source links: `target="_blank" rel="noopener noreferrer"` |
| Year range not persisted across sections | User sets 2014-2024 in Economy; navigates to Crime; range resets | Zustand store persists across section navigation |

## "Looks Done But Isn't" Checklist

- [ ] **Bilingual:** All UI strings use `t()` from next-intl — verify no hardcoded Spanish remains in components
- [ ] **Source attribution:** Every MetricCard shows source name + URL + last_updated — verify no metric is "anonymous"
- [ ] **Historical charts:** Lines show 10+ years of data — verify ETL seeded full historical range, not just recent years
- [ ] **Missing data:** Null values render as gaps in charts, not zeros — verify with a metric that has known gaps
- [ ] **Country comparator:** URL reflects selected countries — verify shareable URL loads same state
- [ ] **Mobile:** Charts are readable on 375px width — verify on Safari iOS (Recharts has iOS-specific responsive issues)
- [ ] **ETL error handling:** Failed sync logs error and preserves existing data — verify by intentionally breaking API call

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| i18n not set up from start | HIGH | Restructure `app/` directory; extract all strings; 2-3 days work |
| Data unit mismatch discovered late | MEDIUM | Rewrite ETL transforms; re-run historical sync; update DB values |
| External API schema break | LOW | Fix zod schema; re-run sync; no data corruption if failsafe was in place |
| DB schema without migrations | MEDIUM | Reconstruct migration files from current schema diff; enforce going forward |
| Political framing controversy | HIGH | Update all chart titles and colors; PR/comms response if public; hard to recover trust |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| API schema changes break syncs | ETL pipeline phases | Intentionally pass malformed response; verify sync aborts |
| i18n retrofit | Phase 1 (project setup) | Verify zero hardcoded strings in components |
| Unit normalization | Phase 1 (DB schema) + ETL | Cross-check Spain median salary with known Eurostat figure |
| Political data without year granularity | DB schema phase | Query `SELECT DISTINCT year FROM political_data` — must show 10+ years |
| Crime data methodology inconsistency | Crime data phase | Verify all crime data uses single Eurostat dataset code |
| Missing data vs zero data | Phase 1 (DB schema) | Insert known-missing metric; verify chart shows gap not zero |
| Political controversy framing | UI/UX phase | Review all chart titles against neutral language rule |

## Sources

- Eurostat API documentation — dataset code organization, SDMX-JSON format changes
- UNODC methodology documentation — crime statistic standardization across countries
- Next.js i18n docs — App Router routing requirements
- Civic data dashboard post-mortems (Our World in Data engineering blog)
- Spanish BOE historical data — political salary historical records
- Supabase docs — Edge Functions security, Vault, pg_cron timezone behavior

---
*Pitfalls research for: civic data transparency dashboard (EU political + economic data)*
*Researched: 2026-02-26*
