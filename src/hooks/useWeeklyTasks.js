import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toDateStr } from '../utils/dateUtils'
import { completeAsanaTask as apiCompleteAsana, createTask as apiCreateTask, findOrCreateProject } from '../lib/asana'

function getWeekStart(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

export function useWeeklyTasks(userId, selectedDate, asanaOpts = {}) {
  const { token, workspaceGid } = asanaOpts
  const weekStart = getWeekStart(selectedDate)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const weekStartStr = toDateStr(weekStart)
  const weekEndStr = toDateStr(weekEnd)

  const [tasksByDate, setTasksByDate] = useState({})

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
        const grouped = {}
        for (const task of (data || [])) {
          if (!grouped[task.due_date]) grouped[task.due_date] = []
          grouped[task.due_date].push(task)
        }
        setTasksByDate(grouped)
      })
  }, [userId, weekStartStr])

  async function toggleTask(id, dateStr) {
    const tasks = tasksByDate[dateStr] || []
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const nowCompleting = !task.completed
    const { data } = await supabase
      .from('opus_tasks')
      .update({ completed: nowCompleting })
      .eq('id', id)
      .select()
      .single()
    if (data) {
      setTasksByDate(prev => ({
        ...prev,
        [dateStr]: (prev[dateStr] || []).map(t => t.id === id ? data : t)
      }))
      if (nowCompleting && task.asana_gid && token) {
        try { await apiCompleteAsana(token, task.asana_gid) } catch (e) { console.warn('Asana sync error:', e) }
      }
    }
  }

  async function addTask(dateStr, title, priority = 'medium', asanaGid = null) {
    let gid = asanaGid
    if (!gid && token && workspaceGid) {
      try {
        const proj = await findOrCreateProject(token, workspaceGid, 'Weekly Planner')
        const created = await apiCreateTask(token, workspaceGid, proj.gid, title)
        gid = created.gid
      } catch (e) { console.warn('Asana create error:', e) }
    }
    const { data } = await supabase
      .from('opus_tasks')
      .insert({ title, priority, due_date: dateStr, completed: false, user_id: userId, asana_gid: gid || null })
      .select()
      .single()
    if (data) {
      setTasksByDate(prev => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), data]
      }))
    }
  }

  async function linkTask(id, dateStr, asanaGid) {
    const { data } = await supabase
      .from('opus_tasks')
      .update({ asana_gid: asanaGid || null })
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

  return { tasksByDate, toggleTask, addTask, linkTask, weekStart, weekEnd }
}
