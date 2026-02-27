# Phase 2: Economy Section - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Interactive historical charts for 5 economic metrics about Spain: median real salary, fiscal burden, housing ratio, CPI by category, and poverty risk. Each chart covers at minimum 2014–2024, is linked to its official Spanish source, and renders in both Spanish and English. Data seeding, query layer, and UI are all in scope. Country comparison and filtering are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Chart layout & page structure
- Single column, stacked — one chart per row, full-width
- Page opens with section title + 1-2 sentence intro text (sets context before charts)
- Each chart sits in a card: title above the chart, source name + clickable URL below the chart
- Chart order: Claude's discretion based on logical narrative flow

### Chart style & visual feel
- Chart type: line chart with filled area below the line
- Colors: Claude's discretion — pick from the `chart.*` Tailwind tokens defined in Phase 1, one distinct color per metric
- Visual detail: clean — light gridlines, year labels on X-axis, value labels on Y-axis, no dot markers on the line
- Chart height: ~320px tall (generous — trend is easy to read without squinting)

### Missing data & empty states
- Missing year (gap in data): break the line — visible gap in the area/line, no interpolation
- Hover near gap: tooltip shows "No data available for [year]"
- Entire metric has no data: show the card with "Data not yet available" message in place of the chart (card stays in layout, no shifting)
- Loading state: skeleton card — grey animated shimmer placeholder matching chart card dimensions, no layout shift on data arrival

### Claude's Discretion
- Chart order for the 5 metrics (narrative logic preferred)
- Specific color assigned to each metric from chart.* token group
- Exact skeleton animation implementation
- Y-axis value formatting per metric (e.g. "€" prefix for salary, "%" suffix for fiscal burden and poverty risk)

</decisions>

<specifics>
## Specific Ideas

- No specific visual references provided — open to clean dashboard aesthetic consistent with the design tokens from Phase 1
- Source attribution must be a clickable link that opens the official data page in a new tab (not just source name text)

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-economy-section*
*Context gathered: 2026-02-27*
