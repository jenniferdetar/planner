# Technical Specification: Update CSEA Hub Pages

## Technical Context
- **Language**: HTML5, CSS3, Vanilla JavaScript.
- **Environment**: Static site (served by Cloudflare Pages/Vercel).
- **Structure**: Sub-directory `public/csea/` for CSEA-related modules.

## Technical Implementation Brief
We will create five new HTML files in `public/csea/` by copying templates from `public/html/`. Each file will be modified to:
1. Use absolute paths for global assets (CSS/JS).
2. Update the sidebar to point to CSEA-specific sub-pages.
3. Mark the "CSEA" sidebar item as active.
4. Remove any "Calendar" specific elements or scripts that might cause the page to render as a calendar.

## Source Code Structure
New files to be created:
- `public/csea/finance.html` (from `public/html/finance.html`)
- `public/csea/health.html` (from `public/html/health.html`)
- `public/csea/hoa.html` (from `public/html/hoa.html`)
- `public/csea/icaap.html` (from `public/html/icaap.html`)
- `public/csea/planning.html` (from `public/html/planning.html`)

## Contracts
### Sidebar Contract
The sidebar in `public/csea/*.html` must follow this structure:
```html
<aside class="planner-sidebar">
  <a href="/index.html" class="planner-sidebar-item">Home</a>
  <a href="/csea/index.html" class="planner-sidebar-item active">CSEA</a>
  <a href="finance.html" class="planner-sidebar-item">Finance</a>
  <a href="health.html" class="planner-sidebar-item">Health</a>
  <a href="hoa.html" class="planner-sidebar-item">HOA</a>
  <a href="icaap.html" class="planner-sidebar-item">iCAAP</a>
  <a href="planning.html" class="planner-sidebar-item">Planning</a>
</aside>
```
Note: Sub-pages are relative to `/csea/`.

### Asset Paths
All `<link>` and `<script>` tags should use absolute paths starting with `/` to ensure they load correctly from any sub-directory.
Example: `<link rel="stylesheet" href="/css/opus-core.css">`

## Delivery Phases
1. **Phase 1: Finance Page**: Create `public/csea/finance.html` and verify paths and sidebar.
2. **Phase 2: Remaining Pages**: Create `health.html`, `hoa.html`, `icaap.html`, and `planning.html` in `public/csea/`.
3. **Phase 3: Sidebar Consistency**: Ensure `public/csea/index.html` sidebar matches the new sub-pages.

## Verification Strategy
- **Visual Check**: Open the pages in a browser (if possible) or check the generated HTML source.
- **Link Check**: Verify that all `href` and `src` attributes are correct.
- **Grepping**: Search for any remaining relative paths that might be broken.
- **Bash Verification**: Use `ls` to confirm file existence and `grep` to confirm content updates.
