import { useState, useMemo } from 'react'
import { MEMBER_ROLES } from '../lib/roles'

const BLANK = { first_name: '', last_name: '', employee_number: '', email: '', phone: '', member_role: 'member', worksite_id: '' }

export default function MembersPanel({ members, worksites }) {
  const { members: list, addMember, updateMember, deleteMember } = members
  const [form, setForm] = useState(BLANK)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const worksiteName = useMemo(() => {
    const map = {}
    for (const w of worksites) map[w.id] = w.name
    return map
  }, [worksites])

  const filtered = list.filter((m) => {
    if (roleFilter !== 'all' && m.member_role !== roleFilter) return false
    if (!search) return true
    const s = search.toLowerCase()
    return (
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(s) ||
      (m.employee_number || '').toLowerCase().includes(s)
    )
  })

  async function submit(e) {
    e.preventDefault()
    if (!form.first_name || !form.last_name) return
    await addMember({ ...form, worksite_id: form.worksite_id || null })
    setForm(BLANK)
    setShowForm(false)
  }

  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Members</h2>
          <p className="panel-sub">{list.length} on the roster</p>
        </div>
        <button className="btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add member'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={submit}>
          <div>
            <label>First name</label>
            <input className="field" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          </div>
          <div>
            <label>Last name</label>
            <input className="field" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
          </div>
          <div>
            <label>Employee #</label>
            <input className="field" value={form.employee_number} onChange={(e) => setForm({ ...form, employee_number: e.target.value })} />
          </div>
          <div>
            <label>Role</label>
            <select className="field" value={form.member_role} onChange={(e) => setForm({ ...form, member_role: e.target.value })}>
              {MEMBER_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label>Worksite</label>
            <select className="field" value={form.worksite_id} onChange={(e) => setForm({ ...form, worksite_id: e.target.value })}>
              <option value="">—</option>
              {worksites.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label>Email</label>
            <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label>Phone</label>
            <input className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="full">
            <button className="btn" type="submit">Save member</button>
          </div>
        </form>
      )}

      <input
        className="field"
        style={{ marginBottom: '0.8rem' }}
        placeholder="Search by name or employee #…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filter-row">
        <button className={`pill ${roleFilter === 'all' ? 'active' : ''}`} onClick={() => setRoleFilter('all')}>All</button>
        {MEMBER_ROLES.map((r) => (
          <button key={r.value} className={`pill ${roleFilter === r.value ? 'active' : ''}`} onClick={() => setRoleFilter(r.value)}>
            {r.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No members yet. Add your first member above.</div>
      ) : (
        filtered.map((m) => (
          <div className="card" key={m.id}>
            <div className="card-row">
              <div className="stack">
                <strong>{m.first_name} {m.last_name}</strong>
                <span className="meta">
                  {m.employee_number && <>#{m.employee_number} · </>}
                  {m.worksite_id && worksiteName[m.worksite_id] ? <>{worksiteName[m.worksite_id]} · </> : null}
                  {m.email || m.phone || 'No contact info'}
                </span>
              </div>
              <div className="row-gap">
                <select
                  className="field btn-sm"
                  style={{ width: 'auto' }}
                  value={m.member_role}
                  onChange={(e) => updateMember(m.id, { member_role: e.target.value })}
                >
                  {MEMBER_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <button className="btn-ghost" title="Remove" onClick={() => deleteMember(m.id)}>✕</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
