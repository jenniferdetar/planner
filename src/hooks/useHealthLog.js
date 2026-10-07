import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useHealthLog(userId) {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('health_log')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(90)
      .then(({ data }) => setEntries(data || []))
  }, [userId])

  async function upsert(date, fields) {
    const { data } = await supabase
      .from('health_log')
      .upsert({ ...fields, user_id: userId, date }, { onConflict: 'user_id,date' })
      .select()
      .single()
    if (data) {
      setEntries(prev => {
        const exists = prev.find(e => e.date === date)
        if (exists) return prev.map(e => e.date === date ? data : e)
        return [data, ...prev]
      })
    }
  }

  function getEntry(dateStr) {
    return entries.find(e => e.date === dateStr) || null
  }

  return { entries, upsert, getEntry }
}
