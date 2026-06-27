import { useState } from 'react'
import { useHoaItems, CATEGORIES, PRIORITIES, STATUSES } from '../hooks/useHoaItems'
import './HoaPanel.css'

const STATUS_COLORS = {
  'Not Started': '#aaa',
  'In Progress': '#f0a040',
  'Completed':   '#5cb85c',
  'Resolved':    '#5c9ee0',
}
const PRIORITY_COLORS = { High: '#e05c5c', Medium: '#f0a040', Low: '#5c9ee0' }
const CAT_COLORS = {
  Maintenance: '#1e3070',
  Financials:  '#3a5c4a',
  Insurance:   '#4a7ab5',
  Legal:       '#a05050',
  General:     '#888',
}

const BLANK = { category: 'Maintenance', unit: '', title: '', priority: 'Medium', status: 'In Progress', item_date: '', notes: '' }

export default function HoaPanel({ userId }) {
  const { items, loading, addItem, updateItem, deleteItem } = useHoaItems(userId)
  const [tab, setTab] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [editId, setEditId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const tabs = ['All', ...CATEGORIES]
  const filtered = tab === 'All' ? items : items.filter(i => i.category === tab)

  const counts = {}
  CATEGORIES.forEach(c => { counts[c] = items.filter(i => i.category === c && i.status !== 'Completed' && i.status !== 'Resolved').length })

  function openAdd() {
    setForm(BLANK)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(item) {
    setForm({
      category: item.category,
      unit: item.unit || '',
      title: item.title,
      priority: item.priority,
      status: item.status,
      item_date: item.item_date || '',
      notes: item.notes || '',
    })
    setEditId(item.id)
    setShowForm(true)
    setExpandedId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const fields = { ...form, unit: form.unit || null, item_date: form.item_date || null, notes: form.notes || null }
    if (editId) {
      await updateItem(editId, fields)
    } else {
      await addItem(fields)
    }
    setShowForm(false)
    setEditId(null)
    setForm(BLANK)
  }

  return (
    <div className="hoa-panel">
      {/* Header */}
      <div className="hoa-header">
        <span className="hoa-header-title">Park Reseda HOA</span>
        <button className="hoa-add-btn" onClick={openAdd}>+ Add Item</button>
      </div>

      {/* Stats row */}
      <div className="hoa-stats">
        {CATEGORIES.map(c => (
          <div key={c} className="hoa-stat" style={{ '--cat': CAT_COLORS[c] }}>
            <span className="hoa-stat-num">{counts[c]}</span>
            <span className="hoa-stat-lbl">{c}</span>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="hoa-tabs">
        {tabs.map(t => (
          <button
            key={t}
            className={`hoa-tab ${tab === t ? 'active' : ''}`}
            style={{ '--tab-col': t === 'All' ? '#1e3070' : CAT_COLORS[t] }}
            onClick={() => setTab(t)}
          >{t}</button>
        ))}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <form className="hoa-form" onSubmit={handleSubmit}>
          <div className="hoa-form-row">
            <select className="hoa-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input className="hoa-input hoa-input-sm" placeholder="Unit #" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
            <input type="date" className="hoa-input hoa-input-sm" value={form.item_date} onChange={e => setForm(f => ({ ...f, item_date: e.target.value }))} />
          </div>
          <input className="hoa-input" placeholder="Title *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div className="hoa-form-row">
            <div className="hoa-btn-group">
              {PRIORITIES.map(p => (
                <button key={p} type="button"
                  className={`hoa-btn-option ${form.priority === p ? 'active' : ''}`}
                  style={{ '--bc': PRIORITY_COLORS[p] }}
                  onClick={() => setForm(f => ({ ...f, priority: p }))}>{p}</button>
              ))}
            </div>
            <div className="hoa-btn-group">
              {STATUSES.map(s => (
                <button key={s} type="button"
                  className={`hoa-btn-option ${form.status === s ? 'active' : ''}`}
                  style={{ '--bc': STATUS_COLORS[s] }}
                  onClick={() => setForm(f => ({ ...f, status: s }))}>{s}</button>
              ))}
            </div>
          </div>
          <textarea className="hoa-textarea" rows={3} placeholder="Notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="hoa-form-actions">
            <button type="button" className="hoa-cancel-btn" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</button>
            <button type="submit" className="hoa-save-btn">{editId ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </form>
      )}

      {/* Items list */}
      <div className="hoa-list">
        {loading && <p className="hoa-empty">Loading…</p>}
        {!loading && filtered.length === 0 && <p className="hoa-empty">No items in this category.</p>}
        {filtered.map(item => {
          const isOpen = expandedId === item.id
          return (
            <div key={item.id} className={`hoa-item ${isOpen ? 'expanded' : ''}`}>
              <div className="hoa-item-main" onClick={() => setExpandedId(isOpen ? null : item.id)}>
                <span className="hoa-item-cat-dot" style={{ background: CAT_COLORS[item.category] }} />
                <div className="hoa-item-body">
                  <span className="hoa-item-title">
                    {item.unit && <span className="hoa-item-unit">Unit {item.unit} — </span>}
                    {item.title}
                  </span>
                  <div className="hoa-item-meta">
                    {item.item_date && <span className="hoa-item-date">{new Date(item.item_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                    <span className="hoa-item-priority" style={{ color: PRIORITY_COLORS[item.priority] }}>{item.priority}</span>
                    <span className="hoa-item-status" style={{ background: STATUS_COLORS[item.status] + '22', color: STATUS_COLORS[item.status] }}>{item.status}</span>
                  </div>
                </div>
                <span className="hoa-item-chevron">{isOpen ? '▲' : '▼'}</span>
              </div>
              {isOpen && (
                <div className="hoa-item-detail">
                  {item.notes && <p className="hoa-item-notes">{item.notes}</p>}
                  <div className="hoa-item-actions">
                    <button className="hoa-edit-btn" onClick={() => openEdit(item)}>Edit</button>
                    <button className="hoa-del-btn" onClick={() => deleteItem(item.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
