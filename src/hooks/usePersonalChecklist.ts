import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePersonalChecklist(userId: string | null) {
  const [tasks, setTasks] = useState<any[]>([])
  const [completions, setCompletions] = useState<Set<string>>(new Set())
  const year = new Date().getFullYear()

  useEffect(() => {
    if (!userId) return
    supabase
      .from('personal_checklist_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order')
      .then(({ data }) => setTasks(data || []))

    supabase
      .from('personal_checklist_completions')
      .select('task_id, month')
      .eq('user_id', userId)
      .eq('year', year)
      .then(({ data }) => {
        setCompletions(new Set((data || []).map((r: any) => `${r.task_id}|${r.month}`)))
      })
  }, [userId])

  function isChecked(taskId: string, month: number): boolean {
    return completions.has(`${taskId}|${month}`)
  }

  async function toggle(taskId: string, month: number) {
    const key = `${taskId}|${month}`
    if (completions.has(key)) {
      await supabase.from('personal_checklist_completions').delete()
        .eq('user_id', userId).eq('task_id', taskId).eq('year', year).eq('month', month)
      setCompletions(prev => { const s = new Set(prev); s.delete(key); return s })
    } else {
      await supabase.from('personal_checklist_completions')
        .insert({ user_id: userId, task_id: taskId, year, month })
      setCompletions(prev => new Set([...prev, key]))
    }
  }

  async function addTask(task_name: string) {
    const { data } = await supabase
      .from('personal_checklist_tasks')
      .insert({ user_id: userId, task_name, sort_order: tasks.length + 1 })
      .select().single()
    if (data) setTasks(prev => [...prev, data])
  }

  async function deleteTask(id: string) {
    await supabase.from('personal_checklist_tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return { tasks, isChecked, toggle, addTask, deleteTask }
}
