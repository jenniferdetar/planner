import { useState, useEffect, useRef } from 'react'
import { fetchWorkspaces, fetchMyTasks, asanaTaskToMaster, completeAsanaTask, updateAsanaTaskNotes, createTask, findOrCreateProject, fetchProjects } from '../lib/asana'

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
  const [projects, setProjects] = useState([])
  const [workspaceGid, setWorkspaceGid] = useState(null)
  const [status, setStatus] = useState('idle')
  const timerRef = useRef(null)

  useEffect(() => {
    if (!token) { setStatus('no-token'); return }

    async function sync() {
      setStatus('loading')
      try {
        const workspaces = await fetchWorkspaces(token)
        if (!workspaces.length) { setStatus('ready'); return }
        const wsGid = workspaces[0].gid
        setWorkspaceGid(wsGid)
        // Fetch tasks + projects in parallel
        const [raw, projectList] = await Promise.all([
          fetchMyTasksWithMemberships(token, wsGid),
          fetchProjects(token, wsGid),
        ])
        setProjects(projectList)
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

  async function addTask(name, notes, projectName) {
    if (!token || !workspaceGid) return
    let projectGid = null
    if (projectName) {
      const proj = await findOrCreateProject(token, workspaceGid, projectName)
      projectGid = proj.gid
    }
    const newTask = await createTask(token, workspaceGid, projectGid, name, notes)
    const mapped = { ...asanaTaskToMaster(newTask), _raw: newTask }
    setAllTasks(prev => [...prev, newTask])
    setMasterTasks(prev => [...prev, mapped])
  }

  return { masterTasks, todayTasks, cseaTasks, icaapTasks, projects, workspaceGid, status, completeTask, updateTaskNotes, addTask }
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

