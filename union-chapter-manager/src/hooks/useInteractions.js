import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Logged contacts/conversations with members for the active chapter.
export function useInteractions(orgId, userId) {
  const [interactions, setInteractions] = useState([])
  const [showArchived, setShowArchived] = useState(false)

  const load = useCallback(async () => {
    if (!orgId) {
      setInteractions([])
      return
    }
    let q = supabase
      .from('interactions')
      .select('*')
      .eq('org_id', orgId)
      .order('date_spoke', { ascending: false })
    if (!showArchived) q = q.eq('archived', false)
    const { data } = await q
    setInteractions(data || [])
  }, [orgId, showArchived])

  useEffect(() => {
    load()
  }, [load])

  async function addInteraction(fields) {
    const { data } = await supabase
      .from('interactions')
      .insert({
        ...fields,
        org_id: orgId,
        created_by: userId,
        date_spoke: fields.date_spoke || new Date().toISOString().split('T')[0],
      })
      .select()
      .single()
    if (data) setInteractions((prev) => [data, ...prev])
    return data
  }

  async function updateInteraction(id, patch) {
    const { data } = await supabase
      .from('interactions')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (data) {
      setInteractions((prev) => {
        // Drop from the list if it was just archived and we're hiding archived.
        if (!showArchived && data.archived) return prev.filter((i) => i.id !== id)
        return prev.map((i) => (i.id === id ? data : i))
      })
    }
  }

  async function deleteInteraction(id) {
    await supabase.from('interactions').delete().eq('id', id)
    setInteractions((prev) => prev.filter((i) => i.id !== id))
  }

  return {
    interactions,
    showArchived,
    setShowArchived,
    addInteraction,
    updateInteraction,
    deleteInteraction,
  }
}
