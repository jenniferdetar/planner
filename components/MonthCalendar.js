import { getStaticWeeklyInfo } from '../lib/planner';

export default function MonthCalendar({ events, monthDate }) {
  const { year, month, daysInMonth, startDayOfWeek, monthLabel } = monthDate;

  // Create grid cells
  const cells = [];
  
  // Empty cells for the start of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ type: 'empty' });
  }

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().slice(0, 10);
    const dayOfWeek = date.getDay();
    const staticInfo = getStaticWeeklyInfo(dateStr);
    const dbEvents = events.filter(e => e.date === dateStr);
    
    const allItems = [
      ...staticInfo.notes.map(n => ({ title: n })),
      ...dbEvents.map(e => ({ title: e.title }))
    ];

    cells.push({
      type: 'day',
      dayNumber: d,
      dateStr,
      dayOfWeek,
      items: allItems,
      holiday: staticInfo.holiday
    });
  }

  // Fill remaining cells to complete the last row
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < remaining; i++) {
    cells.push({ type: 'empty' });
  }

  const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const DAY_CLASSES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  // Determine where to put the "BE REAL" banner
  // Prefer the larger empty block (start or end of month)
  const showInStart = startDayOfWeek >= 3;
  const showInEnd = !showInStart && remaining >= 3;
  
  let bannerCellIndex = -1;
  let bannerBlockWidth = 0;
  let bannerBlockStart = 0;

  if (showInStart) {
    bannerCellIndex = Math.floor(startDayOfWeek / 2);
    bannerBlockWidth = startDayOfWeek;
    bannerBlockStart = 0;
  } else if (showInEnd) {
    bannerCellIndex = (cells.length - remaining) + Math.floor(remaining / 2);
    bannerBlockWidth = remaining;
    bannerBlockStart = cells.length - remaining;
  }

  return (
    <div className="month-calendar">
      <h1 className="month-title">{monthLabel}</h1>
      
      <div className="month-day-headers">
        {DAY_NAMES.map((name, i) => (
          <div key={name} className={`month-day-head ${DAY_CLASSES[i]}-bg`}>
            {name}
          </div>
        ))}
      </div>

      <div className="month-grid">
        {cells.map((cell, i) => {
          if (cell.type === 'empty') {
            const isBannerCell = i === bannerCellIndex;
            const bannerStyle = {
              left: `${(bannerBlockStart + bannerBlockWidth / 2 - i) * 100}%`,
              width: `${bannerBlockWidth * 100}%`
            };
            
            return (
              <div key={`empty-${i}`} className="month-day empty">
                {isBannerCell && (
                   <div className="be-real-banner" style={bannerStyle}>
                     <span className="be">BE</span> <span className="real">REAL</span>
                     <div className="subtitle">not perfect</div>
                   </div>
                )}
              </div>
            );
          }

          return (
            <div key={cell.dateStr} className="month-day">
              <div className="month-day-header">
                <span className="day-number">{cell.dayNumber}</span>
              </div>
              <div className="month-events">
                {cell.items.map((item, idx) => (
                  <div key={`${cell.dateStr}-${idx}`} className="month-event-item">
                    {item.title}
                  </div>
                ))}
              </div>
              {cell.holiday && (
                <div className="holiday-container">
                  <span className="holiday-label">{cell.holiday}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .month-calendar {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border: 1px solid var(--border-color);
          overflow-x: auto;
        }

        .month-title {
          text-align: center;
          color: #f79292;
          font-size: 5rem;
          margin: 30px 0;
          letter-spacing: 0.5rem;
          font-weight: 300;
        }

        .month-day-headers {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-bottom: 1px solid var(--border-color);
          min-width: 800px;
        }

        .month-day-head {
          padding: 15px;
          text-align: center;
          font-weight: bold;
          color: white;
          font-size: 1.2rem;
          letter-spacing: 0.15rem;
        }

        .sun-bg { background-color: #f88d8d; }
        .mon-bg { background-color: #f5c27a; }
        .tue-bg { background-color: #78c0aa; }
        .wed-bg { background-color: #4a7c96; }
        .thu-bg { background-color: #f88d8d; }
        .fri-bg { background-color: #f5c27a; }
        .sat-bg { background-color: #78c0aa; }

        .month-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background-color: var(--border-color);
          gap: 1px;
          min-width: 800px;
        }

        .month-day {
          background: white;
          min-height: 180px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .month-day.empty {
          background: white;
        }

        .month-day-header {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 10px;
        }

        .day-number {
          font-size: 1rem;
          color: #999;
          font-weight: 400;
        }

        .month-events {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .month-event-item {
          font-family: var(--font-handwriting);
          font-size: 1.3rem;
          color: #333;
          line-height: 1.2;
        }

        .holiday-container {
          margin-top: auto;
          text-align: center;
          padding-top: 4px;
        }

        .holiday-label {
          font-size: 1rem;
          text-transform: uppercase;
          color: #888;
          letter-spacing: 0.05rem;
        }

        .be-real-banner {
          position: absolute;
          top: 45%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 10;
          pointer-events: none;
          white-space: nowrap;
        }

        .be-real-banner .be {
          font-size: 8rem;
          color: #f88d8d;
          font-weight: bold;
          margin-right: 20px;
        }

        .be-real-banner .real {
          font-size: 8rem;
          color: #78c0aa;
          font-weight: bold;
        }

        .be-real-banner .subtitle {
          font-family: var(--font-handwriting);
          font-size: 6rem;
          color: #f5c27a;
          margin-top: -40px;
        }
      `}</style>
    </div>
  );
}
