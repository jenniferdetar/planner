import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useYahooBookSync(userId, onImported) {
  const [syncing, setSyncing] = useState(false)
  const [newCount, setNewCount] = useState(null)
  const [error, setError] = useState(null)

  const sync = useCallback(async () => {
    if (syncing) return
    setSyncing(true)
    setNewCount(null)
    setError(null)

    try {
      const res = await fetch('/api/yahoo-books', { method: 'POST', signal: AbortSignal.timeout(35000) })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Yahoo Books sync error ${res.status}`)
      }
      const data = await res.json()
      const orders = data.orders || []
      if (!orders.length) { setNewCount(0); setSyncing(false); return }

      const orderUids = orders.map(o => o.id)
      const { data: existing } = await supabase
        .from('library_books')
        .select('yahoo_order_uid')
        .eq('user_id', userId)
        .in('yahoo_order_uid', orderUids)
      const existingUids = new Set((existing || []).map(r => r.yahoo_order_uid))

      let imported = 0
      for (const order of orders) {
        if (existingUids.has(order.id)) continue
        for (const item of order.items) {
          if (!item.title) continue
          const notes = `Ordered from Barnes & Noble${order.date ? ` on ${order.date.split('T')[0]}` : ''}${order.orderTotal ? ` — $${order.orderTotal}` : ''}`
          const { error: insertError } = await supabase.from('library_books').insert({
            title: item.title,
            status: 'want-to-read',
            notes,
            user_id: userId,
            yahoo_order_uid: order.id,
          })
          if (!insertError) imported++
        }
      }

      setNewCount(imported)
      if (imported > 0) onImported?.()
    } catch (err) {
      console.error('Yahoo Books sync error:', err)
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }, [syncing, userId, onImported])

  return { sync, syncing, newCount, error }
}
