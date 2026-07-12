import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { notionItemToIcaapItem } from '../lib/notionIcaap'

// Pulls every row from the Notion iCAAP database and reconciles it with
// icaap_items. Rows already linked by notion_page_id are skipped; everything
// else is inserted as new.
export function useNotionIcaapSync(userId, onImported) {
  const [syncing, setSyncing] = useState(false)
  const [newCount, setNewCount] = useState(null)
  const [error, setError] = useState(null)

  const sync = useCallback(async () => {
    if (!userId || syncing) return
    setSyncing(true)
    setNewCount(null)
    setError(null)

    try {
      const res = await fetch('/api/notion-icaap', { method: 'POST', signal: AbortSignal.timeout(35000) })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Notion iCAAP sync error ${res.status}`)
      }
      const data = await res.json()
      const items = data.items || []

      if (!items.length) { setNewCount(0); setSyncing(false); return }

      const ids = items.map(i => i.id)
      const { data: existing } = await supabase
        .from('icaap_items')
        .select('notion_page_id')
        .eq('user_id', userId)
        .in('notion_page_id', ids)
      const existingIds = new Set((existing || []).map(r => r.notion_page_id))

      let imported = 0
      for (const item of items) {
        if (existingIds.has(item.id)) continue
        const record = notionItemToIcaapItem(item)
        const { error: insertError } = await supabase
          .from('icaap_items')
          .insert({ ...record, notion_page_id: item.id, user_id: userId })
        if (!insertError) imported++
      }

      setNewCount(imported)
      if (imported > 0) onImported?.()
    } catch (err) {
      console.error('Notion iCAAP sync error:', err)
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }, [userId, syncing, onImported])

  return { sync, syncing, newCount, error }
}
