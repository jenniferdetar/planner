import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchMessageList, fetchMessage, markRead, archiveMessage } from '../lib/gmail'

const POLL_INTERVAL = 2 * 60 * 1000 // 2 minutes

export function useGmail(providerToken) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [authExpired, setAuthExpired] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  const load = useCallback(async (query = 'in:inbox') => {
    if (!providerToken) { setAuthExpired(true); return }
    setLoading(true)
    setError(null)
    try {
      const list = await fetchMessageList(providerToken, query, 30)
      // Fetch metadata for each message (parallel, cap at 20)
      const top = list.slice(0, 20)
      const fetched = await Promise.all(top.map(m => fetchMessage(providerToken, m.id)))
      setMessages(fetched.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)))
      setAuthExpired(false)
    } catch (err) {
      if (err.message === 'GMAIL_AUTH_EXPIRED') setAuthExpired(true)
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [providerToken])

  useEffect(() => {
    if (!providerToken) { setAuthExpired(true); return }
    load()
    timerRef.current = setInterval(() => load(), POLL_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [providerToken, load])

  async function doMarkRead(id) {
    if (!providerToken) return
    await markRead(providerToken, id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, unread: false } : m))
  }

  async function doArchive(id) {
    if (!providerToken) return
    await archiveMessage(providerToken, id)
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  return { messages, loading, authExpired, error, reload: load, markRead: doMarkRead, archive: doArchive }
}
