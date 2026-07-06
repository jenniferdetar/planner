import { useState } from 'react'
import './FamilyTree.css'

const GENERATIONS = [
  { label: 'Great-Grandparents', value: -3 },
  { label: 'Grandparents', value: -2 },
  { label: 'Parents & Aunts/Uncles', value: -1 },
  { label: 'My Generation', value: 0 },
  { label: 'Children & Nieces/Nephews', value: 1 },
  { label: 'Grandchildren', value: 2 },
]

const RELATIONSHIPS = [
  'self', 'spouse', 'parent', 'step-parent', 'grandmother', 'grandfather', 'great-grandparent',
  'brother', 'sister', 'half-sibling', 'step-sibling', 'brother-in-law', 'sister-in-law',
  'aunt', 'uncle', 'niece', 'nephew', 'cousin', 'child', 'step-child', 'grandchild', 'other',
]

// Samples-Detar Family Tree seed data from Ancestry.com
const SAMPLES_DETAR_DEFAULTS = [
  // ── Grandparents (generation -2) ──
  { name: 'Paul Victor Samples Sr', birth_year: '1932', death_year: '2025', relationship: 'grandfather', generation: -2, side: 'Paternal (Samples)', sort_order: 1 },
  { name: 'Mary Emma Frazier', birth_year: '1943', death_year: '2020', relationship: 'grandmother', generation: -2, side: 'Paternal (Samples)', sort_order: 2 },
  { name: 'James Milo Gramenz', birth_year: '1923', death_year: '2009', relationship: 'grandfather', generation: -2, side: 'Maternal (Gramenz)', sort_order: 3 },
  { name: 'Lois Marie Ebeling', birth_year: '1925', death_year: '2024', relationship: 'grandmother', generation: -2, side: 'Maternal (Gramenz)', sort_order: 4 },
  { name: 'Wilber A Hewitt II', birth_year: '1924', death_year: '1996', relationship: 'grandfather', generation: -2, side: 'Maternal (Gramenz)', sort_order: 5 },

  // ── Parents' generation (generation -1) ──
  { name: 'Terry Allen Samples', birth_year: '1954', death_year: '', relationship: 'parent', generation: -1, side: 'Paternal (Samples)', sort_order: 1 },
  { name: 'Gayle Marie Gramenz', birth_year: '1955', death_year: '', relationship: 'parent', generation: -1, side: 'Maternal (Gramenz)', sort_order: 2 },
  { name: 'Paul Victor Samples Jr', birth_year: '1953', death_year: '', relationship: 'uncle', generation: -1, side: 'Paternal (Samples)', sort_order: 3 },
  { name: 'Lynda Ann Carpenter', birth_year: '1953', death_year: '', relationship: 'aunt', generation: -1, side: 'Paternal (Samples)', sort_order: 4 },
  { name: 'James M Samples', birth_year: '1965', death_year: '', relationship: 'uncle', generation: -1, side: 'Paternal (Samples)', sort_order: 5 },
  { name: 'Rosa Maria Gonzalez', birth_year: '1965', death_year: '', relationship: 'aunt', generation: -1, side: 'Paternal (Samples)', sort_order: 6 },
  { name: 'John T Kersey', birth_year: '1945', death_year: '2020', relationship: 'uncle', generation: -1, side: 'Maternal (Gramenz)', sort_order: 7 },
  { name: 'Merriellan E Gramenz', birth_year: '1943', death_year: '2016', relationship: 'aunt', generation: -1, side: 'Maternal (Gramenz)', sort_order: 8 },
  { name: 'Dennison L Strong', birth_year: '1947', death_year: '', relationship: 'uncle', generation: -1, side: 'Maternal (Gramenz)', sort_order: 9 },
  { name: 'Dianne E Gramenz', birth_year: '1945', death_year: '', relationship: 'aunt', generation: -1, side: 'Maternal (Gramenz)', sort_order: 10 },
  { name: 'Norman K Todd', birth_year: '1942', death_year: '', relationship: 'uncle', generation: -1, side: 'Maternal (Gramenz)', sort_order: 11 },
  { name: 'Maureen A Gallagher', birth_year: '1955', death_year: '2022', relationship: 'aunt', generation: -1, side: 'Maternal (Gramenz)', sort_order: 12 },
  { name: 'Gary James Gramenz', birth_year: '1961', death_year: '', relationship: 'uncle', generation: -1, side: 'Maternal (Gramenz)', sort_order: 13 },
  { name: 'Patrice M Grimm', birth_year: '1954', death_year: '', relationship: 'aunt', generation: -1, side: 'Maternal (Gramenz)', sort_order: 14 },
  { name: 'Christopher Giampletro', birth_year: '1958', death_year: '', relationship: 'uncle', generation: -1, side: 'Maternal (Gramenz)', sort_order: 15 },
  { name: 'Christine T Gramenz', birth_year: '1962', death_year: '', relationship: 'aunt', generation: -1, side: 'Maternal (Gramenz)', sort_order: 16 },
  { name: 'Christopher Nelson', birth_year: '1971', death_year: '', relationship: 'uncle', generation: -1, side: 'Maternal (Gramenz)', sort_order: 17 },

  // ── My generation (generation 0) ──
  { name: 'Jennifer M Samples Detar', birth_year: '1977', death_year: '', relationship: 'self', generation: 0, side: '', sort_order: 1 },
  { name: 'Jeffery W Detar', birth_year: '1974', death_year: '', relationship: 'spouse', generation: 0, side: '', sort_order: 2 },
  { name: 'Christopher Plant', birth_year: '1979', death_year: '', relationship: 'brother', generation: 0, side: '', sort_order: 3 },
  { name: 'Jana Lynn Samples', birth_year: '1979', death_year: '', relationship: 'sister', generation: 0, side: '', sort_order: 4 },
  { name: 'Chris S Sikorowski', birth_year: '1976', death_year: '', relationship: 'brother', generation: 0, side: '', sort_order: 5 },
  { name: 'Allison Ann Samples', birth_year: '1981', death_year: '', relationship: 'sister', generation: 0, side: '', sort_order: 6 },

  // ── Nieces & Nephews (generation 1) ──
  { name: 'Jacee Lynn Plant', birth_year: '2008', death_year: '', relationship: 'niece', generation: 1, side: "Christopher Plant's", sort_order: 1, likes: 'Old vinyl records, musicals, the beach, seashells, jewelry, make up, hair products, clothes, Dutch Bros, Starbucks' },
  { name: 'Jaelyn Rae Plant', birth_year: '2009', death_year: '', relationship: 'niece', generation: 1, side: "Christopher Plant's", sort_order: 2, likes: 'Playing the guitar, jewelry, makeup products, clothes, Needo squish balls, Dutch Bros, Starbucks, the beach' },
  { name: 'Joie A M Plant', birth_year: '2016', death_year: '', relationship: 'niece', generation: 1, side: "Christopher Plant's", sort_order: 3, likes: 'Stitch (from Lilo and Stitch), make up beauty products, clothes, Needo squish balls' },
  { name: 'Elias Sikorowski', birth_year: '2013', death_year: '', relationship: 'nephew', generation: 1, side: "Chris Sikorowski's", sort_order: 4 },
  { name: 'Brasen J Sikorowski', birth_year: '2016', death_year: '', relationship: 'nephew', generation: 1, side: "Chris Sikorowski's", sort_order: 5 },
  { name: 'Jacob Sikorowski', birth_year: '2018', death_year: '', relationship: 'nephew', generation: 1, side: "Chris Sikorowski's", sort_order: 6 },

  // ── Jeff's grandparents (generation -2) ──
  { name: 'Wayne Allen Detar', birth_year: '1926', death_year: '2015', relationship: 'grandfather', generation: -2, side: "Paternal (Jeff's - Detar)", sort_order: 6 },
  { name: 'Janet Lee Pine', birth_year: '1933', death_year: '1999', relationship: 'grandmother', generation: -2, side: "Paternal (Jeff's - Detar)", sort_order: 7 },
  { name: 'Clarence A Borders', birth_year: '1927', death_year: '2004', relationship: 'grandfather', generation: -2, side: "Maternal (Jeff's - Borders)", sort_order: 8 },
  { name: 'Dorothy B Kiepien', birth_year: '1929', death_year: '2006', relationship: 'grandmother', generation: -2, side: "Maternal (Jeff's - Borders)", sort_order: 9 },

  // ── Jeff's parents (generation -1) ──
  { name: 'Thomas Lee DeTar', birth_year: '1953', death_year: '', relationship: 'parent', generation: -1, side: "Paternal (Jeff's - Detar)", sort_order: 18 },
  { name: 'Susan F Borders', birth_year: '1954', death_year: '', relationship: 'parent', generation: -1, side: "Maternal (Jeff's - Borders)", sort_order: 19 },

  // ── Jeff's siblings (generation 0) ──
  { name: 'Nicole Lederman', birth_year: '1986', death_year: '', relationship: 'half-sibling', generation: 0, side: "Jeff's", sort_order: 7 },
  { name: 'Jeremy Lee DeTar', birth_year: '1977', death_year: '', relationship: 'brother', generation: 0, side: "Jeff's", sort_order: 8 },
  { name: 'Tamara Petty', birth_year: '', death_year: '', relationship: 'sister-in-law', generation: 0, side: "Jeff's", sort_order: 9 },
  { name: 'Brienne D Detar', birth_year: '1979', death_year: '', relationship: 'sister', generation: 0, side: "Jeff's", sort_order: 10 },

  // ── Jeff's nieces/nephews (generation 1) ──
  { name: 'Ethan DeTar', birth_year: '', death_year: '', relationship: 'nephew', generation: 1, side: "Jeremy Lee DeTar's", sort_order: 7 },
  { name: 'Lincoln DeTar', birth_year: '', death_year: '', relationship: 'nephew', generation: 1, side: "Jeremy Lee DeTar's", sort_order: 8 },
  { name: 'Harrison DeTar', birth_year: '2009', death_year: '', relationship: 'nephew', generation: 1, side: "Jeremy Lee DeTar's", sort_order: 9 },
]

const BLANK = { name: '', birth_year: '', death_year: '', relationship: 'brother', generation: 0, side: '', notes: '', likes: '', dislikes: '' }

export default function FamilyTreePanel({ members = [], onAddMember, onUpdateMember, onDeleteMember, onImportDefaults }) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [importing, setImporting] = useState(false)

  function openAdd() { setEditing(null); setForm(BLANK); setShowModal(true) }
  function openEdit(m) {
    setEditing(m.id)
    setForm({ name: m.name, birth_year: m.birth_year || '', death_year: m.death_year || '', relationship: m.relationship, generation: m.generation, side: m.side || '', notes: m.notes || '', likes: m.likes || '', dislikes: m.dislikes || '' })
    setShowModal(true)
  }
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

  async function handleImport() {
    setImporting(true)
    await onImportDefaults(SAMPLES_DETAR_DEFAULTS, members)
    setImporting(false)
  }

  const usedGenerations = GENERATIONS.filter(g => members.some(m => m.generation === g.value))

  return (
    <div className="ft-panel">
      <div className="ft-header">
        <div>
          <h2 className="ft-title">🌳 Family Tree</h2>
          <p className="ft-subtitle">Samples-Detar Family</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ft-add-btn ft-import-btn" onClick={handleImport} disabled={importing}>
            {importing ? 'Importing…' : members.length === 0 ? '⬇ Import from Ancestry' : '⬇ Import Missing Family'}
          </button>
          <button className="ft-add-btn" onClick={openAdd}>+ Add Member</button>
        </div>
      </div>

      <div className="ft-body">
        {members.length === 0 ? (
          <div className="ft-empty">
            <div className="ft-empty-icon">🌳</div>
            <div>No family members yet.</div>
            <div style={{ marginTop: 6, fontSize: 12 }}>Click "Import from Ancestry" to load the Samples-Detar tree, or add members manually.</div>
          </div>
        ) : (
          usedGenerations.map(gen => {
            const genMembers = members
              .filter(m => m.generation === gen.value)
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
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
              <input value={form.side} onChange={e => setForm(f => ({ ...f, side: e.target.value }))} placeholder="e.g. Paternal (Samples), Maternal (Gramenz)…" />
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
              <label>❤️ Likes</label>
              <textarea value={form.likes} onChange={e => setForm(f => ({ ...f, likes: e.target.value }))} placeholder="Things they love, hobbies, favorites…" />
            </div>

            <div className="ft-form-row">
              <label>👎 Dislikes</label>
              <textarea value={form.dislikes} onChange={e => setForm(f => ({ ...f, dislikes: e.target.value }))} placeholder="Things they don't like…" />
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

function relClass(rel) {
  if (rel === 'self') return 'ft-self'
  if (rel === 'spouse') return 'ft-spouse'
  if (['parent', 'step-parent'].includes(rel)) return 'ft-rel-parent'
  if (['grandmother', 'grandfather', 'grandparent'].includes(rel)) return 'ft-rel-grandparent'
  if (rel === 'great-grandparent') return 'ft-rel-great-gp'
  if (['brother', 'sister', 'half-sibling', 'step-sibling'].includes(rel)) return 'ft-rel-sibling'
  if (['brother-in-law', 'sister-in-law'].includes(rel)) return 'ft-rel-in-law'
  if (['aunt', 'uncle'].includes(rel)) return 'ft-rel-aunt-uncle'
  if (['niece', 'nephew', 'niece/nephew'].includes(rel)) return 'ft-rel-niece-neph'
  if (['child', 'step-child'].includes(rel)) return 'ft-rel-child'
  if (rel === 'grandchild') return 'ft-rel-grandchild'
  return ''
}

function MemberCard({ member: m, onEdit, onDelete }) {
  const yearsLabel = m.birth_year
    ? `${m.birth_year}–${m.death_year || 'Living'}`
    : m.death_year ? `?–${m.death_year}` : null

  return (
    <div className={`ft-card ${relClass(m.relationship)}`}>
      <div className="ft-card-actions">
        <button className="ft-card-btn" onClick={() => onEdit(m)} title="Edit">✏️</button>
        <button className="ft-card-btn delete" onClick={() => onDelete(m.id)} title="Delete">✕</button>
      </div>
      <div className="ft-card-name">{m.name}</div>
      {yearsLabel && <div className="ft-card-years">{yearsLabel}</div>}
      <div className="ft-card-rel">{m.relationship}</div>
      {m.side && <div style={{ fontSize: 10, color: '#aaa', marginBottom: 4 }}>{m.side}</div>}
      {(m.likes || m.dislikes) && (
        <div className="ft-card-ld">
          {m.likes && (
            <div className="ft-card-ld-row ft-likes">
              <span className="ft-ld-icon">❤️</span>
              <span>{m.likes}</span>
            </div>
          )}
          {m.dislikes && (
            <div className="ft-card-ld-row ft-dislikes">
              <span className="ft-ld-icon">👎</span>
              <span>{m.dislikes}</span>
            </div>
          )}
        </div>
      )}
      {m.notes && <div className="ft-card-notes">{m.notes}</div>}
    </div>
  )
}
