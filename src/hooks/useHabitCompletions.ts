import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function useHabitCompletions(userId: string | null, weekStart: Date | null, weekEnd: Date | null) {
  const [completions, setCompletions] = useState<Set<string>>(new Set())

  const weekStartStr = weekStart ? toDateStr(weekStart) : null
  const weekEndStr = weekEnd ? toDateStr(weekEnd) : null

  useEffect(() => {
    if (!userId || !weekStartStr) return
    supabase
      .from('habit_completions')
      .select('habit_category, habit_name, date')
      .eq('user_id', userId)
      .gte('date', weekStartStr)
      .lte('date', weekEndStr)
      .then(({ data }) => {
        const set = new Set((data || []).map((r: any) => `${r.habit_category}|${r.habit_name}|${r.date}`))
        setCompletions(set)
      })
  }, [userId, weekStartStr])

  function isCompleted(category: string, name: string, dateStr: string): boolean {
    return completions.has(`${category}|${name}|${dateStr}`)
  }

  async function toggle(category: string, name: string, dateStr: string) {
    const key = `${category}|${name}|${dateStr}`
    if (completions.has(key)) {
      await supabase
        .from('habit_completions')
        .delete()
        .eq('user_id', userId)
        .eq('habit_category', category)
        .eq('habit_name', name)
        .eq('date', dateStr)
      setCompletions(prev => { const s = new Set(prev); s.delete(key); return s })
    } else {
      await supabase
        .from('habit_completions')
        .insert({ user_id: userId, habit_category: category, habit_name: name, date: dateStr })
      setCompletions(prev => new Set([...prev, key]))
    }
  }

  return { isCompleted, toggle }
}
