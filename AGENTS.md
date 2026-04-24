Keep all code clean and to a minimum. Check all code to minimize constant re-writing all files every time a change happens.

---
description: Repository Information Overview
alwaysApply: true
---

# January 2026 Planner Information

## Summary
Single-page static planner for 2026 (primarily focusing on January and April) served as plain HTML/CSS/vanilla JavaScript. The page renders a monthly calendar fed by MongoDB Atlas data (`calendar_by_date` collection) merged with dynamic recurring events (bills, paydays, budget reminders) and hardcoded significant events.

## Structure
- `index.html`: Main application file.
- `shared.js`: Contains common logic, MongoDB integration (via Realm), and calendar event fetching/generation logic.
- `vercel.json`: Static hosting configuration with `cleanUrls: true`, `buildCommand: null`, `installCommand: null`, `framework: null`, and a catch-all rewrite to `/index.html` for SPA-style deep links.
- `.zencoder/rules/`: Holds this repository overview. No additional workflows are defined.

## Language & Runtime
**Language**: HTML, CSS, JavaScript (browser)  
**Version**: Standard browser runtime. MongoDB Realm SDK loaded from CDN.

## Dependencies
**Main Dependencies**:
- MongoDB Realm SDK via CDN; used for authentication and data fetching from MongoDB Atlas.

## External Services
- MongoDB Atlas project (`MONGO_APP_ID = '69caa28329abfb126e9f3a88'`) used for storing work planner edits and calendar events.

## Usage & Operations
- Data flow: `fetchCalendarEvents()` in `shared.js` queries MongoDB, generates recurring events (Paydays on 8th/23rd, Budget reminders 3 days prior, recurring bills), and merges them with hardcoded events.
- To adjust recurring/static items, edit `getStaticEvents(day)` for monthly items or `workHighlights`/text blocks in the work planner for weekly slots.
- To change date range for the Work Planner, update `workWeekStart` and the `workTimes` array if different hours are desired.

## Testing & Validation
- No automated tests, linters, or type checks are defined. Manual verification is required by opening `index.html` and confirming layout, Supabase fetch success, and proper rendering of pills, budget reminders, and the Work Planner grid.

## Project Structure
- Root contains only `index.html` and `vercel.json` for runtime behavior; no subpackages or multi-project layout.
- Hidden `.git` directory present for source control. `.zencoder` metadata holds repository summaries. No build artifacts or workflow configs are included.
