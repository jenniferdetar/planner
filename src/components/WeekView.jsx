import { useState } from 'react'
import './WeekView.css'
import { toDateStr } from '../utils/dateUtils'
import { useHabitCompletions } from '../hooks/useHabitCompletions'
import { usePersonalChecklist } from '../hooks/usePersonalChecklist'
import { useMeetingsInRange } from '../hooks/usePlannerData'
import { useWeeklyTasks } from '../hooks/useWeeklyTasks'

const DAY_NAMES_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const DAY_COLORS = [
  '#4a7a6a', // Sunday
  '#2d5560', // Monday
  '#3d6a5a', // Tuesday
  '#1e3342', // Wednesday
  '#4a7a6a', // Thursday
  '#2d5560', // Friday
  '#3d6a5a', // Saturday
]

const PRIORITY_COLORS = { high: '#e05c5c', medium: '#f0a040', low: '#5c9ee0' }

function contrastColor(hex) {
  const c = (hex ?? '#4a90d9').replace('#', '')
  const r = parseInt(c.slice(0,2), 16)
  const g = parseInt(c.slice(2,4), 16)
  const b = parseInt(c.slice(4,6), 16)
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160 ? '#1e3342' : '#ffffff'
}

// Ensure any time label has AM/PM — handles "09:00", "17:30", "9:00 AM", "05:30 PM"
function formatAmPm(label) {
  if (!label) return label
  if (/AM|PM/i.test(label)) return label // already has it
  const [h, min] = label.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(min).padStart(2, '0')} ${suffix}`
}

function normalizeTitle(t) {
  return (t || '')
    .replace(/^\d{1,2}(:\d{2})?\s*(AM|PM)?\s*/i, '')
    .replace(/\s+via\s+zoom(\s+meeting)?$/i, '')
    .replace(/\\([,;])/g, '$1') // unescape stray ICS-style "\," / "\;"
    .toLowerCase()
    .trim()
}

// Same-time events whose titles share a long common prefix are almost
// certainly the same event synced twice with one copy truncated/mangled
// (e.g. an ICS import that cut off mid-word). Keep the longer title.
function isLikelyDuplicate(keyA, keyB, sameTime) {
  if (keyA === keyB) return true
  if (!sameTime) return false
  const shorter = keyA.length <= keyB.length ? keyA : keyB
  const longer = keyA.length <= keyB.length ? keyB : keyA
  return shorter.length >= 20 && longer.startsWith(shorter.slice(0, 20))
}

function dedupeEvents(events) {
  const kept = []
  for (const e of events) {
    const key = normalizeTitle(e.title || e.text)
    const dupIndex = kept.findIndex(k =>
      isLikelyDuplicate(key, normalizeTitle(k.title || k.text), (k._sortKey || '') === (e._sortKey || ''))
    )
    if (dupIndex === -1) {
      kept.push(e)
    } else if ((e.title || e.text || '').length > (kept[dupIndex].title || kept[dupIndex].text || '').length) {
      kept[dupIndex] = e
    }
  }
  return kept
}

function getWeekStart(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

// A habit is either a plain name (applies every day) or { name, days } to
// restrict it to specific days of the week (0 = Sunday … 6 = Saturday).
const HABITS = {
  'Home Care': ['Make beds', 'Cleaning', 'Recycling'],
  'Self Care': ['Shower', 'Read', 'Bring lunch to work'],
  'Week Days': [
    { name: 'Get up at 5:00 am', days: [1, 2, 3, 4, 5] },
    { name: 'Leave work at 3:30 pm', days: [1, 2, 3, 4, 5] },
    { name: 'Take train to work', days: [1, 2, 3, 4, 5] },
    { name: 'Listen to Bible app', days: [1, 2, 3, 4, 5] },
  ],
  'Weekends': [
    { name: 'Get up at 7:00 am', days: [0, 6] },
    { name: 'Plan/prep meals', days: [0, 6] },
    { name: 'Laundry', days: [6] },
  ],
}

function habitName(h) {
  return typeof h === 'string' ? h : h.name
}

function habitDays(h) {
  return typeof h === 'string' ? null : h.days
}

const HABIT_COLORS = {
  'Home Care': '#4a7a6a',
  'Self Care': '#3d6a5a',
  'Week Days': '#2d5560',
  'Weekends': '#1e3342',
}

export default function WeekView({ userId, selectedDate, onDateChange, calendarBlocks }) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(selectedDate))
  const [addingDay, setAddingDay] = useState(null)
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const { isCompleted, toggle: toggleHabit } = useHabitCompletions(userId, weekStart, weekEnd)
  const weekMeetings = useMeetingsInRange(userId, weekStart, weekEnd)
  const { tasksByDate, toggleTask, addTask: addWeekTask } = useWeeklyTasks(userId, weekStart)
  const { tasks: monthlyTasks, isChecked: isMonthChecked, toggle: toggleMonthTask } = usePersonalChecklist(userId)
  const weekMonth = weekStart.getMonth() + 1

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  function prevWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  function nextWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  function formatRange() {
    const sameYear = weekStart.getFullYear() === weekEnd.getFullYear()
    const sameMonth = weekStart.getMonth() === weekEnd.getMonth()
    if (sameMonth) {
      return `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${weekStart.getFullYear()}`
    }
    if (sameYear) {
      return `${MONTH_SHORT[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTH_SHORT[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`
    }
    return `${MONTH_SHORT[weekStart.getMonth()]} ${weekStart.getDate()}, ${weekStart.getFullYear()} – ${MONTH_SHORT[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
  }

  async function handleAddTask(dateStr) {
    if (!newTaskText.trim()) return
    await addWeekTask(dateStr, newTaskText.trim(), newTaskPriority)
    setNewTaskText('')
    setNewTaskPriority('medium')
    setAddingDay(null)
  }

  const today = new Date()
  today.setHours(0,0,0,0)

  return (
    <div className="week-view">
      {/* Header */}
      <div className="week-header">
        <button className="week-nav-btn" onClick={prevWeek}>‹</button>
        <h2 className="week-title">{formatRange()}</h2>
        <button className="week-nav-btn" onClick={nextWeek}>›</button>
      </div>

      {/* Habit tracker */}
      <div className="habit-section">
        {Object.entries(HABITS).map(([category, habits]) => (
          <div key={category} className="habit-box">
            <div className="habit-box-header" style={{ borderColor: HABIT_COLORS[category] }}>
              <span className="habit-box-title" style={{ color: HABIT_COLORS[category] }}>{category}</span>
              <div className="habit-day-labels">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <span key={i} className="habit-day-label">{d}</span>
                ))}
              </div>
            </div>
            {habits.map(habit => {
              const name = habitName(habit)
              const restrictDays = habitDays(habit)
              return (
              <div key={name} className="habit-row">
                <span className="habit-name">{name}</span>
                <div className="habit-dots">
                  {days.map((day, i) => {
                    if (restrictDays && !restrictDays.includes(i)) {
                      return <span key={i} className="habit-dot habit-dot-na" />
                    }
                    const dateStr = toDateStr(day)
                    const done = isCompleted(category, name, dateStr)
                    return (
                      <button
                        key={i}
                        className={`habit-dot ${done ? 'checked' : ''}`}
                        style={{
                          borderColor: HABIT_COLORS[category],
                          background: done ? HABIT_COLORS[category] : 'transparent',
                        }}
                        onClick={() => toggleHabit(category, name, dateStr)}
                        title={`${DAY_NAMES_FULL[i]} ${MONTH_SHORT[day.getMonth()]} ${day.getDate()}`}
                      />
                    )
                  })}
                </div>
              </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Motivational banner */}
      <div className="week-banner">✦ ENJOY YOUR FAMILY ♥</div>

      {/* Daily rows */}
      <div className="week-days">
        {days.map((day, i) => {
          const dateStr = toDateStr(day)
          const dayColor = DAY_COLORS[i]
          const tasks = tasksByDate[dateStr] || []
          const meetingEvents = weekMeetings
            .filter(m => m.date === dateStr)
            .map(m => {
              let startLabel = null
              if (m.start_time) {
                const [h, min] = m.start_time.split(':').map(Number)
                const suffix = h >= 12 ? 'PM' : 'AM'
                const h12 = h % 12 || 12
                startLabel = `${h12}:${String(min).padStart(2, '0')} ${suffix}`
              }
              return { id: m.id, title: m.title, color: m.color || '#1e3070', startLabel, _sortKey: m.start_time || '' }
            })
          const calEvents = (calendarBlocks || [])
            .filter(b => b.startIso?.startsWith(dateStr))
            .map(b => ({ ...b, _sortKey: b.startIso || '' }))
          const events = dedupeEvents([...meetingEvents, ...calEvents])
            .sort((a, b) => (a._sortKey || '').localeCompare(b._sortKey || ''))
          const isToday = day.getTime() === today.getTime()

          return (
            <div key={dateStr} className={`week-day-row ${isToday ? 'week-day-today' : ''}`}>
              {/* Left: tasks */}
              <div className="week-day-tasks" style={{ borderLeftColor: dayColor }}>
                <div className="week-day-label" style={{ color: dayColor }}>
                  {DAY_NAMES_FULL[i].toUpperCase()}
                </div>
                <div className="week-day-date">{MONTH_SHORT[day.getMonth()]} {day.getDate()}</div>
                <div className="week-task-list">
                  {tasks.map(task => {
                    const isCseaTask = /\bArea\s+I\b|\bMB\b|LA\s+500\s+Steward\s+Committee|Regional\s+President'?s?\s+Meeting/i.test(task.title || '')
                    const displayTaskTitle = isCseaTask && !/^CSEA\b/i.test(task.title || '')
                      ? 'CSEA ' + task.title
                      : task.title
                    return (
                      <div
                        key={task.id}
                        className={`week-task-row ${task.completed ? 'done' : ''}`}
                        onClick={() => toggleTask(task.id, dateStr)}
                        style={isCseaTask ? { background: '#1e3070', borderRadius: '4px', padding: '1px 4px', border: '1.5px solid #cc0000' } : {}}
                      >
                        <span
                          className="week-task-check"
                          style={{
                            background: task.completed ? (isCseaTask ? '#f7e84b' : dayColor) : 'transparent',
                            borderColor: isCseaTask ? '#cc0000' : dayColor,
                          }}
                        />
                        <span
                          className="week-task-text"
                          style={isCseaTask ? { color: '#f7e84b', fontWeight: 700 } : {}}
                        >{displayTaskTitle}</span>
                      </div>
                    )
                  })}
                </div>
                {addingDay === dateStr ? (
                  <div className="week-add-form">
                    <input
                      autoFocus
                      placeholder="New task…"
                      value={newTaskText}
                      onChange={e => setNewTaskText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddTask(dateStr)
                        if (e.key === 'Escape') setAddingDay(null)
                      }}
                      className="week-add-input"
                    />
                    <div className="week-add-priorities">
                      {['high','medium','low'].map(p => (
                        <button
                          key={p}
                          className={`week-priority-dot ${newTaskPriority === p ? 'active' : ''}`}
                          style={{ background: PRIORITY_COLORS[p] }}
                          onClick={() => setNewTaskPriority(p)}
                        />
                      ))}
                    </div>
                    <button className="week-add-save" onClick={() => handleAddTask(dateStr)}>✓</button>
                    <button className="week-add-cancel" onClick={() => setAddingDay(null)}>✕</button>
                  </div>
                ) : (
                  <button className="week-add-btn" onClick={() => { setAddingDay(dateStr); setNewTaskText('') }}>+ task</button>
                )}
              </div>

              {/* Right: events */}
              <div className="week-day-events">
                {events.length === 0 && (
                  <span className="week-no-events">—</span>
                )}
                {events.map(evt => {
                  const rawTitle = evt.title || evt.text || ''
                  const isCseaEvent = /^CSEA\b|^CSEA:|CSEA\s+\w|CSEA:/i.test(rawTitle) || /\bArea\s+I\b|\bMB\b|LA\s+500\s+Steward\s+Committee|Regional\s+President'?s?\s+Meeting/i.test(rawTitle)
                  const displayTitle = isCseaEvent && !/^CSEA\b/i.test(rawTitle)
                    ? 'CSEA ' + rawTitle
                    : rawTitle
                  const pillStyle = isCseaEvent
                    ? { background: '#1e3070', color: '#f7e84b', border: '1.5px solid #cc0000', fontWeight: 700 }
                    : { background: evt.color ?? '#4a90d9', color: contrastColor(evt.color) }
                  return (
                    <div
                      key={evt.id}
                      className="week-event-pill"
                      style={pillStyle}
                    >
                      {evt.startLabel && <span className="week-event-time">{formatAmPm(evt.startLabel)}</span>}
                      <span className="week-event-title">{displayTitle}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
