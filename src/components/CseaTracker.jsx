import { useState, useRef, useEffect } from 'react'
import { useCseaMembers, useWorkLocations } from '../hooks/useCseaData'
import { useQuickLinks } from '../hooks/useQuickLinks'
import { useICloudMailSync } from '../hooks/useICloudMailSync'
import ContractReference from './ContractReference'
import { RIF_INTAKE, rifPlatformSummary, rifActionSummary } from '../data/rifIntake'
import { MEMBER_BENEFITS_CONTACTS } from '../data/memberBenefitsContacts'
import { CONFERENCE_ATTENDEES } from '../data/conferenceAttendees'
import { isEboardMember, isLaborRep, isAreaIMember, isStateMember } from '../lib/eboardMembers'
import './CseaTracker.css'

function MemberSearch({ value, onChange, placeholder = 'Member name *' }) {
  const { search, setSearch, results } = useCseaMembers()
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

const PC_CASE_TYPES = ['Discipline Appeal', 'Layoff/RIF Appeal', 'Classification/Exam', 'Transfer', 'Other']
const PC_STATUSES = ['Intake', 'Filed', 'Scheduled', 'Hearing Held', 'Decided - Upheld', 'Decided - Reversed', 'Withdrawn']
const PC_STATUS_COLORS = {
  Intake: '#53575a', Filed: '#3164a0', Scheduled: '#f7941d', 'Hearing Held': '#8e2a2a',
  'Decided - Upheld': '#41a700', 'Decided - Reversed': '#cc0000', Withdrawn: '#53575a',
}
const PC_OPEN_STATUSES = ['Intake', 'Filed', 'Scheduled', 'Hearing Held']

export function useCseaPage({ userId, issues, onAddIssue, onUpdateStatus, onDeleteIssue, interactions, onAddInteraction, onUpdateInteraction, showArchived, onToggleArchived, asanaTasks = [], onCompleteAsanaTask, onUpdateAsanaTaskNotes, cseaNotes = [], onAddCseaNote, onDeleteCseaNote, issueNotes = {}, onAddIssueNote, onDeleteIssueNote, pcCases = [], onAddPcCase, onUpdatePcStatus, onDeletePcCase, pcCaseNotes = {}, onAddPcCaseNote, onDeletePcCaseNote }) {
  const workLocations = useWorkLocations()
  const { links: quickLinks, addLink, deleteLink } = useQuickLinks(userId, 'csea')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [showAddLink, setShowAddLink] = useState(false)
  const [showAddIssue, setShowAddIssue] = useState(false)
  const [showAddInteraction, setShowAddInteraction] = useState(false)
  const [filter, setFilter] = useState('active')
  const [noteText, setNoteText] = useState('')
  const [noteSource, setNoteSource] = useState('')
  const [noteTopic, setNoteTopic] = useState('')
  const [showAddNote, setShowAddNote] = useState(false)
  const [hasSyncedOnce, setHasSyncedOnce] = useState(false)

  const [issueForm, setIssueForm] = useState({
    issue_type: 'Grievance', member_name: '', work_location: '',
    description: '', priority: 'Medium', status: 'Open',
    point_of_contact: '', involved_parties: '',
  })

  const [interactionForm, setInteractionForm] = useState({
    category: 'General', member_name: '', work_location: '',
    discussion: '', who_involved: '', date_spoke: new Date().toISOString().split('T')[0],
  })

  const [showAddPcCase, setShowAddPcCase] = useState(false)
  const [pcFilter, setPcFilter] = useState('active')
  const [pcForm, setPcForm] = useState({
    case_type: 'Discipline Appeal', member_name: '', work_location: '',
    case_number: '', description: '', hearing_date: '', point_of_contact: '',
  })

  const { sync: syncAll, syncing, newCount: totalNewCount, lastSynced } = useICloudMailSync()
  const hasSynced = lastSynced != null

  // Auto-sync once when the right page mounts (used to trigger on the
  // Interactions sub-tab specifically).
  useEffect(() => {
    if (!hasSyncedOnce) { setHasSyncedOnce(true); syncAll() }
  }, [])

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

  const activePcCases = pcCases.filter(c => PC_OPEN_STATUSES.includes(c.status))
  const closedPcCases = pcCases.filter(c => !PC_OPEN_STATUSES.includes(c.status))
  const displayPcCases = pcFilter === 'active' ? activePcCases : pcFilter === 'closed' ? closedPcCases : pcCases

  async function handleAddPcCase(e) {
    e.preventDefault()
    if (!pcForm.member_name.trim() || !pcForm.description.trim()) return
    await onAddPcCase({ ...pcForm, hearing_date: pcForm.hearing_date || null })
    setPcForm({ case_type: 'Discipline Appeal', member_name: '', work_location: '', case_number: '', description: '', hearing_date: '', point_of_contact: '' })
    setShowAddPcCase(false)
  }

  return {
    userId, workLocations, quickLinks, addLink, deleteLink,
    linkTitle, setLinkTitle, linkUrl, setLinkUrl, showAddLink, setShowAddLink,
    showAddIssue, setShowAddIssue, showAddInteraction, setShowAddInteraction,
    filter, setFilter, noteText, setNoteText, noteSource, setNoteSource, noteTopic, setNoteTopic,
    showAddNote, setShowAddNote,
    issueForm, setIssueForm, interactionForm, setInteractionForm,
    syncing, totalNewCount, hasSynced, syncAll,
    issues, onUpdateStatus, onDeleteIssue, interactions, onUpdateInteraction,
    showArchived, onToggleArchived, cseaNotes, onDeleteCseaNote, onAddCseaNote,
    issueNotes, onAddIssueNote, onDeleteIssueNote,
    displayIssues, counts, handleAddIssue, handleAddInteraction,
    showAddPcCase, setShowAddPcCase, pcFilter, setPcFilter, pcForm, setPcForm,
    displayPcCases, activePcCases, handleAddPcCase, onUpdatePcStatus, onDeletePcCase,
    pcCaseNotes, onAddPcCaseNote, onDeletePcCaseNote,
  }
}

export function CseaTrackerInner({ api }) {
  const [tab, setTab] = useState('issues')

  return (
    <div className="csea-tracker">
      <div className="csea-tabs">
        <button className={`csea-tab ${tab === 'issues' ? 'active' : ''}`} onClick={() => setTab('issues')}>Issues</button>
        <button className={`csea-tab ${tab === 'interactions' ? 'active' : ''}`} onClick={() => setTab('interactions')}>Interactions {api.interactions.length > 0 && <span className="csea-tab-badge">{new Set(api.interactions.map(i => i.member_name || 'Unknown')).size}</span>}</button>
        <button className={`csea-tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Notes {api.cseaNotes.length > 0 && <span className="csea-tab-badge">{api.cseaNotes.length}</span>}</button>
        <button className={`csea-tab ${tab === 'links' ? 'active' : ''}`} onClick={() => setTab('links')}>Links {api.quickLinks.length > 0 && <span className="csea-tab-badge">{api.quickLinks.length}</span>}</button>
        <button className={`csea-tab ${tab === 'contract' ? 'active' : ''}`} onClick={() => setTab('contract')}>Contract/Constitution</button>
        <button className={`csea-tab ${tab === 'pc' ? 'active' : ''}`} onClick={() => setTab('pc')}>Personnel Commission {api.activePcCases.length > 0 && <span className="csea-tab-badge">{api.activePcCases.length}</span>}</button>
        <button className={`csea-tab ${tab === 'rif' ? 'active' : ''}`} onClick={() => setTab('rif')}>RIF Intake <span className="csea-tab-badge">{RIF_INTAKE.length}</span></button>
        <button className={`csea-tab ${tab === 'conference' ? 'active' : ''}`} onClick={() => setTab('conference')}>Conference <span className="csea-tab-badge">{CONFERENCE_ATTENDEES.length}</span></button>
      </div>

      {tab === 'issues' && (
        <div className="csea-panel">
          <div className="csea-toolbar">
            <div className="csea-filter-pills">
              {['active', 'resolved', 'all'].map(f => (
                <button key={f} className={`filter-pill ${api.filter === f ? 'active' : ''}`} onClick={() => api.setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <span className="csea-inline-stat" style={{ color: '#e05c5c' }}>{api.counts.Grievance} <span className="csea-inline-lbl">Grievances</span></span>
              <span className="csea-inline-stat" style={{ color: '#f0a040' }}>{api.counts.Gripe} <span className="csea-inline-lbl">Gripes</span></span>
              <span className="csea-inline-stat" style={{ color: '#5c9ee0' }}>{api.counts.Complaint} <span className="csea-inline-lbl">Complaints</span></span>
            </div>
            <button className="csea-add-btn" onClick={() => api.setShowAddIssue(true)}>+ Log Issue</button>
          </div>

          {api.showAddIssue && (
            <form className="csea-form" onSubmit={api.handleAddIssue}>
              <div className="csea-form-row">
                <div className="csea-type-btns">
                  {ISSUE_TYPES.map(t => (
                    <button key={t} type="button"
                      className={`type-btn ${api.issueForm.issue_type === t ? 'active' : ''}`}
                      style={{ '--tc': TYPE_COLORS[t] }}
                      onClick={() => api.setIssueForm(f => ({ ...f, issue_type: t }))}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <MemberSearch value={api.issueForm.member_name} onChange={v => api.setIssueForm(f => ({ ...f, member_name: v }))} />
              <select className="csea-input" value={api.issueForm.work_location}
                onChange={e => api.setIssueForm(f => ({ ...f, work_location: e.target.value }))}>
                <option value="">Work location</option>
                {api.workLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <textarea className="csea-textarea" placeholder="Description *" rows={3} value={api.issueForm.description}
                onChange={e => api.setIssueForm(f => ({ ...f, description: e.target.value }))} />
              <input className="csea-input" placeholder="Involved parties" value={api.issueForm.involved_parties}
                onChange={e => api.setIssueForm(f => ({ ...f, involved_parties: e.target.value }))} />
              <div className="csea-form-row">
                <div className="csea-priority-btns">
                  {PRIORITIES.map(p => (
                    <button key={p} type="button"
                      className={`priority-btn ${api.issueForm.priority === p ? 'active' : ''}`}
                      style={{ '--pc': PRIORITY_COLORS[p] }}
                      onClick={() => api.setIssueForm(f => ({ ...f, priority: p }))}
                    >{p}</button>
                  ))}
                </div>
                <div className="csea-form-actions">
                  <button type="button" className="csea-cancel" onClick={() => api.setShowAddIssue(false)}>Cancel</button>
                  <button type="submit" className="csea-save">Save</button>
                </div>
              </div>
            </form>
          )}

          <div className="csea-issue-list csea-interactions-grid">
            {api.displayIssues.length === 0 && (
              <p className="csea-empty">No {api.filter === 'active' ? 'active' : api.filter === 'resolved' ? 'resolved' : ''} issues</p>
            )}
            {api.displayIssues.map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onUpdateStatus={api.onUpdateStatus}
                onDelete={api.onDeleteIssue}
                notes={api.issueNotes[issue.id] || []}
                onAddNote={(text, date) => api.onAddIssueNote?.(issue.id, text, date)}
                onDeleteNote={(noteId) => api.onDeleteIssueNote?.(issue.id, noteId)}
              />
            ))}
          </div>
        </div>
      )}

      {tab === 'interactions' && <InteractionsPanel api={api} />}

      {tab === 'notes' && (
        <div className="csea-panel">
          <div className="csea-toolbar">
            <span />
            <button className="csea-add-btn" onClick={() => api.setShowAddNote(true)}>+ Add Note</button>
          </div>

          {api.showAddNote && (
            <form className="csea-form" onSubmit={async (e) => {
              e.preventDefault()
              if (!api.noteText.trim()) return
              await api.onAddCseaNote?.(api.noteText.trim(), api.noteSource.trim(), api.noteTopic.trim())
              api.setNoteText('')
              api.setNoteSource('')
              api.setNoteTopic('')
              api.setShowAddNote(false)
            }}>
              <div className="csea-notes-form-row">
                <input
                  className="csea-input"
                  placeholder="Topic (optional)"
                  value={api.noteTopic}
                  onChange={e => api.setNoteTopic(e.target.value)}
                />
                <input
                  className="csea-input"
                  placeholder="Source (optional)"
                  value={api.noteSource}
                  onChange={e => api.setNoteSource(e.target.value)}
                />
              </div>
              <textarea
                className="csea-textarea"
                placeholder="Details *"
                rows={2}
                value={api.noteText}
                onChange={e => api.setNoteText(e.target.value)}
              />
              <div className="csea-form-actions" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="csea-cancel" onClick={() => api.setShowAddNote(false)}>Cancel</button>
                <button type="submit" className="csea-save">Add</button>
              </div>
            </form>
          )}

          <div className="csea-issue-list csea-interactions-grid">
            {api.cseaNotes.length === 0 && <p className="csea-empty">No notes yet</p>}
            {api.cseaNotes.map(n => (
              <CseaNoteGroup key={n.id} note={n} onDelete={api.onDeleteCseaNote} />
            ))}
          </div>
        </div>
      )}

      {tab === 'links' && (
        <div className="csea-panel">
          <div className="csea-toolbar" style={{ justifyContent: 'flex-end' }}>
            <button className="csea-add-btn" onClick={() => api.setShowAddLink(true)}>+ Add Link</button>
          </div>

          {api.showAddLink && (
            <div className="csea-modal-overlay" onClick={() => api.setShowAddLink(false)}>
              <form
                className="csea-modal"
                onClick={e => e.stopPropagation()}
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!api.linkTitle.trim() || !api.linkUrl.trim()) return
                  const url = api.linkUrl.trim().startsWith('http') ? api.linkUrl.trim() : 'https://' + api.linkUrl.trim()
                  await api.addLink(api.linkTitle.trim(), url)
                  api.setLinkTitle('')
                  api.setLinkUrl('')
                  api.setShowAddLink(false)
                }}
              >
                <input
                  className="csea-input"
                  placeholder="Label *"
                  value={api.linkTitle}
                  onChange={e => api.setLinkTitle(e.target.value)}
                  autoFocus
                />
                <input
                  className="csea-input"
                  placeholder="URL *"
                  value={api.linkUrl}
                  onChange={e => api.setLinkUrl(e.target.value)}
                />
                <div className="csea-form-actions" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="csea-cancel" onClick={() => api.setShowAddLink(false)}>Cancel</button>
                  <button type="submit" className="csea-save">Add</button>
                </div>
              </form>
            </div>
          )}

          <div className="csea-issue-list csea-interactions-grid">
            {api.quickLinks.length === 0 && <p className="csea-empty">No links yet</p>}
            {api.quickLinks.map(l => (
              <div key={l.id} className="interaction-group">
                <div className="interaction-group-header">
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="interaction-group-name quick-link-anchor">{l.title}</a>
                  {l.created_at && (
                    <span className="interaction-date-badge">
                      {new Date(l.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  )}
                  <button className="interaction-delete-btn" title="Delete" onClick={() => api.deleteLink(l.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'contract' && (
        <div className="csea-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ContractReference userId={api.userId} />
        </div>
      )}

      {tab === 'pc' && <PersonnelCommissionPanel api={api} />}

      {tab === 'rif' && <RifIntakePanel />}

      {tab === 'conference' && <ConferencePanel />}
    </div>
  )
}

function PersonnelCommissionPanel({ api }) {
  return (
    <div className="csea-panel">
      <div className="csea-toolbar">
        <div className="csea-filter-pills">
          {['active', 'closed', 'all'].map(f => (
            <button key={f} className={`filter-pill ${api.pcFilter === f ? 'active' : ''}`} onClick={() => api.setPcFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className="csea-add-btn" onClick={() => api.setShowAddPcCase(true)}>+ Log Case</button>
      </div>

      {api.showAddPcCase && (
        <form className="csea-form" onSubmit={api.handleAddPcCase}>
          <div className="csea-form-row">
            <div className="csea-type-btns">
              {PC_CASE_TYPES.map(t => (
                <button key={t} type="button"
                  className={`type-btn ${api.pcForm.case_type === t ? 'active' : ''}`}
                  style={{ '--tc': '#1e3070' }}
                  onClick={() => api.setPcForm(f => ({ ...f, case_type: t }))}
                >{t}</button>
              ))}
            </div>
          </div>
          <MemberSearch value={api.pcForm.member_name} onChange={v => api.setPcForm(f => ({ ...f, member_name: v }))} />
          <select className="csea-input" value={api.pcForm.work_location}
            onChange={e => api.setPcForm(f => ({ ...f, work_location: e.target.value }))}>
            <option value="">Work location</option>
            {api.workLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <input className="csea-input" placeholder="PC case number" value={api.pcForm.case_number}
            onChange={e => api.setPcForm(f => ({ ...f, case_number: e.target.value }))} />
          <textarea className="csea-textarea" placeholder="Description *" rows={3} value={api.pcForm.description}
            onChange={e => api.setPcForm(f => ({ ...f, description: e.target.value }))} />
          <div className="csea-form-row">
            <input className="csea-input" type="date" value={api.pcForm.hearing_date}
              onChange={e => api.setPcForm(f => ({ ...f, hearing_date: e.target.value }))} />
            <input className="csea-input" placeholder="Point of contact" value={api.pcForm.point_of_contact}
              onChange={e => api.setPcForm(f => ({ ...f, point_of_contact: e.target.value }))} />
          </div>
          <div className="csea-form-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="csea-cancel" onClick={() => api.setShowAddPcCase(false)}>Cancel</button>
            <button type="submit" className="csea-save">Save</button>
          </div>
        </form>
      )}

      <div className="csea-issue-list csea-interactions-grid">
        {api.displayPcCases.length === 0 && (
          <p className="csea-empty">No {api.pcFilter === 'active' ? 'active' : api.pcFilter === 'closed' ? 'closed' : ''} Personnel Commission cases</p>
        )}
        {api.displayPcCases.map(pcCase => (
          <PcCaseCard
            key={pcCase.id}
            pcCase={pcCase}
            onUpdateStatus={api.onUpdatePcStatus}
            onDelete={api.onDeletePcCase}
            notes={api.pcCaseNotes[pcCase.id] || []}
            onAddNote={(text, date) => api.onAddPcCaseNote?.(pcCase.id, text, date)}
            onDeleteNote={(noteId) => api.onDeletePcCaseNote?.(pcCase.id, noteId)}
          />
        ))}
      </div>
    </div>
  )
}

function PcCaseCard({ pcCase, onUpdateStatus, onDelete, notes = [], onAddNote, onDeleteNote }) {
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
    <div className={`issue-card ${!PC_OPEN_STATUSES.includes(pcCase.status) ? 'resolved' : ''} ${expanded ? 'expanded' : ''}`}>
      <div className="issue-header" onClick={() => setExpanded(e => !e)}>
        <span className="issue-type-badge" style={{ background: '#1e307022', color: '#1e3070' }}>
          {pcCase.case_type}
        </span>
        <span className="issue-member">{pcCase.member_name}</span>
        <span className="issue-status-badge" style={{ background: (PC_STATUS_COLORS[pcCase.status] || '#53575a') + '22', color: PC_STATUS_COLORS[pcCase.status] || '#53575a' }}>
          {pcCase.status}
        </span>
        {notes.length > 0 && <span className="issue-notes-count">{notes.length}</span>}
        <span className="issue-chevron">{expanded ? '▾' : '▸'}</span>
      </div>

      {expanded && (
        <div className="issue-body">
          {pcCase.work_location && <div className="issue-detail">📍 {pcCase.work_location}</div>}
          {pcCase.case_number && <div className="issue-detail">🗂 Case #{pcCase.case_number}</div>}
          {pcCase.description && <div className="issue-desc">{pcCase.description}</div>}
          {pcCase.hearing_date && <div className="issue-detail">📅 Hearing: {new Date(pcCase.hearing_date + 'T12:00:00').toLocaleDateString()}</div>}
          {pcCase.point_of_contact && <div className="issue-detail">👤 {pcCase.point_of_contact}</div>}

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
              {PC_STATUSES.filter(s => s !== pcCase.status).map(s => (
                <button key={s} className="status-change-btn" style={{ '--sc': PC_STATUS_COLORS[s] }}
                  onClick={() => onUpdateStatus(pcCase.id, s)}>
                  → {s}
                </button>
              ))}
            </div>
            <button className="issue-delete-btn" onClick={() => onDelete(pcCase.id)}>Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

function memberCategory(member) {
  if (isEboardMember(member)) return 'eboard'
  if (isLaborRep(member)) return 'labor-reps'
  if (isAreaIMember(member)) return 'area1'
  if (isStateMember(member)) return 'state'
  return 'members'
}

function InteractionsPanel({ api }) {
  const [subTab, setSubTab] = useState('members')

  return (
    <div className="csea-panel">
      <div className="csea-toolbar">
        <div className="csea-filter-pills">
          <button className={`filter-pill ${subTab === 'members' ? 'active' : ''}`} onClick={() => setSubTab('members')}>Members</button>
          <button className={`filter-pill ${subTab === 'eboard' ? 'active' : ''}`} onClick={() => setSubTab('eboard')}>E-Board</button>
          <button className={`filter-pill ${subTab === 'labor-reps' ? 'active' : ''}`} onClick={() => setSubTab('labor-reps')}>Labor Reps</button>
          <button className={`filter-pill ${subTab === 'area1' ? 'active' : ''}`} onClick={() => setSubTab('area1')}>Area I</button>
          <button className={`filter-pill ${subTab === 'state' ? 'active' : ''}`} onClick={() => setSubTab('state')}>State</button>
          <button className={`filter-pill ${subTab === 'benefits' ? 'active' : ''}`} onClick={() => setSubTab('benefits')}>Member Benefits</button>
        </div>
        <button className="csea-archive-toggle" onClick={api.onToggleArchived}>
          {api.showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
        <button className="csea-mail-sync-btn" onClick={api.syncAll} disabled={api.syncing} title="Sync iCloud Mail">
          {api.syncing ? 'Syncing…' : api.hasSynced ? `↻ Sync${api.totalNewCount > 0 ? ` (+${api.totalNewCount})` : ''}` : '↻ Sync'}
        </button>
        <button className="csea-add-btn" onClick={() => api.setShowAddInteraction(true)}>+ Log Contact</button>
      </div>

      {subTab !== 'benefits' && api.showAddInteraction && (
        <form className="csea-form" onSubmit={api.handleAddInteraction}>
          <div className="csea-form-row">
            <div className="csea-type-btns">
              {INTERACTION_CATEGORIES.map(c => (
                <button key={c} type="button"
                  className={`type-btn ${api.interactionForm.category === c ? 'active' : ''}`}
                  style={{ '--tc': '#3164a0' }}
                  onClick={() => api.setInteractionForm(f => ({ ...f, category: c }))}
                >{c}</button>
              ))}
            </div>
          </div>
          <MemberSearch value={api.interactionForm.member_name} onChange={v => api.setInteractionForm(f => ({ ...f, member_name: v }))} />
          <select className="csea-input" value={api.interactionForm.work_location}
            onChange={e => api.setInteractionForm(f => ({ ...f, work_location: e.target.value }))}>
            <option value="">Work location</option>
            {api.workLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <input className="csea-input" type="date" value={api.interactionForm.date_spoke}
            onChange={e => api.setInteractionForm(f => ({ ...f, date_spoke: e.target.value }))} />
          <textarea className="csea-textarea" placeholder="What was discussed?" rows={3} value={api.interactionForm.discussion}
            onChange={e => api.setInteractionForm(f => ({ ...f, discussion: e.target.value }))} />
          <input className="csea-input" placeholder="Others involved" value={api.interactionForm.who_involved}
            onChange={e => api.setInteractionForm(f => ({ ...f, who_involved: e.target.value }))} />
          <div className="csea-form-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="csea-cancel" onClick={() => api.setShowAddInteraction(false)}>Cancel</button>
            <button type="submit" className="csea-save">Save</button>
          </div>
        </form>
      )}

      {subTab === 'benefits' ? (
        <div className="csea-issue-list csea-interactions-grid">
          {MEMBER_BENEFITS_CONTACTS.map(c => (
            <div key={c.email} className="interaction-card">
              <div className="interaction-header">
                <span className="interaction-group-name" style={{ fontSize: 13 }}>{c.name}</span>
              </div>
              <p className="interaction-who-text">{c.role}</p>
              <a className="interaction-doc-link" href={`mailto:${c.email}`}>✉ {c.email}</a>
            </div>
          ))}
        </div>
      ) : (
        <div className="csea-issue-list csea-interactions-grid">
          {api.interactions.length === 0 && <p className="csea-empty">No interactions logged yet</p>}
          {Object.entries(
            api.interactions.reduce((groups, i) => {
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
          ).filter(([member]) => memberCategory(member) === subTab)
            .sort(([a], [b]) => a.localeCompare(b)).map(([member, items]) => (
            <MemberInteractionGroup key={member} member={member} items={items} onUpdate={api.onUpdateInteraction} workLocations={api.workLocations} />
          ))}
        </div>
      )}
    </div>
  )
}

const RIF_ACTION_COLORS = { RIF: '#3164a0', Demotion: '#f7941d', 'Double Demotion': '#8e2a2a' }

function RifIntakePanel() {
  const platformCounts = rifPlatformSummary()
  const actionCounts = rifActionSummary()

  return (
    <div className="csea-panel">
      <div className="csea-toolbar">
        <span className="csea-toolbar-label">RIF Support Intake Report — Overview of Affected Agents by Platform</span>
        <span className="csea-inline-stat" style={{ color: 'var(--csea-blue)' }}>{RIF_INTAKE.length} <span className="csea-inline-lbl">Total Agents</span></span>
      </div>

      <div className="rif-summary-row">
        <div className="rif-summary-card rif-summary-card-wide">
          <div className="rif-summary-title">Summary by Platform</div>
          <div className="rif-summary-cols">
            {platformCounts.map(([platform, count]) => (
              <div key={platform} className="rif-summary-cols-item">
                <span>{platform}</span>
                <span className="rif-summary-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rif-summary-card">
          <div className="rif-summary-title">RIF / Demotion Breakdown</div>
          <table className="rif-summary-table">
            <tbody>
              {actionCounts.map(([action, count]) => (
                <tr key={action}>
                  <td>
                    <span className="rif-action-dot" style={{ background: RIF_ACTION_COLORS[action] || '#53575a' }} />
                    {action}
                  </td>
                  <td className="rif-summary-count">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="csea-issue-list" style={{ padding: '0 16px 16px' }}>
        <div className="rif-table-wrap">
          <table className="rif-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Employee ID</th>
                <th>Personal Email</th>
                <th>Platform</th>
                <th>Job Title</th>
                <th>Work Location</th>
                <th>RIF or Demotion</th>
              </tr>
            </thead>
            <tbody>
              {RIF_INTAKE.map((r, i) => (
                <tr key={r.employeeId}>
                  <td>{i + 1}</td>
                  <td>{r.name}</td>
                  <td>{r.employeeId}</td>
                  <td>{r.email}</td>
                  <td>{r.platform}</td>
                  <td>{r.jobTitle}</td>
                  <td>{r.workLocation}</td>
                  <td>
                    <span className="rif-action-badge" style={{ color: RIF_ACTION_COLORS[r.action] || '#53575a', background: (RIF_ACTION_COLORS[r.action] || '#53575a') + '22' }}>
                      {r.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ConferencePanel() {
  return (
    <div className="csea-panel">
      <div className="csea-toolbar">
        <span className="csea-toolbar-label">Conference</span>
        <span className="csea-inline-stat" style={{ color: 'var(--csea-blue)' }}>{CONFERENCE_ATTENDEES.length} <span className="csea-inline-lbl">Attendees</span></span>
      </div>

      <div className="csea-issue-list csea-issue-list--fill" style={{ padding: '0 16px 16px' }}>
        <div className="rif-table-wrap rif-table-wrap--fill">
          <table className="rif-table rif-table--wrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Attending</th>
                <th>Basis</th>
                <th>Position</th>
                <th>Shirt Size</th>
                <th>Shirt Status</th>
              </tr>
            </thead>
            <tbody>
              {CONFERENCE_ATTENDEES.map((a, i) => (
                <tr key={a.name}>
                  <td>{i + 1}</td>
                  <td><span className="rif-cell-clamp">{a.name}</span></td>
                  <td>{a.attending}</td>
                  <td>{a.basis}</td>
                  <td><span className="rif-cell-clamp">{a.position}</span></td>
                  <td>{a.shirtSize || '—'}</td>
                  <td><span className="rif-cell-clamp">{a.shirtStatus || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MemberInteractionGroup({ member, items, onUpdate, workLocations }) {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <div className={`interaction-group${collapsed ? '' : ' expanded'}`}>
      <div className="interaction-group-header" style={{ cursor: 'pointer' }} onClick={() => setCollapsed(c => !c)}>
        <span className="interaction-group-name">{member}</span>
        <span className="interaction-group-count">{items.length}</span>
        <span className="interaction-group-toggle">{collapsed ? '▾' : '▴'}</span>
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

function CseaNoteGroup({ note: n, onDelete }) {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <div className={`interaction-group${collapsed ? '' : ' expanded'}`}>
      <div className="interaction-group-header" style={{ cursor: 'pointer' }} onClick={() => setCollapsed(c => !c)}>
        <span className="interaction-group-name">{n.topic || 'Topic'}</span>
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
            <p className="interaction-disc-text">{n.note}</p>
          </div>
        </div>
      )}
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
      {i.meeting_doc_url && (
        <a className="interaction-doc-link" href={i.meeting_doc_url} target="_blank" rel="noreferrer">📄 Meeting Notes</a>
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
    <div className={`issue-card ${issue.status === 'Resolved' || issue.status === 'Closed' ? 'resolved' : ''} ${expanded ? 'expanded' : ''}`}>
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

export default function CseaTracker(props) {
  const api = useCseaPage(props)
  return (
    <CseaTrackerInner api={api} />
  )
}
