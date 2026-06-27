import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRoles(userId) {
  const [roles, setRoles] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('roles')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order')
      .order('created_at')
      .then(({ data }) => setRoles(data || []))
  }, [userId])

  async function addRole(name) {
    const { data } = await supabase
      .from('roles')
      .insert({ user_id: userId, name, purpose: '', sort_order: roles.length })
      .select().single()
    if (data) setRoles(prev => [...prev, data])
    return data
  }

  async function updateRole(id, fields) {
    await supabase
      .from('roles')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...fields } : r))
  }

  async function deleteRole(id) {
    await supabase.from('roles').delete().eq('id', id)
    setRoles(prev => prev.filter(r => r.id !== id))
  }

  return { roles, addRole, updateRole, deleteRole }
}
