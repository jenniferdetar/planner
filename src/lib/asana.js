const BASE = 'https://app.asana.com/api/1.0'

function headers(token) {
  return { Authorization: `Bearer ${token}`, Accept: 'application/json' }
}

export async function fetchWorkspaces(token) {
  const res = await fetch(`${BASE}/workspaces`, { headers: headers(token) })
  if (!res.ok) throw new Error(`Asana /workspaces ${res.status}`)
  const { data } = await res.json()
  return data // [{ gid, name }]
}

export async function fetchMyTasks(token, workspaceGid) {
  const fields = 'gid,name,completed,due_on,notes,memberships.project.name'
  const url = `${BASE}/tasks?assignee=me&workspace=${workspaceGid}&completed_since=now&opt_fields=${fields}&limit=100`
  const res = await fetch(url, { headers: headers(token) })
  if (!res.ok) throw new Error(`Asana /tasks ${res.status}`)
  const { data } = await res.json()
  return data
}

export async function completeAsanaTask(token, gid) {
  const res = await fetch(`${BASE}/tasks/${gid}`, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { completed: true } }),
  })
  if (!res.ok) throw new Error(`Asana PUT /tasks/${gid} ${res.status}`)
}

export async function updateAsanaTaskNotes(token, gid, notes) {
  const res = await fetch(`${BASE}/tasks/${gid}`, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { notes } }),
  })
  if (!res.ok) throw new Error(`Asana PUT /tasks/${gid} notes ${res.status}`)
}

export async function fetchProjects(token, workspaceGid) {
  const res = await fetch(`${BASE}/projects?workspace=${workspaceGid}&opt_fields=gid,name`, {
    headers: headers(token),
  })
  if (!res.ok) throw new Error(`Asana GET /projects ${res.status}`)
  const { data } = await res.json()
  return data
}

export async function createProject(token, workspaceGid, name) {
  const res = await fetch(`${BASE}/projects`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { name, workspace: workspaceGid } }),
  })
  if (!res.ok) throw new Error(`Asana POST /projects ${res.status}`)
  const { data } = await res.json()
  return data
}

export async function createTask(token, workspaceGid, projectGid, name, notes) {
  const res = await fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { name, workspace: workspaceGid, projects: [projectGid], notes: notes ?? '' } }),
  })
  if (!res.ok) throw new Error(`Asana POST /tasks ${res.status}`)
  const { data } = await res.json()
  return data
}

export async function findOrCreateProject(token, workspaceGid, name) {
  const projects = await fetchProjects(token, workspaceGid)
  const existing = projects.find(p => p.name === name)
  if (existing) return existing
  return createProject(token, workspaceGid, name)
}

export function asanaTaskToMaster(task) {
  return {
    id: `asana_${task.gid}`,
    title: task.name,
    priority: 'medium',
    source: 'asana',
    due_on: task.due_on ?? null,
    project: task.memberships?.[0]?.project?.name ?? null,
    notes: task.notes ?? '',
  }
}
