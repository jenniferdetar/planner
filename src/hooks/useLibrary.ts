import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const SHELVES = ['Fiction', 'Business', 'Religious', 'Education', 'Self-Help', 'Magazine']

export function useLibrary(userId: string | null) {
  const [books, setBooks] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('library_books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setBooks(data || []))
  }, [userId])

  const addBook = useCallback(async (title: string, author: string, shelf: string, status = 'want-to-read') => {
    const { data } = await supabase
      .from('library_books')
      .insert({ title, author, shelf, status, user_id: userId })
      .select().single()
    if (data) setBooks(prev => [...prev, data])
  }, [userId])

  const updateStatus = useCallback(async (id: string, status: string) => {
    const { data } = await supabase
      .from('library_books')
      .update({ status })
      .eq('id', id).select().single()
    if (data) setBooks(prev => prev.map(b => b.id === id ? data : b))
  }, [])

  const deleteBook = useCallback(async (id: string) => {
    await supabase.from('library_books').delete().eq('id', id)
    setBooks(prev => prev.filter(b => b.id !== id))
  }, [])

  const importDefaults = useCallback(async (defaultBooks: any[], existingBooks: any[]) => {
    // Only insert books not already in the library (match on title+shelf)
    const existing = new Set((existingBooks || []).map((b: any) => `${b.shelf}::${b.title}`))
    const missing = defaultBooks.filter((b: any) => !existing.has(`${b.shelf}::${b.title}`))
    if (!missing.length) return
    const rows = missing.map((b: any) => ({ ...b, user_id: userId }))
    const { data } = await supabase.from('library_books').insert(rows).select()
    if (data) setBooks(prev => [...prev, ...data])
  }, [userId])

  return { books, addBook, updateStatus, deleteBook, importDefaults }
}
