import { useState, useRef, useEffect } from 'react'
import './LeatherDayView.css'
import { TAG_COLORS } from '../hooks/useAsanaTaskTags'
import WeekView from './WeekView'
import MonthView from './MonthView'
import CseaTracker from './CseaTracker'
import IcaapTracker from './IcaapTracker'
import GcuPanel from './GcuPanel'
import FinancialPanel from './FinancialPanel'
import WhileYouWereOut from './WhileYouWereOut'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const SHORT_DAY   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const HOURS = Array.from({ length: 15 }, (_, i) => i + 6)

const ALL_TABS = [
  { key: 'master-tasks', label: 'Master Tasks', color: '#b87a38' },
  { key: 'roles',        label: 'Roles',        color: '#8a4848' },
  { key: 'goals',        label: 'Goals',        color: '#5a7848' },
  { key: 'meetings',     label: 'Meetings',     color: '#3a5c4a' },
  // ── divider here (first nav tab) ──
  { key: 'week',         label: 'Week',         color: '#4a8a78', nav: true },
  { key: 'month',        label: 'Month',        color: '#2d6358', nav: true },
  { key: 'csea',         label: 'CSEA',         color: '#b87a38', nav: true },
  { key: 'icaap',        label: 'iCAAP',        color: '#8a4848', nav: true },
  { key: 'gcu',          label: 'GCU',          color: '#5a7848', nav: true },
  { key: 'finance',      label: 'Finance',      color: '#3a5c4a', nav: true },
  { key: 'wywo',         label: 'WYWO',         color: '#4a3a58', nav: true },
]

const DAY_CONTENT_KEYS = new Set(['daily-tasks','schedule','master-tasks','roles','goals','meetings'])

function viewToTab(view) {
  if (!view || view === 'day') return 'daily-tasks'
  return view
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function formatHour(h) {
  return h > 12 ? `${h - 12}` : h === 0 ? '12' : `${h}`
}

export default function LeatherDayView({
  // current view from App
  view, onViewChange,
  // day props
  selectedDate, onDateChange,
  dailyTasks, onAddTask, onToggleTask, onDeleteTask,
  timeBlocks, onAddBlock, onDeleteBlock,
  masterTasks, onDeleteMasterTask,
  sections, onUpdateSection,
  asanaTasks, asanaTaskTags, onCycleAsanaTaskTag,
  // week props
  userId,
  weeklyTasks, onToggleWeeklyTask, onAddWeeklyTask,
  calendarBlocks,
  // month props
  taskCounts, onMonthChange,
  // csea props
  cseaIssues, onAddCseaIssue, onUpdateCseaStatus, onDeleteCseaIssue,
  cseaInteractions, onAddCseaInteraction, onUpdateCseaInteraction,
  showArchivedInteractions, onToggleArchivedInteractions,
  asanaCseaTasks, onCompleteAsanaTask, onUpdateAsanaTaskNotes,
  cseaNotes, onAddCseaNote, onDeleteCseaNote,
  // icaap props
  icaapItems, onAddIcaapItem, onUpdateIcaapItem, onDeleteIcaapItem,
  asanaIcaapTasks,
  attendanceRecords, onUpsertAttendance, onUpdateAttendanceNotes,
  icaapNotes, onAddIcaapNote, onDeleteIcaapNote,
  // gcu props
  onPushGcuToAsana, gcuPushing,
  calAuthExpired, onReconnectGoogle,
  // finance props
  transactions, onAddTransaction, onDeleteTransaction,
  bills, onAddBill, onToggleBillPaid, onDeleteBill,
  goals, onAddGoal, onUpdateGoalAmount, onDeleteGoal,
  paychecks, onAddPaycheck, onUpdatePaycheckAmount, onTogglePaycheckBill, onDeletePaycheck,
}) {
  const today = new Date()
  const [rightTab, setRightTab] = useState(() => {
    const t = viewToTab(view)
    return (t === 'daily-tasks' || t === 'schedule') ? 'master-tasks' : t
  })
  const [newTaskText, setNewTaskText] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  const [addingBlock, setAddingBlock] = useState(null)
  const [blockText, setBlockText] = useState('')
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')

  // Sync external view changes into tab state
  useEffect(() => {
    const tab = viewToTab(view)
    setRightTab((tab === 'daily-tasks' || tab === 'schedule') ? 'master-tasks' : tab)
  }, [view])

  function handleTabClick(tab) {
    setRightTab(tab.key)
    // sync back to App so sidebar stays in sync
    if (tab.nav) onViewChange?.(tab.key)
    else onViewChange?.('day')
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

  const scheduleProps = {
    selectedDate, timeBlocks: timeBlocks || [], onDeleteBlock,
    addingBlock, blockText, setBlockText,
    blockStart, setBlockStart, blockEnd, setBlockEnd,
    openAddBlock, handleAddBlock, setAddingBlock,
    calAuthExpired, onReconnectGoogle,
  }

  const firstNavKey = ALL_TABS.find(t => t.nav)?.key

  return (
    <div className="leather-outer">
      <div className="leather-binder">

        {/* ── Left page ── */}
        <div className="binder-page left-page">
          <div className="lp-col lp-col-left">
            <div className="lp-date-block">
              <div className="lp-day-num">{selectedDate.getDate()}</div>
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

            <div className="lp-tasks-section">
              <div className="lp-section-title">
                <span>Tasks</span>
                <button className="lp-add-task-btn" onClick={() => setShowAddTask(s => !s)}>+ Add</button>
              </div>
              {showAddTask && (
                <form className="lp-add-form" onSubmit={handleAddTask}>
                  <input autoFocus type="text" placeholder="New task…" value={newTaskText}
                    onChange={e => setNewTaskText(e.target.value)} className="lp-task-input" />
                  <button type="submit" className="lp-save-btn">Add</button>
                  <button type="button" className="lp-cancel-btn" onClick={() => setShowAddTask(false)}>✕</button>
                </form>
              )}
              <div className="lp-task-list">
                {pending.map((t, i) => <LpTaskRow key={t.id} task={t} index={i+1} onToggle={onToggleTask} onDelete={onDeleteTask} tag={t.source === 'asana' ? (asanaTaskTags?.[t.id] ?? null) : null} onCycleTag={t.source === 'asana' ? () => onCycleAsanaTaskTag?.(t.id) : null} />)}
                {done.length > 0 && <>
                  <div className="lp-done-sep">Done</div>
                  {done.map((t, i) => <LpTaskRow key={t.id} task={t} index={pending.length+i+1} onToggle={onToggleTask} onDelete={onDeleteTask} done tag={t.source === 'asana' ? (asanaTaskTags?.[t.id] ?? null) : null} onCycleTag={t.source === 'asana' ? () => onCycleAsanaTaskTag?.(t.id) : null} />)}
                </>}
                {pending.length === 0 && done.length === 0 && !showAddTask &&
                  <p className="lp-empty">No tasks today</p>}
              </div>
            </div>

          </div>

          <div className="lp-col lp-col-right">
            <div className="lp-cal-area">
              <MiniCalendar selectedDate={selectedDate} onDateChange={onDateChange} />
            </div>
            <div className="lp-sched-area">
              <LeftSchedule {...scheduleProps} />
            </div>
          </div>
        </div>

        {/* ── Rings ── */}
        <div className="binder-rings">
          {[0,1,2,3,4,5].map(i => <div key={i} className="ring-pair"><div className="ring" /></div>)}
        </div>

        {/* ── Right page ── */}
        <div className="binder-page right-page">
          <div className="right-page-inner">

            {/* Day content tabs */}
            {rightTab === 'master-tasks' && <MasterTasksPanel masterTasks={masterTasks || []} onDelete={onDeleteMasterTask} />}
            {(rightTab === 'roles' || rightTab === 'goals') && (
              <SectionTextPanel
                key={rightTab}
                sectionKey={rightTab}
                label={ALL_TABS.find(t => t.key === rightTab)?.label}
                color={ALL_TABS.find(t => t.key === rightTab)?.color}
                value={sections?.[rightTab] ?? ''}
                onChange={onUpdateSection}
              />
            )}
            {rightTab === 'meetings' && <SchedulePanel {...scheduleProps} />}

            {/* Nav view tabs — render full view components inside binder */}
            {rightTab === 'week' && (
              <div className="binder-view-wrap">
                <WeekView
                  userId={userId}
                  selectedDate={selectedDate}
                  onDateChange={onDateChange}
                  calendarBlocks={calendarBlocks}
                  tasksByDate={weeklyTasks}
                  onToggleTask={onToggleWeeklyTask}
                  onAddTask={onAddWeeklyTask}
                />
              </div>
            )}
            {rightTab === 'month' && (
              <div className="binder-view-wrap">
                <MonthView
                  selectedDate={selectedDate}
                  onDateChange={(d) => { onDateChange(d); setRightTab('daily-tasks'); onViewChange?.('day') }}
                  taskCounts={taskCounts}
                  timeBlocks={calendarBlocks || timeBlocks}
                  onMonthChange={onMonthChange}
                />
              </div>
            )}
            {rightTab === 'csea' && (
              <div className="binder-view-wrap">
                <CseaTracker
                  userId={userId}
                  issues={cseaIssues || []}
                  onAddIssue={onAddCseaIssue}
                  onUpdateStatus={onUpdateCseaStatus}
                  onDeleteIssue={onDeleteCseaIssue}
                  interactions={cseaInteractions || []}
                  onAddInteraction={onAddCseaInteraction}
                  onUpdateInteraction={onUpdateCseaInteraction}
                  showArchived={showArchivedInteractions}
                  onToggleArchived={onToggleArchivedInteractions}
                  asanaTasks={asanaCseaTasks || []}
                  onCompleteAsanaTask={onCompleteAsanaTask}
                  onUpdateAsanaTaskNotes={onUpdateAsanaTaskNotes}
                  cseaNotes={cseaNotes || []}
                  onAddCseaNote={onAddCseaNote}
                  onDeleteCseaNote={onDeleteCseaNote}
                />
              </div>
            )}
            {rightTab === 'icaap' && (
              <div className="binder-view-wrap">
                <IcaapTracker
                  userId={userId}
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
                  icaapNotes={icaapNotes || []}
                  onAddIcaapNote={onAddIcaapNote}
                  onDeleteIcaapNote={onDeleteIcaapNote}
                />
              </div>
            )}
            {rightTab === 'gcu' && (
              <div className="binder-view-wrap">
                <GcuPanel onPushToAsana={onPushGcuToAsana} pushing={gcuPushing} />
              </div>
            )}
            {rightTab === 'finance' && (
              <div className="binder-view-wrap">
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
              </div>
            )}
            {rightTab === 'wywo' && (
              <div className="binder-view-wrap">
                <WhileYouWereOut userId={userId} />
              </div>
            )}

          </div>

          {/* Right-edge tabs */}
          <div className="right-tabs">
            {ALL_TABS.map((tab) => {
              const isActive = rightTab === tab.key
              const isFirstNav = tab.key === firstNavKey
              return (
                <button
                  key={tab.key}
                  className={`right-tab ${isActive ? 'active' : ''} ${isFirstNav ? 'nav-tab-first' : ''}`}
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

// ── Left col compact schedule ────────────────────────────────────────────────
function LeftSchedule({ selectedDate, timeBlocks, onDeleteBlock, addingBlock, blockText, setBlockText, blockStart, setBlockStart, blockEnd, setBlockEnd, openAddBlock, handleAddBlock, setAddingBlock }) {
  const today = new Date()
  return (
    <div className="lp-sched-list">
      {HOURS.map(hour => {
        const blocksHere = timeBlocks.filter(b => b.hour === hour)
        const isAddingHere = addingBlock === hour
        const isCurrent = sameDay(selectedDate, today) && new Date().getHours() === hour
        return (
          <div key={hour} className={`lp-sched-row ${isCurrent ? 'current' : ''}`}>
            <div className="lp-sched-hour">
              {formatHour(hour)}<span className="lp-sched-ampm">{hour < 12 ? 'a' : 'p'}</span>
            </div>
            <div className="lp-sched-body">
              {isCurrent && <div className="lp-now-line" />}
              {blocksHere.map(b => (
                <div key={b.id} className="lp-sched-block" style={{ background: b.color || '#4a90d9' }}>
                  <span>{b.title || b.text}</span>
                  {b.source !== 'google' && <button className="lp-sched-del" onClick={() => onDeleteBlock?.(b.id)}>✕</button>}
                </div>
              ))}
              {isAddingHere ? (
                <div className="lp-sched-add-form">
                  <input autoFocus type="text" placeholder="Event…" value={blockText}
                    onChange={e => setBlockText(e.target.value)}
                    onKeyDown={e => { if (e.key==='Enter') handleAddBlock(hour); if (e.key==='Escape') setAddingBlock(null) }}
                    className="lp-block-input" />
                  <button className="lp-save-btn sm" onClick={() => handleAddBlock(hour)}>+</button>
                  <button className="lp-cancel-btn" onClick={() => setAddingBlock(null)}>✕</button>
                </div>
              ) : (
                <button className="lp-sched-add-btn" onClick={() => openAddBlock(hour)}>+</button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LpTaskRow({ task, index, onToggle, onDelete, done, tag, onCycleTag }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className={`lp-task-row ${done ? 'done' : ''}`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span className="lp-task-num">{index}.</span>
      <button className="lp-check" onClick={() => onToggle(task.id)}>
        <span className={`lp-circle ${done ? 'checked' : ''}`} />
      </button>
      <span className="lp-task-title">{task.title}</span>
      {onCycleTag && (
        <button className="lp-tag-btn" onClick={onCycleTag}
          style={tag ? { background: TAG_COLORS[tag], color: '#fff' } : {}}>
          {tag || '＋'}
        </button>
      )}
      {hovered && <button className="lp-del-btn" onClick={() => onDelete(task.id)}>✕</button>}
    </div>
  )
}

function LpAsanaRow({ task, onComplete }) {
  const [hovered, setHovered] = useState(false)
  const due = task.due_on || task.due_date
  const dueLabel = due ? new Date(due + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null
  return (
    <div className="lp-asana-row"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button className="lp-check" onClick={() => onComplete?.(task.id)}>
        <span className="lp-circle" />
      </button>
      <span className="lp-asana-title">{task.title || task.name}</span>
      {dueLabel && <span className="lp-asana-due">{dueLabel}</span>}
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

function SchedulePanel({ selectedDate, timeBlocks, onDeleteBlock, addingBlock, blockText, setBlockText, blockStart, setBlockStart, blockEnd, setBlockEnd, openAddBlock, handleAddBlock, setAddingBlock, calAuthExpired, onReconnectGoogle }) {
  const today = new Date()
  return (
    <div className="rp-panel">
      <div className="rp-header">
        <span className="rp-title">Schedule</span>
        <span className="rp-subtitle">{DAY_NAMES[selectedDate.getDay()]}, {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}</span>
      </div>
      {calAuthExpired && (
        <div className="gcal-reconnect-banner">
          <span>Google Calendar disconnected</span>
          <button onClick={onReconnectGoogle}>Reconnect</button>
        </div>
      )}
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
                    {b.calendarName && <span className="rp-block-cal">{b.calendarName}</span>}
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

const CATEGORY_COLORS = {
  'CSEA': '#b87a38',
  'LAUSD / iCAAP': '#3a5c4a',
  'GCU': '#5a7848',
  'Business': '#4a6a8a',
  'Household Finances': '#8a5a3a',
  'Jeff': '#7a4a6a',
  'Home': '#4a7a6a',
  'Personal Development': '#6a5a8a',
}

function MasterTasksPanel({ masterTasks, onDelete }) {
  const categoryMap = {}
  masterTasks.forEach(t => {
    const cat = t.category || 'Other'
    if (!categoryMap[cat]) categoryMap[cat] = []
    categoryMap[cat].push(t)
  })
  const categories = Object.keys(categoryMap)
  return (
    <div className="rp-panel">
      <div className="rp-header">
        <span className="rp-title">Master Tasks</span>
        <span className="rp-subtitle">{masterTasks.length} total</span>
      </div>
      <div className="rp-task-list">
        {masterTasks.length === 0 && <p className="rp-empty">No backlog tasks.</p>}
        {categories.map(cat => {
          const color = CATEGORY_COLORS[cat] || '#aaa'
          return (
            <div key={cat} className="rp-priority-group">
              <div className="rp-priority-label" style={{ color }}>{cat}</div>
              {categoryMap[cat].map(task => <MasterRow key={task.id} task={task} onDelete={onDelete} color={color} />)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

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
