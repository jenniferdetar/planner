import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Simple per-user JSON documents for the Notes, Journal and Meetings pages.
// They live in the existing `finance_docs` table (see supabase/finance_docs.sql),
// which is a generic (user, collection, doc_id) → JSON store, each page using
// its own collection name, so no new table has to be created.
const TABLE = 'finance_docs'

export function newDocId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

export function usePlannerDocs(userId, collection) {
  const [docs, setDocs] = useState([])
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    if (!userId) { setLoaded(true); return }
    const { data, error } = await supabase
      .from(TABLE)
      .select('doc_id, data, updated_at')
      .eq('user_id', userId)
      .eq('collection', collection)
    if (error) console.warn(`${collection} load failed:`, error)
    setDocs((data || []).map(r => ({ ...r.data, id: r.doc_id, updatedAt: r.updated_at })))
    setLoaded(true)
  }, [userId, collection])

  useEffect(() => { load() }, [load])

  // Insert or replace one document (optimistic; reloads on failure).
  async function save(doc) {
    const id = doc.id || newDocId()
    const updatedAt = new Date().toISOString()
    const { id: _id, updatedAt: _u, ...data } = doc
    setDocs(prev => [...prev.filter(d => d.id !== id), { ...data, id, updatedAt }])
    if (!userId) return id
    const { error } = await supabase.from(TABLE).upsert(
      { user_id: userId, collection, doc_id: id, data, updated_at: updatedAt },
      { onConflict: 'user_id,collection,doc_id' }
    )
    if (error) { console.warn(`${collection} save failed:`, error); load() }
    return id
  }

  async function remove(id) {
    setDocs(prev => prev.filter(d => d.id !== id))
    if (!userId) return
    const { error } = await supabase.from(TABLE).delete()
      .eq('user_id', userId).eq('collection', collection).eq('doc_id', id)
    if (error) { console.warn(`${collection} delete failed:`, error); load() }
  }

  return { docs, loaded, save, remove }
}

// Save-as-you-type: queue the latest version of a document and write it once
// typing pauses. flush() writes anything still waiting (call it before
// switching documents); it also runs when the page closes.
export function useDebouncedSave(save, delay = 500) {
  const timer = useRef(null)
  const pending = useRef(null)
  const saveRef = useRef(save)
  saveRef.current = save

  const flush = useCallback(() => {
    clearTimeout(timer.current)
    if (pending.current) {
      const doc = pending.current
      pending.current = null
      saveRef.current(doc)
    }
  }, [])
  const queue = useCallback(doc => {
    pending.current = doc
    clearTimeout(timer.current)
    timer.current = setTimeout(flush, delay)
  }, [flush, delay])
  const cancel = useCallback(() => {
    clearTimeout(timer.current)
    pending.current = null
  }, [])

  useEffect(() => flush, [flush])
  return { queue, flush, cancel }
}
