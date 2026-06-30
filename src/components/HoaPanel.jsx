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

// Board Member Packets pulled from the HOA Google Drive folder
// https://drive.google.com/drive/u/0/folders/1DPzR6n9aPRHdGtBagWXVygwqLh8Hm5oV
const HOA_DOCUMENTS = [
  { id: '1wv2AN58xec2YDEnynog3QN28dOauOBQE', title: 'Board Member Packet — Jan 2024' },
  { id: '1h-7f6dhFwpAEpyNIUlnyGcH05xAHJcOw', title: 'Board Member Packet — Feb 2024' },
  { id: '1ZeGmCwBcAbAUK0_4mdAN5Th6SlQLGp-m', title: 'Board Member Packet — Apr 2024' },
  { id: '1MgETqM7M4EDjvSVlhatNUky8VFs-ZbV0', title: 'Board Member Packet — May 2024' },
  { id: '1LQyPsnjOLRPqqSaLLMAR0QsVGXvaarcC', title: 'Board Member Packet — Jun 2024' },
  { id: '1XKu--0UeWgNF1ZsjqVGMpH20Y80kCtU2', title: 'Board Member Packet — Jul 2024' },
  { id: '1Ij5F2FRxYwcD8c0JoEkRfPY_P2heFhGz', title: 'Board Member Packet — Sep 2024' },
  { id: '1aIvXmf8Ol8OjqrBbP0fjlt_mKCcv5MF2', title: 'Board Member Packet — Oct 2024' },
  { id: '1aBXR0EmAOQhXG_TcXhMHjS5_z0_GiHvk', title: 'Board Member Packet — Nov 2024' },
  { id: '1LBzAgsy3GODMkC-qcxXGNLmcV97h2kPR', title: 'Board Member Packet — Dec 2024' },
  { id: '1jbaHr99QhI14moBzKqFaaWSi5qWQkjOE', title: 'Board Member Packet — Jan 2025' },
  { id: '19VlHDMhTYu8vyPAJNfuCIIY9EKFgWfPE', title: 'Board Member Packet — Feb 2025' },
  { id: '1yQQOxo8CryxFfQZILwVKdzBbrGvK6HLU', title: 'Board Member Packet — Apr 2025' },
  { id: '1idbmHBmTZmPWSFH_r3SyBFyLZiaaAfIz', title: 'Board Member Packet — May 2025' },
  { id: '1bkey6UkJwQbawYzb02_Trn9OsEBU5Cll', title: 'Board Member Packet — Jun 2025' },
  { id: '11ci-Ovd_u7W_L8RWwSOOqNtBbo7h0DPw', title: 'Board Member Packet — Jul 2025' },
  { id: '10JWSkMl_Z-fOfHaqZeiY8Lfif8Lex0zO', title: 'Board Member Packet — Aug 2025' },
  { id: '1UxwpH8OIuytYT_gPI_nM4uknoc2l07r8', title: 'Board Member Packet — Sep 2025' },
  { id: '1b0HZBKcKaGgpKK9DITEUh7iXxYP-TqOF', title: 'Board Member Packet — Oct 2025' },
  { id: '1NjMitsQaTKSt7pD3qKUnxh1q6TVFbcii', title: 'Board Member Packet — Nov 2025' },
  { id: '1Fbqk5-uGowoSQOwM5aqV65nj-PXJE5Q8', title: 'Board Member Packet — Dec 2025' },
  { id: '1EczD8IEv11e2PKQzhnTRzIT9JXgv5uca', title: 'Board Member Packet — Jan 2026' },
  { id: '1hUh2lB4f2y1MTIM_SxGzURBri539FYR1', title: 'Board Member Packet — Feb 2026' },
  { id: '1kPnz_THZsDM2-9XvJbD8HKk3H5s9eVlP', title: 'Board Member Packet — Mar 2026' },
  { id: '1Tpua6LoxnXvzZAI2cWGwXCmu189ptU-T', title: 'Board Member Packet — Apr 2026' },
  { id: '1Vh5US5NUKaPNaI-nbNFbtE6KgG56Bm0H', title: 'Board Member Packet — May 2026' },
].map(d => ({ ...d, url: `https://drive.google.com/file/d/${d.id}/view` })).reverse()

export default function HoaPanel({ userId }) {
  const { items, loading, addItem, updateItem, deleteItem } = useHoaItems(userId)
  const [tab, setTab] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [editId, setEditId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const tabs = ['All', ...CATEGORIES, 'Documents']
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
        {tab !== 'Documents' && <button className="hoa-add-btn" onClick={openAdd}>+ Add Item</button>}
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
            style={{ '--tab-col': t === 'All' ? '#1e3070' : t === 'Documents' ? '#5c7d9e' : CAT_COLORS[t] }}
            onClick={() => setTab(t)}
          >{t}</button>
        ))}
      </div>

      {/* Documents tab */}
      {tab === 'Documents' && (
        <div className="hoa-docs">
          <p className="hoa-docs-intro">
            Board Member Packets synced from the{' '}
            <a href="https://drive.google.com/drive/u/0/folders/1DPzR6n9aPRHdGtBagWXVygwqLh8Hm5oV" target="_blank" rel="noreferrer noopener">
              HOA Google Drive folder
            </a>.
          </p>
          <ul className="hoa-docs-list">
            {HOA_DOCUMENTS.map(doc => (
              <li key={doc.id} className="hoa-doc-item">
                <a href={doc.url} target="_blank" rel="noreferrer noopener">{doc.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add / Edit form */}
      {tab !== 'Documents' && showForm && (
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
      {tab !== 'Documents' && <div className="hoa-list">
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
      </div>}
    </div>
  )
}
