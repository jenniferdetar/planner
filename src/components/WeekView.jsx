import { useState } from 'react'
import './WeekView.css'
import { useHabitCompletions } from '../hooks/useHabitCompletions'
import { usePersonalChecklist } from '../hooks/usePersonalChecklist'

const DAY_NAMES_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const DAY_COLORS = [
  '#e8a0a0', // Sunday
  '#e8c97a', // Monday
  '#7ec8c8', // Tuesday
  '#7ba7e0', // Wednesday
  '#e8a0a0', // Thursday
  '#e8c97a', // Friday
  '#7ec8c8', // Saturday
]

const PRIORITY_COLORS = { high: '#e05c5c', medium: '#f0a040', low: '#5c9ee0' }

function contrastColor(hex) {
  const c = (hex ?? '#4a90d9').replace('#', '')
  const r = parseInt(c.slice(0,2), 16)
  const g = parseInt(c.slice(2,4), 16)
  const b = parseInt(c.slice(4,6), 16)
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160 ? '#1a1a2e' : '#ffffff'
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
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
  'Home Care': '#e8a0a0',
  'Self Care': '#7ec8c8',
  'Week Days': '#e8c97a',
  'Weekends': '#7ba7e0',
}

export default function WeekView({ userId, selectedDate, onDateChange, calendarBlocks, tasksByDate, onToggleTask, onAddTask }) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(selectedDate))
  const [addingDay, setAddingDay] = useState(null)
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const { isCompleted, toggle: toggleHabit } = useHabitCompletions(userId, weekStart, weekEnd)
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
    await onAddTask(dateStr, newTaskText.trim(), newTaskPriority)
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
          const tasks = tasksByDate?.[dateStr] || []
          const events = (calendarBlocks || []).filter(b => b.startIso?.startsWith(dateStr))
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
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className={`week-task-row ${task.completed ? 'done' : ''}`}
                      onClick={() => onToggleTask(task.id, dateStr)}
                    >
                      <span
                        className="week-task-check"
                        style={{
                          background: task.completed ? dayColor : 'transparent',
                          borderColor: dayColor,
                        }}
                      />
                      <span className="week-task-text">{task.title}</span>
                    </div>
                  ))}
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
                {events.map(evt => (
                  <div
                    key={evt.id}
                    className="week-event-pill"
                    style={{ background: evt.color ?? '#4a90d9', color: contrastColor(evt.color) }}
                  >
                    {evt.startLabel && <span className="week-event-time">{evt.startLabel}</span>}
                    <span className="week-event-title">{evt.title || evt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
