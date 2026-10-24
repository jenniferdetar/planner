import { useState, useRef, useEffect } from 'react'
import { useDailyInspiration } from '../hooks/useDailyInspiration'
import { useDailyLog } from '../hooks/useDailyLog'
import { useMantra } from '../hooks/useMantra'
import { useMission } from '../hooks/useMission'
import './DashboardView.css'
import CseaTracker from './CseaTracker'
import IcaapTracker from './IcaapTracker'
import GcuPanel from './GcuPanel'
import HoaPanel from './HoaPanel'
import FinancialPanel from './FinancialPanel'
import EisenhowerMatrix from './EisenhowerMatrix'
import PersonalPanel from './PersonalPanel'
import WeekView from './WeekView'
import MonthView from './MonthView'
import MeetingsPanel from './MeetingsPanel'
import MissionPanel from './MissionPanel'
import NotesPanel from './NotesPanel'
import JournalPanel from './JournalPanel'
import BinderCalendar from './BinderCalendar'
import { useWeather } from '../hooks/useWeather'
import { useWeeklyTasks } from '../hooks/useWeeklyTasks'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const SHORT_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

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

// Divider-tab palette — earthy planner tones, one per section
const NAV_ITEMS = [
  { key: 'today',    label: 'Today',    color: '#c1614a', group: 'day' },
  { key: 'week',     label: 'Week',     color: '#d99a3f', group: 'day' },
  { key: 'month',    label: 'Month',    color: '#4f9d8b', group: 'day' },
  { key: 'meetings', label: 'Meetings', color: '#5a3a2b', group: 'day' },
  { key: 'csea',     label: 'CSEA',     color: '#b87a38', group: 'module' },
  { key: 'gcu',      label: 'GCU',      color: '#5a7848', group: 'module' },
  { key: 'hoa',      label: 'HOA',      color: '#4a7a6a', group: 'module' },
  { key: 'icaap',    label: 'iCAAP',    color: '#3a5c4a', group: 'module' },
  { key: 'personal', label: 'Personal', color: '#6a5a8a', group: 'module' },
  { key: 'mission',  label: 'Mission',  color: '#3f7fb5', group: 'module' },
  { key: 'notes',    label: 'Notes',    color: '#4a5aa8', group: 'module' },
  { key: 'journal',  label: 'Journal',  color: '#c79a52', group: 'module' },
  { key: 'financial', label: 'Financial', color: '#1f4e79', group: 'module' },
  { key: 'matrix',   label: 'Matrix',   color: '#7d8a9c', group: 'module' },
]

// Tab order (top → bottom in the rail) — drives the page-turn direction
const NAV_ORDER = NAV_ITEMS.map(i => i.key)

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

// Every non-Today section is a two-page binder spread, like Today: the section
// component builds a left page and a right page, and this draws them as two
// sheets either side of the spine. The section title heads the left page.
function PlannerSpread({ title, left, right }) {
  return (
    <div className="fc-spread fc-section-spread">
      <section className="fc-page fc-page-left">
        <h2 className="fc-page-title">{title}</h2>
        <div className="fc-page-body">{left}</div>
      </section>
      <section className="fc-page fc-page-right">
        <div className="fc-page-body">{right}</div>
      </section>
    </div>
  )
}
const spreadTitled = title => (left, right) => <PlannerSpread title={title} left={left} right={right} />

// Line-drawn weather icon for the Today header
function WeatherIcon({ kind = 'sun' }) {
  const sun = (
    <g>
      <circle cx="32" cy="32" r="11" fill="none" stroke="currentColor" strokeWidth="5" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        return <line key={i} x1={32 + Math.cos(a) * 19} y1={32 + Math.sin(a) * 19} x2={32 + Math.cos(a) * 26} y2={32 + Math.sin(a) * 26}
          stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      })}
    </g>
  )
  const cloud = <path d="M18 46h28a10 10 0 0 0 0-20 14 14 0 0 0-27 4 8 8 0 0 0-1 16z" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round" />
  return (
    <svg className="td-wx-icon" viewBox="0 0 64 64" aria-hidden="true">
      {kind === 'sun' && sun}
      {kind === 'partly' && <><g transform="translate(-8 -8) scale(0.8)">{sun}</g>{cloud}</>}
      {(kind === 'cloud' || kind === 'rain' || kind === 'snow') && cloud}
      {kind === 'rain' && [22, 32, 42].map(x => <line key={x} x1={x} y1="52" x2={x - 3} y2="60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />)}
      {kind === 'snow' && [22, 32, 42].map(x => <circle key={x} cx={x} cy="56" r="2.5" fill="currentColor" />)}
    </svg>
  )
}

// Stitching around the leather cover — an SVG so the dashes stay long and even
function BinderStitch() {
  return (
    <svg className="fc-stitch" aria-hidden="true">
      <rect x="0" y="0" width="100%" height="100%" rx="26" ry="26" />
    </svg>
  )
}

// Metal binder rings across the centre spine
function BinderRings() {
  const ring = (
    <svg viewBox="0 0 120 30" className="fc-ring">
      <defs>
        <linearGradient id="fcRingMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9aa3ad" />
          <stop offset="0.35" stopColor="#4b545e" />
          <stop offset="0.7" stopColor="#1f252c" />
          <stop offset="1" stopColor="#5d6670" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="15" rx="52" ry="8" fill="none" stroke="url(#fcRingMetal)" strokeWidth="7" />
      <path d="M22 9.5 Q60 4 98 9.5" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="9" cy="17" r="4.5" fill="#2a3038" />
      <circle cx="111" cy="17" r="4.5" fill="#2a3038" />
    </svg>
  )
  return (
    <div className="fc-binding" aria-hidden="true">
      <div className="fc-spine" />
      {['14%', '21%', '79%', '86%'].map(top => (
        <div key={top} className="fc-ring-slot" style={{ top }}>{ring}</div>
      ))}
    </div>
  )
}

// One edge of the divider-tab rail. Every tab keeps its own slot (so it never
// jumps up or down); tabs before the open one show on the left edge, the open
// tab and everything after it on the right — like flipping through a binder.
function TabRail({ side, section, onSelect }) {
  const curIdx = NAV_ORDER.indexOf(section)
  return (
    <nav className={`fc-tab-rail fc-tab-rail-${side}`}>
      {NAV_ITEMS.map((item, idx) => {
        const here = side === 'left' ? idx < curIdx : idx >= curIdx
        return (
          <div key={item.key} className="fc-tab-slot">
            {here && (
              <button
                className={`fc-tab${section === item.key ? ' active' : ''}`}
                style={{ '--tab': item.color }}
                onClick={() => onSelect(item.key)}
              >
                <span>{item.label}</span>
              </button>
            )}
          </div>
        )
      })}
    </nav>
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

  // Page-turn direction: navigating DOWN the tab list turns the page forward
  // (right → left); navigating UP turns it back (reverse).
  const prevSectionRef = useRef(section)
  const prevIdx = NAV_ORDER.indexOf(prevSectionRef.current)
  const curIdx = NAV_ORDER.indexOf(section)
  const turnDir = curIdx < prevIdx ? 'up' : 'down'
  useEffect(() => { prevSectionRef.current = section }, [section])

  const { verse } = useDailyInspiration()
  const weather = useWeather()
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

  // Days with something on the calendar get a dot in the month calendar
  const eventDates = new Set((calendarBlocks || []).map(b => b.startIso?.slice(0, 10)).filter(Boolean))

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
      <BinderStitch />

      {/* ── Top strip on the leather cover ── */}
      <header className="fc-cover-bar">
        <span className="fc-rail-brand">My Meridian Planner</span>
        <div className="fc-cover-actions">
          {(calAuthExpired || calEventCount === 0) &&
            <button className="fc-rail-btn" onClick={onReconnectGoogle}>Connect Cal</button>}
          <button className="fc-rail-btn" onClick={onSignOut}>Sign out</button>
        </div>
      </header>

      {/* ── Divider tabs already turned past sit on the left edge ── */}
      <TabRail side="left" section={section} onSelect={setSection} />

      <div className="dash-binder">
      {/* ── Main desk ── */}
      <main className="dash-main">
        <div className={`fc-flip fc-dir-${turnDir}`} key={section} style={{ '--tab': NAV_ITEMS.find(i => i.key === section)?.color }}>

        {/* TODAY — daily planner spread */}
        {section === 'today' && (
          <>
            <div className="fc-spread fc-section-spread fc-today">
              {/* ── Left page: the date, month calendar and the day's tasks ── */}
              <section className="fc-page fc-page-left">
                <div className="fc-page-body">
                  <header className="td-head">
                    <div className="td-date">
                      <span className="td-num">{d.getDate()}</span>
                      <span className="td-dow">{DAY_NAMES[d.getDay()]}</span>
                      <span className="td-month">{MONTH_NAMES[d.getMonth()]} {d.getFullYear()}</span>
                    </div>
                    <div className="td-cal">
                      <BinderCalendar compact weekNumbers selectedDate={selectedDate} onSelect={handleDateChange} marked={eventDates} />
                    </div>
                  </header>

                  <form className="td-add" onSubmit={handleAddTask}>
                    <input
                      className="td-add-input"
                      placeholder="Add Task"
                      value={newTask}
                      onChange={e => setNewTask(e.target.value)}
                      aria-label="Add a task"
                    />
                    <button className="bp-plus td-add-btn" type="submit" aria-label="Add task">+</button>
                  </form>

                  <div className="fc-task-list td-lined">
                    {pending.map(t => (
                      <div key={t.id} className="fc-task-line">
                        <span className="fc-task-prio">{priorityLetter(t.priority)}</span>
                        <button className="fc-task-mark" onClick={() => onToggleTask(t.id)} aria-label="Complete task">
                          <span className="fc-mark-box" />
                        </button>
                        <span className="fc-task-text">{t.title}</span>
                        <button className="fc-del" onClick={() => onDeleteTask(t.id)} aria-label="Delete task">✕</button>
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

                  {/* Tasks due this week */}
                  <div className="td-sub">This Week <span className="td-sub-count">{weekTasksFlat.length}</span></div>
                  <div className="fc-week-list td-lined">
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
                <footer className="td-foot">
                  Day {dayOfYear(d)} · {365 - dayOfYear(d)} remaining · {pending.length} open {pending.length === 1 ? 'task' : 'tasks'} · {(timeBlocks || []).length} scheduled
                </footer>
              </section>

              {/* ── Right page: quote + weather, schedule, daily notes ── */}
              <section className="fc-page fc-page-right">
                <div className="fc-page-body">
                  <div className="td-band">
                    <a className="td-quote" href="https://www.bible.com/verse-of-the-day" target="_blank" rel="noopener noreferrer">
                      <span className="td-quote-mark" aria-hidden="true">“</span>
                      {verse ? <>{verse.text} <b>{verse.reference}</b></> : 'Loading the verse of the day…'}
                    </a>
                    <div className="td-weather">
                      <WeatherIcon kind={weather?.icon} />
                      <div className="td-wx-place">
                        <span className="td-wx-city">{weather?.place || 'Los Angeles'}</span>
                        <span className="td-wx-label">{weather?.label || '—'}</span>
                      </div>
                      {weather && (
                        <div className="td-wx-temps">
                          <span>Current {weather.current} °F</span>
                          <span>High {weather.high} °F</span>
                          <span>Low {weather.low} °F</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="td-mantra"
                    onClick={() => setSection('mission')}
                  >
                    {(mantraLine || missionLine)
                      ? <>{mantraLine && <span>{mantraLine}</span>}{missionLine && <span>{missionLine}</span>}</>
                      : <span className="td-muted">Write your mission statement →</span>}
                  </button>

                  <div className="td-sub">Schedule</div>
                  <form className="fc-appt-add" onSubmit={handleAddBlock}>
                    <input
                      className="fc-input"
                      placeholder="New appointment…"
                      value={newBlockTitle}
                      onChange={e => setNewBlockTitle(e.target.value)}
                    />
                    <input className="fc-input fc-time" type="time" value={newBlockStart} onChange={e => setNewBlockStart(e.target.value)} aria-label="Start time" />
                    <input className="fc-input fc-time" type="time" value={newBlockEnd} onChange={e => setNewBlockEnd(e.target.value)} aria-label="End time" />
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
                                  <button className="fc-del" onClick={() => onDeleteBlock(b.id)} aria-label="Delete appointment">✕</button>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="td-sub">Daily Notes <span className="td-sub-count">{logEntries.length}</span></div>
                  <form className="fc-task-add" onSubmit={handleLogAdd}>
                    <input
                      className="fc-input"
                      placeholder="Note something about today…"
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
                        <button className="fc-del" onClick={() => deleteLogEntry(entry.id)} aria-label="Delete note">✕</button>
                      </div>
                    ))}
                    {logEntries.length === 0 && <p className="fc-empty">Nothing noted yet</p>}
                  </div>
                </div>
              </section>
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
            <WeekView
              userId={userId}
              selectedDate={selectedDate}
              onDateChange={d => { handleDateChange(d) }}
              calendarBlocks={calendarBlocks}
              tasksByDate={weeklyTasks}
              onToggleTask={onToggleWeeklyTask}
              onAddTask={onAddWeeklyTask}
              spread={spreadTitled("Week")}
            />
        )}

        {/* MONTH VIEW */}
        {section === 'month' && (
            <MonthView
              selectedDate={selectedDate}
              onDateChange={d => { handleDateChange(d) }}
              taskCounts={taskCounts}
              timeBlocks={calendarBlocks || timeBlocks}
              onMonthChange={onMonthChange}
              spread={spreadTitled("Month")}
            />
        )}

        {section === 'meetings' && (
          <MeetingsPanel userId={userId} selectedDate={selectedDate} spread={spreadTitled('Meetings')} />
        )}
        {section === 'mission' && (
          <MissionPanel userId={userId} spread={spreadTitled('Mission')} />
        )}
        {section === 'notes' && (
          <NotesPanel userId={userId} spread={spreadTitled('Notes')} />
        )}
        {section === 'journal' && (
          <JournalPanel userId={userId} selectedDate={selectedDate} spread={spreadTitled('Journal')} />
        )}

        {/* MODULE PANELS */}
        {section === 'csea' && (
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
              spread={spreadTitled("CSEA")}
            />
        )}
        {section === 'icaap' && (
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
              spread={spreadTitled("iCAAP")}
            />
        )}
        {section === 'gcu' && (
            <GcuPanel onPushToAsana={onPushGcuToAsana} pushing={gcuPushing}
              spread={spreadTitled("GCU")}
            />
        )}
        {section === 'hoa' && (
            <HoaPanel userId={userId}
              spread={spreadTitled("HOA")}
            />
        )}
        {section === 'financial' && (
            <FinancialPanel userId={userId}
              spread={spreadTitled("Financial")}
            />
        )}
        {section === 'matrix' && (
            <EisenhowerMatrix masterTasks={masterTasks || []} onUpdateTask={onUpdateMasterTask}
              spread={spreadTitled("Priority Matrix")}
            />
        )}
        {section === 'personal' && (
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
              spread={spreadTitled("Personal")}
            />
        )}

        </div>{/* /fc-flip */}
      </main>

      <BinderRings />
      </div>{/* /dash-binder */}

      {/* ── The open tab and those still ahead sit on the right edge ── */}
      <TabRail side="right" section={section} onSelect={setSection} />

      {/* Mobile back-to-today button — shown on all non-Today sections */}
      {section !== 'today' && (
        <button className="dash-mobile-back-btn" onClick={() => setSection('today')}>
          ← Today
        </button>
      )}
    </div>
  )
}
