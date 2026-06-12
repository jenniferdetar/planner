import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMantra(userId) {
  const [mantra, setMantra] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('personal_mantra')
      .select('mantra_text')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => { if (data?.mantra_text) setMantra(data.mantra_text) })
  }, [userId])

  async function save(text) {
    await supabase.from('personal_mantra').upsert({ user_id: userId, mantra_text: text, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return { mantra, setMantra, save, saved }
}
