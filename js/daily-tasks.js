const dailyTasks = (() => {
  const STORAGE_KEY = 'dailyTasks';
  const HABITS_KEY = 'dailyHabits';
  const HABIT_STATUS_KEY = 'dailyHabitStatus';

  const SCHEDULED_TASKS = [
    { category: 'Home Care', text: 'Make beds', days: ['daily'] },
    { category: 'Home Care', text: 'Ana - Cleaning', days: ['sun'] },
    { category: 'Home Care', text: 'Recycling', days: ['daily'] },
    { category: 'Self Care', text: 'Read', days: ['daily'] },
    { category: 'Self Care', text: 'Bring lunch to work', days: ['mon', 'tue', 'wed', 'thu', 'fri'] },
    { category: 'Self Care', text: 'Take Ozempic (Sun AM)', days: ['sun'] },
    { category: 'Self Care', text: 'Take Metformin (AM)', days: ['daily'] },
    { category: 'Self Care', text: 'Take Metformin (PM)', days: ['daily'] },
    { category: 'Self Care', text: 'Take Glipizide (AM)', days: ['daily'] },
    { category: 'Self Care', text: 'Take Glipizide (PM)', days: ['daily'] },
    { category: 'Self Care', text: 'Take Rosuvastatin 20 mg (AM)', days: ['daily'] },
    { category: 'Self Care', text: 'Take Buspirone 10 mg (AM)', days: ['daily'] },
    { category: 'Self Care', text: 'Take Jardiance 25 mg (AM)', days: ['daily'] },
    { category: 'Self Care', text: 'Take Estradiol 2 mg (AM)', days: ['daily'] },
    { category: 'Self Care', text: 'Take Bupropion XL 300 mg (AM)', days: ['daily'] },
    { category: 'Self Care', text: 'Take Nexium 24HR 20 mg (AM)', days: ['daily'] },
    { category: 'Weekdays', text: 'Get up at 5:00 am', days: ['mon', 'tue', 'wed', 'thu', 'fri'] },
    { category: 'Weekdays', text: 'Leave work at 3:30 pm', days: ['mon', 'tue', 'wed', 'thu', 'fri'] },
    { category: 'Weekdays', text: 'Take train to work', days: ['mon', 'tue', 'wed', 'thu', 'fri'] },
    { category: 'Weekdays', text: 'Listen to Bible app', days: ['mon', 'tue', 'wed', 'thu', 'fri'] },
    { category: 'Weekends', text: 'Get up at 7:00 am', days: ['sat', 'sun'] },
    { category: 'Weekends', text: 'Plan/prep meals for the week', days: ['sun'] },
    { category: 'Weekends', text: 'Laundry', days: ['sun'] }
  ];

  function loadTasks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveTasks(tasksByDate) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksByDate));
  }

  function loadHabits() {
    try {
      const stored = JSON.parse(localStorage.getItem(HABITS_KEY) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (e) {
      return [];
    }
  }

  function filterMedicationHabits(habits) {
    const banned = [
      'self care: take glipizide (am & pm)',
      'self care: take remaining meds (am)',
      'self care: take remaining medication (morning)'
    ];
    return habits.filter(habit => !banned.includes(String(habit.name || '').toLowerCase()));
  }

  function saveHabits(habits) {
    try {
      localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    } catch (e) {
      // Ignore storage errors so UI still updates.
    }
  }

  function loadHabitStatus() {
    try {
      return JSON.parse(localStorage.getItem(HABIT_STATUS_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function createHabitId(name) {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function fetchPlannerHabits() {
    try {
      const response = await fetch('./personal-planner.html', { cache: 'no-store' });
      if (!response.ok) return [];
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const cards = Array.from(doc.querySelectorAll('.habit-card'));
      const habits = [];

      cards.forEach(card => {
        const title = card.querySelector('.habit-title')?.textContent?.trim();
        const items = Array.from(card.querySelectorAll('.habit-list li'));
        items.forEach(item => {
          const text = item.textContent?.trim();
          if (!text) return;
          const name = title ? `${title}: ${text}` : text;
          habits.push({ id: createHabitId(name), name });
        });
      });

      return habits;
    } catch (e) {
      return [];
    }
  }

  async function syncHabitsFromPlanner(habits) {
    const fetched = await fetchPlannerHabits();
    if (!fetched.length) return habits;

    const existingById = new Map(habits.map(habit => [habit.id, habit]));
    const merged = [...fetched];
    existingById.forEach(habit => {
      if (!merged.find(item => item.id === habit.id)) {
        merged.push(habit);
      }
    });

    habits.length = 0;
    merged.forEach(habit => habits.push(habit));
    saveHabits(habits);
    return habits;
  }

  function saveHabitStatus(statusByDate) {
    try {
      localStorage.setItem(HABIT_STATUS_KEY, JSON.stringify(statusByDate));
    } catch (e) {
      // Ignore storage errors so UI still updates.
    }
  }

  function setToday() {
    const dateEl = document.getElementById('today-date');
    if (dateEl) {
      const now = new Date();
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
  }

  function getDateKey(dateInput) {
    if (!dateInput.value) {
      const today = new Date();
      return today.toISOString().slice(0, 10);
    }
    return dateInput.value;
  }

  function shouldShowOnDate(entry, dateKey) {
    const date = new Date(dateKey);
    if (Number.isNaN(date.getTime())) return false;
    const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
    if (entry.days.includes('daily')) return true;
    return entry.days.includes(dayKey);
  }

  function ensureScheduledTasks(dateKey, tasksByDate) {
    tasksByDate[dateKey] = tasksByDate[dateKey] || [];
    const tasks = tasksByDate[dateKey];
    const existing = new Set(tasks.map(t => `${(t.category || '').toLowerCase()}::${(t.text || '').toLowerCase()}`));

    SCHEDULED_TASKS.forEach(entry => {
      if (!shouldShowOnDate(entry, dateKey)) return;
      const key = `${entry.category.toLowerCase()}::${entry.text.toLowerCase()}`;
      if (existing.has(key)) return;
      tasks.push({
        id: `sched-${key.replace(/[^a-z0-9]+/g, '-')}-${dateKey}`,
        text: entry.text,
        category: entry.category,
        completed: false
      });
      existing.add(key);
    });
    saveTasks(tasksByDate);
  }

  function renderTasks(tasksByDate, dateInput) {
    const list = document.getElementById('tasks-list');
    const empty = document.getElementById('tasks-empty');
    if (!list || !empty) return;

    const key = getDateKey(dateInput);
    ensureScheduledTasks(key, tasksByDate);
    const tasks = tasksByDate[key] || [];
    list.innerHTML = '';

    if (!tasks.length) {
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    tasks.forEach(task => {
      const item = document.createElement('li');
      item.className = 'tasks-item';
      if (task.completed) item.classList.add('completed');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        saveTasks(tasksByDate);
        renderTasks(tasksByDate, dateInput);
      });

      const text = document.createElement('span');
      text.className = 'tasks-text';
      text.textContent = task.category ? `${task.text} (${task.category})` : task.text;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'planner-button planner-button-small planner-button-danger';
      remove.textContent = 'Delete';
      remove.addEventListener('click', () => {
        const next = tasks.filter(t => t.id !== task.id);
        tasksByDate[key] = next;
        saveTasks(tasksByDate);
        renderTasks(tasksByDate, dateInput);
      });

      item.appendChild(checkbox);
      item.appendChild(text);
      item.appendChild(remove);
      list.appendChild(item);
    });
  }

  function renderHabits(habits, statusByDate, dateInput) {
    const list = document.getElementById('habits-list');
    const empty = document.getElementById('habits-empty');
    const progressText = document.getElementById('habits-progress-text');
    const progressBar = document.getElementById('habits-progress-bar');
    if (!list || !empty || !progressText || !progressBar) return;

    const dateKey = getDateKey(dateInput);
    const dayStatus = statusByDate[dateKey] || {};
    list.innerHTML = '';

    if (!habits.length) {
      empty.style.display = 'block';
      progressText.textContent = '0/0 completed';
      progressBar.style.width = '0%';
      return;
    }

    empty.style.display = 'none';
    let completedCount = 0;

    habits.forEach(habit => {
      const item = document.createElement('li');
      item.className = 'habits-item';
      const isCompleted = !!dayStatus[habit.id];
      if (isCompleted) item.classList.add('completed');

      const checkmark = document.createElement('button');
      checkmark.type = 'button';
      checkmark.className = 'habits-check';
      checkmark.setAttribute('aria-pressed', isCompleted ? 'true' : 'false');
      checkmark.textContent = isCompleted ? '\u2713' : '';
      checkmark.addEventListener('click', () => {
        const nextValue = !dayStatus[habit.id];
        statusByDate[dateKey] = statusByDate[dateKey] || {};
        statusByDate[dateKey][habit.id] = nextValue;
        saveHabitStatus(statusByDate);
        renderHabits(habits, statusByDate, dateInput);
      });

      const text = document.createElement('span');
      text.className = 'habits-text';
      text.textContent = habit.name;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'planner-button planner-button-small planner-button-danger';
      remove.textContent = 'Delete';
      remove.addEventListener('click', () => {
        const index = habits.findIndex(h => h.id === habit.id);
        if (index !== -1) {
          habits.splice(index, 1);
        }
        Object.keys(statusByDate).forEach(key => {
          if (statusByDate[key]) {
            delete statusByDate[key][habit.id];
          }
        });
        saveHabits(habits);
        saveHabitStatus(statusByDate);
        renderHabits(habits, statusByDate, dateInput);
      });

      if (dayStatus[habit.id]) completedCount += 1;

      item.appendChild(checkmark);
      item.appendChild(text);
      item.appendChild(remove);
      list.appendChild(item);
    });

    const total = habits.length;
    const percent = total ? Math.round((completedCount / total) * 100) : 0;
    progressText.textContent = `${completedCount}/${total} completed`;
    progressBar.style.width = `${percent}%`;
  }

  function handleDateChange(tasksByDate, habits, statusByDate, dateInput) {
    dateInput.addEventListener('change', () => {
      renderTasks(tasksByDate, dateInput);
      renderHabits(habits, statusByDate, dateInput);
    });
  }

  function handleForm(tasksByDate, dateInput) {
    const form = document.getElementById('task-form');
    const input = document.getElementById('task-input');
    if (!form || !input) return;

    form.addEventListener('submit', event => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      const key = getDateKey(dateInput);
      tasksByDate[key] = tasksByDate[key] || [];
      tasksByDate[key].unshift({
        id: String(Date.now()),
        text,
        category: (document.getElementById('task-category')?.value || '').trim(),
        completed: false
      });
      saveTasks(tasksByDate);
      input.value = '';
      renderTasks(tasksByDate, dateInput);
    });
  }

  function handleHabitForm(habits, statusByDate, dateInput) {
    const form = document.getElementById('habit-form');
    const input = document.getElementById('habit-input');
    if (!form || !input) return;

    const submitHabit = () => {
      const name = input.value.trim();
      if (!name) return;
      const id = createHabitId(name) || String(Date.now());
      if (habits.some(habit => habit.id === id)) {
        input.value = '';
        return;
      }
      habits.unshift({ id, name });
      saveHabits(habits);
      input.value = '';
      renderHabits(habits, statusByDate, dateInput);
    };

    form.addEventListener('submit', event => {
      event.preventDefault();
      submitHabit();
    });

    const addButton = form.querySelector('button[type=\"submit\"]');
    if (addButton) {
      addButton.addEventListener('click', event => {
        event.preventDefault();
        submitHabit();
      });
    }
  }

  async function initialize() {
    const dateInput = document.getElementById('task-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().slice(0, 10);
    }
    const tasksByDate = loadTasks();
    const habits = loadHabits();
    const statusByDate = loadHabitStatus();
    setToday();
    renderTasks(tasksByDate, dateInput);
    await syncHabitsFromPlanner(habits);
    const cleanedHabits = filterMedicationHabits(habits);
    if (cleanedHabits.length !== habits.length) {
      habits.length = 0;
      cleanedHabits.forEach(h => habits.push(h));
      saveHabits(habits);
    }
    renderHabits(habits, statusByDate, dateInput);
    handleDateChange(tasksByDate, habits, statusByDate, dateInput);
    handleForm(tasksByDate, dateInput);
    handleHabitForm(habits, statusByDate, dateInput);
  }

  return { initialize };
})();

document.addEventListener('DOMContentLoaded', dailyTasks.initialize);
