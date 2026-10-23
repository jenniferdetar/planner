import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Quick links (contract PDF, benefits portal, state site, ...).
export function useLinks(orgId, userId) {
  const [links, setLinks] = useState([])

  const load = useCallback(async () => {
    if (!orgId) {
      setLinks([])
      return
    }
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: true })
    setLinks(data || [])
  }, [orgId])

  useEffect(() => {
    load()
  }, [load])

  async function addLink({ title, url }) {
    const { data } = await supabase
      .from('links')
      .insert({ org_id: orgId, title, url, created_by: userId })
      .select()
      .single()
    if (data) setLinks((prev) => [...prev, data])
  }

  async function deleteLink(id) {
    await supabase.from('links').delete().eq('id', id)
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  return { links, addLink, deleteLink }
}
