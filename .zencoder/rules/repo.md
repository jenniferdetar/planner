---
description: Repository Information Overview
alwaysApply: true
---

# Opus One Planner - Repository Information

## Summary

**Opus One** is a comprehensive personal planning web application built with vanilla HTML5, CSS3, and JavaScript. It's a client-side only application that stores all data locally in the browser using localStorage. The planner provides 17+ modules for task management, goal tracking, calendar views, financial planning, and work-related features including iCAAP integrations.

## Structure

```
project-root/
├── html/                    # 25 HTML page templates (one per module)
├── css/                     # 18 CSS files (module-specific + core styling)
├── js/                      # 17 JavaScript modules (business logic)
├── data/                    # Sample data and import templates (JSON)
└── .vscode/                 # VS Code configuration
```

### Main Components

- **Pages**: Daily Tasks, Goals, Notes, Meetings, Calendar, Master Tasks, Mission, Budget, CSEA, iCAAP (Pay Log, Purchase Requisition, Transcript Request, Hours Worked), Settings, Data Management, Planner Views
- **Core Modules**: `opus-storage.js` (localStorage management), `utils.js` (utilities), `opus-data.js` (data operations)
- **Feature Modules**: 17 JavaScript modules implementing individual features (one per page)
- **Styling**: `opus-core.css` (design system), module-specific CSS files, custom color scheme with Opus blue/gold theme

## Language & Runtime

**Language**: JavaScript (ES6+), HTML5, CSS3  
**Runtime**: Browser-based (requires modern web browser with localStorage support)  
**Build System**: None (static web application)  
**Package Manager**: None (no external dependencies)

## Dependencies

**No external dependencies**. Application uses only vanilla JavaScript and browser APIs.

**Browser APIs Used**:
- localStorage (data persistence)
- Fetch API (data import/export)
- Date/Time APIs (scheduling, formatting)
- DOM APIs (dynamic rendering)
- Drag & Drop API (task reordering)

## Build & Installation

No build process required. Application runs directly in browser.

**Development Setup**:
```bash
# Using VS Code Live Server extension (configured for port 5501)
# Simply open html/home.html in a browser or use Live Server
# Open: http://localhost:5501/html/home.html
```

**Alternative**: Open any HTML file directly in a web browser (e.g., file:///path/to/html/home.html)

## Main Files & Resources

**Entry Points**:
- `html/home.html` - Main dashboard/home page
- All other HTML files in `html/` directory are standalone pages

**Core JavaScript Modules**:
- `js/opus-storage.js` - localStorage API wrapper, data validation, CRUD operations
- `js/utils.js` - Date/time utilities, DOM helpers, event management helpers
- `js/opus-data.js` - High-level data operations, initialization
- `js/drag-drop.js` - Drag and drop functionality for task reordering

**Feature Modules**: 
- `js/daily-tasks.js`, `js/goals.js`, `js/notes.js`, `js/meetings.js`, `js/calendar.js`, `js/master-tasks.js`, `js/mission.js`, `js/budget.js`, `js/settings.js`, `js/planner-views.js`, `js/data-management.js`, `js/csea.js`, plus 4 iCAAP modules

**Configuration**:
- `.vscode/settings.json` - VS Code settings (LiveServer port: 5501)

**Sample Data**:
- `data/tasks-import-example.json` - Example format for bulk importing tasks
- `data/calendar-data.json` - Sample calendar events

## Storage & Data

**Data Persistence**: Browser localStorage under key `'opusData'`

**Stored Data Structure**:
```javascript
{
  tasks: [],
  goals: [],
  notes: [],
  meetings: [],
  masterTasks: [],
  mission: { statement, values, lastUpdated },
  preferences: { theme, defaultView, workStartHour, workEndHour, weekStartDay, notifications, timeFormat }
}
```

**Data Operations**:
- Export: Download all data as JSON file
- Import: Bulk import tasks from JSON
- Manual backup via Data Management module
- Full data reset capability

## Architecture

**Pattern**: Modular IIFE (Immediately Invoked Function Expression)  
**Module Pattern**: Each feature is self-contained with public API exposed via IIFE return  
**Communication**: Via localStorage and DOM events  
**No Framework**: Pure vanilla JavaScript with no dependencies

**Key Design Principles**:
- Client-side only (no server required)
- localStorage for persistence
- Modular organization (one module per feature)
- Utility-first approach (utils.js provides helpers)
- Event-driven architecture for data updates

## Styling System

**Core Design System**: `css/opus-core.css`
- Custom properties for colors, spacing, shadows, border-radius
- Opus color scheme: Primary blue (#00326b), Gold accent (#ffca38)
- Responsive grid-based layout
- Font: Inter (Google Fonts)

**Module-Specific Styles**: Each module has dedicated CSS file matching HTML file name
- Modular and independently updatable
- Consistent use of CSS custom properties for theming

## Development Workflow

**Local Development**:
1. Open project in VS Code
2. Use Live Server extension (configured to port 5501)
3. Navigate to http://localhost:5501/html/home.html
4. Changes to HTML/CSS/JS reload automatically

**Data Persistence**: All changes automatically saved to localStorage

**Recommended Setup**: VS Code with Live Server extension for hot-reload development

## Testing & Validation

**Testing Framework**: None  
**Browser Compatibility**: Modern browsers with localStorage support (Chrome, Firefox, Safari, Edge)

**Manual Testing**: Features can be tested directly in browser
- LocalStorage may need to be cleared between test sessions
- Export/import can be used to test data persistence and format

**Data Validation**: Input validation present in `opus-storage.js`
- Task title validation
- Date format validation (YYYY-MM-DD)
- Time format validation (HH:MM)
- Priority enum validation (High/Medium/Low)
