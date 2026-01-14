(() => {
  const renderCalendar = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'calendar.html';
    const cleanPath = window.location.pathname.replace(/\/$/, '');
    if (!['calendar.html', '', 'calendar'].includes(currentPage) && cleanPath !== '/calendar' && window.location.pathname !== '/') return;

    const containers = Array.from(document.querySelectorAll('[data-calendar-embed]'));
    if (containers.length === 0) return;

    const container = containers[0];
    if (containers.length > 1) {
      console.warn('Multiple calendar placeholders found; rendering the first only.');
    }

    container.innerHTML = `
      <section id="calendar-controls" class="calendar-controls">
        <div class="calendar-nav">
          <button id="prevMonth" class="calendar-btn">
            <span>&#9664; Previous</span>
          </button>
          <button id="todayBtn" class="calendar-btn" style="margin: 0 10px;">
            <span>Today</span>
          </button>
          <h2 id="monthLabel" class="calendar-month-label"></h2>
          <button id="nextMonth" class="calendar-btn">
            <span>Next &#9654;</span>
          </button>
        </div>
      </section>
      <section id="calendar-section" class="calendar-section">
        <table class="calendar-table">
          <thead>
            <tr class="calendar-header-row">
              <th class="calendar-header">Sunday</th>
              <th class="calendar-header">Monday</th>
              <th class="calendar-header">Tuesday</th>
              <th class="calendar-header">Wednesday</th>
              <th class="calendar-header">Thursday</th>
              <th class="calendar-header">Friday</th>
              <th class="calendar-header">Saturday</th>
            </tr>
          </thead>
          <tbody id="calendarBody" class="calendar-body"></tbody>
        </table>
      </section>
    `;

    if (document.querySelector('script[data-calendar-embed-script]')) return;

    const script = document.createElement('script');
    script.src = '/static/js/calendar.js';
    script.dataset.calendarEmbedScript = 'true';
    document.body.appendChild(script);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCalendar);
  } else {
    renderCalendar();
  }
})();
