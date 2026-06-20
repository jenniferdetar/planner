import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function usePersonalChecklist(userId) {
  const [tasks, setTasks] = useState([])
  const [completions, setCompletions] = useState(new Set())
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
        setCompletions(new Set((data || []).map(r => `${r.task_id}|${r.month}`)))
      })
  }, [userId])

  function isChecked(taskId, month) {
    return completions.has(`${taskId}|${month}`)
  }

  async function toggle(taskId, month) {
    const key = `${taskId}|${month}`
    if (completions.has(key)) {
      await supabase.from('personal_checklist_completions').delete()
        .eq('user_id', userId).eq('task_id', taskId).eq('year', year).eq('month', month)
      setCompletions(prev => { const s = new Set(prev); s.delete(key); return s })
    } else {
      await supabase.from('personal_checklist_completions')
        .insert({ user_id: userId, task_id: taskId, year, month })
      const task = tasks.find(t => t.id === taskId)
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
      const monthName = MONTH_NAMES[month - 1] || month
      supabase.from('daily_log').insert({ user_id: userId, date: dateStr, entry: `✓ [Monthly Checklist] ${task?.task_name || 'Task'} — ${monthName}` })
      setCompletions(prev => new Set([...prev, key]))
    }
  }

  async function addTask(task_name) {
    const { data } = await supabase
      .from('personal_checklist_tasks')
      .insert({ user_id: userId, task_name, sort_order: tasks.length + 1 })
      .select().single()
    if (data) setTasks(prev => [...prev, data])
  }

  async function deleteTask(id) {
    await supabase.from('personal_checklist_tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return { tasks, isChecked, toggle, addTask, deleteTask }
}
