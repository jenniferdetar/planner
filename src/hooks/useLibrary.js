import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchBookCoverUrl } from '../lib/bookCovers'

export const SHELVES = ['Fiction', 'Business', 'Religious', 'Education', 'Self-Help', 'Magazine']

export function useLibrary(userId) {
  const [books, setBooks] = useState([])
  const [coverSync, setCoverSync] = useState({ syncing: false, done: 0, total: 0, found: 0 })

  const reload = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('library_books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    setBooks(data || [])
  }, [userId])

  useEffect(() => { reload() }, [reload])

  const attachCover = useCallback(async (id, title, author) => {
    const coverUrl = await fetchBookCoverUrl(title, author)
    if (!coverUrl) return
    const { data } = await supabase
      .from('library_books')
      .update({ cover_url: coverUrl })
      .eq('id', id).select().single()
    if (data) setBooks(prev => prev.map(b => b.id === id ? data : b))
  }, [])

  const addBook = useCallback(async (title, author, shelf, status = 'want-to-read') => {
    const { data } = await supabase
      .from('library_books')
      .insert({ title, author, shelf, status, user_id: userId })
      .select().single()
    if (data) {
      setBooks(prev => [...prev, data])
      attachCover(data.id, data.title, data.author)
    }
  }, [userId, attachCover])

  const updateStatus = useCallback(async (id, status) => {
    const { data } = await supabase
      .from('library_books')
      .update({ status })
      .eq('id', id).select().single()
    if (data) setBooks(prev => prev.map(b => b.id === id ? data : b))
  }, [])

  const updateChapter = useCallback(async (id, current_chapter) => {
    const ch = Math.max(0, current_chapter)
    const { data } = await supabase
      .from('library_books')
      .update({ current_chapter: ch })
      .eq('id', id).select().single()
    if (data) setBooks(prev => prev.map(b => b.id === id ? data : b))
  }, [])

  const deleteBook = useCallback(async (id) => {
    await supabase.from('library_books').delete().eq('id', id)
    setBooks(prev => prev.filter(b => b.id !== id))
  }, [])

  const importDefaults = useCallback(async (defaultBooks, existingBooks) => {
    // Only insert books not already in the library (match on title+shelf)
    const existing = new Set((existingBooks || []).map(b => `${b.shelf}::${b.title}`))
    const missing = defaultBooks.filter(b => !existing.has(`${b.shelf}::${b.title}`))
    if (!missing.length) return
    const rows = missing.map(b => ({ ...b, user_id: userId }))
    const { data } = await supabase.from('library_books').insert(rows).select()
    if (data) setBooks(prev => [...prev, ...data])
  }, [userId])

  const fetchCovers = useCallback(async () => {
    const targets = books.filter(b => !b.cover_url && b.title)
    if (!targets.length || coverSync.syncing) return
    setCoverSync({ syncing: true, done: 0, total: targets.length, found: 0 })
    let found = 0
    for (let i = 0; i < targets.length; i++) {
      const book = targets[i]
      const coverUrl = await fetchBookCoverUrl(book.title, book.author)
      if (coverUrl) {
        const { data } = await supabase
          .from('library_books')
          .update({ cover_url: coverUrl })
          .eq('id', book.id).select().single()
        if (data) {
          setBooks(prev => prev.map(b => b.id === book.id ? data : b))
          found++
        }
      }
      setCoverSync({ syncing: true, done: i + 1, total: targets.length, found })
      await new Promise(r => setTimeout(r, 120))
    }
    setCoverSync({ syncing: false, done: targets.length, total: targets.length, found })
  }, [books, coverSync.syncing])

  return { books, addBook, updateStatus, updateChapter, deleteBook, importDefaults, reload, coverSync, fetchCovers }
}
