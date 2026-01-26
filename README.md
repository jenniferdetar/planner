# Home Planner 2026

A single-page static planner for January 2026 served as plain HTML/CSS/vanilla JavaScript. This application provides a comprehensive dashboard for personal and work organization, featuring a monthly calendar, financial tracking, and specialized logs for committee meetings and work assignments.

## Features

- **Personal Planner**: Monthly calendar for January 2026 with integrated static events (bills, holidays, paydays) and dynamic data from Supabase.
- **Work Planner**: Sunday-start weekly view with priorities, checklists, and a timed grid (5am–8pm).
- **Financial Tracking**: 
  - **Bill Payment Schedule**: Recurring expense tracker with monthly checkboxes.
  - **Check Breakdown**: Spreadsheet-style view for paycheck allocations and tithe calculations.
- **Specialized Logs**:
  - **Csea/LA Fed**: Meeting notes and interaction logs for union activities.
  - **Icaap Tracking**: Tracking log for paylog submissions, hours, and approvals across multiple employees.
  - **Hoa & Planning**: Dedicated sections for home association and general planning.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript.
- **Backend**: Supabase (PostgreSQL) for data persistence.
- **Styling**: Google Fonts (Coming Soon, Plus Jakarta Sans), pill-based layout, and handwritten aesthetics.
- **Hosting**: Vercel.

## Setup & Deployment

The project is a static site and does not require a build step or package manager.

1.  **Supabase Configuration**: Ensure your Supabase URL and public anon key are correctly set in `shared.js` and `index.html`.
2.  **Local Development**: Simply open `index.html` in any modern web browser.
3.  **Deployment**: Push to GitHub and connect your repository to Vercel. The `vercel.json` handles routing and clean URLs.

## Project Structure

- `index.html`: Main entry point and dashboard.
- `shared.js`: Common logic for Supabase interactions, date formatting, and navigation.
- `financial.html`, `check-breakdown.html`: Financial management tools.
- `csea.html`, `icaap.html`, `icaap-tracking.html`: Specialized activity logs.
- `vercel.json`: Vercel configuration for static hosting.
