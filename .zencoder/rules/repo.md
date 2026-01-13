---
description: Repository Information Overview
alwaysApply: true
---

# Opus Planner Information

## Summary
Opus Planner is a comprehensive Django-based personal and professional organization application. It features specialized tools including calendars, financial tracking, goal management (SMART goals), health tracking, and meeting notes. The project integrates with Supabase for data synchronization and is deployed on Vercel.

## Structure
- **core/**: Central Django project configuration (`settings.py`, `urls.py`, `wsgi.py`).
- **planner/**: Primary application logic, templates, and static assets.
- **supabase/**: SQL migrations for backend database schema and sync logic.
- **public/**: Root-level static resources.
- **manage.py**: Django administrative utility.
- **vercel.json**: Vercel deployment configuration.
- **vercel_app.py**: Vercel entry point.

## Language & Runtime
**Language**: Python  
**Version**: 3.9+  
**Framework**: Django 4.2.27  
**Build System**: Vercel Python Runtime  
**Package Manager**: pip

## Dependencies
**Main Dependencies**:
- `django == 4.2.27`
- `whitenoise == 6.5.0` (for static file serving)
- `supabase-js` (frontend integration)

## Build & Installation
```bash
# Local Setup
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Vercel Deployment
# Vercel automatically installs requirements.txt and uses vercel_app.py
```

## Main Files & Resources
- **Vercel Entry Point**: `vercel_app.py`
- **WSGI Application**: `core/wsgi.py`
- **Settings**: `core/settings.py`
- **Templates**: `planner/templates/`
- **Static Files**: `planner/static/`

## Testing
**Framework**: Django Test Framework  
**Test Location**: `planner/tests.py`
**Naming Convention**: `tests.py`

**Run Command**:
```bash
python manage.py test
```
