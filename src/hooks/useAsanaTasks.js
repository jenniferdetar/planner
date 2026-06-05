import { useState, useEffect, useRef } from 'react'
import { fetchWorkspaces, fetchMyTasks, asanaTaskToMaster } from '../lib/asana'

const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useAsanaTasks() {
  const token = import.meta.env.VITE_ASANA_TOKEN
  const [masterTasks, setMasterTasks] = useState([])
  const [todayTasks, setTodayTasks] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | ready | error | no-token
  const timerRef = useRef(null)

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      return
    }

    async function sync() {
      setStatus('loading')
      try {
        const workspaces = await fetchWorkspaces(token)
        if (!workspaces.length) { setStatus('ready'); return }
        const workspaceGid = workspaces[0].gid

        const raw = await fetchMyTasks(token, workspaceGid)
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

  return { masterTasks, todayTasks, status }
}
