import { useState } from 'react'
import './FamilyTree.css'

const GENERATIONS = [
  { label: 'Great-Grandparents', value: -3 },
  { label: 'Grandparents', value: -2 },
  { label: 'Parents', value: -1 },
  { label: 'My Generation', value: 0 },
  { label: 'Children', value: 1 },
  { label: 'Grandchildren', value: 2 },
]

const RELATIONSHIPS = [
  'self', 'spouse', 'parent', 'step-parent', 'grandparent', 'great-grandparent',
  'sibling', 'half-sibling', 'step-sibling', 'sibling-in-law',
  'child', 'step-child', 'grandchild',
  'aunt/uncle', 'niece/nephew', 'cousin', 'other',
]

const BLANK = { name: '', birth_year: '', death_year: '', relationship: 'sibling', generation: 0, side: '', notes: '' }

export default function FamilyTreePanel({ members = [], onAddMember, onUpdateMember, onDeleteMember }) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)

  function openAdd() { setEditing(null); setForm(BLANK); setShowModal(true) }
  function openEdit(m) { setEditing(m.id); setForm({ name: m.name, birth_year: m.birth_year || '', death_year: m.death_year || '', relationship: m.relationship, generation: m.generation, side: m.side || '', notes: m.notes || '' }); setShowModal(true) }
  function closeModal() { setShowModal(false); setEditing(null) }

  async function handleSave() {
    if (!form.name.trim()) return
    if (editing) {
      await onUpdateMember(editing, form)
    } else {
      await onAddMember(form)
    }
    closeModal()
  }

  const usedGenerations = GENERATIONS.filter(g => members.some(m => m.generation === g.value))
  const displayGenerations = usedGenerations.length ? usedGenerations : []

  return (
    <div className="ft-panel">
      <div className="ft-header">
        <div>
          <h2 className="ft-title">🌳 Family Tree</h2>
          <p className="ft-subtitle">Samples-Detar Family</p>
        </div>
        <button className="ft-add-btn" onClick={openAdd}>+ Add Member</button>
      </div>

      <div className="ft-body">
        {members.length === 0 ? (
          <div className="ft-empty">
            <div className="ft-empty-icon">🌳</div>
            <div>No family members yet.</div>
            <div style={{ marginTop: 6, fontSize: 12 }}>Click "Add Member" to start building your family tree.</div>
          </div>
        ) : (
          displayGenerations.map(gen => {
            const genMembers = members.filter(m => m.generation === gen.value)
            if (!genMembers.length) return null
            return (
              <div key={gen.value} className="ft-generation">
                <div className="ft-gen-label">{gen.label}</div>
                <div className="ft-cards-row">
                  {genMembers.map(m => (
                    <MemberCard key={m.id} member={m} onEdit={openEdit} onDelete={onDeleteMember} />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {showModal && (
        <div className="ft-modal-overlay" onClick={closeModal}>
          <div className="ft-modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Member' : 'Add Family Member'}</h3>

            <div className="ft-form-row">
              <label>Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Jennifer Detar" autoFocus />
            </div>

            <div className="ft-form-row">
              <label>Relationship</label>
              <select value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}>
                {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="ft-form-row">
              <label>Generation</label>
              <select value={form.generation} onChange={e => setForm(f => ({ ...f, generation: Number(e.target.value) }))}>
                {GENERATIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>

            <div className="ft-form-row">
              <label>Side / Branch</label>
              <input value={form.side} onChange={e => setForm(f => ({ ...f, side: e.target.value }))} placeholder="e.g. paternal, maternal, spouse's side…" />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div className="ft-form-row" style={{ flex: 1 }}>
                <label>Birth Year</label>
                <input value={form.birth_year} onChange={e => setForm(f => ({ ...f, birth_year: e.target.value }))} placeholder="e.g. 1977" />
              </div>
              <div className="ft-form-row" style={{ flex: 1 }}>
                <label>Death Year</label>
                <input value={form.death_year} onChange={e => setForm(f => ({ ...f, death_year: e.target.value }))} placeholder="Leave blank if living" />
              </div>
            </div>

            <div className="ft-form-row">
              <label>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details…" />
            </div>

            <div className="ft-modal-footer">
              <button className="ft-modal-cancel" onClick={closeModal}>Cancel</button>
              <button className="ft-modal-save" onClick={handleSave}>{editing ? 'Save' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MemberCard({ member: m, onEdit, onDelete }) {
  const isSelf = m.relationship === 'self'
  const yearsLabel = m.birth_year
    ? `${m.birth_year}–${m.death_year || 'Living'}`
    : m.death_year ? `?–${m.death_year}` : null

  return (
    <div className={`ft-card${isSelf ? ' ft-self' : ''}`}>
      <div className="ft-card-actions">
        <button className="ft-card-btn" onClick={() => onEdit(m)} title="Edit">✏️</button>
        <button className="ft-card-btn delete" onClick={() => onDelete(m.id)} title="Delete">✕</button>
      </div>
      <div className="ft-card-name">{m.name}</div>
      {yearsLabel && <div className="ft-card-years">{yearsLabel}</div>}
      <div className="ft-card-rel">{m.relationship}</div>
      {m.side && <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>{m.side}</div>}
      {m.notes && <div className="ft-card-notes">{m.notes}</div>}
    </div>
  )
}
