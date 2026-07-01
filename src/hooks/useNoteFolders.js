import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useNoteFolders(userId) {
  const [folders, setFolders] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('note_folders')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order')
      .order('created_at')
      .then(({ data }) => setFolders(data || []))
  }, [userId])

  async function addFolder(name, parentId = null) {
    const { data } = await supabase
      .from('note_folders')
      .insert({ user_id: userId, name, parent_id: parentId, sort_order: folders.length })
      .select().single()
    if (data) setFolders(prev => [...prev, data])
    return data
  }

  async function renameFolder(id, name) {
    await supabase.from('note_folders').update({ name }).eq('id', id)
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f))
  }

  async function deleteFolder(id) {
    await supabase.from('note_folders').delete().eq('id', id)
    setFolders(prev => prev.filter(f => f.id !== id))
  }

  return { folders, addFolder, renameFolder, deleteFolder }
}
