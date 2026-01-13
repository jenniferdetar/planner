const opusStorage = (() => {
  const STORAGE_KEY = 'opusData';
  const supabaseClient = window.supabaseClient;
  let supabaseUser = null;

  function requireLogin() {
    if (!supabaseUser) {
      throw new Error('Login required to sync data with Supabase.');
    }
  }
  
  let data = {
    tasks: [],
    goals: [],
    notes: [],
    meetings: [],
    masterTasks: [],
    habits: [],
    habitStatus: {}, // { date: { habitId: completed } }
    metadata: {}, // Generic key-value store
    cseaIssues: [],
    cseaMeetingNotes: [],
    cseaNotesTags: [],
    cseaNotesSaved: [],
    budgetActuals: {},
    budgetInputs: {},
    booksToRead: [],
    intentionsDreams: {},
    smartGoals: {},
    weeklyTaskStatus: {},
    mission: {
      statement: '',
      values: [],
      lastUpdated: null
    },
    preferences: {
      theme: 'light',
      defaultView: 'daily',
      workStartHour: 6,
      workEndHour: 20,
      weekStartDay: 'Sunday',
      notifications: true,
      timeFormat: '12h'
    }
  };

  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getCurrentISODateTime() {
    return new Date().toISOString();
  }

  function validateTask(task) {
    if (!task.title || typeof task.title !== 'string') {
      throw new Error('Task must have a valid title');
    }
    if (task.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)) {
      throw new Error('dueDate must be in YYYY-MM-DD format');
    }
    if (task.dueTime && !/^\d{2}:\d{2}$/.test(task.dueTime)) {
      throw new Error('dueTime must be in HH:MM format');
    }
    if (task.priority && !['High', 'Medium', 'Low'].includes(task.priority)) {
      throw new Error('priority must be High, Medium, or Low');
    }
  }

  function findItem(collection, id) {
    return collection.find(x => x.id === id) || null;
  }

  function updateItem(collection, id, updates, allowedFields) {
    requireLogin();
    const item = findItem(collection, id);
    if (!item) throw new Error(`Item with id ${id} not found`);
    allowedFields.forEach(key => {
      if (key in updates) item[key] = updates[key];
    });
    item.updatedAt = getCurrentISODateTime();
    saveToLocalStorage();
    return item;
  }

  function deleteItem(collection, id) {
    requireLogin();
    const idx = collection.findIndex(x => x.id === id);
    if (idx === -1) throw new Error(`Item with id ${id} not found`);
    collection.splice(idx, 1);
    saveToLocalStorage();
  }

  async function initializeStorage() {
    try {
      if (supabaseClient) {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        supabaseUser = sessionData?.session?.user || null;
        if (supabaseUser) {
          await pullFromSupabase();
        }
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Error initializing storage:', error);
      return Promise.reject(error);
    }
  }

  function saveToLocalStorage() {
    // Local persistence disabled; rely on Supabase
    if (supabaseUser) {
      pushToSupabase().catch(err => console.error('Supabase sync error', err));
    }
  }

  function loadFromLocalStorage() {
    // Disabled: no localStorage fallback
  }

  async function pullFromSupabase() {
    if (!supabaseClient || !supabaseUser) return;
    
    // Pull Tasks
    const { data: tasksData } = await supabaseClient.from('planner_tasks').select('*').eq('user_id', supabaseUser.id);
    if (tasksData) {
      data.tasks = tasksData.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description || '',
        dueDate: row.due_date || null,
        dueTime: row.due_time || null,
        priority: row.priority || 'Medium',
        completed: row.completed || false,
        linkedGoalIds: row.linked_goal_ids || [],
        category: row.category || 'General',
        subtasks: row.subtasks || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    }

    // Pull Goals
    const { data: goalsData } = await supabaseClient.from('planner_goals').select('*').eq('user_id', supabaseUser.id);
    if (goalsData) {
      data.goals = goalsData.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description || '',
        status: row.status || 'Active',
        category: row.category || 'General',
        missionAlignment: row.mission_alignment || [],
        timeframe: row.timeframe || '',
        linkedTaskIds: row.linked_task_ids || [],
        progressPercent: row.progress_percent || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    }

    // Pull Notes
    const { data: notesData } = await supabaseClient.from('planner_notes').select('*').eq('user_id', supabaseUser.id);
    if (notesData) {
      data.notes = notesData.map(row => ({
        id: row.id,
        date: row.date,
        content: row.content,
        tags: row.tags || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    }

    // Pull Meetings
    const { data: meetingsData } = await supabaseClient.from('planner_meetings').select('*').eq('user_id', supabaseUser.id);
    if (meetingsData) {
      data.meetings = meetingsData.map(row => ({
        id: row.id,
        title: row.title,
        date: row.date,
        startTime: row.start_time,
        endTime: row.end_time,
        location: row.location,
        attendees: row.attendees || [],
        agenda: row.agenda,
        notes: row.notes,
        linkedTaskIds: row.linked_task_ids || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    }

    // Pull Master Tasks
    const { data: masterTasksData } = await supabaseClient.from('planner_master_tasks').select('*').eq('user_id', supabaseUser.id);
    if (masterTasksData) {
      data.masterTasks = masterTasksData.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        priority: row.priority || 'Medium',
        linkedGoalIds: row.linked_goal_ids || [],
        category: row.category || 'General',
        scheduledTaskId: row.scheduled_task_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    }

    // Pull Habits
    const { data: habitsData } = await supabaseClient.from('planner_habits').select('*').eq('user_id', supabaseUser.id);
    if (habitsData) {
      data.habits = habitsData.map(row => ({ id: row.id, name: row.name }));
    }

    // Pull Habit Status
    const { data: habitStatusData } = await supabaseClient.from('planner_habit_status').select('*').eq('user_id', supabaseUser.id);
    if (habitStatusData) {
      data.habitStatus = {};
      habitStatusData.forEach(row => {
        if (!data.habitStatus[row.date]) data.habitStatus[row.date] = {};
        data.habitStatus[row.date][row.habit_id] = row.completed;
      });
    }

    // Pull Metadata (including mission and preferences)
    const { data: metadataData } = await supabaseClient.from('planner_metadata').select('*').eq('user_id', supabaseUser.id);
    if (metadataData) {
      metadataData.forEach(row => {
        if (row.key === 'mission') data.mission = row.value;
        else if (row.key === 'preferences') data.preferences = row.value;
        else if (row.key === 'cseaIssues') data.cseaIssues = row.value;
        else if (row.key === 'cseaMeetingNotes') data.cseaMeetingNotes = row.value;
        else if (row.key === 'cseaNotesTags') data.cseaNotesTags = row.value;
        else if (row.key === 'cseaNotesSaved') data.cseaNotesSaved = row.value;
        else if (row.key === 'budgetActuals') data.budgetActuals = row.value;
        else if (row.key === 'budgetInputs') data.budgetInputs = row.value;
        else if (row.key === 'booksToRead') data.booksToRead = row.value;
        else if (row.key === 'intentionsDreams') data.intentionsDreams = row.value;
        else if (row.key === 'smartGoals') data.smartGoals = row.value;
        else if (row.key === 'weeklyTaskStatus') data.weeklyTaskStatus = row.value;
        else data.metadata[row.key] = row.value;
      });
    }

    // Pull CSEA Members and Issues (New specialized tables)
    const { data: membersData } = await supabaseClient.from('csea_members').select('*').eq('user_id', supabaseUser.id);
    if (membersData && membersData.length > 0) {
      // Logic to merge or override if necessary, for now we just log availability
      console.log('CSEA Members loaded from Supabase');
    }

    const { data: specializedIssuesData } = await supabaseClient.from('csea_issues').select('*, csea_members(*)').eq('user_id', supabaseUser.id);
    if (specializedIssuesData && specializedIssuesData.length > 0) {
      // If we have specialized data, it could potentially override the metadata version
      // data.cseaIssues = specializedIssuesData.map(...);
    }
  }

  async function pushToSupabase() {
    if (!supabaseClient || !supabaseUser) return;
    
    // Push Tasks
    const taskRows = data.tasks.map(t => ({
      id: t.id,
      user_id: supabaseUser.id,
      title: t.title,
      description: t.description,
      due_date: t.dueDate,
      due_time: t.dueTime,
      priority: t.priority,
      completed: t.completed,
      linked_goal_ids: t.linkedGoalIds,
      category: t.category,
      subtasks: t.subtasks,
      updated_at: t.updatedAt || new Date().toISOString()
    }));
    if (taskRows.length) {
      await supabaseClient.from('planner_tasks').upsert(taskRows, { onConflict: 'id' });
    }

    // Push Goals
    const goalRows = data.goals.map(g => ({
      id: g.id,
      user_id: supabaseUser.id,
      title: g.title,
      description: g.description,
      status: g.status,
      category: g.category,
      mission_alignment: g.missionAlignment,
      timeframe: g.timeframe,
      linked_task_ids: g.linkedTaskIds,
      progress_percent: g.progressPercent,
      updated_at: g.updatedAt || new Date().toISOString()
    }));
    if (goalRows.length) {
      await supabaseClient.from('planner_goals').upsert(goalRows, { onConflict: 'id' });
    }

    // Push Notes
    const noteRows = data.notes.map(n => ({
      id: n.id,
      user_id: supabaseUser.id,
      date: n.date,
      content: n.content,
      tags: n.tags,
      updated_at: n.updatedAt || new Date().toISOString()
    }));
    if (noteRows.length) {
      await supabaseClient.from('planner_notes').upsert(noteRows, { onConflict: 'id' });
    }

    // Push Meetings
    const meetingRows = data.meetings.map(m => ({
      id: m.id,
      user_id: supabaseUser.id,
      title: m.title,
      date: m.date,
      start_time: m.startTime,
      end_time: m.endTime,
      location: m.location,
      attendees: m.attendees,
      agenda: m.agenda,
      notes: m.notes,
      linked_task_ids: m.linkedTaskIds,
      updated_at: m.updatedAt || new Date().toISOString()
    }));
    if (meetingRows.length) {
      await supabaseClient.from('planner_meetings').upsert(meetingRows, { onConflict: 'id' });
    }

    // Push Master Tasks
    const masterTaskRows = data.masterTasks.map(mt => ({
      id: mt.id,
      user_id: supabaseUser.id,
      title: mt.title,
      description: mt.description,
      priority: mt.priority,
      linked_goal_ids: mt.linkedGoalIds,
      category: mt.category,
      scheduled_task_id: mt.scheduledTaskId,
      updated_at: mt.updatedAt || new Date().toISOString()
    }));
    if (masterTaskRows.length) {
      await supabaseClient.from('planner_master_tasks').upsert(masterTaskRows, { onConflict: 'id' });
    }

    // Push Habits
    const habitRows = data.habits.map(h => ({
      id: h.id,
      user_id: supabaseUser.id,
      name: h.name
    }));
    if (habitRows.length) {
      await supabaseClient.from('planner_habits').upsert(habitRows, { onConflict: 'id' });
    }

    // Push Habit Status
    const statusRows = [];
    Object.entries(data.habitStatus).forEach(([date, habits]) => {
      Object.entries(habits).forEach(([habitId, completed]) => {
        statusRows.push({
          user_id: supabaseUser.id,
          date,
          habit_id: habitId,
          completed
        });
      });
    });
    if (statusRows.length) {
      await supabaseClient.from('planner_habit_status').upsert(statusRows, { onConflict: 'user_id,date,habit_id' });
    }

    // Push Metadata (including mission and preferences)
    const metadataRows = [
      { user_id: supabaseUser.id, key: 'mission', value: data.mission, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'preferences', value: data.preferences, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'cseaIssues', value: data.cseaIssues, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'cseaMeetingNotes', value: data.cseaMeetingNotes, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'cseaNotesTags', value: data.cseaNotesTags, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'cseaNotesSaved', value: data.cseaNotesSaved, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'budgetActuals', value: data.budgetActuals, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'budgetInputs', value: data.budgetInputs, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'booksToRead', value: data.booksToRead, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'intentionsDreams', value: data.intentionsDreams, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'smartGoals', value: data.smartGoals, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'weeklyTaskStatus', value: data.weeklyTaskStatus, updated_at: new Date().toISOString() }
    ];
    Object.entries(data.metadata).forEach(([key, value]) => {
      metadataRows.push({ user_id: supabaseUser.id, key, value, updated_at: new Date().toISOString() });
    });
    await supabaseClient.from('planner_metadata').upsert(metadataRows, { onConflict: 'user_id,key' });
  }

  function createTask(taskData) {
    requireLogin();
    validateTask(taskData);
    const task = {
      id: generateId(),
      title: taskData.title,
      description: taskData.description || '',
      dueDate: taskData.dueDate || null,
      dueTime: taskData.dueTime || null,
      priority: taskData.priority || 'Medium',
      completed: false,
      linkedGoalIds: taskData.linkedGoalIds || [],
      category: taskData.category || 'General',
      subtasks: taskData.subtasks || [],
      createdAt: getCurrentISODateTime(),
      updatedAt: getCurrentISODateTime()
    };
    data.tasks.push(task);
    saveToLocalStorage();
    return task;
  }

  function getTaskById(id) {
    return findItem(data.tasks, id);
  }

  function getTasks() {
    return [...data.tasks];
  }

  function updateTask(id, updates) {
    return updateItem(data.tasks, id, updates, ['title', 'description', 'dueDate', 'dueTime', 'priority', 'completed', 'linkedGoalIds', 'category', 'subtasks']);
  }

  function deleteTask(id) {
    deleteItem(data.tasks, id);
  }

  function getTasksByDate(date) {
    return data.tasks.filter(task => task.dueDate === date);
  }

  function getTasksByGoal(goalId) {
    return data.tasks.filter(task => task.linkedGoalIds.includes(goalId));
  }

  function createGoal(goalData) {
    requireLogin();
    const goal = {
      id: generateId(),
      title: goalData.title,
      description: goalData.description || '',
      category: goalData.category || 'Personal',
      missionAlignment: goalData.missionAlignment || [],
      timeframe: goalData.timeframe || 'Mid-term',
      linkedTaskIds: goalData.linkedTaskIds || [],
      status: 'Active',
      progressPercent: 0,
      createdAt: getCurrentISODateTime(),
      updatedAt: getCurrentISODateTime()
    };
    data.goals.push(goal);
    saveToLocalStorage();
    return goal;
  }

  function getGoalById(id) {
    return findItem(data.goals, id);
  }

  function getGoals() {
    return [...data.goals];
  }

  function updateGoal(id, updates) {
    return updateItem(data.goals, id, updates, ['title', 'description', 'category', 'missionAlignment', 'timeframe', 'linkedTaskIds', 'status', 'progressPercent']);
  }

  function deleteGoal(id) {
    deleteItem(data.goals, id);
  }

  function createNote(noteData) {
    requireLogin();
    const note = {
      id: generateId(),
      date: noteData.date,
      content: noteData.content || '',
      tags: noteData.tags || [],
      createdAt: getCurrentISODateTime(),
      updatedAt: getCurrentISODateTime()
    };
    data.notes.push(note);
    saveToLocalStorage();
    return note;
  }

  function getNotes() {
    return [...data.notes];
  }

  function getNotesByDate(date) {
    return data.notes.find(note => note.date === date) || null;
  }

  function updateNote(id, content, tags) {
    const updates = { content };
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : [];
    return updateItem(data.notes, id, updates, ['content', 'tags']);
  }

  function deleteNote(id) {
    deleteItem(data.notes, id);
  }

  function createMeeting(meetingData) {
    requireLogin();
    const meeting = {
      id: generateId(),
      title: meetingData.title,
      date: meetingData.date,
      startTime: meetingData.startTime,
      endTime: meetingData.endTime,
      location: meetingData.location || '',
      attendees: meetingData.attendees || [],
      agenda: meetingData.agenda || '',
      notes: meetingData.notes || '',
      linkedTaskIds: meetingData.linkedTaskIds || [],
      createdAt: getCurrentISODateTime(),
      updatedAt: getCurrentISODateTime()
    };
    data.meetings.push(meeting);
    saveToLocalStorage();
    return meeting;
  }

  function getMeetings() {
    return [...data.meetings];
  }

  function getMeetingsByDate(date) {
    return data.meetings.filter(meeting => meeting.date === date);
  }

  function updateMeeting(id, updates) {
    return updateItem(data.meetings, id, updates, ['title', 'date', 'startTime', 'endTime', 'location', 'attendees', 'agenda', 'notes', 'linkedTaskIds']);
  }

  function deleteMeeting(id) {
    deleteItem(data.meetings, id);
  }

  function createMasterTask(taskData) {
    requireLogin();
    validateTask(taskData);
    const task = {
      id: generateId(),
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'Medium',
      linkedGoalIds: taskData.linkedGoalIds || [],
      category: taskData.category || 'General',
      createdAt: getCurrentISODateTime(),
      updatedAt: getCurrentISODateTime(),
      scheduledTaskId: null
    };
    data.masterTasks.push(task);
    saveToLocalStorage();
    return task;
  }

  function getMasterTasks() {
    return [...data.masterTasks];
  }

  function getMasterTaskById(id) {
    return data.masterTasks.find(task => task.id === id) || null;
  }

  function updateMasterTask(id, updates) {
    return updateItem(data.masterTasks, id, updates, ['title', 'description', 'priority', 'linkedGoalIds', 'category', 'scheduledTaskId']);
  }

  function deleteMasterTask(id) {
    deleteItem(data.masterTasks, id);
  }

  // Habits
  function getHabits() {
    return [...data.habits];
  }

  function setHabits(habits) {
    data.habits = habits;
    saveToLocalStorage();
  }

  function updateHabitStatus(date, habitId, completed) {
    if (!data.habitStatus[date]) data.habitStatus[date] = {};
    data.habitStatus[date][habitId] = completed;
    saveToLocalStorage();
  }

  function getHabitStatus(date) {
    return data.habitStatus[date] || {};
  }

  // Metadata
  function getMetadata(key) {
    return data.metadata[key];
  }

  function updateMetadata(key, value) {
    data.metadata[key] = value;
    saveToLocalStorage();
  }

  function scheduleTask(masterTaskId, date, time = null) {
    const masterTask = getMasterTaskById(masterTaskId);
    if (!masterTask) {
      throw new Error(`Master task with id ${masterTaskId} not found`);
    }
    
    const scheduledTask = createTask({
      title: masterTask.title,
      description: masterTask.description,
      dueDate: date,
      dueTime: time,
      priority: masterTask.priority,
      category: masterTask.category,
      linkedGoalIds: masterTask.linkedGoalIds
    });
    
    updateMasterTask(masterTaskId, { scheduledTaskId: scheduledTask.id });
    
    return scheduledTask;
  }

  function getMission() {
    return { ...data.mission };
  }

  function updateMission(statement, values) {
    data.mission = {
      statement,
      values: Array.isArray(values) ? values : [],
      lastUpdated: getCurrentISODateTime()
    };
    saveToLocalStorage();
    return data.mission;
  }

  function getPreferences() {
    return { ...data.preferences };
  }

  function updatePreference(key, value) {
    if (key in data.preferences) {
      data.preferences[key] = value;
      saveToLocalStorage();
    } else {
      throw new Error(`Unknown preference key: ${key}`);
    }
  }
  
  function getCseaIssues() {
    return [...data.cseaIssues];
  }

  function setCseaIssues(issues) {
    data.cseaIssues = issues;
    saveToLocalStorage();
  }

  function getCseaMeetingNotes() {
    return [...data.cseaMeetingNotes];
  }

  function setCseaMeetingNotes(notes) {
    data.cseaMeetingNotes = notes;
    saveToLocalStorage();
  }

  function getCseaNotesTags() {
    return [...data.cseaNotesTags];
  }

  function setCseaNotesTags(tags) {
    data.cseaNotesTags = tags;
    saveToLocalStorage();
  }

  function getCseaNotesSaved() {
    return [...data.cseaNotesSaved];
  }

  function setCseaNotesSaved(items) {
    data.cseaNotesSaved = items;
    saveToLocalStorage();
  }

  function getBudgetActuals() {
    return { ...data.budgetActuals };
  }

  function setBudgetActuals(actuals) {
    data.budgetActuals = actuals;
    saveToLocalStorage();
  }

  function getBudgetInputs() {
    return { ...data.budgetInputs };
  }

  function setBudgetInputs(inputs) {
    data.budgetInputs = inputs;
    saveToLocalStorage();
  }

  function getBooksToRead() {
    return [...data.booksToRead];
  }

  function setBooksToRead(books) {
    data.booksToRead = books;
    saveToLocalStorage();
  }

  function getIntentionsDreams() {
    return { ...data.intentionsDreams };
  }

  function setIntentionsDreams(intentions) {
    data.intentionsDreams = intentions;
    saveToLocalStorage();
  }

  function getSmartGoals() {
    return { ...data.smartGoals };
  }

  function setSmartGoals(goals) {
    data.smartGoals = goals;
    saveToLocalStorage();
  }

  function getWeeklyTaskStatus() {
    return { ...data.weeklyTaskStatus };
  }

  function setWeeklyTaskStatus(status) {
    data.weeklyTaskStatus = status;
    saveToLocalStorage();
  }

  function exportData() {
    return JSON.stringify(data, null, 2);
  }

  function importData(jsonString) {
    try {
      const importedData = JSON.parse(jsonString);
      if (!importedData.tasks || !importedData.goals || !importedData.notes) {
        throw new Error('Invalid data format');
      }
      data = importedData;
      saveToLocalStorage();
    } catch (error) {
      throw new Error(`Failed to import data: ${error.message}`);
    }
  }

  function clearAllData() {
    data = {
      tasks: [],
      goals: [],
      notes: [],
      meetings: [],
      masterTasks: [],
      habits: [],
      habitStatus: {},
      metadata: {},
      cseaIssues: [],
      cseaMeetingNotes: [],
      cseaNotesTags: [],
      cseaNotesSaved: [],
      budgetActuals: {},
      budgetInputs: {},
      booksToRead: [],
      intentionsDreams: {},
      smartGoals: {},
      weeklyTaskStatus: {},
      mission: { statement: '', values: [], lastUpdated: null },
      preferences: data.preferences
    };
    saveToLocalStorage();
  }

  return {
    initializeStorage,
    saveToLocalStorage,
    loadFromLocalStorage,
    createTask,
    getTaskById,
    getTasks,
    updateTask,
    deleteTask,
    getTasksByDate,
    getTasksByGoal,
    createGoal,
    getGoalById,
    getGoals,
    updateGoal,
    deleteGoal,
    createNote,
    getNotes,
    getNotesByDate,
    updateNote,
    deleteNote,
    createMeeting,
    getMeetings,
    getMeetingsByDate,
    updateMeeting,
    deleteMeeting,
    createMasterTask,
    getMasterTasks,
    getMasterTaskById,
    updateMasterTask,
    deleteMasterTask,
    getHabits,
    setHabits,
    updateHabitStatus,
    getHabitStatus,
    getMetadata,
    updateMetadata,
    scheduleTask,
    getMission,
    updateMission,
    getPreferences,
    updatePreference,
    getCseaIssues,
    setCseaIssues,
    getCseaMeetingNotes,
    setCseaMeetingNotes,
    getCseaNotesTags,
    setCseaNotesTags,
    getCseaNotesSaved,
    setCseaNotesSaved,
    getBudgetActuals,
    setBudgetActuals,
    getBudgetInputs,
    setBudgetInputs,
    getBooksToRead,
    setBooksToRead,
    getIntentionsDreams,
    setIntentionsDreams,
    getSmartGoals,
    setSmartGoals,
    getWeeklyTaskStatus,
    setWeeklyTaskStatus,
    exportData,
    importData,
    clearAllData
  };
})();
