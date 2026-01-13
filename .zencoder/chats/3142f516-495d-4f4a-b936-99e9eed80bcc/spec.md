# Technical Specification: Opus One Agenda Planner

## Technical Context

**Language/Platform**: HTML5, CSS3, JavaScript (ES6+)
**Primary Dependencies**: 
- Font Awesome 6.4.0 (icons)
- Google Fonts (Lora, Inter, Indie Flower, League Spartan, Manrope)
- Vanilla JS (no external frameworks)

**Environment**: macOS desktop, modern browsers (Safari, Chrome)
**Data Persistence**: Browser localStorage + JSON files (similar to existing project structure)
**Existing Project Base**: Leather-bound planner UI with modular HTML/CSS/JS structure

---

## Technical Implementation Brief

### Architecture Overview

The Personal Organizational Management System will be built as a **modular, single-page application** extending the existing dashboard structure. Key design decisions:

1. **Modular Component System**: Each feature (Daily Tasks, Goals, Notes, etc.) gets its own HTML page, CSS module, and JS module, following the existing project pattern (e.g., `calendar.html`, `to_do.html`).

2. **Data Layer**: 
   - Use localStorage for client-side persistence (no backend required for Phase 1)
   - JSON file structure mirrors existing project (birthdays.json, notes.json pattern)
   - Data model includes: Tasks, Goals, Notes, Meetings, MasterTasks, Mission, Preferences

3. **State Management**: Simple JavaScript object as single source of truth, synchronized to localStorage on changes. No complex state library needed.

4. **UI/UX Consistency**: Maintain existing leather-bound planner aesthetic with the new components. Use existing CSS variables (primary colors, fonts, shadows).

5. **View System**: Multiple planning views implemented as CSS grid layouts with shared task data:
   - Daily View: Hourly time slots
   - Weekly View: 7-column grid by day
   - Monthly View: Calendar grid
   - Eisenhower Matrix: 2x2 quadrant layout

6. **Drag-and-Drop**: Use native HTML5 Drag and Drop API (no jQuery or libraries), following browser standards.

---

## Source Code Structure

```
/Mix/
├── html/
│   ├── home.html (existing)
│   ├── daily-tasks.html (NEW)
│   ├── goals.html (NEW)
│   ├── notes.html (NEW)
│   ├── meetings.html (NEW)
│   ├── master-tasks.html (NEW)
│   ├── mission.html (NEW)
│   └── planner-views.html (NEW - multi-view hub)
├── css/
│   ├── base.css (existing)
│   ├── home.css (existing)
│   ├── daily-tasks.css (NEW)
│   ├── goals.css (NEW)
│   ├── notes.css (NEW)
│   ├── meetings.css (NEW)
│   ├── master-tasks.css (NEW)
│   ├── mission.css (NEW)
│   ├── planner-views.css (NEW)
│   └── opus-core.css (NEW - shared Opus One styles)
├── js/
│   ├── tabs.js (existing)
│   ├── home.js (existing)
│   ├── app.js (existing)
│   ├── opus-data.js (NEW - core data management)
│   ├── opus-storage.js (NEW - localStorage/JSON handling)
│   ├── daily-tasks.js (NEW)
│   ├── goals.js (NEW)
│   ├── notes.js (NEW)
│   ├── meetings.js (NEW)
│   ├── master-tasks.js (NEW)
│   ├── mission.js (NEW)
│   ├── planner-views.js (NEW)
│   ├── drag-drop.js (NEW - shared drag-drop utilities)
│   └── utils.js (NEW - shared utilities: date formatting, etc.)
└── Data/
    ├── pages.json (existing)
    ├── tasks.json (NEW)
    ├── goals.json (NEW)
    ├── notes.json (NEW)
    ├── meetings.json (NEW)
    ├── master-tasks.json (NEW)
    └── mission.json (NEW)
```

---

## Data Contracts

### Data Models

#### Task Object
```javascript
{
  id: string (UUID),
  title: string,
  description: string,
  dueDate: string (ISO 8601),
  dueTime: string (HH:MM 24h format),
  priority: "High" | "Medium" | "Low",
  completed: boolean,
  linkedGoalIds: string[],
  category: string,
  subtasks: Subtask[],
  createdAt: string (ISO 8601),
  updatedAt: string (ISO 8601)
}

// Subtask Object
{
  id: string (UUID),
  title: string,
  completed: boolean
}
```

#### Goal Object
```javascript
{
  id: string (UUID),
  title: string,
  description: string,
  category: "Personal" | "Professional" | "Health" | "Financial" | "Other",
  missionAlignment: string (reference to mission values),
  timeframe: "Short-term" | "Mid-term" | "Long-term",
  linkedTaskIds: string[],
  status: "Active" | "Completed" | "On Hold",
  progressPercent: number (0-100, calculated from linked tasks),
  createdAt: string (ISO 8601),
  updatedAt: string (ISO 8601)
}
```

#### Note Object
```javascript
{
  id: string (UUID),
  date: string (ISO 8601, date only),
  content: string (supports markdown or rich text),
  tags: string[],
  createdAt: string (ISO 8601),
  updatedAt: string (ISO 8601)
}
```

#### Meeting Object
```javascript
{
  id: string (UUID),
  title: string,
  date: string (ISO 8601),
  startTime: string (HH:MM 24h format),
  endTime: string (HH:MM 24h format),
  location: string,
  attendees: string[],
  agenda: string,
  notes: string,
  linkedTaskIds: string[],
  createdAt: string (ISO 8601),
  updatedAt: string (ISO 8601)
}
```

#### Master Task Object
```javascript
{
  id: string (UUID),
  title: string,
  description: string,
  priority: "High" | "Medium" | "Low",
  linkedGoalIds: string[],
  category: string,
  createdAt: string (ISO 8601),
  updatedAt: string (ISO 8601),
  scheduledTaskId: string | null (reference when moved to scheduled tasks)
}
```

#### Mission Object
```javascript
{
  statement: string (personal mission statement),
  values: string[] (core values/principles),
  lastUpdated: string (ISO 8601)
}
```

#### Preferences Object
```javascript
{
  theme: "light" | "dark",
  defaultView: "daily" | "weekly" | "monthly",
  workStartHour: number (0-23),
  workEndHour: number (0-23),
  weekStartDay: "Sunday" | "Monday",
  notifications: boolean,
  timeFormat: "12h" | "24h"
}
```

---

## API/Interface Contracts

### opus-storage.js (Data Persistence Layer)

```javascript
// Initialize storage and load existing data
initializeStorage(): Promise<void>

// Task operations
getTasks(): Task[]
getTaskById(id: string): Task | null
createTask(task: Omit<Task, 'id'>): Task
updateTask(id: string, updates: Partial<Task>): Task
deleteTask(id: string): void
getTasksByDate(date: string): Task[]
getTasksByGoal(goalId: string): Task[]

// Goal operations
getGoals(): Goal[]
getGoalById(id: string): Goal | null
createGoal(goal: Omit<Goal, 'id'>): Goal
updateGoal(id: string, updates: Partial<Goal>): Goal
deleteGoal(id: string): void

// Note operations
getNotes(): Note[]
getNotesByDate(date: string): Note | null
createNote(note: Omit<Note, 'id'>): Note
updateNote(id: string, content: string): Note
deleteNote(id: string): void

// Meeting operations
getMeetings(): Meeting[]
getMeetingsByDate(date: string): Meeting[]
createMeeting(meeting: Omit<Meeting, 'id'>): Meeting
updateMeeting(id: string, updates: Partial<Meeting>): Meeting
deleteMeeting(id: string): void

// Master Task operations
getMasterTasks(): MasterTask[]
getMasterTaskById(id: string): MasterTask | null
createMasterTask(task: Omit<MasterTask, 'id'>): MasterTask
updateMasterTask(id: string, updates: Partial<MasterTask>): MasterTask
deleteMasterTask(id: string): void
scheduleTask(masterTaskId: string, date: string): Task

// Mission operations
getMission(): Mission
updateMission(statement: string, values: string[]): void

// Preferences operations
getPreferences(): Preferences
updatePreference(key: string, value: any): void

// Sync operations
saveToLocalStorage(): void
loadFromLocalStorage(): void
exportData(): string (JSON)
importData(jsonData: string): void
```

### opus-data.js (State Management)

```javascript
// Central data object
const opusData = {
  tasks: Task[],
  goals: Goal[],
  notes: Note[],
  meetings: Meeting[],
  masterTasks: MasterTask[],
  mission: Mission,
  preferences: Preferences,
  
  // Getters with filters
  getTodaysTasks(): Task[]
  getUpcomingMeetings(daysAhead: number): Meeting[]
  getOverbookedDays(): string[] (dates)
  getActiveGoals(): Goal[]
  getCompletedGoals(): Goal[]
  getGoalProgress(goalId: string): number (0-100)
  getMissionAlignment(goalId: string): string[]
}

// Event system for reactivity
addEventListener(event: string, callback: Function): void
// Events: task-created, task-updated, task-deleted, goal-created, etc.
notifyListeners(event: string, data: any): void
```

### drag-drop.js (Drag & Drop Utilities)

```javascript
initializeDragDrop(containerSelector: string): void
makeTaskDraggable(element: Element, task: Task): void
makeDropZone(element: Element, onDrop: Function): void
scheduleDraggedTask(task: Task, newDate: string, newTime?: string): void
reprioritizeTask(task: Task, newPosition: number): void
```

### utils.js (Shared Utilities)

```javascript
generateId(): string (UUID v4)
formatDate(date: string | Date, format: string): string
formatTime(time: string): string
calculateProgress(completed: number, total: number): number
parseTimeString(time: string): Date
getWeekDates(date: Date): Date[]
getMonthDates(date: Date): Date[]
getDayOfWeek(date: Date): number
isToday(date: Date): boolean
isFuture(date: Date): boolean
getCurrentDateISO(): string
createDateFromParts(year: number, month: number, day: number): Date
daysUntil(date: string): number
sortTasksByPriority(tasks: Task[]): Task[]
sortTasksByTime(tasks: Task[]): Task[]
categorizeByUrgenceImportance(tasks: Task[]): { urgent: Task[], important: Task[], low: Task[] }
```

---

## Delivery Phases

### Phase 1: Daily Tasks & Core Infrastructure
**Scope**: Daily task management + data layer
**Deliverable**:
- `daily-tasks.html`, `daily-tasks.css`, `daily-tasks.js`
- `opus-storage.js` (task operations)
- `opus-data.js` (state management)
- `utils.js` (date/time utilities)
- Task CRUD operations functional
- Tasks persist to localStorage
- Daily view displays tasks in hourly slots
- Tasks can be dragged to reprioritize
- **Estimated Lines of Code**: 1500-2000

### Phase 2: Goals & Mission
**Scope**: Goal tracking, mission statement, goal-task linking
**Deliverable**:
- `goals.html`, `goals.css`, `goals.js`
- `mission.html`, `mission.css`, `mission.js`
- `opus-storage.js` extended with goal operations
- Goals CRUD with category and timeframe
- Mission statement creation/editing
- Goal-task linking UI
- Progress calculation based on linked tasks
- **Estimated Lines of Code**: 1200-1500

### Phase 3: Notes & Meetings
**Scope**: Daily notes + meeting planner
**Deliverable**:
- `notes.html`, `notes.css`, `notes.js`
- `meetings.html`, `meetings.css`, `meetings.js`
- Notes CRUD with date association
- Note searching/filtering by date/tag
- Meeting CRUD with attendee and agenda fields
- Meetings appear in calendar views
- **Estimated Lines of Code**: 1000-1200

### Phase 4: Master Tasks & Drag-Drop Enhancement
**Scope**: Unscheduled task management + drag-drop system
**Deliverable**:
- `master-tasks.html`, `master-tasks.css`, `master-tasks.js`
- `drag-drop.js` (enhanced drag-drop system)
- Master task CRUD
- Drag master tasks to calendar to schedule
- Visual feedback during drag operations
- Auto-move to scheduled when dropped with date
- **Estimated Lines of Code**: 800-1000

### Phase 5: Multi-View Planner System
**Scope**: Multiple planning views (Daily, Weekly, Monthly, Eisenhower)
**Deliverable**:
- `planner-views.html`, `planner-views.css`, `planner-views.js`
- Daily view with hourly time slots
- Weekly view with 7-day grid
- Monthly calendar view
- Eisenhower Matrix (Urgent/Important)
- View switching with shared data
- Overbooked day indicators
- Drag-drop across views
- **Estimated Lines of Code**: 2000-2500

### Phase 6: Integration & Polish
**Scope**: Navigation integration, settings, export/import
**Deliverable**:
- Update `home.html` to link all new features
- `opus-core.css` for shared styling across modules
- Settings/preferences page
- Data export/import functionality
- Keyboard shortcuts documentation
- Performance optimization
- **Estimated Lines of Code**: 600-800

**Total Estimated Code**: ~8000-9000 lines of HTML/CSS/JS

---

## Verification Strategy

### Phase 1 Verification

**Functional Tests**:
1. Create a task with all fields → Task appears in task list
2. Edit task title → Changes persist on page reload
3. Delete task → Task removed from list
4. Mark task complete → Task shows completed state
5. Drag task in list → Tasks reorder correctly
6. Browser DevTools → LocalStorage contains task data

**Manual Verification**:
```bash
# Run in browser console to verify data:
// Check localStorage
JSON.parse(localStorage.getItem('opusData'))
// Should show tasks array

// Check DOM element count matches data
document.querySelectorAll('.task-item').length === opusData.tasks.length
```

**Browser Testing**:
- Open daily-tasks.html in Safari
- Perform create/edit/delete cycle
- Refresh page and verify data persists
- Test keyboard navigation (Tab through form fields)

---

### Phase 2 Verification

**Functional Tests**:
1. Create goal with mission alignment → Goal appears in goals list
2. Link task to goal → Goal progress updates
3. Complete linked task → Goal progress percentage increases
4. Edit mission statement → Mission appears on all relevant pages

**Helper Script** (`verify-phase2.js`):
```javascript
function verifyPhase2() {
  const goal = opusData.goals[0];
  const linkedTasks = opusData.tasks.filter(t => t.linkedGoalIds.includes(goal.id));
  const completedCount = linkedTasks.filter(t => t.completed).length;
  const expectedProgress = (completedCount / linkedTasks.length) * 100;
  
  console.assert(goal.progressPercent === expectedProgress, 
    `Progress mismatch: expected ${expectedProgress}, got ${goal.progressPercent}`);
}
```

---

### Phase 3 Verification

**Functional Tests**:
1. Create note for today → Note appears in daily section
2. Search notes by date → Returns correct note
3. Create meeting with attendees → Meeting appears in calendar
4. Meeting appears in daily view → Yes/No

---

### Phase 4 Verification

**Functional Tests**:
1. Create master task (no due date) → Appears in master list
2. Drag master task to calendar → Scheduled with date
3. Master task moves to scheduled list → Yes/No
4. Drag scheduled task to different date → Task date updates

**Drag-Drop Test Script** (`verify-phase4.js`):
```javascript
function verifyDragDrop() {
  const task = opusData.masterTasks[0];
  const newDate = '2026-01-15';
  
  // Simulate drag-drop
  scheduleDraggedTask(task, newDate);
  
  // Verify scheduling
  const scheduled = opusData.tasks.find(t => t.id === task.id);
  console.assert(scheduled && scheduled.dueDate === newDate,
    `Task not properly scheduled: ${scheduled?.dueDate}`);
}
```

---

### Phase 5 Verification

**Visual/UI Tests**:
1. Daily view shows correct hours → Verify time slots 6AM-8PM
2. Weekly view displays all 7 days → Count columns
3. Monthly view shows full month → Verify calendar grid
4. Eisenhower Matrix categorizes tasks → Check quadrants
5. Switch between views → Data persists across view changes

**Verification Script** (`verify-phase5.js`):
```javascript
function verifyViews() {
  // Daily view verification
  const dailySlots = document.querySelectorAll('.time-slot');
  console.assert(dailySlots.length === 15, `Expected 15 slots (6AM-8PM), got ${dailySlots.length}`);
  
  // Weekly view verification  
  const weekDays = document.querySelectorAll('.week-day');
  console.assert(weekDays.length === 7, `Expected 7 days, got ${weekDays.length}`);
  
  // Eisenhower verification
  const quadrants = document.querySelectorAll('.quadrant');
  console.assert(quadrants.length === 4, `Expected 4 quadrants, got ${quadrants.length}`);
}
```

---

### Phase 6 Verification

**Export/Import**:
1. Export data to JSON file → Valid JSON structure
2. Import JSON back → All data restored
3. Settings persist → Preferences stored in localStorage
4. Navigation links work → All pages accessible from home

**Manual Spot Checks**:
- Open DevTools → No console errors
- Test with 100+ tasks → No performance degradation
- Test with empty data → No crashes
- Refresh pages → No data loss

---

## Testing Infrastructure

### No External Test Framework Required
The project doesn't use Jest, Mocha, or other testing frameworks. Instead, use:

1. **Browser DevTools Console** for quick verification
2. **Manual click-through testing**
3. **localStorage inspection** via DevTools → Application → Storage → Local Storage
4. **Helper verification scripts** (included in each phase)

### Sample Verification Workflow

```bash
# After implementing Phase 1:
# 1. Open Firefox Developer Tools (F12)
# 2. Go to Storage > Local Storage > file:///path/to/daily-tasks.html
# 3. Verify 'opusData' key contains tasks
# 4. Run in console:
opusData.createTask({title: "Test", priority: "High", dueDate: "2026-01-15"})
# 5. Verify task appears in UI and localStorage
```

---

## Development Constraints & Decisions

1. **No Build Step**: Keep vanilla HTML/CSS/JS to match existing project. No webpack, Babel, or transpilers.
2. **localStorage Only**: Phase 1 uses only browser storage. No backend/database required.
3. **Responsive Design**: Design for macOS, but CSS should be mobile-friendly for future iOS app.
4. **Accessibility**: Follow WCAG 2.1 AA standards (color contrast, keyboard navigation, ARIA labels).
5. **Browser Compatibility**: Target Safari 15+ and Chrome 100+ (modern browsers).
6. **No Dependencies Beyond Fonts/Icons**: Keep project lightweight.

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| Data loss due to localStorage limits | Implement export/backup feature early |
| Drag-drop complexity | Test extensively, provide fallback keyboard interface |
| Performance with large datasets (100+ tasks) | Use efficient filtering/sorting, consider pagination |
| Cross-date view complexity | Modularize calendar rendering, test edge cases |
| Mission/goal alignment confusion | Clear UI labels, in-app help text |
