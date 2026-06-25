import { useState } from 'react'
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
import { sameDay } from '../utils/dateUtils'

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
  { key: 'master',   label: 'Master Tasks', color: '#1e5799', group: 'module' },
  { key: 'csea',     label: 'CSEA',         color: '#b87a38', group: 'module' },
  { key: 'finance',  label: 'Finance',      color: '#8a5a3a', group: 'module' },
  { key: 'gcu',      label: 'GCU',          color: '#5a7848', group: 'module' },
  { key: 'hoa',      label: 'HOA',          color: '#4a7a6a', group: 'module' },
  { key: 'icaap',    label: 'iCAAP',        color: '#3a5c4a', group: 'module' },
  { key: 'personal', label: 'Personal',     color: '#6a5a8a', group: 'module' },
  { key: 'matrix',   label: 'Matrix',       color: '#9ca3af', group: 'module' },
  { key: 'wywo',     label: 'WYWO',         color: '#9ca3af', group: 'module' },
]

function fmtTime(ts) {
  if (!ts) return ''
  const [h, m] = ts.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`
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
  userId, selectedDate, onDateChange, onSwitchToBinder,
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
  icaapItems, onAddIcaapItem, onUpdateIcaapItem, onDeleteIcaapItem,
  asanaIcaapTasks, attendanceRecords, onUpsertAttendance, onUpdateAttendanceNotes,
  icaapNotes, onAddIcaapNote, onDeleteIcaapNote,
  transactions, onAddTransaction, onDeleteTransaction,
  bills, onAddBill, onToggleBillPaid, onDeleteBill,
  goals, onAddGoal, onUpdateGoalAmount, onDeleteGoal,
  paychecks, onAddPaycheck, onUpdatePaycheckAmount, onTogglePaycheckBill, onDeletePaycheck,
  onPushGcuToAsana, gcuPushing,
  books, onAddBook, onUpdateBookStatus, onUpdateBookChapter, onDeleteBook, onImportBooks,
  onSignOut,
}) {
  const [section, setSection] = useState('today')
  const [newTask, setNewTask] = useState('')
  const [personalSubTab, setPersonalSubTab] = useState('goals')

  const d = selectedDate
  const pending = (dailyTasks || []).filter(t => !t.completed)
  const done    = (dailyTasks || []).filter(t =>  t.completed)

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

  function handleDateChange(date) {
    onDateChange(date)
    setSection('today')
  }

  return (
    <div className="dash-outer">

      {/* ── Sidebar ── */}
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <span className="dash-brand-name">Planner</span>
          {onSwitchToBinder && (
            <button className="dash-binder-btn" onClick={onSwitchToBinder} title="Switch to binder view">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
          )}
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
          {(calAuthExpired || calEventCount === 0)
            ? <button className="dash-gcal-btn" onClick={onReconnectGoogle}>Connect Google Cal</button>
            : <span className="dash-gcal-ok">📅 {calEventCount} calendar event{calEventCount !== 1 ? 's' : ''}</span>
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
                <div className="dash-sched-list">
                  {(timeBlocks || []).length === 0 &&
                    <p className="dash-empty">No blocks scheduled</p>}
                  {(timeBlocks || [])
                    .slice()
                    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                    .map(b => (
                      <div key={b.id} className="dash-block-row" style={{ borderLeftColor: b.color || '#1e5799' }}>
                        <span className="dash-block-time">{fmtTime(b.start_time)}–{fmtTime(b.end_time)}</span>
                        <span className="dash-block-title">{b.title}</span>
                        <button className="dash-row-del" onClick={() => onDeleteBlock(b.id)}>✕</button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
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

        {/* MASTER TASKS */}
        {section === 'master' && (
          <>
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
                      <span className="dash-card-title" style={{ color }}>{cat}</span>
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
          </>
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
              selectedDate={selectedDate}
              onDateChange={onDateChange}
              books={books || []}
              onAddBook={onAddBook}
              onUpdateBookStatus={onUpdateBookStatus}
              onUpdateBookChapter={onUpdateBookChapter}
              onDeleteBook={onDeleteBook}
              onImportBooks={onImportBooks}
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
    </div>
  )
}
