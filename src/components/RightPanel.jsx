import { useState } from 'react'
import './RightPanel.css'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAY_ABBR = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function dateKey(d) {
  return d.toISOString().split('T')[0]
}

export default function RightPanel({ selectedDate, onDateChange, dailyTasks, timeBlocks }) {
  const today = new Date()
  const [calYear, setCalYear] = useState(selectedDate.getFullYear())
  const [calMonth, setCalMonth] = useState(selectedDate.getMonth())

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }

  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  function selectDay(day) {
    onDateChange(new Date(calYear, calMonth, day))
  }

  // Weekly overview: 7 days starting from Sunday of the current week
  const startOfWeek = new Date(selectedDate)
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })

  function hasActivity(d) {
    const k = dateKey(d)
    return (dailyTasks[k]?.length > 0) || (timeBlocks[k]?.length > 0)
  }

  function taskCountForDay(d) {
    const k = dateKey(d)
    const tasks = dailyTasks[k] || []
    const blocks = timeBlocks[k] || []
    return tasks.length + blocks.length
  }

  const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <aside className="right-panel">
      {/* Mini Calendar */}
      <div className="mini-cal">
        <div className="cal-header">
          <button className="cal-nav" onClick={prevMonth}>‹</button>
          <span className="cal-title">{MONTH_NAMES[calMonth]} {calYear}</span>
          <button className="cal-nav" onClick={nextMonth}>›</button>
        </div>
        <div className="cal-grid">
          {DAY_ABBR.map((d, i) => (
            <div key={i} className="cal-day-label">{d}</div>
          ))}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const d = new Date(calYear, calMonth, day)
            const isSelected = sameDay(d, selectedDate)
            const isToday = sameDay(d, today)
            const active = hasActivity(d)
            return (
              <button
                key={day}
                className={`cal-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => selectDay(day)}
              >
                {day}
                {active && !isSelected && <span className="cal-dot" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="weekly-overview">
        <div className="panel-section-label">Week Overview</div>
        <div className="week-days">
          {weekDays.map((d, i) => {
            const isSelected = sameDay(d, selectedDate)
            const isToday = sameDay(d, today)
            const count = taskCountForDay(d)
            return (
              <button
                key={i}
                className={`week-day-card ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => onDateChange(new Date(d))}
              >
                <span className="week-day-name">{DAY_NAMES_SHORT[d.getDay()]}</span>
                <span className="week-day-num">{d.getDate()}</span>
                {count > 0 && <span className="week-count">{count}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Upcoming for selected day */}
      <div className="day-summary">
        <div className="panel-section-label">Today's Summary</div>
        <div className="summary-items">
          {(() => {
            const k = dateKey(selectedDate)
            const tasks = dailyTasks[k] || []
            const blocks = timeBlocks[k] || []
            const total = tasks.length + blocks.length
            const done = tasks.filter(t => t.done).length

            if (total === 0) return (
              <div className="summary-empty">Nothing scheduled</div>
            )

            return (
              <>
                <div className="summary-stat-row">
                  <div className="summary-stat">
                    <span className="summary-num">{blocks.length}</span>
                    <span className="summary-lbl">events</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-num">{tasks.length}</span>
                    <span className="summary-lbl">tasks</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-num">{done}</span>
                    <span className="summary-lbl">done</span>
                  </div>
                </div>
                {tasks.length > 0 && (
                  <div className="summary-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="progress-label">
                      {tasks.length ? Math.round((done / tasks.length) * 100) : 0}% complete
                    </span>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>

      {/* Notes */}
      <div className="notes-section">
        <div className="panel-section-label">Notes</div>
        <textarea
          className="notes-area"
          placeholder="Jot down anything for today..."
          rows={6}
        />
      </div>
    </aside>
  )
}
