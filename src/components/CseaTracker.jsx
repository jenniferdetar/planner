import { useState, useRef, useEffect } from 'react'
import { useCseaMembers, useWorkLocations } from '../hooks/useCseaData'
import { useQuickLinks } from '../hooks/useQuickLinks'
import { useGmailCseaSync } from '../hooks/useGmailCseaSync'
import { useYahooMailSync } from '../hooks/useYahooMailSync'
import ContractReference from './ContractReference'
import { RIF_INTAKE, rifPlatformSummary, rifActionSummary } from '../data/rifIntake'
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

export function useCseaPage({ userId, providerToken, issues, onAddIssue, onUpdateStatus, onDeleteIssue, interactions, onAddInteraction, onUpdateInteraction, showArchived, onToggleArchived, asanaTasks = [], onCompleteAsanaTask, onUpdateAsanaTaskNotes, cseaNotes = [], onAddCseaNote, onDeleteCseaNote, issueNotes = {}, onAddIssueNote, onDeleteIssueNote }) {
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

  const { sync: syncGmail, syncing: gmailSyncing, newCount: gmailNewCount } = useGmailCseaSync(providerToken)
  const { sync: syncYahoo, syncing: yahooSyncing, newCount: yahooNewCount } = useYahooMailSync()

  const syncing = gmailSyncing || yahooSyncing
  const totalNewCount = (gmailNewCount ?? 0) + (yahooNewCount ?? 0)
  const hasSynced = gmailNewCount != null || yahooNewCount != null

  function syncAll() {
    setHasSyncedOnce(true)
    if (providerToken) syncGmail()
    syncYahoo()
  }

  // Auto-sync once when the right page mounts (used to trigger on the
  // Interactions sub-tab specifically).
  useEffect(() => {
    if (!hasSyncedOnce) syncAll()
  }, [providerToken])

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
  }
}

export function CseaTrackerInner({ api }) {
  const [tab, setTab] = useState('issues')

  return (
    <div className="csea-tracker">
      <div className="csea-tabs">
        <button className={`csea-tab ${tab === 'issues' ? 'active' : ''}`} onClick={() => setTab('issues')}>Issues</button>
        <button className={`csea-tab ${tab === 'interactions' ? 'active' : ''}`} onClick={() => setTab('interactions')}>Interactions {api.interactions.length > 0 && <span className="csea-tab-badge">{new Set(api.interactions.map(i => i.member_name || 'Unknown')).size}</span>}</button>
        <button className={`csea-tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Topics {api.cseaNotes.length > 0 && <span className="csea-tab-badge">{api.cseaNotes.length}</span>}</button>
        <button className={`csea-tab ${tab === 'links' ? 'active' : ''}`} onClick={() => setTab('links')}>Links {api.quickLinks.length > 0 && <span className="csea-tab-badge">{api.quickLinks.length}</span>}</button>
        <button className={`csea-tab ${tab === 'contract' ? 'active' : ''}`} onClick={() => setTab('contract')}>Contract/Constitution</button>
        <button className={`csea-tab ${tab === 'rif' ? 'active' : ''}`} onClick={() => setTab('rif')}>RIF Intake <span className="csea-tab-badge">{RIF_INTAKE.length}</span></button>
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
                  <button className="interaction-delete-btn" title="Delete" onClick={() => api.deleteLink(l.id)}>✕</button>
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

      {tab === 'contract' && (
        <div className="csea-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ContractReference userId={api.userId} />
        </div>
      )}

      {tab === 'rif' && <RifIntakePanel />}
    </div>
  )
}

function InteractionsPanel({ api }) {
  return (
    <div className="csea-panel">
      <div className="csea-toolbar">
        <button className="csea-archive-toggle" onClick={api.onToggleArchived}>
          {api.showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
        <button className="csea-gmail-sync-btn" onClick={api.syncAll} disabled={api.syncing}>
          {api.syncing ? 'Syncing…' : api.hasSynced ? `↻ Sync${api.totalNewCount > 0 ? ` (+${api.totalNewCount})` : ''}` : '↻ Sync'}
        </button>
        <button className="csea-add-btn" onClick={() => api.setShowAddInteraction(true)}>+ Log Contact</button>
      </div>

      {api.showAddInteraction && (
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
        ).sort(([a], [b]) => a.localeCompare(b)).map(([member, items]) => (
          <MemberInteractionGroup key={member} member={member} items={items} onUpdate={api.onUpdateInteraction} workLocations={api.workLocations} />
        ))}
      </div>
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
        <div className="rif-summary-card">
          <div className="rif-summary-title">Summary by Platform</div>
          <table className="rif-summary-table">
            <tbody>
              {platformCounts.map(([platform, count]) => (
                <tr key={platform}>
                  <td>{platform}</td>
                  <td className="rif-summary-count">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
