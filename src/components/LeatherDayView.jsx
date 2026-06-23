import { useState, useRef } from 'react'
import './LeatherDayView.css'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const SHORT_DAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const HOURS = Array.from({ length: 15 }, (_, i) => i + 6) // 6am–8pm

const RIGHT_TABS = [
  { key: 'daily-tasks', label: 'Daily Tasks', color: '#4a7a9b' },
  { key: 'master-tasks', label: 'Master Tasks', color: '#7b5ea7' },
  { key: 'roles',    label: 'Roles',    color: '#c07a3a' },
  { key: 'goals',    label: 'Goals',    color: '#5a8a5a' },
  { key: 'meetings', label: 'Meetings', color: '#888' },
]

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function formatHour(h) {
  if (h === 0 || h === 12) return h === 0 ? '12 AM' : '12 PM'
  return h > 12 ? `${h - 12}` : `${h}`
}

function formatTimeFull(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2,'0')} ${suffix}`
}

export default function LeatherDayView({
  selectedDate, onDateChange,
  dailyTasks, onAddTask, onToggleTask, onDeleteTask,
  timeBlocks, onAddBlock, onDeleteBlock,
  noteContent, onNoteChange,
  masterTasks, onDeleteMasterTask,
  sections, onUpdateSection,
}) {
  const today = new Date()
  const [rightTab, setRightTab] = useState('daily-tasks')
  const [newTaskText, setNewTaskText] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  const [addingBlock, setAddingBlock] = useState(null)
  const [blockText, setBlockText] = useState('')
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')

  const noteTimer = useRef(null)
  const [noteVal, setNoteVal] = useState(noteContent || '')

  // sync if parent changes
  if (noteContent !== undefined && noteVal !== noteContent && !noteTimer.current) {
    // only sync when not currently typing
  }

  function handleNoteChange(e) {
    const val = e.target.value
    setNoteVal(val)
    clearTimeout(noteTimer.current)
    noteTimer.current = setTimeout(() => {
      onNoteChange?.(val)
      noteTimer.current = null
    }, 600)
  }

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
    onAddTask(newTaskText.trim(), 'medium')
    setNewTaskText('')
    setShowAddTask(false)
  }

  function openAddBlock(hour) {
    const pad = n => String(n).padStart(2, '0')
    setBlockStart(`${pad(hour)}:00`)
    setBlockEnd(`${pad(Math.min(hour + 1, 23))}:00`)
    setAddingBlock(hour)
    setBlockText('')
  }

  function handleAddBlock(hour) {
    if (!blockText.trim()) return
    const pad = n => String(n).padStart(2, '0')
    const st = blockStart || `${pad(hour)}:00`
    const et = blockEnd || `${pad(Math.min(hour + 1, 23))}:00`
    onAddBlock?.(hour, blockText.trim(), '#4a90d9', st + ':00', et + ':00')
    setBlockText('')
    setBlockStart('')
    setBlockEnd('')
    setAddingBlock(null)
  }

  const pending = (dailyTasks || []).filter(t => !t.completed)
  const done = (dailyTasks || []).filter(t => t.completed)

  return (
    <div className="leather-outer">
      {/* Leather frame */}
      <div className="leather-binder">
        {/* Left page */}
        <div className="binder-page left-page">
          <LeftPage
            selectedDate={selectedDate}
            today={today}
            onDateChange={onDateChange}
            pending={pending}
            done={done}
            showAddTask={showAddTask}
            setShowAddTask={setShowAddTask}
            newTaskText={newTaskText}
            setNewTaskText={setNewTaskText}
            handleAddTask={handleAddTask}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            timeBlocks={timeBlocks || []}
            addingBlock={addingBlock}
            blockText={blockText}
            setBlockText={setBlockText}
            blockStart={blockStart}
            setBlockStart={setBlockStart}
            blockEnd={blockEnd}
            setBlockEnd={setBlockEnd}
            openAddBlock={openAddBlock}
            handleAddBlock={handleAddBlock}
            setAddingBlock={setAddingBlock}
            prevDay={prevDay}
            nextDay={nextDay}
          />
        </div>

        {/* Rings */}
        <div className="binder-rings">
          {[0,1,2,3].map(i => (
            <div key={i} className="ring-pair">
              <div className="ring" />
            </div>
          ))}
        </div>

        {/* Right page */}
        <div className="binder-page right-page">
          <RightPage
            rightTab={rightTab}
            noteVal={noteVal}
            handleNoteChange={handleNoteChange}
            pending={pending}
            done={done}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            showAddTask={showAddTask}
            setShowAddTask={setShowAddTask}
            newTaskText={newTaskText}
            setNewTaskText={setNewTaskText}
            handleAddTask={handleAddTask}
            masterTasks={masterTasks || []}
            onDeleteMasterTask={onDeleteMasterTask}
            sections={sections}
            onUpdateSection={onUpdateSection}
            selectedDate={selectedDate}
          />
          {/* Right-edge tabs */}
          <div className="right-tabs">
            {RIGHT_TABS.map(tab => (
              <button
                key={tab.key}
                className={`right-tab ${rightTab === tab.key ? 'active' : ''}`}
                style={{ '--tab-color': tab.color }}
                onClick={() => setRightTab(tab.key)}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LeftPage({ selectedDate, today, onDateChange, pending, done, showAddTask, setShowAddTask, newTaskText, setNewTaskText, handleAddTask, onToggleTask, onDeleteTask, timeBlocks, addingBlock, blockText, setBlockText, blockStart, setBlockStart, blockEnd, setBlockEnd, openAddBlock, handleAddBlock, setAddingBlock, prevDay, nextDay }) {
  return (
    <div className="left-page-inner">
      {/* Date header */}
      <div className="lp-date-header">
        <div className="lp-date-left">
          <div className="lp-day-num">{selectedDate.getDate()}</div>
          <div className="lp-day-meta">
            <div className="lp-day-name">{DAY_NAMES[selectedDate.getDay()]}</div>
            <div className="lp-month-year">{MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}</div>
          </div>
          <div className="lp-date-nav">
            <button className="lp-nav-btn" onClick={prevDay}>‹</button>
            <button
              className="lp-today-btn"
              onClick={() => onDateChange(new Date())}
              style={{ opacity: sameDay(selectedDate, today) ? 0.4 : 1 }}
            >Today</button>
            <button className="lp-nav-btn" onClick={nextDay}>›</button>
          </div>
        </div>
        <MiniCalendar selectedDate={selectedDate} onDateChange={onDateChange} />
      </div>

      {/* Task area */}
      <div className="lp-tasks">
        <div className="lp-section-title">
          <span>Daily Tasks</span>
          <button className="lp-add-task-btn" onClick={() => setShowAddTask(s => !s)}>
            <span className="lp-add-circle">+</span>
            <span>Add Task</span>
          </button>
        </div>

        {showAddTask && (
          <form className="lp-add-form" onSubmit={handleAddTask}>
            <input
              autoFocus
              type="text"
              placeholder="New task…"
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              className="lp-task-input"
            />
            <button type="submit" className="lp-save-btn">Add</button>
            <button type="button" className="lp-cancel-btn" onClick={() => setShowAddTask(false)}>✕</button>
          </form>
        )}

        <div className="lp-task-lines">
          {pending.map(task => (
            <TaskLine key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} />
          ))}
          {done.map(task => (
            <TaskLine key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} done />
          ))}
          {/* Blank lines to fill space */}
          {Array.from({ length: Math.max(0, 6 - pending.length - done.length) }).map((_, i) => (
            <div key={`blank-${i}`} className="lp-blank-line" />
          ))}
        </div>
      </div>

      {/* Timed schedule */}
      <div className="lp-schedule">
        <div className="lp-section-title">Schedule</div>
        <div className="lp-time-grid">
          {HOURS.map(hour => {
            const blocksHere = timeBlocks.filter(b => b.hour === hour)
            const isAddingHere = addingBlock === hour
            const isCurrentHour = sameDay(selectedDate, new Date()) && new Date().getHours() === hour

            return (
              <div key={hour} className={`lp-time-row ${isCurrentHour ? 'current' : ''}`}>
                <div className="lp-hour-label">
                  {formatHour(hour)}
                  <span className="lp-hour-ampm">{hour < 12 ? 'am' : 'pm'}</span>
                </div>
                <div className="lp-hour-body">
                  {isCurrentHour && <div className="lp-now-line" />}
                  {blocksHere.map(b => (
                    <div
                      key={b.id}
                      className="lp-block"
                      style={{ background: b.color || '#4a90d9' }}
                    >
                      <span className="lp-block-title">{b.title || b.text}</span>
                      {b.startLabel && (
                        <span className="lp-block-time">{b.startLabel}–{b.endLabel}</span>
                      )}
                      {b.source !== 'google' && (
                        <button className="lp-block-del" onClick={() => onDeleteBlock?.(b.id)}>✕</button>
                      )}
                    </div>
                  ))}
                  {isAddingHere ? (
                    <div className="lp-add-block-form">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Event…"
                        value={blockText}
                        onChange={e => setBlockText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddBlock(hour)
                          if (e.key === 'Escape') setAddingBlock(null)
                        }}
                        className="lp-block-input"
                      />
                      <input type="time" value={blockStart} onChange={e => setBlockStart(e.target.value)} className="lp-time-input" />
                      <span>–</span>
                      <input type="time" value={blockEnd} onChange={e => setBlockEnd(e.target.value)} className="lp-time-input" />
                      <button className="lp-save-btn sm" onClick={() => handleAddBlock(hour)}>+</button>
                      <button className="lp-cancel-btn" onClick={() => setAddingBlock(null)}>✕</button>
                    </div>
                  ) : (
                    <button className="lp-add-hour-btn" onClick={() => openAddBlock(hour)}>+</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function RightPage({ rightTab, noteVal, handleNoteChange, pending, done, onToggleTask, onDeleteTask, showAddTask, setShowAddTask, newTaskText, setNewTaskText, handleAddTask, masterTasks, onDeleteMasterTask, sections, onUpdateSection, selectedDate }) {
  return (
    <div className="right-page-inner">
      {rightTab === 'daily-tasks' && (
        <DailyTasksPanel
          pending={pending}
          done={done}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
          showAdd={showAddTask}
          setShowAdd={setShowAddTask}
          newText={newTaskText}
          setNewText={setNewTaskText}
          onSubmit={handleAddTask}
          selectedDate={selectedDate}
        />
      )}
      {rightTab === 'master-tasks' && (
        <MasterTasksPanel masterTasks={masterTasks} onDelete={onDeleteMasterTask} />
      )}
      {rightTab === 'notes' && (
        <NotesPanel noteVal={noteVal} onChange={handleNoteChange} />
      )}
      {(rightTab === 'roles' || rightTab === 'goals' || rightTab === 'meetings') && (
        <SectionTextPanel
          sectionKey={rightTab}
          label={RIGHT_TABS.find(t => t.key === rightTab)?.label}
          color={RIGHT_TABS.find(t => t.key === rightTab)?.color}
          value={sections?.[rightTab] ?? ''}
          onChange={onUpdateSection}
        />
      )}
    </div>
  )
}

function DailyTasksPanel({ pending, done, onToggle, onDelete, showAdd, setShowAdd, newText, setNewText, onSubmit, selectedDate }) {
  const dateLabel = `${DAY_NAMES[selectedDate.getDay()]}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`
  return (
    <div className="rp-panel">
      <div className="rp-header">
        <span className="rp-title">Daily Tasks</span>
        <span className="rp-subtitle">{dateLabel}</span>
      </div>
      <div className="rp-task-list">
        {pending.map((task, i) => (
          <RpTaskRow key={task.id} task={task} index={i + 1} onToggle={onToggle} onDelete={onDelete} />
        ))}
        {done.length > 0 && (
          <>
            <div className="rp-done-sep">Completed</div>
            {done.map((task, i) => (
              <RpTaskRow key={task.id} task={task} index={pending.length + i + 1} onToggle={onToggle} onDelete={onDelete} done />
            ))}
          </>
        )}
        {pending.length === 0 && done.length === 0 && (
          <p className="rp-empty">No tasks yet for today.</p>
        )}
        {showAdd ? (
          <form className="rp-add-form" onSubmit={onSubmit}>
            <input
              autoFocus
              type="text"
              placeholder="New task…"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              className="rp-task-input"
            />
            <button type="submit" className="lp-save-btn">Add</button>
            <button type="button" className="lp-cancel-btn" onClick={() => setShowAdd(false)}>✕</button>
          </form>
        ) : (
          <button className="rp-add-btn" onClick={() => setShowAdd(true)}>+ Add task</button>
        )}
      </div>
      {/* Decorative art placeholder */}
      <div className="rp-art">
        <svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg" className="rp-art-svg">
          {/* Mountain */}
          <polygon points="60,160 150,60 240,160" fill="none" stroke="#d0c8be" strokeWidth="1.5"/>
          <polygon points="20,160 100,90 180,160" fill="none" stroke="#d0c8be" strokeWidth="1"/>
          {/* Tree trunk */}
          <line x1="230" y1="160" x2="230" y2="110" stroke="#c4b8a8" strokeWidth="3"/>
          {/* Tree branches */}
          <ellipse cx="230" cy="95" rx="28" ry="20" fill="#f0c8d0" opacity="0.6"/>
          <ellipse cx="212" cy="105" rx="18" ry="14" fill="#f0c8d0" opacity="0.5"/>
          <ellipse cx="248" cy="105" rx="18" ry="14" fill="#f0c8d0" opacity="0.5"/>
          {/* Birds */}
          <path d="M80,50 Q85,45 90,50" fill="none" stroke="#b0a898" strokeWidth="1.2"/>
          <path d="M95,42 Q100,37 105,42" fill="none" stroke="#b0a898" strokeWidth="1.2"/>
          <path d="M110,55 Q115,50 120,55" fill="none" stroke="#b0a898" strokeWidth="1.2"/>
          {/* Ground line */}
          <line x1="10" y1="160" x2="290" y2="160" stroke="#d0c8be" strokeWidth="1"/>
        </svg>
      </div>
    </div>
  )
}

function RpTaskRow({ task, index, onToggle, onDelete, done }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={`rp-task-row ${done ? 'done' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="rp-task-num">{index}.</span>
      <button className="rp-check" onClick={() => onToggle(task.id)}>
        <span className={`rp-circle ${done ? 'checked' : ''}`} />
      </button>
      <span className="rp-task-title">{task.title}</span>
      {hovered && (
        <button className="rp-del-btn" onClick={() => onDelete(task.id)}>✕</button>
      )}
    </div>
  )
}

function MasterTasksPanel({ masterTasks, onDelete }) {
  const high = masterTasks.filter(t => t.priority === 'high')
  const med = masterTasks.filter(t => t.priority === 'medium')
  const low = masterTasks.filter(t => t.priority === 'low')
  const other = masterTasks.filter(t => !['high','medium','low'].includes(t.priority))

  return (
    <div className="rp-panel">
      <div className="rp-header">
        <span className="rp-title">Master Tasks</span>
        <span className="rp-subtitle">{masterTasks.length} total</span>
      </div>
      <div className="rp-task-list">
        {masterTasks.length === 0 && <p className="rp-empty">No backlog tasks.</p>}
        {[['High Priority', high, '#e05c5c'], ['Medium', med, '#f0a040'], ['Low', low, '#5c9ee0'], ['Other', other, '#aaa']].map(([label, group, color]) =>
          group.length > 0 && (
            <div key={label} className="rp-priority-group">
              <div className="rp-priority-label" style={{ color }}>{label}</div>
              {group.map(task => (
                <MasterRow key={task.id} task={task} onDelete={onDelete} color={color} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

function MasterRow({ task, onDelete, color }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="rp-task-row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="rp-priority-dot" style={{ background: color }} />
      <span className="rp-task-title">{task.title}</span>
      {task.category && <span className="rp-tag">{task.category}</span>}
      {hovered && <button className="rp-del-btn" onClick={() => onDelete(task.id)}>✕</button>}
    </div>
  )
}

function NotesPanel({ noteVal, onChange }) {
  return (
    <div className="rp-panel notes-panel">
      <div className="rp-header">
        <span className="rp-title">Daily Notes</span>
      </div>
      <textarea
        className="rp-notes-area"
        placeholder="Write your notes here…"
        value={noteVal}
        onChange={onChange}
      />
    </div>
  )
}

function SectionTextPanel({ sectionKey, label, color, value, onChange }) {
  const saveTimer = useRef(null)
  const [text, setText] = useState(value)

  function handleChange(e) {
    const val = e.target.value
    setText(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onChange?.(sectionKey, val), 800)
  }

  return (
    <div className="rp-panel">
      <div className="rp-header" style={{ borderBottomColor: color }}>
        <span className="rp-title" style={{ color }}>{label}</span>
      </div>
      <textarea
        className="rp-notes-area"
        placeholder={`Your ${label?.toLowerCase()}…`}
        value={text}
        onChange={handleChange}
      />
    </div>
  )
}

function MiniCalendar({ selectedDate, onDateChange }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate()

  const cells = []
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, overflow: true })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, overflow: false })
  while (cells.length < 35)
    cells.push({ day: cells.length - firstDay - daysInMonth + 1, overflow: true })

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div className="lp-mini-cal">
      <div className="lp-cal-nav">
        <button className="lp-cal-nav-btn" onClick={prevMonth}>‹</button>
        <span className="lp-cal-month-label">{MONTH_NAMES[viewMonth].slice(0,3)} {viewYear}</span>
        <button className="lp-cal-nav-btn" onClick={nextMonth}>›</button>
      </div>
      <div className="lp-cal-grid">
        {SHORT_DAY.map((d, i) => (
          <span key={i} className="lp-cal-dow">{d.charAt(0)}</span>
        ))}
        {cells.map((cell, i) => {
          if (cell.overflow) return <span key={i} className="lp-cal-cell overflow" />
          const cellDate = new Date(viewYear, viewMonth, cell.day)
          const isToday = sameDay(cellDate, today)
          const isSelected = sameDay(cellDate, selectedDate)
          return (
            <button
              key={i}
              className={`lp-cal-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onDateChange(cellDate)}
            >
              {cell.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TaskLine({ task, onToggle, onDelete, done }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={`lp-task-line ${done ? 'done' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button className="lp-task-check" onClick={() => onToggle(task.id)}>
        <span className={`lp-check-circle ${done ? 'checked' : ''}`} />
      </button>
      <span className="lp-task-title">{task.title}</span>
      {hovered && (
        <button className="lp-task-del" onClick={() => onDelete(task.id)}>✕</button>
      )}
    </div>
  )
}
