// Calendar IDs from Jennifer's Google account with color coding per calendar
export const CALENDARS = [
  { id: 'jennifermsamples@gmail.com', name: 'Gmail', color: '#1e4d31' },
  { id: '1nqd1n2enc3vmi5q5g2o5ldv7s@group.calendar.google.com', name: 'Family', color: '#2d7a4f' },
  { id: '6r0b19vgn2aq54neum36g6n9og@group.calendar.google.com', name: 'Business', color: '#9b59b6' },
  { id: 'fuhknadjrrm4gtmmq5s1hk035c@group.calendar.google.com', name: 'Client Work', color: '#f0a040' },
  { id: 'aa19a8010c1926c44788de224952b227627ad3bbfb811c3e786bdfb16e1c3814@group.calendar.google.com', name: 'Study & School', color: '#73a882' },
  { id: '0e650fb5ce57cd5b0ceccac50d077ae5571754f61d4584df980426e0e3f0d772@group.calendar.google.com', name: 'CSEA', color: '#e05c5c' },
  { id: 'cdht4hpq2deltvh22q7e2fnd1k@group.calendar.google.com', name: 'Hale Charter', color: '#16a085' },
  { id: 'orvrdj70hcvclief24dfm1lgss@group.calendar.google.com', name: 'HoneyBook', color: '#8e44ad' },
  { id: 'g1j3ll4vrhi55uioh0qjo57bpk@group.calendar.google.com', name: 'Todoist', color: '#db4035' },
  { id: '7a5vu03rc2bt317j42u9c1mtq8@group.calendar.google.com', name: "Jennifer's iPhone", color: '#888' },
  { id: 'c70ql70g6mjbuiv9cbocfbcgp8@group.calendar.google.com', name: 'Facebook Appointments', color: '#1877f2' },
  { id: 'c_f8dd932d5779276dc40addb962d1904160a62cec3d68828cce37a472c9e41b2b@group.calendar.google.com', name: 'LA Fed', color: '#e05c5c' },
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
      if (res.status === 403) {
        // Track 403s separately — widespread 403s across all calendars indicate
        // the token lacks calendar scope (auth/scope problem), not per-calendar permissions
        const e = new Error('FORBIDDEN')
        e.forbidden = true
        throw e
      }
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

  // 401 from any calendar = auth expired
  const authFailed = results.some(r => r.status === 'rejected' && r.reason?.message === 'GOOGLE_AUTH_EXPIRED')
  if (authFailed) throw new Error('GOOGLE_AUTH_EXPIRED')

  // If the majority of calendars returned 403, the token lacks calendar scope — treat as auth expired
  const forbidden = results.filter(r => r.status === 'rejected' && r.reason?.forbidden).length
  if (forbidden >= Math.ceil(CALENDARS.length / 2)) throw new Error('GOOGLE_AUTH_EXPIRED')

  return results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value)
}

export function eventToTimeBlock(event) {
  if (event.allDay) {
    return { ...event, hour: 0, durationMins: 1440, startLabel: null, endLabel: null }
  }
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
