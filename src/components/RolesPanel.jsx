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

// Shared state so the role list and the selected role's detail can render
// as two independent components (e.g. on separate binder pages) while
// staying in sync.
export function useRolesPage(userId) {
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

  return {
    roles, progressByRole, detail, setDetail, current,
    linkedGoals, linkedTasks,
    adding, setAdding, newName, setNewName,
    handlePurposeChange, handleNameChange, handleAdd, handleDelete,
  }
}

export function RolesList({ api }) {
  return (
    <div className="roles-list-wrap">
      <div className="roles-list-header">
        <span className="roles-list-title">Life Roles</span>
        {!api.adding && (
          <button className="roles-add-btn" onClick={() => api.setAdding(true)}>+ Add Role</button>
        )}
      </div>

      <div className="roles-content">
        {api.adding && (
          <form className="roles-add-form" onSubmit={api.handleAdd}>
            <input
              autoFocus
              className="roles-add-input"
              value={api.newName}
              onChange={e => api.setNewName(e.target.value)}
              placeholder="Role name (e.g. Mother, Professional, Wife…)"
            />
            <button className="roles-add-save" type="submit">Add</button>
            <button className="roles-add-cancel" type="button" onClick={() => { api.setAdding(false); api.setNewName('') }}>Cancel</button>
          </form>
        )}

        {api.roles.length === 0 && !api.adding && (
          <p className="roles-empty">No roles yet. Add one to get started.</p>
        )}

        <div className="roles-cards">
          {api.roles.map((r, i) => {
            const progress = api.progressByRole[r.id]
            const pct = progress?.pct ?? 0
            return (
              <button
                key={r.id}
                className={`roles-card${api.detail === r.id ? ' active' : ''}`}
                onClick={() => api.setDetail(r.id)}
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

export function RoleDetail({ api }) {
  const { current } = api

  if (!current) {
    return (
      <div className="roles-detail roles-detail-empty">
        <span className="roles-detail-empty-icon">🎯</span>
        <p>Select a role to see its purpose and linked goals.</p>
      </div>
    )
  }

  const icon = ROLE_ICONS[api.roles.indexOf(current) % ROLE_ICONS.length]
  return (
    <div className="roles-detail">
      <div className="roles-detail-body">
        <div className="roles-detail-icon">{icon}</div>
        <input
          className="roles-name-input"
          defaultValue={current.name}
          onChange={e => api.handleNameChange(current.id, e.target.value)}
        />
        <label className="roles-purpose-label">My purpose in this role</label>
        <textarea
          className="roles-purpose-textarea"
          value={current.purpose}
          onChange={e => api.handlePurposeChange(current.id, e.target.value)}
          placeholder="What does this role mean to you? What do you want to give to it?"
        />

        {(api.linkedGoals.length > 0 || api.linkedTasks.length > 0) && (
          <div className="roles-linked-section">
            {api.linkedGoals.length > 0 && (
              <div className="roles-linked-block">
                <span className="roles-linked-label">Goals tied to this role</span>
                <ul className="roles-linked-list">
                  {api.linkedGoals.map(g => (
                    <li key={g.id} className="roles-linked-item">
                      <span className="roles-linked-cat">{g.category}</span>
                      <span className="roles-linked-text">{g.goal_text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {api.linkedTasks.length > 0 && (
              <div className="roles-linked-block">
                <span className="roles-linked-label">Monthly checklist tasks tied to this role</span>
                <ul className="roles-linked-list">
                  {api.linkedTasks.map(t => (
                    <li key={t.id} className="roles-linked-item">
                      <span className="roles-linked-text">{t.task_name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <button className="roles-delete-btn" onClick={() => api.handleDelete(current.id)}>
          Delete Role
        </button>
      </div>
    </div>
  )
}

export default function RolesPanel({ userId }) {
  const api = useRolesPage(userId)
  return (
    <div className="roles-panel-wrap">
      <RolesList api={api} />
      <RoleDetail api={api} />
    </div>
  )
}
