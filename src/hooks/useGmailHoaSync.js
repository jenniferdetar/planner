import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { emailToHoaItem } from '../lib/hoaEmail'
import { fetchHoaElevatorEmails, fetchGmailHoaMessage, gmailMessageToEmail } from '../lib/gmailHoa'

export function useGmailHoaSync(userId, providerToken, onImported) {
  const [syncing, setSyncing] = useState(false)
  const [newCount, setNewCount] = useState(null)
  const [error, setError] = useState(null)

  const sync = useCallback(async () => {
    if (!providerToken || syncing) return
    setSyncing(true)
    setNewCount(null)
    setError(null)

    try {
      const messages = await fetchHoaElevatorEmails(providerToken)
      if (!messages.length) { setNewCount(0); setSyncing(false); return }

      const ids = messages.map(m => m.id)
      const { data: existing } = await supabase
        .from('hoa_items')
        .select('gmail_message_id')
        .in('gmail_message_id', ids)
        .eq('user_id', userId)
      const existingIds = new Set((existing || []).map(r => r.gmail_message_id))

      const toImport = messages.filter(m => !existingIds.has(m.id))
      let imported = 0

      for (const msg of toImport) {
        const full = await fetchGmailHoaMessage(providerToken, msg.id)
        const record = emailToHoaItem(gmailMessageToEmail(full))
        const { error: insertError } = await supabase
          .from('hoa_items')
          .insert({ ...record, gmail_message_id: msg.id, user_id: userId })
        if (!insertError) imported++
      }

      setNewCount(imported)
      if (imported > 0) onImported?.()
    } catch (err) {
      console.error('Gmail HOA sync error:', err)
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }, [providerToken, syncing, userId, onImported])

  return { sync, syncing, newCount, error }
}
