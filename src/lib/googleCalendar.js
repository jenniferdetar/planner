// Calendar IDs from Jennifer's Google account with color coding per calendar
export const CALENDARS = [
  { id: 'jennifermsamples@gmail.com', name: 'Gmail', color: '#4a90d9' },
  { id: '1nqd1n2enc3vmi5q5g2o5ldv7s@group.calendar.google.com', name: 'Family', color: '#5cb85c' },
  { id: '6r0b19vgn2aq54neum36g6n9og@group.calendar.google.com', name: 'Business', color: '#9b59b6' },
  { id: 'fuhknadjrrm4gtmmq5s1hk035c@group.calendar.google.com', name: 'Client Work', color: '#f0a040' },
  { id: 'aa19a8010c1926c44788de224952b227627ad3bbfb811c3e786bdfb16e1c3814@group.calendar.google.com', name: 'Study & School', color: '#c9a96e' },
  { id: '0e650fb5ce57cd5b0ceccac50d077ae5571754f61d4584df980426e0e3f0d772@group.calendar.google.com', name: 'CSEA', color: '#e05c5c' },
  { id: 'cdht4hpq2deltvh22q7e2fnd1k@group.calendar.google.com', name: 'Hale Charter', color: '#16a085' },
  { id: 'orvrdj70hcvclief24dfm1lgss@group.calendar.google.com', name: 'HoneyBook', color: '#8e44ad' },
]

export async function fetchCalendarEvents(providerToken, startDate, endDate) {
  if (!providerToken) return []

  const timeMin = new Date(startDate)
  timeMin.setHours(0, 0, 0, 0)
  const timeMax = new Date(endDate)
  timeMax.setHours(23, 59, 59, 999)

  const results = await Promise.allSettled(
    CALENDARS.map(async (cal) => {
      const params = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '50',
      })
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?${params}`,
        { headers: { Authorization: `Bearer ${providerToken}` } }
      )
      if (res.status === 401) throw new Error('GOOGLE_AUTH_EXPIRED')
      if (!res.ok) return []
      const data = await res.json()
      return (data.items || []).map((evt) => ({
        id: `gcal_${evt.id}`,
        title: evt.summary || '(No title)',
        startIso: evt.start?.dateTime || evt.start?.date,
        endIso: evt.end?.dateTime || evt.end?.date,
        allDay: !evt.start?.dateTime,
        color: cal.color,
        calendarName: cal.name,
        source: 'google',
      }))
    })
  )

  return results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((e) => !e.allDay)
}

export function eventToTimeBlock(event) {
  const start = new Date(event.startIso)
  const end = new Date(event.endIso)
  return {
    ...event,
    hour: start.getHours(),
    durationMins: Math.round((end - start) / 60000),
    startLabel: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    endLabel: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
}
