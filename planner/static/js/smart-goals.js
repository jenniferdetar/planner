import { GOALS } from '../data/goals-data.js';

const smartGoals = (() => {
  const STORAGE_KEY = 'smartGoals';
  let goals = [];
  let smartData = {};

  const selectEl = document.getElementById('smart-goal-select');
  const titleEl = document.getElementById('smart-goal-title');
  const categoryEl = document.getElementById('smart-goal-category');
  const emptyEl = document.getElementById('smart-empty');
  const gridEl = document.getElementById('smart-grid');
  const printAllEl = document.getElementById('smart-print-all');

  const fields = {
    specific: document.getElementById('smart-specific'),
    measurable: document.getElementById('smart-measurable'),
    achievable: document.getElementById('smart-achievable'),
    relevant: document.getElementById('smart-relevant'),
    timebound: document.getElementById('smart-timebound'),
    statement: document.getElementById('smart-statement'),
    weeklyTasks: document.getElementById('smart-weekly-tasks'),
    tiesTo: document.getElementById('smart-ties-to')
  };
  let manualStatementEdit = false;

  function loadStored() {
    smartData = opusStorage.getSmartGoals();
  }

  function saveStored() {
    opusStorage.setSmartGoals(smartData);
  }

  function setToday() {
    const dateEl = document.getElementById('today-date');
    if (dateEl) {
      const now = new Date();
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
  }

  function populateGoals() {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    if (!goals.length) {
      emptyEl.hidden = false;
      gridEl.hidden = true;
      const option = document.createElement('option');
      option.textContent = 'No goals available';
      option.value = '';
      selectEl.appendChild(option);
      return;
    }

    emptyEl.hidden = true;
    gridEl.hidden = false;

    const seen = new Set();
    const uniqueGoals = goals.filter(goal => {
      const key = (goal.title || '').trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    uniqueGoals.forEach(goal => {
      const option = document.createElement('option');
      option.value = goal.id;
      option.textContent = goal.title;
      selectEl.appendChild(option);
    });
  }

  function fillForGoal(goalId) {
    const goal = goals.find(item => item.id === goalId);
    if (!goal) return;

    titleEl.textContent = goal.title;
    categoryEl.value = goal.category || '';

    // Stored SMART data (user edits)
    const stored = smartData[goalId] || {};

    // Template SMART data (from goals-data.js)
    const template = GOALS[goal.title] || {};

    fields.specific.value   = stored.specific   || template.specific   || '';
    fields.measurable.value = stored.measurable || template.measurable || '';
    fields.achievable.value = stored.achievable || template.achievable || '';
    fields.relevant.value   = stored.relevant   || template.relevant   || '';
    fields.timebound.value  = stored.timebound  || template.timebound  || '';
    fields.weeklyTasks.value = stored.weeklyTasks
      || (template.weeklyTasks ? template.weeklyTasks.join('\n') : '');
    fields.tiesTo.value = stored.tiesTo
      || (template.tiesTo ? template.tiesTo.join('\n') : '');

    manualStatementEdit = Boolean(stored.statement);
    fields.statement.value = stored.statement || template.statement || '';

    updateStatement();
  }

  function buildStatement() {
    const parts = [];
    if (fields.specific.value.trim()) parts.push(fields.specific.value.trim());
    if (fields.measurable.value.trim()) parts.push(`Measure: ${fields.measurable.value.trim()}`);
    if (fields.achievable.value.trim()) parts.push(`Support: ${fields.achievable.value.trim()}`);
    if (fields.relevant.value.trim()) parts.push(`Why: ${fields.relevant.value.trim()}`);
    if (fields.timebound.value.trim()) parts.push(`By: ${fields.timebound.value.trim()}`);
    return parts.join(' ');
  }

  function buildStatementFrom(data) {
    const parts = [];
    if (data.specific) parts.push(data.specific);
    if (data.measurable) parts.push(`Measure: ${data.measurable}`);
    if (data.achievable) parts.push(`Support: ${data.achievable}`);
    if (data.relevant) parts.push(`Why: ${data.relevant}`);
    if (data.timebound) parts.push(`By: ${data.timebound}`);
    return parts.join(' ');
  }

  function updateStatement() {
    if (manualStatementEdit) return;
    fields.statement.value = buildStatement();
  }

  function getGoalData(goal) {
    const stored = smartData[goal.id] || {};
    const template = GOALS[goal.title] || {};

    const data = {
      specific: stored.specific || template.specific || '',
      measurable: stored.measurable || template.measurable || '',
      achievable: stored.achievable || template.achievable || '',
      relevant: stored.relevant || template.relevant || '',
      timebound: stored.timebound || template.timebound || '',
      weeklyTasks: stored.weeklyTasks
        || (template.weeklyTasks ? template.weeklyTasks.join('\n') : ''),
      tiesTo: stored.tiesTo
        || (template.tiesTo ? template.tiesTo.join('\n') : ''),
      statement: stored.statement || template.statement || ''
    };

    if (!data.statement) {
      data.statement = buildStatementFrom(data);
    }

    return data;
  }

  function renderPrintAll() {
    if (!printAllEl) return;
    printAllEl.innerHTML = '';

    if (!goals.length) {
      const empty = document.createElement('div');
      empty.className = 'smart-empty';
      empty.textContent = 'No goals found. Add a goal first.';
      printAllEl.appendChild(empty);
      return;
    }

    goals.forEach(goal => {
      const data = getGoalData(goal);
      const card = document.createElement('section');
      card.className = 'smart-card smart-print-card';

      const title = document.createElement('h2');
      title.className = 'smart-goal-title';
      title.textContent = goal.title || 'Untitled Goal';
      card.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'smart-grid';

      const rows = [
        { label: 'S', name: 'Specific', prompt: 'What do you want to accomplish? Who needs to be included? Why is this a goal?', value: data.specific },
        { label: 'M', name: 'Measurable', prompt: 'How will you measure progress and know if the goal is met?', value: data.measurable },
        { label: 'A', name: 'Achievable', prompt: 'Do you have the skills or support to achieve this? What resources are needed?', value: data.achievable },
        { label: 'R', name: 'Relevant', prompt: 'Why is this goal important right now? How does it align with your priorities?', value: data.relevant },
        { label: 'T', name: 'Time-Bound', prompt: 'What is the deadline and is it realistic?', value: data.timebound },
        { label: '✔', name: 'Statement', prompt: 'SMART goal statement (auto-generated from your answers).', value: data.statement },
        { label: 'W', name: 'Weekly Tasks', prompt: 'Actionable tasks to complete each week.', value: data.weeklyTasks },
        { label: 'L', name: 'Links', prompt: 'How this goal ties to others.', value: data.tiesTo }
      ];

      rows.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'smart-row';

        const letter = document.createElement('div');
        letter.className = 'smart-letter';
        letter.innerHTML = `${row.label}<br>${row.name}`;
        rowEl.appendChild(letter);

        const content = document.createElement('div');
        content.className = 'smart-content';

        const prompt = document.createElement('div');
        prompt.className = 'smart-prompt';
        prompt.textContent = row.prompt;
        content.appendChild(prompt);

        const value = document.createElement('div');
        value.className = 'smart-value';
        value.textContent = row.value || '';
        content.appendChild(value);

        rowEl.appendChild(content);
        grid.appendChild(rowEl);
      });

      card.appendChild(grid);
      printAllEl.appendChild(card);
    });
  }

  function bindEvents() {
    if (!selectEl) return;
    selectEl.addEventListener('change', () => {
      fillForGoal(selectEl.value);
    });

    Object.values(fields).forEach(field => {
      if (field === fields.statement) return;
      field.addEventListener('input', updateStatement);
    });

    fields.statement.addEventListener('input', () => {
      manualStatementEdit = fields.statement.value.trim().length > 0;
    });

    const saveBtn = document.getElementById('smart-save');
    saveBtn?.addEventListener('click', () => {
      const goalId = selectEl.value;
      if (!goalId) return;
      smartData[goalId] = {
        specific: fields.specific.value.trim(),
        measurable: fields.measurable.value.trim(),
        achievable: fields.achievable.value.trim(),
        relevant: fields.relevant.value.trim(),
        timebound: fields.timebound.value.trim(),
        statement: fields.statement.value.trim(),
        weeklyTasks: fields.weeklyTasks.value.trim(),
        tiesTo: fields.tiesTo.value.trim()
      };
      saveStored();
    });

    const clearBtn = document.getElementById('smart-clear');
    clearBtn?.addEventListener('click', () => {
      Object.values(fields).forEach(field => (field.value = ''));
      manualStatementEdit = false;
    });

    const printAllBtn = document.getElementById('smart-print-all-button');
    printAllBtn?.addEventListener('click', () => {
      renderPrintAll();
      document.body.classList.add('print-all-mode');
      window.print();
    });

    window.addEventListener('afterprint', () => {
      document.body.classList.remove('print-all-mode');
    });
  }

  function initialize() {
    loadStored();
    setToday();
    opusData.initialize().then(() => {
      goals = opusData.goals || [];
      populateGoals();
      if (goals.length) {
        fillForGoal(goals[0].id);
      }
      renderPrintAll();
      bindEvents();
    });
  }

  return { initialize };
})();
