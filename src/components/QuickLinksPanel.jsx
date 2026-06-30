import { useState } from 'react'
import { useQuickLinks } from '../hooks/useQuickLinks'
import { fetchPageTitle } from '../utils/fetchPageTitle'
import './QuickLinksPanel.css'

export default function QuickLinksPanel({ userId, section, color = '#73a882' }) {
  const { links, addLink, deleteLink } = useQuickLinks(userId, section)
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitleLoading, setLinkTitleLoading] = useState(false)

  return (
    <div className="quick-links-panel" style={{ '--qlp-color': color }}>
      <form
        className="quick-links-form"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!linkTitle.trim() || !linkUrl.trim()) return
          const url = linkUrl.trim().startsWith('http') ? linkUrl.trim() : 'https://' + linkUrl.trim()
          await addLink(linkTitle.trim(), url)
          setLinkTitle('')
          setLinkUrl('')
        }}
      >
        <input
          className="quick-links-input"
          placeholder={linkTitleLoading ? 'Label * (looking up...)' : 'Label *'}
          value={linkTitle}
          onChange={e => setLinkTitle(e.target.value)}
        />
        <div className="quick-links-form-row">
          <input
            className="quick-links-input"
            placeholder="URL *"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onBlur={async () => {
              if (linkTitle.trim() || !linkUrl.trim()) return
              const url = linkUrl.trim().startsWith('http') ? linkUrl.trim() : 'https://' + linkUrl.trim()
              setLinkTitleLoading(true)
              const title = await fetchPageTitle(url)
              setLinkTitleLoading(false)
              if (title) setLinkTitle(title)
            }}
          />
          <button type="submit" className="quick-links-save">Add</button>
        </div>
      </form>
      <div className="quick-links-list">
        {links.length === 0 && <p className="quick-links-empty">No links yet</p>}
        {links.map(l => (
          <div key={l.id} className="quick-links-row">
            <div className="quick-links-row-body">
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="quick-links-anchor">{l.title}</a>
              {l.created_at && (
                <span className="quick-links-row-date">
                  {new Date(l.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              )}
            </div>
            <button className="quick-links-delete" onClick={() => deleteLink(l.id)} aria-label="Delete link">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
