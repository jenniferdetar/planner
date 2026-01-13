---
description: Repository Information Overview
alwaysApply: true
---

# Opus Planner Information

## Summary
Opus Planner is a Django-based personal organization and productivity suite. It provides specialized tools for financial tracking, goal management (SMART goals), health monitoring, and professional planning (meeting notes, task management). The application is optimized for deployment on Vercel and integrates with Supabase for data synchronization.

## Structure
- **core/**: Project configuration containing settings, URL routing, and WSGI/ASGI entry points.
- **planner/**: Main application logic including views, models, and a extensive collection of HTML templates.
- **supabase/**: Contains SQL migration scripts for database schema and synchronization logic.
- **public/**: Root-level static resources, primarily CSS.
- **staticfiles/**: Directory for collected static files (generated during deployment).

## Language & Runtime
**Language**: Python  
**Version**: 3.9 (as specified in `vercel.json`)  
**Build System**: Vercel Python Runtime  
**Package Manager**: pip

## Dependencies
**Main Dependencies**:
- **Django**: `4.2.27` - Core web framework.
- **WhiteNoise**: `6.5.0` - Optimized static file serving for production.
- **Supabase**: Used for data synchronization (as indicated by migration files).

## Build & Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Database setup
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Run local development server
python manage.py runserver
```

## Deployment
**Platform**: Vercel  
**Configuration**: `vercel.json` defines the Python 3.9 runtime and routes all traffic to `vercel_app.py`.  
**Entry Point**: `vercel_app.py` wraps the Django WSGI application for Vercel's serverless environment.

## Testing
**Framework**: Django Test Framework  
**Test Location**: `planner/tests.py`  
**Naming Convention**: Standard Django `tests.py` pattern.

**Run Command**:
```bash
python manage.py test
```

## Project Architecture
- **Dynamic Templates**: The `planner` app uses a dynamic template loader to serve various planning tools (e.g., `planner/templates/budget/`).
- **Static Asset Management**: Uses `WhiteNoise` with `CompressedManifestStaticFilesStorage` for efficient delivery of CSS, JS, and image assets.
- **Supabase Integration**: SQL migrations in `supabase/` suggest a robust backend synchronization strategy for persistent data.
