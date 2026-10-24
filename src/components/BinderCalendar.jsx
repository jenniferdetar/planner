import { useState, useEffect } from 'react'
import { toDateStr } from '../utils/dateUtils'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// ISO week number of the Thursday in the Sun–Sat row that starts on `sunday`
function weekNumber(sunday) {
  const thu = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + 4)
  const jan4 = new Date(thu.getFullYear(), 0, 4)
  const jan4Thu = new Date(jan4); jan4Thu.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + 3)
  return 1 + Math.round((thu - jan4Thu) / (7 * 86400000))
}

// Month calendar in the Opus One style: month tab with arrows, optional
// week-number column, a dot under days that have something on them.
export default function BinderCalendar({ selectedDate, onSelect, marked, weekNumbers = false, compact = false }) {
  const [view, setView] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  // Follow the selection when it moves to another month
  useEffect(() => {
    setView(v => (v.getFullYear() === selectedDate.getFullYear() && v.getMonth() === selectedDate.getMonth())
      ? v : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  }, [selectedDate])

  const start = new Date(view); start.setDate(1 - view.getDay())
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const rows = Math.ceil((view.getDay() + daysInMonth) / 7)
  const todayStr = toDateStr(new Date())
  const selStr = toDateStr(selectedDate)

  const shift = n => setView(v => new Date(v.getFullYear(), v.getMonth() + n, 1))

  return (
    <div className={`bc${weekNumbers ? ' bc-weeks' : ''}${compact ? ' bc-compact' : ''}`}>
      <div className="bc-head">
        <button type="button" className="bc-nav" onClick={() => shift(-1)} aria-label="Previous month">‹</button>
        <span className="bc-month">{MONTHS[view.getMonth()]} {view.getFullYear()}</span>
        <button type="button" className="bc-nav" onClick={() => shift(1)} aria-label="Next month">›</button>
      </div>
      <div className="bc-grid">
        {weekNumbers && <span className="bc-wk-head" />}
        {DOW.map(d => <span key={d} className="bc-dow">{d}</span>)}
        {Array.from({ length: rows }, (_, r) => {
          const sunday = new Date(start); sunday.setDate(start.getDate() + r * 7)
          return [
            weekNumbers && <span key={`w${r}`} className="bc-wk">{weekNumber(sunday)}</span>,
            ...Array.from({ length: 7 }, (_, c) => {
              const day = new Date(sunday); day.setDate(sunday.getDate() + c)
              const ds = toDateStr(day)
              const out = day.getMonth() !== view.getMonth()
              return (
                <button
                  type="button"
                  key={ds}
                  className={`bc-day${out ? ' out' : ''}${ds === todayStr ? ' today' : ''}${ds === selStr ? ' sel' : ''}`}
                  onClick={() => onSelect(day)}
                  aria-label={day.toDateString()}
                  aria-pressed={ds === selStr}
                >
                  <span className="bc-num">{day.getDate()}</span>
                  {marked?.has(ds) && <span className="bc-dot" />}
                </button>
              )
            }),
          ]
        })}
      </div>
    </div>
  )
}
