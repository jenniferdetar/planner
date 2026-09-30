import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Paycheck Ledger storage: every record is a JSON doc in `finance_docs`,
// keyed by (collection, doc_id). See supabase/finance_docs.sql.
const TABLE = 'finance_docs'
const LISTS = ['checks', 'txns', 'debts', 'funds']

function emptyState() {
  return { config: null, checks: [], txns: [], debts: [], funds: [] }
}

function isMissingTable(error) {
  return error?.code === '42P01' || error?.code === 'PGRST205' || /finance_docs/.test(error?.message || '')
}

export function useFinanceLedger(userId) {
  const [docs, setDocs] = useState(emptyState)
  const [loaded, setLoaded] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from(TABLE)
      .select('collection, doc_id, data')
      .eq('user_id', userId)
    if (error) {
      console.warn('finance_docs load failed:', error)
      if (isMissingTable(error)) setNeedsSetup(true)
      setLoaded(true)
      return
    }
    const next = emptyState()
    for (const row of data || []) {
      if (row.collection === 'config' && row.doc_id === 'main') next.config = row.data
      else if (LISTS.includes(row.collection)) next[row.collection].push({ ...row.data, id: row.doc_id })
    }
    setNeedsSetup(false)
    setDocs(next)
    setLoaded(true)
  }, [userId])

  useEffect(() => { load() }, [load])

  function applyLocal(collection, id, data) {
    setDocs(prev => {
      if (collection === 'config') return { ...prev, config: data }
      const list = prev[collection].filter(d => d.id !== id)
      return { ...prev, [collection]: data ? [...list, { ...data, id }] : list }
    })
  }

  // Replace a whole document. Optimistic; reloads from the server on failure.
  async function setDoc(collection, id, data) {
    const { id: _drop, ...clean } = data
    applyLocal(collection, id, clean)
    const { error } = await supabase.from(TABLE).upsert(
      { user_id: userId, collection, doc_id: id, data: clean, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,collection,doc_id' }
    )
    if (error) { console.warn('finance_docs save failed:', error); load(); throw error }
  }

  async function addDoc(collection, data) {
    const id = collection[0] + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    await setDoc(collection, id, data)
    return id
  }

  async function deleteDoc(collection, id) {
    applyLocal(collection, id, null)
    const { error } = await supabase.from(TABLE).delete()
      .eq('user_id', userId).eq('collection', collection).eq('doc_id', id)
    if (error) { console.warn('finance_docs delete failed:', error); load(); throw error }
  }

  return { ...docs, loaded, needsSetup, setDoc, addDoc, deleteDoc, reload: load }
}
