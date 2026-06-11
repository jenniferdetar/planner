import { useState, useRef, useCallback } from 'react'
import './DailyPlanner.css'
import MonthView from './MonthView'
import CseaTracker from './CseaTracker'
import FinancialPanel from './FinancialPanel'
import IcaapTracker from './IcaapTracker'
import LibraryPanel from './LibraryPanel'
import GcuPanel from './GcuPanel'
import PersonalPanel from './PersonalPanel'
import { TASK_AREAS } from './Sidebar'


const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 6am–10pm
const BLOCK_COLORS = ['#2d7a4f', '#1e4d31', '#4a90d9', '#e05c5c', '#f0a040', '#9b59b6']

function contrastColor(hex) {
  const c = (hex ?? '#4a90d9').replace('#', '')
  const r = parseInt(c.slice(0,2), 16)
  const g = parseInt(c.slice(2,4), 16)
  const b = parseInt(c.slice(4,6), 16)
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160 ? '#1a1a2e' : '#ffffff'
}

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
  userId,
  selectedDate, onDateChange,
  masterTasks, onDeleteMasterTask,
  dailyTasks, timeBlocks,
  onAddTask, onToggleTask, onDeleteTask, onUpdateTaskNotes,
  onAddBlock, onBulkAddMeetings, onDeleteBlock,
  view, onViewChange,
  taskCounts,
  cseaIssues, onAddCseaIssue, onUpdateCseaStatus, onDeleteCseaIssue,
  cseaInteractions, onAddCseaInteraction, onUpdateCseaInteraction,
  asanaCseaTasks, asanaIcaapTasks, onCompleteAsanaTask, onUpdateAsanaTaskNotes,
  onMonthChange,
  transactions, onAddTransaction, onDeleteTransaction,
  bills, onAddBill, onToggleBillPaid, onDeleteBill,
  goals, onAddGoal, onUpdateGoalAmount, onDeleteGoal,
  paychecks, onAddPaycheck, onUpdatePaycheckAmount, onTogglePaycheckBill, onDeletePaycheck,
  icaapItems, onAddIcaapItem, onUpdateIcaapItem, onDeleteIcaapItem,
  attendanceRecords, onUpsertAttendance, onUpdateAttendanceNotes,
  calendarBlocks,
  calAuthExpired, onReconnectGoogle, providerToken,
  books, onAddBook, onUpdateBookStatus, onDeleteBook, onImportBooks,
  onPushGcuToAsana, gcuPushing,
}) {
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [showTaskAdd, setShowTaskAdd] = useState(false)
  const [addingBlock, setAddingBlock] = useState(null)
  const [blockText, setBlockText] = useState('')
  const [blockColor, setBlockColor] = useState(BLOCK_COLORS[0])
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')

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
    const pad = (n) => String(n).padStart(2, '0')
    const st = blockStart || `${pad(hour)}:00`
    const et = blockEnd || `${pad(Math.min(hour + 1, 23))}:00`
    onAddBlock(hour, blockText.trim(), blockColor, st + ':00', et + ':00')
    setBlockText('')
    setBlockColor(BLOCK_COLORS[0])
    setBlockStart('')
    setBlockEnd('')
    setAddingBlock(null)
  }

  function openAddBlock(hour) {
    const pad = (n) => String(n).padStart(2, '0')
    setBlockStart(`${pad(hour)}:00`)
    setBlockEnd(`${pad(Math.min(hour + 1, 23))}:00`)
    setAddingBlock(hour)
  }

  const pending = (dailyTasks || []).filter(t => !t.completed)
  const done = (dailyTasks || []).filter(t => t.completed)

  return (
    <main className="daily-planner">
      {/* Tab strip — always visible at top */}
      <div className="planner-tabs-bar">
        <div className="view-tabs">
          {['csea', 'finance', 'gcu', 'icaap', 'library', 'month', 'personal'].map(v => (
            <button
              key={v}
              className={`view-tab ${view === v ? 'active' : ''}`}
              onClick={() => onViewChange(v)}
            >
              {v === 'csea' ? 'CSEA' : v === 'icaap' ? 'iCAAP' : v === 'gcu' ? 'GCU' : v === 'personal' ? 'Personal' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Day hero — large date + nav, only in day view */}
      {view === 'day' && (
        <div className="day-hero">
          <div className="day-hero-left">
            <button className="nav-btn" onClick={prevDay}>‹</button>
            <div className="day-hero-date">
              <span className="day-hero-num">{selectedDate.getDate()}</span>
              <div className="day-hero-meta">
                <span className="day-hero-dayname">{DAY_NAMES[selectedDate.getDay()]}</span>
                <span className="day-hero-monthyear">{MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}</span>
                {isToday && <span className="today-badge">Today</span>}
                {!isToday && (
                  <button className="today-btn" onClick={() => onDateChange(today)}>Today</button>
                )}
              </div>
            </div>
            <button className="nav-btn" onClick={nextDay}>›</button>
          </div>
        </div>
      )}

      {view === 'icaap' && (
        <IcaapTracker
          items={icaapItems || []}
          onAddItem={onAddIcaapItem}
          onUpdateItem={onUpdateIcaapItem}
          onDeleteItem={onDeleteIcaapItem}
          asanaTasks={asanaIcaapTasks || []}
          onCompleteAsanaTask={onCompleteAsanaTask}
          onUpdateAsanaTaskNotes={onUpdateAsanaTaskNotes}
          attendanceRecords={attendanceRecords || []}
          onUpsertAttendance={onUpsertAttendance}
          onUpdateAttendanceNotes={onUpdateAttendanceNotes}
        />
      )}

      {view === 'csea' && (
        <CseaTracker
          issues={cseaIssues || []}
          onAddIssue={onAddCseaIssue}
          onUpdateStatus={onUpdateCseaStatus}
          onDeleteIssue={onDeleteCseaIssue}
          interactions={cseaInteractions || []}
          onAddInteraction={onAddCseaInteraction}
          onUpdateInteraction={onUpdateCseaInteraction}
          asanaTasks={asanaCseaTasks || []}
          onCompleteAsanaTask={onCompleteAsanaTask}
          onUpdateAsanaTaskNotes={onUpdateAsanaTaskNotes}
        />
      )}

      {view === 'month' && (
        <MonthView
          selectedDate={selectedDate}
          onDateChange={(d) => { onDateChange(d); onViewChange('day') }}
          taskCounts={taskCounts}
          timeBlocks={calendarBlocks || timeBlocks}
          onMonthChange={onMonthChange}
        />
      )}

      {view === 'personal' && <PersonalPanel userId={userId} selectedDate={selectedDate} />}

      {view === 'gcu' && (
        <GcuPanel
          onPushToAsana={onPushGcuToAsana}
          pushing={gcuPushing}
        />
      )}

      {view === 'library' && (
        <LibraryPanel
          books={books || []}
          onAddBook={onAddBook}
          onUpdateStatus={onUpdateBookStatus}
          onDeleteBook={onDeleteBook}
          onImportBooks={onImportBooks}
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
          paychecks={paychecks || []}
          onAddPaycheck={onAddPaycheck}
          onUpdatePaycheckAmount={onUpdatePaycheckAmount}
          onTogglePaycheckBill={onTogglePaycheckBill}
          onDeletePaycheck={onDeletePaycheck}
          userId={userId}
        />
      )}


      <div className="planner-body" style={{ display: (view === 'month' || view === 'csea' || view === 'finance' || view === 'icaap' || view === 'library' || view === 'gcu' || view === 'personal') ? 'none' : undefined }}>
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
                        className={`time-block ${block.source === 'google' ? 'gcal-block' : ''}`}
                        style={{ background: block.color ?? '#4a90d9', color: contrastColor(block.color) }}
                      >
                        <div className="block-main">
                          <span className="block-text">{block.title || block.text}</span>
                          {block.startLabel && (
                            <span className="block-time" style={{ opacity: 0.8 }}>{block.startLabel}–{block.endLabel}</span>
                          )}
                        </div>
                        <div className="block-meta">
                          {block.calendarName && (
                            <span className="block-cal-badge" style={{ color: 'inherit', opacity: 0.75 }}>
                              {block.calendarName}
                            </span>
                          )}
                          {block.source !== 'google' && (
                            <button
                              className="delete-block-btn"
                              style={{ color: 'inherit', opacity: 0.7 }}
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
                          placeholder="Event title…"
                          value={blockText}
                          onChange={e => setBlockText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddBlock(hour)
                            if (e.key === 'Escape') setAddingBlock(null)
                          }}
                          className="block-input"
                        />
                        <input
                          type="time"
                          value={blockStart}
                          onChange={e => setBlockStart(e.target.value)}
                          className="block-time-input"
                        />
                        <span className="block-time-sep">–</span>
                        <input
                          type="time"
                          value={blockEnd}
                          onChange={e => setBlockEnd(e.target.value)}
                          className="block-time-input"
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
                      <button className="add-block-btn" onClick={() => openAddBlock(hour)}>+</button>
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

function UnifiedTaskHub({ masterTasks, dailyTasks, selectedDate, onAddDailyTask, onToggleDailyTask, onDeleteDailyTask, onUpdateTaskNotes, onDeleteMasterTask }) {
  const [activeArea, setActiveArea] = useState('All')
  const [newText, setNewText] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [showAdd, setShowAdd] = useState(false)

  const areas = ['All', ...TASK_AREAS]
  const pending = dailyTasks.filter(t => !t.completed)
  const done = dailyTasks.filter(t => t.completed)

  const filteredMaster = activeArea === 'All'
    ? masterTasks
    : masterTasks.filter(t => (t.category || 'General') === activeArea)

  const filteredPending = activeArea === 'All'
    ? pending
    : pending.filter(t => (t.category || t.project || 'General') === activeArea)

  const filteredDone = activeArea === 'All'
    ? done
    : done.filter(t => (t.category || t.project || 'General') === activeArea)

  function handleAddDaily(e) {
    e.preventDefault()
    if (!newText.trim()) return
    onAddDailyTask(newText.trim(), newPriority)
    setNewText('')
    setNewPriority('medium')
    setShowAdd(false)
  }

  return (
    <div className="task-hub">
      {/* Area filter bar */}
      <div className="task-hub-filters">
        {areas.map(area => (
          <button
            key={area}
            className={`task-hub-filter-btn ${activeArea === area ? 'active' : ''}`}
            onClick={() => setActiveArea(area)}
          >
            {area}
          </button>
        ))}
      </div>

      <div className="task-hub-body">
        {/* Today's tasks */}
        <div className="task-hub-section">
          <div className="task-hub-section-header">
            <span className="task-hub-section-title">Today — {formatDate(selectedDate)}</span>
            <span className="task-count">{filteredPending.length} remaining</span>
          </div>
          <div className="daily-task-list">
            {filteredPending.map((task, i) => (
              <DailyTaskRow key={task.id} task={task} index={i + 1} onToggle={onToggleDailyTask} onDelete={onDeleteDailyTask} onUpdateNotes={onUpdateTaskNotes} />
            ))}
            {filteredDone.length > 0 && (
              <>
                <div className="done-sep"><span>Done</span></div>
                {filteredDone.map((task, i) => (
                  <DailyTaskRow key={task.id} task={task} index={filteredPending.length + i + 1} onToggle={onToggleDailyTask} onDelete={onDeleteDailyTask} onUpdateNotes={onUpdateTaskNotes} />
                ))}
              </>
            )}
            {filteredPending.length === 0 && filteredDone.length === 0 && (
              <p className="task-hub-empty">No tasks for today{activeArea !== 'All' ? ` in ${activeArea}` : ''}</p>
            )}
            {showAdd ? (
              <form className="inline-add-form" onSubmit={handleAddDaily}>
                <span className="check-box placeholder" />
                <input autoFocus type="text" placeholder="New task…" value={newText} onChange={e => setNewText(e.target.value)} className="inline-input" />
                <div className="inline-priority">
                  {['high', 'medium', 'low'].map(p => (
                    <button key={p} type="button" className={`mini-priority-btn ${newPriority === p ? 'active' : ''}`} style={{ '--c': PRIORITY_COLORS[p] }} onClick={() => setNewPriority(p)} />
                  ))}
                </div>
                <button type="submit" className="inline-save">✓</button>
                <button type="button" className="inline-cancel" onClick={() => setShowAdd(false)}>✕</button>
              </form>
            ) : (
              <button className="add-daily-task-btn" onClick={() => setShowAdd(true)}>+ Add today's task</button>
            )}
          </div>
        </div>

        {/* Master backlog */}
        <div className="task-hub-section">
          <div className="task-hub-section-header">
            <span className="task-hub-section-title">Backlog</span>
            <span className="task-count">{filteredMaster.length} tasks</span>
          </div>
          {filteredMaster.length === 0 && (
            <p className="task-hub-empty">No backlog tasks{activeArea !== 'All' ? ` in ${activeArea}` : ''}</p>
          )}
          {['high', 'medium', 'low'].map(priority => {
            const group = filteredMaster.filter(t => t.priority === priority)
            if (!group.length) return null
            return (
              <div key={priority} className="task-hub-priority-group">
                <div className="priority-group-label" style={{ color: PRIORITY_COLORS[priority] }}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </div>
                {group.map(task => (
                  <MasterTaskRow key={task.id} task={task} onDelete={onDeleteMasterTask} />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MasterTaskRow({ task, onDelete }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="task-hub-master-row" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span className="priority-dot" style={{ background: PRIORITY_COLORS[task.priority] || '#ccc' }} />
      <span className="task-text" style={{ flex: 1 }}>{task.title}</span>
      {task.category && <span className="task-hub-area-tag">{task.category}</span>}
      {hovered && <button className="delete-task-btn" onClick={() => onDelete(task.id)}>✕</button>}
    </div>
  )
}

// ── Mini Month ──────────────────────────────────────────────────────────────
function MiniMonth({ selectedDate, onDateChange }) {
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
    <div className="mini-month">
      <div className="mini-month-nav">
        <button className="mini-nav-btn" onClick={prevMonth}>‹</button>
        <span className="mini-month-label">{MONTH_NAMES[viewMonth].slice(0,3)} {viewYear}</span>
        <button className="mini-nav-btn" onClick={nextMonth}>›</button>
      </div>
      <div className="mini-month-grid">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <span key={i} className="mini-dow">{d}</span>
        ))}
        {cells.map((cell, i) => {
          if (cell.overflow) return <span key={i} className="mini-cell overflow" />
          const cellDate = new Date(viewYear, viewMonth, cell.day)
          const isToday = sameDay(cellDate, today)
          const isSelected = sameDay(cellDate, selectedDate)
          return (
            <button
              key={i}
              className={`mini-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
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

function DailyTaskRow({ task, index, onToggle, onDelete, onUpdateNotes }) {
  const [expanded, setExpanded] = useState(false)
  const [notesText, setNotesText] = useState(task.notes || task.description || '')
  const saveTimer = useRef(null)

  function handleNotesChange(e) {
    const val = e.target.value
    setNotesText(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onUpdateNotes?.(task.id, val), 800)
  }

  const dueLabel = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <div className={`asana-row ${task.completed ? 'done' : ''}`}>
      <div className="asana-row-main">
        <span className="asana-row-num">{index}</span>
        <button className="asana-check" onClick={() => onToggle(task.id)}>
          <span className={`asana-circle ${task.completed ? 'checked' : ''}`} />
        </button>
        <span className="asana-title">{task.title}</span>
        <div className="asana-row-meta">
          {dueLabel && <span className="asana-due">{dueLabel}</span>}
          <button className="asana-notes-btn" onClick={() => setExpanded(e => !e)} title="Notes">≡</button>
          <button className="asana-delete-btn" onClick={() => onDelete(task.id)}>✕</button>
        </div>
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
