import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  fetchCseaWebformEmails,
  fetchEmailBody,
  parseEmailToInteraction,
  fetchCseaCorrespondenceThreads,
  fetchThread,
  parseThreadToInteraction,
} from '../lib/gmailCsea'

export function useGmailCseaSync(providerToken, selfEmail) {
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [newCount, setNewCount] = useState(null)

  const sync = useCallback(async () => {
    if (!providerToken || syncing) return
    setSyncing(true)
    setNewCount(null)

    try {
      const [messages, threads] = await Promise.all([
        fetchCseaWebformEmails(providerToken),
        fetchCseaCorrespondenceThreads(providerToken),
      ])

      // Get already-imported ids (webform messages and correspondence threads share the same column)
      const ids = [...messages.map(m => m.id), ...threads.map(t => t.id)]
      const existingIds = new Set()
      if (ids.length) {
        const { data: existing } = await supabase
          .from('member_interactions')
          .select('gmail_message_id')
          .in('gmail_message_id', ids)
        for (const r of (existing || [])) existingIds.add(r.gmail_message_id)
      }

      let imported = 0

      for (const msg of messages.filter(m => !existingIds.has(m.id))) {
        const full = await fetchEmailBody(providerToken, msg.id)
        const record = parseEmailToInteraction(full)
        if (!record) continue
        const { error } = await supabase.from('member_interactions').insert(record)
        if (!error) imported++
      }

      for (const t of threads.filter(t => !existingIds.has(t.id))) {
        const full = await fetchThread(providerToken, t.id)
        const record = parseThreadToInteraction(full, selfEmail)
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
  }, [providerToken, syncing, selfEmail])

  return { sync, syncing, lastSynced, newCount }
}
