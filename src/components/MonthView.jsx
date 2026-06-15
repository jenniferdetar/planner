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

function contrastColor(hex) {
  const c = hex?.replace('#', '') ?? '4a90d9'
  const r = parseInt(c.slice(0,2), 16)
  const g = parseInt(c.slice(2,4), 16)
  const b = parseInt(c.slice(4,6), 16)
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160 ? '#1e3342' : '#ffffff'
}

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

              {/* Calendar events */}
              {!cell.overflow && gcalBlocks.map(block => (
                <div
                  key={block.id}
                  className="cell-event"
                  style={{ background: block.color ?? '#4a90d9', color: contrastColor(block.color) }}
                >
                  {block.startLabel && <span className="cell-event-time">{block.startLabel}</span>}
                  <span className="cell-event-title">{block.title || block.text}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
