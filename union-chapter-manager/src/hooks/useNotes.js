import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Free-form chapter notes / topics.
export function useNotes(orgId, userId) {
  const [notes, setNotes] = useState([])

  const load = useCallback(async () => {
    if (!orgId) {
      setNotes([])
      return
    }
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
    setNotes(data || [])
  }, [orgId])

  useEffect(() => {
    load()
  }, [load])

  async function addNote({ body, topic, source }) {
    const { data } = await supabase
      .from('notes')
      .insert({ org_id: orgId, body, topic: topic || null, source: source || null, created_by: userId })
      .select()
      .single()
    if (data) setNotes((prev) => [data, ...prev])
  }

  async function deleteNote(id) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return { notes, addNote, deleteNote }
}
