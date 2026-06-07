import { useState, useRef } from 'react'
import { signOut } from '../lib/supabase'
import './Sidebar.css'

export const TASK_AREAS = ['CSEA', 'Finance', 'GCU', 'iCAAP', 'Personal', 'General']

const PRIORITY_COLORS = { high: '#e05c5c', medium: '#f0a040', low: '#5c9ee0' }
const PRIORITY_LABELS = { high: 'High', medium: 'Med', low: 'Low' }

const TABS = [
  { key: 'tasks',    label: 'Tasks',    color: '#f86336' },
  { key: 'roles',    label: 'Roles',    color: '#c9a96e' },
  { key: 'goals',    label: 'Goals',    color: '#8bc34a' },
  { key: 'meetings', label: 'Meetings', color: '#888' },
  { key: 'mission',  label: 'Mission',  color: '#4a90d9' },
  { key: 'notes',    label: 'Notes',    color: '#f0a040' },
  { key: 'journal',  label: 'Journal',  color: '#a0785a' },
  { key: 'vision',   label: 'Vision',   color: '#5cb85c' },
  { key: 'values',   label: 'Values',   color: '#2e8b57' },
]

const PLACEHOLDERS = {
  roles:    'List your key roles in life and work…\n\n• Role 1\n• Role 2',
  goals:    'Your most important goals…\n\n• Goal 1\n• Goal 2',
  meetings: 'Meeting notes and agenda…',
  mission:  'Your personal mission statement…',
  notes:    'General notes and ideas…',
  journal:  'Journal entry…',
  vision:   'Your long-term vision…',
  values:   'Your core values…\n\n• Value 1\n• Value 2',
}

export default function Sidebar({
  asanaTasks, asanaProjects, asanaStatus, onAddAsanaTask, onCompleteAsanaTask,
  user, sections = {}, onUpdateSection,
}) {
  const [activeTab, setActiveTab] = useState('tasks')
  const [newText, setNewText] = useState('')
  const [newProject, setNewProject] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [filterProject, setFilterProject] = useState('All')

  async function handleAdd(e) {
    e.preventDefault()
    if (!newText.trim()) return
    setAdding(true)
    await onAddAsanaTask(newText.trim(), '', newProject || null)
    setNewText('')
    setNewProject('')
    setShowAdd(false)
    setAdding(false)
  }

  // Group tasks by project
  const projectNames = ['All', ...(asanaProjects || []).map(p => p.name).sort()]
  const filteredTasks = filterProject === 'All'
    ? (asanaTasks || [])
    : (asanaTasks || []).filter(t => t.project === filterProject)

  const avatarUrl = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You'
  const activeColor = TABS.find(t => t.key === activeTab)?.color ?? '#c9a96e'

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">My Meridian Planner</span>
        </div>
      </div>

      {/* Folder tabs */}
      <div className="folder-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`folder-tab ${activeTab === tab.key ? 'active' : ''}`}
            style={{ '--fc': tab.color }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="sidebar-section-content">
        {activeTab === 'tasks' ? (
          <>
            {/* Project filter pills */}
            {projectNames.length > 1 && (
              <div className="asana-project-filter">
                {projectNames.map(name => (
                  <button
                    key={name}
                    className={`asana-proj-pill ${filterProject === name ? 'active' : ''}`}
                    onClick={() => setFilterProject(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            <div className="task-list">
              {asanaStatus === 'loading' && (
                <p className="empty-state">Loading from Asana…</p>
              )}
              {asanaStatus === 'no-token' && (
                <p className="empty-state">Set VITE_ASANA_TOKEN to sync tasks</p>
              )}
              {asanaStatus === 'error' && (
                <p className="empty-state">Asana sync failed</p>
              )}
              {asanaStatus === 'ready' && filteredTasks.length === 0 && (
                <p className="empty-state">No tasks{filterProject !== 'All' ? ` in ${filterProject}` : ''}</p>
              )}
              {filteredTasks.map(task => (
                <AsanaTaskRow key={task.id} task={task} onComplete={onCompleteAsanaTask} />
              ))}
            </div>

            {showAdd ? (
              <form className="add-task-form" onSubmit={handleAdd}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Task name…"
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  className="add-task-input"
                />
                <select
                  className="add-task-area-select"
                  value={newProject}
                  onChange={e => setNewProject(e.target.value)}
                >
                  <option value="">— Project (optional) —</option>
                  {(asanaProjects || []).map(p => (
                    <option key={p.gid} value={p.name}>{p.name}</option>
                  ))}
                </select>
                <div className="add-task-row" style={{ marginTop: 8 }}>
                  <div className="form-actions" style={{ marginLeft: 'auto' }}>
                    <button type="button" className="btn-cancel" onClick={() => setShowAdd(false)}>✕</button>
                    <button type="submit" className="btn-save" disabled={adding}>
                      {adding ? '…' : 'Add'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <button className="add-btn" onClick={() => setShowAdd(true)}>
                <span>+</span> Add Asana task
              </button>
            )}
          </>
        ) : activeTab === 'journal' ? (
          <div className="journal-panel">
            <a
              href="https://penzu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="penzu-btn"
            >
              <span className="penzu-icon">📓</span>
              Open Penzu Journal
            </a>
            <SectionTextArea
              key="journal-notes"
              sectionKey="journal"
              value={sections['journal'] ?? ''}
              placeholder="Quick notes before opening Penzu…"
              accentColor={activeColor}
              onChange={onUpdateSection}
            />
          </div>
        ) : (
          <SectionTextArea
            key={activeTab}
            sectionKey={activeTab}
            value={sections[activeTab] ?? ''}
            placeholder={PLACEHOLDERS[activeTab] ?? ''}
            accentColor={activeColor}
            onChange={onUpdateSection}
          />
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-row">
          {avatarUrl ? (
            <img src={avatarUrl} className="user-avatar" alt="" />
          ) : (
            <div className="user-avatar-placeholder">{displayName[0].toUpperCase()}</div>
          )}
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <button className="sign-out-btn" onClick={signOut}>Sign out</button>
          </div>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="stat-num">{(asanaTasks || []).length}</span>
            <span className="stat-label">backlog</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

function AsanaTaskRow({ task, onComplete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="task-row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        className="asana-check-btn"
        onClick={() => onComplete(task.id)}
        title="Complete in Asana"
      >✓</button>
      <span className="sidebar .task-text" style={{ flex: 1, fontSize: 13, color: '#e8e4d8', lineHeight: 1.4 }}>
        {task.title}
      </span>
      {task.project && (
        <span className="task-category">{task.project}</span>
      )}
    </div>
  )
}

function SectionTextArea({ sectionKey, value, placeholder, accentColor, onChange }) {
  const saveTimer = useRef(null)
  const [text, setText] = useState(value)

  if (text !== value && !saveTimer.current) {
    setText(value)
  }

  function handleChange(e) {
    const val = e.target.value
    setText(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      onChange?.(sectionKey, val)
      saveTimer.current = null
    }, 800)
  }

  return (
    <textarea
      className="section-textarea"
      style={{ '--ac': accentColor }}
      placeholder={placeholder}
      value={text}
      onChange={handleChange}
      autoFocus
    />
  )
}
