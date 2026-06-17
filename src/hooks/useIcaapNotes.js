import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useIcaapNotes(userId) {
  const [notes, setNotes] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('icaap_one_off_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotes(data || []))
  }, [userId])

  async function addNote(note, source) {
    const { data } = await supabase
      .from('icaap_one_off_notes')
      .insert({ note, source: source || null, user_id: userId })
      .select()
      .single()
    if (data) setNotes((prev) => [data, ...prev])
  }

  async function deleteNote(id) {
    await supabase.from('icaap_one_off_notes').delete().eq('id', id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return { notes, addNote, deleteNote }
}
