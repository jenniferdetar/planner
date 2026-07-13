import { useState, useRef } from 'react'
import { useDailyInspiration } from '../hooks/useDailyInspiration'
import { useDailyLog } from '../hooks/useDailyLog'
import { useMantra } from '../hooks/useMantra'
import { useMission } from '../hooks/useMission'
import './DashboardView.css'
import CseaTracker from './CseaTracker'
import IcaapTracker from './IcaapTracker'
import GcuPanel from './GcuPanel'
import FinancialPanel from './FinancialPanel'
import WhileYouWereOut from './WhileYouWereOut'
import HoaPanel from './HoaPanel'
import EisenhowerMatrix from './EisenhowerMatrix'
import PersonalPanel from './PersonalPanel'
import WeekView from './WeekView'
import MonthView from './MonthView'
import { sameDay, toDateStr } from '../utils/dateUtils'
import { useWeeklyTasks } from '../hooks/useWeeklyTasks'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const SHORT_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const SHORT_DAY   = ['S','M','T','W','T','F','S']

const CATEGORY_COLORS = {
  'CSEA':                 '#b87a38',
  'LAUSD / iCAAP':        '#3a5c4a',
  'GCU':                  '#5a7848',
  'Household Finances':   '#8a5a3a',
  'Jeff':                 '#7a4a6a',
  'Home':                 '#4a7a6a',
  'Personal Development': '#6a5a8a',
}

const NAV_ITEMS = [
  { key: 'today',    label: 'Today',        color: '#9ca3af', group: 'day' },
  { key: 'week',     label: 'Week',         color: '#9ca3af', group: 'day' },
  { key: 'month',    label: 'Month',        color: '#9ca3af', group: 'day' },
  { key: 'csea',     label: 'CSEA',         color: '#b87a38', group: 'module' },
  { key: 'finance',  label: 'Finance',      color: '#8a5a3a', group: 'module' },
  { key: 'gcu',      label: 'GCU',          color: '#5a7848', group: 'module' },
  { key: 'hoa',      label: 'HOA',          color: '#4a7a6a', group: 'module' },
  { key: 'icaap',    label: 'iCAAP',        color: '#3a5c4a', group: 'module' },
  { key: 'personal', label: 'Personal',     color: '#6a5a8a', group: 'module' },
  { key: 'matrix',   label: 'Matrix',       color: '#9ca3af', group: 'module' },
  { key: 'wywo',     label: 'WYWO',         color: '#9ca3af', group: 'module' },
]

function firstLine(text) {
  return (text || '').split('\n').map(l => l.trim()).filter(Boolean)[0] || ''
}

function fmtTime(ts) {
  if (!ts) return ''
  const [h, m] = ts.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`
}

function fmtDueDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, day] = dateStr.split('-').map(Number)
  const d = new Date(y, m - 1, day)
  return `${DAY_NAMES[d.getDay()].slice(0, 3)} ${SHORT_MONTH[d.getMonth()]} ${d.getDate()}`
}

function DashMiniCal({ selectedDate, onDateChange }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate()
  const cells = []
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, overflow: true })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, overflow: false })
  while (cells.length < 35) cells.push({ day: cells.length - firstDay - daysInMonth + 1, overflow: true })

  function prevMonth() { viewMonth === 0 ? (setViewYear(y => y - 1), setViewMonth(11)) : setViewMonth(m => m - 1) }
  function nextMonth() { viewMonth === 11 ? (setViewYear(y => y + 1), setViewMonth(0)) : setViewMonth(m => m + 1) }

  return (
    <div className="dash-mini-cal">
      <div className="dmc-nav">
        <button className="dmc-nav-btn" onClick={prevMonth}>‹</button>
        <span className="dmc-month-label">{SHORT_MONTH[viewMonth]} {viewYear}</span>
        <button className="dmc-nav-btn" onClick={nextMonth}>›</button>
      </div>
      <div className="dmc-grid">
        {SHORT_DAY.map((d, i) => <span key={i} className="dmc-dow">{d}</span>)}
        {cells.map((cell, i) => {
          if (cell.overflow) return <span key={i} className="dmc-cell overflow" />
          const cellDate = new Date(viewYear, viewMonth, cell.day)
          const isToday = sameDay(cellDate, today)
          const isSel   = sameDay(cellDate, selectedDate)
          return (
            <button key={i}
              className={`dmc-cell${isToday ? ' today' : ''}${isSel ? ' selected' : ''}`}
              onClick={() => onDateChange(cellDate)}
            >{cell.day}</button>
          )
        })}
      </div>
    </div>
  )
}

export default function DashboardView({
  userId, providerToken, selectedDate, onDateChange,
  dailyTasks, onAddTask, onToggleTask, onDeleteTask,
  timeBlocks, onAddBlock, onDeleteBlock,
  calendarBlocks,
  masterTasks, onAddMasterTask, onDeleteMasterTask, onUpdateMasterTask,
  weeklyTasks, onToggleWeeklyTask, onAddWeeklyTask,
  taskCounts, onMonthChange,
  calAuthExpired, onReconnectGoogle, calEventCount,
  cseaIssues, onAddCseaIssue, onUpdateCseaStatus, onDeleteCseaIssue,
  cseaInteractions, onAddCseaInteraction, onUpdateCseaInteraction,
  showArchivedInteractions, onToggleArchivedInteractions,
  asanaCseaTasks, onCompleteAsanaTask, onUpdateAsanaTaskNotes,
  cseaNotes, onAddCseaNote, onDeleteCseaNote,
  cseaIssueNotes, onAddCseaIssueNote, onDeleteCseaIssueNote,
  cseaPcCases, onAddCseaPcCase, onUpdateCseaPcStatus, onDeleteCseaPcCase,
  cseaPcNotes, onAddCseaPcNote, onDeleteCseaPcNote,
  icaapItems, onAddIcaapItem, onUpdateIcaapItem, onDeleteIcaapItem,
  asanaIcaapTasks, attendanceRecords, onUpsertAttendance, onUpdateAttendanceNotes,
  icaapNotes, onAddIcaapNote, onDeleteIcaapNote,
  transactions, onAddTransaction, onDeleteTransaction,
  bills, onAddBill, onToggleBillPaid, onDeleteBill,
  goals, onAddGoal, onUpdateGoalAmount, onDeleteGoal,
  paychecks, onAddPaycheck, onUpdatePaycheckAmount, onTogglePaycheckBill, onDeletePaycheck,
  onPushGcuToAsana, gcuPushing,
  books, onAddBook, onUpdateBookStatus, onUpdateBookChapter, onDeleteBook, onImportBooks, onReloadBooks,
  familyMembers, onAddFamilyMember, onUpdateFamilyMember, onDeleteFamilyMember, onImportFamilyDefaults,
  onSignOut,
}) {
  const [section, setSection] = useState('today')
  const { verse } = useDailyInspiration()
  const { mantra } = useMantra(userId)
  const { mission } = useMission(userId)
  const mantraLine = firstLine(mantra)
  const missionLine = firstLine(mission)
  const [newTask, setNewTask] = useState('')
  const [personalSubTab, setPersonalSubTab] = useState('goals')
  const [newBlockTitle, setNewBlockTitle] = useState('')
  const [newBlockStart, setNewBlockStart] = useState('')
  const [newBlockEnd, setNewBlockEnd] = useState('')

  const d = selectedDate
  const dateStr = selectedDate.toISOString().split('T')[0]
  const { entries: logEntries, addEntry: addLogEntry, deleteEntry: deleteLogEntry, updateEntry: updateLogEntry } = useDailyLog(userId, dateStr)
  const [logText, setLogText] = useState('')
  const [editingLogId, setEditingLogId] = useState(null)
  const [editingLogText, setEditingLogText] = useState('')
  const logEditTimers = useRef({})

  function handleLogAdd(e) {
    e.preventDefault()
    if (!logText.trim()) return
    addLogEntry(logText.trim())
    setLogText('')
  }

  function handleLogEdit(entry) {
    setEditingLogId(entry.id)
    setEditingLogText(entry.entry)
  }

  function handleLogChange(id, val) {
    setEditingLogText(val)
    clearTimeout(logEditTimers.current[id])
    logEditTimers.current[id] = setTimeout(() => updateLogEntry(id, val), 800)
  }

  function commitLogEdit() {
    setEditingLogId(null)
  }

  const pending = (dailyTasks || []).filter(t => !t.completed)
  const done    = (dailyTasks || []).filter(t =>  t.completed)

  const { tasksByDate: weekTasksByDate, toggleTask: onToggleWeekCardTask } = useWeeklyTasks(userId, selectedDate)
  const weekTasksFlat = Object.values(weekTasksByDate)
    .flat()
    .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))

  const categoryMap = {}
  ;(masterTasks || []).forEach(t => {
    const cat = t.category || 'Other'
    if (!categoryMap[cat]) categoryMap[cat] = []
    categoryMap[cat].push(t)
  })

  function handleAddTask(e) {
    e.preventDefault()
    if (!newTask.trim()) return
    onAddTask(newTask.trim(), 'medium')
    setNewTask('')
  }

  function handleAddBlock(e) {
    e.preventDefault()
    if (!newBlockTitle.trim()) return
    const hour = newBlockStart ? parseInt(newBlockStart.split(':')[0], 10) : 9
    onAddBlock(hour, newBlockTitle.trim(), '#1e5799', newBlockStart || null, newBlockEnd || null)
    setNewBlockTitle('')
    setNewBlockStart('')
    setNewBlockEnd('')
  }

  function handleDateChange(date) {
    onDateChange(date)
    setSection('today')
  }

  return (
    <div className="dash-outer">

      {/* ── Sidebar ── */}
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <span className="dash-brand-icon">&#9670;</span>
          <span className="dash-brand-name">My Meridian Planner</span>
        </div>

        {/* Mini calendar */}
        <DashMiniCal selectedDate={selectedDate} onDateChange={handleDateChange} />

        <nav className="dash-nav">
          <div className="dash-nav-group-label">Views</div>
          {NAV_ITEMS.filter(n => n.group === 'day').map(item => (
            <button
              key={item.key}
              className={`dash-nav-item${section === item.key ? ' active' : ''}`}
              style={section === item.key ? { borderLeftColor: '#6b7280' } : {}}
              onClick={() => setSection(item.key)}
            >
              <span className="dash-nav-dot" style={{ background: item.color }} />
              {item.label}
            </button>
          ))}
          <div className="dash-nav-group-label" style={{ marginTop: 10 }}>Modules</div>
          {NAV_ITEMS.filter(n => n.group === 'module').map(item => (
            <button
              key={item.key}
              className={`dash-nav-item${section === item.key ? ' active' : ''}`}
              style={section === item.key ? { borderLeftColor: item.color } : {}}
              onClick={() => setSection(item.key)}
            >
              <span className="dash-nav-dot" style={{ background: item.color }} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="dash-sidebar-foot">
          {(calAuthExpired || calEventCount === 0) &&
            <button className="dash-gcal-btn" onClick={onReconnectGoogle}>Connect Google Cal</button>
          }
          <button className="dash-signout-btn" onClick={onSignOut}>Sign out</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main">

        {/* TODAY */}
        {section === 'today' && (
          <>
            <div className="dash-page-header">
              <h1 className="dash-page-title">{DAY_NAMES[d.getDay()]}, {MONTH_NAMES[d.getMonth()]} {d.getDate()}</h1>
              <span className="dash-page-year">{d.getFullYear()}</span>
            </div>
            <div className="dash-today-grid">
              {/* Tasks */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">Tasks</span>
                  <span className="dash-badge">{pending.length} pending</span>
                </div>
                <form className="dash-add-row" onSubmit={handleAddTask}>
                  <input
                    className="dash-add-input"
                    placeholder="Add a task…"
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                  />
                  <button className="dash-add-btn" type="submit">Add</button>
                </form>
                <div className="dash-task-list">
                  {pending.map(t => (
                    <div key={t.id} className="dash-task-row">
                      <button className="dash-check" onClick={() => onToggleTask(t.id)}>
                        <span className="dash-circle" />
                      </button>
                      <span className="dash-task-text">{t.title}</span>
                      <button className="dash-row-del" onClick={() => onDeleteTask(t.id)}>✕</button>
                    </div>
                  ))}
                  {done.length > 0 && <>
                    <div className="dash-sep">Completed</div>
                    {done.map(t => (
                      <div key={t.id} className="dash-task-row done">
                        <button className="dash-check done" onClick={() => onToggleTask(t.id)}>
                          <span className="dash-circle checked" />
                        </button>
                        <span className="dash-task-text">{t.title}</span>
                      </div>
                    ))}
                  </>}
                  {pending.length === 0 && done.length === 0 &&
                    <p className="dash-empty">No tasks today</p>}
                </div>
              </div>

              {/* Schedule */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">Schedule</span>
                  <span className="dash-badge">{(timeBlocks || []).length} blocks</span>
                </div>
                <form className="dash-block-add-form" onSubmit={handleAddBlock}>
                  <input
                    className="dash-add-input"
                    placeholder="Add a block…"
                    value={newBlockTitle}
                    onChange={e => setNewBlockTitle(e.target.value)}
                  />
                  <input
                    className="dash-block-time-input"
                    type="time"
                    value={newBlockStart}
                    onChange={e => setNewBlockStart(e.target.value)}
                  />
                  <input
                    className="dash-block-time-input"
                    type="time"
                    value={newBlockEnd}
                    onChange={e => setNewBlockEnd(e.target.value)}
                  />
                  <button className="dash-add-btn" type="submit">Add</button>
                </form>
                <div className="dash-sched-list">
                  {(timeBlocks || []).length === 0 &&
                    <p className="dash-empty">No blocks scheduled</p>}
                  {(timeBlocks || [])
                    .slice()
                    .sort((a, b) => (a.hour ?? 0) - (b.hour ?? 0))
                    .map(b => (
                      <div key={b.id} className="dash-block-row" style={{ borderLeftColor: b.color || '#1e5799' }}>
                        <span className="dash-block-time">{b.startLabel || (b.hour != null ? `${b.hour % 12 || 12}:00 ${b.hour >= 12 ? 'PM' : 'AM'}` : '')}–{b.endLabel || ''}</span>
                        <span className="dash-block-title">{b.text || b.title}</span>
                        {b.source !== 'gcal' && <button className="dash-row-del" onClick={() => onDeleteBlock(b.id)}>✕</button>}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Week */}
            <div className="master-tasks-wrap">
              <div className="dash-page-header">
                <h1 className="dash-page-title">Week</h1>
                <span className="dash-badge">{weekTasksFlat.length} total</span>
              </div>
              <div className="dash-card">
                <div className="dash-task-list">
                  {weekTasksFlat.map(t => (
                    <div key={t.id} className={`dash-task-row${t.completed ? ' done' : ''}`}>
                      <button className={`dash-check${t.completed ? ' done' : ''}`} onClick={() => onToggleWeekCardTask(t.id, t.due_date)}>
                        <span className={`dash-circle${t.completed ? ' checked' : ''}`} />
                      </button>
                      <span className="dash-task-due">{fmtDueDate(t.due_date)}</span>
                      <span className="dash-task-text">{t.title}</span>
                    </div>
                  ))}
                  {weekTasksFlat.length === 0 &&
                    <p className="dash-empty">No tasks due this week</p>}
                </div>
              </div>
            </div>

            {/* Master Tasks */}
            <div className="master-tasks-wrap">
              <div className="dash-page-header">
                <h1 className="dash-page-title">Master Tasks</h1>
                <span className="dash-badge">{(masterTasks || []).length} total</span>
              </div>
              <div className="dash-master-grid">
                {Object.entries(categoryMap).map(([cat, tasks]) => {
                  const color = CATEGORY_COLORS[cat] || '#aaa'
                  return (
                    <div key={cat} className="dash-card">
                      <div className="dash-card-header" style={{ borderBottomColor: color }}>
                        <span className="dash-card-title">{cat}</span>
                        <span className="dash-badge">{tasks.length}</span>
                      </div>
                      {tasks.map(t => (
                        <div key={t.id} className="dash-master-row">
                          <span className="dash-master-dot" style={{ background: color }} />
                          <span className="dash-task-text">{t.title}</span>
                          <button className="dash-row-del" onClick={() => onDeleteMasterTask(t.id)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Daily Log */}
            <div className="dash-card dash-card-full">
              <div className="dash-card-header">
                <span className="dash-card-title">Daily Log</span>
                <span className="dash-badge">{logEntries.length} {logEntries.length === 1 ? 'entry' : 'entries'}</span>
              </div>
              <form className="dash-add-row" onSubmit={handleLogAdd}>
                <input
                  className="dash-add-input"
                  placeholder="What did you do today?"
                  value={logText}
                  onChange={e => setLogText(e.target.value)}
                />
                <button className="dash-add-btn" type="submit">Add</button>
              </form>
              <div className="dash-log-list">
                {logEntries.map(entry => (
                  <div key={entry.id} className="dash-task-row">
                    <span className="dash-log-time">{new Date(entry.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    {editingLogId === entry.id ? (
                      <input
                        autoFocus
                        className="dash-add-input"
                        value={editingLogText}
                        onChange={e => handleLogChange(entry.id, e.target.value)}
                        onBlur={commitLogEdit}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') commitLogEdit() }}
                      />
                    ) : (
                      <span className="dash-task-text" style={{ cursor: 'pointer' }} onClick={() => handleLogEdit(entry)}>{entry.entry}</span>
                    )}
                    <button className="dash-row-del" onClick={() => deleteLogEntry(entry.id)}>✕</button>
                  </div>
                ))}
                {logEntries.length === 0 && <p className="dash-empty">Nothing logged yet</p>}
              </div>
            </div>

            {/* Daily inspiration */}
            <div className="dash-inspiration-row">
              <a className="dash-inspiration-card" href="https://www.bible.com/verse-of-the-day" target="_blank" rel="noopener noreferrer">
                <div className="dash-inspiration-header">
                  <span className="dash-inspiration-icon">✝</span>
                  <span className="dash-inspiration-label">Verse of the Day</span>
                </div>
                {verse
                  ? <>
                      <p className="dash-inspiration-text">{verse.text}</p>
                      <span className="dash-inspiration-sub">{verse.reference}</span>
                    </>
                  : <p className="dash-inspiration-loading">Loading…</p>
                }
              </a>
              <button
                type="button"
                className="dash-inspiration-card"
                onClick={() => { setSection('personal'); setPersonalSubTab('mantra') }}
              >
                <div className="dash-inspiration-header">
                  <span className="dash-inspiration-icon">✦</span>
                  <span className="dash-inspiration-label">Mantra &amp; Mission</span>
                </div>
                {(mantraLine || missionLine)
                  ? <>
                      {mantraLine && <p className="dash-inspiration-text">{mantraLine}</p>}
                      {missionLine && <p className="dash-inspiration-text">{missionLine}</p>}
                    </>
                  : <p className="dash-inspiration-loading">Add your mantra &amp; mission in Personal</p>
                }
              </button>
            </div>

            {/* Mobile pill nav — only shown on Today page */}
            <nav className="dash-pill-nav">
              {NAV_ITEMS.filter(i => i.key !== 'today').map(item => (
                <button
                  key={item.key}
                  className="dash-pill-btn"
                  onClick={() => setSection(item.key)}
                >
                  {item.mobileLabel || item.label}
                </button>
              ))}
              <button className="dash-pill-btn dash-pill-logout" onClick={onSignOut}>
                Logout
              </button>
            </nav>
          </>
        )}

        {/* WEEK VIEW */}
        {section === 'week' && (
          <div className="dash-cal-wrap">
            <WeekView
              userId={userId}
              selectedDate={selectedDate}
              onDateChange={d => { handleDateChange(d) }}
              calendarBlocks={calendarBlocks}
              tasksByDate={weeklyTasks}
              onToggleTask={onToggleWeeklyTask}
              onAddTask={onAddWeeklyTask}
            />
          </div>
        )}

        {/* MONTH VIEW */}
        {section === 'month' && (
          <div className="dash-cal-wrap">
            <MonthView
              selectedDate={selectedDate}
              onDateChange={d => { handleDateChange(d) }}
              taskCounts={taskCounts}
              timeBlocks={calendarBlocks || timeBlocks}
              onMonthChange={onMonthChange}
            />
          </div>
        )}

        {/* MODULE PANELS */}
        {section === 'csea' && (
          <div className="dash-panel-wrap">
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
              issueNotes={cseaIssueNotes || {}}
              onAddIssueNote={onAddCseaIssueNote}
              onDeleteIssueNote={onDeleteCseaIssueNote}
              pcCases={cseaPcCases || []}
              onAddPcCase={onAddCseaPcCase}
              onUpdatePcStatus={onUpdateCseaPcStatus}
              onDeletePcCase={onDeleteCseaPcCase}
              pcCaseNotes={cseaPcNotes || {}}
              onAddPcCaseNote={onAddCseaPcNote}
              onDeletePcCaseNote={onDeleteCseaPcNote}
            />
          </div>
        )}
        {section === 'icaap' && (
          <div className="dash-panel-wrap">
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
        {section === 'gcu' && (
          <div className="dash-panel-wrap">
            <GcuPanel onPushToAsana={onPushGcuToAsana} pushing={gcuPushing} />
          </div>
        )}
        {section === 'finance' && (
          <div className="dash-panel-wrap">
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
        {section === 'hoa' && (
          <div className="dash-panel-wrap">
            <HoaPanel userId={userId} />
          </div>
        )}
        {section === 'matrix' && (
          <div className="dash-panel-wrap">
            <EisenhowerMatrix masterTasks={masterTasks || []} onUpdateTask={onUpdateMasterTask} />
          </div>
        )}
        {section === 'personal' && (
          <div className="dash-panel-wrap">
            <PersonalPanel
              userId={userId}
              providerToken={providerToken}
              selectedDate={selectedDate}
              onDateChange={onDateChange}
              books={books || []}
              onAddBook={onAddBook}
              onUpdateBookStatus={onUpdateBookStatus}
              onUpdateBookChapter={onUpdateBookChapter}
              onDeleteBook={onDeleteBook}
              onImportBooks={onImportBooks}
              onReloadBooks={onReloadBooks}
              familyMembers={familyMembers}
              onAddFamilyMember={onAddFamilyMember}
              onUpdateFamilyMember={onUpdateFamilyMember}
              onDeleteFamilyMember={onDeleteFamilyMember}
              onImportFamilyDefaults={onImportFamilyDefaults}
              subTab={personalSubTab}
              onSubTabChange={setPersonalSubTab}
            />
          </div>
        )}
        {section === 'wywo' && (
          <div className="dash-panel-wrap">
            <WhileYouWereOut userId={userId} />
          </div>
        )}

      </main>

      {/* Mobile back-to-today button — shown on all non-Today sections */}
      {section !== 'today' && (
        <button className="dash-mobile-back-btn" onClick={() => setSection('today')}>
          ← Today
        </button>
      )}
    </div>
  )
}
