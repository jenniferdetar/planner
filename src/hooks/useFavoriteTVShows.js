import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { lookupTVShow } from '../lib/tmdb'

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

  const addShow = useCallback(async (name) => {
    let meta = null
    try {
      meta = await lookupTVShow(name.trim())
    } catch {
      // TMDb lookup failed; fall back to just the show name
    }

    const { data, error } = await supabase
      .from('favorite_tv_shows')
      .insert({
        name: meta?.name || name.trim(),
        user_id: userId,
        poster_url: meta?.poster_url ?? null,
        overview: meta?.overview ?? null,
        first_air_date: meta?.first_air_date ?? null,
        rating: meta?.rating ?? null,
        imdb_id: meta?.imdb_id ?? null,
        tmdb_id: meta?.tmdb_id ?? null,
      })
      .select().single()
    if (error) throw error
    if (data) setShows(prev => [data, ...prev])
  }, [userId])

  const deleteShow = useCallback(async (id) => {
    await supabase.from('favorite_tv_shows').delete().eq('id', id)
    setShows(prev => prev.filter(s => s.id !== id))
  }, [])

  return { shows, addShow, deleteShow }
}
