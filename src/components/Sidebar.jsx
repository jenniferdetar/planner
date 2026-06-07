import { useState, useRef } from 'react'
import { signOut } from '../lib/supabase'
import './Sidebar.css'

const PRIORITY_COLORS = { high: '#e05c5c', medium: '#f0a040', low: '#5c9ee0' }
const PRIORITY_LABELS = { high: 'High', medium: 'Med', low: 'Low' }

export const TASK_AREAS = ['CSEA', 'Finance', 'GCU', 'iCAAP', 'Personal', 'General']

const TABS = [
  { key: 'tasks',    label: 'Master Tasks', color: '#f0a040' },
  { key: 'roles',    label: 'Roles',        color: '#c9a96e' },
  { key: 'goals',    label: 'Goals',        color: '#8bc34a' },
  { key: 'meetings', label: 'Meetings',     color: '#888' },
  { key: 'mission',  label: 'Mission',      color: '#4a90d9' },
  { key: 'notes',    label: 'Notes',        color: '#f0a040' },
  { key: 'journal',  label: 'Journal',      color: '#a0785a' },
  { key: 'vision',   label: 'Vision',       color: '#5cb85c' },
  { key: 'values',   label: 'Values',       color: '#2e8b57' },
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
  masterTasks, onAddTask, onDeleteTask, quote, user, sections = {}, onUpdateSection,
}) {
  const [activeTab, setActiveTab] = useState('tasks')
  const [newText, setNewText] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newArea, setNewArea] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  function handleAdd(e) {
    e.preventDefault()
    if (!newText.trim()) return
    onAddTask(newText.trim(), newPriority, newArea)
    setNewText('')
    setNewPriority('medium')
    setNewArea('')
    setShowAdd(false)
  }

  const byPriority = {
    high: masterTasks.filter((t) => t.priority === 'high'),
    medium: masterTasks.filter((t) => t.priority === 'medium'),
    low: masterTasks.filter((t) => t.priority === 'low'),
  }

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
            <div className="task-list">
              {masterTasks.length === 0 && (
                <p className="empty-state">Your master task list is empty</p>
              )}
              {['high', 'medium', 'low'].map((priority) =>
                byPriority[priority].length > 0 ? (
                  <div key={priority} className="priority-group">
                    <div className="priority-group-label" style={{ color: PRIORITY_COLORS[priority] }}>
                      {PRIORITY_LABELS[priority]}
                    </div>
                    {byPriority[priority].map((task) => (
                      <TaskRow key={task.id} task={task} onDelete={onDeleteTask} />
                    ))}
                  </div>
                ) : null
              )}
            </div>

            {showAdd ? (
              <form className="add-task-form" onSubmit={handleAdd}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Task description..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="add-task-input"
                />
                <div className="add-task-row">
                  <div className="priority-pills">
                    {['high', 'medium', 'low'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`priority-pill ${newPriority === p ? 'active' : ''}`}
                        style={{ '--p-color': PRIORITY_COLORS[p] }}
                        onClick={() => setNewPriority(p)}
                      >
                        {PRIORITY_LABELS[p]}
                      </button>
                    ))}
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowAdd(false)}>✕</button>
                    <button type="submit" className="btn-save">Add</button>
                  </div>
                </div>
                <select
                  className="add-task-area-select"
                  value={newArea}
                  onChange={e => setNewArea(e.target.value)}
                >
                  <option value="">— Area (optional) —</option>
                  {TASK_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </form>
            ) : (
              <button className="add-btn" onClick={() => setShowAdd(true)}>
                <span>+</span> Add master task
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
            <span className="stat-num">{masterTasks.length}</span>
            <span className="stat-label">backlog</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

function SectionTextArea({ sectionKey, value, placeholder, accentColor, onChange }) {
  const saveTimer = useRef(null)
  const [text, setText] = useState(value)

  // Sync when switching tabs
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

function TaskRow({ task, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="task-row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="priority-dot" style={{ background: PRIORITY_COLORS[task.priority] || '#ccc' }} />
      <span className="task-text">{task.title}</span>
      {task.category && <span className="task-category">{task.category}</span>}
      {hovered && (
        <button className="delete-btn" onClick={() => onDelete(task.id)}>✕</button>
      )}
    </div>
  )
}
