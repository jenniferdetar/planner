# Feature Specification: CSEA Pill Buttons

## User Stories*

### User Story 1 - Centered CSEA pills

**Acceptance Scenarios**:

1. **Given** the CSEA page is loaded, **When** the CTA area renders, **Then** the Grievance Form and Meeting Notes buttons appear on a single centered row using the global nav pill colors.
2. **Given** the user views the CSEA page on any viewport width, **When** the layout adapts, **Then** the two pills remain on one line without wrapping or overflowing the viewport.
3. **Given** the user hovers or focuses a pill, **When** interaction occurs, **Then** the pill uses the same hover/focus/active states as the global nav.
4. **Given** the user inspects the Grievance Form pill, **When** the icon renders, **Then** the chain/link icon matches current usage and the Meeting Notes pill remains text-only.

---

## Requirements*
- Location: `html/csea.html` buttons render as pill-shaped controls on a single centered row.
- Styling: use global nav colors for default/hover/focus/active states; shape matches nav pills (rounded edges).
- Icons/labels: Grievance Form includes existing chain/link icon; Meeting Notes is text-only; labels unchanged.
- Responsiveness: pills stay on one line at all viewport sizes without horizontal overflow; center aligned.
- Accessibility: focus styles mirror global nav; clickable/tap targets remain accessible.

## Success Criteria*
- Both pills display on one centered row in `csea.html` using global nav default styling.
- Hover/focus/active states visually match global nav pills.
- Grievance Form shows link icon; Meeting Notes has none.
- Layout remains single-line across viewport sizes without clipping or wrap.
- No regressions to other CSEA content or global nav styles.
