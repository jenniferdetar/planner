import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fetchCalendarEvents, eventToTimeBlock } from '../lib/googleCalendar'

const TOKEN_KEY = 'gcal_provider_token'

export function useCalendarEvents(providerToken, startDate, endDate, onAuthExpired) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!providerToken || !startDate || !endDate) {
      setEvents([])
      if (!providerToken) setError('GOOGLE_AUTH_EXPIRED')
      return
    }

    setLoading(true)
    setError(null)

    async function load(token) {
      try {
        const raw = await fetchCalendarEvents(token, startDate, endDate)
        setEvents(raw.map(eventToTimeBlock))
        setLoading(false)
      } catch (err) {
        if (err.message === 'GOOGLE_AUTH_EXPIRED') {
          // Try refreshing session once before giving up
          const { data } = await supabase.auth.refreshSession()
          const freshToken = data?.session?.provider_token
          if (freshToken) {
            localStorage.setItem(TOKEN_KEY, freshToken)
            try {
              const raw = await fetchCalendarEvents(freshToken, startDate, endDate)
              setEvents(raw.map(eventToTimeBlock))
              setLoading(false)
              return
            } catch (_) {}
          }
          setError('GOOGLE_AUTH_EXPIRED')
          setLoading(false)
          onAuthExpired?.()
        } else {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    load(providerToken)
  }, [providerToken, startDate?.toDateString(), endDate?.toDateString()])

  const authExpired = !providerToken || error === 'GOOGLE_AUTH_EXPIRED'
  return { events, loading, error, authExpired }
}
