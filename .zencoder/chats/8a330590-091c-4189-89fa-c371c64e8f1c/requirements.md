# Feature Specification: Update CSEA Hub Pages

## User Stories

### User Story 1 - Access CSEA Sub-pages
**As a user**, I want to navigate to the Finance, Health, HOA, iCAAP, and Planning pages within the CSEA section, **so that** I can see relevant information for each category instead of being redirected to the Calendar.

**Acceptance Scenarios**:

1. **Given** I am on the CSEA Tracker page, **When** I click "Finance" in the sidebar, **Then** I should see the Finance Hub page at `/csea/finance.html`.
2. **Given** I am on any CSEA sub-page (e.g., `/csea/health.html`), **When** I look at the sidebar, **Then** the links should point to other pages within the `/csea/` directory.

---

## Requirements

1. **Create Sub-pages**: Create the following files in `public/csea/`:
   - `finance.html`
   - `health.html`
   - `hoa.html`
   - `icaap.html` (replace the redirect)
   - `planning.html`
2. **Use Templates**: Use the corresponding files from `public/html/` as the initial templates for these pages.
3. **Fix Relative Paths**: Update all CSS, JS, and image references to use absolute paths (starting with `/`) or correct relative paths (e.g., `../css/...`) since they are now in a subdirectory.
4. **Sidebar Navigation**:
   - The sidebar should reflect that the user is within the CSEA section.
   - Links to other CSEA sub-pages should be relative (e.g., `health.html`) or point to the correct `/csea/` path.
   - The "CSEA" link in the sidebar should be marked as `active`.
5. **Remove Calendar Overwrite**: Ensure the `calendar-embed.js` script (if included) does not overwrite the content of these pages with a calendar view.

## Success Criteria

- Navigating to `/csea/finance.html` shows the "Finance Hub" content.
- Navigating to `/csea/health.html` shows the "Health" content.
- Navigating to `/csea/hoa.html` shows the "HOA" content.
- Navigating to `/csea/icaap.html` shows the "iCAAP Hub" content (no longer redirects).
- Navigating to `/csea/planning.html` shows the "Planning" content.
- All styles and scripts load correctly on these new pages.
- Sidebar links work correctly between these pages.
