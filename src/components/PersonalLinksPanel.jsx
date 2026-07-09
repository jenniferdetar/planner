import { useState } from 'react'
import { useQuickLinks } from '../hooks/useQuickLinks'
import { fetchPageTitle } from '../lib/fetchPageTitle'
import './PersonalLinksPanel.css'

export default function PersonalLinksPanel({ userId }) {
  const { links, addLink, deleteLink } = useQuickLinks(userId, 'personal')
  const [newUrl, setNewUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    const trimmed = newUrl.trim()
    if (!trimmed || adding) return
    setAdding(true)
    setError('')
    try {
      const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
      const title = await fetchPageTitle(url)
      await addLink(title, url)
      setNewUrl('')
    } catch (err) {
      setError(err.message || 'Could not add that link.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="links-panel">
      <div className="links-header">
        <div>
          <h2 className="links-title">Personal Links</h2>
          <p className="links-subtitle">Paste a link — the title is pulled in automatically</p>
        </div>
      </div>

      <div className="links-body">
        <form className="add-link-form" onSubmit={handleAdd}>
          <input
            type="text"
            className="add-link-input"
            placeholder="Paste a link…"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
          />
          <button type="submit" className="add-link-btn" disabled={adding}>
            {adding ? 'Adding…' : '+ Add link'}
          </button>
        </form>
        {error && <p className="add-link-error">{error}</p>}

        <div className="csea-issue-list csea-interactions-grid">
          {links.length === 0 && <p className="csea-empty">No links yet. Paste a link above to add one.</p>}
          {links.map(link => (
            <div key={link.id} className="interaction-group">
              <div className="interaction-group-header">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="interaction-group-name quick-link-anchor">
                  {link.title}
                </a>
                {link.created_at && (
                  <span className="interaction-date-badge">
                    {new Date(link.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                )}
                <button
                  className="interaction-delete-btn"
                  onClick={() => deleteLink(link.id)}
                  title="Remove link"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
