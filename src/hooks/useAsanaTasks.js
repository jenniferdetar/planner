import { useState, useEffect, useRef } from 'react'
import { fetchWorkspaces, fetchMyTasks, asanaTaskToMaster, completeAsanaTask, updateAsanaTaskNotes } from '../lib/asana'

const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useAsanaTasks() {
  const token = import.meta.env.VITE_ASANA_TOKEN
  const [masterTasks, setMasterTasks] = useState([])
  const [todayTasks, setTodayTasks] = useState([])
  const [status, setStatus] = useState('idle')
  const timerRef = useRef(null)

  useEffect(() => {
    if (!token) { setStatus('no-token'); return }

    async function sync() {
      setStatus('loading')
      try {
        const workspaces = await fetchWorkspaces(token)
        if (!workspaces.length) { setStatus('ready'); return }
        const raw = await fetchMyTasks(token, workspaces[0].gid)
        const mapped = raw.map(asanaTaskToMaster)
        const today = new Date().toISOString().split('T')[0]
        setMasterTasks(mapped)
        setTodayTasks(mapped.filter(t => t.due_on === today))
        setStatus('ready')
      } catch (err) {
        console.error('Asana sync failed:', err)
        setStatus('error')
      }
    }

    sync()
    timerRef.current = setInterval(sync, POLL_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [token])

  async function completeTask(id) {
    const gid = id.replace('asana_', '')
    await completeAsanaTask(token, gid)
    setMasterTasks(prev => prev.filter(t => t.id !== id))
    setTodayTasks(prev => prev.filter(t => t.id !== id))
  }

  async function updateTaskNotes(id, notes) {
    const gid = id.replace('asana_', '')
    await updateAsanaTaskNotes(token, gid, notes)
    const update = t => t.id === id ? { ...t, notes } : t
    setMasterTasks(prev => prev.map(update))
    setTodayTasks(prev => prev.map(update))
  }

  return { masterTasks, todayTasks, status, completeTask, updateTaskNotes }
}
