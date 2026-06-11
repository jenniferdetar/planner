import { useState } from 'react'
import { useDailyLog } from '../hooks/useDailyLog'
import { usePersonalGoals } from '../hooks/usePersonalGoals'
import { usePersonalChecklist } from '../hooks/usePersonalChecklist'
import './PersonalPanel.css'

const SHEET_EMBED_URL = 'https://docs.google.com/spreadsheets/d/1jFsKvlXd0SvvGGkNLjjiAK-trWxUNgagRwxodSLQggQ/edit?usp=sharing&rm=minimal'

const CATEGORY_COLORS = {
  'Physical':       '#e8a0a0',
  'Mental':         '#7ec8c8',
  'Relational':     '#e8c97a',
  'Self-Care':      '#e8a0a0',
  'Hobbies':        '#7ba7e0',
  'Home':           '#7ec8c8',
  'Career':         '#e8c97a',
  'Financial':      '#7ba7e0',
  'Organizational': '#e8a0a0',
  'Screen Time':    '#7ec8c8',
  'Learn':          '#e8c97a',
  'CSEA':           '#00326b',
}

const CATEGORY_ORDER = ['Physical','Mental','Relational','Self-Care','Hobbies','Home','Career','Financial','Organizational','Screen Time','Learn','CSEA']

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function PersonalPanel({ userId, selectedDate }) {
  const dateStr = selectedDate instanceof Date
    ? selectedDate.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  const { entries, addEntry, deleteEntry } = useDailyLog(userId, dateStr)
  const { byCategory, addGoal, deleteGoal } = usePersonalGoals(userId)
  const { tasks: checklistTasks, isChecked, toggle: toggleCheck, addTask: addChecklistTask, deleteTask: deleteChecklistTask } = usePersonalChecklist(userId)
  const [text, setText] = useState('')
  const [addingCategory, setAddingCategory] = useState(null)
  const [newGoalText, setNewGoalText] = useState('')
  const [addingChecklist, setAddingChecklist] = useState(false)
  const [newChecklistTask, setNewChecklistTask] = useState('')

  async function handleAddLog(e) {
    e.preventDefault()
    if (!text.trim()) return
    await addEntry(text.trim())
    setText('')
  }

  async function handleAddGoal(category) {
    if (!newGoalText.trim()) return
    await addGoal(category, newGoalText.trim())
    setNewGoalText('')
    setAddingCategory(null)
  }

  const displayDate = selectedDate instanceof Date
    ? selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  const orderedCategories = [
    ...CATEGORY_ORDER.filter(c => byCategory[c]),
    ...Object.keys(byCategory).filter(c => !CATEGORY_ORDER.includes(c)),
  ]

  return (
    <div className="personal-panel">
      <div className="personal-header">
        <div className="personal-title-row">
          <h2 className="personal-title">Personal</h2>
        </div>
      </div>

      <div className="personal-body">
        {/* Daily Log */}
        <div className="daily-log-section">
          <div className="daily-log-header">
            <span className="daily-log-date">{displayDate}</span>
          </div>
          <form className="daily-log-form" onSubmit={handleAddLog}>
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

        {/* Personal Goals Grid */}
        <div className="goals-section">
          <div className="goals-section-header">
            <span className="goals-trophy">🏆</span>
            <h3 className="goals-title">My Personal Goals</h3>
          </div>
          <div className="goals-grid">
            {orderedCategories.map(category => {
              const color = CATEGORY_COLORS[category] || '#c9a96e'
              const goals = byCategory[category] || []
              return (
                <div key={category} className="goal-card">
                  <div className="goal-card-header" style={{ background: color }}>
                    <span className="goal-card-title">{category}</span>
                  </div>
                  <div className="goal-card-body">
                    {goals.map(g => (
                      <div key={g.id} className="goal-item" group="goal">
                        <span className="goal-text">{g.goal_text}</span>
                        <button className="goal-del" onClick={() => deleteGoal(g.id)}>×</button>
                      </div>
                    ))}
                    {addingCategory === category ? (
                      <div className="goal-add-form">
                        <input
                          autoFocus
                          placeholder="New goal…"
                          value={newGoalText}
                          onChange={e => setNewGoalText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddGoal(category)
                            if (e.key === 'Escape') setAddingCategory(null)
                          }}
                          className="goal-add-input"
                        />
                        <button className="goal-add-save" onClick={() => handleAddGoal(category)}>✓</button>
                        <button className="goal-add-cancel" onClick={() => setAddingCategory(null)}>✕</button>
                      </div>
                    ) : (
                      <button
                        className="goal-add-btn"
                        onClick={() => { setAddingCategory(category); setNewGoalText('') }}
                      >+ add</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Monthly Checklist */}
        <div className="checklist-section">
          <h3 className="checklist-title">Monthly Checklist</h3>
          <table className="checklist-table">
            <thead>
              <tr>
                <th className="task-col">TASK</th>
                {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => (
                  <th key={i}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checklistTasks.map((task, rowIdx) => {
                const colors = ['#e8a0a0','#e8c97a','#7ec8c8','#7ba7e0']
                const color = colors[rowIdx % colors.length]
                return (
                  <tr key={task.id}>
                    <td className="task-name-cell">
                      <span>{task.task_name}</span>
                      <button className="goal-del" onClick={() => deleteChecklistTask(task.id)} style={{ marginLeft: 4 }}>×</button>
                    </td>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1
                      const checked = isChecked(task.id, month)
                      return (
                        <td key={month}>
                          <span
                            className="checklist-box"
                            style={{
                              borderColor: color,
                              background: checked ? color : 'transparent',
                            }}
                            onClick={() => toggleCheck(task.id, month)}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              <tr className="checklist-add-row">
                <td colSpan={13}>
                  {addingChecklist ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        autoFocus
                        placeholder="New task…"
                        value={newChecklistTask}
                        onChange={e => setNewChecklistTask(e.target.value)}
                        onKeyDown={async e => {
                          if (e.key === 'Enter' && newChecklistTask.trim()) {
                            await addChecklistTask(newChecklistTask.trim())
                            setNewChecklistTask('')
                            setAddingChecklist(false)
                          }
                          if (e.key === 'Escape') setAddingChecklist(false)
                        }}
                        className="checklist-new-input"
                      />
                      <button className="goal-add-save" onClick={async () => {
                        if (newChecklistTask.trim()) {
                          await addChecklistTask(newChecklistTask.trim())
                          setNewChecklistTask('')
                          setAddingChecklist(false)
                        }
                      }}>✓</button>
                      <button className="goal-add-cancel" onClick={() => setAddingChecklist(false)}>✕</button>
                    </div>
                  ) : (
                    <button className="checklist-add-task-btn" onClick={() => setAddingChecklist(true)}>+ add task</button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
