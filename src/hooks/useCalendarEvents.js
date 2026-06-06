import { useState, useEffect } from 'react'
import { fetchCalendarEvents, eventToTimeBlock } from '../lib/googleCalendar'

export function useCalendarEvents(providerToken, startDate, endDate) {
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
      })
  }, [providerToken, startDate?.toDateString(), endDate?.toDateString()])

  const authExpired = error === 'GOOGLE_AUTH_EXPIRED'
  return { events, loading, error, authExpired }
}
