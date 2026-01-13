# Technical Specification: Migration to Django and Home Screen Fix

## Technical Context
- **Backend Framework**: Django (latest stable)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Authentication**: Supabase JS SDK (Client-side)
- **Current Stack**: Next.js (being phased out)

## Technical Implementation Brief
The primary goal is to move from a Next.js-based hosting environment to a standard Django project. This will resolve routing conflicts between Next.js middleware and static file logic.

### Key Decisions:
1. **Routing**: Django will handle all URL routing. Root (`/`) will use a `RedirectView` to serve `calendar.html`.
2. **Static Files**: All current `public/` assets (css, js, images) will be moved to a Django `static` directory.
3. **Templates**: Existing HTML files will be moved to Django `templates` and rendered via generic or specific views.
4. **Auth Fix**: By using Django, we eliminate the Next.js `middleware.ts` which is currently conflicting with the client-side `auth-check.js`.

## Source Code Structure
```
/
├── manage.py
├── core/               # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── planner/            # Main application
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   ├── templates/
│   │   ├── calendar.html
│   │   ├── login.html
│   │   └── ... (all other html files)
│   ├── views.py
│   ├── urls.py
│   └── apps.py
└── .env                # For Supabase keys and Django secret
```

## Contracts
- **URLs**: Django URL patterns will match the existing file structure (e.g., `/csea/index.html` remains accessible or is aliased).
- **Data Model**: No immediate database changes; continue using Supabase via JS.

## Delivery Phases

### Phase 1: Django Project Initialization
- Create Django project and `planner` app.
- Configure `settings.py` for static files and templates.

### Phase 2: Core Routing & Fix
- Implement root redirect to `calendar.html`.
- Port `calendar.html` and its immediate dependencies (`css/`, `js/`).
- Verify that the redirection loop is resolved in the Django environment.

### Phase 3: Bulk Migration
- Move all remaining HTML files from `public/` to `templates/`.
Port all other assets to `static/`.

### Phase 4: Auth & Polish
- Ensure `auth-check.js` and `supabase-client.js` work correctly when served by Django.
- Clean up unused Next.js files (`app/`, `middleware.ts`, `next.config.js`).

## Verification Strategy
- **Manual Verification**: Run `python manage.py runserver` and navigate to `http://localhost:8000`.
- **Redirection Check**: Confirm `/` leads to `/calendar.html` and `/login.html` works.
- **Console Audit**: Ensure no 404s for static assets and no JavaScript errors related to Supabase.
