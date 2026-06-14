import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

export function useWeeklyTasks(userId: string | null, selectedDate: Date) {
  const weekStart = getWeekStart(selectedDate)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const weekStartStr = toDateStr(weekStart)
  const weekEndStr = toDateStr(weekEnd)

  const [tasksByDate, setTasksByDate] = useState<Record<string, any[]>>({})

  useEffect(() => {
    if (!userId) return
    supabase
      .from('opus_tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('due_date', weekStartStr)
      .lte('due_date', weekEndStr)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const grouped: Record<string, any[]> = {}
        for (const task of (data || [])) {
          if (!grouped[task.due_date]) grouped[task.due_date] = []
          grouped[task.due_date].push(task)
        }
        setTasksByDate(grouped)
      })
  }, [userId, weekStartStr])

  async function toggleTask(id: string, dateStr: string) {
    const tasks = tasksByDate[dateStr] || []
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const { data } = await supabase
      .from('opus_tasks')
      .update({ completed: !task.completed })
      .eq('id', id)
      .select()
      .single()
    if (data) {
      setTasksByDate(prev => ({
        ...prev,
        [dateStr]: (prev[dateStr] || []).map(t => t.id === id ? data : t)
      }))
    }
  }

  async function addTask(dateStr: string, title: string, priority = 'medium') {
    const { data } = await supabase
      .from('opus_tasks')
      .insert({ title, priority, due_date: dateStr, completed: false, user_id: userId })
      .select()
      .single()
    if (data) {
      setTasksByDate(prev => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), data]
      }))
    }
  }

  return { tasksByDate, toggleTask, addTask, weekStart, weekEnd }
}
