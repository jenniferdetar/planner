const opusData = (() => {
  const eventListeners = {};

  let state = {
    tasks: [],
    goals: [],
    notes: [],
    meetings: [],
    masterTasks: [],
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
    const endDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const todayISO = today.toISOString().split('T')[0];
    const endDateISO = endDate.toISOString().split('T')[0];
    
    return state.meetings.filter(meeting => {
      return meeting.date >= todayISO && meeting.date <= endDateISO;
    }).sort((a, b) => a.date.localeCompare(b.date));
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
