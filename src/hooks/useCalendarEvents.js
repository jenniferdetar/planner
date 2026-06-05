import { useState, useEffect } from 'react'
import { fetchCalendarEvents, eventToTimeBlock } from '../lib/googleCalendar'

export function useCalendarEvents(providerToken, startDate, endDate) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!providerToken || !startDate || !endDate) {
      setEvents([])
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

  return { events, loading, error }
}
