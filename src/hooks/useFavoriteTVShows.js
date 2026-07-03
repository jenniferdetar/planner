import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { lookupTVShow, lookupByImdbId, extractImdbId } from '../lib/tmdb'

export function useFavoriteTVShows(userId) {
  const [shows, setShows] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('favorite_tv_shows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setShows(data || []))
  }, [userId])

  const addShow = useCallback(async (input) => {
    const trimmed = input.trim()
    const imdbId = extractImdbId(trimmed)

    const alreadyAdded = imdbId
      ? shows.some(s => s.imdb_id === imdbId)
      : shows.some(s => s.name.toLowerCase() === trimmed.toLowerCase())
    if (alreadyAdded) throw new Error('That show is already in your list.')

    let meta = null
    try {
      meta = imdbId ? await lookupByImdbId(imdbId) : await lookupTVShow(trimmed)
    } catch {
      // TMDb lookup failed; fall back to what we already know
    }

    const { data, error } = await supabase
      .from('favorite_tv_shows')
      .insert({
        name: meta?.name || (imdbId ? imdbId : trimmed),
        user_id: userId,
        poster_url: meta?.poster_url ?? null,
        overview: meta?.overview ?? null,
        first_air_date: meta?.first_air_date ?? null,
        rating: meta?.rating ?? null,
        imdb_id: meta?.imdb_id ?? imdbId ?? null,
        tmdb_id: meta?.tmdb_id ?? null,
      })
      .select().single()
    if (error) throw error
    if (data) setShows(prev => [data, ...prev])
  }, [userId, shows])

  const deleteShow = useCallback(async (id) => {
    await supabase.from('favorite_tv_shows').delete().eq('id', id)
    setShows(prev => prev.filter(s => s.id !== id))
  }, [])

  return { shows, addShow, deleteShow }
}
