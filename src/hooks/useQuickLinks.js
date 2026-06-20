import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useQuickLinks(userId, section) {
  const [links, setLinks] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('quick_links')
      .select('*')
      .eq('user_id', userId)
      .eq('section', section)
      .order('created_at', { ascending: true })
      .then(({ data }) => setLinks(data || []))
  }, [userId, section])

  async function addLink(title, url) {
    const { data } = await supabase
      .from('quick_links')
      .insert({ title, url, section, user_id: userId })
      .select()
      .single()
    if (data) setLinks((prev) => [...prev, data])
  }

  async function deleteLink(id) {
    await supabase.from('quick_links').delete().eq('id', id)
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  return { links, addLink, deleteLink }
}
