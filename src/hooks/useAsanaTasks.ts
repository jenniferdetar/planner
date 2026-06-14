import { useState, useEffect, useRef } from 'react'
import {
  AsanaMasterTask,
  AsanaProject,
  AsanaTask,
  asanaTaskToMaster,
  fetchWorkspaces,
  completeAsanaTask,
  updateAsanaTaskNotes,
  createTask,
  findOrCreateProject,
  fetchProjects,
} from '../lib/asana'

const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutes

function matchesProject(task: AsanaTask, name: string): boolean {
  return task.memberships?.some(
    m => m.project?.name?.toLowerCase() === name.toLowerCase()
  ) ?? false
}

export function useAsanaTasks() {
  const token: string = import.meta.env.VITE_ASANA_TOKEN
  const [allTasks, setAllTasks] = useState<AsanaTask[]>([])
  const [masterTasks, setMasterTasks] = useState<(AsanaMasterTask & { _raw: AsanaTask })[]>([])
  const [todayTasks, setTodayTasks] = useState<(AsanaMasterTask & { _raw: AsanaTask })[]>([])
  const [projects, setProjects] = useState<AsanaProject[]>([])
  const [workspaceGid, setWorkspaceGid] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('idle')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wsGidRef = useRef<string | null>(null)

  async function sync(wsGid?: string) {
    const gid = wsGid ?? wsGidRef.current
    if (!gid) return
    setStatus('loading')
    try {
      const [raw, projectList] = await Promise.all([
        fetchMyTasksWithMemberships(token, gid),
        fetchProjects(token, gid),
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

  useEffect(() => {
    if (!token) { setStatus('no-token'); return }

    async function init() {
      setStatus('loading')
      try {
        const workspaces = await fetchWorkspaces(token)
        if (!workspaces.length) { setStatus('ready'); return }
        const wsGid = workspaces[0].gid
        setWorkspaceGid(wsGid)
        wsGidRef.current = wsGid
        await sync(wsGid)
      } catch (err) {
        console.error('Asana init failed:', err)
        setStatus('error')
      }
    }

    init()
    timerRef.current = setInterval(() => sync(), POLL_INTERVAL)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [token])

  async function completeTask(id: string) {
    const gid = id.replace('asana_', '')
    setAllTasks(prev => prev.filter(t => t.gid !== gid))
    setMasterTasks(prev => prev.filter(t => t.id !== id))
    setTodayTasks(prev => prev.filter(t => t.id !== id))
    completeAsanaTask(token, gid).catch(err => console.error('Asana complete failed:', err))
  }

  async function updateTaskNotes(id: string, notes: string) {
    const gid = id.replace('asana_', '')
    await updateAsanaTaskNotes(token, gid, notes)
    const update = (t: AsanaMasterTask & { _raw: AsanaTask }) => t.id === id ? { ...t, notes } : t
    setMasterTasks(prev => prev.map(update))
    setTodayTasks(prev => prev.map(update))
  }

  const cseaTasks = allTasks
    .filter(t => matchesProject(t, 'CSEA'))
    .map(t => ({ ...asanaTaskToMaster(t), _raw: t }))

  const icaapTasks = allTasks
    .filter(t => matchesProject(t, 'iCAAP'))
    .map(t => ({ ...asanaTaskToMaster(t), _raw: t }))

  async function addTask(name: string, notes: string, projectName: string) {
    if (!token || !workspaceGid) return
    let projectGid: string | null = null
    if (projectName) {
      const proj = await findOrCreateProject(token, workspaceGid, projectName)
      projectGid = proj.gid
    }
    const newTask = await createTask(token, workspaceGid, projectGid, name, notes)
    const mapped = { ...asanaTaskToMaster(newTask), _raw: newTask }
    setAllTasks(prev => [...prev, newTask])
    setMasterTasks(prev => [...prev, mapped])
  }

  return { masterTasks, todayTasks, cseaTasks, icaapTasks, projects, workspaceGid, status, completeTask, updateTaskNotes, addTask, refresh: () => sync() }
}

async function fetchMyTasksWithMemberships(token: string, workspaceGid: string): Promise<AsanaTask[]> {
  const fields = 'gid,name,completed,due_on,notes,memberships.project.name,memberships.project.gid'
  const url = `https://app.asana.com/api/1.0/tasks?assignee=me&workspace=${workspaceGid}&completed_since=now&opt_fields=${fields}&limit=100`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Asana /tasks ${res.status}`)
  const { data } = await res.json()
  return data
}
