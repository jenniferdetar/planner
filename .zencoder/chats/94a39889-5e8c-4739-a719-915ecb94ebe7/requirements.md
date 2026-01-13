# Feature Specification: Migration to Django and Home Screen Fix

## User Stories

### User Story 1 - Fix Home Screen Loop
**Acceptance Scenarios**:
1. **Given** a user is logged in, **When** they navigate to the root URL (`/`), **Then** they should be redirected to `calendar.html` without encountering a loop.
2. **Given** a user is not logged in, **When** they navigate to the root URL, **Then** they should be redirected to the login page.

### User Story 2 - Default Home Screen
**Acceptance Scenarios**:
1. **Given** the application is running, **When** the user is authenticated, **Then** the `calendar.html` content should be displayed as the primary entry point.

### User Story 3 - Django Migration
**Acceptance Scenarios**:
1. **Given** the current Next.js/Vercel setup, **When** the migration is complete, **Then** the application should be servable via Django.
2. **Given** the Django setup, **When** a user interacts with the planner, **Then** all static features and Supabase integrations should remain functional.

---

## Requirements
- Identify and eliminate the redirection loop between Next.js middleware and static HTML `auth-check.js`.
- Configure `calendar.html` as the target for the root redirect.
- Initialize a Django project structure.
- Port static assets (HTML, CSS, JS) from `public/` and `app/` to Django's static and template directories.
- Implement Django views and URLs to handle routing previously managed by Next.js.
- Maintain Supabase authentication compatibility within the Django-rendered pages.

## Success Criteria
- Root URL correctly serves `calendar.html` for authenticated users.
- Redirection loop is completely resolved.
- Django server successfully hosts the application with all features intact.
