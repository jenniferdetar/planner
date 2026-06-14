// @ts-nocheck
import { useState, useRef, useEffect } from 'react'
import { signOut } from '../lib/supabase'
import './Sidebar.css'

export const TASK_AREAS = ['CSEA', 'Finance', 'GCU', 'iCAAP', 'Personal', 'General']

interface SectionDef {
  key: string
  label: string
  color: string
  icon: string
  placeholder: string
}

const SECTION_LINKS: SectionDef[] = [
  { key: 'roles',    label: 'Roles',    color: '#c9a96e', icon: '👤', placeholder: 'List your key roles in life and work…\n\n• Role 1\n• Role 2' },
  { key: 'goals',    label: 'Goals',    color: '#8bc34a', icon: '🎯', placeholder: 'Your most important goals…\n\n• Goal 1\n• Goal 2' },
  { key: 'meetings', label: 'Meetings', color: '#888',    icon: '📅', placeholder: 'Meeting notes and agenda…' },
  { key: 'mission',  label: 'Mission',  color: '#4a90d9', icon: '🧭', placeholder: 'Your personal mission statement…' },
  { key: 'notes',    label: 'Notes',    color: '#f0a040', icon: '📝', placeholder: 'General notes and ideas…' },
  { key: 'journal',  label: 'Journal',  color: '#a0785a', icon: '📓', placeholder: 'Journal entry…' },
  { key: 'vision',   label: 'Vision',   color: '#5cb85c', icon: '🔭', placeholder: 'Your long-term vision…' },
  { key: 'values',   label: 'Values',   color: '#2e8b57', icon: '⭐', placeholder: 'Your core values…\n\n• Value 1\n• Value 2' },
]

const PRIORITY_COLORS: Record<string, string> = { high: '#e05c5c', medium: '#f0a040', low: '#5c9ee0' }

interface AsanaTask {
  id: string
  title?: string
  project?: string
  notes?: string
}

interface AsanaProject {
  gid: string
  name: string
}

interface SidebarProps {
  asanaTasks: AsanaTask[]
  asanaProjects: AsanaProject[]
  asanaStatus: string
  onAddAsanaTask: (text: string, notes: string, project: string | null) => Promise<void>
  onCompleteAsanaTask: (id: string) => Promise<void>
  user?: { email?: string; user_metadata?: { avatar_url?: string; full_name?: string } } | null
  sections?: Record<string, string>
  onUpdateSection: (key: string, value: string) => void
  onRefreshAsana?: () => void
}

export default function Sidebar({
  asanaTasks, asanaProjects, asanaStatus, onAddAsanaTask, onCompleteAsanaTask,
  user, sections = {}, onUpdateSection,
}: SidebarProps) {
  const [newText, setNewText] = useState('')
  const [newProject, setNewProject] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [filterProject, setFilterProject] = useState('All')
  const [openSection, setOpenSection] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
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
          {SECTION_LINKS.map(sec => sec.key === 'journal' ? (
            <a
              key={sec.key}
              href="https://penzu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="folder-tab section-link"
              style={{ '--fc': sec.color } as React.CSSProperties}
            >
              <span className="section-link-icon">{sec.icon}</span>
              {sec.label}
              <span className="section-link-arrow">›</span>
            </a>
          ) : (
            <button
              key={sec.key}
              className="folder-tab section-link"
              style={{ '--fc': sec.color } as React.CSSProperties}
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

interface SectionPageProps {
  def: SectionDef
  value: string
  onChange: (key: string, val: string) => void
  onClose: () => void
}

function SectionPage({ def, value, onChange, onClose }: SectionPageProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
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

interface AsanaTaskRowProps {
  task: AsanaTask
  onComplete: (id: string) => void
}

function AsanaTaskRow({ task, onComplete }: AsanaTaskRowProps) {
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

interface SectionTextAreaProps {
  sectionKey: string
  value: string
  placeholder: string
  accentColor: string
  onChange?: (key: string, val: string) => void
}

function SectionTextArea({ sectionKey, value, placeholder, accentColor, onChange }: SectionTextAreaProps) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [text, setText] = useState(value)

  if (text !== value && !saveTimer.current) setText(value)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setText(val)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      onChange?.(sectionKey, val)
      saveTimer.current = null
    }, 800)
  }

  return (
    <textarea
      className="section-textarea"
      style={{ '--ac': accentColor } as React.CSSProperties}
      placeholder={placeholder}
      value={text}
      onChange={handleChange}
      autoFocus
    />
  )
}
