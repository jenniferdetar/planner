const TMDB_API = 'https://api.themoviedb.org/3'
const TMDB_IMG = 'https://image.tmdb.org/t/p/w342'

// Pulls an IMDb title id (e.g. "tt0944947") out of a pasted IMDb URL,
// or returns it as-is if the user typed the bare id.
export function extractImdbId(input) {
  const match = input.match(/tt\d{6,10}/)
  return match ? match[0] : null
}

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

// Looks up a show or movie by IMDb id via TMDb's /find endpoint, so a
// pasted IMDb link can be resolved directly instead of by fuzzy name
// search. Returns null if no API key is configured or no match is found.
export async function lookupByImdbId(imdbId) {
  const key = import.meta.env.VITE_TMDB_API_KEY
  if (!key) return null

  const res = await fetch(
    `${TMDB_API}/find/${imdbId}?api_key=${key}&external_source=imdb_id`
  )
  if (!res.ok) return null
  const data = await res.json()
  const match = data.tv_results?.[0] || data.movie_results?.[0]
  if (!match) return null

  return {
    name: match.name || match.title,
    poster_url: match.poster_path ? `${TMDB_IMG}${match.poster_path}` : null,
    overview: match.overview || null,
    first_air_date: match.first_air_date || match.release_date || null,
    rating: match.vote_average ?? null,
    tmdb_id: match.id,
    imdb_id: imdbId,
  }
}
