import { useState } from 'react'
import { ISSUE_STATUSES, ISSUE_PRIORITIES } from '../lib/roles'

const BLANK = { title: '', member_name: '', category: '', priority: 'medium', status: 'open' }

function statusLabel(v) {
  return ISSUE_STATUSES.find((s) => s.value === v)?.label || v
}

function IssueCard({ issue, notes, memberList, onUpdate, onDelete, onAddNote, onDeleteNote }) {
  const [noteText, setNoteText] = useState('')
  const [noteDate, setNoteDate] = useState('')

  async function submitNote(e) {
    e.preventDefault()
    if (!noteText.trim()) return
    await onAddNote(issue.id, noteText.trim(), noteDate || null)
    setNoteText('')
    setNoteDate('')
  }

  return (
    <div className="card">
      <div className="card-row">
        <div className="stack">
          <strong>{issue.title}</strong>
          <div className="row-gap">
            {issue.member_name && <span className="meta">{issue.member_name}</span>}
            {issue.category && <span className="tag tag-role">{issue.category}</span>}
            <span className={`tag tag-${issue.priority}`}>{issue.priority}</span>
          </div>
        </div>
        <div className="row-gap">
          <select
            className={`field btn-sm`}
            style={{ width: 'auto' }}
            value={issue.status}
            onChange={(e) => onUpdate(issue.id, { status: e.target.value })}
          >
            {ISSUE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button className="btn-ghost" title="Delete" onClick={() => onDelete(issue.id)}>✕</button>
        </div>
      </div>

      <div className="timeline">
        {(notes || []).map((n) => (
          <div className="timeline-item" key={n.id}>
            <span>{n.note_text}</span>
            <span className="row-gap">
              {n.note_date && <span className="timeline-date">{n.note_date}</span>}
              <button className="btn-ghost" title="Remove" onClick={() => onDeleteNote(issue.id, n.id)}>×</button>
            </span>
          </div>
        ))}
        <form className="row-gap" style={{ marginTop: '0.5rem' }} onSubmit={submitNote}>
          <input className="field" placeholder="Add an update…" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
          <input className="field" style={{ width: 'auto' }} type="date" value={noteDate} onChange={(e) => setNoteDate(e.target.value)} />
          <button className="btn btn-sm" type="submit">Add</button>
        </form>
      </div>
    </div>
  )
}

export default function IssuesPanel({ issues, memberList }) {
  const { issues: list, notesByIssue, addIssue, updateIssue, deleteIssue, addNote, deleteNote } = issues
  const [form, setForm] = useState(BLANK)
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = statusFilter === 'all' ? list : list.filter((i) => i.status === statusFilter)

  async function submit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    await addIssue(form)
    setForm(BLANK)
    setShowForm(false)
  }

  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Issues &amp; Grievances</h2>
          <p className="panel-sub">Track cases from intake to resolution</p>
        </div>
        <button className="btn" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : '+ New issue'}</button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={submit}>
          <div className="full">
            <label>Title</label>
            <input className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label>Member</label>
            <input className="field" list="issue-member-names" value={form.member_name} onChange={(e) => setForm({ ...form, member_name: e.target.value })} />
            <datalist id="issue-member-names">
              {memberList.map((m) => <option key={m.id} value={`${m.first_name} ${m.last_name}`} />)}
            </datalist>
          </div>
          <div>
            <label>Category</label>
            <input className="field" placeholder="e.g. Discipline, Pay, Safety" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div>
            <label>Priority</label>
            <select className="field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {ISSUE_PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div className="full">
            <button className="btn" type="submit">Save issue</button>
          </div>
        </form>
      )}

      <div className="filter-row">
        <button className={`pill ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
        {ISSUE_STATUSES.map((s) => (
          <button key={s.value} className={`pill ${statusFilter === s.value ? 'active' : ''}`} onClick={() => setStatusFilter(s.value)}>
            {s.label} <span className="tab-badge">{list.filter((i) => i.status === s.value).length}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No issues {statusFilter !== 'all' ? `marked ${statusLabel(statusFilter)}` : 'yet'}.</div>
      ) : (
        filtered.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            notes={notesByIssue[issue.id]}
            memberList={memberList}
            onUpdate={updateIssue}
            onDelete={deleteIssue}
            onAddNote={addNote}
            onDeleteNote={deleteNote}
          />
        ))
      )}
    </div>
  )
}
