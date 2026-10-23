import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Worksites/buildings the chapter represents.
export function useWorksites(orgId) {
  const [worksites, setWorksites] = useState([])

  const load = useCallback(async () => {
    if (!orgId) {
      setWorksites([])
      return
    }
    const { data } = await supabase
      .from('worksites')
      .select('*')
      .eq('org_id', orgId)
      .order('name', { ascending: true })
    setWorksites(data || [])
  }, [orgId])

  useEffect(() => {
    load()
  }, [load])

  async function addWorksite(name) {
    const { data } = await supabase
      .from('worksites')
      .insert({ name, org_id: orgId })
      .select()
      .single()
    if (data) setWorksites((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  async function deleteWorksite(id) {
    await supabase.from('worksites').delete().eq('id', id)
    setWorksites((prev) => prev.filter((w) => w.id !== id))
  }

  return { worksites, addWorksite, deleteWorksite }
}
