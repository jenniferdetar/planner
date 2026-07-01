import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useNotePages(userId) {
  const [notes, setNotes] = useState([])
  const saveTimers = useRef({})

  useEffect(() => {
    if (!userId) return
    supabase
      .from('note_pages')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .then(({ data }) => setNotes(data || []))
  }, [userId])

  async function addNote(folderId, title = 'Untitled') {
    const { data } = await supabase
      .from('note_pages')
      .insert({ user_id: userId, folder_id: folderId, title, body: '' })
      .select().single()
    if (data) setNotes(prev => [data, ...prev])
    return data
  }

  function updateNote(id, fields) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...fields } : n))
    clearTimeout(saveTimers.current[id])
    saveTimers.current[id] = setTimeout(async () => {
      await supabase
        .from('note_pages')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id)
    }, 600)
  }

  async function deleteNote(id) {
    await supabase.from('note_pages').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  return { notes, addNote, updateNote, deleteNote }
}
