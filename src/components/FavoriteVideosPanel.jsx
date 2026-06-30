import { useState } from 'react'
import { useFavoriteVideos } from '../hooks/useFavoriteVideos'
import './FavoriteVideosPanel.css'

export default function FavoriteVideosPanel({ userId }) {
  const { videos, addVideo, deleteVideo } = useFavoriteVideos(userId)
  const [newUrl, setNewUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [hoveredId, setHoveredId] = useState(null)

  async function handleAdd(e) {
    e.preventDefault()
    if (!newUrl.trim() || adding) return
    setAdding(true)
    setError('')
    try {
      await addVideo(newUrl.trim())
      setNewUrl('')
    } catch (err) {
      setError(err.message || 'Could not add that video.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="videos-panel">
      <div className="videos-header">
        <div>
          <h2 className="videos-title">Favorite Videos</h2>
          <p className="videos-subtitle">Paste a YouTube link — the title is pulled in automatically</p>
        </div>
      </div>

      <div className="videos-body">
        <form className="add-video-form" onSubmit={handleAdd}>
          <input
            type="url"
            className="add-video-input"
            placeholder="Paste a YouTube link…"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
          />
          <button type="submit" className="add-video-btn" disabled={adding}>
            {adding ? 'Adding…' : '+ Add video'}
          </button>
        </form>
        {error && <p className="add-video-error">{error}</p>}

        {videos.length === 0 ? (
          <div className="videos-empty">
            <p>No favorite videos yet. Paste a link above to add one.</p>
          </div>
        ) : (
          <div className="video-grid">
            {videos.map(video => (
              <div
                key={video.id}
                className="video-card"
                onMouseEnter={() => setHoveredId(video.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="video-thumb-link">
                  {video.thumbnail_url ? (
                    <img className="video-thumb" src={video.thumbnail_url} alt={video.title} loading="lazy" />
                  ) : (
                    <div className="video-thumb video-thumb-placeholder">▶</div>
                  )}
                </a>
                <div className="video-card-body">
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="video-title">
                    {video.title}
                  </a>
                  {video.channel && <span className="video-channel">{video.channel}</span>}
                </div>
                {hoveredId === video.id && (
                  <button
                    className="delete-video-btn"
                    onClick={() => deleteVideo(video.id)}
                    title="Remove video"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
