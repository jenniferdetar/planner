const opusStorage = (() => {
  const STORAGE_KEY = 'opusData';
  const supabaseClient = window.supabaseClient;
  let supabaseUser = null;
  const listeners = [];

  function on(callback) {
    listeners.push(callback);
  }

  function off(callback) {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  }

  function emit() {
    listeners.forEach(callback => callback(data));
  }

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
    transactions: [],
    budgetActuals: {},
    budgetInputs: {},
    booksToRead: [],
    intentionsDreams: {},
    smartGoals: {},
    weeklyTaskStatus: {},
    recurringEvents: [],
    byDateEvents: {},
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
          await checkAndMigrateData();
          subscribeToRealtime();
          emit(); // Notify listeners after initial pull
        }
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Error initializing storage:', error);
      return Promise.reject(error);
    }
  }

  async function checkAndMigrateData() {
    if (!supabaseClient || !supabaseUser) return;

    const hasEvents = data.recurringEvents.length > 0 || Object.keys(data.byDateEvents).length > 0;
    const hasHabits = data.habits.length > 0;

    if (!hasEvents || !hasHabits) {
      try {
        console.log('Checking for migration from calendar-data.json...');
        const res = await fetch('/static/data/calendar/calendar-data.json');
        if (!res.ok) return;
        const calendarData = await res.json();

        if (!hasEvents) {
          console.log('Migrating events from JSON...');
          data.recurringEvents = calendarData.recurring || [];
          data.byDateEvents = calendarData.byDate || {};
          // pushToSupabase will handle the events table
        }

        if (!hasHabits && calendarData.habits) {
          console.log('Migrating habits from JSON...');
          const habits = [];
          calendarData.habits.forEach(category => {
            category.items.forEach(item => {
              habits.push({
                id: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                name: `${category.title}: ${item.name}`
              });
            });
          });
          data.habits = habits;
        }

        await pushToSupabase();
      } catch (err) {
        console.warn('Migration failed (maybe JSON is already gone):', err);
      }
    }
  }

  function subscribeToRealtime() {
    if (!supabaseClient || !supabaseUser) return;

    const tables = [
      'opus_tasks', 'goals', 'opus_notes', 'opus_meetings', 
      'opus_master_tasks', 'opus_mission', 'opus_preferences', 
      'books', 'hours_worked', 
      'calendar_recurring', 'calendar_by_date', 'Check Breakdown', 
      'paylog submission', 'approval_dates', 'vision_board_photos',
      'csea_members', 'csea_issues', 'planner_habits', 'planner_habit_status', 'work_planner_edits'
    ];

    tables.forEach(table => {
      supabaseClient
        .channel(`public:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: table, filter: `user_id=eq.${supabaseUser.id}` }, async (payload) => {
          console.log(`Realtime change in ${table}:`, payload);
          // Simple approach: re-pull all data for now to ensure consistency
          // Improvements can be made to update only the specific item
          await pullFromSupabase();
          emit();
        })
        .subscribe();
    });
  }

  function saveToLocalStorage() {
    // Local persistence disabled; rely on Supabase
    if (supabaseUser) {
      pushToSupabase()
        .then(() => emit())
        .catch(err => console.error('Supabase sync error', err));
    }
  }

  function loadFromLocalStorage() {
    // Disabled: no localStorage fallback
  }

  async function pullFromSupabase() {
    if (!supabaseClient || !supabaseUser) return;
    
    // Pull Tasks
    const { data: tasksData } = await supabaseClient.from('opus_tasks').select('*').eq('user_id', supabaseUser.id);
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
    const { data: goalsData } = await supabaseClient.from('goals').select('*').eq('user_id', supabaseUser.id);
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
    const { data: notesData } = await supabaseClient.from('opus_notes').select('*').eq('user_id', supabaseUser.id);
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
    const { data: meetingsData } = await supabaseClient.from('opus_meetings').select('*').eq('user_id', supabaseUser.id);
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
    const { data: masterTasksData } = await supabaseClient.from('opus_master_tasks').select('*').eq('user_id', supabaseUser.id);
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

    // Pull Mission
    const { data: missionData } = await supabaseClient.from('opus_mission').select('*').eq('user_id', supabaseUser.id).single();
    if (missionData) {
      data.mission = missionData.content || data.mission;
    }

    // Pull Preferences
    const { data: prefsData } = await supabaseClient.from('opus_preferences').select('*').eq('user_id', supabaseUser.id).single();
    if (prefsData) {
      data.preferences = prefsData.settings || data.preferences;
    }

    // Pull Books
    const { data: booksData } = await supabaseClient.from('books').select('*').eq('user_id', supabaseUser.id);
    if (booksData) {
      data.booksToRead = booksData.map(row => ({
        id: row.id,
        title: row.title,
        author: row.author,
        completed: row.completed
      }));
    }

    // Pull Hours Worked
    const { data: hoursData } = await supabaseClient.from('hours_worked').select('*').eq('user_id', supabaseUser.id);
    if (hoursData) {
      data.metadata.hoursWorked = hoursData;
    }

    // Pull Max Completion Times
    const { data: maxTimesData } = await supabaseClient.from('paylog submission').select('*').eq('user_id', supabaseUser.id);
    if (maxTimesData) {
      data.metadata.maxCompletionTimes = maxTimesData;
    }

    // Pull Approval Dates
    const { data: approvalData } = await supabaseClient.from('approval_dates').select('*').eq('user_id', supabaseUser.id);
    if (approvalData) {
      data.metadata.approvalDates = approvalData;
    }

    // Pull Vision Board Photos
    const { data: visionPhotosData } = await supabaseClient.from('vision_board_photos').select('*').eq('user_id', supabaseUser.id);
    if (visionPhotosData) {
      data.metadata.visionBoardPhotos = visionPhotosData;
    }

    // Pull Events
    const { data: recurringData } = await supabaseClient.from('calendar_recurring').select('*').eq('user_id', supabaseUser.id);
    if (recurringData) {
      data.recurringEvents = recurringData.map(row => {
        if (row.details) return row.details;
        const e = { ...row };
        // Map snake_case to camelCase
        if (row.start_date) e.startDate = row.start_date;
        if (row.end_date) e.endDate = row.end_date;
        if (row.end_time) e.endTime = row.end_time;
        if (row.day_of_month) e.dayOfMonth = row.day_of_month;
        if (row.skip_months) {
          try { e.skipMonths = JSON.parse(row.skip_months); } 
          catch(err) { e.skipMonths = row.skip_months; }
        }
        if (row.skip_holidays) e.skipHolidays = row.skip_holidays;
        if (row.skip_dates) {
          try { e.skipDates = JSON.parse(row.skip_dates); }
          catch(err) { e.skipDates = row.skip_dates; }
        }
        if (row.holiday_rule) e.holidayRule = row.holiday_rule;
        if (row.weekdays) {
          try { e.weekdays = JSON.parse(row.weekdays); }
          catch(err) { e.weekdays = row.weekdays; }
        }
        return e;
      });
    }
    const { data: byDateData } = await supabaseClient.from('calendar_by_date').select('*').eq('user_id', supabaseUser.id);
    if (byDateData) {
      data.byDateEvents = {};
      byDateData.forEach(e => {
        const date = e.date || (e.details && e.details.date);
        if (date) {
          if (!data.byDateEvents[date]) data.byDateEvents[date] = [];
          data.byDateEvents[date].push(e.details || e);
        }
      });
    }

    // Pull Transactions (Check Breakdown)
    const { data: transactionsData } = await supabaseClient.from('Check Breakdown').select('*').eq('user_id', supabaseUser.id);
    if (transactionsData) {
      data.transactions = transactionsData.map(row => ({
        id: row.id,
        date: row.date,
        account: row.account,
        amount: row.amount,
        category: row.category,
        updatedAt: row.updated_at
      }));
    }

    // Pull Metadata (remaining generic keys)
    const { data: metadataData } = await supabaseClient.from('opus_preferences').select('*').eq('user_id', supabaseUser.id);
    if (metadataData) {
      metadataData.forEach(row => {
        const key = row.key;
        const value = row.value;
        if (key === 'cseaIssues') data.cseaIssues = value;
        else if (key === 'cseaMeetingNotes') data.cseaMeetingNotes = value;
        else if (key === 'cseaNotesTags') data.cseaNotesTags = value;
        else if (key === 'cseaNotesSaved') data.cseaNotesSaved = value;
        else if (key === 'budgetActuals') data.budgetActuals = value;
        else if (key === 'budgetInputs') data.budgetInputs = value;
        else if (key === 'intentionsDreams') data.intentionsDreams = value;
        else if (key === 'smartGoals') data.smartGoals = value;
        else if (key === 'weeklyTaskStatus') data.weeklyTaskStatus = value;
        else data.metadata[key] = value;
      });
    }

    // Pull Habits
    const { data: habitsData } = await supabaseClient.from('planner_habits').select('*').eq('user_id', supabaseUser.id);
    if (habitsData) {
      data.habits = habitsData.map(row => ({ id: row.id, name: row.name }));
    }

    const { data: habitStatusData } = await supabaseClient.from('planner_habit_status').select('*').eq('user_id', supabaseUser.id);
    if (habitStatusData) {
      data.habitStatus = {};
      habitStatusData.forEach(row => {
        if (!data.habitStatus[row.date]) data.habitStatus[row.date] = {};
        data.habitStatus[row.date][row.habit_id] = row.completed;
      });
    }

    // Pull specialized tables
    const { data: workEditsData } = await supabaseClient.from('work_planner_edits').select('*').eq('user_id', supabaseUser.id);
    if (workEditsData) {
      if (!data.metadata.workPlannerEdits) data.metadata.workPlannerEdits = {};
      workEditsData.forEach(row => {
        if (!data.metadata.workPlannerEdits[row.date_key]) data.metadata.workPlannerEdits[row.date_key] = {};
        data.metadata.workPlannerEdits[row.date_key][row.slot_key] = row.value;
      });
    }

    const { data: membersData } = await supabaseClient.from('csea_members').select('*').eq('user_id', supabaseUser.id);
    if (membersData && membersData.length > 0) {
      console.log('CSEA Members loaded from Supabase');
    }

    const { data: specializedIssuesData } = await supabaseClient.from('csea_issues').select('*, csea_members(*)').eq('user_id', supabaseUser.id);
    if (specializedIssuesData && specializedIssuesData.length > 0) {
      // specializedIssuesData can be processed here
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
      await supabaseClient.from('opus_tasks').upsert(taskRows, { onConflict: 'id' });
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
      await supabaseClient.from('goals').upsert(goalRows, { onConflict: 'id' });
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
      await supabaseClient.from('opus_notes').upsert(noteRows, { onConflict: 'id' });
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
      await supabaseClient.from('opus_meetings').upsert(meetingRows, { onConflict: 'id' });
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
      await supabaseClient.from('opus_master_tasks').upsert(masterTaskRows, { onConflict: 'id' });
    }

    // Push Mission
    await supabaseClient.from('opus_mission').upsert({
      user_id: supabaseUser.id,
      content: data.mission,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    // Push Preferences
    await supabaseClient.from('opus_preferences').upsert({
      user_id: supabaseUser.id,
      settings: data.preferences,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    // Push Books
    const bookRows = data.booksToRead.map(b => ({
      id: b.id,
      user_id: supabaseUser.id,
      title: b.title,
      author: b.author,
      completed: b.completed
    }));
    if (bookRows.length) {
      await supabaseClient.from('books').upsert(bookRows, { onConflict: 'id' });
    }

    // Push Transactions (Check Breakdown)
    const transactionRows = data.transactions.map(t => ({
      id: t.id,
      user_id: supabaseUser.id,
      date: t.date,
      account: t.account,
      amount: t.amount,
      category: t.category,
      updated_at: t.updatedAt || new Date().toISOString()
    }));
    if (transactionRows.length) {
      await supabaseClient.from('Check Breakdown').upsert(transactionRows, { onConflict: 'id' });
    }

    // Push Events
    await supabaseClient.from('calendar_recurring').delete().eq('user_id', supabaseUser.id);
    await supabaseClient.from('calendar_by_date').delete().eq('user_id', supabaseUser.id);
    
    const recurringRows = data.recurringEvents.map(e => ({
      user_id: supabaseUser.id,
      id: e.id || generateId(),
      title: e.title,
      frequency: e.frequency,
      start_date: e.startDate,
      end_date: e.endDate,
      time: e.time,
      end_time: e.endTime,
      pattern: e.pattern,
      day_of_month: e.dayOfMonth,
      weekdays: Array.isArray(e.weekdays) ? JSON.stringify(e.weekdays) : e.weekdays,
      skip_months: Array.isArray(e.skipMonths) ? JSON.stringify(e.skipMonths) : e.skipMonths,
      skip_holidays: e.skipHolidays,
      skip_dates: Array.isArray(e.skipDates) ? JSON.stringify(e.skipDates) : e.skipDates,
      holiday_rule: e.holidayRule,
      category: e.category,
      updated_at: new Date().toISOString()
    }));
    if (recurringRows.length) {
      await supabaseClient.from('calendar_recurring').insert(recurringRows);
    }

    const byDateRows = [];
    Object.entries(data.byDateEvents).forEach(([date, events]) => {
      events.forEach(e => {
        const row = {
          user_id: supabaseUser.id,
          date: date,
          id: e.id || generateId(),
          updated_at: new Date().toISOString()
        };
        if (typeof e === 'string') {
          row.title = e;
        } else {
          row.title = e.title;
          row.category = e.category;
        }
        byDateRows.push(row);
      });
    });
    if (byDateRows.length) {
      await supabaseClient.from('calendar_by_date').insert(byDateRows);
    }

    // Push Metadata (remaining generic keys)
    const metadataRows = [
      { user_id: supabaseUser.id, key: 'cseaIssues', value: data.cseaIssues, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'cseaMeetingNotes', value: data.cseaMeetingNotes, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'cseaNotesTags', value: data.cseaNotesTags, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'cseaNotesSaved', value: data.cseaNotesSaved, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'budgetActuals', value: data.budgetActuals, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'budgetInputs', value: data.budgetInputs, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'intentionsDreams', value: data.intentionsDreams, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'smartGoals', value: data.smartGoals, updated_at: new Date().toISOString() },
      { user_id: supabaseUser.id, key: 'weeklyTaskStatus', value: data.weeklyTaskStatus, updated_at: new Date().toISOString() }
    ];
    Object.entries(data.metadata).forEach(([key, value]) => {
      if (!['hoursWorked', 'maxCompletionTimes', 'approvalDates', 'visionBoardPhotos'].includes(key)) {
        metadataRows.push({ user_id: supabaseUser.id, key, value, updated_at: new Date().toISOString() });
      }
    });
    await supabaseClient.from('opus_preferences').upsert(metadataRows, { onConflict: 'user_id,key' });

    // Pull specialized tables
    if (data.metadata.hoursWorked) {
      await supabaseClient.from('hours_worked').upsert(data.metadata.hoursWorked.map(h => ({ ...h, user_id: supabaseUser.id })), { onConflict: 'id' });
    }
    if (data.metadata.maxCompletionTimes) {
      await supabaseClient.from('paylog submission').upsert(data.metadata.maxCompletionTimes.map(m => ({ ...m, user_id: supabaseUser.id })), { onConflict: 'id' });
    }
    if (data.metadata.approvalDates) {
      await supabaseClient.from('approval_dates').upsert(data.metadata.approvalDates.map(a => ({ ...a, user_id: supabaseUser.id })), { onConflict: 'id' });
    }
    if (data.metadata.visionBoardPhotos) {
      await supabaseClient.from('vision_board_photos').upsert(data.metadata.visionBoardPhotos.map(v => ({ ...v, user_id: supabaseUser.id })), { onConflict: 'id' });
    }

    // Push Work Planner Edits
    const workEdits = data.metadata.workPlannerEdits || {};
    const workEditRows = [];
    Object.entries(workEdits).forEach(([dateKey, slots]) => {
      Object.entries(slots).forEach(([slotKey, value]) => {
        workEditRows.push({
          user_id: supabaseUser.id,
          date_key: dateKey,
          slot_key: slotKey,
          value: value,
          created_at: new Date().toISOString()
        });
      });
    });
    if (workEditRows.length) {
      await supabaseClient.from('work_planner_edits').upsert(workEditRows, { onConflict: 'user_id,date_key,slot_key' });
    }

    // Push Habits
    if (data.habits.length) {
      const habitRows = data.habits.map(h => ({
        id: h.id,
        user_id: supabaseUser.id,
        name: h.name,
        created_at: new Date().toISOString()
      }));
      await supabaseClient.from('planner_habits').upsert(habitRows, { onConflict: 'id' });
    }

    const habitStatusRows = [];
    Object.entries(data.habitStatus).forEach(([date, habits]) => {
      Object.entries(habits).forEach(([habitId, completed]) => {
        habitStatusRows.push({
          user_id: supabaseUser.id,
          date: date,
          habit_id: habitId,
          completed: completed
        });
      });
    });
    if (habitStatusRows.length) {
      await supabaseClient.from('planner_habit_status').upsert(habitStatusRows, { onConflict: 'user_id,date,habit_id' });
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

  // Transactions
  function getTransactions() {
    return [...data.transactions];
  }

  function setTransactions(transactions) {
    data.transactions = transactions;
    saveToLocalStorage();
  }

  function updateTransaction(id, updates) {
    return updateItem(data.transactions, id, updates, ['date', 'account', 'amount', 'category']);
  }

  function deleteTransaction(id) {
    deleteItem(data.transactions, id);
  }

  function getCalendarRecurring() {
    return [...data.recurringEvents];
  }

  function setCalendarRecurring(events) {
    data.recurringEvents = events;
    saveToLocalStorage();
  }

  function getCalendarByDate() {
    return { ...data.byDateEvents };
  }

  function setCalendarByDate(events) {
    data.byDateEvents = events;
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
    on,
    off,
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
    getTransactions,
    setTransactions,
    updateTransaction,
    deleteTransaction,
    getCalendarRecurring,
    setCalendarRecurring,
    getCalendarByDate,
    setCalendarByDate,
    exportData,
    importData,
    clearAllData
  };
})();
