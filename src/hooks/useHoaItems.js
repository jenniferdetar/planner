import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const CATEGORIES = ['Maintenance', 'Financials', 'Insurance', 'Legal', 'General']
export const PRIORITIES = ['Low', 'Medium', 'High']
export const STATUSES = ['Not Started', 'In Progress', 'Completed', 'Resolved']

export function useHoaItems(userId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('hoa_items')
      .select('*')
      .eq('user_id', userId)
      .order('category')
      .order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  async function addItem(fields) {
    const { data, error } = await supabase
      .from('hoa_items')
      .insert({ ...fields, user_id: userId })
      .select()
      .single()
    if (!error && data) setItems(prev => [data, ...prev])
  }

  async function updateItem(id, fields) {
    const { data, error } = await supabase
      .from('hoa_items')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error && data) setItems(prev => prev.map(i => i.id === id ? data : i))
  }

  async function deleteItem(id) {
    await supabase.from('hoa_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return { items, loading, addItem, updateItem, deleteItem, reload: load }
}
