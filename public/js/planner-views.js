const plannerViews = (() => {
  let currentView = 'daily';
  let currentDate = new Date();

  function initializePage() {
    opusData.initialize().then(() => {
      setupEventListeners();
      switchView('daily');
      setupDataListeners();
      renderSidebar();
    }).catch(error => {
      console.error('Error initializing page:', error);
      utils.showToast('Error loading data', 'error');
    });
  }

  function setupEventListeners() {
    utils.setupToggleButtons('.view-button', 'active', (data) => {
      currentView = data.view;
      switchView(currentView);
    });
    utils.on('#prev-period-btn', 'click', navigatePrevious);
    utils.on('#next-period-btn', 'click', navigateNext);
    utils.on('#today-btn', 'click', () => {
      currentDate = new Date();
      renderCurrentView();
      updatePeriodDisplay();
    });
  }

  function setupDataListeners() {
    opusData.addEventListener('task-created', () => {
      renderCurrentView();
      renderSidebar();
    });
    opusData.addEventListener('task-updated', () => {
      renderCurrentView();
      renderSidebar();
    });
    opusData.addEventListener('task-deleted', () => {
      renderCurrentView();
      renderSidebar();
    });
    opusData.addEventListener('meeting-created', renderSidebar);
    opusData.addEventListener('meeting-updated', renderSidebar);
    opusData.addEventListener('goal-updated', renderSidebar);
  }

  function switchView(view) {
    currentView = view;
    document.querySelectorAll('.planner-view').forEach(el => {
      el.style.display = 'none';
    });

    const viewEl = document.getElementById(`${view}-view`);
    if (viewEl) {
      viewEl.style.display = 'block';
    }

    renderCurrentView();
    updatePeriodDisplay();
  }

  function renderCurrentView() {
    switch (currentView) {
      case 'daily':
        renderDailyView();
        break;
      case 'weekly':
        renderWeeklyView();
        break;
      case 'monthly':
        renderMonthlyView();
        break;
      case 'eisenhower':
        renderEisenhowerView();
        break;
    }
  }

  function navigatePrevious() {
    if (currentView === 'daily') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (currentView === 'weekly') {
      currentDate.setDate(currentDate.getDate() - 7);
    } else if (currentView === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else if (currentView === 'eisenhower') {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    renderCurrentView();
    updatePeriodDisplay();
  }

  function navigateNext() {
    if (currentView === 'daily') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (currentView === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (currentView === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (currentView === 'eisenhower') {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    renderCurrentView();
    updatePeriodDisplay();
  }

  function updatePeriodDisplay() {
    const display = document.getElementById('period-display');
    if (!display) return;

    if (currentView === 'daily') {
      display.textContent = utils.formatDate(currentDate, 'dddd, MMM DD, YYYY');
    } else if (currentView === 'weekly') {
      const weekDates = utils.getWeekDates(currentDate);
      const startDate = utils.formatDate(weekDates[0], 'MMM DD');
      const endDate = utils.formatDate(weekDates[6], 'MMM DD, YYYY');
      display.textContent = `${startDate} - ${endDate}`;
    } else if (currentView === 'monthly') {
      display.textContent = utils.formatDate(currentDate, 'MMMM YYYY');
    } else if (currentView === 'eisenhower') {
      display.textContent = utils.formatDate(currentDate, 'MMM DD, YYYY');
    }
  }

  // Daily View Renderer
  function renderDailyView() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const dateStr = currentDate.toISOString().split('T')[0];
    const dayTasks = opusData.tasksByDate(dateStr);
    const slots = utils.getHourSlots(6, 20);

    container.innerHTML = '';

    slots.forEach(slot => {
      const slotEl = document.createElement('div');
      slotEl.className = 'timeline-slot opus-drop-zone';
      slotEl.dataset.time = slot.time;
      slotEl.dataset.date = dateStr;

      const timeLabel = document.createElement('div');
      timeLabel.className = 'timeline-slot-time';
      timeLabel.textContent = slot.display;

      const tasksContainer = document.createElement('div');
      tasksContainer.className = 'timeline-slot-tasks';

      const slotTasks = dayTasks.filter(t => t.dueTime && t.dueTime.startsWith(slot.hour24));

      if (slotTasks.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'timeline-slot-empty';
        empty.textContent = 'No tasks';
        tasksContainer.appendChild(empty);
      } else {
        slotTasks.forEach(task => {
          const taskEl = document.createElement('div');
          taskEl.className = 'timeline-task';
          taskEl.textContent = task.title;
          taskEl.draggable = true;
          dragDrop.makeTaskDraggable(taskEl, task);
          tasksContainer.appendChild(taskEl);
        });
      }

      slotEl.appendChild(timeLabel);
      slotEl.appendChild(tasksContainer);

      dragDrop.makeDropZone(slotEl, (data) => {
        dragDrop.scheduleDraggedTask(data, dateStr, slot.time);
        utils.showToast('Task scheduled!', 'success');
        renderCurrentView();
        renderSidebar();
      });

      container.appendChild(slotEl);
    });
  }

  // Weekly View Renderer
  function renderWeeklyView() {
    const container = document.getElementById('weekly-grid');
    if (!container) return;

    const weekDates = utils.getWeekDates(currentDate);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const headerContainer = document.querySelector('.week-day-header');
    if (headerContainer) {
      headerContainer.innerHTML = '';
      days.forEach(day => {
        const label = document.createElement('div');
        label.className = 'week-day-label';
        label.textContent = day;
        headerContainer.appendChild(label);
      });
    }

    container.innerHTML = '';

    weekDates.forEach((date, index) => {
      const dayTasks = opusData.tasksByDate(date);
      const cell = document.createElement('div');
      cell.className = 'weekly-day-cell opus-drop-zone';
      cell.dataset.date = date;

      const dateHeader = document.createElement('div');
      dateHeader.className = 'weekly-date-header';
      dateHeader.textContent = utils.formatDate(date, 'D');

      const dateLabel = document.createElement('div');
      dateLabel.className = 'weekly-date-label';
      dateLabel.textContent = utils.formatDate(date, 'MMM DD');

      const tasksList = document.createElement('div');
      tasksList.className = 'weekly-tasks-list';

      dayTasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = 'weekly-task';
        taskEl.textContent = task.title;
        taskEl.draggable = true;
        dragDrop.makeTaskDraggable(taskEl, task);
        tasksList.appendChild(taskEl);
      });

      cell.appendChild(dateHeader);
      cell.appendChild(dateLabel);
      cell.appendChild(tasksList);

      dragDrop.makeDropZone(cell, (data) => {
        dragDrop.scheduleDraggedTask(data, date, null);
        utils.showToast('Task scheduled!', 'success');
        renderCurrentView();
        renderSidebar();
      });

      container.appendChild(cell);
    });
  }

  // Monthly View Renderer
  function renderMonthlyView() {
    const container = document.getElementById('monthly-calendar');
    if (!container) return;

    const monthDates = utils.getMonthDates(currentDate);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = utils.getCurrentDateISO();

    container.innerHTML = '';

    days.forEach(day => {
      const label = document.createElement('div');
      label.className = 'calendar-day-label';
      label.textContent = day;
      container.appendChild(label);
    });

    monthDates.forEach(date => {
      const dayTasks = opusData.tasksByDate(date);
      const dateObj = new Date(date);
      const isOtherMonth = dateObj.getMonth() !== currentDate.getMonth();
      const isToday = date === today;

      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell opus-drop-zone';
      if (isOtherMonth) cell.classList.add('other-month');
      if (isToday) cell.classList.add('today');
      cell.dataset.date = date;

      const dateEl = document.createElement('div');
      dateEl.className = 'calendar-date';
      if (isOtherMonth) dateEl.classList.add('other-month');
      dateEl.textContent = dateObj.getDate();

      const tasksList = document.createElement('div');
      tasksList.className = 'calendar-tasks';

      dayTasks.slice(0, 3).forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = 'calendar-task';
        taskEl.textContent = task.title;
        taskEl.draggable = true;
        dragDrop.makeTaskDraggable(taskEl, task);
        tasksList.appendChild(taskEl);
      });

      if (dayTasks.length > 3) {
        const moreEl = document.createElement('div');
        moreEl.style.fontSize = '0.7rem';
        moreEl.style.color = 'var(--opus-text-secondary)';
        moreEl.textContent = `+${dayTasks.length - 3} more`;
        tasksList.appendChild(moreEl);
      }

      cell.appendChild(dateEl);
      cell.appendChild(tasksList);

      dragDrop.makeDropZone(cell, (data) => {
        dragDrop.scheduleDraggedTask(data, date, null);
        utils.showToast('Task scheduled!', 'success');
        renderCurrentView();
        renderSidebar();
      });

      container.appendChild(cell);
    });
  }

  // Eisenhower Matrix View Renderer
  function renderEisenhowerView() {
    const dateStr = currentDate.toISOString().split('T')[0];
    const tasks = opusData.tasksByDate(dateStr);

    const quadrants = {
      'do-first': { tasks: [], selector: '#quadrant-do-first' },
      'schedule': { tasks: [], selector: '#quadrant-schedule' },
      'delegate': { tasks: [], selector: '#quadrant-delegate' },
      'eliminate': { tasks: [], selector: '#quadrant-eliminate' }
    };

    tasks.forEach(task => {
      const isHigh = task.priority === 'High';
      const daysUntil = utils.daysUntil(task.dueDate || dateStr);
      const isUrgent = daysUntil <= 3;

      if (isHigh && isUrgent) {
        quadrants['do-first'].tasks.push(task);
      } else if (isHigh && !isUrgent) {
        quadrants['schedule'].tasks.push(task);
      } else if (!isHigh && isUrgent) {
        quadrants['delegate'].tasks.push(task);
      } else {
        quadrants['eliminate'].tasks.push(task);
      }
    });

    Object.entries(quadrants).forEach(([key, data]) => {
      const container = document.querySelector(data.selector);
      if (!container) return;

      container.innerHTML = '';

      data.tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'quadrant-task-item';
        li.draggable = true;

        const title = document.createElement('div');
        title.className = 'quadrant-task-title';
        title.textContent = task.title;

        const time = document.createElement('div');
        time.className = 'quadrant-task-time';
        time.textContent = task.dueTime ? utils.formatTime(task.dueTime) : 'No time set';

        li.appendChild(title);
        li.appendChild(time);

        dragDrop.makeTaskDraggable(li, task);
        container.appendChild(li);
      });

      if (data.tasks.length === 0) {
        const empty = document.createElement('li');
        empty.style.textAlign = 'center';
        empty.style.color = 'var(--opus-text-secondary)';
        empty.style.fontSize = '0.85rem';
        empty.textContent = 'No tasks';
        container.appendChild(empty);
      }
    });
  }

  // Sidebar Renderer
  function renderSidebar() {
    renderUpcomingMeetings();
    renderActiveGoals();
    renderTodaysSummary();
  }

  function renderUpcomingMeetings() {
    const list = document.getElementById('upcoming-meetings-list');
    if (!list) return;

    const upcomingMeetings = opusData.getUpcomingMeetings(7);

    list.innerHTML = '';

    if (upcomingMeetings.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-list';
      empty.textContent = 'No meetings scheduled';
      list.appendChild(empty);
      return;
    }

    upcomingMeetings.forEach(meeting => {
      const li = document.createElement('li');
      li.className = 'sidebar-meeting-item';

      const title = document.createElement('div');
      title.className = 'sidebar-meeting-title';
      title.textContent = meeting.title;

      const time = document.createElement('div');
      time.className = 'sidebar-meeting-time';
      time.textContent = `${utils.formatDate(meeting.date, 'MMM DD')} at ${utils.formatTime(meeting.startTime)}`;

      li.appendChild(title);
      li.appendChild(time);
      list.appendChild(li);
    });
  }

  function renderActiveGoals() {
    const list = document.getElementById('active-goals-list');
    if (!list) return;

    const activeGoals = opusData.getActiveGoals();

    list.innerHTML = '';

    if (activeGoals.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-list';
      empty.textContent = 'No active goals';
      list.appendChild(empty);
      return;
    }

    activeGoals.forEach(goal => {
      const li = document.createElement('li');
      li.className = 'sidebar-goal-item';

      const title = document.createElement('div');
      title.className = 'sidebar-goal-title';
      title.textContent = goal.title;

      const progress = opusData.getGoalProgress(goal.id);

      const progressEl = document.createElement('div');
      progressEl.className = 'sidebar-goal-progress';
      progressEl.textContent = `${progress}% complete`;

      li.appendChild(title);
      li.appendChild(progressEl);
      list.appendChild(li);
    });
  }

  function renderTodaysSummary() {
    const today = utils.getCurrentDateISO();
    const todaysTasks = opusData.tasksByDate(today);
    const completedTasks = todaysTasks.filter(t => t.completed).length;
    const pendingTasks = todaysTasks.filter(t => !t.completed).length;
    const highPriority = todaysTasks.filter(t => t.priority === 'High').length;

    document.getElementById('stat-total-tasks').textContent = todaysTasks.length;
    document.getElementById('stat-completed-tasks').textContent = completedTasks;
    document.getElementById('stat-pending-tasks').textContent = pendingTasks;
    document.getElementById('stat-high-priority').textContent = highPriority;
  }

  return {
    initializePage
  };
})();

document.addEventListener('DOMContentLoaded', plannerViews.initializePage);
