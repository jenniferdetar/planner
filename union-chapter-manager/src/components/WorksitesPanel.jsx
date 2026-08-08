import { useState } from 'react'

export default function WorksitesPanel({ worksites, memberList }) {
  const { worksites: list, addWorksite, deleteWorksite } = worksites
  const [name, setName] = useState('')

  const countByWorksite = {}
  for (const m of memberList) {
    if (m.worksite_id) countByWorksite[m.worksite_id] = (countByWorksite[m.worksite_id] || 0) + 1
  }

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    await addWorksite(name.trim())
    setName('')
  }

  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Worksites</h2>
          <p className="panel-sub">Buildings and sites your chapter represents</p>
        </div>
      </div>

      <form className="inline-form" onSubmit={submit}>
        <div className="full">
          <label>Worksite name</label>
          <input className="field" placeholder="e.g. Lincoln Elementary" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="full">
          <button className="btn" type="submit">+ Add worksite</button>
        </div>
      </form>

      {list.length === 0 ? (
        <div className="empty">No worksites yet.</div>
      ) : (
        list.map((w) => (
          <div className="card" key={w.id}>
            <div className="card-row">
              <div className="stack">
                <strong>{w.name}</strong>
                <span className="meta">{countByWorksite[w.id] || 0} member(s) assigned</span>
              </div>
              <button className="btn-ghost" title="Remove" onClick={() => deleteWorksite(w.id)}>✕</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
