import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFamilyTree(userId) {
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('family_members')
      .select('*')
      .eq('user_id', userId)
      .order('generation', { ascending: true })
      .order('sort_order', { ascending: true })
      .then(({ data }) => setMembers(data || []))
  }, [userId])

  const addMember = useCallback(async (fields) => {
    const { data } = await supabase
      .from('family_members')
      .insert({ ...fields, user_id: userId })
      .select().single()
    if (data) setMembers(prev => [...prev, data])
  }, [userId])

  const updateMember = useCallback(async (id, fields) => {
    const { data } = await supabase
      .from('family_members')
      .update(fields)
      .eq('id', id).select().single()
    if (data) setMembers(prev => prev.map(m => m.id === id ? data : m))
  }, [])

  const deleteMember = useCallback(async (id) => {
    await supabase.from('family_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
  }, [])

  const importDefaults = useCallback(async (defaults, existing) => {
    const existingNames = new Set((existing || []).map(m => m.name.toLowerCase()))
    const missing = defaults.filter(m => !existingNames.has(m.name.toLowerCase()))
    if (!missing.length) return
    const rows = missing.map(m => ({ ...m, user_id: userId }))
    const { data } = await supabase.from('family_members').insert(rows).select()
    if (data) setMembers(prev => [...prev, ...data])
  }, [userId])

  return { members, addMember, updateMember, deleteMember, importDefaults }
}
