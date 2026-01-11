import { GOALS } from '../data/goals-data.js';

const personalPlanner = (() => {
  let currentView = 'list';
  let currentFilter = 'all';
  let editingTaskId = null;
  let todayDate = utils.getCurrentDateISO();
  let currentWeekStart = (() => {
    const d = new Date();
    const day = d.getDay();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
  })();
  let recurringEvents = [];
  let eventsByDate = {};
  let habits = [];
  const styleMap = {
    due:    { bg: '#ffd6e2', border: '#ff6b98', text: '#7a0f2b' },
    holiday:{ bg: '#ffe1b0', border: '#f59e0b', text: '#9a4d00' },
    csea:   { bg: '#b7dbff', border: '#3b82f6', text: '#0b3b70' },
    payday: { bg: '#c9f5dd', border: '#22c55e', text: '#0f4d2c' },
    budget: { bg: '#ffd4a8', border: '#f97316', text: '#9a3412' },
    budgetpay: { bg: '#bff0d4', border: '#10b981', text: '#0b4a3a' },
    christmas: { bg: '#0f6b3a', border: '#dc2626', text: '#ffffff' },
    birthday:{ bg: '#ffd9b5', border: '#fb923c', text: '#8a2d0f' },
    travel:  { bg: '#e0ccff', border: '#8b5cf6', text: '#4c1d95' },
    home:    { bg: '#ffeab5', border: '#eab308', text: '#7a5b00' },
    personal:{ bg: '#dbeafe', border: '#60a5fa', text: '#1e3a8a' },
    burntorange: { bg: '#c75b12', border: '#8d3f0c', text: '#ffffff' },
    default:{ bg: '#e5e7eb', border: '#9ca3af', text: '#111827' }
  };

  const BUDGET_DATA = {
    'ADT': 53,
    'HELOC': 357,
    'HOA': 520,
    'Mortgage': 2250,
    'Spectrum': 197,
    'Verizon': 283,
    'Paramount+': 13,
    'Taxes': 0
  };

  function initializePage() {
    const calendarPath = document.body?.dataset.calendarSrc || './data/calendar-data.json';
    Promise.all([
      opusData.initialize(),
      fetch(calendarPath).then(res => res.json())
    ]).then(([_, calendarData]) => {
      recurringEvents = calendarData.recurring || [];
      eventsByDate = calendarData.byDate || {};
      habits = calendarData.habits || [];
      
      setupEventListeners();
      updateWeekDisplay();
      setDefaultDate();
      renderTasks();
      setupDataListeners();
      dragDrop.enableTaskReordering('#tasks-list');

      window.addEventListener('storage', (e) => {
        if (e.key === WEEKLY_STATUS_KEY) {
          renderWeeklyTasksSummary();
        }
      });
      
      // Observe changes to format currency automatically
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'characterData' || mutation.type === 'childList') {
            formatNumericalCurrencyValues();
          }
        });
      });
      
      document.querySelectorAll('.icon-row').forEach(row => {
        const line = row.querySelector('.icon-line');
        if (line && row.querySelector('.icon').textContent === '$') {
          observer.observe(line, { characterData: true, childList: true, subtree: true });
        }
      });
    }).catch(error => {
      console.error('Error initializing page:', error);
      utils.showToast('Error loading data', 'error');
    });
  }

  function updateWeekDisplay() {
    const banner = document.querySelector('.week-range-banner');
    if (banner) {
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 6);
      
      const options = { month: 'long', day: 'numeric', year: 'numeric' };
      banner.textContent = `${currentWeekStart.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    }
    
    // Also update individual day labels in the sheet
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    days.forEach((day, index) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + index);
      const label = document.querySelector(`.day-${day} .day-label`);
      if (label) {
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        label.textContent = `${dayName}, ${dateStr}`;
      }
    });

    renderPlannerSheet();
    renderHabits();
    fitPlannerToSidebar();
    formatNumericalCurrencyValues();
  }

  function formatNumericalCurrencyValues() {
    const iconLines = document.querySelectorAll('.icon-row .icon-line');
    iconLines.forEach(line => {
      const icon = line.previousElementSibling;
      if (icon && icon.textContent === '$') {
        const value = line.textContent.trim();
        if (value && !isNaN(parseFloat(value.replace(/,/g, '')))) {
          line.textContent = utils.formatCurrency(value.replace(/,/g, ''));
        }
      }
    });
  }

  function navigateWeek(direction) {
    currentWeekStart.setDate(currentWeekStart.getDate() + (direction * 7));
    updateWeekDisplay();
    // In a real app, we might re-render tasks for this specific week range if they were dynamic
  }

  function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const date = new Date();
      dateElement.textContent = date.toLocaleDateString('en-US', options);
    }
  }

  function setDefaultDate() {
    const dateInput = document.getElementById('task-date');
    if (dateInput) {
      dateInput.value = todayDate;
    }
  }

  function setupEventListeners() {
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', handleAddTask);
    }

    const editForm = document.getElementById('edit-task-form');
    if (editForm) {
      editForm.addEventListener('submit', handleEditTask);
    }

    utils.setupModalClosers('#task-modal', ['#modal-cancel']);

    utils.setupToggleButtons('.view-button', 'active', (data) => {
      currentView = data.view;
      renderTasks();
    });

    utils.setupToggleButtons('.filter-button', 'active', (data) => {
      currentFilter = data.filter;
      renderTasks();
    });

    const firstViewBtn = document.querySelector('[data-view="list"]');
    if (firstViewBtn) {
      firstViewBtn.classList.add('active');
    }

    const firstFilterBtn = document.querySelector('[data-filter="all"]');
    if (firstFilterBtn) {
      firstFilterBtn.classList.add('active');
    }

    const prevBtn = document.getElementById('prev-week-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => navigateWeek(-1));
    }

    const nextBtn = document.getElementById('next-week-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => navigateWeek(1));
    }

    window.addEventListener('resize', fitPlannerToSidebar);
  }

  function setupDataListeners() {
    opusData.addEventListener('task-created', () => { renderTasks(); renderPlannerSheet(); });
    opusData.addEventListener('task-updated', () => { renderTasks(); renderPlannerSheet(); });
    opusData.addEventListener('task-deleted', () => { renderTasks(); renderPlannerSheet(); });
    opusData.addEventListener('task-scheduled', () => { renderTasks(); renderPlannerSheet(); });
  }

  function handleAddTask(e) {
    e.preventDefault();

    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const priority = document.getElementById('task-priority').value;
    const date = document.getElementById('task-date').value;
    const time = document.getElementById('task-time').value;

    if (!title) {
      utils.showToast('Please enter a task title', 'error');
      return;
    }

    try {
      const task = opusStorage.createTask({
        title,
        description,
        priority,
        dueDate: date || null,
        dueTime: time || null,
        category: 'Daily'
      });

      opusData.syncFromStorage();
      opusData.notifyListeners('task-created', task);

      e.target.reset();
      setDefaultDate();
      utils.showToast(`Task "${title}" created successfully`, 'success');
    } catch (error) {
      console.error('Error creating task:', error);
      utils.showToast('Error creating task', 'error');
    }
  }

  function handleEditTask(e) {
    e.preventDefault();

    if (!editingTaskId) return;

    const title = document.getElementById('edit-task-title').value.trim();
    const description = document.getElementById('edit-task-description').value.trim();
    const priority = document.getElementById('edit-task-priority').value;
    const date = document.getElementById('edit-task-date').value;
    const time = document.getElementById('edit-task-time').value;

    try {
      const updatedTask = opusStorage.updateTask(editingTaskId, {
        title,
        description,
        priority,
        dueDate: date || null,
        dueTime: time || null
      });

      opusData.syncFromStorage();
      opusData.notifyListeners('task-updated', updatedTask);

      closeTaskModal();
      utils.showToast(`Task updated successfully`, 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      utils.showToast('Error updating task', 'error');
    }
  }

  function getTasksForDisplay() {
    let tasks = opusData.tasks;

    if (currentFilter === 'high') {
      tasks = tasks.filter(t => t.priority === 'High' && !t.completed);
    } else if (currentFilter === 'pending') {
      tasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
      tasks = tasks.filter(t => t.completed);
    }

    return utils.sortTasksByPriority(utils.sortTasksByTime(tasks));
  }

  function renderTasks() {
    updateStats();
    checkOverbooked();

    const tasks = getTasksForDisplay();

    if (currentView === 'list') {
      renderListView(tasks);
    } else if (currentView === 'timeline') {
      renderTimelineView(tasks);
    }
  }

  function renderListView(tasks) {
    const listContainer = document.getElementById('tasks-list');
    const emptyState = document.getElementById('empty-state');
    const listView = document.getElementById('tasks-list-view');
    const timelineView = document.getElementById('tasks-timeline-view');

    if (!listContainer) return;

    listView.style.display = 'block';
    timelineView.style.display = 'none';

    if (tasks.length === 0) {
      listContainer.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    listContainer.innerHTML = '';

    tasks.forEach(task => {
      const taskElement = createTaskElement(task);
      listContainer.appendChild(taskElement);
    });
  }

  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item opus-list-item ${task.completed ? 'completed' : ''}`;
    li.dataset.taskId = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', (e) => handleTaskToggle(task.id, e.target.checked));

    const content = document.createElement('div');
    content.className = 'task-content';

    const header = document.createElement('div');
    header.className = 'task-header';

    const title = document.createElement('h3');
    title.className = 'task-title';
    title.textContent = task.title;

    const priorityBadge = document.createElement('span');
    priorityBadge.className = `task-priority-badge task-priority-${task.priority.toLowerCase()}`;
    priorityBadge.textContent = task.priority;

    header.appendChild(title);
    header.appendChild(priorityBadge);
    content.appendChild(header);

    if (task.description) {
      const description = document.createElement('p');
      description.className = 'task-description';
      description.textContent = task.description;
      content.appendChild(description);
    }

    const meta = document.createElement('div');
    meta.className = 'task-meta';

    if (task.dueDate) {
      const dateItem = document.createElement('div');
      dateItem.className = 'task-meta-item';
      dateItem.innerHTML = `<i class="fas fa-calendar"></i> ${utils.formatDate(task.dueDate, 'MMM DD')}`;
      meta.appendChild(dateItem);
    }

    if (task.dueTime) {
      const timeItem = document.createElement('div');
      timeItem.className = 'task-meta-item';
      timeItem.innerHTML = `<i class="fas fa-clock"></i> ${utils.formatTime(task.dueTime)}`;
      meta.appendChild(timeItem);
    }

    if (meta.children.length > 0) {
      content.appendChild(meta);
    }

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'task-action-btn edit';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = 'Edit task';
    editBtn.addEventListener('click', () => openTaskModal(task));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-action-btn delete';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete task';
    deleteBtn.addEventListener('click', () => handleDeleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);

    dragDrop.makeTaskDraggable(li, task);

    return li;
  }

  function renderTimelineView(tasks) {
    const timelineContainer = document.getElementById('timeline-container');
    const listView = document.getElementById('tasks-list-view');
    const timelineView = document.getElementById('tasks-timeline-view');

    if (!timelineContainer) return;

    listView.style.display = 'none';
    timelineView.style.display = 'block';

    timelineContainer.innerHTML = '';

    const slots = utils.getHourSlots(6, 20);

    slots.forEach(slot => {
      const slotElement = document.createElement('div');
      slotElement.className = 'timeline-slot opus-drop-zone';
      slotElement.dataset.time = slot.time;

      const timeLabel = document.createElement('div');
      timeLabel.className = 'timeline-slot-time';
      timeLabel.textContent = slot.display;

      const tasksContainer = document.createElement('div');
      tasksContainer.className = 'timeline-slot-tasks';

      const slotTasks = tasks.filter(t => {
        if (!t.dueTime) return false;
        return t.dueTime.startsWith(slot.hour24);
      });

      if (slotTasks.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'timeline-slot-empty';
        empty.textContent = 'No tasks';
        tasksContainer.appendChild(empty);
      } else {
        slotTasks.forEach(task => {
          const taskEl = document.createElement('div');
          taskEl.className = 'timeline-task';
          taskEl.innerHTML = `<strong>${task.title}</strong>` + 
            (task.priority === 'High' ? ' <span class="opus-priority-high">●</span>' : '');
          tasksContainer.appendChild(taskEl);
        });
      }

      slotElement.appendChild(timeLabel);
      slotElement.appendChild(tasksContainer);

      dragDrop.makeDropZone(slotElement, (data) => {
        dragDrop.scheduleDraggedTask(data, todayDate, slot.time);
      });

      timelineContainer.appendChild(slotElement);
    });
  }

  function handleTaskToggle(taskId, completed) {
    try {
      const task = opusStorage.getTaskById(taskId);
      if (!task) return;

      const updatedTask = opusStorage.updateTask(taskId, { completed });

      opusData.syncFromStorage();
      opusData.notifyListeners('task-updated', updatedTask);

      utils.showToast(completed ? 'Task completed!' : 'Task marked pending', 'success');
    } catch (error) {
      console.error('Error toggling task:', error);
      utils.showToast('Error updating task', 'error');
    }
  }

  function handleDeleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      opusStorage.deleteTask(taskId);
      opusData.syncFromStorage();
      opusData.notifyListeners('task-deleted', { id: taskId });
      utils.showToast('Task deleted', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      utils.showToast('Error deleting task', 'error');
    }
  }

  function openTaskModal(task) {
    editingTaskId = task.id;

    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-description').value = task.description || '';
    document.getElementById('edit-task-priority').value = task.priority;
    document.getElementById('edit-task-date').value = task.dueDate || '';
    document.getElementById('edit-task-time').value = task.dueTime || '';

    document.getElementById('task-modal').style.display = 'flex';
  }

  function closeTaskModal() {
    document.getElementById('task-modal').style.display = 'none';
    editingTaskId = null;
    document.getElementById('edit-task-form').reset();
  }

  function updateStats() {
    const todaysTasks = opusData.getTodaysTasks();
    const allTasks = opusData.tasks.filter(t => t.dueDate === todayDate);
    const completed = allTasks.filter(t => t.completed).length;
    const total = allTasks.length;
    const remaining = total - completed;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-remaining').textContent = remaining;

    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('progress-fill').style.width = progressPercent + '%';
  }

  function renderPlannerSheet() {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekEvents = getEventsForRange(currentWeekStart, weekEnd);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    renderWeeklyTasksSummary();

    days.forEach((day, index) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + index);
      const dateKey = toKey(date);
      const dayEvents = weekEvents[dateKey] || [];
      const seen = new Set();
      const dedupedEvents = [];
      const normalizeTitle = (title) => {
        const t = (title || '').trim().toLowerCase();
        return t.replace(/\bstewards?\b/g, 'steward').replace(/\s+/g, ' ');
      };

      dayEvents.forEach(event => {
        const key = [
          normalizeTitle(event.title),
          (event.time || '').trim().toLowerCase(),
          (event.endTime || '').trim().toLowerCase(),
          event.allDay ? 'allDay' : ''
        ].join('|');
        if (seen.has(key)) return;
        seen.add(key);
        dedupedEvents.push(event);
      });

      const dayBlock = document.querySelector(`.day-${day}`);
      if (!dayBlock) return;

      const leftList = dayBlock.querySelector('.left-list');
      const lineLines = dayBlock.querySelector('.day-lines');
      const header = dayBlock.querySelector('.day-header');

      if (leftList) leftList.innerHTML = '';
      const lines = buildDayLines(lineLines, day);
      
      // Clear day-note and reset dollar amount
      if (header) {
        const note = header.querySelector('.day-note');
        if (note) note.textContent = '';
      }

      let dayDueTotal = 0;

      // Sort events by time
      dedupedEvents.sort((a, b) => {
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        if (a.time && b.time) {
          return to24h(a.time).localeCompare(to24h(b.time));
        }
        return 0;
      });

      let lineIndex = 0;

      const leftSeen = new Set();
      const noteSeen = new Set();

      dedupedEvents.forEach(event => {
        if (event.title && event.title.toLowerCase().includes('due')) {
          const itemKey = event.title.replace(/\s+Due$/i, '').trim();
          dayDueTotal += BUDGET_DATA[itemKey] || 0;
        }

        const isHeaderNote = event.category === 'holiday' || event.category === 'birthday';
        if (event.allDay || !event.time) {
          if (!isHeaderNote && leftList) {
            const titleKey = (event.title || '').trim().toLowerCase();
            if (leftSeen.has(titleKey)) return;
            leftSeen.add(titleKey);
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.className = `left-dot ${day}`;
            li.appendChild(span);
            li.title = event.title;
            
            li.appendChild(buildEventPill(event));
            
            li.classList.add('left-item');
            leftList.appendChild(li);
          }
          
          if (isHeaderNote && header) {
             let note = header.querySelector('.day-note');
             if (!note) {
               note = document.createElement('span');
               note.className = 'day-note';
               header.appendChild(note);
             }
             const noteKey = (event.title || '').trim().toLowerCase();
             if (!noteSeen.has(noteKey)) {
               if (note.textContent) note.textContent += ', ';
               note.textContent += event.title;
               noteSeen.add(noteKey);
             }
          }
        } else {
          if (lineIndex < lines.length) {
            const startTime = formatDisplayTime(event.time);
            const endTime = event.endTime ? ` - ${formatDisplayTime(event.endTime)}` : '';
            const timeLabel = `${startTime}${endTime} - ${event.title}`;
            lines[lineIndex].textContent = '';
            lines[lineIndex].appendChild(buildEventPill(event, timeLabel));
            lineIndex++;
          }
        }
      });

      // Update dollar icon amount
      const iconRows = dayBlock.querySelectorAll('.icon-row');
      iconRows.forEach(row => {
        const icon = row.querySelector('.icon');
        const line = row.querySelector('.icon-line');
        if (icon && icon.textContent === '$' && line) {
          line.textContent = dayDueTotal > 0 ? utils.formatCurrency(dayDueTotal) : '';
        }
      });

      if (leftList) {
        const items = Array.from(leftList.querySelectorAll('li'));
        while (items.length < 3) {
          const li = document.createElement('li');
          const span = document.createElement('span');
          span.className = `left-dot ${day}`;
          li.appendChild(span);
          li.classList.add('left-item');
          leftList.appendChild(li);
          items.push(li);
        }
        items.slice(3).forEach(item => item.remove());
      }
    });
  }

  const WEEKLY_STATUS_KEY = 'weeklyTaskStatus';
  const HABIT_STATUS_KEY = 'habitStatus';

  function renderWeeklyTasksSummary() {
    const container = document.getElementById('weekly-tasks-list');
    if (!container) return;
    
    // Add progress bar if it doesn't exist
    let progressWrapper = document.getElementById('weekly-progress-wrapper');
    if (!progressWrapper) {
      progressWrapper = document.createElement('div');
      progressWrapper.id = 'weekly-progress-wrapper';
      progressWrapper.className = 'weekly-progress-container';
      container.parentNode.insertBefore(progressWrapper, container);
    }
    
    container.innerHTML = '';
    
    let smartData = {};
    try {
      smartData = JSON.parse(localStorage.getItem('smartGoals') || '{}');
    } catch (e) {
      smartData = {};
    }

    let completionData = {};
    try {
      completionData = JSON.parse(localStorage.getItem(WEEKLY_STATUS_KEY) || '{}');
    } catch (e) {
      completionData = {};
    }
    
    const weekKey = toKey(currentWeekStart);
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
      progressWrapper.style.display = 'none';
      const li = document.createElement('li');
      li.textContent = 'Set goals to see tasks';
      container.appendChild(li);
      return;
    }

    progressWrapper.style.display = 'block';
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
      container.appendChild(li);
    });

    const percent = Math.round((completedCount / uniqueTasks.length) * 100);
    progressWrapper.innerHTML = `
      <div class="weekly-progress-text">
        <span>Weekly Progress</span>
        <span>${percent}%</span>
      </div>
      <div class="weekly-progress-bar">
        <div class="weekly-progress-fill" style="width: ${percent}%"></div>
      </div>
    `;
  }

  function toggleWeeklyTask(weekKey, taskName) {
    let completionData = {};
    try {
      completionData = JSON.parse(localStorage.getItem(WEEKLY_STATUS_KEY) || '{}');
    } catch (e) {
      completionData = {};
    }

    if (!completionData[weekKey]) completionData[weekKey] = {};
    completionData[weekKey][taskName] = !completionData[weekKey][taskName];

    localStorage.setItem(WEEKLY_STATUS_KEY, JSON.stringify(completionData));
    renderWeeklyTasksSummary();
  }

  function buildDayLines(container, dayClass) {
    if (!container) return [];
    const count = Number(container.dataset.lines || 5);
    container.innerHTML = '';
    const rules = [];
    for (let i = 0; i < count; i++) {
      const lineItem = document.createElement('div');
      lineItem.className = 'line-item';
      const lineBox = document.createElement('span');
      lineBox.className = `line-box ${dayClass}`;
      const lineRule = document.createElement('span');
      lineRule.className = 'line-rule';
      lineItem.appendChild(lineBox);
      lineItem.appendChild(lineRule);
      container.appendChild(lineItem);
      rules.push(lineRule);
    }
    return rules;
  }

  function buildEventPill(item, labelOverride) {
    const div = document.createElement('div');
    div.className = 'calendar-event';
    const eventType = classifyEvent(item);
    const variant = styleMap[eventType] || styleMap.default;
    div.style.backgroundColor = variant.bg;
    div.style.color = variant.text;
    div.style.borderColor = variant.border;
    if (item.title === "New Year's Day") {
      div.innerHTML = '<span class="calendar-event-text calendar-event-small">New Year&#39;s<br>Day</span>';
    } else {
      div.textContent = labelOverride || item.title || '';
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
    if (/due/i.test(text) || category === 'finance') return 'due';
    if (holidays.test(text) || category === 'holiday') return 'holiday';
    if (/csea/i.test(text) || /la fed/i.test(text) || category === 'csea') return 'csea';
    if (/stay at|travel|hotel|vacation/i.test(text) || category === 'travel') return 'travel';
    if (/laundry|sweeping|cleaning|home care/i.test(text) || category === 'home') return 'home';
    if (/shower|bedtime|self care/i.test(text) || category === 'personal') return 'personal';
    return 'default';
  }

  function formatDisplayTime(timeStr) {
    if (!timeStr) return '';
    if (/[ap]m/i.test(timeStr)) {
      return timeStr.toLowerCase();
    }
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      return utils.formatTime(timeStr, '12h').toLowerCase();
    }
    return timeStr;
  }

  function fitPlannerToSidebar() {
    const sidebar = document.querySelector('.planner-sidebar');
    const page = document.querySelector('.personal-planner-page');
    const scaleTarget = document.querySelector('.personal-planner-scale');
    if (!sidebar || !page || !scaleTarget) return;

    scaleTarget.style.transform = 'none';
    page.style.height = 'auto';
  }

  function renderHabits() {
    const habitGrid = document.querySelector('.habit-grid');
    if (!habitGrid) return;

    if (!Array.isArray(habits) || habits.length === 0) {
      return;
    }

    let habitCompletion = {};
    try {
      habitCompletion = JSON.parse(localStorage.getItem(HABIT_STATUS_KEY) || '{}');
    } catch (e) {
      habitCompletion = {};
    }

    habitGrid.innerHTML = '';

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayClasses = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const weekKey = toKey(currentWeekStart);

    habits.forEach(habit => {
      const card = document.createElement('div');
      card.className = 'habit-card';

      const title = document.createElement('h2');
      title.className = 'habit-title';
      title.textContent = habit.title;
      card.appendChild(title);

      const content = document.createElement('div');
      content.className = 'habit-content';

      const miniWeek = document.createElement('div');
      miniWeek.className = 'mini-week';

      const labels = document.createElement('div');
      labels.className = 'mini-week-labels';
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(label => {
        const span = document.createElement('span');
        span.textContent = label;
        labels.appendChild(span);
      });
      miniWeek.appendChild(labels);

      const grid = document.createElement('div');
      grid.className = 'mini-week-grid';

      const items = habit.items || [];
      const rowCount = Math.max(items.length, 3);

      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const row = document.createElement('div');
        row.className = 'mini-week-row';
        const habitItemName = items[rowIndex] ? items[rowIndex].name : null;

        dayNames.forEach((_, index) => {
          const span = document.createElement('span');
          const dayClass = dayClasses[index];
          span.className = `day-${dayClass}`;
          
          if (habitItemName) {
            const completionKey = `${weekKey}-${habit.title}-${habitItemName}-${dayClass}`;
            const isCompleted = habitCompletion[completionKey] === true;
            if (isCompleted) {
              span.classList.add('completed');
            }
            span.style.cursor = 'pointer';
            span.addEventListener('click', () => {
              toggleHabit(completionKey);
            });
          }
          
          row.appendChild(span);
        });
        grid.appendChild(row);
      }

      miniWeek.appendChild(grid);
      content.appendChild(miniWeek);

      const list = document.createElement('ul');
      list.className = 'habit-list';

      items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.name;
        list.appendChild(li);
      });

      content.appendChild(list);
      card.appendChild(content);

      habitGrid.appendChild(card);
    });
  }

  function toggleHabit(key) {
    let habitCompletion = {};
    try {
      habitCompletion = JSON.parse(localStorage.getItem(HABIT_STATUS_KEY) || '{}');
    } catch (e) {
      habitCompletion = {};
    }

    habitCompletion[key] = !habitCompletion[key];
    localStorage.setItem(HABIT_STATUS_KEY, JSON.stringify(habitCompletion));
    renderHabits();
  }

  function getEventsForRange(start, end) {
    const map = {};
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = toKey(cursor);
      map[key] = [];
      if (eventsByDate[key]) {
        eventsByDate[key].forEach(e => {
          const eventObj = typeof e === 'string' ? { title: e } : { ...e };
          if ((eventObj.title || '').trim().toLowerCase() === 'wake up') return;
          map[key].push(eventObj);
        });
      }
      
      // Fetch tasks from opusData
      const tasks = opusData.tasks.filter(t => t.dueDate === key);
      tasks.forEach(t => {
        map[key].push({
          title: t.title,
          time: t.dueTime ? utils.formatTime(t.dueTime) : null,
          category: t.category,
          priority: t.priority,
          id: t.id,
          type: 'task'
        });
      });

      // Fetch meetings from opusData
      const meetings = opusData.meetings.filter(m => m.date === key);
      meetings.forEach(m => {
        map[key].push({
          title: m.title,
          time: m.startTime ? utils.formatTime(m.startTime) : null,
          endTime: m.endTime ? utils.formatTime(m.endTime) : null,
          category: 'meeting',
          type: 'meeting'
        });
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    recurringEvents.forEach(item => {
      if ((item.title || '').trim().toLowerCase() === 'wake up') {
        return;
      }

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

    return map;
  }

  function pushEvent(map, date, item) {
    const key = toKey(date);
    if (map[key]) {
      map[key].push({ ...item });
    }
  }

  function to24h(timeStr) {
    if (!timeStr) return '00:00';
    let [time, ampm] = timeStr.split(' ');
    if (!ampm) {
      // Check if am/pm is appended to time like "11:00am"
      const match = timeStr.match(/(\d{1,2}:\d{2})(am|pm)/i);
      if (match) {
        time = match[1];
        ampm = match[2];
      }
    }
    if (!ampm) return time; // Already 24h or unknown

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

  function addMonthlyPatternOccurrences(item, rangeStart, rangeEnd, onDate) {
    let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    const last = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);
    while (cursor <= last) {
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
    while (cursor <= last) {
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
    while (curr < rangeStart) curr.setDate(curr.getDate() + 14);
    while (curr <= rangeEnd) {
      if (withinSeries(curr, item.startDate, item.endDate) && !isSkippedMonth(curr, item.skipMonths)) onDate(new Date(curr));
      curr.setDate(curr.getDate() + 14);
    }
  }

  function addWeeklyOccurrences(item, rangeStart, rangeEnd, onDate) {
    const weekdays = Array.isArray(item.weekdays) ? item.weekdays : [];
    let curr = new Date(rangeStart);
    const skipDates = new Set((item.skipDates || []).filter(Boolean));
    while (curr <= rangeEnd) {
      const iso = toKey(curr);
      if (!skipDates.has(iso) && weekdays.includes(curr.getDay()) && withinSeries(curr, item.startDate, item.endDate) && !isSkippedMonth(curr, item.skipMonths)) {
        if (!(item.skipHolidays && isHoliday(curr))) onDate(new Date(curr));
      }
      curr.setDate(curr.getDate() + 1);
    }
  }

  function adjustForHolidayRule(date, holidayRule, skipHolidays) {
    if (!holidayRule && !skipHolidays) return date;
    if (holidayRule === 'prevBusinessDay') {
      const adjusted = new Date(date);
      while (isHoliday(adjusted) || adjusted.getDay() === 0 || adjusted.getDay() === 6) adjusted.setDate(adjusted.getDate() - 1);
      return adjusted;
    }
    if ((skipHolidays || holidayRule === 'nextWeek') && isHoliday(date)) {
      const adjusted = new Date(date);
      adjusted.setDate(adjusted.getDate() + 7);
      return adjusted;
    }
    return date;
  }

  function checkOverbooked() {
    const overbookedDays = opusData.getOverbookedDays();
    const alert = document.getElementById('overbooked-alert');
    if (!alert) return;

    let weekOverbooked = false;
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      if (overbookedDays.includes(toKey(date))) {
        weekOverbooked = true;
        break;
      }
    }
    
    if (weekOverbooked) {
      alert.style.display = 'flex';
      alert.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>This week has overbooked days. Consider rescheduling some tasks.</p>';
    } else {
      alert.style.display = 'none';
    }
  }

  return {
    initializePage
  };
})();

document.addEventListener('DOMContentLoaded', personalPlanner.initializePage);
