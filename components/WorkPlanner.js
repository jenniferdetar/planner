import { WORK_DAY_NAMES, WORK_HIGHLIGHTS, WORK_TIMES, getPillClass, parseEventTime } from '../lib/planner';

export default function WorkPlanner({ events, weekStart }) {
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const dayEvents = events.filter(event => event.date === dateStr);

    const highlights = { ...(WORK_HIGHLIGHTS[i] || {}) };
    dayEvents.forEach(event => {
      const time = parseEventTime(event.title);
      highlights[time] = highlights[time]
        ? `${highlights[time]}, ${event.title}`
        : event.title;
    });

    return {
      date,
      dateStr,
      dayName: WORK_DAY_NAMES[i],
      highlights
    };
  });

  return (
    <div className="work-container">
      <div className="work-subtitle">Priorities &amp; Encouragement</div>
      <div className="work-focus-grid">
        <div className="work-focus-cell">
          <div className="focus-label">Priority #1</div>
          <div>Finish key deliverables</div>
        </div>
        <div className="work-focus-cell">
          <div className="focus-label">Priority #2</div>
          <div>Support the team</div>
        </div>
        <div className="work-focus-cell">
          <div className="focus-label">Priority #3</div>
          <div>Prepare next week</div>
        </div>
      </div>
      <div className="work-notes-grid">
        <div className="work-notes-cell">
          <div className="focus-label">Looking forward to</div>
          <div>Momentum on projects</div>
        </div>
        <div className="work-notes-cell">
          <div className="focus-label">Encourage</div>
          <div>Partner on wins</div>
        </div>
        <div className="work-notes-cell">
          <div className="focus-label">Learn or read</div>
          <div>Strategy materials</div>
        </div>
      </div>
      <div className="work-subtitle">To-Do This Week</div>
      <div className="work-notes-grid weekly">
        <div className="work-notes-cell">MTWTFSS</div>
        <div className="work-notes-cell">MTWTFSS</div>
        <div className="work-notes-cell">MTWTFSS</div>
        <div className="work-notes-cell">MTWTFSS</div>
      </div>

      <div className="work-grid">
        <div className="work-grid-inner">
          {weekDays.map((day, index) => (
            <div className="work-day-column" key={day.dateStr}>
              <div className="work-day-head">
                <span className="day-number-small">{day.date.getDate()}</span>
                {day.dayName}
              </div>

              {index === 0 ? (
                <div className="work-rest">
                  <span className={getPillClass(day.highlights['10am'] || 'Take time to rest today!')}>
                    {day.highlights['10am'] || 'Take time to rest today!'}
                  </span>
                </div>
              ) : (
                WORK_TIMES.map(time => (
                  <div className="work-time-row" key={`${day.dateStr}-${time}`}>
                    <div className="work-time-label">{time}</div>
                    <div className="work-time-slot">
                      {day.highlights[time] ? (
                        <span className={getPillClass(day.highlights[time])}>{day.highlights[time]}</span>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
