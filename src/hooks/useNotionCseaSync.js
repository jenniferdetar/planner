import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { notionItemToInteraction } from '../lib/notionCsea'

// Pulls every row marked "Member Interaction" from the Notion CSEA database
// and reconciles it with member_interactions. Rows already linked by
// notion_page_id are skipped; everything else is inserted as new.
export function useNotionCseaSync() {
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [newCount, setNewCount] = useState(null)
  const [error, setError] = useState(null)

  const sync = useCallback(async () => {
    if (syncing) return
    setSyncing(true)
    setNewCount(null)
    setError(null)

    try {
      const res = await fetch('/api/notion-csea', { method: 'POST', signal: AbortSignal.timeout(35000) })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Notion CSEA sync error ${res.status}`)
      }
      const data = await res.json()
      const items = data.items || []

      if (!items.length) { setLastSynced(new Date()); setSyncing(false); setNewCount(0); return }

      const ids = items.map(i => i.id)
      const { data: existing } = await supabase
        .from('member_interactions')
        .select('notion_page_id')
        .in('notion_page_id', ids)
      const existingIds = new Set((existing || []).map(r => r.notion_page_id))

      let imported = 0
      for (const item of items) {
        if (existingIds.has(item.id)) continue
        const record = notionItemToInteraction(item)
        const { error: insertError } = await supabase
          .from('member_interactions')
          .insert({ ...record, notion_page_id: item.id })
        if (!insertError) imported++
      }

      setNewCount(imported)
      setLastSynced(new Date())
    } catch (err) {
      console.error('Notion CSEA sync error:', err)
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }, [syncing])

  return { sync, syncing, lastSynced, newCount, error }
}
