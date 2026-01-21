---
description: Repository Information Overview
alwaysApply: true
---

# January 2026 Planner Information

## Summary
Single-page static planner for January 2026 built entirely in `index.html`. The page renders a styled monthly calendar with a motivational banner and pulls event data from a Supabase table named `calendar_by_date`, constrained to the 2026-01-01 through 2026-01-31 range. Static recurring events (bills, holidays, committee meetings, quizzes) are defined in the client script and combined with database events fetched via the Supabase JavaScript client. Layout, typography, and interaction are pure HTML/CSS/vanilla JS with no bundling or build tooling. Deployment is configured for static hosting (Vercel) with URL rewriting to `index.html` and no install/build commands.

## Structure
- `index.html`: Main entry and only application file. Contains inline styles defining the calendar layout, color palette, badge styles, and typography (Google Fonts). Embeds Supabase initialization, event fetching, calendar rendering, and static event definitions. Generates a 7-column CSS grid, injects leading empty cells to align the first weekday, and renders day numbers, static items (bills, holidays, images), and Supabase-driven events with badge styling for budget/payday keywords.
- `vercel.json`: Vercel configuration with `cleanUrls: true`, `buildCommand: null`, `installCommand: null`, `framework: null`, and a rewrite routing all paths to `/index.html`, enabling SPA-style navigation for the static asset.
- `.zencoder/rules/`: Holds generated repository metadata (this report).
- `.zencoder/workflows/` and `.zenflow/workflows/`: Present but empty placeholders; no workflow definitions included.

## Language & Runtime
**Language**: HTML, CSS, and browser-based JavaScript
**Version**: Standard browser runtime; no transpilation. Supabase client loaded from CDN at `@supabase/supabase-js@2`.
**Build System**: None (static file served as-is)
**Package Manager**: None declared; dependencies pulled via CDN.

## Dependencies
**Main Dependencies**:
- `@supabase/supabase-js@2` via jsDelivr CDN, using `createClient` for database access.
- Google Fonts `Coming Soon` and `Plus Jakarta Sans` (imported from `fonts.googleapis.com`/`fonts.gstatic.com`).
- External image asset for MLK Day (`https://www.whitehouse.gov/.../MLK-Day-Hero.jpg?w=1536`).
- Browser DOM/Date APIs for grid construction and date calculations.

**Development Dependencies**:
- None specified (no package manifest or tooling configuration found).

## Build & Installation
```bash
No install command (vercel.json installCommand null)
No build command (vercel.json buildCommand null)
Deploy static root (index.html) via static hosting; Vercel rewrite sends all paths to /index.html with clean URLs
```

## Main Files & Resources
- `index.html` content highlights:
  - **Styling**: CSS custom properties define weekday color scheme (`--sunday #f88d8d`, `--monday #f5c27a`, `--tuesday #78c0aa`, `--wednesday #4a7c96`, etc.), border color, and font families. Layout includes `.planner-container` with bordered frame, `.days-header` grid with colored weekday headers, and `.calendar-grid` with gap-based separators. Badges (`.badge-budget`, `.badge-payday`) use gradients/solid fills for visual emphasis; `.mlk-day-img` provides holiday imagery with caption labels.
  - **Supabase configuration**: Hard-coded `SUPABASE_URL` (`https://hhhuidbnvbtllxcaiusl.supabase.co`) and public `SUPABASE_ANON_KEY` initialize the client. The script queries table `calendar_by_date` with `.select('*')` and date filters `gte('date','2026-01-01')` and `lte('date','2026-01-31')`, returning `data` for rendering; errors are logged to console and result fallback to empty list.
  - **Rendering flow**: `fetchEvents().then(renderCalendar);` drives initialization. `renderCalendar(events)` clears the calendar container, computes the weekday offset for January 1, 2026, and iterates days 1–31. For each day it builds HTML with day number, static events from `getStaticEvents(day)`, and database events filtered by matching `date` string. Budget-related titles get a gradient badge; payday-related titles get a teal badge; other entries render as simple text. Static events cover bills (HOA, mortgage, heloc, utilities, subscriptions), travel, committee meetings, quizzes, mentoring sessions, and holidays (with an image card for MLK Day and a label for New Year’s Day).
  - **Accessibility/UX**: Uses uppercase headers, letter spacing, and handwriting-style font for quotes and event list. Clean, printable layout with consistent padding and centered event text.
- `vercel.json` details: Indicates static deployment expectations (no install/build), cleans URLs, and rewrites all routes to `index.html`, ensuring the single-page experience works on direct deep links.
- `.zencoder/` and `.zenflow/` workflow folders: No YAML or JSON workflow definitions present; currently unused in runtime.

## Operations
- Hosting: Serve the repository root as static assets. Vercel will respect `cleanUrls` (omit `.html` in paths) and reroute all requests to `index.html`, so no server-side routing is needed.
- Data backend: Requires a Supabase project with table `calendar_by_date` exposing at least `date` (ISO string) and `title` (text) fields, since the renderer expects `e.date` and `e.title`. Public anon key in the client implies reliance on row-level security policies to protect data; ensure Supabase RLS rules permit the intended read scope for the date range.
- Updates: Static events are defined in `getStaticEvents(day)` inside `index.html`; modify this function to adjust recurring bills/holidays. Database-driven events require inserting rows into `calendar_by_date` within the specified date window.
