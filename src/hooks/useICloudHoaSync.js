import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { emailToHoaItem } from '../lib/hoaEmail'

export function useICloudHoaSync(userId, onImported) {
  const [syncing, setSyncing] = useState(false)
  const [newCount, setNewCount] = useState(null)
  const [error, setError] = useState(null)

  const sync = useCallback(async () => {
    if (syncing) return
    setSyncing(true)
    setNewCount(null)
    setError(null)

    try {
      const res = await fetch('/api/icloud-hoa', { method: 'POST', signal: AbortSignal.timeout(35000) })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `iCloud HOA sync error ${res.status}`)
      }
      const data = await res.json()
      const messages = data.messages || []

      if (!messages.length) { setNewCount(0); setSyncing(false); return }

      const uids = messages.map(m => m.id)
      const { data: existing } = await supabase
        .from('hoa_items')
        .select('yahoo_uid')
        .in('yahoo_uid', uids)
        .eq('user_id', userId)
      const existingUids = new Set((existing || []).map(r => r.yahoo_uid))

      const toImport = messages.filter(m => !existingUids.has(m.id))
      let imported = 0

      for (const msg of toImport) {
        const record = emailToHoaItem(msg)
        const { error: insertError } = await supabase
          .from('hoa_items')
          .insert({ ...record, yahoo_uid: msg.id, user_id: userId })
        if (!insertError) imported++
      }

      setNewCount(imported)
      if (imported > 0) onImported?.()
    } catch (err) {
      console.error('iCloud HOA sync error:', err)
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }, [syncing, userId, onImported])

  return { sync, syncing, newCount, error }
}
