import { useState, useRef } from 'react'
import { useQuickLinks } from '../hooks/useQuickLinks'
import SalaryAllocationPanel from './SalaryAllocationPanel'
import './IcaapTracker.css'
import { ATTENDANCE_MEMBERS } from '../hooks/useIcaapAttendance'
import { normalizePaylogMonth } from '../hooks/useIcaapDashboard'
import { useIcaapNote } from '../hooks/useIcaapNote'

function IcaapStatsBar({ items }) {
  const nonArchived = items.filter(i => !i.archived)
  const counts = {
    todo: nonArchived.filter(i => i.status === 'To Do').length,
    inProg: nonArchived.filter(i => i.status === 'In Progress').length,
    done: nonArchived.filter(i => i.status === 'Done').length,
    blocked: nonArchived.filter(i => i.status === 'Blocked').length,
  }
  return (
    <div className="icaap-stats">
      <div className="icaap-stat">
        <span className="icaap-stat-num" style={{ color: '#888' }}>{counts.todo}</span>
        <span className="icaap-stat-lbl">To Do</span>
      </div>
      <div className="icaap-stat">
        <span className="icaap-stat-num" style={{ color: '#4a90d9' }}>{counts.inProg}</span>
        <span className="icaap-stat-lbl">In Progress</span>
      </div>
      <div className="icaap-stat">
        <span className="icaap-stat-num" style={{ color: '#5cb85c' }}>{counts.done}</span>
        <span className="icaap-stat-lbl">Done</span>
      </div>
      <div className="icaap-stat">
        <span className="icaap-stat-num" style={{ color: '#e05c5c' }}>{counts.blocked}</span>
        <span className="icaap-stat-lbl">Blocked</span>
      </div>
    </div>
  )
}

export default function IcaapTracker({ userId, items, attendanceRecords = [], onUpsertAttendance, onUpdateAttendanceNotes, icaapNotes = [], onAddIcaapNote, onDeleteIcaapNote }) {
  const { links: quickLinks, addLink, deleteLink } = useQuickLinks(userId, 'icaap')
  const [tab, setTab] = useState('salaryalloc')
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [extraHoursTab, setExtraHoursTab] = useState('profdev')
  const [showArchivedExtraHours, setShowArchivedExtraHours] = useState(false)
  const [notesSubTab, setNotesSubTab] = useState('general')
  const [noteText, setNoteText] = useState('')
  const [noteSource, setNoteSource] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  return (
    <div className="icaap-tracker">
      <IcaapStatsBar items={items} />
      <div className="icaap-tabs">
        <button className={`icaap-tab ${tab === 'salaryalloc' ? 'active' : ''}`} onClick={() => setTab('salaryalloc')}>Salary Allocation</button>
        <button className={`icaap-tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Attendance</button>
        <button className={`icaap-tab ${tab === 'extrahours' ? 'active' : ''}`} onClick={() => setTab('extrahours')}>Extra Hours</button>
        <button className={`icaap-tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Notes {icaapNotes.length > 0 && <span className="icaap-tab-badge">{icaapNotes.length}</span>}</button>
        <button className={`icaap-tab ${tab === 'links' ? 'active' : ''}`} onClick={() => setTab('links')}>Links {quickLinks.length > 0 && <span className="icaap-tab-badge">{quickLinks.length}</span>}</button>
        <button className={`icaap-tab ${tab === 'payroll' ? 'active' : ''}`} onClick={() => setTab('payroll')}>Payroll</button>
      </div>

      {tab === 'salaryalloc' && <SalaryAllocationPanel />}

      {tab === 'attendance' && (
        <AttendancePanel
          date={attendanceDate}
          onDateChange={setAttendanceDate}
          records={attendanceRecords}
          onUpsert={onUpsertAttendance}
          onUpdateNotes={onUpdateAttendanceNotes}
        />
      )}

      {tab === 'extrahours' && (
        <ExtraHoursPanel
          userId={userId}
          extraHoursTab={extraHoursTab}
          setExtraHoursTab={setExtraHoursTab}
          showArchived={showArchivedExtraHours}
          setShowArchived={setShowArchivedExtraHours}
        />
      )}

      {tab === 'notes' && (
        <div className="icaap-notes-section">
          <div className="icaap-extrahours-tabs">
            <button
              className={`icaap-extrahours-tab ${notesSubTab === 'general' ? 'active' : ''}`}
              onClick={() => setNotesSubTab('general')}
            >General</button>
            {NOTES_DATA_TABS.map(t => (
              <button
                key={t.key}
                className={`icaap-extrahours-tab ${notesSubTab === t.key ? 'active' : ''}`}
                onClick={() => setNotesSubTab(t.key)}
              >{t.tabLabel}</button>
            ))}
          </div>

          {notesSubTab === 'general' && (
            <>
              <form className="icaap-notes-form" onSubmit={async (e) => {
                e.preventDefault()
                if (!noteText.trim()) return
                await onAddIcaapNote?.(noteText.trim(), noteSource.trim())
                setNoteText('')
                setNoteSource('')
              }}>
                <textarea
                  className="icaap-textarea"
                  placeholder="Note *"
                  rows={2}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                />
                <div className="icaap-notes-form-row">
                  <input
                    className="icaap-input"
                    placeholder="Source (optional)"
                    value={noteSource}
                    onChange={e => setNoteSource(e.target.value)}
                  />
                  <button type="submit" className="icaap-save">Add</button>
                </div>
              </form>
              <div className="csea-issue-list csea-interactions-grid">
                {icaapNotes.length === 0 && <p className="csea-empty">No notes yet</p>}
                {icaapNotes.map(n => (
                  <IcaapNoteGroup key={n.id} note={n} onDelete={onDeleteIcaapNote} />
                ))}
              </div>
            </>
          )}

          {NOTES_DATA_TABS.filter(t => t.key === notesSubTab).map(t => (
            <IcaapNotePanel key={t.key} userId={userId} noteKey={t.noteKey} title={t.title} color="#7ba7e0" />
          ))}
        </div>
      )}

      {tab === 'links' && (
        <div className="icaap-notes-section">
          <form className="icaap-notes-form" onSubmit={async (e) => {
            e.preventDefault()
            if (!linkTitle.trim() || !linkUrl.trim()) return
            const url = linkUrl.trim().startsWith('http') ? linkUrl.trim() : 'https://' + linkUrl.trim()
            await addLink(linkTitle.trim(), url)
            setLinkTitle('')
            setLinkUrl('')
          }}>
            <input
              className="icaap-input"
              placeholder="Label *"
              value={linkTitle}
              onChange={e => setLinkTitle(e.target.value)}
            />
            <div className="icaap-notes-form-row">
              <input
                className="icaap-input"
                placeholder="URL *"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
              />
              <button type="submit" className="icaap-save">Add</button>
            </div>
          </form>
          <div className="csea-issue-list csea-interactions-grid">
            {quickLinks.length === 0 && <p className="csea-empty">No links yet</p>}
            {quickLinks.map(l => (
              <div key={l.id} className="interaction-group">
                <div className="interaction-group-header">
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="interaction-group-name quick-link-anchor">{l.title}</a>
                  {l.created_at && (
                    <span className="interaction-date-badge">
                      {new Date(l.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  )}
                  <button className="interaction-delete-btn" title="Delete" onClick={() => deleteLink(l.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'payroll' && <PayrollSchedule />}
    </div>
  )
}

function getWeekDates(anchorDate) {
  const d = new Date(anchorDate + 'T12:00:00')
  const day = d.getDay() // 0=Sun
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 5 }, (_, i) => {
    const dd = new Date(monday)
    dd.setDate(monday.getDate() + i)
    return dd.toISOString().split('T')[0]
  })
}

function fmtWeekDay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), date: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) }
}

function AttendancePanel({ date, onDateChange, records, onUpsert, onUpdateNotes }) {
  const weekDates = getWeekDates(date)

  function prevWeek() {
    const d = new Date(weekDates[0] + 'T12:00:00')
    d.setDate(d.getDate() - 7)
    onDateChange(d.toISOString().split('T')[0])
  }
  function nextWeek() {
    const d = new Date(weekDates[0] + 'T12:00:00')
    d.setDate(d.getDate() + 7)
    onDateChange(d.toISOString().split('T')[0])
  }

  const weekLabel = (() => {
    const s = new Date(weekDates[0] + 'T12:00:00')
    const e = new Date(weekDates[4] + 'T12:00:00')
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  })()

  return (
    <div className="attendance-panel">
      <div className="att-week-nav">
        <button className="att-week-btn" onClick={prevWeek}>‹</button>
        <span className="att-week-label">{weekLabel}</span>
        <button className="att-week-btn" onClick={nextWeek}>›</button>
      </div>
      <div className="att-table-wrap">
        <table className="att-table">
          <thead>
            <tr>
              <th className="att-th-name" style={{ color: '#AAAA9E' }}>Member</th>
              {weekDates.map(d => {
                const { day, date: dt } = fmtWeekDay(d)
                return (
                  <th key={d} className="att-th-day">
                    <span className="att-th-weekday">{day}</span>
                    <span className="att-th-date">{dt}</span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {ATTENDANCE_MEMBERS.map(member => (
              <tr key={member} className="att-tr">
                <td className="att-td-name">{member}</td>
                {weekDates.map(d => {
                  const record = records.find(r => r.meeting_date === d && r.member_name === member)
                  const status = record?.status ?? null
                  const timeIn = record?.time_in ?? ''
                  return (
                    <AttendanceCell
                      key={d}
                      status={status}
                      timeIn={timeIn}
                      notes={record?.notes ?? ''}
                      onStatusChange={s => onUpsert?.(d, member, s, record?.notes ?? null, record?.time_in ?? null)}
                      onTimeChange={t => onUpsert?.(d, member, record?.status ?? 'Present', record?.notes ?? null, t)}
                      onNotesChange={n => onUpsert?.(d, member, record?.status ?? 'Present', n, record?.time_in ?? null)}
                    />
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AttendanceCell({ status, timeIn, notes, onStatusChange, onTimeChange, onNotesChange }) {
  const [editingTime, setEditingTime] = useState(false)
  const [timeVal, setTimeVal] = useState(timeIn)
  const [notesVal, setNotesVal] = useState(notes ?? '')
  const [editingNotes, setEditingNotes] = useState(false)

  if (timeVal !== timeIn && !editingTime) setTimeVal(timeIn)
  if (notesVal !== (notes ?? '') && !editingNotes) setNotesVal(notes ?? '')

  function handleTimeChange(e) {
    setTimeVal(e.target.value)
  }

  function commitTime(val) {
    setEditingTime(false)
    onTimeChange(val)
  }

  function handleTimeKeyDown(e) {
    if (e.key === 'Enter') commitTime(timeVal)
    if (e.key === 'Escape') { setTimeVal(timeIn); setEditingTime(false) }
  }

  function handleNotesBlur() {
    setEditingNotes(false)
    onNotesChange(notesVal)
  }

  const COLOR = { Present: '#5cb85c', Absent: '#e05c5c', Excused: '#f0a040' }
  const next = { Present: 'Absent', Absent: 'Excused', Excused: 'Present', null: 'Present' }

  return (
    <td className={`att-td-cell ${status ? status.toLowerCase() : 'empty'}`}>
      <button
        className="att-cell-status"
        style={status ? { background: COLOR[status], color: '#fff' } : {}}
        onClick={() => onStatusChange(next[status] ?? 'Present')}
        title="Click to change"
      >
        {status ?? '—'}
      </button>
      {status && status !== 'Absent' && (
        editingTime ? (
          <input
            className="att-time-input"
            type="time"
            value={timeVal}
            onChange={handleTimeChange}
            onKeyDown={handleTimeKeyDown}
            onBlur={e => {
              // Don't commit on blur if focus moved to AM/PM spinner (relatedTarget inside same input)
              setTimeout(() => {
                if (!document.activeElement?.closest('.att-time-input')) {
                  commitTime(timeVal)
                }
              }, 150)
            }}
            autoFocus
          />
        ) : (
          <button className="att-time-btn" onClick={() => setEditingTime(true)}>
            {timeIn || '+ time'}
          </button>
        )
      )}
      {status && (
        editingNotes ? (
          <textarea
            className="att-notes-input"
            value={notesVal}
            onChange={e => setNotesVal(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Notes…"
            rows={2}
            autoFocus
          />
        ) : (
          <button className="att-notes-btn" onClick={() => setEditingNotes(true)}>
            {notesVal || '+ note'}
          </button>
        )
      )}
    </td>
  )
}

function summarizeNote(text) {
  if (!text) return 'Note'
  const firstLine = text.trim().split('\n')[0]
  const words = firstLine.split(/\s+/).slice(0, 6).join(' ')
  return words.length < firstLine.length ? `${words}…` : words
}

function IcaapNoteGroup({ note: n, onDelete }) {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <div className={`interaction-group${collapsed ? '' : ' expanded'}`}>
      <div className="interaction-group-header" style={{ cursor: 'pointer' }} onClick={() => setCollapsed(c => !c)}>
        <span className="interaction-group-name">{summarizeNote(n.note)}</span>
        {n.created_at && (
          <span className="interaction-date-badge">{new Date(n.created_at).toLocaleDateString()}</span>
        )}
        <span className="interaction-group-toggle">{collapsed ? '▾' : '▴'}</span>
      </div>
      {!collapsed && (
        <div className="interaction-group-items">
          <div className="interaction-card">
            <div className="interaction-header">
              <button className="interaction-delete-btn" title="Delete" onClick={() => onDelete?.(n.id)}>✕</button>
            </div>
            {n.source && <p className="interaction-who-text">Source: {n.source}</p>}
            <p className="interaction-disc-text">{n.note}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function parseTable(content) {
  const lines = content.split('\n').filter(l => l.trim())
  if (lines.length < 2) return null
  const firstTableLine = lines.findIndex(l => l.includes('\t'))
  if (firstTableLine === -1) return null
  const preamble = lines.slice(0, firstTableLine)
  const headers = lines[firstTableLine].split('\t').map(h => h.trim())
  const rows = lines.slice(firstTableLine + 1).map(l => l.split('\t').map(c => c.trim()))
  return { preamble, headers, rows }
}

const EXTRA_HOURS_EVENTS = [
  { key: 'profdev', noteKey: 'profdev-09-27-25', tabLabel: 'Prof. Development 09-27-25', title: 'Professional Development — 09-27-25' },
  { key: 'winterbreak', noteKey: 'winter-break-2025-2026', tabLabel: 'Winter Break 2025–2026', title: 'Winter Break 2025–2026' },
  { key: 'may2026', noteKey: 'may-2026', tabLabel: 'May 2026', title: 'May 2026' },
]

const NOTES_DATA_TABS = [
  { key: 'prc-2026-27', noteKey: 'prc-submission-2026-2027', tabLabel: 'PRC Submission 26-27', title: 'iCAAP Prof Experts PRC Submission (2026-2027)' },
  { key: 'august-2026-prc', noteKey: 'august-2026-prof-expert-submission', tabLabel: 'August 2026 Submission', title: 'August 2026 iCAAP Prof Expert Submission List' },
]

function ExtraHoursPanel({ userId, extraHoursTab, setExtraHoursTab, showArchived, setShowArchived }) {
  const archivedFlags = {
    profdev: useIcaapNote(userId, 'profdev-09-27-25').archived,
    winterbreak: useIcaapNote(userId, 'winter-break-2025-2026').archived,
    may2026: useIcaapNote(userId, 'may-2026').archived,
  }
  const visibleEvents = EXTRA_HOURS_EVENTS.filter(e => showArchived || !archivedFlags[e.key])
  const active = visibleEvents.some(e => e.key === extraHoursTab) ? extraHoursTab : visibleEvents[0]?.key

  return (
    <div className="icaap-extrahours">
      <div className="icaap-extrahours-tabs">
        {visibleEvents.map(e => (
          <button
            key={e.key}
            className={`icaap-extrahours-tab ${active === e.key ? 'active' : ''}`}
            onClick={() => setExtraHoursTab(e.key)}
          >{e.tabLabel}</button>
        ))}
        <button className="icaap-archive-btn icaap-extrahours-archive-toggle" onClick={() => setShowArchived(v => !v)}>
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
      </div>
      {visibleEvents.length === 0 && <p className="icaap-empty">No active Extra Hours events — click "Show Archived" to view past events.</p>}
      {EXTRA_HOURS_EVENTS.filter(e => e.key === active).map(e => (
        <IcaapNotePanel key={e.key} userId={userId} noteKey={e.noteKey} title={e.title} color="#7ba7e0" />
      ))}
    </div>
  )
}

function IcaapNotePanel({ userId, noteKey, title, color }) {
  const { content, handleChange, saved, archived, setArchived } = useIcaapNote(userId, noteKey)
  const [editing, setEditing] = useState(false)
  const table = parseTable(content)

  function deleteRow(rowIndex) {
    const newRows = table.rows.filter((_, i) => i !== rowIndex)
    const newContent = [
      ...table.preamble,
      table.headers.join('\t'),
      ...newRows.map(r => r.join('\t')),
    ].join('\n')
    handleChange(newContent)
  }

  return (
    <div className="icaap-note-panel">
      <div className="icaap-note-header" style={{ borderLeftColor: color }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {title && <span className="icaap-note-panel-title">{title}</span>}
          {archived && <span className="icaap-note-archived-badge">Archived</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {saved && <span className="icaap-note-saved">Saved ✓</span>}
          <button className="icaap-archive-btn" onClick={() => setArchived(!archived)}>
            {archived ? 'Unarchive' : 'Archive'}
          </button>
          <button className="icaap-note-edit-btn" onClick={() => setEditing(e => !e)}>
            {editing ? 'View Table' : 'Edit'}
          </button>
        </div>
      </div>

      {editing || !table ? (
        <textarea
          className="icaap-note-textarea"
          style={{ '--note-color': color }}
          value={content}
          onChange={e => handleChange(e.target.value)}
          placeholder="Paste data from Excel or a web table (tab-separated, first row = column headers)…"
          autoFocus={editing}
        />
      ) : (
        <div className="icaap-table-wrap">
          {table.preamble.length > 0 && (
            <div className="icaap-table-preamble">
              {table.preamble.map((line, i) => <p key={i}>{line}</p>)}
            </div>
          )}
          <table className="icaap-data-table">
            <thead>
              <tr>
                {table.headers.map((h, i) => (
                  <th key={i} style={{ borderBottomColor: color }}>{h}</th>
                ))}
                <th style={{ borderBottomColor: color }} />
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={ri}>
                  {table.headers.map((_, ci) => (
                    <td key={ci}>{row[ci] ?? ''}</td>
                  ))}
                  <td className="icaap-row-delete-cell">
                    <button className="icaap-row-delete-btn" onClick={() => deleteRow(ri)} title="Remove row">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── PayrollSchedule ──────────────────────────────────────────────────────────

const PAYROLL_ROWS = [
  // July 2026
  { period: 'Scheduled Off-cycles',    cutoff: 'Thu, Jul 2, 2026',   pay: 'Thu, Jul 9, 2026',   area: 'Cert & Class Off-cycles' },
  { period: '07/01/2026 – 07/15/2026', cutoff: 'Thu, Jul 16, 2026',  pay: 'Thu, Jul 23, 2026',  area: 'Semi-Monthly' },
  { period: '07/01/2026 – 07/31/2026', cutoff: 'Thu, Jul 23, 2026',  pay: 'Fri, Jul 31, 2026',  area: 'Classified' },
  { period: '07/01/2026 – 07/31/2026', cutoff: 'Tue, Jul 28, 2026',  pay: 'Wed, Aug 5, 2026',   area: 'Certificated' },
  { period: '07/16/2026 – 07/31/2026', cutoff: 'Fri, Jul 31, 2026',  pay: 'Fri, Aug 7, 2026',   area: 'Semi-Monthly' },
  // August 2026
  { period: 'Scheduled Off-cycles',    cutoff: 'Wed, Aug 5, 2026',   pay: 'Wed, Aug 12, 2026',  area: 'Cert & Class Off-cycles' },
  { period: '08/01/2026 – 08/15/2026', cutoff: 'Fri, Aug 14, 2026',  pay: 'Fri, Aug 21, 2026',  area: 'Semi-Monthly' },
  { period: '08/01/2026 – 08/31/2026', cutoff: 'Thu, Aug 20, 2026',  pay: 'Mon, Aug 31, 2026',  area: 'Classified' },
  { period: '08/01/2026 – 08/31/2026', cutoff: 'Mon, Aug 24, 2026',  pay: 'Fri, Sep 4, 2026',   area: 'Certificated' },
  { period: '08/16/2026 – 08/31/2026', cutoff: 'Fri, Aug 28, 2026',  pay: 'Tue, Sep 8, 2026',   area: 'Semi-Monthly' },
  // September 2026
  { period: 'Scheduled Off-cycles',    cutoff: 'Wed, Sep 2, 2026',   pay: 'Fri, Sep 11, 2026',  area: 'Cert & Class Off-cycles' },
  { period: '09/01/2026 – 09/15/2026', cutoff: 'Wed, Sep 16, 2026',  pay: 'Wed, Sep 23, 2026',  area: 'Semi-Monthly' },
  { period: '09/01/2026 – 09/30/2026', cutoff: 'Tue, Sep 22, 2026',  pay: 'Wed, Sep 30, 2026',  area: 'Classified' },
  { period: '09/01/2026 – 09/30/2026', cutoff: 'Fri, Sep 25, 2026',  pay: 'Mon, Oct 5, 2026',   area: 'Certificated' },
  { period: '09/16/2026 – 09/30/2026', cutoff: 'Thu, Oct 1, 2026',   pay: 'Thu, Oct 8, 2026',   area: 'Semi-Monthly' },
  // October 2026
  { period: 'Scheduled Off-cycles',    cutoff: 'Mon, Oct 5, 2026',   pay: 'Tue, Oct 13, 2026',  area: 'Cert & Class Off-cycles' },
  { period: '10/01/2026 – 10/15/2026', cutoff: 'Fri, Oct 16, 2026',  pay: 'Fri, Oct 23, 2026',  area: 'Semi-Monthly' },
  { period: '10/01/2026 – 10/31/2026', cutoff: 'Thu, Oct 22, 2026',  pay: 'Fri, Oct 30, 2026',  area: 'Classified' },
  { period: '10/01/2026 – 10/31/2026', cutoff: 'Wed, Oct 28, 2026',  pay: 'Thu, Nov 5, 2026',   area: 'Certificated' },
  { period: '10/16/2026 – 10/31/2026', cutoff: 'Fri, Oct 30, 2026',  pay: 'Fri, Nov 6, 2026',   area: 'Semi-Monthly' },
  // November 2026
  { period: 'Scheduled Off-cycles',    cutoff: 'Thu, Nov 5, 2026',   pay: 'Thu, Nov 12, 2026',  area: 'Cert & Class Off-cycles' },
  { period: '11/01/2026 – 11/15/2026', cutoff: 'Mon, Nov 16, 2026',  pay: 'Mon, Nov 23, 2026',  area: 'Semi-Monthly' },
  { period: '11/01/2026 – 11/30/2026', cutoff: 'Thu, Nov 19, 2026',  pay: 'Mon, Nov 30, 2026',  area: 'Classified' },
  { period: '11/01/2026 – 11/30/2026', cutoff: 'Fri, Nov 20, 2026',  pay: 'Fri, Dec 4, 2026',   area: 'Certificated' },
  { period: '11/16/2026 – 11/30/2026', cutoff: 'Tue, Dec 1, 2026',   pay: 'Tue, Dec 8, 2026',   area: 'Semi-Monthly' },
  // December 2026
  { period: 'Scheduled Off-cycles',    cutoff: 'Thu, Dec 3, 2026',   pay: 'Fri, Dec 11, 2026',  area: 'Cert & Class Off-cycles' },
  { period: '12/01/2026 – 12/15/2026', cutoff: 'Fri, Dec 11, 2026',  pay: 'Wed, Dec 23, 2026',  area: 'Semi-Monthly' },
  { period: '12/01/2026 – 12/31/2026', cutoff: 'Fri, Dec 11, 2026',  pay: 'Thu, Dec 31, 2026',  area: 'Classified' },
  { period: '12/01/2026 – 12/31/2026', cutoff: 'Fri, Dec 11, 2026',  pay: 'Tue, Jan 5, 2027',   area: 'Certificated' },
  { period: '12/16/2026 – 12/31/2026', cutoff: 'Fri, Dec 11, 2026',  pay: 'Fri, Jan 8, 2027',   area: 'Semi-Monthly' },
  // January 2027
  { period: 'Scheduled Off-cycles',    cutoff: 'Tue, Jan 5, 2027',   pay: 'Tue, Jan 12, 2027',  area: 'Cert & Class Off-cycles' },
  { period: '01/01/2027 – 01/15/2027', cutoff: 'Thu, Jan 14, 2027',  pay: 'Fri, Jan 22, 2027',  area: 'Semi-Monthly' },
  { period: '01/01/2027 – 01/31/2027', cutoff: 'Thu, Jan 21, 2027',  pay: 'Fri, Jan 29, 2027',  area: 'Classified' },
  { period: '01/01/2027 – 01/31/2027', cutoff: 'Thu, Jan 28, 2027',  pay: 'Fri, Feb 5, 2027',   area: 'Certificated' },
  { period: '01/16/2027 – 01/31/2027', cutoff: 'Mon, Feb 1, 2027',   pay: 'Mon, Feb 8, 2027',   area: 'Semi-Monthly' },
  // February 2027
  { period: 'Scheduled Off-cycles',    cutoff: 'Fri, Feb 5, 2027',   pay: 'Fri, Feb 12, 2027',  area: 'Cert & Class Off-cycles' },
  { period: '02/01/2027 – 02/15/2027', cutoff: 'Tue, Feb 16, 2027',  pay: 'Tue, Feb 23, 2027',  area: 'Semi-Monthly' },
  { period: '02/01/2027 – 02/28/2027', cutoff: 'Thu, Feb 18, 2027',  pay: 'Fri, Feb 26, 2027',  area: 'Classified' },
  { period: '02/01/2027 – 02/28/2027', cutoff: 'Thu, Feb 25, 2027',  pay: 'Fri, Mar 5, 2027',   area: 'Certificated' },
  { period: '02/16/2027 – 02/28/2027', cutoff: 'Mon, Mar 1, 2027',   pay: 'Mon, Mar 8, 2027',   area: 'Semi-Monthly' },
  // March 2027
  { period: 'Scheduled Off-cycles',    cutoff: 'Fri, Mar 5, 2027',   pay: 'Fri, Mar 12, 2027',  area: 'Cert & Class Off-cycles' },
  { period: '03/01/2027 – 03/15/2027', cutoff: 'Tue, Mar 16, 2027',  pay: 'Tue, Mar 23, 2027',  area: 'Semi-Monthly' },
  { period: '03/01/2027 – 03/31/2027', cutoff: 'Fri, Mar 19, 2027',  pay: 'Wed, Mar 31, 2027',  area: 'Classified' },
  { period: '03/01/2027 – 03/31/2027', cutoff: 'Fri, Mar 19, 2027',  pay: 'Mon, Apr 5, 2027',   area: 'Certificated' },
  { period: '03/16/2027 – 03/31/2027', cutoff: 'Thu, Apr 1, 2027',   pay: 'Thu, Apr 8, 2027',   area: 'Semi-Monthly' },
  // April 2027
  { period: 'Scheduled Off-cycles',    cutoff: 'Mon, Apr 5, 2027',   pay: 'Mon, Apr 12, 2027',  area: 'Cert & Class Off-cycles' },
  { period: '04/01/2027 – 04/15/2027', cutoff: 'Fri, Apr 16, 2027',  pay: 'Fri, Apr 23, 2027',  area: 'Semi-Monthly' },
  { period: '04/01/2027 – 04/30/2027', cutoff: 'Thu, Apr 22, 2027',  pay: 'Fri, Apr 30, 2027',  area: 'Classified' },
  { period: '04/01/2027 – 04/30/2027', cutoff: 'Tue, Apr 27, 2027',  pay: 'Wed, May 5, 2027',   area: 'Certificated' },
  { period: '04/16/2027 – 04/30/2027', cutoff: 'Fri, Apr 30, 2027',  pay: 'Fri, May 7, 2027',   area: 'Semi-Monthly' },
  // May 2027
  { period: 'Scheduled Off-cycles',    cutoff: 'Wed, May 5, 2027',   pay: 'Wed, May 12, 2027',  area: 'Cert & Class Off-cycles' },
  { period: '05/01/2027 – 05/15/2027', cutoff: 'Fri, May 14, 2027',  pay: 'Fri, May 21, 2027',  area: 'Semi-Monthly' },
  { period: '05/01/2027 – 05/31/2027', cutoff: 'Thu, May 20, 2027',  pay: 'Fri, May 28, 2027',  area: 'Classified' },
  { period: '05/01/2027 – 05/31/2027', cutoff: 'Wed, May 26, 2027',  pay: 'Fri, Jun 4, 2027',   area: 'Certificated' },
  { period: '05/16/2027 – 05/31/2027', cutoff: 'Tue, Jun 1, 2027',   pay: 'Tue, Jun 8, 2027',   area: 'Semi-Monthly' },
  // June 2027
  { period: 'Scheduled Off-cycles',    cutoff: 'Fri, Jun 4, 2027',   pay: 'Fri, Jun 11, 2027',  area: 'Cert & Class Off-cycles' },
  { period: '06/01/2027 – 06/15/2027', cutoff: 'Tue, Jun 15, 2027',  pay: 'Wed, Jun 23, 2027',  area: 'Semi-Monthly' },
  { period: '06/01/2027 – 06/30/2027', cutoff: 'Mon, Jun 21, 2027',  pay: 'Wed, Jun 30, 2027',  area: 'Classified' },
  { period: '06/01/2027 – 06/30/2027', cutoff: 'Wed, Jun 23, 2027',  pay: 'Fri, Jul 2, 2027',   area: 'Certificated' },
  { period: '06/16/2027 – 06/30/2027', cutoff: 'Tue, Jun 29, 2027',  pay: 'Thu, Jul 8, 2027',   area: 'Semi-Monthly' },
  // July 2027
  { period: 'Scheduled Off-cycles',    cutoff: 'Thu, Jul 1, 2027',   pay: 'Mon, Jul 12, 2027',  area: 'Cert & Class Off-cycles' },
]

const AREA_COLORS = {
  'Cert & Class Off-cycles': '#1e3070',
  'Semi-Monthly':            '#3a6a9a',
  'Classified':              '#3a5c4a',
  'Certificated':            '#7a4a28',
}

function PayrollSchedule() {
  const today = new Date()

  function parseDate(str) {
    return new Date(str.replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s*/, ''))
  }

  function isPast(dateStr) {
    return parseDate(dateStr) < today
  }

  function isUpcoming(dateStr) {
    const d = parseDate(dateStr)
    const diff = (d - today) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  }

  return (
    <div className="payroll-panel">
      <div className="payroll-header">
        <span className="payroll-title">2026–2027 CATS Cut-Off &amp; Pay Dates</span>
        <span className="payroll-sub">REV. 06/16/2026</span>
      </div>
      <div className="payroll-legend">
        {Object.entries(AREA_COLORS).map(([area, color]) => (
          <span key={area} className="payroll-legend-item">
            <span className="payroll-legend-dot" style={{ background: color }} />{area}
          </span>
        ))}
      </div>
      <div className="payroll-table-wrap">
        <table className="payroll-table">
          <thead>
            <tr>
              <th>Pay Period</th>
              <th>Cut-Off Date</th>
              <th>Pay Date</th>
              <th>Area</th>
            </tr>
          </thead>
          <tbody>
            {PAYROLL_ROWS.map((row, i) => {
              const cutoffPast    = isPast(row.cutoff)
              const payPast       = isPast(row.pay)
              const cutoffSoon    = !cutoffPast && isUpcoming(row.cutoff)
              const paySoon       = !payPast && isUpcoming(row.pay)
              return (
                <tr key={i} className={cutoffPast && payPast ? 'payroll-row-past' : ''}>
                  <td className="payroll-period">{row.period}</td>
                  <td className={`payroll-cutoff ${cutoffSoon ? 'soon' : cutoffPast ? 'past' : ''}`}>{row.cutoff}</td>
                  <td className={`payroll-pay    ${paySoon   ? 'soon' : payPast   ? 'past' : ''}`}>{row.pay}</td>
                  <td><span className="payroll-area-badge" style={{ background: AREA_COLORS[row.area] + '22', color: AREA_COLORS[row.area], border: `1px solid ${AREA_COLORS[row.area]}55` }}>{row.area}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
