import { useState } from 'react'
import { useFavoriteVideos } from '../hooks/useFavoriteVideos'
import { useFavoriteTVShows } from '../hooks/useFavoriteTVShows'
import './FavoriteVideosPanel.css'

export default function FavoriteVideosPanel({ userId }) {
  const { videos: unsortedVideos, addVideo, deleteVideo } = useFavoriteVideos(userId)
  const { shows, addShow, deleteShow } = useFavoriteTVShows(userId)
  const videos = [...unsortedVideos].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  )
  const sortedShows = [...shows].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  )
  const [newUrl, setNewUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [hoveredId, setHoveredId] = useState(null)
  const [newShow, setNewShow] = useState('')
  const [addingShow, setAddingShow] = useState(false)
  const [showError, setShowError] = useState('')

  async function handleAddVideo(e) {
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

  async function handleAddShow(e) {
    e.preventDefault()
    if (!newShow.trim() || addingShow) return
    setAddingShow(true)
    setShowError('')
    try {
      await addShow(newShow.trim())
      setNewShow('')
    } catch (err) {
      setShowError(err.message || 'Could not add that show.')
    } finally {
      setAddingShow(false)
    }
  }

  return (
    <div className="videos-panel">
      <div className="videos-header">
        <div>
          <h2 className="videos-title">Videos & TV</h2>
        </div>
      </div>

      <div className="videos-body">
        <div className="videos-section">
          <h3 className="videos-section-header">Favorite Videos</h3>
          <p className="videos-subtitle-inline">Paste a YouTube link — the title is pulled in automatically</p>
          <form className="add-video-form" onSubmit={handleAddVideo}>
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

        <div className="videos-section">
          <h3 className="videos-section-header">Favorite TV Shows</h3>
          <form className="add-video-form" onSubmit={handleAddShow}>
            <input
              type="text"
              className="add-video-input"
              placeholder="Enter a TV show name…"
              value={newShow}
              onChange={e => setNewShow(e.target.value)}
            />
            <button type="submit" className="add-video-btn" disabled={addingShow}>
              {addingShow ? 'Adding…' : '+ Add show'}
            </button>
          </form>
          {showError && <p className="add-video-error">{showError}</p>}

          {sortedShows.length === 0 ? (
            <div className="videos-empty">
              <p>No favorite TV shows yet. Add one above.</p>
            </div>
          ) : (
            <ul className="tv-show-list">
              {sortedShows.map(show => (
                <li key={show.id} className="tv-show-item">
                  <span className="tv-show-name">{show.name}</span>
                  <button
                    className="delete-show-btn"
                    onClick={() => deleteShow(show.id)}
                    title="Remove show"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
