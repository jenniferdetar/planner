window.goalsPage = (() => {
  let currentFilter = 'all';
  let editingGoalId = null;
  const AUTO_IMPORT_FLAG = 'opusGoalsAutoImported';
  const AUTO_IMPORT_VERSION_KEY = 'opusGoalsImportVersion';
  const AUTO_IMPORT_HASH_KEY = 'opusGoalsImportHash';
  const AUTO_IMPORT_PATH = 'data/goals-import.json';
  const SHEET_MIN_LINES = 6;
  const SHEET_SECTIONS = [
    { label: 'Physical', tone: 'mint' },
    { label: 'Mental', tone: 'mint' },
    { label: 'Relational', tone: 'mint' },
    { label: 'Self-Care', tone: 'rose' },
    { label: 'Hobbies', tone: 'rose' },
    { label: 'Home', tone: 'rose' },
    { label: 'Career', tone: 'slate' },
    { label: 'Financial', tone: 'slate' },
    { label: 'Organizational', tone: 'slate' },
    { label: 'Screen Time', tone: 'sand' },
    { label: 'Learn', tone: 'sand' },
    { label: 'CSEA', tone: 'sand' }
  ];
  const TITLE_SECTION_MAP = {
    'lose 50 lbs': 'Physical',
    'exercise more (start with walking)': 'Physical',
    'journal at least 3x a week': 'Mental',
    'attend church more often': 'Mental',
    'read': 'Hobbies',
    'get nails done': 'Self-Care',
    'make more home made meals': 'Self-Care',
    'can meals': 'Home',
    'save up for a freeze dryer': 'Home',
    'promote, if possible': 'Career',
    'get side gigs to leave lausd': 'Career',
    'help jeff with disability': 'Financial',
    'fully funded emergency fund': 'Financial',
    'de-clutter the living room': 'Organizational',
    'clean up the office': 'Organizational',
    "donate what's not being used": 'Organizational',
    'keep to commuter/work only': 'Screen Time',
    'complete coding course strong': 'Learn',
    'complete mba': 'Learn',
    'build relationships/network': 'CSEA',
    'talk to more members': 'CSEA',
    're-elected for mb committee': 'CSEA',
    'represent more members': 'CSEA',
    'find ways to grow meetings': 'CSEA'
  };
  const CATEGORY_SECTION_MAP = {
    Health: 'Physical',
    Learning: 'Learn',
    Relationships: 'Relational',
    Career: 'Career',
    Financial: 'Financial',
    CSEA: 'CSEA',
    Personal: 'Self-Care',
    Hobbies: 'Hobbies'
  };

  function initialize() {
    opusData.initialize().then(() => {
      return autoImportGoalsIfNeeded();
    }).then(() => {
      setupEventListeners();
      renderGoals();
      setupDataListeners();
    }).catch(error => {
      console.error('Error initializing page:', error);
      utils.showToast('Error loading data', 'error');
    });
  }

  async function autoImportGoalsIfNeeded() {
    try {
      const response = await fetch(AUTO_IMPORT_PATH);
      if (!response.ok) {
        throw new Error(`Failed to load ${AUTO_IMPORT_PATH}`);
      }

      const jsonString = await response.text();
      const parsed = JSON.parse(jsonString);
      const importVersion = parsed.goalsImportVersion || '1';
      const storedVersion = opusStorage.getMetadata(AUTO_IMPORT_VERSION_KEY);
      const importHash = hashString(jsonString);
      const storedHash = opusStorage.getMetadata(AUTO_IMPORT_HASH_KEY);

      if (storedVersion === importVersion && storedHash === importHash) {
        return;
      }

      opusStorage.importData(JSON.stringify(parsed));
      opusData.syncFromStorage();
      opusStorage.updateMetadata(AUTO_IMPORT_FLAG, 'true');
      opusStorage.updateMetadata(AUTO_IMPORT_VERSION_KEY, importVersion);
      opusStorage.updateMetadata(AUTO_IMPORT_HASH_KEY, importHash);
      utils.showToast('Goals imported successfully', 'success');
    } catch (error) {
      console.warn('Auto-import skipped:', error);
    }
  }

  function setupEventListeners() {
    utils.on('#goal-form', 'submit', handleCreateGoal);
    utils.on('#edit-goal-form', 'submit', handleEditGoal);
    utils.on('#modal-delete', 'click', handleDeleteGoal);
    utils.on('#modal-cancel', 'click', closeGoalModal);
    utils.setupToggleButtons('.filter-button', 'active', (data) => {
      currentFilter = data.filter;
      renderGoals();
    });
    const firstFilterBtn = document.querySelector('[data-filter="all"]');
    if (firstFilterBtn) firstFilterBtn.classList.add('active');
  }

  function setupDataListeners() {
    opusData.addEventListener('goal-created', renderGoals);
    opusData.addEventListener('goal-updated', renderGoals);
    opusData.addEventListener('goal-deleted', renderGoals);
    opusData.addEventListener('data-updated', renderGoals);
  }

  function handleCreateGoal(e) {
    e.preventDefault();

    const title = document.getElementById('goal-title').value.trim();
    const description = document.getElementById('goal-description').value.trim();
    const category = document.getElementById('goal-category').value;
    const timeframe = document.getElementById('goal-timeframe').value;

    if (!title) {
      utils.showToast('Please enter a goal title', 'error');
      return;
    }

    try {
      const goal = opusStorage.createGoal({
        title,
        description,
        category,
        timeframe
      });

      opusData.syncFromStorage();
      opusData.notifyListeners('goal-created', goal);

      e.target.reset();
      utils.showToast(`Goal "${title}" created successfully`, 'success');
    } catch (error) {
      console.error('Error creating goal:', error);
      utils.showToast('Error creating goal', 'error');
    }
  }

  function handleEditGoal(e) {
    e.preventDefault();

    if (!editingGoalId) return;

    const title = document.getElementById('edit-goal-title').value.trim();
    const description = document.getElementById('edit-goal-description').value.trim();
    const category = document.getElementById('edit-goal-category').value;
    const timeframe = document.getElementById('edit-goal-timeframe').value;
    const status = document.getElementById('edit-goal-status').value;

    try {
      const updatedGoal = opusStorage.updateGoal(editingGoalId, {
        title,
        description,
        category,
        timeframe,
        status
      });

      opusData.syncFromStorage();
      opusData.updateGoalProgress(editingGoalId);
      opusData.notifyListeners('goal-updated', updatedGoal);

      closeGoalModal();
      utils.showToast('Goal updated successfully', 'success');
    } catch (error) {
      console.error('Error updating goal:', error);
      utils.showToast('Error updating goal', 'error');
    }
  }

  function handleDeleteGoal() {
    if (!editingGoalId) return;

    try {
      opusStorage.deleteGoal(editingGoalId);
      opusData.syncFromStorage();
      opusData.notifyListeners('goal-deleted', { id: editingGoalId });
      closeGoalModal();
      utils.showToast('Goal deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting goal:', error);
      utils.showToast('Error deleting goal', 'error');
    }
  }

  function getGoalsForDisplay() {
    let goals = opusData.goals;

    if (currentFilter === 'active') {
      goals = goals.filter(g => g.status === 'Active');
    } else if (currentFilter === 'completed') {
      goals = goals.filter(g => g.status === 'Completed');
    }

    return goals.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  function renderGoals() {
    const goals = getGoalsForDisplay();
    const grid = document.getElementById('goals-sheet-grid');
    if (!grid) return;

    const groupedGoals = groupGoalsBySheetSection(goals);
    const sections = getSheetSections(groupedGoals);

    grid.innerHTML = '';
    sections.forEach(section => {
      const card = document.createElement('div');
      card.className = `goal-sheet-card tone-${section.tone}`;

      const header = document.createElement('div');
      header.className = 'goal-sheet-title';
      header.textContent = section.label;
      card.appendChild(header);

      const lines = document.createElement('div');
      lines.className = 'goal-sheet-lines';

      const items = groupedGoals[section.label] || [];
      const lineCount = Math.max(SHEET_MIN_LINES, items.length);

      for (let i = 0; i < lineCount; i += 1) {
        const line = document.createElement('div');
        line.className = 'goal-sheet-line';

        if (i < items.length) {
          const displayTitle = items[i].title;
          const normalizedTitle = normalizeGoalTitle(displayTitle).toLowerCase();
          if (normalizedTitle === 'read') {
            const link = document.createElement('a');
            link.className = 'goal-sheet-item';
            link.href = '/planning/books-to-read/';
            link.textContent = displayTitle;
            link.setAttribute('aria-label', 'Open Books to Read');
            line.appendChild(link);
          } else {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'goal-sheet-item';
            button.textContent = displayTitle;
            if (displayTitle.length > 24) {
              button.classList.add('goal-sheet-item-compact');
            }
            button.addEventListener('click', () => openGoalModal(items[i]));
            line.appendChild(button);
          }
        } else {
          line.classList.add('empty');
          const spacer = document.createElement('span');
          spacer.className = 'goal-sheet-item';
          spacer.innerHTML = '&nbsp;';
          line.appendChild(spacer);
        }

        lines.appendChild(line);
      }

      card.appendChild(lines);
      grid.appendChild(card);
    });

    updateGoalCounts();
  }

  function groupGoalsBySheetSection(goals) {
    return goals.reduce((grouped, goal) => {
      const section = getSheetSection(goal);
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(goal);
      return grouped;
    }, {});
  }

  function normalizeGoalTitle(title) {
    return title.replace(/\s*\(.*\)\s*$/, '').trim();
  }

  function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }

  function getSheetSections(groupedGoals) {
    const sections = SHEET_SECTIONS.map(section => ({ ...section }));
    const additionalSections = Object.keys(groupedGoals).filter(sectionLabel => {
      return !sections.find(section => section.label === sectionLabel);
    });

    additionalSections.forEach(sectionLabel => {
      sections.push({ label: sectionLabel, tone: 'slate' });
    });

    return sections;
  }

  function getSheetSection(goal) {
    const titleKey = normalizeGoalTitle(goal.title).toLowerCase();
    if (titleKey === 'attend church more often' && goal.category === 'Relationships') {
      return 'Relational';
    }

    if (TITLE_SECTION_MAP[titleKey]) {
      return TITLE_SECTION_MAP[titleKey];
    }

    return CATEGORY_SECTION_MAP[goal.category] || goal.category || 'Other';
  }

  function updateGoalCounts() {
    const activeCount = document.getElementById('active-count');
    const completedCount = document.getElementById('completed-count');
    const totalCount = document.getElementById('goals-sheet-total');

    if (activeCount) {
      activeCount.textContent = opusData.getActiveGoals().length;
    }

    if (completedCount) {
      completedCount.textContent = opusData.getCompletedGoals().length;
    }

    if (totalCount) {
      totalCount.textContent = opusData.goals.length;
    }
  }

  function openGoalModal(goal) {
    editingGoalId = goal.id;

    document.getElementById('edit-goal-title').value = goal.title;
    document.getElementById('edit-goal-description').value = goal.description || '';
    document.getElementById('edit-goal-category').value = goal.category;
    document.getElementById('edit-goal-timeframe').value = goal.timeframe;
    document.getElementById('edit-goal-status').value = goal.status;

    const editSection = document.getElementById('goal-edit-section');
    if (editSection) {
      editSection.style.display = 'block';
      editSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function closeGoalModal() {
    editingGoalId = null;
    const editSection = document.getElementById('goal-edit-section');
    if (editSection) {
      editSection.style.display = 'none';
    }
  }

  return {
    initialize
  };
})();
