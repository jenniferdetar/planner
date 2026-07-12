import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { isBeforeCurrentSchoolYear } from '../lib/schoolYear'

export function useIcaapItems(userId) {
  const [items, setItems] = useState([])

  const load = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('icaap_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    const rows = data || []
    setItems(rows)

    // Auto-archive items due in a completed school year
    const staleIds = rows
      .filter(i => !i.archived && isBeforeCurrentSchoolYear(i.due_date))
      .map(i => i.id)
    if (staleIds.length) {
      await supabase.from('icaap_items').update({ archived: true }).in('id', staleIds)
      setItems(prev => prev.map(i => staleIds.includes(i.id) ? { ...i, archived: true } : i))
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  async function addItem(fields) {
    const { data } = await supabase
      .from('icaap_items')
      .insert({ ...fields, user_id: userId })
      .select()
      .single()
    if (data) setItems((prev) => [data, ...prev])
    return data
  }

  async function updateItem(id, updates) {
    const { data } = await supabase
      .from('icaap_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) setItems((prev) => prev.map((i) => (i.id === id ? data : i)))
  }

  async function deleteItem(id) {
    await supabase.from('icaap_items').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return { items, addItem, updateItem, deleteItem, reload: load }
}
