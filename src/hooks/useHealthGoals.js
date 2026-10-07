import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useHealthGoals(userId) {
  const [goals, setGoals] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('health_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setGoals(data || []))
  }, [userId])

  async function add(fields) {
    const { data } = await supabase
      .from('health_goals')
      .insert({ ...fields, user_id: userId })
      .select()
      .single()
    if (data) setGoals(prev => [...prev, data])
  }

  async function update(id, updates) {
    const { data } = await supabase
      .from('health_goals')
      .update({ ...updates })
      .eq('id', id)
      .select()
      .single()
    if (data) setGoals(prev => prev.map(g => g.id === id ? data : g))
  }

  async function remove(id) {
    await supabase.from('health_goals').delete().eq('id', id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  return { goals, add, update, remove }
}
