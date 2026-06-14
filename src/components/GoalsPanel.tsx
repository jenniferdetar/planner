// @ts-nocheck
import { useState } from 'react'
import { usePersonalGoals } from '../hooks/usePersonalGoals'
import { usePersonalChecklist } from '../hooks/usePersonalChecklist'
import './GoalsPanel.css'

const CATEGORY_COLORS: Record<string, string> = {
  'Physical':       '#8B2B3A',
  'Mental':         '#6E2232',
  'Relational':     '#501A28',
  'Self-Care':      '#8B2B3A',
  'Hobbies':        '#2F1019',
  'Home':           '#6E2232',
  'Career':         '#501A28',
  'Financial':      '#2F1019',
  'Organizational': '#8B2B3A',
  'Screen Time':    '#6E2232',
  'Learn':          '#501A28',
  'CSEA':           '#00326b',
}

const CATEGORY_ORDER = ['Physical','Mental','Relational','Self-Care','Hobbies','Home','Career','Financial','Organizational','Screen Time','Learn','CSEA']

function contrastColor(hex: string | undefined): string {
  const c = (hex ?? '#8B2B3A').replace('#', '')
  const r = parseInt(c.slice(0,2), 16)
  const g = parseInt(c.slice(2,4), 16)
  const b = parseInt(c.slice(4,6), 16)
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160 ? '#1a1a2e' : '#ffffff'
}

interface GoalsPanelProps {
  userId: string | null
  section?: string
}

export default function GoalsPanel({ userId, section = 'all' }: GoalsPanelProps) {
  const { byCategory, addGoal, deleteGoal } = usePersonalGoals(userId)
  const { tasks: checklistTasks, isChecked, toggle: toggleCheck, addTask: addChecklistTask, deleteTask: deleteChecklistTask } = usePersonalChecklist(userId)

  const [addingCategory, setAddingCategory] = useState<string | null>(null)
  const [newGoalText, setNewGoalText] = useState('')
  const [addingChecklist, setAddingChecklist] = useState(false)
  const [newChecklistTask, setNewChecklistTask] = useState('')

  async function handleAddGoal(category: string) {
    if (!newGoalText.trim()) return
    await addGoal(category, newGoalText.trim())
    setNewGoalText('')
    setAddingCategory(null)
  }

  const orderedCategories = [
    ...CATEGORY_ORDER.filter(c => byCategory[c]),
    ...Object.keys(byCategory).filter(c => !CATEGORY_ORDER.includes(c)),
  ]

  return (
    <div className="goals-panel">
      {/* My Personal Goals */}
      {(section === 'all' || section === 'goals') && <div className="goals-section">
        <div className="goals-section-header">
          <span className="goals-trophy">🏆</span>
          <h3 className="goals-title">My Personal Goals</h3>
        </div>
        <div className="goals-grid">
          {orderedCategories.map(category => {
            const color = CATEGORY_COLORS[category] || '#8B2B3A'
            const goals = byCategory[category] || []
            return (
              <div key={category} className="goal-card">
                <div className="goal-card-header" style={{ background: color }}>
                  <span className="goal-card-title" style={{ color: contrastColor(color) }}>{category}</span>
                </div>
                <div className="goal-card-body">
                  {goals.map((g: any) => (
                    <div key={g.id} className="goal-item">
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGoalText(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
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
      </div>}

      {/* Monthly Checklist */}
      {(section === 'all' || section === 'checklist') && <div className="checklist-section">
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
            {checklistTasks.map((task: any, rowIdx: number) => {
              const colors = ['#8B2B3A','#501A28','#6E2232','#2F1019']
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
            <tr>
              <td colSpan={13}>
                {addingChecklist ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 0' }}>
                    <input
                      autoFocus
                      placeholder="New task…"
                      value={newChecklistTask}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewChecklistTask(e.target.value)}
                      onKeyDown={async (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      </div>}
    </div>
  )
}
