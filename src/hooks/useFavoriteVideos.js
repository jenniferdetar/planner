import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/
  )
  return match ? match[1] : null
}

function byTitle(a, b) {
  return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
}

export function useFavoriteVideos(userId) {
  const [videos, setVideos] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('favorite_videos')
      .select('*')
      .eq('user_id', userId)
      .then(({ data }) => setVideos((data || []).slice().sort(byTitle)))
  }, [userId])

  const addVideo = useCallback(async (url) => {
    const videoId = extractYouTubeId(url)
    if (!videoId) throw new Error('That doesn\'t look like a YouTube link.')

    let title = url
    let channel = ''
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      )
      if (res.ok) {
        const meta = await res.json()
        title = meta.title || title
        channel = meta.author_name || ''
      }
    } catch {
      // oEmbed lookup failed; fall back to the raw URL as the title
    }

    const thumbnail_url = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`

    const { data, error } = await supabase
      .from('favorite_videos')
      .insert({ url, video_id: videoId, title, channel, thumbnail_url, user_id: userId })
      .select().single()
    if (error) throw error
    if (data) setVideos(prev => [...prev, data].sort(byTitle))
  }, [userId])

  const deleteVideo = useCallback(async (id) => {
    await supabase.from('favorite_videos').delete().eq('id', id)
    setVideos(prev => prev.filter(v => v.id !== id))
  }, [])

  return { videos, addVideo, deleteVideo }
}
