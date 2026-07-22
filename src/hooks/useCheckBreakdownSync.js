import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const TOKEN_KEY = 'gcal_provider_token'

function normalizeName(name) {
  return (name || '').trim().toLowerCase()
}

// Pulls the "Reference Sheet" tab from the Check Breakdown spreadsheet in
// Google Drive (via /api/check-breakdown, which downloads and parses the
// .xlsx server-side) and reconciles it into budget_reference_items. Matching
// is by name so an item whose section changed in the sheet is updated in
// place (moved) rather than duplicated. Amounts and sections always follow
// the sheet — it's the single source of truth.
export function useCheckBreakdownSync(userId, providerToken, onImported) {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState(null) // { updated, inserted }
  const [error, setError] = useState(null)

  const sync = useCallback(async () => {
    if (!userId || syncing) return
    setSyncing(true)
    setResult(null)
    setError(null)

    async function fetchItems(token) {
      const res = await fetch('/api/check-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
        signal: AbortSignal.timeout(35000),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const err = new Error(body.error || `Check Breakdown sync failed (${res.status})`)
        err.status = res.status
        throw err
      }
      return (await res.json()).items || []
    }

    try {
      let token = providerToken
      if (!token) throw new Error('Sign in with Google first — Drive access is needed to read the sheet.')

      let items
      try {
        items = await fetchItems(token)
      } catch (err) {
        // One refresh attempt if the Google token expired
        if (err.status === 401) {
          const { data } = await supabase.auth.refreshSession()
          token = data?.session?.provider_token
          if (token) {
            localStorage.setItem(TOKEN_KEY, token)
            items = await fetchItems(token)
          } else {
            throw new Error('Your Google sign-in expired. Sign out and back in, then try again.')
          }
        } else {
          throw err
        }
      }

      if (!items.length) {
        setResult({ updated: 0, inserted: 0 })
        return
      }

      const { data: existing } = await supabase
        .from('budget_reference_items')
        .select('id, section, name, default_amount')
        .eq('user_id', userId)
      const byName = new Map((existing || []).map((r) => [normalizeName(r.name), r]))

      let updated = 0
      let inserted = 0
      for (const item of items) {
        const cur = byName.get(normalizeName(item.name))
        if (cur) {
          if (
            cur.section !== item.section ||
            Number(cur.default_amount) !== Number(item.defaultAmount) ||
            (cur.default_amount == null) !== (item.defaultAmount == null)
          ) {
            const { error: e } = await supabase
              .from('budget_reference_items')
              .update({ section: item.section, default_amount: item.defaultAmount })
              .eq('id', cur.id)
            if (!e) updated++
          }
        } else {
          const { error: e } = await supabase
            .from('budget_reference_items')
            .insert({ user_id: userId, section: item.section, name: item.name, default_amount: item.defaultAmount })
          if (!e) inserted++
        }
      }

      setResult({ updated, inserted })
      if (updated + inserted > 0) onImported?.()
    } catch (err) {
      console.error('Check Breakdown sync error:', err)
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }, [userId, providerToken, syncing, onImported])

  return { sync, syncing, result, error }
}
