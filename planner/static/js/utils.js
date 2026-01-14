const utils = (() => {
  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getCurrentDateISO() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  function parseDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDate(date, format = 'MMM DD, YYYY') {
    if (typeof date === 'string') {
      date = parseDate(date);
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const dayName = days[date.getDay()];
    const year = date.getFullYear();

    return format
      .replace(/dddd/g, dayName)
      .replace(/YYYY/g, year)
      .replace(/MMM/g, month)
      .replace(/DD/g, day)
      .replace(/\bD\b/g, date.getDate());
  }

  function formatTime(timeString, format = '12h') {
    if (!timeString) return '';

    const [hours, minutes] = timeString.split(':').map(Number);

    if (format === '24h') {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
  }

  function parseTimeString(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  function isToday(date) {
    if (typeof date === 'string') {
      return date === getCurrentDateISO();
    }
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  function isFuture(date) {
    if (typeof date === 'string') {
      return date > getCurrentDateISO();
    }
    return date > new Date();
  }

  function isPast(date) {
    if (typeof date === 'string') {
      return date < getCurrentDateISO();
    }
    return date < new Date();
  }

  function getDayOfWeek(date) {
    if (typeof date === 'string') {
      date = parseDate(date);
    }
    return date.getDay();
  }

  function daysUntil(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [year, month, day] = dateString.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    
    const timeDiff = targetDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return daysDiff;
  }

  function getWeekDates(date) {
    const weekDates = [];
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek;
    
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(currentDate.toISOString().split('T')[0]);
    }
    
    return weekDates;
  }

  function getMonthDates(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const monthDates = [];
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    let currentDate = new Date(startDate);
    for (let i = 0; i < 42 && (currentDate <= lastDay || currentDate.getDay() !== 0); i++) {
      monthDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return monthDates;
  }

  function sortTasksByPriority(tasks) {
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    return [...tasks].sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  function sortTasksByTime(tasks) {
    return [...tasks].sort((a, b) => {
      if (!a.dueTime) return 1;
      if (!b.dueTime) return -1;
      return a.dueTime.localeCompare(b.dueTime);
    });
  }

  function sortTasksByDate(tasks) {
    return [...tasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }

  function categorizeByUrgenceImportance(tasks) {
    const categories = {
      urgent: [],
      important: [],
      low: [],
      none: []
    };

    tasks.forEach(task => {
      if (task.priority === 'High' && daysUntil(task.dueDate) <= 3) {
        categories.urgent.push(task);
      } else if (task.priority === 'High') {
        categories.important.push(task);
      } else {
        categories.low.push(task);
      }
    });

    return categories;
  }

  function getHourSlots(startHour = 6, endHour = 20, stepMinutes = 60) {
    const slots = [];
    const startMinutes = startHour * 60;
    const endMinutes = endHour * 60;
    for (let m = startMinutes; m <= endMinutes; m += stepMinutes) {
      const hours24 = Math.floor(m / 60);
      const minutes = m % 60;
      const hour24 = String(hours24).padStart(2, '0');
      const minsStr = String(minutes).padStart(2, '0');
      const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
      const ampm = hours24 >= 12 ? 'PM' : 'AM';
      slots.push({
        hour24,
        display: `${hour12}:${minsStr} ${ampm}`,
        time: `${hour24}:${minsStr}`
      });
    }
    return slots;
  }

  function calculateTaskDuration(startTime, endTime) {
    const [startHours, startMins] = startTime.split(':').map(Number);
    const [endHours, endMins] = endTime.split(':').map(Number);

    const startTotalMins = startHours * 60 + startMins;
    const endTotalMins = endHours * 60 + endMins;

    return endTotalMins - startTotalMins;
  }

  function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  function formatDateRange(startDate, endDate) {
    if (startDate === endDate) {
      return formatDate(startDate, 'MMM DD, YYYY');
    }
    
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.getDate()} - ${formatDate(end, 'MMM DD, YYYY')}`;
    }

    return `${formatDate(start, 'MMM DD')} - ${formatDate(end, 'MMM DD, YYYY')}`;
  }

  function on(selector, event, handler) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) el.addEventListener(event, handler);
  }

  function onAll(selector, event, handler) {
    const els = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
    els.forEach(el => el.addEventListener(event, handler));
  }

  function setupToggleButtons(selector, activeClass, onChange) {
    onAll(selector, 'click', (e) => {
      document.querySelectorAll(selector).forEach(btn => btn.classList.remove(activeClass));
      e.target.classList.add(activeClass);
      if (onChange) onChange(e.target.dataset);
    });
  }

  function setupModalClosers(modalSelector, closeSelectors) {
    const modal = document.querySelector(modalSelector);
    if (!modal) return;
    closeSelectors.forEach(sel => on(sel, 'click', () => modal.style.display = 'none'));
    on(modal, 'click', (e) => e.target === modal && (modal.style.display = 'none'));
  }

  function showToast(message, type = 'info', containerId = 'toast-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `opus-toast opus-toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('opus-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function setActiveSidebarItem() {
    const links = document.querySelectorAll('.planner-sidebar-item');
    if (!links.length) return;

    const currentPage = window.location.pathname.split('/').pop();
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const targetPage = href.split('/').pop();
      link.classList.toggle('active', targetPage === currentPage);
    });
  }

  function formatCurrency(value) {
    if (value === null || value === undefined || value === '') return '';
    const num = parseFloat(String(value).replace(/[$,]/g, ''));
    if (isNaN(num)) return value;
    return '$' + num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setActiveSidebarItem);
    } else {
      setActiveSidebarItem();
    }
  }

  return {
    generateId,
    getCurrentDateISO,
    parseDate,
    formatDate,
    formatTime,
    formatCurrency,
    formatDateRange,
    parseTimeString,
    isToday,
    isFuture,
    isPast,
    getDayOfWeek,
    daysUntil,
    getWeekDates,
    getMonthDates,
    getHourSlots,
    calculateTaskDuration,
    sortTasksByPriority,
    sortTasksByTime,
    sortTasksByDate,
    categorizeByUrgenceImportance,
    debounce,
    on,
    onAll,
    setupToggleButtons,
    setupModalClosers,
    showToast,
    escapeHtml,
    setActiveSidebarItem
  };
})();
