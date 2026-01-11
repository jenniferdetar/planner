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
    const { data: tasksData, error: tasksError } = await supabaseClient
      .from('planner_tasks')
      .select('*')
      .eq('user_id', supabaseUser.id);
    if (tasksError) console.error(tasksError);
    const { data: goalsData, error: goalsError } = await supabaseClient
      .from('planner_goals')
      .select('*')
      .eq('user_id', supabaseUser.id);
    if (goalsError) console.error(goalsError);

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
  }

  async function pushToSupabase() {
    if (!supabaseClient || !supabaseUser) return;
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
      created_at: t.createdAt,
      updated_at: t.updatedAt
    }));

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
      created_at: g.createdAt,
      updated_at: g.updatedAt
    }));

    if (taskRows.length) {
      await supabaseClient.from('planner_tasks').upsert(taskRows, { onConflict: 'id' });
      await supabaseClient.from('planner_tasks').delete().eq('user_id', supabaseUser.id).not('id', 'in', taskRows.map(t => t.id));
    }
    if (goalRows.length) {
      await supabaseClient.from('planner_goals').upsert(goalRows, { onConflict: 'id' });
      await supabaseClient.from('planner_goals').delete().eq('user_id', supabaseUser.id).not('id', 'in', goalRows.map(g => g.id));
    }
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
    scheduleTask,
    getMission,
    updateMission,
    getPreferences,
    updatePreference,
    exportData,
    importData,
    clearAllData
  };
})();
