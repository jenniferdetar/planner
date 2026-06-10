import { useState, useRef } from 'react'
import './IcaapTracker.css'
import { ATTENDANCE_MEMBERS } from '../hooks/useIcaapAttendance'
import { useIcaapDashboard, DASHBOARD_MONTHS, normalizePaylogMonth } from '../hooks/useIcaapDashboard'

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

export default function IcaapTracker({ items, onAddItem, onUpdateItem, onDeleteItem, asanaTasks = [], onCompleteAsanaTask, onUpdateAsanaTaskNotes, attendanceRecords = [], onUpsertAttendance, onUpdateAttendanceNotes }) {
  const [tab, setTab] = useState('dashboard')
  const [filter, setFilter] = useState('active')
  const [showForm, setShowForm] = useState(false)
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [pushingId, setPushingId] = useState(null)
  const [pushResult, setPushResult] = useState({}) // id -> 'ok' | 'err'

  const blankForm = {
    title: '', category: 'Task', priority: 'Medium',
    status: 'To Do', description: '', due_date: '',
  }
  const [form, setForm] = useState(blankForm)

  const token = import.meta.env.VITE_ASANA_TOKEN

  const todo = items.filter(i => i.status === 'To Do')
  const inProg = items.filter(i => i.status === 'In Progress')
  const done = items.filter(i => i.status === 'Done')
  const blocked = items.filter(i => i.status === 'Blocked')

  const activeItems = items.filter(i => i.status !== 'Done')
  const displayItems = filter === 'active' ? activeItems
    : filter === 'done' ? done
    : items

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

  const counts = {
    todo: todo.length,
    inProg: inProg.length,
    done: done.length,
    blocked: blocked.length,
  }

  return (
    <div className="icaap-tracker">
      {/* Stats bar */}
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

      {/* Sub-tabs */}
      <div className="icaap-tabs">
        <button className={`icaap-tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={`icaap-tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>List</button>
        <button className={`icaap-tab ${tab === 'asana' ? 'active' : ''}`} onClick={() => setTab('asana')}>Asana {asanaTasks.length > 0 && <span className="icaap-tab-badge">{asanaTasks.length}</span>}</button>
        <button className={`icaap-tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Attendance</button>
      </div>

      {/* Dashboard tab */}
      {tab === 'dashboard' && <IcaapDashboard />}

      {/* Asana tab */}
      {tab === 'asana' && (
        <div className="icaap-list">
          {asanaTasks.length === 0 && <p className="icaap-empty">No iCAAP tasks in Asana</p>}
          {asanaTasks.map(task => (
            <AsanaTaskRow key={task.id} task={task} onComplete={onCompleteAsanaTask} onUpdateNotes={onUpdateAsanaTaskNotes} />
          ))}
        </div>
      )}

      {/* Attendance tab */}
      {tab === 'attendance' && (
        <AttendancePanel
          date={attendanceDate}
          onDateChange={setAttendanceDate}
          records={attendanceRecords}
          onUpsert={onUpsertAttendance}
          onUpdateNotes={onUpdateAttendanceNotes}
        />
      )}

      {/* Toolbar */}
      <div className="icaap-toolbar" style={{ display: (tab === 'asana' || tab === 'attendance') ? 'none' : undefined }}>
        {tab === 'list' ? (
          <div className="icaap-filter-pills">
            {['active', 'done', 'all'].map(f => (
              <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        ) : <span />}
        <button className="icaap-add-btn" onClick={() => setShowForm(true)}>+ Add Item</button>
      </div>

      {/* Add form — hidden on Asana/Attendance tabs */}
      {showForm && tab !== 'asana' && tab !== 'attendance' && (
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


      {/* List view */}
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

const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Excused']
const ATTENDANCE_STATUS_COLORS = { Present: '#5cb85c', Absent: '#e05c5c', Excused: '#f0a040' }

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
              <th className="att-th-name">Member</th>
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
                      onStatusChange={s => onUpsert?.(d, member, s, record?.notes ?? null, record?.time_in ?? null)}
                      onTimeChange={t => onUpsert?.(d, member, record?.status ?? 'Present', record?.notes ?? null, t)}
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

function AttendanceCell({ status, timeIn, onStatusChange, onTimeChange }) {
  const [editingTime, setEditingTime] = useState(false)
  const [timeVal, setTimeVal] = useState(timeIn)
  const timer = useRef(null)

  if (timeVal !== timeIn && !timer.current) setTimeVal(timeIn)

  function handleTimeBlur() {
    setEditingTime(false)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { onTimeChange(timeVal); timer.current = null }, 0)
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
            onChange={e => setTimeVal(e.target.value)}
            onBlur={handleTimeBlur}
            autoFocus
          />
        ) : (
          <button className="att-time-btn" onClick={() => setEditingTime(true)}>
            {timeIn || '+ time'}
          </button>
        )
      )}
    </td>
  )
}

function AsanaTaskRow({ task, onComplete, onUpdateNotes }) {
  const [expanded, setExpanded] = useState(false)
  const [notesText, setNotesText] = useState(task.notes || '')
  const saveTimer = useRef(null)

  function handleNotesChange(e) {
    const val = e.target.value
    setNotesText(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onUpdateNotes?.(task.id, val), 800)
  }

  return (
    <div className="asana-task-row">
      <div className="asana-task-header">
        <button
          className="asana-row-check-btn"
          onClick={() => onComplete?.(task.id)}
          title="Mark complete"
        />
        <span className="asana-task-title" onClick={() => setExpanded(e => !e)}>{task.title}</span>
        {task.due_on && <span className="asana-task-due">📅 {task.due_on}</span>}
        <span className="icaap-chevron" onClick={() => setExpanded(e => !e)}>{expanded ? '▾' : '▸'}</span>
      </div>
      {expanded && (
        <div className="asana-task-body">
          <textarea
            className="icaap-input"
            placeholder="Notes…"
            value={notesText}
            onChange={handleNotesChange}
            rows={3}
            style={{ resize: 'vertical', width: '100%' }}
          />
        </div>
      )}
    </div>
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
              <button className="icaap-delete-btn" onClick={() => onDeleteItem(item.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── iCAAP Dashboard ───────────────────────────────────────────────────────────

const CURRENT_MONTH = (() => {
  const keys = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return keys[new Date().getMonth()]
})()

function parsePaylogCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim())
  // Skip header row if first cell looks like a header
  const start = lines[0]?.toLowerCase().includes('id') || lines[0]?.toLowerCase().includes('start') ? 1 : 0
  const parsed = []
  const skipped = []
  for (let i = start; i < lines.length; i++) {
    // Handle quoted CSV fields
    const cols = []
    let cur = '', inQuote = false
    for (const ch of lines[i] + ',') {
      if (ch === '"') { inQuote = !inQuote }
      else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = '' }
      else cur += ch
    }
    const name = cols[4]?.trim()       // Col E
    const monthRaw = cols[9]?.trim()   // Col J
    const dateValue = cols[2]?.trim()  // Col C (End Time = submission date)
    if (!name || !monthRaw) { skipped.push(i + 1); continue }
    const monthCol = normalizePaylogMonth(monthRaw)
    if (!monthCol) { skipped.push(i + 1); continue }
    parsed.push({ name, monthCol, dateValue, monthRaw })
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

function IcaapDashboard() {
  const { rows, loading, importPaylogRows } = useIcaapDashboard()
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH)
  const [search, setSearch] = useState('')
  const [showImport, setShowImport] = useState(false)

  const month = DASHBOARD_MONTHS.find(m => m.key === selectedMonth)
  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  const submitted = filtered.filter(r => !!r.hw[month?.key]).length
  const paylogged = filtered.filter(r => !!r.ps[month?.paylogKey]).length
  const approved  = filtered.filter(r => !!r.ad[month?.key]).length
  const total = filtered.length

  return (
    <div className="dash-panel">
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={importPaylogRows}
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
        <div className="dash-toolbar-right">
          <input
            className="dash-search"
            placeholder="Search employee…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="dash-import-btn" onClick={() => setShowImport(true)}>↑ Import CSV</button>
        </div>
      </div>

      <div className="dash-summary">
        <div className="dash-stat"><span className="dash-stat-num" style={{ color: '#4a90d9' }}>{submitted}/{total}</span><span className="dash-stat-lbl">Hours Worked</span></div>
        <div className="dash-stat"><span className="dash-stat-num" style={{ color: '#9b59b6' }}>{paylogged}/{total}</span><span className="dash-stat-lbl">Paylog Submitted</span></div>
        <div className="dash-stat"><span className="dash-stat-num" style={{ color: '#5cb85c' }}>{approved}/{total}</span><span className="dash-stat-lbl">Approved</span></div>
      </div>

      {loading ? (
        <p className="icaap-empty">Loading…</p>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th className="dash-th-name">Employee</th>
                <th className="dash-th" style={{ color: '#4a90d9' }}>Hours Worked</th>
                <th className="dash-th" style={{ color: '#9b59b6' }}>Paylog Submitted</th>
                <th className="dash-th" style={{ color: '#5cb85c' }}>Approved</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.name}>
                  <td className="dash-td-name">{r.name}</td>
                  <td className={`dash-cell ${r.hw[month?.key] ? 'dash-done' : 'dash-missing'}`}>
                    {r.hw[month?.key] || '—'}
                  </td>
                  <td className={`dash-cell ${r.ps[month?.paylogKey] ? 'dash-done' : 'dash-missing'}`}>
                    {r.ps[month?.paylogKey] || '—'}
                  </td>
                  <td className={`dash-cell ${r.ad[month?.key] ? 'dash-done' : 'dash-missing'}`}>
                    {r.ad[month?.key] || '—'}
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
