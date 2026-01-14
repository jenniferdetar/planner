const opusData = (() => {
  const eventListeners = {};

  let state = {
    tasks: [],
    goals: [],
    notes: [],
    meetings: [],
    masterTasks: [],
    recurringEvents: [],
    byDateEvents: {},
    mission: { statement: '', values: [], lastUpdated: null },
    preferences: {}
  };

  async function initialize() {
    try {
      await opusStorage.initializeStorage();
      syncFromStorage();
      
      // Listen for storage changes (Realtime or Local)
      opusStorage.on(() => {
        syncFromStorage();
        notifyListeners('data-updated', state);
      });

      return Promise.resolve();
    } catch (error) {
      console.error('Error initializing opusData:', error);
      return Promise.reject(error);
    }
  }

  function syncFromStorage() {
    state.tasks = opusStorage.getTasks();
    state.goals = opusStorage.getGoals();
    state.notes = opusStorage.getNotes();
    state.meetings = opusStorage.getMeetings();
    state.masterTasks = opusStorage.getMasterTasks();
    state.recurringEvents = opusStorage.getCalendarRecurring();
    state.byDateEvents = opusStorage.getCalendarByDate();
    state.mission = opusStorage.getMission();
    state.preferences = opusStorage.getPreferences();
  }

  function addEventListener(eventName, callback) {
    if (!eventListeners[eventName]) {
      eventListeners[eventName] = [];
    }
    eventListeners[eventName].push(callback);
  }

  function removeEventListener(eventName, callback) {
    if (eventListeners[eventName]) {
      eventListeners[eventName] = eventListeners[eventName].filter(cb => cb !== callback);
    }
  }

  function notifyListeners(eventName, data) {
    if (eventListeners[eventName]) {
      eventListeners[eventName].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  function getTodaysTasks() {
    const today = new Date().toISOString().split('T')[0];
    return state.tasks.filter(task => task.dueDate === today && !task.completed);
  }

  function getUpcomingMeetings(daysAhead = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today.getTime() + (daysAhead + 1) * 24 * 60 * 60 * 1000);
    endDate.setHours(23, 59, 59, 999);

    const out = [];

    // 1. Regular Meetings
    state.meetings.forEach(m => {
      const d = new Date(m.date + 'T00:00:00');
      if (d >= today && d <= endDate) {
        out.push({
          id: m.id,
          title: m.title,
          date: m.date,
          startTime: m.startTime || m.time,
          category: m.category || 'Meeting',
          type: 'meeting'
        });
      }
    });

    // 2. Date-specific Events
    Object.entries(state.byDateEvents).forEach(([date, events]) => {
      const d = new Date(date + 'T00:00:00');
      if (d >= today && d <= endDate) {
        events.forEach(e => {
          out.push({
            title: typeof e === 'string' ? e : e.title,
            date: date,
            startTime: typeof e === 'string' ? '' : (e.time || ''),
            category: typeof e === 'string' ? 'Event' : (e.category || 'Event'),
            type: 'event'
          });
        });
      }
    });

    // 3. Recurring Events
    state.recurringEvents.forEach(item => {
      expandRecurring(item, today, endDate, d => {
        out.push({
          title: item.title,
          date: d.toISOString().split('T')[0],
          startTime: item.time || '',
          category: item.category || 'Recurring',
          type: 'recurring'
        });
      });
    });

    return out.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      if (cmp !== 0) return cmp;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
  }

  function expandRecurring(item, start, end, onDate) {
    if (item.frequency === 'monthly' && item.pattern) {
      let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      for (let i = 0; i < 3 && cursor <= end; i++) {
        const d = getPatternDate(cursor.getFullYear(), cursor.getMonth(), item.pattern);
        if (d && d >= start && d <= end) onDate(new Date(d));
        cursor.setMonth(cursor.getMonth() + 1);
      }
    } else if (item.frequency === 'monthly' && item.dayOfMonth) {
      let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      for (let i = 0; i < 3 && cursor <= end; i++) {
        const d = new Date(cursor.getFullYear(), cursor.getMonth(), item.dayOfMonth);
        if (d >= start && d <= end) onDate(new Date(d));
        cursor.setMonth(cursor.getMonth() + 1);
      }
    } else if (item.frequency === 'weekly' && Array.isArray(item.weekdays)) {
      let cursor = new Date(start);
      while (cursor <= end) {
        if (item.weekdays.includes(cursor.getDay())) {
          onDate(new Date(cursor));
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    } else if (item.frequency === 'biweekly' && item.startDate) {
      let cursor = new Date(item.startDate + 'T00:00:00');
      while (cursor < start) cursor.setDate(cursor.getDate() + 14);
      while (cursor <= end) {
        if (cursor >= start) onDate(new Date(cursor));
        cursor.setDate(cursor.getDate() + 14);
      }
    }
  }

  function getPatternDate(year, month, pattern) {
    const match = pattern.match(/^(first|second|third|fourth|last)\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/i);
    if (!match) return null;
    const ordMap = { first: 0, second: 1, third: 2, fourth: 3, last: 4 };
    const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    const ordinal = ordMap[match[1].toLowerCase()];
    const dayOfWeek = dayMap[match[2].toLowerCase()];

    let count = 0;
    let target = null;
    for (let day = 1; day <= 31; day++) {
      const d = new Date(year, month, day);
      if (d.getMonth() !== month) break;
      if (d.getDay() === dayOfWeek) {
        if (ordinal === 4) target = new Date(d);
        else if (count === ordinal) return d;
        count++;
      }
    }
    return target;
  }

  function getOverbookedDays() {
    const workHoursPerDay = state.preferences.workEndHour - state.preferences.workStartHour;
    const tasksByDate = {};
    
    state.tasks.forEach(task => {
      if (task.dueDate && !task.completed) {
        if (!tasksByDate[task.dueDate]) {
          tasksByDate[task.dueDate] = [];
        }
        tasksByDate[task.dueDate].push(task);
      }
    });

    const overbookedDays = [];
    Object.keys(tasksByDate).forEach(date => {
      const tasksForDay = tasksByDate[date];
      if (tasksForDay.length > workHoursPerDay) {
        overbookedDays.push(date);
      }
    });

    return overbookedDays;
  }

  function getActiveGoals() {
    return state.goals.filter(goal => goal.status === 'Active');
  }

  function getCompletedGoals() {
    return state.goals.filter(goal => goal.status === 'Completed');
  }

  function normalizeTitle(value) {
    return (value || '').toLowerCase().trim();
  }

  function getBooksFromStorage() {
    try {
      return opusStorage.getBooksToRead();
    } catch (error) {
      console.warn('Books read progress skipped:', error);
      return [];
    }
  }

  function isBusinessBook(book) {
    const text = `${book.title || ''} ${book.author || ''}`.toLowerCase();
    const keywords = [
      'business',
      'startup',
      'entrepreneur',
      'profit',
      'company',
      'career',
      'manager',
      'management',
      'lead',
      'leadership',
      'market',
      'marketing',
      'sales',
      'sell',
      'shop',
      'store',
      'commerce',
      'brand',
      'amazon',
      'fba',
      'drop ship',
      'dropship',
      'remote',
      'hustle',
      'gig',
      'investment',
      'invest',
      'financial',
      'money',
      'recruit',
      'interview',
      'pinnacle',
      'proximity principle'
    ];
    return keywords.some(keyword => text.includes(keyword));
  }

  function computeReadGoalProgress() {
    const books = getBooksFromStorage();
    if (books.length === 0) return 0;

    const businessBooks = books.filter(isBusinessBook);
    const base = businessBooks.length ? businessBooks : books;
    const completed = base.filter(book => book.completed).length;

    if (base.length === 0) return 0;
    return Math.round((completed / base.length) * 100);
  }

  function getGoalProgress(goalId) {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return 0;

    const titleKey = normalizeTitle(goal.title);
    if (titleKey === 'read') {
      return computeReadGoalProgress();
    }

    const linkedTasks = state.tasks.filter(task => task.linkedGoalIds.includes(goalId));
    if (linkedTasks.length === 0) return 0;

    const completedCount = linkedTasks.filter(task => task.completed).length;
    return Math.round((completedCount / linkedTasks.length) * 100);
  }

  function getMissionAlignment(goalId) {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal || !goal.missionAlignment) return [];
    return goal.missionAlignment;
  }

  function updateGoalProgress(goalId) {
    const progress = getGoalProgress(goalId);
    opusStorage.updateGoal(goalId, { progressPercent: progress });
    syncFromStorage();
    notifyListeners('goal-progress-updated', { goalId, progress });
  }

  function tasksByDate(date) {
    return state.tasks
      .filter(task => task.dueDate === date && !task.completed)
      .sort((a, b) => {
        if (a.dueTime && b.dueTime) {
          return a.dueTime.localeCompare(b.dueTime);
        }
        return 0;
      });
  }

  function tasksByPriority() {
    const priorities = { 'High': 0, 'Medium': 1, 'Low': 2 };
    return [...state.tasks]
      .filter(task => !task.completed)
      .sort((a, b) => priorities[a.priority] - priorities[b.priority]);
  }

  return {
    initialize,
    syncFromStorage,
    addEventListener,
    removeEventListener,
    notifyListeners,
    getTodaysTasks,
    getUpcomingMeetings,
    getOverbookedDays,
    getActiveGoals,
    getCompletedGoals,
    getGoalProgress,
    getMissionAlignment,
    updateGoalProgress,
    tasksByDate,
    tasksByPriority,
    get tasks() { return [...state.tasks]; },
    get goals() { return [...state.goals]; },
    get notes() { return [...state.notes]; },
    get meetings() { return [...state.meetings]; },
    get masterTasks() { return [...state.masterTasks]; },
    get mission() { return { ...state.mission }; },
    get preferences() { return { ...state.preferences }; }
  };
})();
