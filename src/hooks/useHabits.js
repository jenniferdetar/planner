import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useHabits(userId) {
  const [habits, setHabits] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => setHabits(data || []))
  }, [userId])

  async function add(fields) {
    const { data } = await supabase
      .from('habits')
      .insert({ ...fields, user_id: userId })
      .select()
      .single()
    if (data) setHabits(prev => [...prev, data])
  }

  async function update(id, updates) {
    const { data } = await supabase
      .from('habits')
      .update({ ...updates })
      .eq('id', id)
      .select()
      .single()
    if (data) setHabits(prev => prev.map(h => h.id === id ? data : h))
  }

  async function remove(id) {
    await supabase.from('habits').update({ active: false }).eq('id', id)
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  return { habits, add, update, remove }
}
