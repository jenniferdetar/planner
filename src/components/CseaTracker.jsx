import { useState, useRef, useEffect } from 'react'
import { useCseaMembers, useWorkLocations } from '../hooks/useCseaData'
import { useQuickLinks } from '../hooks/useQuickLinks'
import { useGmailCseaSync } from '../hooks/useGmailCseaSync'
import ContractReference from './ContractReference'
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

const TYPE_COLORS = { Grievance: '#8e2a2a', Gripe: '#f7941d', Complaint: '#3164a0' }
const STATUS_COLORS = { Open: '#cc0000', 'In Progress': '#f7941d', Resolved: '#41a700', Closed: '#53575a' }
const PRIORITY_COLORS = { High: '#cc0000', Medium: '#f7941d', Low: '#3164a0' }

const INTERACTION_CATEGORIES = ['General', 'Grievance', 'Benefits', 'Discipline', 'Contract', 'Other']

export default function CseaTracker({ userId, providerToken, issues, onAddIssue, onUpdateStatus, onDeleteIssue, interactions, onAddInteraction, onUpdateInteraction, showArchived, onToggleArchived, asanaTasks = [], onCompleteAsanaTask, onUpdateAsanaTaskNotes, cseaNotes = [], onAddCseaNote, onDeleteCseaNote, issueNotes = {}, onAddIssueNote, onDeleteIssueNote }) {
  const workLocations = useWorkLocations()
  const { links: quickLinks, addLink, deleteLink } = useQuickLinks(userId, 'csea')
  const [tab, setTab] = useState('issues')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [showAddIssue, setShowAddIssue] = useState(false)
  const [showAddInteraction, setShowAddInteraction] = useState(false)
  const [filter, setFilter] = useState('active')
  const [noteText, setNoteText] = useState('')
  const [noteSource, setNoteSource] = useState('')
  const [noteTopic, setNoteTopic] = useState('')
  const [showNotesList, setShowNotesList] = useState(false)

  const [issueForm, setIssueForm] = useState({
    issue_type: 'Grievance', member_name: '', work_location: '',
    description: '', priority: 'Medium', status: 'Open',
    point_of_contact: '', involved_parties: '',
  })

  const [interactionForm, setInteractionForm] = useState({
    category: 'General', member_name: '', work_location: '',
    discussion: '', who_involved: '', date_spoke: new Date().toISOString().split('T')[0],
  })
  const [interactionIsGroup, setInteractionIsGroup] = useState(false)
  const [groupParticipants, setGroupParticipants] = useState('')

  const { sync: syncGmail, syncing: gmailSyncing, newCount: gmailNewCount } = useGmailCseaSync(providerToken)

  // Auto-sync when interactions tab is opened
  useEffect(() => {
    if (tab === 'interactions' && providerToken) syncGmail()
  }, [tab, providerToken])

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
    const memberName = interactionIsGroup
      ? `Group Chat (${groupParticipants.split(',').map(n => n.trim()).filter(Boolean).join(', ')})`
      : interactionForm.member_name.trim()
    if (interactionIsGroup ? !groupParticipants.trim() : !memberName) return
    await onAddInteraction({ ...interactionForm, member_name: memberName })
    setInteractionForm({ category: 'General', member_name: '', work_location: '', discussion: '', who_involved: '', date_spoke: new Date().toISOString().split('T')[0] })
    setGroupParticipants('')
    setInteractionIsGroup(false)
    setShowAddInteraction(false)
  }

  return (
    <div className="csea-tracker">

      {/* Sub-tabs */}
      <div className="csea-tabs">
        <button className={`csea-tab ${tab === 'issues' ? 'active' : ''}`} onClick={() => setTab('issues')}>Issues</button>
        <button className={`csea-tab ${tab === 'interactions' ? 'active' : ''}`} onClick={() => setTab('interactions')}>Interactions {interactions.length > 0 && <span className="csea-tab-badge">{new Set(interactions.map(i => i.member_name || 'Unknown')).size}</span>}</button>
        <button className={`csea-tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Notes {cseaNotes.length > 0 && <span className="csea-tab-badge">{cseaNotes.length}</span>}</button>
        <button className={`csea-tab ${tab === 'links' ? 'active' : ''}`} onClick={() => setTab('links')}>Links {quickLinks.length > 0 && <span className="csea-tab-badge">{quickLinks.length}</span>}</button>
        <button className={`csea-tab ${tab === 'contract' ? 'active' : ''}`} onClick={() => setTab('contract')}>Contract/Constitution</button>
      </div>

      {tab === 'issues' && (
        <div className="csea-panel">
          <div className="csea-toolbar">
            <div className="csea-filter-pills">
              {['active', 'resolved', 'all'].map(f => (
                <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <span className="csea-inline-stat" style={{ color: '#e05c5c' }}>{counts.Grievance} <span className="csea-inline-lbl">Grievances</span></span>
              <span className="csea-inline-stat" style={{ color: '#f0a040' }}>{counts.Gripe} <span className="csea-inline-lbl">Gripes</span></span>
              <span className="csea-inline-stat" style={{ color: '#5c9ee0' }}>{counts.Complaint} <span className="csea-inline-lbl">Complaints</span></span>
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
              <IssueCard
                key={issue.id}
                issue={issue}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDeleteIssue}
                notes={issueNotes[issue.id] || []}
                onAddNote={(text, date) => onAddIssueNote?.(issue.id, text, date)}
                onDeleteNote={(noteId) => onDeleteIssueNote?.(issue.id, noteId)}
              />
            ))}
          </div>
        </div>
      )}

      {tab === 'notes' && (
        <div className="csea-panel">
          <form className="csea-notes-form" onSubmit={async (e) => {
            e.preventDefault()
            if (!noteText.trim()) return
            await onAddCseaNote?.(noteText.trim(), noteSource.trim(), noteTopic.trim())
            setNoteText('')
            setNoteSource('')
            setNoteTopic('')
          }}>
            <textarea
              className="csea-textarea"
              placeholder="Note *"
              rows={2}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            />
            <input
              className="csea-input"
              placeholder="Topic (optional)"
              value={noteTopic}
              onChange={e => setNoteTopic(e.target.value)}
            />
            <div className="csea-notes-form-row">
              <input
                className="csea-input"
                placeholder="Source (optional)"
                value={noteSource}
                onChange={e => setNoteSource(e.target.value)}
              />
              <button type="submit" className="csea-save">Add</button>
            </div>
          </form>
          <button className="csea-notes-toggle" onClick={() => setShowNotesList(v => !v)}>
            {showNotesList ? `Hide Notes (${cseaNotes.length})` : `Show Notes (${cseaNotes.length})`}
          </button>
          {showNotesList && (
            <div className="csea-issue-list">
              {cseaNotes.length === 0 && <p className="csea-empty">No notes yet</p>}
              {cseaNotes.map(n => (
                <CseaNoteRowItem key={n.id} note={n} onDelete={onDeleteCseaNote} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'links' && (
        <div className="csea-panel">
          <form className="csea-notes-form" onSubmit={async (e) => {
            e.preventDefault()
            if (!linkTitle.trim() || !linkUrl.trim()) return
            const url = linkUrl.trim().startsWith('http') ? linkUrl.trim() : 'https://' + linkUrl.trim()
            await addLink(linkTitle.trim(), url)
            setLinkTitle('')
            setLinkUrl('')
          }}>
            <input
              className="csea-input"
              placeholder="Label *"
              value={linkTitle}
              onChange={e => setLinkTitle(e.target.value)}
            />
            <div className="csea-notes-form-row">
              <input
                className="csea-input"
                placeholder="URL *"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
              />
              <button type="submit" className="csea-save">Add</button>
            </div>
          </form>
          <div className="csea-issue-list">
            {quickLinks.length === 0 && <p className="csea-empty">No links yet</p>}
            {quickLinks.map(l => (
              <div key={l.id} className="csea-note-row">
                <div className="csea-note-body">
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="quick-link-anchor">{l.title}</a>
                  {l.created_at && (
                    <span className="quick-link-date">
                      {new Date(l.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <button className="csea-note-delete" onClick={() => deleteLink(l.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'contract' && (
        <div className="csea-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ContractReference userId={userId} />
        </div>
      )}

      {tab === 'interactions' && (
        <div className="csea-panel">
          <div className="csea-toolbar">
            <button className="csea-archive-toggle" onClick={onToggleArchived}>
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </button>
            {providerToken && (
              <button className="csea-gmail-sync-btn" onClick={syncGmail} disabled={gmailSyncing}>
                {gmailSyncing ? 'Syncing…' : gmailNewCount != null ? `↻ Sync Gmail${gmailNewCount > 0 ? ` (+${gmailNewCount})` : ''}` : '↻ Sync Gmail'}
              </button>
            )}
            <button className="csea-add-btn" onClick={() => setShowAddInteraction(true)}>+ Log Contact</button>
          </div>

          {showAddInteraction && (
            <form className="csea-form" onSubmit={handleAddInteraction}>
              <div className="csea-form-row">
                <div className="csea-type-btns">
                  {INTERACTION_CATEGORIES.map(c => (
                    <button key={c} type="button"
                      className={`type-btn ${interactionForm.category === c ? 'active' : ''}`}
                      style={{ '--tc': '#3164a0' }}
                      onClick={() => setInteractionForm(f => ({ ...f, category: c }))}
                    >{c}</button>
                  ))}
                </div>
              </div>
              <div className="csea-form-row">
                <div className="csea-type-btns">
                  <button type="button"
                    className={`type-btn ${!interactionIsGroup ? 'active' : ''}`}
                    style={{ '--tc': '#3164a0' }}
                    onClick={() => setInteractionIsGroup(false)}
                  >Single Member</button>
                  <button type="button"
                    className={`type-btn ${interactionIsGroup ? 'active' : ''}`}
                    style={{ '--tc': '#3164a0' }}
                    onClick={() => setInteractionIsGroup(true)}
                  >Group Chat</button>
                </div>
              </div>
              {interactionIsGroup ? (
                <input className="csea-input" placeholder="Participants (comma-separated) *"
                  value={groupParticipants}
                  onChange={e => setGroupParticipants(e.target.value)} />
              ) : (
                <MemberSearch value={interactionForm.member_name} onChange={v => setInteractionForm(f => ({ ...f, member_name: v }))} />
              )}
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
                const raw = i.member_name || 'Unknown'
                // Expand "Group Chat (Name1, Name2, ...)" into individual names
                const gcMatch = raw.match(/^Group Chat\s*\((.+)\)$/i)
                const keys = gcMatch
                  ? gcMatch[1].split(',').map(n => n.trim()).filter(Boolean)
                  : [raw]
                keys.forEach(key => {
                  if (!groups[key]) groups[key] = []
                  groups[key].push(i)
                })
                return groups
              }, {})
            ).sort(([a], [b]) => a.localeCompare(b)).map(([member, items]) => (
              <MemberInteractionGroup key={member} member={member} items={items} onUpdate={onUpdateInteraction} workLocations={workLocations} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MemberInteractionGroup({ member, items, onUpdate, workLocations }) {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <div className="interaction-group">
      <div className="interaction-group-header">
        <span className="interaction-group-name">{member}</span>
        <span className="interaction-group-count">{items.length}</span>
        <button className="interaction-group-toggle" onClick={() => setCollapsed(c => !c)}>
          {collapsed ? '▾' : '▴'}
        </button>
      </div>
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

function CseaNoteRowItem({ note: n, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      className={`csea-note-row${expanded ? ' expanded' : ''}`}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="csea-note-meta">
        <span className="csea-note-date">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</span>
        {n.topic && <span className="csea-note-topic">{n.topic}</span>}
        {n.source && <span className="csea-note-source">{n.source}</span>}
      </div>
      <div className="csea-note-text">{n.note}</div>
      <button
        className="csea-note-delete"
        onClick={e => { e.stopPropagation(); onDelete?.(n.id) }}
        title="Delete"
      >×</button>
    </div>
  )
}

function InteractionCard({ interaction: i, onUpdate }) {
  return (
    <div className="interaction-card">
      <div className="interaction-header">
        {i.category && <span className="interaction-cat-badge">{i.category}</span>}
        {i.work_location && <span className="interaction-loc-badge">📍 {i.work_location}</span>}
        {i.date_spoke && <span className="interaction-date-badge">{new Date(i.date_spoke + 'T12:00:00').toLocaleDateString()}</span>}
        <button className="interaction-delete-btn" title="Delete" onClick={() => onUpdate?.(i.id, { archived: true })}>✕</button>
      </div>
      {i.discussion && <p className="interaction-disc-text">{i.discussion}</p>}
      {i.who_involved && <p className="interaction-who-text">With: {i.who_involved}</p>}
      {i.point_of_contact && <p className="interaction-poc-text">Contact: {i.point_of_contact}</p>}
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

function IssueCard({ issue, onUpdateStatus, onDelete, notes = [], onAddNote, onDeleteNote }) {
  const [expanded, setExpanded] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0])

  async function handleAddNote(e) {
    e.preventDefault()
    if (!noteText.trim()) return
    await onAddNote?.(noteText.trim(), noteDate)
    setNoteText('')
    setNoteDate(new Date().toISOString().split('T')[0])
    setShowNoteForm(false)
  }

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
        {notes.length > 0 && <span className="issue-notes-count">{notes.length}</span>}
        <span className="issue-chevron">{expanded ? '▾' : '▸'}</span>
      </div>

      {expanded && (
        <div className="issue-body">
          {issue.work_location && <div className="issue-detail">📍 {issue.work_location}</div>}
          {issue.description && <div className="issue-desc">{issue.description}</div>}
          {issue.involved_parties && <div className="issue-detail">👥 {issue.involved_parties}</div>}
          {issue.issue_date && <div className="issue-detail">📅 {issue.issue_date}</div>}

          {notes.length > 0 && (
            <div className="issue-timeline">
              <div className="issue-timeline-label">Timeline</div>
              {notes.map(n => (
                <div key={n.id} className="issue-timeline-entry">
                  <div className="issue-timeline-date">{n.note_date ? new Date(n.note_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</div>
                  <div className="issue-timeline-text">{n.note_text}</div>
                  <button className="issue-timeline-delete" onClick={() => onDeleteNote?.(n.id)} title="Remove">×</button>
                </div>
              ))}
            </div>
          )}

          {showNoteForm ? (
            <form className="issue-note-form" onSubmit={handleAddNote}>
              <input
                className="csea-input"
                type="date"
                value={noteDate}
                onChange={e => setNoteDate(e.target.value)}
              />
              <textarea
                className="csea-textarea"
                placeholder="Note *"
                rows={2}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
              <div className="csea-form-actions" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="csea-cancel" onClick={() => setShowNoteForm(false)}>Cancel</button>
                <button type="submit" className="csea-save">Add</button>
              </div>
            </form>
          ) : (
            <button className="issue-add-note-btn" onClick={() => setShowNoteForm(true)}>+ Add Timeline Note</button>
          )}

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
