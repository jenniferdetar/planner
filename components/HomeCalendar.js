import Link from 'next/link';
import { DAY_CLASSES, getDayLabel, getPillClass, getStaticWeeklyInfo } from '../lib/planner';

export default function HomeCalendar({ events, weekStart }) {
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
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
      monthDay: getDayLabel(date),
      allItems,
      dayClass: DAY_CLASSES[i]
    };
  });

  return (
    <div className="home-calendar">
      <div className="home-calendar-header">
        <div>
          <h2>Home Calendar</h2>
          <p>Quick view of the week, with key reminders and events.</p>
        </div>
        <div className="home-links">
          <Link className="pill-button" href="/personal-planner">Personal Planner</Link>
          <Link className="pill-button pill-work" href="/work-planner">Work Planner</Link>
        </div>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div className={`calendar-day ${day.dayClass}-border`} key={day.dateStr}>
            <div className="calendar-day-header">
              <span className="day-number">{day.date.getDate()}</span>
              <span className="calendar-day-name">{day.dayName}</span>
            </div>
            <div className="events-list">
              {day.allItems.length === 0 ? (
                <span className="event-pill event-placeholder">Open</span>
              ) : (
                day.allItems.map((item, index) => (
                  <span className={getPillClass(item.title)} key={`${day.dateStr}-${index}`}>
                    {item.title}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
