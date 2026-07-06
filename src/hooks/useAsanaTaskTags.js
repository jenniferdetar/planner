import { useState, useCallback } from 'react'

const STORAGE_KEY = 'asana_task_tags'
const TAG_OPTIONS = [null, 'CSEA', 'iCAAP', 'Roles', 'GCU']

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

export function useAsanaTaskTags() {
  const [tags, setTags] = useState(load)

  const cycleTag = useCallback((taskId) => {
    setTags(prev => {
      const current = prev[taskId] ?? null
      const idx = TAG_OPTIONS.indexOf(current)
      const next = TAG_OPTIONS[(idx + 1) % TAG_OPTIONS.length]
      const updated = { ...prev }
      if (next === null) delete updated[taskId]
      else updated[taskId] = next
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return { tags, cycleTag }
}
