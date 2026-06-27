import { useState, useRef } from 'react'
import { useRoles } from '../hooks/useRoles'
import './RolesPanel.css'

const ROLE_ICONS = ['👩‍👧‍👦', '💼', '🏠', '📚', '🤝', '💪', '🌱', '❤️', '✨', '🎯']

export default function RolesPanel({ userId }) {
  const { roles, addRole, updateRole, deleteRole } = useRoles(userId)
  const [detail, setDetail] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const saveTimer = useRef({})

  const current = roles.find(r => r.id === detail)

  function handlePurposeChange(id, text) {
    updateRole(id, { purpose: text })
    clearTimeout(saveTimer.current[id])
    saveTimer.current[id] = setTimeout(() => {}, 0)
  }

  function handleNameChange(id, name) {
    clearTimeout(saveTimer.current[id + '_name'])
    saveTimer.current[id + '_name'] = setTimeout(() => updateRole(id, { name }), 500)
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
        <span className="roles-list-title">Roles</span>
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
          {roles.map((r, i) => (
            <button
              key={r.id}
              className="roles-card"
              onClick={() => setDetail(r.id)}
            >
              <span className="roles-card-icon">{ROLE_ICONS[i % ROLE_ICONS.length]}</span>
              <div className="roles-card-body">
                <span className="roles-card-name">{r.name}</span>
                {r.purpose && (
                  <span className="roles-card-preview">
                    {r.purpose.slice(0, 100)}{r.purpose.length > 100 ? '…' : ''}
                  </span>
                )}
              </div>
              <span className="roles-card-chevron">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
