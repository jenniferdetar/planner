import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Roster of union members for the active chapter.
export function useMembers(orgId) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!orgId) {
      setMembers([])
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('org_id', orgId)
      .order('last_name', { ascending: true })
    setMembers(data || [])
    setLoading(false)
  }, [orgId])

  useEffect(() => {
    load()
  }, [load])

  async function addMember(fields) {
    const { data } = await supabase
      .from('members')
      .insert({ ...fields, org_id: orgId })
      .select()
      .single()
    if (data) setMembers((prev) => [...prev, data].sort((a, b) => a.last_name.localeCompare(b.last_name)))
    return data
  }

  async function updateMember(id, patch) {
    const { data } = await supabase
      .from('members')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (data) setMembers((prev) => prev.map((m) => (m.id === id ? data : m)))
  }

  async function deleteMember(id) {
    await supabase.from('members').delete().eq('id', id)
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  return { members, loading, addMember, updateMember, deleteMember }
}
