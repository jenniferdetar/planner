const dailyTasks = (() => {
  const HABITS_KEY = 'dailyHabits';
  const HABIT_STATUS_KEY = 'dailyHabitStatus';

  const REMOVED_HABITS = new Set([
    'make beds (home care)',
    'recycling (home care)',
    'read (self care)',
    'bring lunch to work (self care)',
    'take metformin (am) (self care)',
    'take metformin (pm) (self care)',
    'take glipizide (am) (self care)',
    'take glipizide (pm) (self care)',
    'take rosuvastatin 20 mg (am) (self care)',
    'take buspirone 10 mg (am) (self care)',
    'take jardiance 25 mg (am) (self care)',
    'take estradiol 2 mg (am) (self care)',
    'take bupropion xl 300 mg (am) (self care)',
    'take nexium 24hr 20 mg (am) (self care)',
    'get up at 5:00 am (weekdays)',
    'leave work at 3:30 pm (weekdays)',
    'take train to work (weekdays)',
    'listen to bible app (weekdays)'
  ]);

  function loadHabits() {
    try {
      const stored = JSON.parse(localStorage.getItem(HABITS_KEY) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (e) {
      return [];
    }
  }

  function saveHabits(habits) {
    try {
      localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    } catch (e) {
    }
  }

  function loadHabitStatus() {
    try {
      return JSON.parse(localStorage.getItem(HABIT_STATUS_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveHabitStatus(statusByDate) {
    try {
      localStorage.setItem(HABIT_STATUS_KEY, JSON.stringify(statusByDate));
    } catch (e) {
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
      const response = await fetch('./index.html', { cache: 'no-store' });
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

  function filterMedicationHabits(habits) {
    const banned = [
      'self care: take glipizide (am & pm)',
      'self care: take remaining meds (am)',
      'self care: take remaining medication (morning)'
    ];
    return habits.filter(habit => !banned.includes(String(habit.name || '').toLowerCase()));
  }

  function filterRemovedHabits(habits) {
    return habits.filter(habit => !REMOVED_HABITS.has(String(habit.name || '').toLowerCase()));
  }

  function setToday() {
    const dateEl = document.getElementById('today-date');
    if (dateEl) {
      const now = new Date();
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
  }

  function getDateKey() {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  }

  function renderHabits(habits, statusByDate) {
    const list = document.getElementById('habits-list');
    const empty = document.getElementById('habits-empty');
    const progressText = document.getElementById('habits-progress-text');
    const progressBar = document.getElementById('habits-progress-bar');
    if (!list || !empty || !progressText || !progressBar) return;

    const dateKey = getDateKey();
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
        renderHabits(habits, statusByDate);
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
        renderHabits(habits, statusByDate);
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

  function handleHabitForm(habits, statusByDate) {
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
      renderHabits(habits, statusByDate);
    };

    form.addEventListener('submit', event => {
      event.preventDefault();
      submitHabit();
    });

    const addButton = form.querySelector('button[type="submit"]');
    if (addButton) {
      addButton.addEventListener('click', event => {
        event.preventDefault();
        submitHabit();
      });
    }
  }

  async function initialize() {
    const habits = loadHabits();
    const statusByDate = loadHabitStatus();
    setToday();
    await syncHabitsFromPlanner(habits);
    const cleanedHabits = filterRemovedHabits(filterMedicationHabits(habits));
    if (cleanedHabits.length !== habits.length) {
      habits.length = 0;
      cleanedHabits.forEach(h => habits.push(h));
      saveHabits(habits);
    }
    renderHabits(habits, statusByDate);
    handleHabitForm(habits, statusByDate);
  }

  return { initialize };
})();

document.addEventListener('DOMContentLoaded', dailyTasks.initialize);
