import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  fetchCseaWebformEmails, fetchEmailBody, parseEmailToInteraction,
  fetchEmilyRaabEmails, fetchEmailMetadata, parseEmilyRaabEmailToInteraction,
} from '../lib/gmailCsea'

export function useGmailCseaSync(providerToken) {
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [newCount, setNewCount] = useState(null)

  const sync = useCallback(async () => {
    if (!providerToken || syncing) return
    setSyncing(true)
    setNewCount(null)

    try {
      let imported = 0

      // --- Webform submissions ---
      const messages = await fetchCseaWebformEmails(providerToken)
      if (messages.length) {
        const ids = messages.map(m => m.id)
        const { data: existing } = await supabase
          .from('member_interactions')
          .select('gmail_message_id')
          .in('gmail_message_id', ids)
        const existingIds = new Set((existing || []).map(r => r.gmail_message_id))

        for (const msg of messages.filter(m => !existingIds.has(m.id))) {
          const full = await fetchEmailBody(providerToken, msg.id)
          const record = parseEmailToInteraction(full)
          if (!record) continue
          const { error } = await supabase.from('member_interactions').insert(record)
          if (!error) imported++
        }
      }

      // --- Emily Raab emails (from her or CC'd) ---
      const threads = await fetchEmilyRaabEmails(providerToken)
      if (threads.length) {
        const threadIds = threads.map(t => t.threadId)
        const { data: existingThreads } = await supabase
          .from('member_interactions')
          .select('gmail_message_id')
          .in('gmail_message_id', threadIds)
        const existingThreadIds = new Set((existingThreads || []).map(r => r.gmail_message_id))

        for (const { threadId, msgId } of threads.filter(t => !existingThreadIds.has(t.threadId))) {
          try {
            const msg = await fetchEmailMetadata(providerToken, msgId)
            const record = parseEmilyRaabEmailToInteraction(msg, threadId)
            const { error } = await supabase.from('member_interactions').insert(record)
            if (!error) imported++
          } catch (err) {
            console.error('Emily Raab email import error:', err)
          }
        }
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
