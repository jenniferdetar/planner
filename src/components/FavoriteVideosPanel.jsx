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
  const [hoveredShowId, setHoveredShowId] = useState(null)
  const [newShow, setNewShow] = useState('')
  const [addingShow, setAddingShow] = useState(false)
  const [showError, setShowError] = useState('')

  async function handleAddVideo(e) {
    e.preventDefault()
    if (!newUrl.trim() || adding) return
    setAdding(true)
    setError('')
    try {
      const trimmed = newUrl.trim()
      const url = trimmed.startsWith('http') ? trimmed : 'https://' + trimmed
      await addVideo(url)
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
          <p className="videos-subtitle-inline">Paste a YouTube or TikTok link — the title is pulled in automatically</p>
          <form className="add-video-form" onSubmit={handleAddVideo}>
            <input
              type="text"
              className="add-video-input"
              placeholder="Paste a YouTube or TikTok link…"
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
              <p>No favorite videos yet. Paste a YouTube or TikTok link above to add one.</p>
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
          <p className="videos-subtitle-inline">Enter a show name or paste an IMDb link — poster, details, and the IMDb link are pulled in automatically</p>
          <form className="add-video-form" onSubmit={handleAddShow}>
            <input
              type="text"
              className="add-video-input"
              placeholder="Show name or IMDb link (e.g. imdb.com/title/tt0944947)…"
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
            <div className="video-grid">
              {sortedShows.map(show => {
                const imdbUrl = show.imdb_id ? `https://www.imdb.com/title/${show.imdb_id}/` : null
                const year = show.first_air_date ? show.first_air_date.slice(0, 4) : ''
                return (
                  <div
                    key={show.id}
                    className="video-card"
                    onMouseEnter={() => setHoveredShowId(show.id)}
                    onMouseLeave={() => setHoveredShowId(null)}
                  >
                    {imdbUrl ? (
                      <a href={imdbUrl} target="_blank" rel="noopener noreferrer" className="video-thumb-link">
                        {show.poster_url ? (
                          <img className="video-thumb tv-poster-thumb" src={show.poster_url} alt={show.name} loading="lazy" />
                        ) : (
                          <div className="video-thumb tv-poster-thumb video-thumb-placeholder">📺</div>
                        )}
                      </a>
                    ) : show.poster_url ? (
                      <img className="video-thumb tv-poster-thumb" src={show.poster_url} alt={show.name} loading="lazy" />
                    ) : (
                      <div className="video-thumb tv-poster-thumb video-thumb-placeholder">📺</div>
                    )}
                    <div className="video-card-body">
                      {imdbUrl ? (
                        <a href={imdbUrl} target="_blank" rel="noopener noreferrer" className="video-title">{show.name}</a>
                      ) : (
                        <span className="video-title">{show.name}</span>
                      )}
                      {(year || show.rating) && (
                        <span className="video-channel">{year}{year && show.rating ? ' · ' : ''}{show.rating ? `★ ${Number(show.rating).toFixed(1)}` : ''}</span>
                      )}
                    </div>
                    {hoveredShowId === show.id && (
                      <button
                        className="delete-video-btn"
                        onClick={() => deleteShow(show.id)}
                        title="Remove show"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
