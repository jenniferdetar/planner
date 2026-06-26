import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const alpha = (arr) => [...arr].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))

export function useQuickLinks(userId, section) {
  const [links, setLinks] = useState([])

  useEffect(() => {
    if (!userId) return

    supabase
      .from('quick_links')
      .select('*')
      .eq('user_id', userId)
      .eq('section', section)
      .order('title', { ascending: true })
      .then(({ data }) => setLinks(data || []))

    const channel = supabase
      .channel(`quick_links:${userId}:${section}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quick_links',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.section === section) {
            setLinks((prev) => {
              if (prev.some((l) => l.id === payload.new.id)) return prev
              return alpha([...prev, payload.new])
            })
          } else if (payload.eventType === 'DELETE') {
            setLinks((prev) => prev.filter((l) => l.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE' && payload.new.section === section) {
            setLinks((prev) => alpha(prev.map((l) => (l.id === payload.new.id ? payload.new : l))))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, section])

  async function addLink(title, url) {
    const { data } = await supabase
      .from('quick_links')
      .insert({ title, url, section, user_id: userId })
      .select()
      .single()
    if (data) setLinks((prev) => alpha([...prev, data]))
  }

  async function deleteLink(id) {
    await supabase.from('quick_links').delete().eq('id', id)
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  return { links, addLink, deleteLink }
}
