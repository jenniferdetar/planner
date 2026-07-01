const TMDB_API = 'https://api.themoviedb.org/3'
const TMDB_IMG = 'https://image.tmdb.org/t/p/w342'

// Looks up a TV show by name via TMDb and returns display metadata,
// including the IMDb ID TMDb cross-references. Returns null if no
// API key is configured or no match is found.
export async function lookupTVShow(name) {
  const key = import.meta.env.VITE_TMDB_API_KEY
  if (!key) return null

  const searchRes = await fetch(
    `${TMDB_API}/search/tv?api_key=${key}&query=${encodeURIComponent(name)}`
  )
  if (!searchRes.ok) return null
  const searchData = await searchRes.json()
  const match = searchData.results?.[0]
  if (!match) return null

  const detailRes = await fetch(
    `${TMDB_API}/tv/${match.id}?api_key=${key}&append_to_response=external_ids`
  )
  const detail = detailRes.ok ? await detailRes.json() : {}

  return {
    name: match.name || name,
    poster_url: match.poster_path ? `${TMDB_IMG}${match.poster_path}` : null,
    overview: match.overview || null,
    first_air_date: match.first_air_date || null,
    rating: match.vote_average ?? null,
    tmdb_id: match.id,
    imdb_id: detail.external_ids?.imdb_id || null,
  }
}
