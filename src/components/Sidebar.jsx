import { useState, useRef, useEffect } from 'react'
import { signOut } from '../lib/supabase'
import './Sidebar.css'

export const TASK_AREAS = ['CSEA', 'Finance', 'GCU', 'iCAAP', 'Personal', 'General']

const SECTION_LINKS = [
  { key: 'roles',    label: 'Roles',    color: '#c9a96e', icon: '👤', placeholder: 'List your key roles in life and work…\n\n• Role 1\n• Role 2' },
  { key: 'goals',    label: 'Goals',    color: '#8bc34a', icon: '🎯', placeholder: 'Your most important goals…\n\n• Goal 1\n• Goal 2' },
  { key: 'meetings', label: 'Meetings', color: '#888',    icon: '📅', placeholder: 'Meeting notes and agenda…' },
  { key: 'mission',  label: 'Mission',  color: '#4a90d9', icon: '🧭', placeholder: 'Your personal mission statement…' },
  { key: 'notes',    label: 'Notes',    color: '#f0a040', icon: '📝', placeholder: 'General notes and ideas…' },
  { key: 'journal',  label: 'Journal',  color: '#a0785a', icon: '📓', placeholder: 'Journal entry…' },
  { key: 'vision',   label: 'Vision',   color: '#5cb85c', icon: '🔭', placeholder: 'Your long-term vision…' },
  { key: 'values',   label: 'Values',   color: '#2e8b57', icon: '⭐', placeholder: 'Your core values…\n\n• Value 1\n• Value 2' },
]

const PRIORITY_COLORS = { high: '#e05c5c', medium: '#f0a040', low: '#5c9ee0' }

export default function Sidebar({
  asanaTasks, asanaProjects, asanaStatus, onAddAsanaTask, onCompleteAsanaTask,
  user, sections = {}, onUpdateSection,
}) {
  const [newText, setNewText] = useState('')
  const [newProject, setNewProject] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [filterProject, setFilterProject] = useState('All')
  const [openSection, setOpenSection] = useState(null)

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

  const projectNames = ['All', ...(asanaProjects || []).map(p => p.name).sort()]
  const filteredTasks = filterProject === 'All'
    ? (asanaTasks || [])
    : (asanaTasks || []).filter(t => t.project === filterProject)

  const avatarUrl = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You'

  const activeSectionDef = SECTION_LINKS.find(s => s.key === openSection)

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">◆</span>
            <span className="logo-text">My Meridian Planner</span>
          </div>
        </div>

        {/* Section nav links */}
        <div className="folder-tabs">
          {SECTION_LINKS.map(sec => (
            <button
              key={sec.key}
              className="folder-tab section-link"
              style={{ '--fc': sec.color }}
              onClick={() => setOpenSection(sec.key)}
            >
              <span className="section-link-icon">{sec.icon}</span>
              {sec.label}
              <span className="section-link-arrow">›</span>
            </button>
          ))}
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
        </div>
      </aside>

      {/* Full-page section overlay */}
      {openSection && activeSectionDef && (
        <SectionPage
          def={activeSectionDef}
          value={sections[openSection] ?? ''}
          onChange={onUpdateSection}
          onClose={() => setOpenSection(null)}
        />
      )}
    </>
  )
}

function SectionPage({ def, value, onChange, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="section-page-overlay" onClick={onClose}>
      <div className="section-page" onClick={e => e.stopPropagation()}>
        <div className="section-page-header" style={{ borderBottom: `3px solid ${def.color}` }}>
          <div className="section-page-title">
            <span className="section-page-icon">{def.icon}</span>
            <h2 style={{ color: def.color }}>{def.label}</h2>
          </div>
          <button className="section-page-close" onClick={onClose}>✕</button>
        </div>
        <SectionTextArea
          sectionKey={def.key}
          value={value}
          placeholder={def.placeholder}
          accentColor={def.color}
          onChange={onChange}
        />
        <div className="section-page-footer">
          <span className="section-autosave">Saves automatically</span>
        </div>
      </div>
    </div>
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
      <button className="asana-check-btn" onClick={() => onComplete(task.id)} title="Complete in Asana">✓</button>
      <span style={{ flex: 1, fontSize: 13, color: '#e8e4d8', lineHeight: 1.4 }}>{task.title}</span>
      {task.project && <span className="task-category">{task.project}</span>}
    </div>
  )
}

function SectionTextArea({ sectionKey, value, placeholder, accentColor, onChange }) {
  const saveTimer = useRef(null)
  const [text, setText] = useState(value)

  if (text !== value && !saveTimer.current) setText(value)

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
