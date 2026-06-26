import { useState, useRef } from 'react'
import { useMantra } from '../hooks/useMantra'
import { useMission } from '../hooks/useMission'
import GoalsPanel from './GoalsPanel'
import LibraryPanel from './LibraryPanel'
import ValuesPanel from './ValuesPanel'
import './PersonalPanel.css'

const SUB_TABS = [
  { key: 'goals',     label: 'My Goals',          color: '#e8c97a' },
  { key: 'roles',     label: 'Roles',             color: '#3164a0' },
  { key: 'checklist', label: 'Monthly Checklist', color: '#7ec8c8' },
  { key: 'library',   label: 'Library',           color: '#7ba7e0' },
  { key: 'mantra',    label: 'My Mantra',         color: '#e8a0a0' },
  { key: 'mission',   label: 'Mission',           color: '#a0b4e8' },
  { key: 'values',    label: 'Values',            color: '#8e44ad' },
  { key: 'budget',    label: 'Wants',             color: '#4a7a6a' },
]

export default function PersonalPanel({ userId, books, onAddBook, onUpdateBookStatus, onUpdateBookChapter, onDeleteBook, onImportBooks, subTab: subTabProp, onSubTabChange, allowedSubTabs }) {
  const visibleTabs = allowedSubTabs ? SUB_TABS.filter(t => allowedSubTabs.includes(t.key)) : SUB_TABS
  const defaultTab = visibleTabs[0]?.key || 'goals'

  const { mantra, setMantra, save, saved } = useMantra(userId)
  const { mission, setMission, save: saveMission, saved: missionSaved } = useMission(userId)
  const [mantraEditing, setMantraEditing] = useState(false)
  const [missionEditing, setMissionEditing] = useState(false)
  const [localSubTab, setLocalSubTab] = useState(defaultTab)
  const subTab = subTabProp ?? localSubTab
  const saveTimer = useRef(null)

  function handleSubTabChange(key) {
    setLocalSubTab(key)
    onSubTabChange?.(key)
  }

  function handleMantraChange(val) {
    setMantra(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(val), 900)
  }

  function handleMissionChange(val) {
    setMission(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveMission(val), 900)
  }

  const activeColor = visibleTabs.find(t => t.key === subTab)?.color || '#73a882'

  return (
    <div className="personal-panel">
      <div className="personal-inline-tabs">
        {visibleTabs.map(t => (
          <button
            key={t.key}
            className={`personal-inline-tab ${subTab === t.key ? 'active' : ''}`}
            style={{ '--itab-color': t.color }}
            onClick={() => handleSubTabChange(t.key)}
          >{t.label}</button>
        ))}
      </div>

      {subTab === 'goals' && <GoalsPanel userId={userId} section="goals" />}
      {subTab === 'roles' && <GoalsPanel userId={userId} section="roles" />}
      {subTab === 'checklist' && <GoalsPanel userId={userId} section="checklist" />}
      {subTab === 'library' && (
        <LibraryPanel
          books={books || []}
          onAddBook={onAddBook}
          onUpdateStatus={onUpdateBookStatus}
          onUpdateBookChapter={onUpdateBookChapter}
          onDeleteBook={onDeleteBook}
          onImportBooks={onImportBooks}
        />
      )}
      {subTab === 'budget' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <iframe
            src="https://docs.google.com/spreadsheets/d/1jFsKvlXd0SvvGGkNLjjiAK-trWxUNgagRwxodSLQggQ/pub?embedded=true"
            className="sheet-embed"
            title="Wants"
          />
        </div>
      )}

      {subTab === 'mantra' && (
        <div className="mantra-section">
          <div className="mantra-header">
            <h3 className="mantra-title" style={{ color: activeColor }}>My Personal Mantra</h3>
            <div className="mantra-header-right">
              {saved && <span className="mantra-saved">Saved ✓</span>}
              <button className="mantra-edit-btn" onClick={() => setMantraEditing(e => !e)}>
                {mantraEditing ? 'View' : 'Edit'}
              </button>
            </div>
          </div>
          {mantraEditing || !mantra.trim() ? (
            <textarea
              className="mantra-textarea"
              style={{ '--mantra-color': activeColor }}
              value={mantra}
              onChange={e => handleMantraChange(e.target.value)}
              placeholder="Write your personal mantra here… what words center and inspire you?"
              autoFocus={mantraEditing}
            />
          ) : (
            <div className="mantra-content" style={{ '--mantra-color': activeColor }}>
              {mantra.split('\n\n').filter(p => p.trim()).map((para, i) => (
                <p key={i} className="mantra-paragraph">{para.trim()}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'mission' && (
        <div className="mantra-section">
          <div className="mantra-header">
            <h3 className="mantra-title" style={{ color: activeColor }}>Mission</h3>
            <div className="mantra-header-right">
              {missionSaved && <span className="mantra-saved">Saved ✓</span>}
              <button className="mantra-edit-btn" onClick={() => setMissionEditing(e => !e)}>
                {missionEditing ? 'View' : 'Edit'}
              </button>
            </div>
          </div>
          {missionEditing || !mission.trim() ? (
            <textarea
              className="mantra-textarea"
              style={{ '--mantra-color': activeColor }}
              value={mission}
              onChange={e => handleMissionChange(e.target.value)}
              placeholder="Write your personal mission statement here… who are you, what are your strengths, and how are you growing?"
              autoFocus={missionEditing}
            />
          ) : (
            <div className="mantra-content" style={{ '--mantra-color': activeColor }}>
              {mission.split('\n\n').filter(p => p.trim()).map((para, i) => (
                <p key={i} className="mantra-paragraph">{para.trim()}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'values' && <ValuesPanel userId={userId} />}
    </div>
  )
}
