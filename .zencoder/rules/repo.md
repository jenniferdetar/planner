---
description: Repository Information Overview
alwaysApply: true
---

# Opus Planner Information

## Summary
Opus Planner is a comprehensive organization system featuring a Django-based backend and a robust vanilla JavaScript frontend. It is designed for personal and professional management, including modules for calendars, finance, work planning, and task tracking. The system utilizes Supabase for authentication, real-time data synchronization, and cloud storage, allowing for cross-device usage. It is optimized for deployment on Vercel.

## Structure
- **core/**: Django project configuration (settings, WSGI, ASGI, URLs).
- **planner/**: Main application directory.
    - **templates/**: HTML templates for various modules like Calendar, Finance, and Work Planner.
    - **static/js/**: Frontend logic including Supabase integration (`supabase-client.js`), state management (`opus-storage.js`), and module-specific scripts.
    - **static/css/**: Styling for the user interface.
- **supabase/**: Contains PostgreSQL migrations defining the schema, RLS policies, and tables for notes, habits, and tasks.
- **public/**: Static assets accessible at the root level.
- **manage.py**: Django management utility.
- **vercel.json**: Configuration for Vercel deployment.
- **vercel_app.py**: Entry point for Vercel's Python runtime.

## Language & Runtime
**Language**: Python, JavaScript, HTML, CSS  
**Version**: Python 3.9, Django 4.2.27  
**Build System**: Vercel (@vercel/python)  
**Package Manager**: pip

## Dependencies
**Main Dependencies**:
- **Django**: Core web framework.
- **Whitenoise**: Static file serving for production environments.
- **Supabase JS SDK**: Frontend client for database and auth (loaded via CDN).

## Build & Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations (local)
python manage.py migrate

# Start development server
python manage.py runserver
```

## Docker
No Docker configuration found.

## Testing
**Framework**: Django Testing Framework (unittest)
**Test Location**: `planner/tests.py`
**Naming Convention**: Standard Django `tests.py` or `test_*.py`
**Configuration**: Standard Django settings in `core/settings.py`

**Run Command**:
```bash
python manage.py test
```
