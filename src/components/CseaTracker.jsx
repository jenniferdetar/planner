import { useState, useRef, useEffect } from 'react'
import { useCseaMembers, useWorkLocations } from '../hooks/useCseaData'
import { useQuickLinks } from '../hooks/useQuickLinks'
import { useICloudMailSync } from '../hooks/useICloudMailSync'
import ContractReference from './ContractReference'
import { RIF_INTAKE, rifPlatformSummary, rifActionSummary } from '../data/rifIntake'
import { MEMBER_BENEFITS_CONTACTS } from '../data/memberBenefitsContacts'
import { LABOR_REP_CONTACTS } from '../data/laborRepContacts'
import { CONFERENCE_ATTENDEES } from '../data/conferenceAttendees'
import { STANDING_COMMITTEES, OTHER_APPOINTMENTS } from '../data/committeeAppointments'
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

export function useCseaPage({ userId, issues, onAddIssue, onUpdateStatus, onDeleteIssue, interactions, onAddInteraction, onUpdateInteraction, showArchived, onToggleArchived, asanaTasks = [], onCompleteAsanaTask, onUpdateAsanaTaskNotes, cseaNotes = [], onAddCseaNote, onArchiveCseaNote, onDeleteCseaNote, showArchivedNotes, onToggleArchivedNotes, issueNotes = {}, onAddIssueNote, onDeleteIssueNote, pcCases = [], onAddPcCase, onUpdatePcStatus, onDeletePcCase, pcCaseNotes = {}, onAddPcCaseNote, onDeletePcCaseNote, credReports = [], onAddCredReport, onUpdateCredReport, onDeleteCredReport, delegateCards = [], onAddDelegateCard, onUpdateDelegateCard, onDeleteDelegateCard }) {
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
    onArchiveCseaNote, showArchivedNotes, onToggleArchivedNotes,
    issueNotes, onAddIssueNote, onDeleteIssueNote,
    displayIssues, counts, handleAddIssue, handleAddInteraction,
    showAddPcCase, setShowAddPcCase, pcFilter, setPcFilter, pcForm, setPcForm,
    displayPcCases, activePcCases, handleAddPcCase, onUpdatePcStatus, onDeletePcCase,
    pcCaseNotes, onAddPcCaseNote, onDeletePcCaseNote,
    credReports, onAddCredReport, onUpdateCredReport, onDeleteCredReport,
    delegateCards, onAddDelegateCard, onUpdateDelegateCard, onDeleteDelegateCard,
  }
}

const CONFERENCE_ARCHIVED_KEY = 'csea_conference_archived'

export function CseaTrackerInner({ api }) {
  const [tab, setTab] = useState('issues')
  const [conferenceArchived, setConferenceArchived] = useState(() => {
    try { return localStorage.getItem(CONFERENCE_ARCHIVED_KEY) === '1' } catch { return false }
  })

  function archiveConference() {
    setConferenceArchived(true)
    try { localStorage.setItem(CONFERENCE_ARCHIVED_KEY, '1') } catch { /* ignore */ }
    setTab((t) => (t === 'conference' ? 'issues' : t))
  }

  function unarchiveConference() {
    setConferenceArchived(false)
    try { localStorage.removeItem(CONFERENCE_ARCHIVED_KEY) } catch { /* ignore */ }
    setTab('conference')
  }

  return (
    <div className="csea-tracker">
      <div className="csea-tabs">
        <button className={`csea-tab ${tab === 'issues' ? 'active' : ''}`} onClick={() => setTab('issues')}>Issues</button>
        <button className={`csea-tab ${tab === 'interactions' ? 'active' : ''}`} onClick={() => setTab('interactions')}>Interactions {api.interactions.length > 0 && <span className="csea-tab-badge">{new Set(api.interactions.map(i => i.member_name || 'Unknown')).size}</span>}</button>
        <button className={`csea-tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Topics {api.cseaNotes.length > 0 && <span className="csea-tab-badge">{api.cseaNotes.length}</span>}</button>
        <button className={`csea-tab ${tab === 'links' ? 'active' : ''}`} onClick={() => setTab('links')}>Links {api.quickLinks.length > 0 && <span className="csea-tab-badge">{api.quickLinks.length}</span>}</button>
        <button className={`csea-tab ${tab === 'contract' ? 'active' : ''}`} onClick={() => setTab('contract')}>Contract/Constitution</button>
        <button className={`csea-tab ${tab === 'committees' ? 'active' : ''}`} onClick={() => setTab('committees')}>Committees <span className="csea-tab-badge">{STANDING_COMMITTEES.length + OTHER_APPOINTMENTS.length}</span></button>
        <button className={`csea-tab ${tab === 'pc' ? 'active' : ''}`} onClick={() => setTab('pc')}>Personnel Commission {api.activePcCases.length > 0 && <span className="csea-tab-badge">{api.activePcCases.length}</span>}</button>
        <button className={`csea-tab ${tab === 'rif' ? 'active' : ''}`} onClick={() => setTab('rif')}>RIF Intake <span className="csea-tab-badge">{RIF_INTAKE.length}</span></button>
        {!conferenceArchived && (
          <button className={`csea-tab ${tab === 'conference' ? 'active' : ''}`} onClick={() => setTab('conference')}>Conference <span className="csea-tab-badge">{CONFERENCE_ATTENDEES.length}</span></button>
        )}
        {conferenceArchived && (
          <button className="csea-tab csea-tab--restore" onClick={unarchiveConference} title="Restore the archived Conference page">Conference ↩ Archived</button>
        )}
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
            <button className="csea-archive-toggle" onClick={api.onToggleArchivedNotes}>
              {api.showArchivedNotes ? 'Hide Archived' : 'Show Archived'}
            </button>
            <button className="csea-add-btn" onClick={() => api.setShowAddNote(true)}>+ Add Topic</button>
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
            {api.cseaNotes.length === 0 && <p className="csea-empty">No topics yet</p>}
            {api.cseaNotes.map(n => (
              <CseaNoteGroup key={n.id} note={n} onArchive={api.onArchiveCseaNote} onDelete={api.onDeleteCseaNote} />
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

      {tab === 'committees' && <CommitteesPanel />}

      {tab === 'pc' && <PersonnelCommissionPanel api={api} />}

      {tab === 'rif' && <RifIntakePanel />}

      {tab === 'conference' && !conferenceArchived && <ConferencePanel api={api} onArchive={archiveConference} />}
    </div>
  )
}

function CommitteeCard({ committee }) {
  return (
    <div className="committee-card">
      <div className="committee-card-header">
        <span className="committee-card-name">{committee.name}</span>
        <span className="committee-card-count">{committee.members.length}</span>
      </div>
      <ul className="committee-member-list">
        {committee.members.map((m, i) => (
          <li key={i} className={`committee-member ${m.role ? 'is-lead' : ''}`}>
            <span className="committee-member-name">
              {m.title && <span className="committee-member-title">{m.title} </span>}
              {m.name}
              {m.note && <span className="committee-member-note"> — {m.note}</span>}
            </span>
            {m.role && <span className="committee-role-badge">{m.role}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

function CommitteesPanel() {
  return (
    <div className="csea-panel">
      <div className="csea-toolbar">
        <span className="csea-toolbar-label">Standing Committee Appointments — 2026</span>
        <span className="csea-inline-stat" style={{ color: 'var(--csea-blue)' }}>{STANDING_COMMITTEES.length} <span className="csea-inline-lbl">Committees</span></span>
      </div>

      <div className="csea-issue-list csea-issue-list--fill committee-panel" style={{ padding: '0 16px 16px' }}>
        <div className="committee-grid">
          {STANDING_COMMITTEES.map((c) => (
            <CommitteeCard key={c.name} committee={c} />
          ))}
        </div>

        <div className="committee-section-note">
          Not committees, but appointments are made per the Chapter Constitution.
        </div>

        <div className="committee-grid">
          {OTHER_APPOINTMENTS.map((c) => (
            <CommitteeCard key={c.name} committee={c} />
          ))}
        </div>
      </div>
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
          {subTab === 'labor-reps' && LABOR_REP_CONTACTS.map(c => (
            <div key={c.email} className="interaction-card">
              <div className="interaction-header">
                <span className="interaction-group-name" style={{ fontSize: 13 }}>{c.name}</span>
              </div>
              <p className="interaction-who-text">{c.areas}</p>
              <a className="interaction-doc-link" href={`mailto:${c.email}`}>✉ {c.email}</a>
              <p className="interaction-who-text">{c.phone}</p>
            </div>
          ))}
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

const SHIRT_PRICE = 25

function isShirtPaid(a) {
  return (a.shirtStatus || '').trim().toLowerCase().startsWith('paid')
}

function hasShirtSize(a) {
  return !!(a.shirtSize && a.shirtSize.trim())
}

// Dollars this attendee owes for a shirt ($0 if they aren't ordering one).
function shirtOwed(a) {
  return hasShirtSize(a) ? SHIRT_PRICE : 0
}

// Dollars already collected. An explicit `paid` amount (e.g. a partial
// payment) wins; otherwise a "Paid" status counts as paid in full.
function shirtPaid(a) {
  if (!hasShirtSize(a)) return 0
  if (typeof a.paid === 'number') return Math.min(a.paid, SHIRT_PRICE)
  return isShirtPaid(a) ? SHIRT_PRICE : 0
}

function shirtDue(a) {
  return shirtOwed(a) - shirtPaid(a)
}

// "Outstanding" = still owes money for a shirt. Anyone fully paid, or not
// ordering a shirt (no size), drops to the lower area.
function isOutstanding(a) {
  return shirtDue(a) > 0
}

function AttendeesTable({ attendees }) {
  return (
    <div className="rif-table-wrap conf-table-wrap">
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
          {attendees.map((a, i) => (
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
  )
}

const sumBy = (list, fn) => list.reduce((sum, a) => sum + fn(a), 0)

function AttendeesPanel() {
  const outstanding = CONFERENCE_ATTENDEES.filter(isOutstanding)
  const paid = CONFERENCE_ATTENDEES.filter((a) => !isOutstanding(a))

  // Money still owed vs. money already collected — across everyone, so a
  // partial payment shows up in both totals (still due, already collected).
  const totalDue = sumBy(CONFERENCE_ATTENDEES, shirtDue)
  const totalCollected = sumBy(CONFERENCE_ATTENDEES, shirtPaid)

  return (
    <div className="csea-issue-list csea-issue-list--fill conf-attendees" style={{ padding: '0 16px 16px' }}>
      <div className="conf-section">
        <div className="conf-section-header conf-section-header--outstanding">
          <span>Outstanding</span>
          <span className="conf-section-count">{outstanding.length}</span>
          <span className="conf-section-funds">${totalDue} due</span>
        </div>
        {outstanding.length === 0
          ? <p className="csea-empty">Everyone has paid 🎉</p>
          : <AttendeesTable attendees={outstanding} />}
      </div>

      <div className="conf-section">
        <div className="conf-section-header conf-section-header--paid">
          <span>Paid</span>
          <span className="conf-section-count">{paid.length}</span>
          <span className="conf-section-funds">${totalCollected} collected</span>
        </div>
        {paid.length === 0
          ? <p className="csea-empty">No payments recorded yet</p>
          : <AttendeesTable attendees={paid} />}
      </div>
    </div>
  )
}

function ConferencePanel({ api, onArchive }) {
  const [subTab, setSubTab] = useState('attendees')

  return (
    <div className="csea-panel">
      <div className="csea-toolbar">
        <div className="csea-filter-pills">
          <button className={`filter-pill ${subTab === 'attendees' ? 'active' : ''}`} onClick={() => setSubTab('attendees')}>Attendees</button>
          <button className={`filter-pill ${subTab === 'credentials' ? 'active' : ''}`} onClick={() => setSubTab('credentials')}>Credentials Report</button>
          <button className={`filter-pill ${subTab === 'delegate' ? 'active' : ''}`} onClick={() => setSubTab('delegate')}>Delegate Report Card</button>
        </div>
        <div className="conf-toolbar-right">
          {subTab === 'attendees' && (
            <span className="conf-attendee-stats">
              <span className="csea-inline-stat" style={{ color: 'var(--csea-dark-orange)' }}>{CONFERENCE_ATTENDEES.filter(isOutstanding).length} <span className="csea-inline-lbl">Outstanding</span></span>
              <span className="csea-inline-stat" style={{ color: 'var(--csea-success)' }}>{CONFERENCE_ATTENDEES.filter(a => !isOutstanding(a)).length} <span className="csea-inline-lbl">Paid</span></span>
            </span>
          )}
          {subTab === 'credentials' && <span className="csea-inline-stat" style={{ color: 'var(--csea-blue)' }}>{api.credReports.length} <span className="csea-inline-lbl">Sessions</span></span>}
          {subTab === 'delegate' && <span className="csea-inline-stat" style={{ color: 'var(--csea-blue)' }}>{api.delegateCards.length} <span className="csea-inline-lbl">Days</span></span>}
          {onArchive && (
            <button className="conf-archive-btn" onClick={onArchive} title="Archive the entire Conference page">Archive Page</button>
          )}
        </div>
      </div>

      {subTab === 'attendees' ? (
        <AttendeesPanel />
      ) : subTab === 'credentials' ? (
        <CredentialsReportPanel api={api} />
      ) : (
        <DelegateReportPanel api={api} />
      )}
    </div>
  )
}

const CRED_CHAPTER_ROWS = [
  { key: 'chapters_authorized', label: 'No. of Chapters Authorized' },
  { key: 'chapters_registered', label: 'No. of Chapters with Registered Delegates' },
  { key: 'chapters_attending', label: 'No. of Chapters IN ATTENDANCE as of this report' },
]

const CRED_DELEGATE_ROWS = [
  { key: 'bod', label: 'No. of Board of Directors Members' },
  { key: 'scc', label: 'No. of Standing Committee Chairs' },
  { key: 'life', label: 'No. of Life Members' },
  { key: 'retiree', label: 'No. of Retiree Unit Executive Board Members' },
  { key: 'regional', label: 'No. of Regional Representatives' },
  { key: 'chapter', label: 'No. of Chapter Delegates' },
]

function CredentialsReportPanel({ api }) {
  async function handleAdd() {
    const n = api.credReports.length + 1
    await api.onAddCredReport?.({ session_name: `Business Meeting ${n}` })
  }

  return (
    <div className="csea-issue-list csea-issue-list--fill cred-panel" style={{ padding: '0 16px 16px' }}>
      <p className="cred-intro">
        Report of Credentials Committee — one entry per business meeting session.
        The printed form repeats the same information on its top and bottom halves;
        a single entry here covers both.
      </p>

      {api.credReports.length === 0 && (
        <p className="csea-empty">No sessions yet. Add one for each business meeting.</p>
      )}

      {api.credReports.map((report) => (
        <CredentialsReportCard
          key={report.id}
          report={report}
          onUpdate={api.onUpdateCredReport}
          onDelete={api.onDeleteCredReport}
        />
      ))}

      <button className="cred-add-session" onClick={handleAdd}>+ Add Session</button>
    </div>
  )
}

function CredentialsReportCard({ report, onUpdate, onDelete }) {
  const [draft, setDraft] = useState(() => ({
    session_name: report.session_name || '',
    report_date: report.report_date || '',
    report_time: report.report_time || '',
    data: {
      chapters_authorized: '', chapters_registered: '', chapters_attending: '',
      others_attendance: '',
      delegates: {},
      ...(report.data || {}),
    },
  }))
  const [collapsed, setCollapsed] = useState(false)

  function commit(next) {
    onUpdate?.(report.id, {
      session_name: next.session_name,
      report_date: next.report_date || null,
      report_time: next.report_time,
      data: next.data,
    })
  }

  function setHeader(field, value) {
    setDraft((d) => ({ ...d, [field]: value }))
  }

  function setChapter(key, value) {
    setDraft((d) => ({ ...d, data: { ...d.data, [key]: value } }))
  }

  function setDelegate(row, col, value) {
    setDraft((d) => ({
      ...d,
      data: {
        ...d.data,
        delegates: {
          ...d.data.delegates,
          [row]: { ...(d.data.delegates?.[row] || {}), [col]: value },
        },
      },
    }))
  }

  const num = (v) => (v === '' || v == null ? 0 : Number(v) || 0)
  const totalDelegates = CRED_DELEGATE_ROWS.reduce(
    (sum, r) => sum + num(draft.data.delegates?.[r.key]?.attending), 0
  )
  const totalAttendance = totalDelegates + num(draft.data.others_attendance)

  return (
    <div className={`cred-card ${collapsed ? 'collapsed' : ''}`}>
      <div className="cred-card-header">
        <button className="cred-collapse" onClick={() => setCollapsed((c) => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '▸' : '▾'}
        </button>
        <span className="cred-card-org">California School Employees Association</span>
        <span className="cred-card-sub">Report of Credentials Committee</span>
        <span className="cred-card-name">{draft.session_name || 'Untitled Session'}</span>
        <button className="cred-delete" onClick={() => onDelete?.(report.id)} title="Delete session">✕</button>
      </div>

      {!collapsed && (
        <div className="cred-card-body">
          <div className="cred-meta">
            <label className="cred-field">
              <span>Date</span>
              <input className="csea-input" type="date" value={draft.report_date}
                onChange={(e) => setHeader('report_date', e.target.value)}
                onBlur={() => commit({ ...draft, report_date: draft.report_date })} />
            </label>
            <label className="cred-field">
              <span>Time</span>
              <input className="csea-input" placeholder="e.g. 9:00 AM" value={draft.report_time}
                onChange={(e) => setHeader('report_time', e.target.value)}
                onBlur={() => commit(draft)} />
            </label>
            <label className="cred-field cred-field-wide">
              <span>Session</span>
              <input className="csea-input" placeholder="e.g. Morning Business Meeting" value={draft.session_name}
                onChange={(e) => setHeader('session_name', e.target.value)}
                onBlur={() => commit(draft)} />
            </label>
          </div>

          <div className="cred-section-title">Chapter Report</div>
          <div className="cred-chapter-grid">
            {CRED_CHAPTER_ROWS.map((r) => (
              <div key={r.key} className="cred-line">
                <span className="cred-line-label">{r.label}</span>
                <input className="cred-num" type="number" inputMode="numeric" min="0"
                  value={draft.data[r.key] ?? ''}
                  onChange={(e) => setChapter(r.key, e.target.value)}
                  onBlur={() => commit(draft)} />
              </div>
            ))}
          </div>

          <div className="cred-section-title">Delegate Report</div>
          <div className="cred-table-wrap">
            <table className="cred-table">
              <thead>
                <tr>
                  <th className="cred-table-rowhead"></th>
                  <th>Authorized</th>
                  <th>Registered</th>
                  <th>Attending</th>
                </tr>
              </thead>
              <tbody>
                {CRED_DELEGATE_ROWS.map((r) => (
                  <tr key={r.key}>
                    <td className="cred-table-rowhead">{r.label}</td>
                    {['authorized', 'registered', 'attending'].map((col) => (
                      <td key={col}>
                        <input className="cred-num" type="number" inputMode="numeric" min="0"
                          value={draft.data.delegates?.[r.key]?.[col] ?? ''}
                          onChange={(e) => setDelegate(r.key, col, e.target.value)}
                          onBlur={() => commit(draft)} />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="cred-total-row">
                  <td className="cred-table-rowhead">TOTAL DELEGATES IN ATTENDANCE</td>
                  <td></td>
                  <td></td>
                  <td className="cred-total-cell">{totalDelegates}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="cred-section-title">Others in Attendance</div>
          <div className="cred-line">
            <span className="cred-line-label">Honor Roll, Conference Committee Members, Guests, Visitors, Staff</span>
            <input className="cred-num" type="number" inputMode="numeric" min="0"
              value={draft.data.others_attendance ?? ''}
              onChange={(e) => setChapter('others_attendance', e.target.value)}
              onBlur={() => commit(draft)} />
          </div>

          <div className="cred-line cred-grand-total">
            <span className="cred-line-label">TOTAL IN ATTENDANCE</span>
            <span className="cred-total-cell">{totalAttendance}</span>
          </div>
        </div>
      )}
    </div>
  )
}

const DELEGATE_CRED_ROWS = [
  { key: 'chapters_authorized', label: 'Number of CSEA Chapters Authorized', chapterCount: true },
  { key: 'chapters_in_attendance', label: 'Number of Chapters IN ATTENDANCE', chapterCount: true },
  { key: 'association_officers', label: 'Number of Association Officers' },
  { key: 'standing_committee_chairs', label: 'Number of Standing Committee Chairpersons' },
  { key: 'life_members', label: 'Number of Life Members' },
  { key: 'retiree_board_members', label: 'Number of Retiree Unit Executive Board Members' },
  { key: 'regional_representatives', label: 'Number of Regional Representatives' },
  { key: 'chapter_delegates', label: 'Number of Chapter Delegates' },
  { key: 'others_in_attendance', label: 'Others in Attendance (Honor Roll, Conference Committee Members, Guests, Visitors, Staff)' },
]

function DelegateReportPanel({ api }) {
  async function handleAdd() {
    const n = api.delegateCards.length + 1
    await api.onAddDelegateCard?.({ day_label: `Day ${n}` })
  }

  return (
    <div className="csea-issue-list csea-issue-list--fill cred-panel" style={{ padding: '0 16px 16px' }}>
      <p className="cred-intro">
        Delegate Business Report Card — report critical Conference business back to your
        chapter membership. Add one card per Conference day; each covers that day's business.
      </p>

      {api.delegateCards.length === 0 && (
        <p className="csea-empty">No days yet. Add a card for each day of Conference.</p>
      )}

      {api.delegateCards.map((card) => (
        <DelegateReportCard
          key={card.id}
          card={card}
          onUpdate={api.onUpdateDelegateCard}
          onDelete={api.onDeleteDelegateCard}
        />
      ))}

      <button className="cred-add-session" onClick={handleAdd}>+ Add Day</button>
    </div>
  )
}

function DelegateReportCard({ card, onUpdate, onDelete }) {
  const [draft, setDraft] = useState(() => {
    const d = card.data || {}
    return {
      day_label: card.day_label || '',
      report_date: card.report_date || '',
      credentials: { ...(d.credentials || {}) },
      provider_area: d.provider_area || '',
      speakers: d.speakers && d.speakers.length ? d.speakers : [{ speaker: '', topic: '' }, { speaker: '', topic: '' }],
      education_day: d.education_day || '',
      resolutions: { number: '', passed: '', failed: '', stood_out: '', ...(d.resolutions || {}) },
      budget: d.budget || '',
      overall: d.overall || '',
      networking: d.networking || '',
    }
  })
  const [collapsed, setCollapsed] = useState(false)

  function commit(next) {
    const state = next || draft
    onUpdate?.(card.id, {
      day_label: state.day_label,
      report_date: state.report_date || null,
      data: {
        credentials: state.credentials,
        provider_area: state.provider_area,
        speakers: state.speakers,
        education_day: state.education_day,
        resolutions: state.resolutions,
        budget: state.budget,
        overall: state.overall,
        networking: state.networking,
      },
    })
  }

  const set = (field, value) => setDraft((d) => ({ ...d, [field]: value }))
  const setCred = (key, value) => setDraft((d) => ({ ...d, credentials: { ...d.credentials, [key]: value } }))
  const setRes = (key, value) => setDraft((d) => ({ ...d, resolutions: { ...d.resolutions, [key]: value } }))
  const setSpeaker = (idx, key, value) => setDraft((d) => ({
    ...d,
    speakers: d.speakers.map((s, i) => (i === idx ? { ...s, [key]: value } : s)),
  }))
  const addSpeaker = () => setDraft((d) => ({ ...d, speakers: [...d.speakers, { speaker: '', topic: '' }] }))
  const removeSpeaker = (idx) => setDraft((d) => {
    const speakers = d.speakers.filter((_, i) => i !== idx)
    const next = { ...d, speakers: speakers.length ? speakers : [{ speaker: '', topic: '' }] }
    commit(next)
    return next
  })

  const num = (v) => (v === '' || v == null ? 0 : Number(v) || 0)
  const totalAttendance = DELEGATE_CRED_ROWS
    .filter((r) => !r.chapterCount)
    .reduce((sum, r) => sum + num(draft.credentials[r.key]), 0)

  return (
    <div className={`cred-card ${collapsed ? 'collapsed' : ''}`}>
      <div className="cred-card-header">
        <button className="cred-collapse" onClick={() => setCollapsed((c) => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '▸' : '▾'}
        </button>
        <span className="cred-card-org">California School Employees Association</span>
        <span className="cred-card-sub">Delegate Business Report Card</span>
        <span className="cred-card-name">{draft.day_label || 'Untitled Day'}</span>
        <button className="cred-delete" onClick={() => onDelete?.(card.id)} title="Delete day">✕</button>
      </div>

      {!collapsed && (
        <div className="cred-card-body">
          <div className="cred-meta">
            <label className="cred-field cred-field-wide">
              <span>Day</span>
              <input className="csea-input" placeholder="e.g. Day 1 – Monday" value={draft.day_label}
                onChange={(e) => set('day_label', e.target.value)} onBlur={() => commit()} />
            </label>
            <label className="cred-field">
              <span>Date</span>
              <input className="csea-input" type="date" value={draft.report_date}
                onChange={(e) => set('report_date', e.target.value)} onBlur={() => commit()} />
            </label>
          </div>

          <div className="cred-section-title">Credentials Report <span className="cred-section-note">(use final Wednesday Credentials Report)</span></div>
          <div className="cred-chapter-grid">
            {DELEGATE_CRED_ROWS.map((r) => (
              <div key={r.key} className="cred-line">
                <span className="cred-line-label">{r.label}</span>
                <input className="cred-num" type="number" inputMode="numeric" min="0"
                  value={draft.credentials[r.key] ?? ''}
                  onChange={(e) => setCred(r.key, e.target.value)} onBlur={() => commit()} />
              </div>
            ))}
          </div>
          <div className="cred-line cred-grand-total">
            <span className="cred-line-label">TOTAL NUMBER IN ATTENDANCE</span>
            <span className="cred-total-cell">{totalAttendance}</span>
          </div>

          <div className="cred-section-title">Provider Area</div>
          <p className="cred-prompt">What one benefit did you learn about that you could share with other members of the chapter?</p>
          <textarea className="csea-textarea" rows={2} value={draft.provider_area}
            onChange={(e) => set('provider_area', e.target.value)} onBlur={() => commit()} />

          <div className="cred-section-title">Speakers</div>
          <p className="cred-prompt">Which speaker(s) stood out in your mind, and what did they cover?</p>
          {draft.speakers.map((s, i) => (
            <div key={i} className="cred-speaker-row">
              <input className="csea-input" placeholder="Speaker" value={s.speaker}
                onChange={(e) => setSpeaker(i, 'speaker', e.target.value)} onBlur={() => commit()} />
              <input className="csea-input" placeholder="Topic" value={s.topic}
                onChange={(e) => setSpeaker(i, 'topic', e.target.value)} onBlur={() => commit()} />
              <button type="button" className="cred-speaker-remove" title="Remove speaker" onClick={() => removeSpeaker(i)}>✕</button>
            </div>
          ))}
          <button type="button" className="cred-add-inline" onClick={addSpeaker}>+ Add Speaker</button>

          <div className="cred-section-title">Education Day</div>
          <p className="cred-prompt">Which session did you attend and what was the value you received from your attendance? What information would benefit all members?</p>
          <textarea className="csea-textarea" rows={2} value={draft.education_day}
            onChange={(e) => set('education_day', e.target.value)} onBlur={() => commit()} />

          <div className="cred-section-title">Resolutions Report</div>
          <div className="cred-chapter-grid">
            <div className="cred-line">
              <span className="cred-line-label">Number of Resolutions</span>
              <input className="cred-num" type="number" inputMode="numeric" min="0" value={draft.resolutions.number ?? ''}
                onChange={(e) => setRes('number', e.target.value)} onBlur={() => commit()} />
            </div>
            <div className="cred-line">
              <span className="cred-line-label">Number Passed/Approved</span>
              <input className="cred-num" type="number" inputMode="numeric" min="0" value={draft.resolutions.passed ?? ''}
                onChange={(e) => setRes('passed', e.target.value)} onBlur={() => commit()} />
            </div>
            <div className="cred-line">
              <span className="cred-line-label">Number Failed</span>
              <input className="cred-num" type="number" inputMode="numeric" min="0" value={draft.resolutions.failed ?? ''}
                onChange={(e) => setRes('failed', e.target.value)} onBlur={() => commit()} />
            </div>
          </div>
          <p className="cred-prompt">Which Resolution stood out and why?</p>
          <textarea className="csea-textarea" rows={2} value={draft.resolutions.stood_out}
            onChange={(e) => setRes('stood_out', e.target.value)} onBlur={() => commit()} />

          <div className="cred-section-title">Budget</div>
          <p className="cred-prompt">Present any highlights of the budget review and vote.</p>
          <textarea className="csea-textarea" rows={2} value={draft.budget}
            onChange={(e) => set('budget', e.target.value)} onBlur={() => commit()} />

          <div className="cred-section-title">Overall</div>
          <p className="cred-prompt">Name one thing from your Conference experience that motivated you:</p>
          <textarea className="csea-textarea" rows={2} value={draft.overall}
            onChange={(e) => set('overall', e.target.value)} onBlur={() => commit()} />
          <p className="cred-prompt">What networking opportunities did you take advantage of?</p>
          <textarea className="csea-textarea" rows={2} value={draft.networking}
            onChange={(e) => set('networking', e.target.value)} onBlur={() => commit()} />
        </div>
      )}
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

function CseaNoteGroup({ note: n, onArchive, onDelete }) {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <div className={`interaction-group${collapsed ? '' : ' expanded'}`}>
      <div className="interaction-group-header" style={{ cursor: 'pointer' }} onClick={() => setCollapsed(c => !c)}>
        <span className="interaction-group-name">{n.topic || 'Topic'}</span>
        {n.archived && <span className="csea-note-archived-badge">Archived</span>}
        {n.created_at && (
          <span className="interaction-date-badge">{new Date(n.created_at).toLocaleDateString()}</span>
        )}
        <span className="interaction-group-toggle">{collapsed ? '▾' : '▴'}</span>
      </div>
      {!collapsed && (
        <div className="interaction-group-items">
          <div className="interaction-card">
            <div className="interaction-header">
              {onArchive && (
                <button
                  className="csea-note-archive-btn"
                  title={n.archived ? 'Unarchive' : 'Archive'}
                  onClick={() => onArchive(n.id, !n.archived)}
                >
                  {n.archived ? 'Unarchive' : 'Archive'}
                </button>
              )}
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
