import { useState, useEffect, useRef } from 'react'
import { fetchWorkspaces, fetchMyTasks, asanaTaskToMaster, completeAsanaTask, updateAsanaTaskNotes } from '../lib/asana'

const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutes

function matchesProject(task, name) {
  return task.memberships?.some(
    m => m.project?.name?.toLowerCase() === name.toLowerCase()
  )
}

export function useAsanaTasks() {
  const token = import.meta.env.VITE_ASANA_TOKEN
  const [allTasks, setAllTasks] = useState([])
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
        // Fetch with memberships so we can filter by project
        const raw = await fetchMyTasksWithMemberships(token, workspaces[0].gid)
        const mapped = raw.map(t => ({ ...asanaTaskToMaster(t), _raw: t }))
        const today = new Date().toISOString().split('T')[0]
        setAllTasks(raw)
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
    setAllTasks(prev => prev.filter(t => t.gid !== gid))
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

  const cseaTasks = allTasks
    .filter(t => matchesProject(t, 'CSEA'))
    .map(t => ({ ...asanaTaskToMaster(t), _raw: t }))

  const icaapTasks = allTasks
    .filter(t => matchesProject(t, 'iCAAP'))
    .map(t => ({ ...asanaTaskToMaster(t), _raw: t }))

  return { masterTasks, todayTasks, cseaTasks, icaapTasks, status, completeTask, updateTaskNotes }
}

async function fetchMyTasksWithMemberships(token, workspaceGid) {
  const fields = 'gid,name,completed,due_on,notes,memberships.project.name,memberships.project.gid'
  const url = `https://app.asana.com/api/1.0/tasks?assignee=me&workspace=${workspaceGid}&completed_since=now&opt_fields=${fields}&limit=100`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Asana /tasks ${res.status}`)
  const { data } = await res.json()
  return data
}

