import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchCseaWebformEmails, fetchEmailBody, parseEmailToInteraction } from '../lib/gmailCsea'

export function useGmailCseaSync(providerToken) {
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [newCount, setNewCount] = useState(null)

  const sync = useCallback(async () => {
    if (!providerToken || syncing) return
    setSyncing(true)
    setNewCount(null)

    try {
      const messages = await fetchCseaWebformEmails(providerToken)
      if (!messages.length) { setLastSynced(new Date()); setSyncing(false); setNewCount(0); return }

      // Get already-imported message IDs
      const ids = messages.map(m => m.id)
      const { data: existing } = await supabase
        .from('member_interactions')
        .select('gmail_message_id')
        .in('gmail_message_id', ids)
      const existingIds = new Set((existing || []).map(r => r.gmail_message_id))

      const toImport = messages.filter(m => !existingIds.has(m.id))
      let imported = 0

      for (const msg of toImport) {
        const full = await fetchEmailBody(providerToken, msg.id)
        const record = parseEmailToInteraction(full)
        if (!record) continue
        const { error } = await supabase.from('member_interactions').insert(record)
        if (!error) imported++
      }

      setNewCount(imported)
      setLastSynced(new Date())
    } catch (err) {
      console.error('Gmail CSEA sync error:', err)
    } finally {
      setSyncing(false)
    }
  }, [providerToken, syncing])

  return { sync, syncing, lastSynced, newCount }
}
