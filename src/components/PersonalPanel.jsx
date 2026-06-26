import { useState, useRef } from 'react'
import { useDailyLog } from '../hooks/useDailyLog'
import { useMantra } from '../hooks/useMantra'
import { useMission } from '../hooks/useMission'
import GoalsPanel from './GoalsPanel'
import LibraryPanel from './LibraryPanel'
import './PersonalPanel.css'

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const SUB_TABS = [
  { key: 'log',       label: 'Daily Log',         color: '#e8a0a0' },
  { key: 'goals',     label: 'My Goals',           color: '#e8c97a' },
  { key: 'roles',     label: 'Roles',              color: '#3164a0' },
  { key: 'checklist', label: 'Monthly Checklist',  color: '#7ec8c8' },
  { key: 'library',   label: 'Library',            color: '#7ba7e0' },
  { key: 'mantra',    label: 'My Mantra',          color: '#e8a0a0' },
  { key: 'mission',   label: 'Mission',             color: '#a0b4e8' },
  { key: 'budget',    label: 'Wants',              color: '#4a7a6a' },
]

export default function PersonalPanel({ userId, selectedDate, onDateChange, books, onAddBook, onUpdateBookStatus, onUpdateBookChapter, onDeleteBook, onImportBooks, subTab: subTabProp, onSubTabChange, allowedSubTabs }) {
  const visibleTabs = allowedSubTabs ? SUB_TABS.filter(t => allowedSubTabs.includes(t.key)) : SUB_TABS
  const defaultTab = visibleTabs[0]?.key || 'log'
  const dateStr = selectedDate instanceof Date
    ? selectedDate.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  const { entries, addEntry, deleteEntry, updateEntry } = useDailyLog(userId, dateStr)
  const { mantra, setMantra, save, saved } = useMantra(userId)
  const { mission, setMission, save: saveMission, saved: missionSaved } = useMission(userId)
  const [text, setText] = useState('')
  const [mantraEditing, setMantraEditing] = useState(false)
  const [missionEditing, setMissionEditing] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState(null)
  const [editingEntryText, setEditingEntryText] = useState('')
  const [localSubTab, setLocalSubTab] = useState(defaultTab)
  const subTab = subTabProp ?? localSubTab
  function handleSubTabChange(key) {
    setLocalSubTab(key)
    onSubTabChange?.(key)
  }
  const saveTimer = useRef(null)
  const editTimers = useRef({})

  function handleEntryEdit(entry) {
    setEditingEntryId(entry.id)
    setEditingEntryText(entry.entry)
  }

  function handleEntryChange(id, val) {
    setEditingEntryText(val)
    clearTimeout(editTimers.current[id])
    editTimers.current[id] = setTimeout(() => updateEntry(id, val), 800)
  }

  function commitEntryEdit() {
    setEditingEntryId(null)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!text.trim()) return
    await addEntry(text.trim())
    setText('')
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

  const displayDate = selectedDate instanceof Date
    ? selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  function prevDay() {
    const d = new Date(selectedDate instanceof Date ? selectedDate : new Date())
    d.setDate(d.getDate() - 1)
    onDateChange?.(d)
  }

  function nextDay() {
    const d = new Date(selectedDate instanceof Date ? selectedDate : new Date())
    d.setDate(d.getDate() + 1)
    onDateChange?.(d)
  }

  const activeColor = visibleTabs.find(t => t.key === subTab)?.color || '#73a882'

  return (
    <div className="personal-panel">
      {allowedSubTabs && (
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
      )}
      {subTab === 'log' && (
        <div className="personal-body">
          <div className="daily-log-section">
            <div className="daily-log-header">
              <button className="day-nav-btn" onClick={prevDay} aria-label="Previous day">‹</button>
              <span className="daily-log-date">{displayDate}</span>
              <button className="day-nav-btn" onClick={nextDay} aria-label="Next day">›</button>
            </div>
            <form className="daily-log-form" onSubmit={handleAdd}>
              <input
                className="daily-log-input"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="What did you do today?"
              />
              <button className="daily-log-add-btn" type="submit">Add</button>
            </form>
            {entries.length > 0 && (
              <ul className="daily-log-list">
                {entries.map(entry => (
                  <li key={entry.id} className="daily-log-item">
                    <span className="daily-log-time">{formatTime(entry.created_at)}</span>
                    {editingEntryId === entry.id ? (
                      <input
                        autoFocus
                        className="daily-log-edit-input"
                        value={editingEntryText}
                        onChange={e => handleEntryChange(entry.id, e.target.value)}
                        onBlur={commitEntryEdit}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') commitEntryEdit() }}
                      />
                    ) : (
                      <span className="daily-log-text" onClick={() => handleEntryEdit(entry)}>{entry.entry}</span>
                    )}
                    <button className="daily-log-del" onClick={() => deleteEntry(entry.id)}>×</button>
                  </li>
                ))}
              </ul>
            )}
            {entries.length === 0 && (
              <p className="daily-log-empty">Nothing logged yet for today.</p>
            )}
          </div>
        </div>
      )}

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
    </div>
  )
}
