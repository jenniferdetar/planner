import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchICloudCseaEmails, parseICloudEmailToInteraction } from '../lib/icloudMail'

export function useICloudMailSync() {
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
      const messages = await fetchICloudCseaEmails()
      if (!messages.length) { setLastSynced(new Date()); setSyncing(false); setNewCount(0); return }

      const ids = messages.map(m => m.id)
      const { data: existing } = await supabase
        .from('member_interactions')
        .select('yahoo_message_id')
        .in('yahoo_message_id', ids)
      const existingIds = new Set((existing || []).map(r => r.yahoo_message_id))

      const toImport = messages.filter(m => !existingIds.has(m.id))
      let imported = 0

      for (const msg of toImport) {
        const record = parseICloudEmailToInteraction(msg)
        if (!record) continue
        const { error: insertError } = await supabase.from('member_interactions').insert(record)
        if (!insertError) imported++
      }

      setNewCount(imported)
      setLastSynced(new Date())
    } catch (err) {
      console.error('iCloud Mail sync error:', err)
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }, [syncing])

  return { sync, syncing, lastSynced, newCount, error }
}
