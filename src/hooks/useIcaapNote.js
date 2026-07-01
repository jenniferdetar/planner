import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useIcaapNote(userId, noteKey) {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)
  const [archived, setArchived] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (!userId || !noteKey) return
    supabase
      .from('icaap_notes')
      .select('content, archived')
      .eq('user_id', userId)
      .eq('note_key', noteKey)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content) setContent(data.content)
        setArchived(!!data?.archived)
      })
  }, [userId, noteKey])

  async function setArchivedFlag(val) {
    setArchived(val)
    await supabase.from('icaap_notes').upsert(
      { user_id: userId, note_key: noteKey, content, archived: val, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,note_key' }
    )
  }

  function handleChange(val) {
    setContent(val)
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      await supabase.from('icaap_notes').upsert(
        { user_id: userId, note_key: noteKey, content: val, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,note_key' }
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 900)
  }

  return { content, handleChange, saved, archived, setArchived: setArchivedFlag }
}
