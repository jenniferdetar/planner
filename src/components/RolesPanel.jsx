import { useState, useEffect } from 'react'
import { useRoles } from '../hooks/useRoles'
import { useRoleProgress } from '../hooks/useRoleProgress'
import { supabase } from '../lib/supabase'
import './RolesPanel.css'

const ROLE_ICONS = ['👩‍👧‍👦', '💼', '🏠', '📚', '🤝', '💪', '🌱', '❤️', '✨', '🎯']

function useRoleLinked(roleId) {
  const [goals, setGoals] = useState([])
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!roleId) { setGoals([]); setTasks([]); return }
    supabase.from('personal_goals').select('id, goal_text, category').eq('role_id', roleId).order('category').then(({ data }) => setGoals(data || []))
    supabase.from('personal_checklist_tasks').select('id, task_name').eq('role_id', roleId).order('sort_order').then(({ data }) => setTasks(data || []))
  }, [roleId])

  return { goals, tasks }
}

export default function RolesPanel({ userId }) {
  const { roles, addRole, updateRole, deleteRole } = useRoles(userId)
  const progressByRole = useRoleProgress(userId)
  const [detail, setDetail] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  const current = roles.find(r => r.id === detail)
  const { goals: linkedGoals, tasks: linkedTasks } = useRoleLinked(detail)

  function handlePurposeChange(id, text) {
    updateRole(id, { purpose: text })
  }

  function handleNameChange(id, name) {
    updateRole(id, { name })
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    const r = await addRole(newName.trim())
    setNewName('')
    setAdding(false)
    if (r) setDetail(r.id)
  }

  async function handleDelete(id) {
    await deleteRole(id)
    setDetail(null)
  }

  if (detail && current) {
    const icon = ROLE_ICONS[roles.indexOf(current) % ROLE_ICONS.length]
    return (
      <div className="roles-detail">
        <div className="roles-detail-nav">
          <button className="roles-back-btn" onClick={() => setDetail(null)}>‹ Back</button>
          <span className="roles-detail-nav-title">{current.name}</span>
        </div>
        <div className="roles-detail-body">
          <div className="roles-detail-icon">{icon}</div>
          <input
            className="roles-name-input"
            defaultValue={current.name}
            onChange={e => handleNameChange(current.id, e.target.value)}
          />
          <label className="roles-purpose-label">My purpose in this role</label>
          <textarea
            className="roles-purpose-textarea"
            value={current.purpose}
            onChange={e => handlePurposeChange(current.id, e.target.value)}
            placeholder="What does this role mean to you? What do you want to give to it?"
          />

          {(linkedGoals.length > 0 || linkedTasks.length > 0) && (
            <div className="roles-linked-section">
              {linkedGoals.length > 0 && (
                <div className="roles-linked-block">
                  <span className="roles-linked-label">Goals tied to this role</span>
                  <ul className="roles-linked-list">
                    {linkedGoals.map(g => (
                      <li key={g.id} className="roles-linked-item">
                        <span className="roles-linked-cat">{g.category}</span>
                        <span className="roles-linked-text">{g.goal_text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {linkedTasks.length > 0 && (
                <div className="roles-linked-block">
                  <span className="roles-linked-label">Monthly checklist tasks tied to this role</span>
                  <ul className="roles-linked-list">
                    {linkedTasks.map(t => (
                      <li key={t.id} className="roles-linked-item">
                        <span className="roles-linked-text">{t.task_name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button className="roles-delete-btn" onClick={() => handleDelete(current.id)}>
            Delete Role
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="roles-list-wrap">
      <div className="roles-list-header">
        <span className="roles-list-title">Life Roles</span>
        {!adding && (
          <button className="roles-add-btn" onClick={() => setAdding(true)}>+ Add Role</button>
        )}
      </div>

      <div className="roles-content">
        {adding && (
          <form className="roles-add-form" onSubmit={handleAdd}>
            <input
              autoFocus
              className="roles-add-input"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Role name (e.g. Mother, Professional, Wife…)"
            />
            <button className="roles-add-save" type="submit">Add</button>
            <button className="roles-add-cancel" type="button" onClick={() => { setAdding(false); setNewName('') }}>Cancel</button>
          </form>
        )}

        {roles.length === 0 && !adding && (
          <p className="roles-empty">No roles yet. Add one to get started.</p>
        )}

        <div className="roles-cards">
          {roles.map((r, i) => {
            const progress = progressByRole[r.id]
            const pct = progress?.pct ?? 0
            return (
              <button
                key={r.id}
                className="roles-card"
                onClick={() => setDetail(r.id)}
              >
                <span className="roles-card-icon">{ROLE_ICONS[i % ROLE_ICONS.length]}</span>
                <div className="roles-card-body">
                  <span className="roles-card-name">{r.name}</span>
                  <div className="roles-progress-row">
                    <div className="roles-progress-track">
                      <div className="roles-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="roles-progress-pct">{pct}%</span>
                  </div>
                  {progress
                    ? <span className="roles-card-goals">{progress.completed}/{progress.total} goals complete</span>
                    : <span className="roles-card-goals">No linked goals</span>}
                </div>
                <span className="roles-card-chevron">›</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
