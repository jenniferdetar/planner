import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { notionItemToHoaItem } from '../lib/notionHoa'

function normalizeTitle(title) {
  return (title || '').trim().toLowerCase()
}

// Pulls every row from the Notion "Open Items" data source and reconciles it
// with hoa_items. Rows already linked by notion_page_id are skipped. Rows
// that match an existing hoa_items title (e.g. items imported manually
// before this sync existed) are linked in place rather than duplicated.
// Everything else is inserted as a new item.
export function useNotionHoaSync(userId, onImported) {
  const [syncing, setSyncing] = useState(false)
  const [newCount, setNewCount] = useState(null)
  const [error, setError] = useState(null)

  const sync = useCallback(async () => {
    if (!userId || syncing) return
    setSyncing(true)
    setNewCount(null)
    setError(null)

    try {
      const res = await fetch('/api/notion-hoa', { method: 'POST', signal: AbortSignal.timeout(35000) })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Notion HOA sync error ${res.status}`)
      }
      const data = await res.json()
      const items = data.items || []

      if (!items.length) { setNewCount(0); setSyncing(false); return }

      const { data: existing } = await supabase
        .from('hoa_items')
        .select('id, title, notion_page_id')
        .eq('user_id', userId)
      const linkedIds = new Set((existing || []).filter(r => r.notion_page_id).map(r => r.notion_page_id))
      const unlinkedByTitle = new Map(
        (existing || []).filter(r => !r.notion_page_id).map(r => [normalizeTitle(r.title), r.id])
      )

      let imported = 0
      for (const item of items) {
        if (!item.title || linkedIds.has(item.id)) continue

        const matchId = unlinkedByTitle.get(normalizeTitle(item.title))
        if (matchId) {
          await supabase.from('hoa_items').update({ notion_page_id: item.id }).eq('id', matchId)
          unlinkedByTitle.delete(normalizeTitle(item.title))
          continue
        }

        const record = notionItemToHoaItem(item)
        if (record.status === 'Completed') record.archived = true
        const { error: insertError } = await supabase
          .from('hoa_items')
          .insert({ ...record, notion_page_id: item.id, user_id: userId })
        if (!insertError) imported++
      }

      setNewCount(imported)
      if (imported > 0) onImported?.()
    } catch (err) {
      console.error('Notion HOA sync error:', err)
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }, [userId, syncing, onImported])

  return { sync, syncing, newCount, error }
}
