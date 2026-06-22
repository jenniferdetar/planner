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
  { key: 'hoa',      label: 'HOA',      color: '#7b5ea7', icon: '🏠', placeholder: 'HOA open items, notes, and action items…', iframeUrl: 'https://docs.google.com/spreadsheets/d/1jFsKvlXd0SvvGGkNLjjiAK-trWxUNgagRwxodSLQggQ/htmlview' },
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
  const [collapsed, setCollapsed] = useState(false)

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

  function sectionLabelNavItem(key) {
    const sec = SECTION_LINKS.find(s => s.key === key)
    if (!sec) return null
    const isActive = view === 'section-' + sec.key
    if (collapsed) {
      return (
        <button
          key={sec.key}
          className={`sidebar-nav-item${isActive ? ' active' : ''}`}
          onClick={() => onViewChange?.('section-' + sec.key)}
          title={sec.label}
        >
          <span className="nav-icon">{sec.icon}</span>
        </button>
      )
    }
    return (
      <button
        key={sec.key}
        className={`sidebar-nav-section-label${isActive ? ' active' : ''}`}
        onClick={() => onViewChange?.('section-' + sec.key)}
      >
        {sec.label}
      </button>
    )
  }

  function sectionNavItem(key) {
    const sec = SECTION_LINKS.find(s => s.key === key)
    if (!sec) return null
    if (sec.key === 'journal') {
      return (
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
      )
    }
    return (
      <button
        key={sec.key}
        className={`sidebar-nav-item${view === 'section-' + sec.key ? ' active' : ''}`}
        onClick={() => onViewChange?.('section-' + sec.key)}
        title={collapsed ? sec.label : undefined}
      >
        <span className="nav-icon">{sec.icon}</span>
        {!collapsed && sec.label}
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

      <div className="sidebar-nav-scroll">
        {/* Nav: PLANNER */}
        <div className="sidebar-nav-section">
          {!collapsed && <div className="sidebar-nav-label">Planner</div>}
          {navItem('📅', 'Month', 'month')}
          {navItem('📆', 'Week', 'week')}
        </div>

        {/* Nav: ROLES */}
        <div className="sidebar-nav-section">
          {sectionLabelNavItem('roles')}
          {navItem('📋', 'CSEA', 'csea')}
          {navItem('📊', 'iCAAP', 'icaap')}
          {navItem('🎓', 'GCU', 'gcu')}
          {navItem('💰', 'Finance', 'finance')}
          {navItem('🗒️', 'While You Were Out', 'wywo')}
          {sectionNavItem('hoa')}
          {sectionNavItem('meetings')}
        </div>

        {/* Nav: GOALS */}
        <div className="sidebar-nav-section">
          {sectionLabelNavItem('goals')}
          {navItem('🎯', 'My Goals', 'personal', 'goals')}
          {navItem('✅', 'Monthly Checklist', 'personal', 'checklist')}
          {navItem('🛍️', 'Wants', 'personal', 'budget')}
          {navItem('📚', 'Library', 'personal', 'library')}
          {navItem('📈', 'Financial Goals', 'financial-goals')}
        </div>

        {/* Nav: VISION */}
        <div className="sidebar-nav-section">
          {sectionLabelNavItem('vision')}
          {sectionNavItem('mission')}
          {navItem('💭', 'My Mantra', 'personal', 'mantra')}
          {sectionNavItem('notes')}
        </div>

        {/* Nav: VALUES */}
        <div className="sidebar-nav-section">
          {sectionLabelNavItem('values')}
          {sectionNavItem('journal')}
          {navItem('📝', 'Daily Log', 'personal', 'log')}
          {navItem('🌳', 'Family Tree', 'family')}
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
