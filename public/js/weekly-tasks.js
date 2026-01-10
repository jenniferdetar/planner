import { GOALS } from '../data/goals-data.js';

const weeklyTasks = (() => {
  const container = document.getElementById('weekly-tasks-container');
  const WEEKLY_STATUS_KEY = 'weeklyTaskStatus';

  function getWeekKey() {
    const now = new Date();
    const day = now.getDay();
    const weekStart = new Date(now);
    weekStart.setHours(0,0,0,0);
    weekStart.setDate(now.getDate() - day);
    return weekStart.toISOString().split('T')[0];
  }

  function setToday() {
    const dateEl = document.getElementById('today-date');
    if (dateEl) {
      const now = new Date();
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
  }

  function renderTasks() {
    if (!container) return;

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

    const weekKey = getWeekKey();
    const currentWeekCompletions = completionData[weekKey] || {};

    const activeGoals = opusData.goals || [];
    container.innerHTML = '';

    if (activeGoals.length === 0) {
      container.innerHTML = '<div class="empty-state">No active goals found. Set up some goals in the SMART Goals sheet to see weekly tasks!</div>';
      updateGlobalProgress(0, 0);
      return;
    }

    let totalTasks = 0;
    let completedTasks = 0;

    activeGoals.forEach(goal => {
      const stored = smartData[goal.id] || {};
      const template = GOALS[goal.title] || {};
      
      let tasks = [];
      if (stored.weeklyTasks) {
        tasks = stored.weeklyTasks.split('\n').map(t => t.trim()).filter(t => t);
      } else if (template.weeklyTasks) {
        tasks = template.weeklyTasks;
      }

      if (tasks.length > 0) {
        const card = document.createElement('div');
        card.className = 'goal-task-card';
        const category = goal.category || template.category || 'General';
        
        const title = document.createElement('h2');
        title.textContent = goal.title;
        
        const catDiv = document.createElement('div');
        catDiv.className = 'goal-category';
        catDiv.textContent = category;
        
        card.appendChild(catDiv);
        card.appendChild(title);
        
        const list = document.createElement('ul');
        list.className = 'task-list';
        
        tasks.forEach(task => {
          totalTasks++;
          const isCompleted = currentWeekCompletions[task] === true;
          if (isCompleted) completedTasks++;
          
          const li = document.createElement('li');
          li.textContent = task;
          li.className = isCompleted ? 'completed' : '';
          li.style.cursor = 'pointer';
          li.addEventListener('click', () => toggleTask(task));
          list.appendChild(li);
        });
        
        card.appendChild(list);
        container.appendChild(card);
      }
    });

    updateGlobalProgress(completedTasks, totalTasks);

    if (container.innerHTML === '') {
      container.innerHTML = '<div class="empty-state">No weekly tasks defined for your active goals. Update your SMART Goals sheets!</div>';
    }
  }

  function toggleTask(taskName) {
    const weekKey = getWeekKey();
    let completionData = {};
    try {
      completionData = JSON.parse(localStorage.getItem(WEEKLY_STATUS_KEY) || '{}');
    } catch (e) {
      completionData = {};
    }

    if (!completionData[weekKey]) completionData[weekKey] = {};
    completionData[weekKey][taskName] = !completionData[weekKey][taskName];

    localStorage.setItem(WEEKLY_STATUS_KEY, JSON.stringify(completionData));
    renderTasks();
  }

  function updateGlobalProgress(completed, total) {
    const progressEl = document.getElementById('global-weekly-progress');
    if (!progressEl || total === 0) return;

    const percent = Math.round((completed / total) * 100);
    progressEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: bold; color: #3f6f8a;">
        <span>Weekly Completion Progress</span>
        <span>${completed}/${total} Tasks (${percent}%)</span>
      </div>
      <div style="height: 12px; background: #eee; border-radius: 6px; overflow: hidden; border: 1px solid #ddd;">
        <div style="width: ${percent}%; height: 100%; background: #3f6f8a; transition: width 0.3s ease;"></div>
      </div>
    `;
  }

  function initialize() {
    setToday();
    opusData.initialize().then(() => {
      renderTasks();
    });

    window.addEventListener('storage', (e) => {
      if (e.key === WEEKLY_STATUS_KEY) {
        renderTasks();
      }
    });
  }

  return { initialize };
})();

document.addEventListener('DOMContentLoaded', weeklyTasks.initialize);
