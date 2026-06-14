import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePersonalGoals(userId: string | null) {
  const [goals, setGoals] = useState<any[]>([])

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

  async function addGoal(category: string, goal_text: string) {
    const maxOrder = goals.filter(g => g.category === category).length + 1
    const { data } = await supabase
      .from('personal_goals')
      .insert({ user_id: userId, category, goal_text, sort_order: maxOrder })
      .select().single()
    if (data) setGoals(prev => [...prev, data])
  }

  async function deleteGoal(id: string) {
    await supabase.from('personal_goals').delete().eq('id', id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const byCategory = goals.reduce((acc: Record<string, any[]>, g) => {
    if (!acc[g.category]) acc[g.category] = []
    acc[g.category].push(g)
    return acc
  }, {})

  return { goals, byCategory, addGoal, deleteGoal }
}
