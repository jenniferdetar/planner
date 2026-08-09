import { useState } from 'react'

const BLANK = { topic: '', source: '', body: '' }

export default function NotesPanel({ notes }) {
  const { notes: list, addNote, deleteNote } = notes
  const [form, setForm] = useState(BLANK)

  async function submit(e) {
    e.preventDefault()
    if (!form.body.trim()) return
    await addNote(form)
    setForm(BLANK)
  }

  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Notes &amp; Topics</h2>
          <p className="panel-sub">Meeting takeaways, contract questions, reminders</p>
        </div>
      </div>

      <form className="inline-form" onSubmit={submit}>
        <div>
          <label>Topic</label>
          <input className="field" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        </div>
        <div>
          <label>Source</label>
          <input className="field" placeholder="e.g. Exec meeting" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
        </div>
        <div className="full">
          <label>Note</label>
          <textarea className="field" rows={2} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
        </div>
        <div className="full">
          <button className="btn" type="submit">+ Add note</button>
        </div>
      </form>

      {list.length === 0 ? (
        <div className="empty">No notes yet.</div>
      ) : (
        list.map((n) => (
          <div className="card" key={n.id}>
            <div className="card-row">
              <div className="stack">
                {n.topic && <strong>{n.topic}</strong>}
                <span>{n.body}</span>
                {n.source && <span className="meta">— {n.source}</span>}
              </div>
              <button className="btn-ghost" title="Delete" onClick={() => deleteNote(n.id)}>✕</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
