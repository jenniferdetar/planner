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

        {links.length === 0 ? (
          <div className="links-empty">
            <p>No links yet. Paste a link above to add one.</p>
          </div>
        ) : (
          <ul className="link-list">
            {links.map(link => (
              <li key={link.id} className="link-card">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-card-title">
                  {link.title}
                </a>
                <button
                  className="delete-link-btn"
                  onClick={() => deleteLink(link.id)}
                  title="Remove link"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
