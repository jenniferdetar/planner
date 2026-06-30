import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

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
    const { data, error } = await supabase
      .from('favorite_tv_shows')
      .insert({ name: name.trim(), user_id: userId })
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
