---
description: Repository Information Overview
alwaysApply: true
---

# Strategic Command Information

## Summary
Strategic Command is a comprehensive administrative dashboard designed for life and work management. It centralizes various domains including finance tracking, health monitoring, task management, HOA administration, and professional iCAAP program records. The repository appears to be in a transition state, featuring both a modern Next.js frontend and a legacy Django backend, both sharing the same database via Supabase.

## Structure
- **app/**: Modern Next.js frontend using the App Router.
- **components/**: Standardized UI components (HubHeader, StatCard, TopNav).
- **planner/**: Django application containing models, views, and legacy HTML templates.
- **core/**: Django project configuration.
- **supabase/**: Database migrations and synchronization scripts.
- **lib/**: Shared utilities, including Supabase client initialization.
- **public/**: Static assets for the frontend.
- **types/**: TypeScript type definitions (e.g., Database types).

## Projects

### Next.js Frontend
**Configuration File**: `package.json`, `next.config.ts`, `tsconfig.json`

#### Language & Runtime
**Language**: TypeScript  
**Version**: Next.js 16.1.2, React 19.2.3  
**Build System**: Next Build  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- `@supabase/supabase-js`: Database & Auth integration.
- `lucide-react`: Iconography.
- `tailwindcss`: Utility-first styling (v4).

**Development Dependencies**:
- `eslint`: Linting.
- `typescript`: Type safety.

#### Build & Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

#### Testing
**Framework**: ESLint (for linting)
**Run Command**:
```bash
npm run lint
```

### Django Backend
**Configuration File**: `manage.py`, `requirements.txt`

#### Language & Runtime
**Language**: Python  
**Version**: Django 4.2.27  
**Build System**: Django Management Commands  
**Package Manager**: pip

#### Dependencies
**Main Dependencies**:
- `django`: Core framework.
- `psycopg2-binary`: PostgreSQL adapter.
- `dj-database-url`: Database configuration utility.
- `whitenoise`: Static file serving.

#### Build & Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Run development server
python manage.py runserver
```

#### Main Files & Resources
- **planner/models.py**: Core data definitions.
- **planner/views.py**: Backend logic and template rendering.
- **planner/templates/**: Legacy HTML templates mirroring the Next.js routes.

### Supabase Integration
**Type**: Database & Backend-as-a-Service

#### Key Resources
- **lib/supabase.ts**: Unified client for frontend/backend.
- **supabase/migrations/**: SQL migrations defining the schema (e.g., `opus_tasks`, `opus_goals`).
- **types/database.types.ts**: Auto-generated or manual TypeScript interfaces for the database schema.

#### Usage & Operations
**Verification Scripts**:
```bash
# Verify Supabase data integrity
python verify_supabase_data.py

# Run migration scripts
python run_migration.py
```
