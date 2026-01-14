import { GOALS } from '../data/goals-data.js';

const workPlanner = (() => {
  const STORAGE_KEY = 'workPlannerEdits';
  const PRIORITY_KEY = 'workPlannerPriorities';
  const times = utils.getHourSlots(5, 20, 30); // 5am - 8pm in 30-minute increments
  const styleMap = {
    due:    { bg: '#ffd6e2', border: '#ff6b98', text: '#7a0f2b' },
    holiday:{ bg: '#ffe1b0', border: '#f59e0b', text: '#9a4d00' },
    csea:   { bg: '#b7dbff', border: '#3b82f6', text: '#0b3b70' },
    payday: { bg: '#c9f5dd', border: '#22c55e', text: '#0f4d2c' },
    budget: { bg: '#ffd4a8', border: '#f97316', text: '#9a3412' },
    budgetpay: { bg: '#bff0d4', border: '#10b981', text: '#0b4a3a' },
    lunch: { bg: '#00493a', border: '#00493a', text: '#edf0ee' },
    christmas: { bg: '#0f6b3a', border: '#dc2626', text: '#ffffff' },
    birthday:{ bg: '#ffd9b5', border: '#fb923c', text: '#8a2d0f' },
    travel:  { bg: '#e0ccff', border: '#8b5cf6', text: '#4c1d95' },
    home:    { bg: '#ffeab5', border: '#eab308', text: '#7a5b00' },
    personal:{ bg: '#dbeafe', border: '#60a5fa', text: '#1e3a8a' },
    burntorange: { bg: '#c75b12', border: '#8d3f0c', text: '#ffffff' },
    default:{ bg: '#e5e7eb', border: '#9ca3af', text: '#111827' }
  };

  let weekStart = startOfWeek(new Date());
  let eventsByDate = {
    '2026-01-01': ["New Year's Day"],
    '2026-01-19': ["Martin Luther King Jr. Day"],
    '2026-02-16': ["Presidents' Day"],
    '2026-03-30': ["Cesar Chavez Day (Observed)"],
    '2026-04-24': ["Armenian Genocide Remembrance Day"],
    '2026-05-25': ["Memorial Day"],
    '2026-06-19': ["Juneteenth"],
    '2026-07-03': ["Independence Day (Observed)"],
    '2026-07-04': ["Independence Day"],
    '2026-08-31': ["Admission Day"],
    '2026-09-07': ["Labor Day"],
    '2026-11-11': ["Veterans Day"],
    '2026-11-26': ["Thanksgiving Day"],
    '2026-11-27': ["Day After Thanksgiving"],
    '2026-12-25': ["Christmas Day"],
    '2026-12-31': ["New Year's Eve"]
  };
  let recurringEvents = [
    {
      title: 'Jennifer Payday',
      frequency: 'monthly',
      dayOfMonth: 5,
      category: 'payday',
      type: 'event'
    },
    {
      title: 'CSEA Chapter Meeting',
      frequency: 'monthly',
      pattern: 'third Wednesday',
      time: '17:00',
      endTime: '19:00',
      category: 'csea',
      type: 'meeting'
    },
    {
      title: 'CSEA Executive Board Meeting',
      frequency: 'monthly',
      pattern: 'first Wednesday',
      time: '17:00',
      endTime: '18:30',
      category: 'csea',
      type: 'meeting'
    },
    {
      title: 'CSEA Stewards Meeting',
      frequency: 'monthly',
      pattern: 'second Wednesday',
      time: '17:00',
      endTime: '18:30',
      category: 'csea',
      type: 'meeting'
    }
  ];
  let edits = {};
  let priorities = {};

  function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
  }

  function loadStored() {
    edits = opusStorage.getMetadata(STORAGE_KEY) || {};
    priorities = opusStorage.getMetadata(PRIORITY_KEY) || {};
  }

  function saveEdit(dateKey, slotKey, text) {
    if (!edits[dateKey]) edits[dateKey] = {};
    if (text) {
      edits[dateKey][slotKey] = text;
    } else {
      delete edits[dateKey][slotKey];
      if (Object.keys(edits[dateKey]).length === 0) delete edits[dateKey];
    }
    opusStorage.updateMetadata(STORAGE_KEY, edits);
  }

  function savePriorities() {
    opusStorage.updateMetadata(PRIORITY_KEY, priorities);
  }

  function initialize() {
    loadStored();
    document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const renderAll = () => {
      loadStored();
      eventsByDate = opusStorage.getCalendarByDate();
      recurringEvents = opusStorage.getCalendarRecurring();
      hydratePriorities();
      renderWeek();
      const weeklyTasksRow = document.querySelector('.weekly-tasks-row');
      if (weeklyTasksRow) renderMergedWeeklyTasks(weeklyTasksRow);
    };

    opusData.initialize().then(() => {
      renderAll();
      bindControls();
      
      // Listen for updates from Supabase Realtime
      opusStorage.on(renderAll);
    }).catch(err => console.error('Failed to load work planner', err));
  }

  function bindControls() {
    const prev = document.getElementById('prev-week');
    const next = document.getElementById('next-week');
    if (prev) prev.addEventListener('click', () => { weekStart = shiftWeek(-1); renderWeek(); });
    if (next) next.addEventListener('click', () => { weekStart = shiftWeek(1); renderWeek(); });

    document.querySelectorAll('.priority-cell').forEach(cell => {
      const key = cell.dataset.priority;
      cell.addEventListener('input', (e) => {
        priorities[key] = e.target.textContent.trim();
        savePriorities();
      });
    });
  }

  function hydratePriorities() {
    document.querySelectorAll('.priority-cell').forEach(cell => {
      const key = cell.dataset.priority;
      const val = priorities[key];
      if (val) cell.textContent = val;
    });
  }

  function shiftWeek(delta) {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + delta * 7);
    return next;
  }

  function renderWeek() {
    const rangeLabel = document.getElementById('week-range');
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);

    if (rangeLabel) {
      const fmt = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      rangeLabel.textContent = `${fmt(start)} - ${fmt(end)}`;
    }

    const grid = document.getElementById('work-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const eventsMap = getEventsForRange(start, end);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateKey = toKey(date);
      const dayEvents = dedupe(eventsMap[dateKey] || []);
      grid.appendChild(buildDayColumn(date, dateKey, dayEvents));
    }
  }

  function timeToMinutes(hhmm) {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  function coversSlot(event, slotTime) {
    const start = timeToMinutes(normalizeTime(event.time));
    if (start === null) return false;
    const end = event.endTime ? timeToMinutes(normalizeTime(event.endTime)) : start;
    if (end === null) return false;
    return slotTime >= start && slotTime < end;
  }

  function buildDayColumn(date, dateKey, events) {
    const day = document.createElement('div');
    day.className = 'work-day';

    const header = document.createElement('div');
    header.className = 'work-day-header';
    const name = document.createElement('div');
    name.className = 'work-day-name';
    name.textContent = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateEl = document.createElement('div');
    dateEl.className = 'work-day-date';
    dateEl.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    header.appendChild(name);
    header.appendChild(dateEl);
    day.appendChild(header);

    const allDayBox = document.createElement('div');
    allDayBox.className = 'work-all-day work-slot-entry';
    const allDayEvents = events.filter(e => e.allDay || !e.time);
    const allDayPills = document.createElement('div');
    allDayPills.className = 'calendar-events';
    allDayEvents.forEach(event => allDayPills.appendChild(buildEventPill(event)));
    if (allDayEvents.length === 0) {
      allDayBox.setAttribute('contenteditable', 'true');
      allDayBox.dataset.date = dateKey;
      allDayBox.dataset.slot = 'all-day';
      allDayBox.textContent = getPreferredText(dateKey, 'all-day', '');
      allDayBox.addEventListener('input', handleEdit);
    } else {
      allDayBox.appendChild(allDayPills);
    }
    day.appendChild(allDayBox);

    const grid = document.createElement('div');
    grid.className = 'work-day-grid';

    times.forEach(slot => {
      const row = document.createElement('div');
      row.className = 'work-slot';

      const label = document.createElement('div');
      label.className = 'work-slot-time';
      label.textContent = slot.display.toLowerCase();

      const pills = document.createElement('div');
      pills.className = 'calendar-events';
      const slotMinutes = timeToMinutes(slot.time);
      const slotEvents = events.filter(e => !e.allDay && coversSlot(e, slotMinutes));
      if (slotEvents.length === 1) {
        pills.classList.add('single-event');
      }
      slotEvents.forEach(event => pills.appendChild(buildEventPill(event)));

      row.appendChild(label);
      row.appendChild(pills);
      if (slotEvents.length === 0) {
        const entry = document.createElement('div');
        entry.className = 'work-slot-entry';
        entry.setAttribute('contenteditable', 'true');
        entry.dataset.date = dateKey;
        entry.dataset.slot = slot.time;
        entry.textContent = getPreferredText(dateKey, slot.time, '');
        entry.addEventListener('input', handleEdit);
        row.appendChild(entry);
      }
      grid.appendChild(row);
    });

    day.appendChild(grid);

    return day;
  }

  const WEEKLY_STATUS_KEY = 'weeklyTaskStatus';

  function buildWeeklyTasksRow() {
    const row = document.createElement('div');
    row.className = 'weekly-tasks-row';
    row.innerHTML = `
      <div class="weekly-tasks-header">
        <h3 class="weekly-tasks-title">Weekly Tasks</h3>
        <div id="work-weekly-progress" class="weekly-progress-mini"></div>
      </div>
      <ul class="weekly-tasks-list" id="merged-weekly-tasks"></ul>
    `;
    renderMergedWeeklyTasks(row);
    return row;
  }

  function renderMergedWeeklyTasks(container) {
    const list = container.querySelector('#merged-weekly-tasks');
    const progressContainer = container.querySelector('#work-weekly-progress');
    if (!list) return;
    
    list.innerHTML = '';
    
    const smartData = opusStorage.getMetadata('smartGoals') || {};
    const completionData = opusStorage.getMetadata(WEEKLY_STATUS_KEY) || {};

    const weekKey = toKey(weekStart);
    const currentWeekCompletions = completionData[weekKey] || {};
    
    const activeGoals = opusData.goals || [];
    let allWeeklyTasks = [];
    
    activeGoals.forEach(goal => {
      const stored = smartData[goal.id] || {};
      if (stored.weeklyTasks) {
        const tasks = stored.weeklyTasks.split('\n').map(t => t.trim()).filter(t => t);
        allWeeklyTasks = allWeeklyTasks.concat(tasks);
      } else {
        const template = GOALS[goal.title];
        if (template && template.weeklyTasks) {
          allWeeklyTasks = allWeeklyTasks.concat(template.weeklyTasks);
        }
      }
    });

    const uniqueTasks = [...new Set(allWeeklyTasks)].slice(0, 14);
    
    if (uniqueTasks.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Set goals to see tasks';
      list.appendChild(li);
      if (progressContainer) progressContainer.innerHTML = '';
      return;
    }

    let completedCount = 0;

    uniqueTasks.forEach(task => {
      const isCompleted = currentWeekCompletions[task] === true;
      if (isCompleted) completedCount++;

      const li = document.createElement('li');
      li.textContent = task;
      li.className = isCompleted ? 'completed' : '';
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        toggleWeeklyTask(weekKey, task);
      });
      list.appendChild(li);
    });

    if (progressContainer) {
      const percent = Math.round((completedCount / uniqueTasks.length) * 100);
      progressContainer.innerHTML = `
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width: ${percent}%"></div>
        </div>
        <span class="progress-percent">${percent}%</span>
      `;
    }
  }

  function toggleWeeklyTask(weekKey, taskName) {
    const completionData = opusStorage.getMetadata(WEEKLY_STATUS_KEY) || {};

    if (!completionData[weekKey]) completionData[weekKey] = {};
    completionData[weekKey][taskName] = !completionData[weekKey][taskName];

    opusStorage.updateMetadata(WEEKLY_STATUS_KEY, completionData);
    renderMergedWeeklyTasks(document.querySelector('.weekly-tasks-row'));
  }

  function handleEdit(e) {
    const text = e.target.textContent.trim();
    const dateKey = e.target.dataset.date;
    const slotKey = e.target.dataset.slot;
    saveEdit(dateKey, slotKey, text);
  }

  function getPreferredText(dateKey, slotKey, defaultText) {
    if (edits[dateKey] && edits[dateKey][slotKey] !== undefined) {
      return edits[dateKey][slotKey];
    }
    return defaultText || '';
  }

  function formatSlot(list) {
    if (!list || list.length === 0) return '';
    return list.map(event => event.title || '').join('\n');
  }

  function formatAllDay(list) {
    if (!list || list.length === 0) return '';
    return list.filter(e => e.allDay || !e.time).map(e => e.title).join('\n');
  }

  function buildEventPill(item) {
    const div = document.createElement('div');
    div.className = 'calendar-event';
    const eventType = classifyEvent(item);
    const variant = styleMap[eventType] || styleMap.default;
    div.style.backgroundColor = variant.bg;
    div.style.color = variant.text;
    div.style.borderColor = variant.border;
    if (item.title === "New Year's Day") {
      div.textContent = "New Year's Day";
    } else {
      div.textContent = item.title || '';
    }
    return div;
  }

  function classifyEvent(item) {
    const text = (item.title || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const holidays = /new year|ml king|groundhog|valentine|president|chinese new year|mardi gras|ash wednesday|st\.? patrick|easter|april fool|passover|good friday|cinco de mayo|mother's day|armed forces|memorial|juneteenth|father's day|independence|labor|patriot|rosh hashanah|grandparent|constitution|yom kippur|columbus|boss's|united nations|halloween|veteran|daylight saving|thanksgiving|christmas|kwanzaa|new year's eve|pearl harbor/i;

    if (/dYZ,/.test(text) || category === 'birthday' || /birthday/i.test(text)) return 'birthday';
    if (/payday/i.test(text)) return 'payday';
    if (/budget.*pay|pay.*bills/i.test(text)) return 'budgetpay';
    if (/budget/i.test(text) || category === 'budget') return 'budget';
    if (category === 'christmas' || /christmas/i.test(text)) return 'christmas';
    if (/content release|mentored session/i.test(text)) return 'burntorange';
    if (/lunch/i.test(text) || category === 'lunch') return 'lunch';
    if (/due/i.test(text) || category === 'finance') return 'due';
    if (holidays.test(text) || category === 'holiday') return 'holiday';
    if (/csea/i.test(text) || /la fed/i.test(text) || category === 'csea') return 'csea';
    if (/stay at|travel|hotel|vacation/i.test(text) || category === 'travel') return 'travel';
    if (/laundry|sweeping|cleaning|home care/i.test(text) || category === 'home') return 'home';
    if (/shower|bedtime|self care/i.test(text) || category === 'personal') return 'personal';
    return 'default';
  }

  function dedupe(list) {
    const normalizeTitle = (title) => {
      const t = (title || '').trim().toLowerCase();
      return t.replace(/\bstewards?\b/g, 'steward').replace(/\s+/g, ' ');
    };

    const seen = new Set();
    const result = [];
    list.forEach(ev => {
      const allDayNormalized = ev.allDay || (!ev.time && !ev.endTime);
      const key = [
        normalizeTitle(ev.title),
        (ev.time || '').trim().toLowerCase(),
        (ev.endTime || '').trim().toLowerCase(),
        allDayNormalized ? 'all' : ''
      ].join('|');
      if (seen.has(key)) return;
      seen.add(key);
      result.push(ev);
    });
    return result;
  }

  function getEventsForRange(start, end) {
    const map = {};
    const cursor = new Date(start);
    for (let i = 0; i < 31 && cursor <= end; i++) {
      const key = toKey(cursor);
      map[key] = [];
      if (eventsByDate[key]) {
        eventsByDate[key].forEach(e => map[key].push(typeof e === 'string' ? { title: e, allDay: true } : { ...e }));
      }

      opusData.tasks.filter(t => t.dueDate === key).forEach(t => {
        map[key].push({
          title: t.title,
          time: t.dueTime ? utils.formatTime(t.dueTime).toLowerCase() : null,
          category: t.category,
          type: 'task'
        });
      });

      opusData.meetings.filter(m => m.date === key).forEach(m => {
        map[key].push({
          title: m.title,
          time: m.startTime ? utils.formatTime(m.startTime).toLowerCase() : null,
          endTime: m.endTime ? utils.formatTime(m.endTime).toLowerCase() : null,
          category: 'meeting',
          type: 'meeting'
        });
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    addEnterPaylogsBlocks(start, end, map);

    recurringEvents.forEach(item => {
      if (item.frequency === 'monthly' && item.pattern) {
        addMonthlyPatternOccurrences(item, start, end, date => pushEvent(map, date, item));
      } else if (item.frequency === 'monthly' && Number.isFinite(item.dayOfMonth)) {
        addMonthlyDayOccurrences(item, start, end, date => pushEvent(map, date, item));
      } else if (item.frequency === 'biweekly') {
        addBiweeklyOccurrences(item, start, end, date => pushEvent(map, date, item));
      } else if (item.frequency === 'weekly' && Array.isArray(item.weekdays)) {
        addWeeklyOccurrences(item, start, end, date => pushEvent(map, date, item));
      }
    });

    addBudgetPayBillsBlocks(map, start, end);

    return map;
  }

  function addEnterPaylogsBlocks(rangeStart, rangeEnd, map) {
    const startBoundary = new Date(Math.max(rangeStart.getTime(), new Date(2026, 0, 30).getTime())); // Jan 30, 2026
    const startMonth = new Date(startBoundary.getFullYear(), startBoundary.getMonth(), 1);
    const endMonth = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);

    const iter = new Date(startMonth);
    for (let i = 0; i < 12 && iter <= endMonth; i++) {
      const year = iter.getFullYear();
      const month = iter.getMonth();
      const fifth = new Date(year, month, 5);
      const days = [];

      // Add last business day of prior month
      const lastOfPrev = new Date(year, month, 0);
      let prev = new Date(lastOfPrev);
      for (let j = 0; j < 10; j++) {
        if (!(prev.getDay() === 0 || prev.getDay() === 6)) break;
        prev.setDate(prev.getDate() - 1);
      }
      days.push(prev);

      // Add last business day of current month
      const lastOfCurrent = new Date(year, month + 1, 0);
      let lastBiz = new Date(lastOfCurrent);
      for (let j = 0; j < 10; j++) {
        if (!(lastBiz.getDay() === 0 || lastBiz.getDay() === 6)) break;
        lastBiz.setDate(lastBiz.getDate() - 1);
      }
      days.push(lastBiz);

      // Add five business days leading up to and including the 5th
      let d = new Date(fifth);
      for (let j = 0; j < 20 && days.length < 6; j++) { // 1 (prev) + 5 business days to 5th
        const dow = d.getDay();
        if (dow !== 0 && dow !== 6) {
          days.push(new Date(d));
        }
        d.setDate(d.getDate() - 1);
      }

      days.forEach(day => {
        if (day >= rangeStart && day <= rangeEnd && day >= startBoundary) {
          pushEvent(map, day, {
            title: 'Enter Paylogs',
            time: '08:00',
            endTime: '15:30',
            category: 'paylog',
            type: 'block'
          });
        }
      });

      iter.setMonth(iter.getMonth() + 1);
    }
  }

  function addBudgetPayBillsBlocks(map, rangeStart, rangeEnd) {
    const hasEvent = (list, title, time) => {
      const normTitle = (title || '').trim().toLowerCase()
      const normTime = (time || '').trim().toLowerCase()
      return list.some(ev =>
        (ev.title || '').trim().toLowerCase() === normTitle &&
        (normalizeTime(ev.time) || '').toLowerCase() === normTime
      )
    }

    Object.keys(map).forEach(dateKey => {
      const events = map[dateKey] || []
      const paydays = events.filter(ev => (ev.title || '').trim().toLowerCase() === 'jennifer payday')
      paydays.forEach(ev => {
        const d = new Date(dateKey)
        d.setDate(d.getDate() - 3)
        if (d < rangeStart || d > rangeEnd) return
        const priorKey = toKey(d)
        if (!map[priorKey]) map[priorKey] = []
        const targetList = map[priorKey]
        if (hasEvent(targetList, 'Budget/Pay Bills', '13:00')) return
        targetList.push({
          title: 'Budget/Pay Bills',
          time: '13:00',
          endTime: '13:00',
          category: 'budget',
          type: 'reminder'
        })
      })
    })
  }

  function pushEvent(map, date, item) {
    const key = toKey(date);
    if (!map[key]) map[key] = [];
    map[key].push({ ...item });
  }

  function normalizeTime(timeStr) {
    if (!timeStr) return '';
    return to24h(timeStr);
  }

  function to24h(timeStr) {
    if (!timeStr) return '';
    let [time, ampm] = timeStr.split(' ');
    if (!ampm) {
      const match = timeStr.match(/(\d{1,2}:\d{2})(am|pm)/i);
      if (match) {
        time = match[1];
        ampm = match[2];
      }
    }
    if (!ampm) return time;
    let [hours, minutes] = time.split(':').map(Number);
    if (ampm.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (ampm.toLowerCase() === 'am' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  function toKey(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseISO(str) {
    if (!str) return null;
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const [, y, m, d] = match;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function withinSeries(date, startDateStr, endDateStr) {
    const startDate = parseISO(startDateStr);
    const endDate = parseISO(endDateStr);
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  }

  function isHoliday(date) {
    const holidays = ['01-01', '01-20', '02-17', '03-17', '05-26', '07-04', '09-07', '11-11', '11-27', '12-25'];
    const monthDay = String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    return holidays.includes(monthDay);
  }

  function isSkippedMonth(date, skipMonths) {
    if (!Array.isArray(skipMonths) || skipMonths.length === 0) return false;
    const monthName = date.toLocaleDateString("en-US", { month: "long" });
    return skipMonths.some(month => monthName.toLowerCase() === String(month).toLowerCase());
  }

  function getPatternDate(year, month, pattern) {
    const match = pattern.match(/^(first|second|third|fourth|last)\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/i);
    if (!match) return null;
    const ordinalMap = { first: 0, second: 1, third: 2, fourth: 3, last: 4 };
    const dayMap = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 };
    const ordinal = ordinalMap[match[1].toLowerCase()];
    const dayOfWeek = dayMap[match[2].toLowerCase()];
    let count = 0, target = null;
    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      if (date.getMonth() !== month) break;
      if (date.getDay() === dayOfWeek) {
        if (ordinal === 4) target = date;
        else if (count === ordinal) { target = date; break; }
        count++;
      }
    }
    return target;
  }

  function adjustForHolidayRule(date, holidayRule, skipHolidays) {
    if (!holidayRule && !skipHolidays) return date;
    if (holidayRule === 'prevBusinessDay') {
      const adjusted = new Date(date);
      for (let i = 0; i < 10; i++) {
        if (!(isHoliday(adjusted) || adjusted.getDay() === 0 || adjusted.getDay() === 6)) break;
        adjusted.setDate(adjusted.getDate() - 1);
      }
      return adjusted;
    }
    if ((skipHolidays || holidayRule === 'nextWeek') && isHoliday(date)) {
      const adjusted = new Date(date);
      adjusted.setDate(adjusted.getDate() + 7);
      return adjusted;
    }
    return date;
  }

  function addMonthlyPatternOccurrences(item, rangeStart, rangeEnd, onDate) {
    let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    const last = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);
    for (let i = 0; i < 48 && cursor <= last; i++) {
      const year = cursor.getFullYear(), month = cursor.getMonth();
      const baseDate = getPatternDate(year, month, item.pattern);
      if (baseDate) {
        if (!isSkippedMonth(baseDate, item.skipMonths)) {
          let finalDate = adjustForHolidayRule(baseDate, item.holidayRule, item.skipHolidays);
          if (finalDate >= rangeStart && finalDate <= rangeEnd && withinSeries(finalDate, item.startDate, item.endDate)) {
            onDate(finalDate);
          }
        }
      }
      cursor = new Date(year, month + 1, 1);
    }
  }

  function addMonthlyDayOccurrences(item, rangeStart, rangeEnd, onDate) {
    let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    const last = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);
    for (let i = 0; i < 48 && cursor <= last; i++) {
      const year = cursor.getFullYear(), month = cursor.getMonth();
      const candidate = new Date(year, month, item.dayOfMonth);
      if (candidate.getMonth() === month && withinSeries(candidate, item.startDate, item.endDate) && !isSkippedMonth(candidate, item.skipMonths)) {
        const adjusted = adjustForHolidayRule(candidate, item.holidayRule, item.skipHolidays);
        if (adjusted >= rangeStart && adjusted <= rangeEnd) onDate(adjusted);
      }
      cursor = new Date(year, month + 1, 1);
    }
  }

  function addBiweeklyOccurrences(item, rangeStart, rangeEnd, onDate) {
    const anchor = parseISO(item.startDate);
    if (!anchor) return;
    let curr = new Date(anchor);
    for (let i = 0; i < 500 && curr < rangeStart; i++) curr.setDate(curr.getDate() + 14);
    for (let i = 0; i < 100 && curr <= rangeEnd; i++) {
      if (withinSeries(curr, item.startDate, item.endDate) && !isSkippedMonth(curr, item.skipMonths)) onDate(new Date(curr));
      curr.setDate(curr.getDate() + 14);
    }
  }

  function addWeeklyOccurrences(item, rangeStart, rangeEnd, onDate) {
    const weekdays = Array.isArray(item.weekdays) ? item.weekdays : [];
    let curr = new Date(rangeStart);
    const skipDates = new Set((item.skipDates || []).filter(Boolean));
    for (let i = 0; i < 366 && curr <= rangeEnd; i++) {
      const iso = toKey(curr);
      if (!skipDates.has(iso) && weekdays.includes(curr.getDay()) && withinSeries(curr, item.startDate, item.endDate) && !isSkippedMonth(curr, item.skipMonths)) {
        if (!(item.skipHolidays && isHoliday(curr))) {
          onDate(new Date(curr));
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
  }

  return { initialize };
})();
