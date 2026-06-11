import { useState } from 'react'
import { useDailyLog } from '../hooks/useDailyLog'
import './PersonalPanel.css'

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function PersonalPanel({ userId, selectedDate }) {
  const dateStr = selectedDate instanceof Date
    ? selectedDate.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  const { entries, addEntry, deleteEntry } = useDailyLog(userId, dateStr)
  const [text, setText] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    if (!text.trim()) return
    await addEntry(text.trim())
    setText('')
  }

  const displayDate = selectedDate instanceof Date
    ? selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="personal-panel">
      <div className="personal-header">
        <div className="personal-title-row">
          <h2 className="personal-title">Personal</h2>
        </div>
      </div>

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
                  <span className="daily-log-text">{entry.entry}</span>
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
    </div>
  )
}
