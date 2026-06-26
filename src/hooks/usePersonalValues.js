import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePersonalValues(userId) {
  const [values, setValues] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('personal_values')
      .select('*')
      .eq('user_id', userId)
      .order('created_at')
      .then(({ data }) => setValues(data || []))
  }, [userId])

  async function addValue(name) {
    const { data } = await supabase
      .from('personal_values')
      .insert({ user_id: userId, name, color: 'blue', description: '' })
      .select().single()
    if (data) setValues(prev => [...prev, data])
    return data
  }

  async function updateValue(id, fields) {
    await supabase.from('personal_values').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id)
    setValues(prev => prev.map(v => v.id === id ? { ...v, ...fields } : v))
  }

  async function deleteValue(id) {
    await supabase.from('personal_values').delete().eq('id', id)
    setValues(prev => prev.filter(v => v.id !== id))
  }

  return { values, addValue, updateValue, deleteValue }
}
