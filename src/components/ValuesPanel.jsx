import { useState } from 'react'
import { usePersonalValues } from '../hooks/usePersonalValues'
import './ValuesPanel.css'

const COLOR_OPTIONS = [
  { label: 'Red',    value: 'red',    hex: '#c0392b' },
  { label: 'Blue',   value: 'blue',   hex: '#2980b9' },
  { label: 'Green',  value: 'green',  hex: '#27ae60' },
  { label: 'Purple', value: 'purple', hex: '#8e44ad' },
  { label: 'Orange', value: 'orange', hex: '#e67e22' },
  { label: 'Gold',   value: 'gold',   hex: '#d4a017' },
  { label: 'Teal',   value: 'teal',   hex: '#16a085' },
]

function colorHex(val) {
  return COLOR_OPTIONS.find(c => c.value === val)?.hex || '#2980b9'
}

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
          {values.map(v => (
            <ValueGroup key={v.id} value={v} onUpdate={updateValue} onDelete={deleteValue} />
          ))}
        </div>
      )}

      </div>
    </div>
  )
}

function ValueGroup({ value: v, onUpdate, onDelete }) {
  const [collapsed, setCollapsed] = useState(true)
  const color = colorHex(v.color)

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

            <div className="values-field-row">
              <span className="values-field-label">Color</span>
              <div className="values-color-picker">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    className={`values-color-swatch${v.color === c.value ? ' active' : ''}`}
                    style={{ background: c.hex }}
                    title={c.label}
                    onClick={() => onUpdate(v.id, { color: c.value })}
                  />
                ))}
                <span className="values-color-label" style={{ color }}>
                  {COLOR_OPTIONS.find(c => c.value === v.color)?.label || ''}
                </span>
              </div>
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
