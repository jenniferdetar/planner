---
description: Repository Information Overview
alwaysApply: true
---

# Opus Planner Information

## Summary
Opus Planner is a comprehensive Django-based personal and professional organization application. It features a wide array of specialized tools including calendars, financial tracking, goal management (SMART goals), health tracking, and meeting notes. The project integrates with Supabase for data synchronization and provides a dynamic template-driven frontend for various planning needs.

## Structure
- **core/**: The central Django project configuration directory containing `settings.py`, `urls.py`, and deployment configurations (`asgi.py`, `wsgi.py`).
- **planner/**: The primary application logic, featuring:
    - `templates/`: Extensive collection of HTML templates for different planner modules (budget, forms, CSEA, etc.).
    - `static/`: Frontend assets including module-specific CSS, JavaScript logic (e.g., `supabase-client.js`, `calendar.js`), and data files.
    - `views.py`: Handles dynamic template rendering and specific application routes.
- **supabase/**: Contains SQL migrations for backend database schema management and synchronization.
- **public/**: Root-level static resources, primarily CSS.
- **manage.py**: Django's command-line utility for administrative tasks.

## Language & Runtime
**Language**: Python  
**Version**: Python 3.x  
**Framework**: Django 4.2.27  
**Database**: SQLite (local) / Supabase (cloud sync)  
**Package Manager**: pip (assumed)

## Dependencies
**Main Dependencies**:
- `django == 4.2.27`
- `supabase-js` (via frontend scripts)
- `sqlite3` (built-in)

## Build & Installation
```bash
# Install dependencies (assuming standard requirements.txt)
pip install django

# Run database migrations
python manage.py migrate

# Start the development server
python manage.py runserver
```

## Main Files & Resources
- **Entry Point**: `manage.py`
- **Settings**: `core/settings.py`
- **URLs**: `core/urls.py` and `planner/urls.py`
- **Key Client Script**: `planner/static/js/supabase-client.js`
- **Main Styles**: `planner/static/css/opus-core.css`

## Testing
**Framework**: Django Test Framework (unittest-based)
**Test Location**: `planner/tests.py`
**Naming Convention**: Standard Django `tests.py`

**Run Command**:
```bash
python manage.py test
```
