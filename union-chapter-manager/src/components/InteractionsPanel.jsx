import { useState } from 'react'

const BLANK = { member_name: '', topic: '', notes: '', date_spoke: new Date().toISOString().split('T')[0] }

export default function InteractionsPanel({ interactions, memberList }) {
  const { interactions: list, showArchived, setShowArchived, addInteraction, updateInteraction, deleteInteraction } = interactions
  const [form, setForm] = useState(BLANK)
  const [showForm, setShowForm] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!form.member_name.trim()) return
    await addInteraction(form)
    setForm(BLANK)
    setShowForm(false)
  }

  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Interactions</h2>
          <p className="panel-sub">Log of member contacts and conversations</p>
        </div>
        <div className="row-gap">
          <button className={`pill ${showArchived ? 'active' : ''}`} onClick={() => setShowArchived((v) => !v)}>
            {showArchived ? 'Hiding archived' : 'Show archived'}
          </button>
          <button className="btn" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : '+ Log contact'}</button>
        </div>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={submit}>
          <div>
            <label>Member</label>
            <input
              className="field"
              list="member-names"
              value={form.member_name}
              onChange={(e) => setForm({ ...form, member_name: e.target.value })}
              required
            />
            <datalist id="member-names">
              {memberList.map((m) => <option key={m.id} value={`${m.first_name} ${m.last_name}`} />)}
            </datalist>
          </div>
          <div>
            <label>Date</label>
            <input className="field" type="date" value={form.date_spoke} onChange={(e) => setForm({ ...form, date_spoke: e.target.value })} />
          </div>
          <div>
            <label>Topic</label>
            <input className="field" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          </div>
          <div className="full">
            <label>Notes</label>
            <textarea className="field" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="full">
            <button className="btn" type="submit">Save</button>
          </div>
        </form>
      )}

      {list.length === 0 ? (
        <div className="empty">No interactions logged yet.</div>
      ) : (
        list.map((i) => (
          <div className="card" key={i.id} style={i.archived ? { opacity: 0.6 } : undefined}>
            <div className="card-row">
              <div className="stack">
                <strong>{i.member_name}</strong>
                {i.topic && <span className="tag tag-role">{i.topic}</span>}
                {i.notes && <span className="meta">{i.notes}</span>}
              </div>
              <div className="stack" style={{ alignItems: 'flex-end' }}>
                <span className="timeline-date">{i.date_spoke}</span>
                <div className="row-gap">
                  {!i.archived && (
                    <button className="btn-ghost" title="Archive" onClick={() => updateInteraction(i.id, { archived: true })}>Archive</button>
                  )}
                  <button className="btn-ghost" title="Delete" onClick={() => deleteInteraction(i.id)}>✕</button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
