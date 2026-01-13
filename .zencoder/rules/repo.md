---
description: Repository Information Overview
alwaysApply: true
---

# Opus Planner Information

## Summary
Opus Planner is a sophisticated personal and professional organization system. It features a Django-based backend primarily used for serving templates and managing static assets, while the core application logic resides in a robust frontend built with vanilla JavaScript. The system leverages Supabase for real-time data synchronization, authentication, and cloud storage, allowing for a multi-device experience.

## Structure
- **core/**: Django project configuration and settings.
- **planner/**: The main application directory containing:
    - **templates/**: Extensive collection of HTML templates for various modules (Calendar, Finance, Work Planner, etc.).
    - **static/js/**: Frontend logic including Supabase integration (`supabase-client.js`) and state management (`opus-storage.js`).
    - **static/css/**: Styling for the planner interfaces.
- **supabase/migrations/**: SQL migration files defining the PostgreSQL schema, Row Level Security (RLS) policies, and tables for notes, meetings, habits, and metadata.
- **public/**: Additional static resources.
- **manage.py**: Django management script.
- **requirements.txt**: Python dependencies.
- **vercel.json**: Configuration for deployment on Vercel.

## Language & Runtime
**Language**: Python, JavaScript, HTML, CSS  
**Version**: Python 3.9 (Runtime), Django 4.2.27  
**Build System**: Vercel (Python Lambda)  
**Package Manager**: pip (Python)

## Dependencies
**Main Dependencies**:
- **Django**: Web framework for template serving and routing.
- **Whitenoise**: Static file serving for production.
- **Supabase JS SDK**: Frontend client for real-time database and auth (loaded via CDN).

## Build & Installation
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run local development server
python manage.py runserver
```

## Main Files & Resources
- **core/settings.py**: Main configuration, including static file handling and middleware.
- **planner/views.py**: Dynamic template routing logic.
- **planner/static/js/opus-storage.js**: Centralized event bus and storage synchronization logic.
- **planner/static/js/supabase-client.js**: Initialization of the Supabase browser client.
- **supabase/migrations/20260112000000_comprehensive_sync.sql**: Core database schema definition.

## Testing
**Framework**: Django Testing Framework (Standard)
**Test Location**: `planner/tests.py`
**Run Command**:
```bash
python manage.py test
```

## Deployment
**Platform**: Vercel
**Configuration**: `vercel.json` defines the entry point as `vercel_app.py` using the `@vercel/python` builder.
**Static Assets**: Managed via `whitenoise` and Django's `collectstatic`.
