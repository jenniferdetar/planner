import { useState, useRef } from 'react'
import './IcaapTracker.css'
import { ATTENDANCE_MEMBERS } from '../hooks/useIcaapAttendance'

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
  const [tab, setTab] = useState('board')
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
        <button className={`icaap-tab ${tab === 'board' ? 'active' : ''}`} onClick={() => setTab('board')}>Board</button>
        <button className={`icaap-tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>List</button>
        <button className={`icaap-tab ${tab === 'asana' ? 'active' : ''}`} onClick={() => setTab('asana')}>Asana {asanaTasks.length > 0 && <span className="icaap-tab-badge">{asanaTasks.length}</span>}</button>
        <button className={`icaap-tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Attendance</button>
      </div>

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

      {/* Board view — only when not on Asana tab */}
      {tab === 'board' && (
        <div className="icaap-board">
          {[
            { label: 'To Do', key: 'To Do', color: '#888', list: todo },
            { label: 'In Progress', key: 'In Progress', color: '#4a90d9', list: inProg },
            { label: 'Blocked', key: 'Blocked', color: '#e05c5c', list: blocked },
            { label: 'Done', key: 'Done', color: '#5cb85c', list: done },
          ].map(col => (
            <div key={col.key} className="icaap-col">
              <div className="icaap-col-header" style={{ '--cc': col.color }}>
                <span>{col.label}</span>
                <span className="icaap-col-count">{col.list.length}</span>
              </div>
              {col.list.map(item => (
                <ItemCard key={item.id} item={item}
                  onUpdateItem={onUpdateItem}
                  onDeleteItem={onDeleteItem}
                  onPushToAsana={handlePushToAsana}
                  pushing={pushingId === item.id}
                  pushResult={pushResult[item.id]}
                />
              ))}
            </div>
          ))}
        </div>
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

function AttendancePanel({ date, onDateChange, records, onUpsert, onUpdateNotes }) {
  const presentCount = ATTENDANCE_MEMBERS.filter(m => {
    const r = records.find(r => r.meeting_date === date && r.member_name === m)
    return !r || r.status === 'Present'
  }).length

  return (
    <div className="attendance-panel">
      <div className="attendance-header">
        <div className="attendance-date-row">
          <label className="attendance-date-label">Meeting date</label>
          <input
            type="date"
            value={date}
            onChange={e => onDateChange(e.target.value)}
            className="attendance-date-input"
          />
        </div>
        <div className="attendance-summary">
          <span className="attendance-present-count" style={{ color: '#5cb85c' }}>{presentCount}</span>
          <span className="attendance-summary-label">/ {ATTENDANCE_MEMBERS.length} present</span>
        </div>
      </div>
      <div className="attendance-list">
        {ATTENDANCE_MEMBERS.map(member => {
          const record = records.find(r => r.meeting_date === date && r.member_name === member)
          const status = record?.status ?? 'Present'
          const notes = record?.notes ?? ''
          return (
            <AttendanceMemberRow
              key={member}
              member={member}
              status={status}
              notes={notes}
              onStatusChange={s => onUpsert?.(date, member, s, record?.notes ?? null)}
              onNotesChange={n => onUpdateNotes?.(date, member, n)}
            />
          )
        })}
      </div>
    </div>
  )
}

function AttendanceMemberRow({ member, status, notes, onStatusChange, onNotesChange }) {
  const [expanded, setExpanded] = useState(false)
  const [notesText, setNotesText] = useState(notes)
  const saveTimer = useRef(null)

  // Sync notes when date changes
  if (notesText !== notes && !saveTimer.current) {
    setNotesText(notes)
  }

  function handleNotesChange(e) {
    const val = e.target.value
    setNotesText(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      onNotesChange?.(val)
      saveTimer.current = null
    }, 800)
  }

  return (
    <div className={`attendance-row ${status === 'Absent' ? 'absent' : ''}`}>
      <div className="attendance-row-main">
        <span className="attendance-member-name">{member}</span>
        <div className="attendance-status-btns">
          {ATTENDANCE_STATUSES.map(s => (
            <button
              key={s}
              className={`att-status-btn ${status === s ? 'active' : ''}`}
              style={{ '--ac': ATTENDANCE_STATUS_COLORS[s] }}
              onClick={() => onStatusChange(s)}
            >{s}</button>
          ))}
        </div>
        <button
          className={`att-notes-btn ${notes ? 'has-notes' : ''} ${expanded ? 'open' : ''}`}
          onClick={() => setExpanded(e => !e)}
          title="Notes"
        >≡</button>
      </div>
      {expanded && (
        <textarea
          className="att-notes-input"
          placeholder="Notes for this member…"
          value={notesText}
          onChange={handleNotesChange}
          rows={2}
          autoFocus
        />
      )}
    </div>
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
