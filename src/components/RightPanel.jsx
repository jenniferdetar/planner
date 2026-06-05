import { useState } from 'react'
import './RightPanel.css'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_ABBR = ['S','M','T','W','T','F','S']
const DAY_NAMES_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

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

function toDateStr(d) {
  return d.toISOString().split('T')[0]
}

export default function RightPanel({
  selectedDate, onDateChange,
  taskCounts,
  dailyTasks,
  timeBlocks,
  noteContent,
  onNoteChange,
  calAuthExpired,
  onReconnectGoogle,
}) {
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

  // Week strip centred on selected date
  const startOfWeek = new Date(selectedDate)
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })

  function hasActivity(d) {
    const k = toDateStr(d)
    return !!taskCounts[k]?.total
  }

  function countForDay(d) {
    return taskCounts[toDateStr(d)]?.total ?? 0
  }

  // Summary for selected date
  const tasks = dailyTasks || []
  const gcalCount = (timeBlocks || []).filter(b => b.source === 'google').length
  const supabaseMeetings = (timeBlocks || []).filter(b => b.source === 'supabase').length
  const doneCount = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const pct = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0

  return (
    <aside className="right-panel">
      {calAuthExpired && (
        <div className="gcal-expired-banner">
          <span>Google Calendar session expired</span>
          <button className="gcal-reconnect-btn" onClick={onReconnectGoogle}>Reconnect</button>
        </div>
      )}
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
          {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
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

      {/* Week Strip */}
      <div className="weekly-overview">
        <div className="panel-section-label">Week Overview</div>
        <div className="week-days">
          {weekDays.map((d, i) => {
            const isSelected = sameDay(d, selectedDate)
            const isToday = sameDay(d, today)
            const count = countForDay(d)
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

      {/* Summary */}
      <div className="day-summary">
        <div className="panel-section-label">Day Summary</div>
        <div className="summary-items">
          {totalTasks === 0 && gcalCount === 0 && supabaseMeetings === 0 ? (
            <div className="summary-empty">Nothing scheduled</div>
          ) : (
            <>
              <div className="summary-stat-row">
                <div className="summary-stat">
                  <span className="summary-num">{gcalCount + supabaseMeetings}</span>
                  <span className="summary-lbl">events</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-num">{totalTasks}</span>
                  <span className="summary-lbl">tasks</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-num">{doneCount}</span>
                  <span className="summary-lbl">done</span>
                </div>
              </div>
              {totalTasks > 0 && (
                <div className="summary-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="progress-label">{pct}% complete</span>
                </div>
              )}
              {gcalCount > 0 && (
                <div className="gcal-indicator">
                  <span className="gcal-dot" />
                  {gcalCount} event{gcalCount !== 1 ? 's' : ''} from Google Calendar
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Notes — persisted to Supabase */}
      <div className="notes-section">
        <div className="panel-section-label">
          Notes
          <span className="notes-hint">auto-saved</span>
        </div>
        <textarea
          className="notes-area"
          placeholder="Jot down anything for today…"
          value={noteContent || ''}
          onChange={e => onNoteChange(e.target.value)}
          rows={7}
        />
      </div>
    </aside>
  )
}
