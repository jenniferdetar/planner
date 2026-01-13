# Technical Specification: CSEA Pill Buttons

## Technical Context
- Stack: Vanilla HTML/CSS/JS; no build tools or external deps. Styling via `css/opus-core.css` + page-specific CSS.
- Target page: `html/csea.html` with associated `css/csea.css` and possibly `js/csea.js` for interactions.
- Global nav styles define colors and pill shape; reuse those custom properties/classes.

## Technical Implementation Brief
- Identify existing global nav pill styles (colors, radius, hover/focus/active) in core CSS; reuse or create shared class applied to the two CSEA buttons.
- Update `html/csea.html` CTA section to render Grievance Form (with link icon) and Meeting Notes as inline pills on one centered row.
- Ensure pills do not wrap at any viewport width: use flex container centered with spacing and responsive constraints; avoid overflow.
- Apply global nav interaction states to both pills; keep Grievance Form icon intact, Meeting Notes text-only.

## Source Code Structure
- `html/csea.html`: markup for the two buttons/links within the CTA area, grouped in a flex container.
- `css/opus-core.css`: source of global nav colors and pill styles; reference class names/custom properties.
- `css/csea.css`: page-specific overrides to center layout, enforce single-row pill alignment, spacing, sizing; may add helper class if core lacks reusable class.
- `js/csea.js` (if present): no expected changes unless needed for accessibility adjustments (not anticipated).

## Contracts
- UI contract: Two CTAs appear side-by-side, centered, pill-shaped with global nav default/hover/focus/active colors. Grievance Form includes existing chain/link icon; Meeting Notes is text-only.
- Layout contract: Container uses a no-wrap centered flex row; pills remain on one line at all viewport sizes without overflow.
- Interaction contract: Hover/focus/active states match global nav (colors, focus ring if present). Tab order remains logical.

## Delivery Phases
1) Styling reuse audit: locate global nav pill classes/variables in `css/opus-core.css`; note colors, radius, state styles.
2) Markup alignment: adjust `html/csea.html` CTA markup to place both buttons inside a centered flex container on one line; preserve icon/text per contract.
3) Style application: apply/reuse pill class; add `css/csea.css` rules (or shared class) to enforce single-line layout, spacing, and state parity.
4) Responsive verification: validate layout at narrow and wide widths to confirm no wrap/overflow and consistent states.

## Verification Strategy
- Manual checks in browser (no automated tests in repo):
  - Open `html/csea.html` via Live Server (port 5501) or file URL; ensure both pills are centered on one line at various viewport widths.
  - Hover/focus/active states visually match global nav pills; tab through to confirm focus ring matches.
  - Grievance Form shows link icon; Meeting Notes text-only.
- Lint/tests: none available; no build.
- MCP/Helpers: none required for static HTML/CSS; optional screenshot compare if available, otherwise visual inspection.
- Sample artifacts: not needed.
