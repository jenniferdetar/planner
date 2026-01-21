import { DAY_CLASSES, HABITS, getDayLabel, getPillClass, getStaticWeeklyInfo } from '../lib/planner';

const HABIT_TITLES = {
  'habit-home-care': 'Home Care',
  'habit-self-care': 'Self Care',
  'habit-week-days': 'Week Days',
  'habit-weekends': 'Weekends'
};

export default function PersonalPlanner({ events, weekStart }) {
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const monthDay = getDayLabel(date);
    const staticInfo = getStaticWeeklyInfo(dateStr);
    const dbEvents = events.filter(event => event.date === dateStr);
    const allItems = [
      ...staticInfo.notes.map(note => ({ title: note })),
      ...dbEvents.map(event => ({ title: event.title }))
    ];
    return {
      date,
      dateStr,
      dayName,
      monthDay,
      staticInfo,
      allItems,
      dayClass: DAY_CLASSES[i]
    };
  });

  return (
    <div className="planner-container">
      <div className="habit-trackers">
        {Object.entries(HABITS).map(([id, items]) => (
          <div className="habit-section" key={id}>
            <div className="habit-section-title">{HABIT_TITLES[id] || id}</div>
            <div className="habit-days-labels">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            <div id={id}>
              {items.map(item => (
                <div className="habit-item" key={item}>
                  {DAY_CLASSES.map(day => (
                    <div className={`habit-box box-${day}`} key={`${item}-${day}`} />
                  ))}
                  <div className="habit-label">{item}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="family-banner">▲ ENJOY YOUR FAMILY ❤️</div>

      <div className="weekly-calendar">
        {weekDays.map(day => {
          const placeholders = Math.max(0, 10 - day.allItems.length);
          return (
            <div className={`day-container ${day.dayClass}-border`} key={day.dateStr}>
              <div className="day-left">
                <div className="task-list">
                  {day.staticInfo.tasks.map(task => (
                    <div className="task-item" key={task}>
                      <div className="checkbox-square" />
                      {task}
                    </div>
                  ))}
                </div>
                <div className="icon-lines-section">
                  <div className="icon-row">
                    <div className="icon-box">🍽️</div>
                    <div className="line-placeholder" />
                  </div>
                  <div className="icon-row">
                    <div className="icon-box">🌸</div>
                    <div className="line-placeholder" />
                  </div>
                  <div className="icon-row">
                    <div className="icon-box">💰</div>
                    <div className="line-placeholder line-placeholder-spending">
                      {day.staticInfo.spending || ''}
                    </div>
                  </div>
                </div>
              </div>
              <div className="day-right">
                <div className="day-header-title">
                  <span>{day.dayName}, {day.monthDay}</span>
                  <span className="holiday-label">{day.staticInfo.holiday || ''}</span>
                </div>
                <div className="lined-area">
                  <div className="main-notes">
                    {day.allItems.map((item, index) => (
                      <div className="note-row" key={`${day.dateStr}-${index}`}>
                        <span className={getPillClass(item.title)}>{item.title}</span>
                      </div>
                    ))}
                    {Array.from({ length: placeholders }).map((_, index) => (
                      <div className="note-row note-placeholder" key={`placeholder-${index}`}>
                        <div className="note-checkbox" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
