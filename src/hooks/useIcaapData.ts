import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useIcaapItems(userId: string | null) {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('icaap_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data || []))
  }, [userId])

  async function addItem(fields: Record<string, any>) {
    const { data } = await supabase
      .from('icaap_items')
      .insert({ ...fields, user_id: userId })
      .select()
      .single()
    if (data) setItems((prev) => [data, ...prev])
    return data
  }

  async function updateItem(id: string, updates: Record<string, any>) {
    const { data } = await supabase
      .from('icaap_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) setItems((prev) => prev.map((i) => (i.id === id ? data : i)))
  }

  async function deleteItem(id: string) {
    await supabase.from('icaap_items').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return { items, addItem, updateItem, deleteItem }
}
