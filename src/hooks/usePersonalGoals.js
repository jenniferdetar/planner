import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePersonalGoals(userId) {
  const [goals, setGoals] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('personal_goals')
      .select('*')
      .eq('user_id', userId)
      .order('category')
      .order('sort_order')
      .then(({ data }) => setGoals(data || []))
  }, [userId])

  async function addGoal(category, goal_text, role_id = null) {
    const maxOrder = goals.filter(g => g.category === category).length + 1
    const { data } = await supabase
      .from('personal_goals')
      .insert({ user_id: userId, category, goal_text, sort_order: maxOrder, role_id })
      .select().single()
    if (data) setGoals(prev => [...prev, data])
  }

  async function updateGoal(id, fields) {
    await supabase.from('personal_goals').update(fields).eq('id', id)
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...fields } : g))
  }

  async function deleteGoal(id) {
    await supabase.from('personal_goals').delete().eq('id', id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const byCategory = goals.reduce((acc, g) => {
    if (!acc[g.category]) acc[g.category] = []
    acc[g.category].push(g)
    return acc
  }, {})

  return { goals, byCategory, addGoal, updateGoal, deleteGoal }
}
