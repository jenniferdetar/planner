import { useState } from 'react'
import './DailyPlanner.css'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 6am - 10pm
const BLOCK_COLORS = ['#4a90d9', '#e05c5c', '#5cb85c', '#f0a040', '#9b59b6', '#c9a96e']

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function formatHour(h) {
  if (h === 12) return '12 PM'
  if (h > 12) return `${h - 12} PM`
  return `${h} AM`
}

function formatDate(d) {
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export default function DailyPlanner({
  selectedDate, onDateChange,
  dailyTasks, timeBlocks,
  onAddTask, onToggleTask, onDeleteTask,
  onAddBlock, onDeleteBlock,
  view, onViewChange
}) {
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [showTaskAdd, setShowTaskAdd] = useState(false)
  const [addingBlock, setAddingBlock] = useState(null)
  const [blockText, setBlockText] = useState('')
  const [blockColor, setBlockColor] = useState(BLOCK_COLORS[0])

  const today = new Date()
  const isToday = sameDay(selectedDate, today)

  function prevDay() {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    onDateChange(d)
  }

  function nextDay() {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    onDateChange(d)
  }

  function handleAddTask(e) {
    e.preventDefault()
    if (!newTaskText.trim()) return
    onAddTask(newTaskText.trim(), newTaskPriority)
    setNewTaskText('')
    setNewTaskPriority('medium')
    setShowTaskAdd(false)
  }

  function handleAddBlock(hour) {
    if (!blockText.trim()) return
    onAddBlock(hour, blockText.trim(), blockColor)
    setBlockText('')
    setBlockColor(BLOCK_COLORS[0])
    setAddingBlock(null)
  }

  const PRIORITY_COLORS = { high: '#e05c5c', medium: '#f0a040', low: '#5c9ee0' }

  return (
    <main className="daily-planner">
      <div className="planner-header">
        <div className="date-nav">
          <button className="nav-btn" onClick={prevDay}>‹</button>
          <div className="date-display">
            <h1 className="date-main">{formatDate(selectedDate)}</h1>
            {isToday && <span className="today-badge">Today</span>}
          </div>
          <button className="nav-btn" onClick={nextDay}>›</button>
          {!isToday && (
            <button className="today-btn" onClick={() => onDateChange(today)}>Today</button>
          )}
        </div>
        <div className="view-tabs">
          {['day', 'week'].map(v => (
            <button
              key={v}
              className={`view-tab ${view === v ? 'active' : ''}`}
              onClick={() => onViewChange(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="planner-body">
        {/* Daily Tasks */}
        <div className="daily-tasks-section">
          <div className="section-label">
            <span>Daily Tasks</span>
            <span className="task-count">{dailyTasks.filter(t => !t.done).length} remaining</span>
          </div>
          <div className="daily-task-list">
            {dailyTasks.map(task => (
              <div key={task.id} className={`daily-task-row ${task.done ? 'done' : ''}`}>
                <button className="check-btn" onClick={() => onToggleTask(task.id)}>
                  <span className={`check-box ${task.done ? 'checked' : ''}`} />
                </button>
                <span
                  className="priority-dot"
                  style={{ background: PRIORITY_COLORS[task.priority] }}
                />
                <span className="task-text">{task.text}</span>
                <button className="delete-task-btn" onClick={() => onDeleteTask(task.id)}>✕</button>
              </div>
            ))}
            {showTaskAdd ? (
              <form className="inline-add-form" onSubmit={handleAddTask}>
                <span className="check-box placeholder" />
                <input
                  autoFocus
                  type="text"
                  placeholder="New task..."
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  className="inline-input"
                />
                <div className="inline-priority">
                  {['high', 'medium', 'low'].map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`mini-priority-btn ${newTaskPriority === p ? 'active' : ''}`}
                      style={{ '--c': PRIORITY_COLORS[p] }}
                      onClick={() => setNewTaskPriority(p)}
                    />
                  ))}
                </div>
                <button type="submit" className="inline-save">✓</button>
                <button type="button" className="inline-cancel" onClick={() => setShowTaskAdd(false)}>✕</button>
              </form>
            ) : (
              <button className="add-daily-task-btn" onClick={() => setShowTaskAdd(true)}>
                + Add task
              </button>
            )}
          </div>
        </div>

        {/* Time Schedule */}
        <div className="schedule-section">
          <div className="section-label">
            <span>Schedule</span>
          </div>
          <div className="time-grid">
            {HOURS.map(hour => {
              const blocksAtHour = timeBlocks.filter(b => b.hour === hour)
              const isAddingHere = addingBlock === hour
              const now = new Date()
              const isCurrentHour = isToday && now.getHours() === hour

              return (
                <div key={hour} className={`time-row ${isCurrentHour ? 'current-hour' : ''}`}>
                  <div className="hour-label">{formatHour(hour)}</div>
                  <div className="hour-content">
                    {isCurrentHour && (
                      <div className="now-indicator">
                        <span className="now-dot" />
                        <span className="now-line" />
                      </div>
                    )}
                    {blocksAtHour.map(block => (
                      <div
                        key={block.id}
                        className="time-block"
                        style={{ background: block.color + '22', borderLeft: `3px solid ${block.color}` }}
                      >
                        <span className="block-text">{block.text}</span>
                        <button
                          className="delete-block-btn"
                          onClick={() => onDeleteBlock(block.id)}
                        >✕</button>
                      </div>
                    ))}
                    {isAddingHere ? (
                      <div className="add-block-inline">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Add event..."
                          value={blockText}
                          onChange={e => setBlockText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddBlock(hour)
                            if (e.key === 'Escape') setAddingBlock(null)
                          }}
                          className="block-input"
                        />
                        <div className="color-swatches">
                          {BLOCK_COLORS.map(c => (
                            <button
                              key={c}
                              className={`color-swatch ${blockColor === c ? 'active' : ''}`}
                              style={{ background: c }}
                              onClick={() => setBlockColor(c)}
                            />
                          ))}
                        </div>
                        <button className="block-save-btn" onClick={() => handleAddBlock(hour)}>Add</button>
                        <button className="block-cancel-btn" onClick={() => setAddingBlock(null)}>✕</button>
                      </div>
                    ) : (
                      <button
                        className="add-block-btn"
                        onClick={() => setAddingBlock(hour)}
                      >+</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
