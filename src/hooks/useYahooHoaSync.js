import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { summarizeEmailBody } from '../lib/emailSummary'

function emailToHoaItem(msg) {
  const subject = (msg.subject || '').trim()
  const body = (msg.text || '').trim()
  const date = msg.date ? msg.date.split('T')[0] : new Date().toISOString().split('T')[0]

  // Guess category from subject/body keywords
  const text = (subject + ' ' + body).toLowerCase()
  let category = 'General'
  if (/mainten|repair|landscap|pool|roof|plumb|electric|fence|gate|paint|roof|hvac/i.test(text)) category = 'Maintenance'
  else if (/financ|budget|dues|assessment|payment|invoice|fund|reserve|expense|income|cost/i.test(text)) category = 'Financials'
  else if (/insur/i.test(text)) category = 'Insurance'
  else if (/legal|attorney|lawsuit|violation|lien|rule|bylaw|enforce/i.test(text)) category = 'Legal'

  return {
    category,
    title: subject || '(no subject)',
    notes: summarizeEmailBody(body) || null,
    priority: 'Medium',
    status: 'Not Started',
    item_date: date,
    yahoo_uid: msg.id,
  }
}

export function useYahooHoaSync(userId, onImported) {
  const [syncing, setSyncing] = useState(false)
  const [newCount, setNewCount] = useState(null)
  const [error, setError] = useState(null)

  const sync = useCallback(async () => {
    if (syncing) return
    setSyncing(true)
    setNewCount(null)
    setError(null)

    try {
      const res = await fetch('/api/yahoo-hoa', { method: 'POST', signal: AbortSignal.timeout(35000) })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Yahoo HOA sync error ${res.status}`)
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
          .insert({ ...record, user_id: userId })
        if (!insertError) imported++
      }

      setNewCount(imported)
      if (imported > 0) onImported?.()
    } catch (err) {
      console.error('Yahoo HOA sync error:', err)
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }, [syncing, userId, onImported])

  return { sync, syncing, newCount, error }
}
