import { useState } from 'react'
import { usePersonalGoals } from '../hooks/usePersonalGoals'
import { usePersonalChecklist } from '../hooks/usePersonalChecklist'
import './GoalsPanel.css'

const CATEGORY_ORDER = ['Physical','Mental','Relational','Self-Care','Hobbies','Home','Career','Financial','Organizational','Screen Time','Learn','CSEA']

function contrastColor(hex) {
  const c = (hex ?? '#4a7a6a').replace('#', '')
  const r = parseInt(c.slice(0,2), 16)
  const g = parseInt(c.slice(2,4), 16)
  const b = parseInt(c.slice(4,6), 16)
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160 ? '#1e3342' : '#ffffff'
}

export default function GoalsPanel({ userId, section = 'all', roles = [] }) {
  const { byCategory, addGoal, updateGoal, deleteGoal } = usePersonalGoals(userId)
  const { tasks: checklistTasks, isChecked, toggle: toggleCheck, addTask, updateTask, deleteTask: deleteChecklistTask } = usePersonalChecklist(userId)

  const [addingCategory, setAddingCategory] = useState(null)
  const [newGoalText, setNewGoalText] = useState('')
  const [newGoalRole, setNewGoalRole] = useState('')
  const [addingChecklist, setAddingChecklist] = useState(false)
  const [newChecklistTask, setNewChecklistTask] = useState('')
  const [newChecklistRole, setNewChecklistRole] = useState('')

  async function handleAddGoal(category) {
    if (!newGoalText.trim()) return
    await addGoal(category, newGoalText.trim(), newGoalRole || null)
    setNewGoalText('')
    setNewGoalRole('')
    setAddingCategory(null)
  }

  const orderedCategories = [
    ...CATEGORY_ORDER.filter(c => byCategory[c]),
    ...Object.keys(byCategory).filter(c => !CATEGORY_ORDER.includes(c)),
  ]

  function roleNameById(id) {
    return roles.find(r => r.id === id)?.name || ''
  }

  return (
    <div className="goals-panel">
      {(section === 'all' || section === 'goals') && (
        <div className="goals-section">
          <div className="goals-section-header">
            <span className="goals-trophy">🏆</span>
            <h3 className="goals-title">My Personal Goals</h3>
          </div>
          <div className="goals-grid">
            {orderedCategories.map((category, idx) => {
              const color = idx % 2 === 0 ? '#1e3070' : '#ffb81c'
              const goals = byCategory[category] || []
              return (
                <div key={category} className="goal-card">
                  <div className="goal-card-header" style={{ background: color }}>
                    <span className="goal-card-title" style={{ color: contrastColor(color) }}>{category}</span>
                  </div>
                  <div className="goal-card-body">
                    {goals.map(g => (
                      <div key={g.id} className="goal-item">
                        <div className="goal-item-main">
                          <span className="goal-text">{g.goal_text}</span>
                          {g.role_id && (
                            <span className="goal-role-badge">{roleNameById(g.role_id)}</span>
                          )}
                        </div>
                        <div className="goal-item-actions">
                          {roles.length > 0 && (
                            <select
                              className="goal-role-select"
                              value={g.role_id || ''}
                              onChange={e => updateGoal(g.id, { role_id: e.target.value || null })}
                              title="Assign to a role"
                            >
                              <option value="">— role —</option>
                              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                          )}
                          <button className="goal-del" onClick={() => deleteGoal(g.id)}>×</button>
                        </div>
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
                        {roles.length > 0 && (
                          <select className="goal-add-role-select" value={newGoalRole} onChange={e => setNewGoalRole(e.target.value)}>
                            <option value="">No role</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                        )}
                        <button className="goal-add-save" onClick={() => handleAddGoal(category)}>✓</button>
                        <button className="goal-add-cancel" onClick={() => setAddingCategory(null)}>✕</button>
                      </div>
                    ) : (
                      <button
                        className="goal-add-btn"
                        onClick={() => { setAddingCategory(category); setNewGoalText(''); setNewGoalRole('') }}
                      >+ add</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {(section === 'all' || section === 'checklist') && (
        <div className="checklist-section">
          <h3 className="checklist-title">Monthly Checklist</h3>
          <table className="checklist-table">
            <thead>
              <tr>
                <th className="task-col">TASK</th>
                <th className="task-role-col">ROLE</th>
                {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => (
                  <th key={i}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checklistTasks.map((task, rowIdx) => {
                const color = '#1e3070'
                return (
                  <tr key={task.id}>
                    <td className="task-name-cell">
                      <span>{task.task_name}</span>
                      <button className="goal-del" onClick={() => deleteChecklistTask(task.id)} style={{ marginLeft: 4 }}>×</button>
                    </td>
                    <td className="task-role-cell">
                      {roles.length > 0 && (
                        <select
                          className="checklist-role-select"
                          value={task.role_id || ''}
                          onChange={e => updateTask(task.id, { role_id: e.target.value || null })}
                        >
                          <option value="">—</option>
                          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      )}
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
              <tr>
                <td colSpan={14}>
                  {addingChecklist ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 0' }}>
                      <input
                        autoFocus
                        placeholder="New task…"
                        value={newChecklistTask}
                        onChange={e => setNewChecklistTask(e.target.value)}
                        onKeyDown={async e => {
                          if (e.key === 'Enter' && newChecklistTask.trim()) {
                            await addTask(newChecklistTask.trim(), newChecklistRole || null)
                            setNewChecklistTask('')
                            setNewChecklistRole('')
                            setAddingChecklist(false)
                          }
                          if (e.key === 'Escape') setAddingChecklist(false)
                        }}
                        className="checklist-new-input"
                      />
                      {roles.length > 0 && (
                        <select className="checklist-role-select" value={newChecklistRole} onChange={e => setNewChecklistRole(e.target.value)}>
                          <option value="">No role</option>
                          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      )}
                      <button className="goal-add-save" onClick={async () => {
                        if (newChecklistTask.trim()) {
                          await addTask(newChecklistTask.trim(), newChecklistRole || null)
                          setNewChecklistTask('')
                          setNewChecklistRole('')
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
      )}
    </div>
  )
}
