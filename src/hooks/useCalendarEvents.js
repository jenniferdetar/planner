import { useState, useEffect } from 'react'
import { fetchCalendarEvents, eventToTimeBlock } from '../lib/googleCalendar'

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

    fetchCalendarEvents(providerToken, startDate, endDate)
      .then((raw) => {
        setEvents(raw.map(eventToTimeBlock))
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
        if (err.message === 'GOOGLE_AUTH_EXPIRED') {
          onAuthExpired?.()
        }
      })
  }, [providerToken, startDate?.toDateString(), endDate?.toDateString()])

  const authExpired = !providerToken || error === 'GOOGLE_AUTH_EXPIRED'
  return { events, loading, error, authExpired }
}
