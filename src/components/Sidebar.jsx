import { useState } from 'react'
import { signOut } from '../lib/supabase'
import './Sidebar.css'

export const TASK_AREAS = ['CSEA', 'Finance', 'GCU', 'iCAAP', 'Personal', 'General']

export const SECTION_LINKS = [
  { key: 'roles',    label: 'Roles',    color: '#73a882', icon: '👤', placeholder: 'List your key roles in life and work…\n\n• Role 1\n• Role 2' },
  { key: 'goals',    label: 'Goals',    color: '#8bc34a', icon: '🎯', placeholder: 'Your most important goals…\n\n• Goal 1\n• Goal 2' },
  { key: 'meetings', label: 'Meetings', color: '#888',    icon: '📅', placeholder: 'Meeting notes and agenda…' },
  { key: 'mission',  label: 'Mission',  color: '#4a90d9', icon: '🧭', placeholder: 'Your personal mission statement…' },
  { key: 'notes',    label: 'Notes',    color: '#f0a040', icon: '📝', placeholder: 'General notes and ideas…' },
  { key: 'hoa',      label: 'HOA',      color: '#7b5ea7', icon: '🏠', placeholder: 'HOA open items, notes, and action items…' },
  { key: 'journal',  label: 'Journal',  color: '#a0785a', icon: '📓', placeholder: 'Journal entry…' },
  { key: 'vision',   label: 'Vision',   color: '#5cb85c', icon: '🔭', placeholder: 'Your long-term vision…' },
  { key: 'values',   label: 'Values',   color: '#2e8b57', icon: '⭐', placeholder: 'Your core values…\n\n• Value 1\n• Value 2' },
]

export default function Sidebar({
  asanaTasks, asanaProjects, asanaStatus, onAddAsanaTask, onCompleteAsanaTask,
  user, sections = {}, onUpdateSection,
  view, onViewChange,
  personalSubTab, onPersonalSubTabChange,
}) {
  const [newText, setNewText] = useState('')
  const [newProject, setNewProject] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [filterProject, setFilterProject] = useState('All')
  const [collapsed, setCollapsed] = useState(false)

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

  const avatarUrl = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You'

  function navItem(icon, label, targetView, subTab) {
    const isActive = subTab
      ? view === targetView && personalSubTab === subTab
      : view === targetView
    function handleClick() {
      onViewChange?.(targetView)
      if (subTab) onPersonalSubTabChange?.(subTab)
    }
    return (
      <button
        key={subTab ? `${targetView}-${subTab}` : targetView}
        className={`sidebar-nav-item${isActive ? ' active' : ''}`}
        onClick={handleClick}
        title={collapsed ? label : undefined}
      >
        <span className="nav-icon">{icon}</span>
        {!collapsed && label}
      </button>
    )
  }

  return (
    <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? '›' : '‹'}
        </button>
        <div className="logo" style={{ display: collapsed ? 'none' : 'flex' }}>
          <span className="logo-icon">◆</span>
          <span className="logo-text">My Meridian Planner</span>
        </div>
      </div>

      {/* Scrollable nav area */}
      <div className="sidebar-nav-scroll">
        {/* Nav: PLANNER */}
        <div className="sidebar-nav-section">
          {!collapsed && <div className="sidebar-nav-label">Planner</div>}
          {navItem('📅', 'Month', 'month')}
          {navItem('📆', 'Week', 'week')}
        </div>

        {/* Nav: WORK */}
        <div className="sidebar-nav-section">
          {!collapsed && <div className="sidebar-nav-label">Work</div>}
          {navItem('📋', 'CSEA', 'csea')}
          {navItem('📊', 'iCAAP', 'icaap')}
          {navItem('🎓', 'GCU', 'gcu')}
          {navItem('💰', 'Finance', 'finance')}
          {navItem('🗒️', 'While You Were Out', 'wywo')}
        </div>

        {/* Nav: PERSONAL */}
        <div className="sidebar-nav-section">
          {!collapsed && <div className="sidebar-nav-label">Personal</div>}
          {navItem('📝', 'Daily Log', 'personal', 'log')}
          {navItem('🎯', 'My Goals', 'personal', 'goals')}
          {navItem('✅', 'Monthly Checklist', 'personal', 'checklist')}
          {navItem('📚', 'Library', 'personal', 'library')}
          {navItem('💭', 'My Mantra', 'personal', 'mantra')}
          {navItem('🛍️', 'Wants', 'personal', 'budget')}
          {navItem('🌳', 'Family Tree', 'family')}
        </div>

        {/* Nav: NOTES (full pages) */}
        <div className="sidebar-nav-section">
          {!collapsed && <div className="sidebar-nav-label">Notes</div>}
          {SECTION_LINKS.map(sec => sec.key === 'journal' ? (
            <a
              key={sec.key}
              href="https://penzu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-nav-item"
              title={collapsed ? sec.label : undefined}
            >
              <span className="nav-icon">{sec.icon}</span>
              {!collapsed && sec.label}
            </a>
          ) : (
            <button
              key={sec.key}
              className={`sidebar-nav-item${view === 'section-' + sec.key ? ' active' : ''}`}
              onClick={() => onViewChange?.('section-' + sec.key)}
              title={collapsed ? sec.label : undefined}
            >
              <span className="nav-icon">{sec.icon}</span>
              {!collapsed && sec.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-row">
          {avatarUrl ? (
            <img src={avatarUrl} className="user-avatar" alt={displayName} />
          ) : (
            <div className="user-avatar-placeholder">{displayName[0].toUpperCase()}</div>
          )}
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">{displayName}</span>
              <button className="sign-out-btn" onClick={signOut}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
