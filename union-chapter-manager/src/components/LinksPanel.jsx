import { useState } from 'react'

const BLANK = { title: '', url: '' }

export default function LinksPanel({ links }) {
  const { links: list, addLink, deleteLink } = links
  const [form, setForm] = useState(BLANK)

  async function submit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.url.trim()) return
    let url = form.url.trim()
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`
    await addLink({ title: form.title.trim(), url })
    setForm(BLANK)
  }

  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Links</h2>
          <p className="panel-sub">Contract PDF, benefits portal, state site, forms</p>
        </div>
      </div>

      <form className="inline-form" onSubmit={submit}>
        <div>
          <label>Title</label>
          <input className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label>URL</label>
          <input className="field" placeholder="https://…" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
        </div>
        <div className="full">
          <button className="btn" type="submit">+ Add link</button>
        </div>
      </form>

      {list.length === 0 ? (
        <div className="empty">No links yet.</div>
      ) : (
        list.map((l) => (
          <div className="card" key={l.id}>
            <div className="card-row">
              <a href={l.url} target="_blank" rel="noreferrer"><strong>{l.title}</strong></a>
              <button className="btn-ghost" title="Delete" onClick={() => deleteLink(l.id)}>✕</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
