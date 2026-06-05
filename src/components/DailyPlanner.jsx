import { useState, useRef } from 'react'
import './DailyPlanner.css'
import MonthView from './MonthView'
import CseaTracker from './CseaTracker'
import FinancialPanel from './FinancialPanel'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 6am–10pm
const BLOCK_COLORS = ['#4a90d9', '#e05c5c', '#5cb85c', '#f0a040', '#9b59b6', '#c9a96e']

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

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

const PRIORITY_COLORS = { high: '#e05c5c', medium: '#f0a040', low: '#5c9ee0' }

export default function DailyPlanner({
  selectedDate, onDateChange,
  dailyTasks, timeBlocks,
  onAddTask, onToggleTask, onDeleteTask, onUpdateTaskNotes,
  onAddBlock, onDeleteBlock,
  view, onViewChange,
  taskCounts,
  cseaIssues, onAddCseaIssue, onUpdateCseaStatus, onDeleteCseaIssue,
  cseaInteractions, onAddCseaInteraction,
  onMonthChange,
  transactions, onAddTransaction, onDeleteTransaction,
  bills, onAddBill, onToggleBillPaid, onDeleteBill,
  goals, onAddGoal, onUpdateGoalAmount, onDeleteGoal,
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

  const pending = (dailyTasks || []).filter(t => !t.completed)
  const done = (dailyTasks || []).filter(t => t.completed)

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
          {['day', 'month', 'csea', 'finance'].map(v => (
            <button
              key={v}
              className={`view-tab ${view === v ? 'active' : ''}`}
              onClick={() => onViewChange(v)}
            >
              {v === 'csea' ? 'CSEA' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {view === 'csea' && (
        <CseaTracker
          issues={cseaIssues || []}
          onAddIssue={onAddCseaIssue}
          onUpdateStatus={onUpdateCseaStatus}
          onDeleteIssue={onDeleteCseaIssue}
          interactions={cseaInteractions || []}
          onAddInteraction={onAddCseaInteraction}
        />
      )}

      {view === 'month' && (
        <MonthView
          selectedDate={selectedDate}
          onDateChange={(d) => { onDateChange(d); onViewChange('day') }}
          taskCounts={taskCounts}
          timeBlocks={timeBlocks}
          onMonthChange={onMonthChange}
        />
      )}

      {view === 'finance' && (
        <FinancialPanel
          transactions={transactions || []}
          onAddTransaction={onAddTransaction}
          onDeleteTransaction={onDeleteTransaction}
          bills={bills || []}
          onAddBill={onAddBill}
          onToggleBillPaid={onToggleBillPaid}
          onDeleteBill={onDeleteBill}
          goals={goals || []}
          onAddGoal={onAddGoal}
          onUpdateGoalAmount={onUpdateGoalAmount}
          onDeleteGoal={onDeleteGoal}
        />
      )}

      <div className="planner-body" style={{ display: (view === 'month' || view === 'csea' || view === 'finance') ? 'none' : undefined }}>
        {/* Daily Tasks */}
        <div className="daily-tasks-section">
          <div className="section-label">
            <span>Daily Tasks</span>
            <span className="task-count">{pending.length} remaining</span>
          </div>
          <div className="daily-task-list">
            {pending.map(task => (
              <DailyTaskRow key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} onUpdateNotes={onUpdateTaskNotes} />
            ))}
            {done.length > 0 && (
              <>
                <div className="done-sep"><span>Done</span></div>
                {done.map(task => (
                  <DailyTaskRow key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} onUpdateNotes={onUpdateTaskNotes} />
                ))}
              </>
            )}

            {showTaskAdd ? (
              <form className="inline-add-form" onSubmit={handleAddTask}>
                <span className="check-box placeholder" />
                <input
                  autoFocus
                  type="text"
                  placeholder="New task…"
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
            <span className="task-count">{timeBlocks.filter(b => b.source === 'google').length} from Google Calendar</span>
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
                        className={`time-block ${block.source === 'google' ? 'gcal-block' : ''}`}
                        style={{ background: block.color + '18', borderLeft: `3px solid ${block.color}` }}
                      >
                        <div className="block-main">
                          <span className="block-text">{block.title || block.text}</span>
                          {block.startLabel && (
                            <span className="block-time">{block.startLabel}–{block.endLabel}</span>
                          )}
                        </div>
                        <div className="block-meta">
                          {block.calendarName && (
                            <span className="block-cal-badge" style={{ color: block.color }}>
                              {block.calendarName}
                            </span>
                          )}
                          {block.source !== 'google' && (
                            <button
                              className="delete-block-btn"
                              onClick={() => onDeleteBlock(block.id)}
                            >✕</button>
                          )}
                        </div>
                      </div>
                    ))}

                    {isAddingHere ? (
                      <div className="add-block-inline">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Add event…"
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
                      <button className="add-block-btn" onClick={() => setAddingBlock(hour)}>+</button>
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

function DailyTaskRow({ task, onToggle, onDelete, onUpdateNotes }) {
  const [expanded, setExpanded] = useState(false)
  const [notesText, setNotesText] = useState(task.notes || task.description || '')
  const saveTimer = useRef(null)

  const hasNotes = !!(task.notes || task.description)

  function handleNotesChange(e) {
    const val = e.target.value
    setNotesText(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onUpdateNotes?.(task.id, val), 800)
  }

  return (
    <div className={`daily-task-row-wrap ${task.completed ? 'done' : ''}`}>
      <div className="daily-task-row">
        <button className="check-btn" onClick={() => onToggle(task.id)}>
          <span className={`check-box ${task.completed ? 'checked' : ''}`} />
        </button>
        <span
          className="priority-dot"
          style={{ background: PRIORITY_COLORS[task.priority] || '#ccc' }}
        />
        <span className="task-text">{task.title}</span>
        {task.project && <span className="task-project">{task.project}</span>}
        <button
          className={`notes-btn ${hasNotes ? 'has-notes' : ''} ${expanded ? 'open' : ''}`}
          onClick={() => setExpanded(e => !e)}
          title="Notes"
        >≡</button>
        <button className="delete-task-btn" onClick={() => onDelete(task.id)}>✕</button>
      </div>
      {expanded && (
        <textarea
          className="task-notes-input"
          placeholder="Add notes…"
          value={notesText}
          onChange={handleNotesChange}
          rows={3}
          autoFocus
        />
      )}
    </div>
  )
}
