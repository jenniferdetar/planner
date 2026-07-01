import { useState, useRef, useEffect } from 'react'
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
  const [selected, setSelected] = useState(null) // id of active value subtab
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  const current = values.find(v => v.id === selected)

  // Keep a subtab selected whenever values exist.
  useEffect(() => {
    if (!selected && values.length > 0) setSelected(values[0].id)
    if (selected && !values.find(v => v.id === selected)) setSelected(values[0]?.id ?? null)
  }, [values, selected])

  function handleDescChange(id, text) {
    updateValue(id, { description: text })
  }

  function handleNameChange(id, name) {
    updateValue(id, { name })
  }

  function handleColorChange(id, color) {
    updateValue(id, { color })
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    const v = await addValue(newName.trim())
    setNewName('')
    setAdding(false)
    if (v) setSelected(v.id)
  }

  async function handleDelete(id) {
    await deleteValue(id)
    if (selected === id) setSelected(null)
  }

  return (
    <div className="values-list-wrap">
      <div className="values-list-header">
        <h3 className="values-list-title">Values</h3>
        {!adding && (
          <button className="values-add-btn" onClick={() => setAdding(true)}>+ Add Value</button>
        )}
      </div>

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
        <div className="values-subtabs">
          {values.map(v => (
            <button
              key={v.id}
              className={`values-subtab${selected === v.id ? ' active' : ''}`}
              style={{ '--val-color': colorHex(v.color) }}
              onClick={() => setSelected(v.id)}
            >
              <span className="values-subtab-dot" style={{ background: colorHex(v.color) }} />
              {v.name}
            </button>
          ))}
        </div>
      )}

      {current && (
        <div className="values-detail">
          <h2 className="values-detail-title" style={{ color: colorHex(current.color) }}>
            {current.name}
          </h2>

          <div className="values-field-row">
            <span className="values-field-label">Name</span>
            <input
              className="values-name-input"
              value={current.name}
              onChange={e => handleNameChange(current.id, e.target.value)}
            />
          </div>

          <div className="values-field-row">
            <span className="values-field-label">Color</span>
            <div className="values-color-picker">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.value}
                  className={`values-color-swatch${current.color === c.value ? ' active' : ''}`}
                  style={{ background: c.hex }}
                  title={c.label}
                  onClick={() => handleColorChange(current.id, c.value)}
                />
              ))}
              <span className="values-color-label" style={{ color: colorHex(current.color) }}>
                {COLOR_OPTIONS.find(c => c.value === current.color)?.label || ''}
              </span>
            </div>
          </div>

          <div className="values-field-row values-field-col">
            <span className="values-field-label">Value Description</span>
            <textarea
              className="values-desc-textarea"
              style={{ '--values-color': colorHex(current.color) }}
              value={current.description}
              onChange={e => handleDescChange(current.id, e.target.value)}
              placeholder="Describe what this value means to you…"
            />
          </div>

          <button className="values-delete-btn" onClick={() => handleDelete(current.id)}>
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
