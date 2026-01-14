const planningHub = (() => {
  async function initialize() {
    await opusData.initialize();
    
    const todayDateEl = document.getElementById('today-date');
    if (todayDateEl) {
      todayDateEl.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    renderProgress();
    window.addEventListener('storage', (e) => {
      if (e.key === 'weeklyTaskStatus' || e.key === 'opusData') {
        renderProgress();
      }
    });
  }

  function renderProgress() {
    const container = document.getElementById('hub-weekly-progress');
    if (!container) return;

    const now = new Date();
    const day = now.getDay();
    const weekStart = new Date(now);
    weekStart.setHours(0,0,0,0);
    weekStart.setDate(now.getDate() - day);
    
    const weekKey = weekStart.toISOString().split('T')[0];
    
    // Use opusStorage instead of direct localStorage
    const smartData = opusStorage.getMetadata('smartGoals') || {};
    const weeklyStatus = opusStorage.getMetadata('weeklyTaskStatus') || {};

    const currentWeekCompletions = weeklyStatus[weekKey] || {};
    const activeGoals = opusData.goals || [];
    let allWeeklyTasks = [];
    
    // This part might need data from /data/goals-data.js which is not easily available in this module
    // unless we include it. For now, we'll try to get it from goals-data.js if it's loaded.
    const GOALS_TEMPLATE = window.GOALS || {};

    activeGoals.forEach(goal => {
      const stored = smartData[goal.id] || {};
      if (stored.weeklyTasks) {
        const tasks = stored.weeklyTasks.split('\n').map(t => t.trim()).filter(t => t);
        allWeeklyTasks = allWeeklyTasks.concat(tasks);
      } else {
        const template = GOALS_TEMPLATE[goal.title];
        if (template && template.weeklyTasks) {
          allWeeklyTasks = allWeeklyTasks.concat(template.weeklyTasks);
        }
      }
    });

    const uniqueTasks = [...new Set(allWeeklyTasks)].slice(0, 14);
    if (uniqueTasks.length === 0) {
      container.style.display = 'none';
      return;
    }

    let completedCount = 0;
    uniqueTasks.forEach(task => {
      if (currentWeekCompletions[task] === true) completedCount++;
    });

    const percent = Math.round((completedCount / uniqueTasks.length) * 100);
    container.innerHTML = `
      <div class="hub-progress-header">
        <span class="hub-progress-title">Current Weekly Goal Progress</span>
        <span class="hub-progress-stat">${completedCount}/${uniqueTasks.length} Tasks (${percent}%)</span>
      </div>
      <div class="hub-progress-bar-bg">
        <div class="hub-progress-bar-fill" style="width: ${percent}%"></div>
      </div>
    `;
    container.style.display = 'block';
  }

  return { initialize };
})();
