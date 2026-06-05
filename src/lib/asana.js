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

export function asanaTaskToMaster(task) {
  return {
    id: `asana_${task.gid}`,
    title: task.name,
    priority: 'medium',
    source: 'asana',
    due_on: task.due_on ?? null,
    project: task.memberships?.[0]?.project?.name ?? null,
  }
}
