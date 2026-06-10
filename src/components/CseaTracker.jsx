import { useState, useRef } from 'react'
import { useCseaMembers, useWorkLocations } from '../hooks/useCseaData'
import './CseaTracker.css'

function MemberSearch({ value, onChange, placeholder = 'Member name *' }) {
  const { search, setSearch, results, loading } = useCseaMembers()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  function handleInput(e) {
    const v = e.target.value
    onChange(v)
    setSearch(v)
    setOpen(true)
  }

  function select(member) {
    const name = `${member.first_name} ${member.last_name}`
    onChange(name)
    setSearch(name)
    setOpen(false)
  }

  return (
    <div className="member-search" ref={ref}>
      <input
        className="csea-input"
        placeholder={placeholder}
        value={value}
        onChange={handleInput}
        onFocus={() => value.length >= 2 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <ul className="member-dropdown">
          {results.map((m, i) => (
            <li key={i} className="member-option" onMouseDown={() => select(m)}>
              <span className="member-name">{m.first_name} {m.last_name}</span>
              {m.employee_number && <span className="member-emp">#{m.employee_number}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const ISSUE_TYPES = ['Grievance', 'Gripe', 'Complaint']
const PRIORITIES = ['Low', 'Medium', 'High']
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']

const TYPE_COLORS = { Grievance: '#e05c5c', Gripe: '#f0a040', Complaint: '#5c9ee0' }
const STATUS_COLORS = { Open: '#e05c5c', 'In Progress': '#f0a040', Resolved: '#5cb85c', Closed: '#aaa' }
const PRIORITY_COLORS = { High: '#e05c5c', Medium: '#f0a040', Low: '#5c9ee0' }

const INTERACTION_CATEGORIES = ['General', 'Grievance', 'Benefits', 'Discipline', 'Contract', 'Other']

export default function CseaTracker({ issues, onAddIssue, onUpdateStatus, onDeleteIssue, interactions, onAddInteraction, onUpdateInteraction, asanaTasks = [], onCompleteAsanaTask, onUpdateAsanaTaskNotes }) {
  const workLocations = useWorkLocations()
  const [tab, setTab] = useState('issues')
  const [showAddIssue, setShowAddIssue] = useState(false)
  const [showAddInteraction, setShowAddInteraction] = useState(false)
  const [filter, setFilter] = useState('active')

  const [issueForm, setIssueForm] = useState({
    issue_type: 'Grievance', member_name: '', work_location: '',
    description: '', priority: 'Medium', status: 'Open',
    point_of_contact: '', involved_parties: '',
  })

  const [interactionForm, setInteractionForm] = useState({
    category: 'General', member_name: '', work_location: '',
    discussion: '', who_involved: '', date_spoke: new Date().toISOString().split('T')[0],
  })

  const activeIssues = issues.filter(i => i.status === 'Open' || i.status === 'In Progress')
  const resolvedIssues = issues.filter(i => i.status === 'Resolved' || i.status === 'Closed')
  const displayIssues = filter === 'active' ? activeIssues : filter === 'resolved' ? resolvedIssues : issues

  const counts = {
    Grievance: activeIssues.filter(i => i.issue_type === 'Grievance').length,
    Gripe: activeIssues.filter(i => i.issue_type === 'Gripe').length,
    Complaint: activeIssues.filter(i => i.issue_type === 'Complaint').length,
  }

  async function handleAddIssue(e) {
    e.preventDefault()
    if (!issueForm.member_name.trim() || !issueForm.description.trim()) return
    await onAddIssue(issueForm)
    setIssueForm({ issue_type: 'Grievance', member_name: '', work_location: '', description: '', priority: 'Medium', status: 'Open', point_of_contact: '', involved_parties: '' })
    setShowAddIssue(false)
  }

  async function handleAddInteraction(e) {
    e.preventDefault()
    if (!interactionForm.member_name.trim()) return
    await onAddInteraction(interactionForm)
    setInteractionForm({ category: 'General', member_name: '', work_location: '', discussion: '', who_involved: '', date_spoke: new Date().toISOString().split('T')[0] })
    setShowAddInteraction(false)
  }

  return (
    <div className="csea-tracker">
      {/* Stats bar */}
      <div className="csea-stats">
        <div className="csea-stat">
          <span className="csea-stat-num" style={{ color: '#e05c5c' }}>{counts.Grievance}</span>
          <span className="csea-stat-lbl">Grievances</span>
        </div>
        <div className="csea-stat">
          <span className="csea-stat-num" style={{ color: '#f0a040' }}>{counts.Gripe}</span>
          <span className="csea-stat-lbl">Gripes</span>
        </div>
        <div className="csea-stat">
          <span className="csea-stat-num" style={{ color: '#5c9ee0' }}>{counts.Complaint}</span>
          <span className="csea-stat-lbl">Complaints</span>
        </div>
        <div className="csea-stat">
          <span className="csea-stat-num">{activeIssues.length}</span>
          <span className="csea-stat-lbl">Active</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="csea-tabs">
        <button className={`csea-tab ${tab === 'issues' ? 'active' : ''}`} onClick={() => setTab('issues')}>Issues</button>
        <button className={`csea-tab ${tab === 'interactions' ? 'active' : ''}`} onClick={() => setTab('interactions')}>Interactions</button>
        <button className={`csea-tab ${tab === 'asana' ? 'active' : ''}`} onClick={() => setTab('asana')}>Asana {asanaTasks.length > 0 && <span className="csea-tab-badge">{asanaTasks.length}</span>}</button>
      </div>

      {tab === 'asana' && (
        <div className="csea-panel">
          <div className="csea-toolbar">
            <span className="csea-toolbar-label">CSEA tasks from Asana</span>
          </div>
          <div className="csea-issue-list">
            {asanaTasks.length === 0 && <p className="csea-empty">No CSEA tasks in Asana</p>}
            {asanaTasks.map(task => (
              <CseaAsanaTaskRow key={task.id} task={task} onComplete={onCompleteAsanaTask} onUpdateNotes={onUpdateAsanaTaskNotes} />
            ))}
          </div>
        </div>
      )}

      {tab === 'issues' && (
        <div className="csea-panel">
          <div className="csea-toolbar">
            <div className="csea-filter-pills">
              {['active', 'resolved', 'all'].map(f => (
                <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <button className="csea-add-btn" onClick={() => setShowAddIssue(true)}>+ Log Issue</button>
          </div>

          {showAddIssue && (
            <form className="csea-form" onSubmit={handleAddIssue}>
              <div className="csea-form-row">
                <div className="csea-type-btns">
                  {ISSUE_TYPES.map(t => (
                    <button key={t} type="button"
                      className={`type-btn ${issueForm.issue_type === t ? 'active' : ''}`}
                      style={{ '--tc': TYPE_COLORS[t] }}
                      onClick={() => setIssueForm(f => ({ ...f, issue_type: t }))}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <MemberSearch value={issueForm.member_name} onChange={v => setIssueForm(f => ({ ...f, member_name: v }))} />
              <select className="csea-input" value={issueForm.work_location}
                onChange={e => setIssueForm(f => ({ ...f, work_location: e.target.value }))}>
                <option value="">Work location</option>
                {workLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <textarea className="csea-textarea" placeholder="Description *" rows={3} value={issueForm.description}
                onChange={e => setIssueForm(f => ({ ...f, description: e.target.value }))} />
              <input className="csea-input" placeholder="Involved parties" value={issueForm.involved_parties}
                onChange={e => setIssueForm(f => ({ ...f, involved_parties: e.target.value }))} />
              <div className="csea-form-row">
                <div className="csea-priority-btns">
                  {PRIORITIES.map(p => (
                    <button key={p} type="button"
                      className={`priority-btn ${issueForm.priority === p ? 'active' : ''}`}
                      style={{ '--pc': PRIORITY_COLORS[p] }}
                      onClick={() => setIssueForm(f => ({ ...f, priority: p }))}
                    >{p}</button>
                  ))}
                </div>
                <div className="csea-form-actions">
                  <button type="button" className="csea-cancel" onClick={() => setShowAddIssue(false)}>Cancel</button>
                  <button type="submit" className="csea-save">Save</button>
                </div>
              </div>
            </form>
          )}

          <div className="csea-issue-list">
            {displayIssues.length === 0 && (
              <p className="csea-empty">No {filter === 'active' ? 'active' : filter === 'resolved' ? 'resolved' : ''} issues</p>
            )}
            {displayIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} onUpdateStatus={onUpdateStatus} onDelete={onDeleteIssue} />
            ))}
          </div>
        </div>
      )}

      {tab === 'interactions' && (
        <div className="csea-panel">
          <div className="csea-toolbar">
            <span className="csea-toolbar-label">Recent member contacts</span>
            <button className="csea-add-btn" onClick={() => setShowAddInteraction(true)}>+ Log Contact</button>
          </div>

          {showAddInteraction && (
            <form className="csea-form" onSubmit={handleAddInteraction}>
              <div className="csea-form-row">
                <div className="csea-type-btns">
                  {INTERACTION_CATEGORIES.map(c => (
                    <button key={c} type="button"
                      className={`type-btn ${interactionForm.category === c ? 'active' : ''}`}
                      style={{ '--tc': '#4a90d9' }}
                      onClick={() => setInteractionForm(f => ({ ...f, category: c }))}
                    >{c}</button>
                  ))}
                </div>
              </div>
              <MemberSearch value={interactionForm.member_name} onChange={v => setInteractionForm(f => ({ ...f, member_name: v }))} />
              <select className="csea-input" value={interactionForm.work_location}
                onChange={e => setInteractionForm(f => ({ ...f, work_location: e.target.value }))}>
                <option value="">Work location</option>
                {workLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <input className="csea-input" type="date" value={interactionForm.date_spoke}
                onChange={e => setInteractionForm(f => ({ ...f, date_spoke: e.target.value }))} />
              <textarea className="csea-textarea" placeholder="What was discussed?" rows={3} value={interactionForm.discussion}
                onChange={e => setInteractionForm(f => ({ ...f, discussion: e.target.value }))} />
              <input className="csea-input" placeholder="Others involved" value={interactionForm.who_involved}
                onChange={e => setInteractionForm(f => ({ ...f, who_involved: e.target.value }))} />
              <div className="csea-form-actions" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="csea-cancel" onClick={() => setShowAddInteraction(false)}>Cancel</button>
                <button type="submit" className="csea-save">Save</button>
              </div>
            </form>
          )}

          <div className="csea-issue-list">
            {interactions.length === 0 && <p className="csea-empty">No interactions logged yet</p>}
            {Object.entries(
              interactions.reduce((groups, i) => {
                const key = i.member_name || 'Unknown'
                if (!groups[key]) groups[key] = []
                groups[key].push(i)
                return groups
              }, {})
            ).map(([member, items]) => (
              <MemberInteractionGroup key={member} member={member} items={items} onUpdate={onUpdateInteraction} workLocations={workLocations} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MemberInteractionGroup({ member, items, onUpdate, workLocations }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="interaction-group">
      <button className="interaction-group-header" onClick={() => setCollapsed(c => !c)}>
        <span className="interaction-group-name">{member}</span>
        <span className="interaction-group-count">{items.length}</span>
        <span className="interaction-group-chevron">{collapsed ? '▸' : '▾'}</span>
      </button>
      {!collapsed && (
        <div className="interaction-group-items">
          {items.map(i => (
            <InteractionCard key={i.id} interaction={i} onUpdate={onUpdate} workLocations={workLocations} />
          ))}
        </div>
      )}
    </div>
  )
}

function InteractionCard({ interaction: i, onUpdate, workLocations }) {
  const [form, setForm] = useState({
    category: i.category, member_name: i.member_name, work_location: i.work_location || '',
    date_spoke: i.date_spoke, discussion: i.discussion || '', who_involved: i.who_involved || '',
  })
  const saveTimer = useRef(null)

  function scheduleUpdate(updated) {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onUpdate?.(i.id, updated), 800)
  }

  function handleChange(field, value) {
    const updated = { ...form, [field]: value }
    setForm(updated)
    scheduleUpdate(updated)
  }

  function handleBlur() {
    clearTimeout(saveTimer.current)
    onUpdate?.(i.id, form)
  }

  return (
    <div className="interaction-card interaction-card-editable">
      <div className="interaction-header">
        <input
          className="interaction-field interaction-name-input"
          value={form.member_name}
          onChange={e => handleChange('member_name', e.target.value)}
          onBlur={handleBlur}
          placeholder="Member name"
        />
        <select
          className="interaction-field interaction-cat-select"
          value={form.category}
          onChange={e => handleChange('category', e.target.value)}
          onBlur={handleBlur}
        >
          {INTERACTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          className="interaction-field interaction-date-input"
          type="date"
          value={form.date_spoke}
          onChange={e => handleChange('date_spoke', e.target.value)}
          onBlur={handleBlur}
        />
      </div>
      <select
        className="interaction-field interaction-loc-select"
        value={form.work_location}
        onChange={e => handleChange('work_location', e.target.value)}
        onBlur={handleBlur}
      >
        <option value="">📍 Work location</option>
        {workLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
      </select>
      <textarea
        className="interaction-field interaction-disc-textarea"
        value={form.discussion}
        onChange={e => handleChange('discussion', e.target.value)}
        onBlur={handleBlur}
        placeholder="What was discussed?"
        rows={2}
      />
      <input
        className="interaction-field interaction-who-input"
        value={form.who_involved}
        onChange={e => handleChange('who_involved', e.target.value)}
        onBlur={handleBlur}
        placeholder="Others involved"
      />
    </div>
  )
}

function CseaAsanaTaskRow({ task, onComplete, onUpdateNotes }) {
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
        <span className="issue-chevron" onClick={() => setExpanded(e => !e)}>{expanded ? '▾' : '▸'}</span>
      </div>
      {expanded && (
        <div className="asana-task-body">
          <textarea
            className="csea-textarea"
            placeholder="Notes…"
            value={notesText}
            onChange={handleNotesChange}
            rows={3}
          />
        </div>
      )}
    </div>
  )
}

function IssueCard({ issue, onUpdateStatus, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`issue-card ${issue.status === 'Resolved' || issue.status === 'Closed' ? 'resolved' : ''}`}>
      <div className="issue-header" onClick={() => setExpanded(e => !e)}>
        <span className="issue-type-badge" style={{ background: TYPE_COLORS[issue.issue_type] + '22', color: TYPE_COLORS[issue.issue_type] }}>
          {issue.issue_type}
        </span>
        <span className="issue-member">{issue.member_name}</span>
        {issue.priority && (
          <span className="issue-priority" style={{ color: PRIORITY_COLORS[issue.priority] }}>
            {issue.priority}
          </span>
        )}
        <span className="issue-status-badge" style={{ background: STATUS_COLORS[issue.status] + '22', color: STATUS_COLORS[issue.status] }}>
          {issue.status}
        </span>
        <span className="issue-chevron">{expanded ? '▾' : '▸'}</span>
      </div>

      {expanded && (
        <div className="issue-body">
          {issue.work_location && <div className="issue-detail">📍 {issue.work_location}</div>}
          {issue.description && <div className="issue-desc">{issue.description}</div>}
          {issue.involved_parties && <div className="issue-detail">👥 {issue.involved_parties}</div>}
          {issue.issue_date && <div className="issue-detail">📅 {issue.issue_date}</div>}
          <div className="issue-actions">
            <div className="issue-status-btns">
              {STATUSES.filter(s => s !== issue.status).map(s => (
                <button key={s} className="status-change-btn" style={{ '--sc': STATUS_COLORS[s] }}
                  onClick={() => onUpdateStatus(issue.id, s)}>
                  → {s}
                </button>
              ))}
            </div>
            <button className="issue-delete-btn" onClick={() => onDelete(issue.id)}>Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}
