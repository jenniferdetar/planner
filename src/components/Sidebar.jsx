import { useState } from 'react'
import { signOut } from '../lib/supabase'
import './Sidebar.css'

const PRIORITY_COLORS = { high: '#e05c5c', medium: '#f0a040', low: '#5c9ee0' }
const PRIORITY_LABELS = { high: 'High', medium: 'Med', low: 'Low' }

export default function Sidebar({ masterTasks, onAddTask, onDeleteTask, quote, user }) {
  const [newText, setNewText] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [showAdd, setShowAdd] = useState(false)

  function handleAdd(e) {
    e.preventDefault()
    if (!newText.trim()) return
    onAddTask(newText.trim(), newPriority)
    setNewText('')
    setNewPriority('medium')
    setShowAdd(false)
  }

  const byPriority = {
    high: masterTasks.filter((t) => t.priority === 'high'),
    medium: masterTasks.filter((t) => t.priority === 'medium'),
    low: masterTasks.filter((t) => t.priority === 'low'),
  }

  const avatarUrl = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You'

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">Opus One</span>
        </div>
        <p className="sidebar-subtitle">Master Tasks</p>
      </div>

      <div className="quote-box">
        <p className="quote-text">"{quote.text}"</p>
        <p className="quote-author">— {quote.author}</p>
      </div>

      <div className="task-section">
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
          </form>
        ) : (
          <button className="add-btn" onClick={() => setShowAdd(true)}>
            <span>+</span> Add master task
          </button>
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

function TaskRow({ task, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="task-row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="priority-dot"
        style={{ background: PRIORITY_COLORS[task.priority] || '#ccc' }}
      />
      <span className="task-text">{task.title}</span>
      {task.category && <span className="task-category">{task.category}</span>}
      {hovered && (
        <button className="delete-btn" onClick={() => onDelete(task.id)}>✕</button>
      )}
    </div>
  )
}
