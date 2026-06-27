import { useState } from 'react'
import { useContractReference } from '../hooks/useContractReference'
import './ContractReference.css'

const CATEGORIES = [
  'Discipline', 'Leave', 'Schedule', 'Evaluation',
  'Grievance', 'Overtime', 'Transfer', 'Health & Safety', 'Probation', 'Layoff',
  'Constitution',
]

const CAT_COLORS = {
  'Discipline':     '#c0392b',
  'Leave':          '#2980b9',
  'Schedule':       '#8e44ad',
  'Evaluation':     '#16a085',
  'Grievance':      '#d35400',
  'Overtime':       '#27ae60',
  'Transfer':       '#2c3e50',
  'Health & Safety':'#e74c3c',
  'Probation':      '#7f8c8d',
  'Layoff':         '#c0392b',
  'Constitution':   '#003087',
}

const BLANK_FORM = {
  issue_category: CATEGORIES[0],
  issue_description: '',
  article_number: '',
  section_number: '',
  summary: '',
  notes: '',
}

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button className="cref-copy-btn" onClick={handleCopy}>
      {copied ? '✓ Copied' : label}
    </button>
  )
}

function buildAnswerText(entry) {
  const parts = []
  if (entry.article_number) parts.push(`${entry.article_number}${entry.section_number ? ` § ${entry.section_number}` : ''}`)
  parts.push(entry.summary)
  if (entry.notes) parts.push(`Note: ${entry.notes}`)
  return parts.join('\n\n')
}

function EntryForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || BLANK_FORM)
  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function handleSubmit(e) {
    e.preventDefault()
    if (!form.issue_description.trim() || !form.summary.trim()) return
    onSave(form)
  }
  return (
    <form className="cref-form" onSubmit={handleSubmit}>
      <div className="cref-form-row">
        <label>Category</label>
        <select value={form.issue_category} onChange={e => set('issue_category', e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="cref-form-row">
        <label>Issue / Topic *</label>
        <input value={form.issue_description} onChange={e => set('issue_description', e.target.value)}
          placeholder="e.g. Suspension without pay" required />
      </div>
      <div className="cref-form-2col">
        <div className="cref-form-row">
          <label>Article</label>
          <input value={form.article_number} onChange={e => set('article_number', e.target.value)}
            placeholder="e.g. Article IX" />
        </div>
        <div className="cref-form-row">
          <label>Section</label>
          <input value={form.section_number} onChange={e => set('section_number', e.target.value)}
            placeholder="e.g. 9.1" />
        </div>
      </div>
      <div className="cref-form-row">
        <label>Summary *</label>
        <textarea value={form.summary} onChange={e => set('summary', e.target.value)}
          placeholder="Contract language and rights summary…" rows={4} required />
      </div>
      <div className="cref-form-row">
        <label>Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Tips, things to watch out for…" rows={2} />
      </div>
      <div className="cref-form-btns">
        <button type="submit" className="cref-save-btn">Save</button>
        <button type="button" className="cref-cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

export default function ContractReference({ userId }) {
  const { entries, loading, addEntry, updateEntry, deleteEntry, seedDefaults } = useContractReference(userId)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [seeding, setSeeding] = useState(false)

  const allCategories = ['All', ...CATEGORIES]

  const filtered = entries.filter(e => {
    const matchCat = categoryFilter === 'All' || e.issue_category === categoryFilter
    if (!matchCat) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      e.issue_description.toLowerCase().includes(q) ||
      e.issue_category.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      (e.article_number || '').toLowerCase().includes(q) ||
      (e.section_number || '').toLowerCase().includes(q) ||
      (e.notes || '').toLowerCase().includes(q)
    )
  })

  const selected = entries.find(e => e.id === selectedId) || null

  function handlePillClick(id) {
    setSelectedId(prev => prev === id ? null : id)
    setShowForm(false)
    setEditEntry(null)
  }

  async function handleSaveNew(fields) {
    await addEntry(fields)
    setShowForm(false)
  }

  async function handleSaveEdit(fields) {
    await updateEntry(editEntry.id, fields)
    setEditEntry(null)
    setSelectedId(null)
  }

  async function handleDelete(id) {
    await deleteEntry(id)
    setSelectedId(null)
  }

  async function handleSeed() {
    setSeeding(true)
    await seedDefaults()
    setSeeding(false)
  }

  return (
    <div className="cref-panel">
      <div className="cref-header">
        <div className="cref-header-top">
          <button className="cref-add-btn" onClick={() => { setShowForm(v => !v); setEditEntry(null); setSelectedId(null) }}>+ Add</button>
        </div>
        <div className="cref-controls">
          <input
            className="cref-search"
            placeholder="Search keyword, article, topic…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="cref-cat-filter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            {allCategories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {(showForm && !editEntry) && (
        <div className="cref-form-wrap">
          <EntryForm onSave={handleSaveNew} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editEntry && (
        <div className="cref-form-wrap">
          <EntryForm initial={editEntry} onSave={handleSaveEdit} onCancel={() => setEditEntry(null)} />
        </div>
      )}

      <div className="cref-body">
        {/* Pill grid */}
        <div className="cref-pills">
          {loading && <p className="cref-empty">Loading…</p>}

          {!loading && entries.length === 0 && (
            <div className="cref-seed-prompt">
              <p>No entries yet. Start from the common issues list or add your own.</p>
              <button className="cref-seed-btn" onClick={handleSeed} disabled={seeding}>
                {seeding ? 'Loading…' : 'Load Common Issues (20 entries)'}
              </button>
            </div>
          )}

          {!loading && entries.length > 0 && filtered.length === 0 && (
            <p className="cref-empty">No matches for "{search}"</p>
          )}

          {filtered.map(e => {
            const color = CAT_COLORS[e.issue_category] || '#2a5878'
            const isActive = selectedId === e.id
            return (
              <button
                key={e.id}
                className={`cref-pill${isActive ? ' active' : ''}`}
                style={{ '--pill-color': color }}
                onClick={() => handlePillClick(e.id)}
              >
                <span className="cref-pill-dot" />
                <span className="cref-pill-label">{e.issue_description}</span>
                {(e.article_number || e.section_number) && (
                  <span className="cref-pill-art">
                    {e.article_number}{e.section_number ? ` § ${e.section_number}` : ''}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Detail pane */}
        {selected && !editEntry && (
          <div className="cref-detail">
            <div className="cref-detail-header">
              <div className="cref-detail-meta">
                <span className="cref-cat-badge" style={{ background: CAT_COLORS[selected.issue_category] || '#2a5878' }}>
                  {selected.issue_category}
                </span>
                {(selected.article_number || selected.section_number) && (
                  <span className="cref-art-badge">
                    {selected.article_number}{selected.section_number ? ` § ${selected.section_number}` : ''}
                  </span>
                )}
              </div>
              <button className="cref-detail-close" onClick={() => setSelectedId(null)}>✕</button>
            </div>

            <h3 className="cref-detail-title">{selected.issue_description}</h3>
            <p className="cref-summary">{selected.summary}</p>
            {selected.notes && (
              <p className="cref-notes"><strong>Note:</strong> {selected.notes}</p>
            )}

            <div className="cref-card-actions">
              <CopyButton text={buildAnswerText(selected)} label="Copy Answer" />
              <CopyButton
                text={`${selected.article_number ? `${selected.article_number}${selected.section_number ? ` § ${selected.section_number}` : ''}: ` : ''}${selected.summary}`}
                label="Copy Summary"
              />
              <button className="cref-edit-btn" onClick={() => setEditEntry(selected)}>Edit</button>
              <button className="cref-del-btn" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
        )}
      </div>

      {!loading && entries.length > 0 && (
        <div className="cref-footer">
          {filtered.length} of {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </div>
      )}
    </div>
  )
}
