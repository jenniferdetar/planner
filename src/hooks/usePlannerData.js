import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

function toDateStr(d) {
  return d.toISOString().split('T')[0]
}

// ─── Master Tasks ────────────────────────────────────────────────────────────

export function useMasterTasks(userId) {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('opus_master_tasks')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => setTasks(data || []))
  }, [userId])

  async function addTask(title, priority, category = '') {
    const { data } = await supabase
      .from('opus_master_tasks')
      .insert({ title, priority, category: category || null, user_id: userId })
      .select()
      .single()
    if (data) setTasks((prev) => [...prev, data])
  }

  async function deleteTask(id) {
    await supabase.from('opus_master_tasks').delete().eq('id', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return { tasks, addTask, deleteTask }
}

// ─── Daily Tasks ─────────────────────────────────────────────────────────────

export function useDailyTasks(userId, selectedDate) {
  const [tasks, setTasks] = useState([])
  const dateStr = toDateStr(selectedDate)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('opus_tasks')
      .select('*')
      .eq('due_date', dateStr)
      .order('created_at', { ascending: true })
      .then(({ data }) => setTasks(data || []))
  }, [userId, dateStr])

  async function addTask(title, priority) {
    const { data } = await supabase
      .from('opus_tasks')
      .insert({ title, priority, due_date: dateStr, completed: false, user_id: userId })
      .select()
      .single()
    if (data) setTasks((prev) => [...prev, data])
  }

  async function toggleTask(id) {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const { data } = await supabase
      .from('opus_tasks')
      .update({ completed: !task.completed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) setTasks((prev) => prev.map((t) => (t.id === id ? data : t)))
  }

  async function deleteTask(id) {
    await supabase.from('opus_tasks').delete().eq('id', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  async function updateTaskDescription(id, description) {
    const { data } = await supabase
      .from('opus_tasks')
      .update({ description, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) setTasks((prev) => prev.map((t) => (t.id === id ? data : t)))
  }

  return { tasks, addTask, toggleTask, deleteTask, updateTaskDescription }
}

// ─── Meetings (time blocks from Supabase) ────────────────────────────────────

export function useMeetings(userId, selectedDate) {
  const [meetings, setMeetings] = useState([])
  const dateStr = toDateStr(selectedDate)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('opus_meetings')
      .select('*')
      .eq('date', dateStr)
      .order('start_time', { ascending: true })
      .then(({ data }) => setMeetings(data || []))
  }, [userId, dateStr])

  async function addMeeting(title, hour, color, startTime, endTime) {
    const pad = (n) => String(n).padStart(2, '0')
    const st = startTime ?? `${pad(hour)}:00:00`
    const et = endTime ?? `${pad(Math.min(hour + 1, 23))}:00:00`
    const { data } = await supabase
      .from('opus_meetings')
      .insert({ title, date: dateStr, start_time: st, end_time: et, user_id: userId })
      .select()
      .single()
    if (data) setMeetings((prev) => [...prev, data])
    return data
  }

  async function bulkAddMeetings(events) {
    // events: [{ title, date, start_time, end_time }]
    if (!events.length || !userId) return { added: 0, skipped: 0 }
    const dates = [...new Set(events.map((e) => e.date))]
    const { data: existing } = await supabase
      .from('opus_meetings')
      .select('title,date,start_time')
      .eq('user_id', userId)
      .in('date', dates)
    const existingKeys = new Set((existing || []).map((r) => `${r.date}|${r.title}|${r.start_time}`))
    const toInsert = events
      .filter((e) => !existingKeys.has(`${e.date}|${e.title}|${e.start_time}`))
      .map((e) => ({ ...e, user_id: userId }))
    if (toInsert.length) {
      await supabase.from('opus_meetings').insert(toInsert)
      // Refresh current day view if any events fall on selected date
      if (toInsert.some((e) => e.date === dateStr)) {
        const { data } = await supabase
          .from('opus_meetings').select('*').eq('date', dateStr).order('start_time', { ascending: true })
        setMeetings(data || [])
      }
    }
    return { added: toInsert.length, skipped: events.length - toInsert.length }
  }

  async function deleteMeeting(id) {
    await supabase.from('opus_meetings').delete().eq('id', id)
    setMeetings((prev) => prev.filter((m) => m.id !== id))
  }

  return { meetings, addMeeting, bulkAddMeetings, deleteMeeting }
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export function useNotes(userId, selectedDate) {
  const [content, setContent] = useState('')
  const [noteId, setNoteId] = useState(null)
  const dateStr = toDateStr(selectedDate)
  const saveTimer = useRef(null)

  useEffect(() => {
    if (!userId) return
    setContent('')
    setNoteId(null)
    supabase
      .from('opus_notes')
      .select('*')
      .eq('date', dateStr)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setContent(data.content || '')
          setNoteId(data.id)
        }
      })
  }, [userId, dateStr])

  const handleChange = useCallback(
    (text) => {
      setContent(text)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        if (noteId) {
          await supabase
            .from('opus_notes')
            .update({ content: text, updated_at: new Date().toISOString() })
            .eq('id', noteId)
        } else {
          const { data } = await supabase
            .from('opus_notes')
            .insert({ content: text, date: dateStr, user_id: userId })
            .select()
            .single()
          if (data) setNoteId(data.id)
        }
      }, 800)
    },
    [noteId, dateStr, userId]
  )

  return { content, onChange: handleChange }
}

// ─── All-dates task counts (for calendar dots) ───────────────────────────────

export function useTaskCounts(userId) {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    if (!userId) return
    supabase
      .from('opus_tasks')
      .select('due_date, completed')
      .then(({ data }) => {
        const map = {}
        for (const row of data || []) {
          if (!row.due_date) continue
          if (!map[row.due_date]) map[row.due_date] = { total: 0, done: 0 }
          map[row.due_date].total++
          if (row.completed) map[row.due_date].done++
        }
        setCounts(map)
      })
  }, [userId])

  return counts
}

// Fetch all meetings in a date range for the month calendar view
export function useMeetingsInRange(userId, startDate, endDate) {
  const [meetings, setMeetings] = useState([])
  const startStr = toDateStr(startDate)
  const endStr = toDateStr(endDate)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('opus_meetings')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startStr)
      .lte('date', endStr)
      .order('start_time', { ascending: true })
      .then(({ data }) => setMeetings(data || []))
  }, [userId, startStr, endStr])

  return meetings
}
