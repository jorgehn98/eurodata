# Phase 3: Political Class Section - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Display factual, year-by-year comparison between political compensation (salaries, pensions, advisors, revolving door cases) and citizen purchasing power in Spain. All data sourced from official records (BOE, Transparencia Internacional). Creating data automation is a separate phase; this phase uses manually seeded data.

</domain>

<decisions>
## Implementation Decisions

### Page structure
- Single scrollable page — same pattern as the Economy section
- Section order (top to bottom): Salary comparison → Salary ratio → Advisor count → Pensions → Revolving door
- Same intro pattern as Economy section: section title + short neutral description at top
- In-page anchor navigation at Claude's discretion (based on content length)

### Salary comparison chart
- 4 lines on one chart: President, Ministers (average), MPs (average), National Median Salary
- Full year range displayed: 2010 through latest available year — no truncation
- Nominal vs. real (inflation-adjusted) toggle — user can switch between views
- Interactive legend — clicking a legend item toggles that line on/off (same pattern as Phase 2 charts)

### Salary ratio chart
- Separate chart below the salary comparison — shows politician salary ÷ median salary over time
- One line per politician role (President, Ministers, MPs) — ratios as Y-axis, years as X-axis
- (Exact chart type and interaction at Claude's discretion, consistent with above)

### Advisor count
- Bar chart — one bar per government term
- Each bar labeled: PM name + year range (e.g., "Zapatero 2004–08")
- Hover tooltip shows exact count
- No table accompanying the chart

### Pensions display
- Table format with columns: Name | Role | Annual pension (EUR) | Years in office | Source (BOE link)
- No comparison column (no "X× median" ratio) — raw amounts with source attribution only
- Sorted at Claude's discretion (likely by most recent exit from office)

### Revolving door list
- Card list — one card per case, vertically stacked
- Fields per card: Person name, Political role held, Entity moved to, Year, Source link
- Sorted: reverse chronological (newest case first)
- No filter or search — static list; manual curation keeps it under ~30 entries

### Neutral title enforcement (POLI-07)
- All chart titles describe the data axis only — no editorial conclusion implied
- Applies to all 5 sub-sections; specific wording at Claude's discretion following this rule

### Claude's Discretion
- In-page anchor nav (decide based on total page length)
- Salary ratio chart type and exact interaction
- Pension table sort order
- Exact chart colors and spacing (match Economy section style)
- Loading skeleton and error state design (match Phase 2 pattern)

</decisions>

<specifics>
## Specific Ideas

- No specific product references given — open to standard approaches consistent with Phase 2 Economy section visual style
- Salary comparison chart should be the most prominent visual on the page (hero chart of the section)

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-political-class-section*
*Context gathered: 2026-02-27*
