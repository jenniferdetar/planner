import { useState } from 'react'
import './MonthView.css'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

const DAY_COLORS = [
  '#e8a0a0', // Sunday   – rose
  '#e8c97a', // Monday   – amber
  '#7ec8c8', // Tuesday  – teal
  '#7ba7e0', // Wednesday – blue
  '#e8a0a0', // Thursday – rose
  '#e8c97a', // Friday   – amber
  '#7ec8c8', // Saturday – teal
]

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function MonthView({ selectedDate, onDateChange, taskCounts, timeBlocks, onMonthChange }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth())

  function prevMonth() {
    let y = viewYear, m = viewMonth
    if (m === 0) { y -= 1; m = 11 } else { m -= 1 }
    setViewYear(y); setViewMonth(m)
    onMonthChange?.(y, m)
  }

  function nextMonth() {
    let y = viewYear, m = viewMonth
    if (m === 11) { y += 1; m = 0 } else { m += 1 }
    setViewYear(y); setViewMonth(m)
    onMonthChange?.(y, m)
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

  // Build a flat 42-cell grid (6 weeks × 7 days)
  const cells = []

  // Trailing days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, month: viewMonth - 1, year: viewMonth === 0 ? viewYear - 1 : viewYear, overflow: true })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: viewMonth, year: viewYear, overflow: false })
  }
  // Leading days of next month
  while (cells.length < 42) {
    const d = cells.length - firstDay - daysInMonth + 1
    cells.push({ day: d, month: viewMonth + 1, year: viewMonth === 11 ? viewYear + 1 : viewYear, overflow: true })
  }

  return (
    <div className="month-view">
      <div className="month-nav">
        <button className="mnav-btn" onClick={prevMonth}>‹</button>
        <h2 className="month-title">{MONTH_NAMES[viewMonth]} {viewYear}</h2>
        <button className="mnav-btn" onClick={nextMonth}>›</button>
      </div>

      <div className="month-grid">
        {/* Day-of-week headers */}
        {DAY_NAMES.map((name, i) => (
          <div
            key={name}
            className="dow-header"
            style={{ background: DAY_COLORS[i] }}
          >
            {name.toUpperCase()}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((cell, idx) => {
          const cellDate = new Date(cell.year, cell.month, cell.day)
          const isToday = !cell.overflow && sameDay(cellDate, today)
          const isSelected = !cell.overflow && sameDay(cellDate, selectedDate)
          const dateKey = toDateStr(cellDate)
          const counts = taskCounts?.[dateKey]
          const gcalBlocks = (timeBlocks || []).filter(b => b.startIso?.startsWith(dateKey))

          return (
            <div
              key={idx}
              className={`month-cell ${cell.overflow ? 'overflow' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => !cell.overflow && onDateChange(cellDate)}
            >
              <span className={`cell-num ${isToday ? 'today-num' : ''}`}>{cell.day}</span>

              {/* Task count pill */}
              {!cell.overflow && counts?.total > 0 && (
                <div className="cell-tasks">
                  <div
                    className="cell-task-bar"
                    style={{ width: `${Math.round((counts.done / counts.total) * 100)}%` }}
                  />
                  <span className="cell-task-label">{counts.done}/{counts.total} tasks</span>
                </div>
              )}

              {/* Google Calendar events */}
              {!cell.overflow && gcalBlocks.slice(0, 3).map(block => (
                <div
                  key={block.id}
                  className="cell-event"
                  style={{ background: block.color + '22', borderLeft: `2px solid ${block.color}` }}
                >
                  {block.startLabel && <span className="cell-event-time">{block.startLabel} </span>}
                  {block.title || block.text}
                </div>
              ))}
              {!cell.overflow && gcalBlocks.length > 3 && (
                <div className="cell-more">+{gcalBlocks.length - 3} more</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
