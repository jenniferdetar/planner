import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fetchCalendarEvents, eventToTimeBlock, CalendarTimeBlock } from '../lib/googleCalendar'

const TOKEN_KEY = 'gcal_provider_token'

export function useCalendarEvents(
  providerToken: string | null | undefined,
  startDate: Date | null,
  endDate: Date | null,
  onAuthExpired?: () => void
) {
  const [events, setEvents] = useState<CalendarTimeBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!providerToken || !startDate || !endDate) {
      setEvents([])
      if (!providerToken) setError('GOOGLE_AUTH_EXPIRED')
      return
    }

    setLoading(true)
    setError(null)

    async function load(token: string) {
      try {
        const raw = await fetchCalendarEvents(token, startDate!, endDate!)
        setEvents(raw.map(eventToTimeBlock))
        setLoading(false)
      } catch (err: any) {
        if (err.message === 'GOOGLE_AUTH_EXPIRED') {
          // Try refreshing session once before giving up
          const { data } = await supabase.auth.refreshSession()
          const freshToken = data?.session?.provider_token
          if (freshToken) {
            localStorage.setItem(TOKEN_KEY, freshToken)
            try {
              const raw = await fetchCalendarEvents(freshToken, startDate!, endDate!)
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
