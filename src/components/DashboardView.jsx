import { useState, useRef } from 'react'
import { useDailyInspiration } from '../hooks/useDailyInspiration'
import { useDailyLog } from '../hooks/useDailyLog'
import { useMantra } from '../hooks/useMantra'
import { useMission } from '../hooks/useMission'
import './DashboardView.css'
import CseaTracker from './CseaTracker'
import IcaapTracker from './IcaapTracker'
import GcuPanel from './GcuPanel'
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

// Appointment-schedule hours for the daily spread (5 AM – 11 PM)
const APPT_HOURS = Array.from({ length: 19 }, (_, i) => i + 5)

function hourLabel(h) {
  const period = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12} ${period}`
}

// Map task priority to a classic A/B/C planner marker
const PRIORITY_LETTER = { high: 'A', medium: 'B', low: 'C' }
const PRIORITY_ORDER  = { A: 0, B: 1, C: 2 }
function priorityLetter(p) { return PRIORITY_LETTER[p] || 'B' }

function dayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d - start) / 86400000)
}

const NAV_ITEMS = [
  { key: 'today',    label: 'Today',        color: '#9ca3af', group: 'day' },
  { key: 'week',     label: 'Week',         color: '#9ca3af', group: 'day' },
  { key: 'month',    label: 'Month',        color: '#9ca3af', group: 'day' },
  { key: 'csea',     label: 'CSEA',         color: '#b87a38', group: 'module' },
  { key: 'gcu',      label: 'GCU',          color: '#5a7848', group: 'module' },
  { key: 'hoa',      label: 'HOA',          color: '#4a7a6a', group: 'module' },
  { key: 'icaap',    label: 'iCAAP',        color: '#3a5c4a', group: 'module' },
  { key: 'personal', label: 'Personal',     color: '#6a5a8a', group: 'module' },
  { key: 'matrix',   label: 'Matrix',       color: '#9ca3af', group: 'module' },
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
  masterTasks, onUpdateMasterTask,
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
  cseaCredReports, onAddCseaCredReport, onUpdateCseaCredReport, onDeleteCseaCredReport,
  cseaDelegateCards, onAddCseaDelegateCard, onUpdateCseaDelegateCard, onDeleteCseaDelegateCard,
  icaapItems, onAddIcaapItem, onUpdateIcaapItem, onDeleteIcaapItem,
  asanaIcaapTasks, attendanceRecords, onUpsertAttendance, onUpdateAttendanceNotes,
  icaapNotes, onAddIcaapNote, onDeleteIcaapNote,
  onPushGcuToAsana, gcuPushing,
  books, onAddBook, onUpdateBookStatus, onUpdateBookChapter, onDeleteBook, onImportBooks, onReloadBooks, bookCoverSync, onFetchBookCovers,
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
    .slice()
    .sort((a, b) => PRIORITY_ORDER[priorityLetter(a.priority)] - PRIORITY_ORDER[priorityLetter(b.priority)])
  const done    = (dailyTasks || []).filter(t =>  t.completed)

  // Group scheduled blocks into their appointment hour (clamped to the visible range)
  const apptByHour = {}
  ;(timeBlocks || []).forEach(b => {
    const h = Math.min(23, Math.max(5, b.hour ?? 9))
    ;(apptByHour[h] ||= []).push(b)
  })

  const { tasksByDate: weekTasksByDate, toggleTask: onToggleWeekCardTask } = useWeeklyTasks(userId, selectedDate)
  const weekTasksFlat = Object.values(weekTasksByDate)
    .flat()
    .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))

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

        {/* TODAY — daily planner spread */}
        {section === 'today' && (
          <>
            <div className="fc-spread">
              {/* ── Left page: date + appointment schedule ── */}
              <section className="fc-page fc-page-left">
                <header className="fc-day-head">
                  <div className="fc-day-box">
                    <span className="fc-day-name">{DAY_NAMES[d.getDay()]}</span>
                    <span className="fc-day-num">{d.getDate()}</span>
                  </div>
                  <div className="fc-day-meta">
                    <span className="fc-day-month">{MONTH_NAMES[d.getMonth()]} {d.getFullYear()}</span>
                    <span className="fc-day-count">Day {dayOfYear(d)} · {365 - dayOfYear(d)} remaining</span>
                  </div>
                </header>

                <div className="fc-section-label">Appointment Schedule</div>

                <form className="fc-appt-add" onSubmit={handleAddBlock}>
                  <input
                    className="fc-input"
                    placeholder="New appointment…"
                    value={newBlockTitle}
                    onChange={e => setNewBlockTitle(e.target.value)}
                  />
                  <input className="fc-input fc-time" type="time" value={newBlockStart} onChange={e => setNewBlockStart(e.target.value)} />
                  <input className="fc-input fc-time" type="time" value={newBlockEnd} onChange={e => setNewBlockEnd(e.target.value)} />
                  <button className="fc-btn" type="submit">Add</button>
                </form>

                <div className="fc-appt-grid">
                  {APPT_HOURS.map(hour => (
                    <div key={hour} className="fc-appt-row">
                      <span className="fc-appt-hour">{hourLabel(hour)}</span>
                      <div className="fc-appt-slot">
                        {(apptByHour[hour] || [])
                          .slice()
                          .sort((a, b) => (a.startLabel || '').localeCompare(b.startLabel || ''))
                          .map(b => (
                            <div key={b.id} className="fc-appt-event" style={{ borderLeftColor: b.color || '#6b4423' }}>
                              {(b.startLabel || b.endLabel) && (
                                <span className="fc-appt-time">
                                  {b.startLabel || hourLabel(hour)}{b.endLabel ? `–${b.endLabel}` : ''}
                                </span>
                              )}
                              <span className="fc-appt-title">{b.text || b.title}</span>
                              {b.source !== 'gcal' && (
                                <button className="fc-del" onClick={() => onDeleteBlock(b.id)}>✕</button>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Right page: prioritized task list + daily record ── */}
              <section className="fc-page fc-page-right">
                <div className="fc-section-label fc-section-label-row">
                  <span>Prioritized Daily Task List</span>
                  <span className="fc-count">{pending.length} open</span>
                </div>

                <form className="fc-task-add" onSubmit={handleAddTask}>
                  <input
                    className="fc-input"
                    placeholder="Add a task…"
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                  />
                  <button className="fc-btn" type="submit">Add</button>
                </form>

                <div className="fc-task-list">
                  {pending.map(t => (
                    <div key={t.id} className="fc-task-line">
                      <span className="fc-task-prio">{priorityLetter(t.priority)}</span>
                      <button className="fc-task-mark" onClick={() => onToggleTask(t.id)} aria-label="Complete task">
                        <span className="fc-mark-box" />
                      </button>
                      <span className="fc-task-text">{t.title}</span>
                      <button className="fc-del" onClick={() => onDeleteTask(t.id)}>✕</button>
                    </div>
                  ))}
                  {done.length > 0 && <div className="fc-task-divider">Completed</div>}
                  {done.map(t => (
                    <div key={t.id} className="fc-task-line done">
                      <span className="fc-task-prio">{priorityLetter(t.priority)}</span>
                      <button className="fc-task-mark done" onClick={() => onToggleTask(t.id)} aria-label="Reopen task">
                        <span className="fc-mark-box checked">✓</span>
                      </button>
                      <span className="fc-task-text">{t.title}</span>
                    </div>
                  ))}
                  {pending.length === 0 && done.length === 0 &&
                    <p className="fc-empty">No tasks for today</p>}
                </div>

                <div className="fc-section-label fc-section-label-row">
                  <span>Daily Record of Events</span>
                  <span className="fc-count">{logEntries.length}</span>
                </div>

                <form className="fc-task-add" onSubmit={handleLogAdd}>
                  <input
                    className="fc-input"
                    placeholder="Note an event…"
                    value={logText}
                    onChange={e => setLogText(e.target.value)}
                  />
                  <button className="fc-btn" type="submit">Add</button>
                </form>

                <div className="fc-record">
                  {logEntries.map(entry => (
                    <div key={entry.id} className="fc-record-line">
                      <span className="fc-record-time">{new Date(entry.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                      {editingLogId === entry.id ? (
                        <input
                          autoFocus
                          className="fc-input"
                          value={editingLogText}
                          onChange={e => handleLogChange(entry.id, e.target.value)}
                          onBlur={commitLogEdit}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') commitLogEdit() }}
                        />
                      ) : (
                        <span className="fc-record-text" onClick={() => handleLogEdit(entry)}>{entry.entry}</span>
                      )}
                      <button className="fc-del" onClick={() => deleteLogEntry(entry.id)}>✕</button>
                    </div>
                  ))}
                  {logEntries.length === 0 && <p className="fc-empty">Nothing recorded yet</p>}
                </div>
              </section>
            </div>

            {/* Week — tasks due this week */}
            <div className="fc-week">
              <div className="fc-section-label fc-section-label-row">
                <span>This Week</span>
                <span className="fc-count">{weekTasksFlat.length}</span>
              </div>
              <div className="fc-week-list">
                {weekTasksFlat.map(t => (
                  <div key={t.id} className={`fc-task-line${t.completed ? ' done' : ''}`}>
                    <button className={`fc-task-mark${t.completed ? ' done' : ''}`} onClick={() => onToggleWeekCardTask(t.id, t.due_date)} aria-label="Toggle task">
                      <span className={`fc-mark-box${t.completed ? ' checked' : ''}`}>{t.completed ? '✓' : ''}</span>
                    </button>
                    <span className="fc-week-due">{fmtDueDate(t.due_date)}</span>
                    <span className="fc-task-text">{t.title}</span>
                  </div>
                ))}
                {weekTasksFlat.length === 0 &&
                  <p className="fc-empty">No tasks due this week</p>}
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
              credReports={cseaCredReports || []}
              onAddCredReport={onAddCseaCredReport}
              onUpdateCredReport={onUpdateCseaCredReport}
              onDeleteCredReport={onDeleteCseaCredReport}
              delegateCards={cseaDelegateCards || []}
              onAddDelegateCard={onAddCseaDelegateCard}
              onUpdateDelegateCard={onUpdateCseaDelegateCard}
              onDeleteDelegateCard={onDeleteCseaDelegateCard}
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
              bookCoverSync={bookCoverSync}
              onFetchBookCovers={onFetchBookCovers}
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
