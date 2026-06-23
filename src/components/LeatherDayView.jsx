import { useState, useRef } from 'react'
import './LeatherDayView.css'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const SHORT_DAY   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const HOURS = Array.from({ length: 15 }, (_, i) => i + 6) // 6am–8pm

// Tabs that render content inline in the right panel
const CONTENT_TABS = [
  { key: 'daily-tasks',  label: 'Daily Tasks',  color: '#4a7a9b' },
  { key: 'schedule',     label: 'Schedule',     color: '#2d7a5a' },
  { key: 'master-tasks', label: 'Master Tasks', color: '#7b5ea7' },
  { key: 'roles',        label: 'Roles',        color: '#c07a3a' },
  { key: 'goals',        label: 'Goals',        color: '#5a8a5a' },
  { key: 'meetings',     label: 'Meetings',     color: '#6a7a88' },
]

// Tabs that navigate to other views (handled by onViewChange)
const NAV_TABS = [
  { key: 'week',    label: 'Week',    color: '#3d6a5a' },
  { key: 'month',   label: 'Month',   color: '#4a7a6a' },
  { key: 'csea',    label: 'CSEA',    color: '#2d5560' },
  { key: 'icaap',   label: 'iCAAP',   color: '#3d5a6a' },
  { key: 'gcu',     label: 'GCU',     color: '#4a6a7a' },
  { key: 'finance', label: 'Finance', color: '#1e3342' },
  { key: 'wywo',    label: 'WYWO',    color: '#5a5a6a' },
]

const ALL_TABS = [...CONTENT_TABS, ...NAV_TABS]

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function formatHour(h) {
  return h > 12 ? `${h - 12}` : h === 0 ? '12' : `${h}`
}

export default function LeatherDayView({
  selectedDate, onDateChange,
  dailyTasks, onAddTask, onToggleTask, onDeleteTask,
  timeBlocks, onAddBlock, onDeleteBlock,
  noteContent, onNoteChange,
  masterTasks, onDeleteMasterTask,
  sections, onUpdateSection,
  onViewChange,
}) {
  const today = new Date()
  const [rightTab, setRightTab] = useState('daily-tasks')
  const [newTaskText, setNewTaskText] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  const [addingBlock, setAddingBlock] = useState(null)
  const [blockText, setBlockText] = useState('')
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')

  function handleTabClick(tab) {
    if (NAV_TABS.find(t => t.key === tab.key)) {
      onViewChange?.(tab.key)
    } else {
      setRightTab(tab.key)
    }
  }

  function prevDay() { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); onDateChange(d) }
  function nextDay() { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); onDateChange(d) }

  function handleAddTask(e) {
    e.preventDefault()
    if (!newTaskText.trim()) return
    onAddTask(newTaskText.trim(), 'medium')
    setNewTaskText(''); setShowAddTask(false)
  }

  function openAddBlock(hour) {
    const pad = n => String(n).padStart(2, '0')
    setBlockStart(`${pad(hour)}:00`); setBlockEnd(`${pad(Math.min(hour+1,23))}:00`)
    setAddingBlock(hour); setBlockText('')
  }

  function handleAddBlock(hour) {
    if (!blockText.trim()) return
    const pad = n => String(n).padStart(2, '0')
    onAddBlock?.(hour, blockText.trim(), '#4a90d9',
      (blockStart || `${pad(hour)}:00`) + ':00',
      (blockEnd   || `${pad(Math.min(hour+1,23))}:00`) + ':00')
    setBlockText(''); setBlockStart(''); setBlockEnd(''); setAddingBlock(null)
  }

  const pending = (dailyTasks || []).filter(t => !t.completed)
  const done    = (dailyTasks || []).filter(t => t.completed)

  const taskProps = {
    pending, done,
    onToggle: onToggleTask, onDelete: onDeleteTask,
    showAdd: showAddTask, setShowAdd: setShowAddTask,
    newText: newTaskText, setNewText: setNewTaskText,
    onSubmit: handleAddTask, selectedDate,
  }

  const scheduleProps = {
    selectedDate, timeBlocks: timeBlocks || [], onDeleteBlock,
    addingBlock, blockText, setBlockText,
    blockStart, setBlockStart, blockEnd, setBlockEnd,
    openAddBlock, handleAddBlock, setAddingBlock,
  }

  return (
    <div className="leather-outer">
      <div className="leather-binder">

        {/* ── Left page: date + mini calendar ── */}
        <div className="binder-page left-page">
          <div className="left-page-inner">
            <div className="lp-date-header">
              <div className="lp-day-num">{selectedDate.getDate()}</div>
              <div className="lp-date-right">
                <div className="lp-day-name">{DAY_NAMES[selectedDate.getDay()]}</div>
                <div className="lp-month-year">{MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}</div>
                <div className="lp-date-nav">
                  <button className="lp-nav-btn" onClick={prevDay}>‹</button>
                  <button className="lp-today-btn"
                    onClick={() => onDateChange(new Date())}
                    style={{ opacity: sameDay(selectedDate, today) ? 0.4 : 1 }}>Today</button>
                  <button className="lp-nav-btn" onClick={nextDay}>›</button>
                </div>
              </div>
            </div>

            <div className="lp-cal-area">
              <MiniCalendar selectedDate={selectedDate} onDateChange={onDateChange} />
            </div>

            <div className="lp-lined-filler" />
          </div>
        </div>

        {/* ── Rings ── */}
        <div className="binder-rings">
          {[0,1,2,3].map(i => <div key={i} className="ring-pair"><div className="ring" /></div>)}
        </div>

        {/* ── Right page ── */}
        <div className="binder-page right-page">
          <div className="right-page-inner">

            {rightTab === 'daily-tasks'  && <DailyTasksPanel  {...taskProps} />}
            {rightTab === 'schedule'     && <SchedulePanel    {...scheduleProps} />}
            {rightTab === 'master-tasks' && <MasterTasksPanel masterTasks={masterTasks || []} onDelete={onDeleteMasterTask} />}
            {(rightTab === 'roles' || rightTab === 'goals' || rightTab === 'meetings') && (
              <SectionTextPanel
                sectionKey={rightTab}
                label={CONTENT_TABS.find(t => t.key === rightTab)?.label}
                color={CONTENT_TABS.find(t => t.key === rightTab)?.color}
                value={sections?.[rightTab] ?? ''}
                onChange={onUpdateSection}
              />
            )}

          </div>

          {/* Right-edge tabs — all sidebar items */}
          <div className="right-tabs">
            {ALL_TABS.map(tab => {
              const isNav = NAV_TABS.find(t => t.key === tab.key)
              const isActive = !isNav && rightTab === tab.key
              return (
                <button
                  key={tab.key}
                  className={`right-tab ${isActive ? 'active' : ''} ${isNav ? 'nav-tab' : ''}`}
                  style={{ '--tab-color': tab.color }}
                  onClick={() => handleTabClick(tab)}
                  title={tab.label}
                >
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Daily Tasks ──────────────────────────────────────────────────────────────
function DailyTasksPanel({ pending, done, onToggle, onDelete, showAdd, setShowAdd, newText, setNewText, onSubmit, selectedDate }) {
  const dateLabel = `${DAY_NAMES[selectedDate.getDay()]}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`
  return (
    <div className="rp-panel">
      <div className="rp-header">
        <span className="rp-title">Daily Tasks</span>
        <span className="rp-subtitle">{dateLabel}</span>
        <button className="rp-add-inline-btn" onClick={() => setShowAdd(s => !s)}>+ Add</button>
      </div>
      <div className="rp-task-list">
        {showAdd && (
          <form className="rp-add-form" onSubmit={onSubmit}>
            <input autoFocus type="text" placeholder="New task…" value={newText}
              onChange={e => setNewText(e.target.value)} className="rp-task-input" />
            <button type="submit" className="lp-save-btn">Add</button>
            <button type="button" className="lp-cancel-btn" onClick={() => setShowAdd(false)}>✕</button>
          </form>
        )}
        {pending.map((t, i) => <RpTaskRow key={t.id} task={t} index={i+1} onToggle={onToggle} onDelete={onDelete} />)}
        {done.length > 0 && <>
          <div className="rp-done-sep">Completed</div>
          {done.map((t, i) => <RpTaskRow key={t.id} task={t} index={pending.length+i+1} onToggle={onToggle} onDelete={onDelete} done />)}
        </>}
        {pending.length === 0 && done.length === 0 && !showAdd &&
          <p className="rp-empty">No tasks yet. Click "+ Add" to get started.</p>}
        {Array.from({ length: Math.max(0, 8 - pending.length - done.length) }).map((_, i) =>
          <div key={`b-${i}`} className="rp-blank-line" />)}
      </div>
      <div className="rp-art"><BlossomsArt /></div>
    </div>
  )
}

// ── Schedule ─────────────────────────────────────────────────────────────────
function SchedulePanel({ selectedDate, timeBlocks, onDeleteBlock, addingBlock, blockText, setBlockText, blockStart, setBlockStart, blockEnd, setBlockEnd, openAddBlock, handleAddBlock, setAddingBlock }) {
  const today = new Date()
  return (
    <div className="rp-panel">
      <div className="rp-header">
        <span className="rp-title">Schedule</span>
        <span className="rp-subtitle">{DAY_NAMES[selectedDate.getDay()]}, {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}</span>
      </div>
      <div className="rp-schedule-body">
        {HOURS.map(hour => {
          const blocksHere = timeBlocks.filter(b => b.hour === hour)
          const isAddingHere = addingBlock === hour
          const isCurrent = sameDay(selectedDate, today) && new Date().getHours() === hour
          return (
            <div key={hour} className={`rp-time-row ${isCurrent ? 'current' : ''}`}>
              <div className="rp-hour-label">
                {formatHour(hour)}<span className="rp-hour-ampm">{hour < 12 ? 'am' : 'pm'}</span>
              </div>
              <div className="rp-hour-body">
                {isCurrent && <div className="rp-now-line" />}
                {blocksHere.map(b => (
                  <div key={b.id} className="rp-block" style={{ background: b.color || '#4a90d9' }}>
                    <span className="rp-block-title">{b.title || b.text}</span>
                    {b.startLabel && <span className="rp-block-time">{b.startLabel}–{b.endLabel}</span>}
                    {b.source !== 'google' && <button className="rp-block-del" onClick={() => onDeleteBlock?.(b.id)}>✕</button>}
                  </div>
                ))}
                {isAddingHere ? (
                  <div className="rp-add-block-form">
                    <input autoFocus type="text" placeholder="Event…" value={blockText}
                      onChange={e => setBlockText(e.target.value)}
                      onKeyDown={e => { if (e.key==='Enter') handleAddBlock(hour); if (e.key==='Escape') setAddingBlock(null) }}
                      className="lp-block-input" />
                    <input type="time" value={blockStart} onChange={e => setBlockStart(e.target.value)} className="lp-time-input" />
                    <span>–</span>
                    <input type="time" value={blockEnd} onChange={e => setBlockEnd(e.target.value)} className="lp-time-input" />
                    <button className="lp-save-btn sm" onClick={() => handleAddBlock(hour)}>+</button>
                    <button className="lp-cancel-btn" onClick={() => setAddingBlock(null)}>✕</button>
                  </div>
                ) : (
                  <button className="rp-add-hour-btn" onClick={() => openAddBlock(hour)}>+</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Master Tasks ─────────────────────────────────────────────────────────────
function MasterTasksPanel({ masterTasks, onDelete }) {
  const groups = [
    ['High', masterTasks.filter(t => t.priority==='high'), '#e05c5c'],
    ['Medium', masterTasks.filter(t => t.priority==='medium'), '#f0a040'],
    ['Low', masterTasks.filter(t => t.priority==='low'), '#5c9ee0'],
    ['Other', masterTasks.filter(t => !['high','medium','low'].includes(t.priority)), '#aaa'],
  ]
  return (
    <div className="rp-panel">
      <div className="rp-header">
        <span className="rp-title">Master Tasks</span>
        <span className="rp-subtitle">{masterTasks.length} total</span>
      </div>
      <div className="rp-task-list">
        {masterTasks.length === 0 && <p className="rp-empty">No backlog tasks.</p>}
        {groups.map(([label, group, color]) => group.length > 0 && (
          <div key={label} className="rp-priority-group">
            <div className="rp-priority-label" style={{ color }}>{label}</div>
            {group.map(task => <MasterRow key={task.id} task={task} onDelete={onDelete} color={color} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Section text (Roles / Goals / Meetings) ──────────────────────────────────
function SectionTextPanel({ sectionKey, label, color, value, onChange }) {
  const saveTimer = useRef(null)
  const [text, setText] = useState(value)
  function handleChange(e) {
    const val = e.target.value; setText(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onChange?.(sectionKey, val), 800)
  }
  return (
    <div className="rp-panel">
      <div className="rp-header" style={{ borderBottomColor: color }}>
        <span className="rp-title" style={{ color }}>{label}</span>
        <span className="rp-subtitle">Saves automatically</span>
      </div>
      <textarea className="rp-notes-area" placeholder={`Your ${label?.toLowerCase()}…`} value={text} onChange={handleChange} />
    </div>
  )
}

// ── Shared rows ──────────────────────────────────────────────────────────────
function RpTaskRow({ task, index, onToggle, onDelete, done }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className={`rp-task-row ${done ? 'done' : ''}`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span className="rp-task-num">{index}.</span>
      <button className="rp-check" onClick={() => onToggle(task.id)}>
        <span className={`rp-circle ${done ? 'checked' : ''}`} />
      </button>
      <span className="rp-task-title">{task.title}</span>
      {hovered && <button className="rp-del-btn" onClick={() => onDelete(task.id)}>✕</button>}
    </div>
  )
}

function MasterRow({ task, onDelete, color }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="rp-task-row"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span className="rp-priority-dot" style={{ background: color }} />
      <span className="rp-task-title">{task.title}</span>
      {task.category && <span className="rp-tag">{task.category}</span>}
      {hovered && <button className="rp-del-btn" onClick={() => onDelete(task.id)}>✕</button>}
    </div>
  )
}

// ── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ selectedDate, onDateChange }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate()
  const cells = []
  for (let i = firstDay-1; i >= 0; i--) cells.push({ day: daysInPrev-i, overflow: true })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, overflow: false })
  while (cells.length < 35) cells.push({ day: cells.length-firstDay-daysInMonth+1, overflow: true })

  function prevMonth() { viewMonth===0 ? (setViewYear(y=>y-1),setViewMonth(11)) : setViewMonth(m=>m-1) }
  function nextMonth() { viewMonth===11 ? (setViewYear(y=>y+1),setViewMonth(0)) : setViewMonth(m=>m+1) }

  return (
    <div className="lp-mini-cal">
      <div className="lp-cal-nav">
        <button className="lp-cal-nav-btn" onClick={prevMonth}>‹</button>
        <span className="lp-cal-month-label">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button className="lp-cal-nav-btn" onClick={nextMonth}>›</button>
      </div>
      <div className="lp-cal-grid">
        {SHORT_DAY.map((d,i) => <span key={i} className="lp-cal-dow">{d.charAt(0)}</span>)}
        {cells.map((cell, i) => {
          if (cell.overflow) return <span key={i} className="lp-cal-cell overflow" />
          const cellDate = new Date(viewYear, viewMonth, cell.day)
          const isToday = sameDay(cellDate, today)
          const isSel   = sameDay(cellDate, selectedDate)
          return (
            <button key={i}
              className={`lp-cal-cell ${isToday?'today':''} ${isSel?'selected':''}`}
              onClick={() => onDateChange(cellDate)}
            >{cell.day}</button>
          )
        })}
      </div>
    </div>
  )
}

// ── Decorative SVG ───────────────────────────────────────────────────────────
function BlossomsArt() {
  return (
    <svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg" className="rp-art-svg">
      <polygon points="60,130 150,40 240,130" fill="none" stroke="#d0c8be" strokeWidth="1.5"/>
      <polygon points="20,130 100,70 180,130" fill="none" stroke="#d0c8be" strokeWidth="1"/>
      <line x1="230" y1="130" x2="230" y2="85" stroke="#c4b8a8" strokeWidth="3"/>
      <ellipse cx="230" cy="72" rx="26" ry="18" fill="#f0c8d0" opacity="0.6"/>
      <ellipse cx="214" cy="82" rx="16" ry="12" fill="#f0c8d0" opacity="0.5"/>
      <ellipse cx="246" cy="82" rx="16" ry="12" fill="#f0c8d0" opacity="0.5"/>
      <path d="M80,35 Q85,30 90,35" fill="none" stroke="#b0a898" strokeWidth="1.2"/>
      <path d="M95,28 Q100,23 105,28" fill="none" stroke="#b0a898" strokeWidth="1.2"/>
      <path d="M112,40 Q117,35 122,40" fill="none" stroke="#b0a898" strokeWidth="1.2"/>
      <line x1="10" y1="130" x2="290" y2="130" stroke="#d0c8be" strokeWidth="1"/>
    </svg>
  )
}
