import { useState, useRef } from 'react'
import { useDailyLog } from '../hooks/useDailyLog'
import { useMantra } from '../hooks/useMantra'
import GoalsPanel from './GoalsPanel'
import LibraryPanel from './LibraryPanel'
import './PersonalPanel.css'

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const SUB_TABS = [
  { key: 'log',       label: 'Daily Log',         color: '#e8a0a0' },
  { key: 'goals',     label: 'My Goals',           color: '#e8c97a' },
  { key: 'checklist', label: 'Monthly Checklist',  color: '#7ec8c8' },
  { key: 'library',   label: 'Library',            color: '#7ba7e0' },
  { key: 'mantra',    label: 'My Mantra',          color: '#e8a0a0' },
]

export default function PersonalPanel({ userId, selectedDate, books, onAddBook, onUpdateBookStatus, onDeleteBook, onImportBooks }) {
  const dateStr = selectedDate instanceof Date
    ? selectedDate.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  const { entries, addEntry, deleteEntry, updateEntry } = useDailyLog(userId, dateStr)
  const { mantra, setMantra, save, saved } = useMantra(userId)
  const [text, setText] = useState('')
  const [subTab, setSubTab] = useState('log')
  const [mantraEditing, setMantraEditing] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState(null)
  const [editingEntryText, setEditingEntryText] = useState('')
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

  const displayDate = selectedDate instanceof Date
    ? selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  const activeColor = SUB_TABS.find(t => t.key === subTab)?.color || '#c9a96e'

  return (
    <div className="personal-panel">
      <div className="personal-sub-tabs">
        {SUB_TABS.map(({ key, label, color }) => (
          <button
            key={key}
            className={`personal-sub-tab ${subTab === key ? 'active' : ''}`}
            style={subTab === key ? { color, borderBottomColor: color } : {}}
            onClick={() => setSubTab(key)}
          >{label}</button>
        ))}
      </div>

      {subTab === 'log' && (
        <div className="personal-body">
          <div className="daily-log-section">
            <div className="daily-log-header">
              <span className="daily-log-date">{displayDate}</span>
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
      {subTab === 'checklist' && <GoalsPanel userId={userId} section="checklist" />}
      {subTab === 'library' && (
        <LibraryPanel
          books={books || []}
          onAddBook={onAddBook}
          onUpdateStatus={onUpdateBookStatus}
          onDeleteBook={onDeleteBook}
          onImportBooks={onImportBooks}
        />
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
    </div>
  )
}
