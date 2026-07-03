import { useState } from 'react'
import { usePersonalValues } from '../hooks/usePersonalValues'
import './ValuesPanel.css'

// Cards cycle through this palette by position so the grid always has
// visual variety, instead of relying on someone picking a color per value.
const PALETTE = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#e67e22', '#d4a017', '#16a085']

export default function ValuesPanel({ userId }) {
  const { values, addValue, updateValue, deleteValue } = usePersonalValues(userId)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    await addValue(newName.trim())
    setNewName('')
    setAdding(false)
  }

  return (
    <div className="values-list-wrap">
      <div className="values-list-header">
        <h3 className="values-list-title">Values</h3>
        {!adding && (
          <button className="values-add-btn" onClick={() => setAdding(true)}>+ Add Value</button>
        )}
      </div>

      <div className="values-list-content">

      {adding && (
        <form className="values-add-form" onSubmit={handleAdd}>
          <input
            autoFocus
            className="values-add-input"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Value name (e.g. Happiness)"
          />
          <button className="values-add-save" type="submit">Add</button>
          <button className="values-add-cancel" type="button" onClick={() => { setAdding(false); setNewName('') }}>Cancel</button>
        </form>
      )}

      {values.length === 0 && !adding && (
        <p className="values-empty">No values yet. Add one to get started.</p>
      )}

      {values.length > 0 && (
        <div className="values-grid">
          {values.map((v, idx) => (
            <ValueGroup key={v.id} value={v} color={PALETTE[idx % PALETTE.length]} onUpdate={updateValue} onDelete={deleteValue} />
          ))}
        </div>
      )}

      </div>
    </div>
  )
}

function ValueGroup({ value: v, color, onUpdate, onDelete }) {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className={`value-group${collapsed ? '' : ' expanded'}`}>
      <div className="value-group-header" style={{ '--vc': color }} onClick={() => setCollapsed(c => !c)}>
        <span className="value-group-dot" style={{ background: color }} />
        <span className="value-group-name">{v.name}</span>
        <span className="value-group-toggle">{collapsed ? '▾' : '▴'}</span>
      </div>
      {!collapsed && (
        <div className="value-group-items">
          <div className="value-card">
            <div className="values-field-row">
              <span className="values-field-label">Name</span>
              <input
                className="values-name-input"
                value={v.name}
                onChange={e => onUpdate(v.id, { name: e.target.value })}
              />
            </div>

            <textarea
              className="values-desc-textarea"
              style={{ '--values-color': color }}
              value={v.description}
              onChange={e => onUpdate(v.id, { description: e.target.value })}
              placeholder="Describe what this value means to you…"
            />

            <button className="values-delete-btn" onClick={() => onDelete(v.id)}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
