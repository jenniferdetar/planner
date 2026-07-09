import { useState, useRef } from 'react'
import { useQuickLinks } from '../hooks/useQuickLinks'
import AbsenceForms from './AbsenceForms'
import './IcaapTracker.css'
import { ATTENDANCE_MEMBERS } from '../hooks/useIcaapAttendance'
import { useIcaapDashboard, DASHBOARD_MONTHS, normalizePaylogMonth } from '../hooks/useIcaapDashboard'
import { useIcaapNote } from '../hooks/useIcaapNote'

const CATEGORIES = ['Task', 'Meeting', 'Research', 'Review', 'Report', 'Follow-up', 'Other']
const PRIORITIES = ['Low', 'Medium', 'High']
const STATUSES = ['To Do', 'In Progress', 'Done', 'Blocked']

const STATUS_COLORS = {
  'To Do': '#888',
  'In Progress': '#4a90d9',
  'Done': '#5cb85c',
  'Blocked': '#e05c5c',
}
const PRIORITY_COLORS = { High: '#e05c5c', Medium: '#f0a040', Low: '#5c9ee0' }
const CAT_COLOR = '#9b59b6'

const BASE_ASANA = 'https://app.asana.com/api/1.0'

async function pushToAsana(token, workspaceGid, item) {
  if (!token) throw new Error('No Asana token configured')
  const res = await fetch(`${BASE_ASANA}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        name: item.title,
        notes: item.description || '',
        due_on: item.due_date || null,
        workspace: workspaceGid,
        assignee: 'me',
      },
    }),
  })
  if (!res.ok) throw new Error(`Asana error ${res.status}`)
  const { data } = await res.json()
  return data.gid
}

async function getFirstWorkspace(token) {
  const res = await fetch(`${BASE_ASANA}/workspaces`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Asana workspaces ${res.status}`)
  const { data } = await res.json()
  return data[0]?.gid ?? null
}

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

export default function IcaapTracker({ userId, items, onAddItem, onUpdateItem, onDeleteItem, attendanceRecords = [], onUpsertAttendance, onUpdateAttendanceNotes, icaapNotes = [], onAddIcaapNote, onDeleteIcaapNote }) {
  const { links: quickLinks, addLink, deleteLink } = useQuickLinks(userId, 'icaap')
  const [tab, setTab] = useState('dashboard')
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [extraHoursTab, setExtraHoursTab] = useState('profdev')
  const [showArchivedExtraHours, setShowArchivedExtraHours] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteSource, setNoteSource] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [filter, setFilter] = useState('active')
  const [showForm, setShowForm] = useState(false)
  const [pushingId, setPushingId] = useState(null)
  const [pushResult, setPushResult] = useState({}) // id -> 'ok' | 'err'

  const blankForm = {
    title: '', category: 'Task', priority: 'Medium',
    status: 'To Do', description: '', due_date: '',
  }
  const [form, setForm] = useState(blankForm)

  const token = import.meta.env.VITE_ASANA_TOKEN

  const nonArchived = items.filter(i => !i.archived)
  const archivedItems = items.filter(i => i.archived)
  const done = nonArchived.filter(i => i.status === 'Done')
  const activeItems = nonArchived.filter(i => i.status !== 'Done')
  const displayItems = filter === 'active' ? activeItems
    : filter === 'done' ? done
    : filter === 'archived' ? archivedItems
    : nonArchived

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    await onAddItem({
      title: form.title.trim(),
      category: form.category,
      priority: form.priority,
      status: form.status,
      description: form.description.trim() || null,
      due_date: form.due_date || null,
    })
    setForm(blankForm)
    setShowForm(false)
  }

  async function handlePushToAsana(item) {
    if (!token) { alert('No Asana token set (VITE_ASANA_TOKEN)'); return }
    setPushingId(item.id)
    try {
      const wsGid = await getFirstWorkspace(token)
      if (!wsGid) throw new Error('No Asana workspace found')
      const gid = await pushToAsana(token, wsGid, item)
      await onUpdateItem(item.id, { asana_gid: gid })
      setPushResult(r => ({ ...r, [item.id]: 'ok' }))
    } catch (err) {
      console.error('Asana push failed:', err)
      setPushResult(r => ({ ...r, [item.id]: 'err' }))
    } finally {
      setPushingId(null)
    }
  }

  return (
    <div className="icaap-tracker">
      <IcaapStatsBar items={items} />
      <div className="icaap-tabs">
        <button className={`icaap-tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={`icaap-tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Attendance</button>
        <button className={`icaap-tab ${tab === 'extrahours' ? 'active' : ''}`} onClick={() => setTab('extrahours')}>Extra Hours</button>
        <button className={`icaap-tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>Tasks</button>
        <button className={`icaap-tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Notes {icaapNotes.length > 0 && <span className="icaap-tab-badge">{icaapNotes.length}</span>}</button>
        <button className={`icaap-tab ${tab === 'links' ? 'active' : ''}`} onClick={() => setTab('links')}>Links {quickLinks.length > 0 && <span className="icaap-tab-badge">{quickLinks.length}</span>}</button>
        <button className={`icaap-tab ${tab === 'payroll' ? 'active' : ''}`} onClick={() => setTab('payroll')}>Payroll</button>
        <button className={`icaap-tab ${tab === 'forms' ? 'active' : ''}`} onClick={() => setTab('forms')}>Forms</button>
      </div>

      {tab === 'dashboard' && <IcaapDashboard />}

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
                  <button className="interaction-delete-btn" title="Delete" onClick={() => deleteLink(l.id)}>✕</button>
                </div>
                {l.created_at && (
                  <div className="interaction-group-items">
                    <div className="interaction-card">
                      <div className="interaction-header">
                        <span className="interaction-date-badge">
                          {new Date(l.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'payroll' && <PayrollSchedule />}

      {tab === 'forms' && <AbsenceForms />}

      <div className="icaap-toolbar" style={{ display: (tab === 'attendance' || tab === 'extrahours' || tab === 'notes' || tab === 'links' || tab === 'payroll' || tab === 'forms') ? 'none' : undefined }}>
        {tab === 'list' ? (
          <div className="icaap-filter-pills">
            {['active', 'done', 'all', 'archived'].map(f => (
              <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}{f === 'archived' && archivedItems.length > 0 ? ` (${archivedItems.length})` : ''}
              </button>
            ))}
          </div>
        ) : <span />}
        <button className="icaap-add-btn" onClick={() => setShowForm(true)}>+ Add Item</button>
      </div>

      {showForm && tab !== 'attendance' && tab !== 'notes' && (
        <form className="icaap-form" onSubmit={handleAdd}>
          <input className="icaap-input" placeholder="Title *" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
          <div className="icaap-form-row">
            <div className="icaap-type-btns">
              {CATEGORIES.map(c => (
                <button key={c} type="button"
                  className={`type-btn ${form.category === c ? 'active' : ''}`}
                  style={{ '--tc': CAT_COLOR }}
                  onClick={() => setForm(f => ({ ...f, category: c }))}
                >{c}</button>
              ))}
            </div>
          </div>
          <textarea className="icaap-textarea" placeholder="Description" rows={3} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="icaap-form-row">
            <input className="icaap-input icaap-date-input" type="date" value={form.due_date}
              onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </div>
          <div className="icaap-form-row">
            <div className="icaap-priority-btns">
              {PRIORITIES.map(p => (
                <button key={p} type="button"
                  className={`priority-btn ${form.priority === p ? 'active' : ''}`}
                  style={{ '--pc': PRIORITY_COLORS[p] }}
                  onClick={() => setForm(f => ({ ...f, priority: p }))}
                >{p}</button>
              ))}
            </div>
            <div className="icaap-status-btns">
              {STATUSES.map(s => (
                <button key={s} type="button"
                  className={`status-btn ${form.status === s ? 'active' : ''}`}
                  style={{ '--sc': STATUS_COLORS[s] }}
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                >{s}</button>
              ))}
            </div>
          </div>
          <div className="icaap-form-actions">
            <button type="button" className="icaap-cancel" onClick={() => { setShowForm(false); setForm(blankForm) }}>Cancel</button>
            <button type="submit" className="icaap-save">Save</button>
          </div>
        </form>
      )}

      {tab === 'list' && (
        <div className="icaap-list">
          {displayItems.length === 0 && (
            <p className="icaap-empty">No items yet — add one above</p>
          )}
          {displayItems.map(item => (
            <ItemCard key={item.id} item={item}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onPushToAsana={handlePushToAsana}
              pushing={pushingId === item.id}
              pushResult={pushResult[item.id]}
            />
          ))}
        </div>
      )}
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

function ItemCard({ item, onUpdateItem, onDeleteItem, onPushToAsana, pushing, pushResult }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`icaap-card ${item.status === 'Done' ? 'done' : ''}`}>
      <div className="icaap-card-header" onClick={() => setExpanded(e => !e)}>
        <span className="icaap-cat-badge" style={{ background: '#9b59b622', color: CAT_COLOR }}>
          {item.category}
        </span>
        <span className="icaap-card-title">{item.title}</span>
        <span className="icaap-card-priority" style={{ color: PRIORITY_COLORS[item.priority] }}>
          {item.priority}
        </span>
        <span className="icaap-card-status" style={{ background: STATUS_COLORS[item.status] + '22', color: STATUS_COLORS[item.status] }}>
          {item.status}
        </span>
        <span className="icaap-chevron">{expanded ? '▾' : '▸'}</span>
      </div>

      {expanded && (
        <div className="icaap-card-body">
          {item.due_date && <div className="icaap-detail">📅 Due {item.due_date}</div>}
          {item.description && <div className="icaap-desc">{item.description}</div>}

          <div className="icaap-card-actions">
            <div className="icaap-status-change-btns">
              {STATUSES.filter(s => s !== item.status).map(s => (
                <button key={s} className="status-change-btn" style={{ '--sc': STATUS_COLORS[s] }}
                  onClick={() => onUpdateItem(item.id, { status: s })}>
                  → {s}
                </button>
              ))}
            </div>
            <div className="icaap-card-right-actions">
              {item.asana_gid ? (
                <span className="asana-synced-badge">✓ In Asana</span>
              ) : (
                <button
                  className={`asana-push-btn ${pushing ? 'pushing' : ''} ${pushResult === 'err' ? 'err' : ''}`}
                  onClick={() => onPushToAsana(item)}
                  disabled={pushing}
                >
                  {pushing ? '…' : pushResult === 'ok' ? '✓ Pushed' : pushResult === 'err' ? '✗ Failed' : '↑ Asana'}
                </button>
              )}
              <button className="icaap-archive-btn" onClick={() => onUpdateItem(item.id, { archived: !item.archived })}>
                {item.archived ? 'Unarchive' : 'Archive'}
              </button>
              <button className="icaap-delete-btn" onClick={() => onDeleteItem(item.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── iCAAP Dashboard ───────────────────────────────────────────────────────────

function DashCell({ value, onSave, type = 'text' }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value ?? '')

  if (!editing && val !== (value ?? '')) setVal(value ?? '')

  function commit(v) {
    setEditing(false)
    if (v !== (value ?? '')) onSave(v)
  }

  return editing ? (
    <input
      className="dash-cell-input"
      type={type}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={() => commit(val)}
      onKeyDown={e => {
        if (e.key === 'Enter') commit(val)
        if (e.key === 'Escape') { setVal(value ?? ''); setEditing(false) }
      }}
      autoFocus
    />
  ) : (
    <span className="dash-cell-view" onClick={value ? undefined : () => setEditing(true)} style={value ? { cursor: 'default' } : undefined}>
      {value || '—'}
    </span>
  )
}

const CURRENT_MONTH = (() => {
  const keys = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return keys[new Date().getMonth()]
})()

function parsePaylogCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (!lines.length) return { parsed: [], skipped: [] }

  // Detect delimiter: tab-separated if first line has tabs
  const isTab = lines[0].includes('\t')
  const delim = isTab ? '\t' : ','

  // Skip header row if first cell looks like a header (non-date text)
  const firstCell = lines[0].split(delim)[0].trim().toLowerCase()
  const start = /^[a-z]/.test(firstCell) ? 1 : 0

  const parsed = []
  const skipped = []
  for (let i = start; i < lines.length; i++) {
    let cols
    if (isTab) {
      cols = lines[i].split('\t').map(c => c.trim())
    } else {
      // Handle quoted CSV fields
      cols = []
      let cur = '', inQuote = false
      for (const ch of lines[i] + ',') {
        if (ch === '"') { inQuote = !inQuote }
        else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = '' }
        else cur += ch
      }
    }

    let name, monthRaw, dateValue
    if (isTab && cols.length <= 5) {
      // 3-column tab format: date | name | month
      dateValue = cols[0]
      name = cols[1]
      monthRaw = cols[2]
    } else {
      // Full form CSV export format
      name = cols[4]       // Col E
      monthRaw = cols[9]   // Col J
      dateValue = cols[2]  // Col C
    }

    if (!name || !monthRaw) { skipped.push(i + 1); continue }
    const monthCol = normalizePaylogMonth(monthRaw)
    if (!monthCol) { skipped.push(i + 1); continue }
    const properName = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    parsed.push({ name: properName, monthCol, dateValue, monthRaw })
  }
  return { parsed, skipped }
}

function ImportModal({ onClose, onImport }) {
  const [csv, setCsv] = useState('')
  const [preview, setPreview] = useState(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  function handleParse() {
    const { parsed, skipped } = parsePaylogCSV(csv)
    setPreview({ parsed, skipped })
    setResult(null)
  }

  async function handleImport() {
    if (!preview?.parsed?.length) return
    setImporting(true)
    const errors = await onImport(preview.parsed)
    setResult({ count: preview.parsed.length - errors.length, errors })
    setImporting(false)
    setPreview(null)
    setCsv('')
  }

  return (
    <div className="import-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="import-modal">
        <div className="import-modal-header">
          <span className="import-modal-title">Import Paylog CSV</span>
          <button className="import-modal-close" onClick={onClose}>×</button>
        </div>

        {result ? (
          <div className="import-result">
            <p className="import-result-ok">✓ Imported {result.count} rows successfully.</p>
            {result.errors.length > 0 && (
              <div className="import-result-errors">
                <p>Could not match {result.errors.length} names:</p>
                <ul>{result.errors.map((e, i) => <li key={i}>{e.name}</li>)}</ul>
              </div>
            )}
            <button className="import-done-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <p className="import-instructions">
              Export the Pay Log Submission form as CSV, then paste below.<br />
              Pulls: <strong>Col C</strong> (submission date) · <strong>Col E</strong> (name) · <strong>Col J</strong> (month)
            </p>
            <textarea
              className="import-textarea"
              placeholder="Paste CSV data here…"
              value={csv}
              onChange={e => { setCsv(e.target.value); setPreview(null) }}
              rows={8}
            />
            <button className="import-parse-btn" onClick={handleParse} disabled={!csv.trim()}>
              Preview Import
            </button>

            {preview && (
              <div className="import-preview">
                <p className="import-preview-label">
                  {preview.parsed.length} rows ready to import
                  {preview.skipped.length > 0 && ` · ${preview.skipped.length} rows skipped (unrecognized month or missing name)`}
                </p>
                <div className="import-preview-table-wrap">
                  <table className="import-preview-table">
                    <thead>
                      <tr>
                        <th>Employee Name</th>
                        <th>Month Column</th>
                        <th>Submission Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.parsed.map((r, i) => (
                        <tr key={i}>
                          <td>{r.name}</td>
                          <td>{r.monthCol}</td>
                          <td>{r.dateValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="import-modal-actions">
                  <button className="import-cancel-btn" onClick={() => setPreview(null)}>Back</button>
                  <button className="import-confirm-btn" onClick={handleImport} disabled={importing}>
                    {importing ? 'Importing…' : `Import ${preview.parsed.length} rows`}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const HOURS_MONTH_KEYS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun']

function parseHoursCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (!lines.length) return { parsed: [], skipped: [] }
  const isTab = lines[0].includes('\t')
  const split = line => isTab ? line.split('\t').map(c => c.trim()) : line.split(',').map(c => c.trim())

  // Detect header row: first cell is "Row Labels" or non-numeric
  const header = split(lines[0])
  const hasHeader = /row label|name|employee/i.test(header[0]) || isNaN(Number(header[1]))
  const colHeaders = hasHeader ? header.slice(1).map(h => {
    const abbr = h.trim().split(/\s+/)[0]
    return HOURS_MONTH_KEYS.find(k => k.toLowerCase() === abbr.toLowerCase()) || null
  }) : HOURS_MONTH_KEYS.map((_, i) => HOURS_MONTH_KEYS[i])

  const parsed = [], skipped = []
  const start = hasHeader ? 1 : 0
  for (let i = start; i < lines.length; i++) {
    const cols = split(lines[i])
    const rawName = cols[0]
    if (!rawName) { skipped.push(i + 1); continue }
    const name = rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    const updates = {}
    for (let j = 1; j < cols.length; j++) {
      const key = colHeaders[j - 1]
      if (!key) continue
      const val = parseFloat(cols[j])
      if (!isNaN(val)) updates[key] = val
    }
    if (!Object.keys(updates).length) { skipped.push(i + 1); continue }
    parsed.push({ name, updates })
  }
  return { parsed, skipped }
}

function ImportHoursModal({ onClose, onImport }) {
  const [csv, setCsv] = useState('')
  const [preview, setPreview] = useState(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  function handleParse() {
    const { parsed, skipped } = parseHoursCSV(csv)
    setPreview({ parsed, skipped })
    setResult(null)
  }

  async function handleImport() {
    if (!preview?.parsed?.length) return
    setImporting(true)
    const errors = await onImport(preview.parsed)
    setResult({ count: preview.parsed.length - errors.length, errors })
    setImporting(false)
    setPreview(null)
    setCsv('')
  }

  return (
    <div className="import-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="import-modal">
        <div className="import-modal-header">
          <span className="import-modal-title">Import Hours Worked</span>
          <button className="import-modal-close" onClick={onClose}>×</button>
        </div>
        {result ? (
          <div className="import-result">
            <p className="import-result-ok">✓ Imported {result.count} rows successfully.</p>
            {result.errors.length > 0 && (
              <div className="import-result-errors">
                <p>Could not match {result.errors.length} names:</p>
                <ul>{result.errors.map((e, i) => <li key={i}>{e.name}</li>)}</ul>
              </div>
            )}
            <button className="import-done-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <p className="import-instructions">
              Paste the pivot table with <strong>Employee Name</strong> in column 1 and month columns (Jul–Jan).<br />
              Tab-separated or comma-separated both work.
            </p>
            <textarea
              className="import-textarea"
              placeholder="Paste hours data here…"
              value={csv}
              onChange={e => { setCsv(e.target.value); setPreview(null) }}
              rows={8}
            />
            <button className="import-parse-btn" onClick={handleParse} disabled={!csv.trim()}>
              Preview Import
            </button>
            {preview && (
              <div className="import-preview">
                <p className="import-preview-label">
                  {preview.parsed.length} rows ready to import
                  {preview.skipped.length > 0 && ` · ${preview.skipped.length} rows skipped`}
                </p>
                <div className="import-preview-table-wrap">
                  <table className="import-preview-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        {HOURS_MONTH_KEYS.map(k => <th key={k}>{k}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.parsed.map((r, i) => (
                        <tr key={i}>
                          <td>{r.name}</td>
                          {HOURS_MONTH_KEYS.map(k => <td key={k}>{r.updates[k] ?? '—'}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="import-modal-actions">
                  <button className="import-cancel-btn" onClick={() => setPreview(null)}>Back</button>
                  <button className="import-confirm-btn" onClick={handleImport} disabled={importing}>
                    {importing ? 'Importing…' : `Import ${preview.parsed.length} rows`}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function IcaapDashboard() {
  const { rows, loading, importPaylogRows, importHoursRows, updateHoursWorked, updateApprovalDate, updatePaylogDate, setArchived } = useIcaapDashboard()
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH)
  const [search, setSearch] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [showImportHours, setShowImportHours] = useState(false)
  const [missingOnly, setMissingOnly] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const month = DASHBOARD_MONTHS.find(m => m.key === selectedMonth)
  const archivedCount = rows.filter(r => r.archived).length
  const filtered = rows
    .filter(r => showArchived ? r.archived : !r.archived)
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  const submitted = filtered.filter(r => !!r.hw[month?.key]).length
  const paylogged = filtered.filter(r => !!r.ps[month?.paylogKey]).length
  const approved  = filtered.filter(r => !!r.ad[month?.key]).length
  const total = filtered.length

  const displayRows = missingOnly
    ? filtered.filter(r => !r.hw[month?.key] || !r.ps[month?.paylogKey] || !r.ad[month?.key])
    : filtered

  return (
    <div className="dash-panel">
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={importPaylogRows}
        />
      )}
      {showImportHours && (
        <ImportHoursModal
          onClose={() => setShowImportHours(false)}
          onImport={importHoursRows}
        />
      )}
      <div className="dash-toolbar">
        <div className="dash-month-pills">
          {DASHBOARD_MONTHS.map(m => (
            <button
              key={m.key}
              className={`dash-month-pill ${selectedMonth === m.key ? 'active' : ''}`}
              onClick={() => setSelectedMonth(m.key)}
            >{m.label}</button>
          ))}
        </div>
        <div className="dash-toolbar-bottom-row">
          <input
            className="dash-search"
            placeholder="Search employee…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className={`filter-pill ${missingOnly ? 'active' : ''}`}
            onClick={() => setMissingOnly(m => !m)}
            title="Show only employees missing info for this month"
          >
            Missing info {missingOnly && `(${displayRows.length})`}
          </button>
          <button
            className={`filter-pill ${showArchived ? 'active' : ''}`}
            onClick={() => setShowArchived(a => !a)}
          >
            {showArchived ? `Archived (${archivedCount})` : 'Show Archived'}
          </button>
          <button className="dash-import-btn" onClick={() => setShowImportHours(true)}>↑ Import Hours</button>
          <button className="dash-import-btn" onClick={() => setShowImport(true)}>↑ Import Paylog</button>
        </div>
      </div>

      <div className="dash-summary">
        <div className="dash-stat-spacer" />
        <div className="dash-stat"><span className="dash-stat-num" style={{ color: '#4a7a6a' }}>{submitted}/{total}</span></div>
        <div className="dash-stat"><span className="dash-stat-num" style={{ color: '#3d6a5a' }}>{paylogged}/{total}</span></div>
        <div className="dash-stat"><span className="dash-stat-num" style={{ color: '#2d5560' }}>{approved}/{total}</span></div>
      </div>

      {loading ? (
        <p className="icaap-empty">Loading…</p>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th className="dash-th-name" style={{ color: '#AAAA9E' }}>Employee</th>
                <th className="dash-th" style={{ color: '#AAAA9E' }}>Hours Worked</th>
                <th className="dash-th" style={{ color: '#AAAA9E' }}>Paylog Submitted</th>
                <th className="dash-th" style={{ color: '#AAAA9E' }}>Approved</th>
                <th className="dash-th" style={{ color: '#AAAA9E' }}></th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map(r => (
                <tr key={r.name} className="dash-tr">
                  <td className="dash-td-name">
                    <div>{r.name}</div>
                    {(r.hw['PERN'] || r.ps['Employee Number']) && (
                      <div className="dash-td-ids">
                        {r.hw['PERN'] && <span>PERN {r.hw['PERN']}</span>}
                        {r.ps['Employee Number'] && <span>EE {r.ps['Employee Number']}</span>}
                      </div>
                    )}
                  </td>
                  <td className={`dash-cell ${r.hw[month?.key] ? 'dash-done' : 'dash-missing'}`}>
                    <DashCell
                      value={r.hw[month?.key] ?? ''}
                      type="number"
                      onSave={v => updateHoursWorked(r.name, month?.key, v)}
                    />
                  </td>
                  <td className={`dash-cell ${r.ps[month?.paylogKey] ? 'dash-done' : 'dash-missing'}`}>
                    <DashCell
                      value={r.ps[month?.paylogKey] ?? ''}
                      onSave={v => updatePaylogDate(r.name, month?.paylogKey, v)}
                    />
                  </td>
                  <td className={`dash-cell ${r.ad[month?.key] ? 'dash-done' : 'dash-missing'}`}>
                    <DashCell
                      value={r.ad[month?.key] ?? ''}
                      onSave={v => updateApprovalDate(r.name, month?.key, v)}
                    />
                  </td>
                  <td className="dash-cell">
                    <button className="icaap-archive-btn" onClick={() => setArchived(r.name, !r.archived)}>
                      {r.archived ? 'Unarchive' : 'Archive'}
                    </button>
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
