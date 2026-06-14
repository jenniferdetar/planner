import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useDailyLog(userId: string | null, date: string) {
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    if (!userId || !date) return
    supabase
      .from('daily_log')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true })
      .then(({ data }) => setEntries(data || []))
  }, [userId, date])

  async function addEntry(text: string) {
    const { data } = await supabase
      .from('daily_log')
      .insert({ user_id: userId, date, entry: text })
      .select()
      .single()
    if (data) setEntries(prev => [...prev, data])
  }

  async function deleteEntry(id: string) {
    await supabase.from('daily_log').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  async function updateEntry(id: string, text: string) {
    await supabase.from('daily_log').update({ entry: text }).eq('id', id)
    setEntries(prev => prev.map(e => e.id === id ? { ...e, entry: text } : e))
  }

  return { entries, addEntry, deleteEntry, updateEntry }
}
