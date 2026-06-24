import { useState } from 'react'
import { useContractReference, CONTRACT_SEED } from '../hooks/useContractReference'
import './ContractReference.css'

const CATEGORIES = [
  'Discipline', 'Leave', 'Schedule', 'Evaluation',
  'Grievance', 'Overtime', 'Transfer', 'Health & Safety', 'Probation', 'Layoff',
]

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
    <button className="cref-copy-btn" onClick={handleCopy} title="Copy to clipboard">
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

function EntryCard({ entry, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const answerText = buildAnswerText(entry)

  return (
    <div className="cref-card">
      <div className="cref-card-header" onClick={() => setExpanded(v => !v)}>
        <div className="cref-card-meta">
          <span className="cref-cat-badge">{entry.issue_category}</span>
          {(entry.article_number || entry.section_number) && (
            <span className="cref-art-badge">
              {entry.article_number}{entry.section_number ? ` § ${entry.section_number}` : ''}
            </span>
          )}
        </div>
        <div className="cref-card-title">{entry.issue_description}</div>
        <span className="cref-expand-icon">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="cref-card-body">
          <p className="cref-summary">{entry.summary}</p>
          {entry.notes && (
            <p className="cref-notes"><strong>Note:</strong> {entry.notes}</p>
          )}
          <div className="cref-card-actions">
            <CopyButton text={answerText} label="Copy Answer" />
            <CopyButton
              text={`${entry.article_number ? `${entry.article_number}${entry.section_number ? ` § ${entry.section_number}` : ''}: ` : ''}${entry.summary}`}
              label="Copy Summary"
            />
            <button className="cref-edit-btn" onClick={() => onEdit(entry)}>Edit</button>
            <button className="cref-del-btn" onClick={() => onDelete(entry.id)}>Delete</button>
          </div>
        </div>
      )}
    </div>
  )
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
            placeholder="e.g. Article 18" />
        </div>
        <div className="cref-form-row">
          <label>Section</label>
          <input value={form.section_number} onChange={e => set('section_number', e.target.value)}
            placeholder="e.g. 18.3" />
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

  async function handleSaveNew(fields) {
    await addEntry(fields)
    setShowForm(false)
  }

  async function handleSaveEdit(fields) {
    await updateEntry(editEntry.id, fields)
    setEditEntry(null)
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
          <h2 className="cref-title">Contract Quick Reference</h2>
          <button className="cref-add-btn" onClick={() => { setShowForm(true); setEditEntry(null) }}>+ Add</button>
        </div>
        <div className="cref-controls">
          <input
            className="cref-search"
            placeholder="Search keyword, article, topic…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="cref-cat-filter"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
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
          <EntryForm
            initial={editEntry}
            onSave={handleSaveEdit}
            onCancel={() => setEditEntry(null)}
          />
        </div>
      )}

      <div className="cref-list">
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
        {filtered.map(e => (
          <EntryCard
            key={e.id}
            entry={e}
            onDelete={deleteEntry}
            onEdit={setEditEntry}
          />
        ))}
      </div>

      {!loading && entries.length > 0 && (
        <div className="cref-footer">
          {filtered.length} of {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </div>
      )}
    </div>
  )
}
