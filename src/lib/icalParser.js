export function parseIcalText(text) {
  const events = []
  const blocks = text.split('BEGIN:VEVENT')
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i]
    const get = (key) => {
      const m = block.match(new RegExp(`${key}[^:]*:([^\\r\\n]+)`))
      return m ? m[1].trim() : null
    }
    const summary = get('SUMMARY') || '(No title)'
    const dtstart = get('DTSTART')
    const dtend = get('DTEND')
    if (!dtstart) continue
    if (/^\d{8}$/.test(dtstart)) continue // skip all-day
    const parseD = (s) => {
      if (!s) return null
      return new Date(
        s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6,8)+'T'+
        s.slice(9,11)+':'+s.slice(11,13)+':'+s.slice(13,15)+(s.endsWith('Z')?'Z':'')
      )
    }
    const start = parseD(dtstart)
    const end = parseD(dtend)
    if (!start || !end || isNaN(start)) continue
    const pad = (n) => String(n).padStart(2,'0')
    const date = `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`
    events.push({
      title: summary,
      date,
      start_time: `${pad(start.getHours())}:${pad(start.getMinutes())}:00`,
      end_time: `${pad(end.getHours())}:${pad(end.getMinutes())}:00`,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
    })
  }
  return events
}
