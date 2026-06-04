import { useState } from 'react'
import './Sidebar.css'

const PRIORITY_COLORS = { high: '#e05c5c', medium: '#f0a040', low: '#5c9ee0' }
const PRIORITY_LABELS = { high: 'High', medium: 'Med', low: 'Low' }

export default function Sidebar({ masterTasks, onAddTask, onToggleTask, onDeleteTask, quote }) {
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

  const pending = masterTasks.filter(t => !t.done)
  const done = masterTasks.filter(t => t.done)

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
          {pending.map(task => (
            <TaskRow key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} />
          ))}
          {done.length > 0 && (
            <>
              <div className="done-divider"><span>Completed</span></div>
              {done.map(task => (
                <TaskRow key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} />
              ))}
            </>
          )}
          {masterTasks.length === 0 && (
            <p className="empty-state">No master tasks yet</p>
          )}
        </div>

        {showAdd ? (
          <form className="add-task-form" onSubmit={handleAdd}>
            <input
              autoFocus
              type="text"
              placeholder="Task description..."
              value={newText}
              onChange={e => setNewText(e.target.value)}
              className="add-task-input"
            />
            <div className="add-task-row">
              <div className="priority-pills">
                {['high', 'medium', 'low'].map(p => (
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
        <div className="stats">
          <div className="stat">
            <span className="stat-num">{pending.length}</span>
            <span className="stat-label">pending</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">{done.length}</span>
            <span className="stat-label">done</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

function TaskRow({ task, onToggle, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const PRIORITY_COLORS = { high: '#e05c5c', medium: '#f0a040', low: '#5c9ee0' }

  return (
    <div
      className={`task-row ${task.done ? 'done' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button className="check-btn" onClick={() => onToggle(task.id)}>
        <span className={`check-circle ${task.done ? 'checked' : ''}`} />
      </button>
      <span
        className="priority-dot"
        style={{ background: PRIORITY_COLORS[task.priority] }}
      />
      <span className="task-text">{task.text}</span>
      {hovered && (
        <button className="delete-btn" onClick={() => onDelete(task.id)}>✕</button>
      )}
    </div>
  )
}
