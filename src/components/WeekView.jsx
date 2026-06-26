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
    .toLowerCase()
    .trim()
}

function dedupeEvents(events) {
  const seen = new Set()
  return events.filter(e => {
    const key = normalizeTitle(e.title || e.text)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getWeekStart(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

const HABITS = {
  'Home Care': ['Make beds', 'Cleaning', 'Recycling'],
  'Self Care': ['Shower', 'Read', 'Bring lunch to work'],
  'Week Days': ['Get up at 5:00 am', 'Leave work at 3:30 pm', 'Take train to work', 'Listen to Bible app'],
  'Weekends': ['Get up at 7:00 am', 'Plan/prep meals', 'Laundry'],
}

const HABIT_COLORS = {
  'Home Care': '#4a7a6a',
  'Self Care': '#3d6a5a',
  'Week Days': '#2d5560',
  'Weekends': '#1e3342',
}

export default function WeekView({ userId, selectedDate, onDateChange, calendarBlocks, asanaTasks, asanaToken, asanaWorkspaceGid }) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(selectedDate))
  const [addingDay, setAddingDay] = useState(null)
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [newTaskAsanaGid, setNewTaskAsanaGid] = useState('')
  const [linkingTask, setLinkingTask] = useState(null) // { id, dateStr }
  const [linkPickerGid, setLinkPickerGid] = useState('')

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const { isCompleted, toggle: toggleHabit } = useHabitCompletions(userId, weekStart, weekEnd)
  const weekMeetings = useMeetingsInRange(userId, weekStart, weekEnd)
  const { tasksByDate, toggleTask, addTask: addWeekTask, linkTask } = useWeeklyTasks(
    userId, weekStart,
    { token: asanaToken, workspaceGid: asanaWorkspaceGid }
  )
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
    await addWeekTask(dateStr, newTaskText.trim(), newTaskPriority, newTaskAsanaGid || null)
    setNewTaskText('')
    setNewTaskPriority('medium')
    setNewTaskAsanaGid('')
    setAddingDay(null)
  }

  async function handleLinkTask() {
    if (!linkingTask || !linkPickerGid) return
    await linkTask(linkingTask.id, linkingTask.dateStr, linkPickerGid)
    setLinkingTask(null)
    setLinkPickerGid('')
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
            {habits.map(habit => (
              <div key={habit} className="habit-row">
                <span className="habit-name">{habit}</span>
                <div className="habit-dots">
                  {days.map((day, i) => {
                    const dateStr = toDateStr(day)
                    const done = isCompleted(category, habit, dateStr)
                    return (
                      <button
                        key={i}
                        className={`habit-dot ${done ? 'checked' : ''}`}
                        style={{
                          borderColor: HABIT_COLORS[category],
                          background: done ? HABIT_COLORS[category] : 'transparent',
                        }}
                        onClick={() => toggleHabit(category, habit, dateStr)}
                        title={`${DAY_NAMES_FULL[i]} ${MONTH_SHORT[day.getMonth()]} ${day.getDate()}`}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
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
              return { id: m.id, title: m.title, color: m.color || '#00326b', startLabel, _sortKey: m.start_time || '' }
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
                    const asanaUrl = task.asana_gid ? `https://app.asana.com/0/0/${task.asana_gid}/f` : null
                    const isLinking = linkingTask?.id === task.id
                    return (
                      <div key={task.id}>
                        <div
                          className={`week-task-row ${task.completed ? 'done' : ''}`}
                          style={isCseaTask ? { background: '#f7e84b', borderRadius: '4px', padding: '1px 4px' } : {}}
                        >
                          <span
                            className="week-task-check"
                            style={{
                              background: task.completed ? (isCseaTask ? '#00326b' : dayColor) : 'transparent',
                              borderColor: isCseaTask ? '#cc0000' : dayColor,
                            }}
                            onClick={() => toggleTask(task.id, dateStr)}
                          />
                          <span
                            className="week-task-text"
                            style={isCseaTask ? { color: '#00326b', fontWeight: 700 } : {}}
                            onClick={() => toggleTask(task.id, dateStr)}
                          >{displayTaskTitle}</span>
                          {asanaUrl ? (
                            <a
                              href={asanaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="week-asana-badge"
                              title="View in Asana"
                              onClick={e => e.stopPropagation()}
                            >A</a>
                          ) : asanaTasks?.length > 0 && (
                            <button
                              className="week-asana-link-btn"
                              title="Link to Asana task"
                              onClick={e => { e.stopPropagation(); setLinkingTask({ id: task.id, dateStr }); setLinkPickerGid('') }}
                            >⊕</button>
                          )}
                        </div>
                        {isLinking && (
                          <div className="week-link-picker">
                            <select value={linkPickerGid} onChange={e => setLinkPickerGid(e.target.value)} className="week-link-select">
                              <option value="">— pick Asana task —</option>
                              {(asanaTasks || []).map(at => (
                                <option key={at.id} value={String(at.id).replace('asana_', '')}>{at.title || at.name}</option>
                              ))}
                            </select>
                            <button className="week-link-save" onClick={handleLinkTask} disabled={!linkPickerGid}>Link</button>
                            <button className="week-link-cancel" onClick={() => setLinkingTask(null)}>✕</button>
                          </div>
                        )}
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
                        if (e.key === 'Escape') { setAddingDay(null); setNewTaskAsanaGid('') }
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
                    {asanaTasks?.length > 0 && (
                      <select
                        className="week-add-asana-pick"
                        value={newTaskAsanaGid}
                        onChange={e => {
                          setNewTaskAsanaGid(e.target.value)
                          if (e.target.value) {
                            const at = asanaTasks.find(t => String(t.id).replace('asana_', '') === e.target.value)
                            if (at && !newTaskText) setNewTaskText(at.title || at.name || '')
                          }
                        }}
                        title="Link to existing Asana task (optional)"
                      >
                        <option value="">+ Asana (auto-create)</option>
                        {asanaTasks.map(at => (
                          <option key={at.id} value={String(at.id).replace('asana_', '')}>{at.title || at.name}</option>
                        ))}
                      </select>
                    )}
                    <button className="week-add-save" onClick={() => handleAddTask(dateStr)}>✓</button>
                    <button className="week-add-cancel" onClick={() => { setAddingDay(null); setNewTaskAsanaGid('') }}>✕</button>
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
                    ? { background: '#f7e84b', color: '#00326b', border: '1.5px solid #cc0000', fontWeight: 700 }
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
