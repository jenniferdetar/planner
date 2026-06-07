import './WeekView.css'

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 6am–10pm

function formatHour(h) {
  if (h === 12) return '12p'
  if (h > 12) return `${h - 12}p`
  return `${h}a`
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function startOfWeek(d) {
  const s = new Date(d)
  s.setDate(s.getDate() - s.getDay())
  s.setHours(0, 0, 0, 0)
  return s
}

export default function WeekView({ selectedDate, onDateChange, timeBlocks = [], calendarBlocks = [] }) {
  const today = new Date()
  const weekStart = startOfWeek(selectedDate)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  function prevWeek() {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 7)
    onDateChange(d)
  }

  function nextWeek() {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 7)
    onDateChange(d)
  }

  const allBlocks = [...timeBlocks, ...calendarBlocks]

  // Deduplicate by id
  const seen = new Set()
  const blocks = allBlocks.filter(b => {
    if (seen.has(b.id)) return false
    seen.add(b.id)
    return true
  })

  function blocksForDay(date) {
    const dateStr = toDateStr(date)
    return blocks.filter(b => {
      if (b.startIso) return b.startIso.startsWith(dateStr)
      // Supabase blocks use selectedDate context; match by hour presence + date
      if (b.source === 'supabase') return sameDay(date, selectedDate) // only show supabase blocks on selected day
      return false
    })
  }

  const weekLabel = (() => {
    const s = days[0], e = days[6]
    if (s.getMonth() === e.getMonth()) return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`
    return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()} – ${MONTH_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
  })()

  return (
    <div className="week-view">
      <div className="week-nav">
        <button className="wnav-btn" onClick={prevWeek}>‹</button>
        <span className="week-label">{weekLabel}</span>
        <button className="wnav-btn" onClick={nextWeek}>›</button>
      </div>

      <div className="week-grid">
        {/* Corner */}
        <div className="week-corner" />

        {/* Day headers */}
        {days.map((day, i) => {
          const isToday = sameDay(day, today)
          const isSelected = sameDay(day, selectedDate)
          return (
            <button
              key={i}
              className={`week-day-header ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onDateChange(day)}
            >
              <span className="wdh-name">{DAY_SHORT[day.getDay()]}</span>
              <span className={`wdh-num ${isToday ? 'today-num' : ''}`}>{day.getDate()}</span>
            </button>
          )
        })}

        {/* Hour rows */}
        {HOURS.map(hour => {
          const nowHour = today.getHours()
          return (
            <>
              <div key={`h-${hour}`} className="week-hour-label">
                {formatHour(hour)}
              </div>
              {days.map((day, di) => {
                const isCurrentCell = sameDay(day, today) && nowHour === hour
                const dayBlocks = blocksForDay(day).filter(b => b.hour === hour)
                return (
                  <div
                    key={`${hour}-${di}`}
                    className={`week-cell ${isCurrentCell ? 'now-cell' : ''}`}
                    onClick={() => onDateChange(day)}
                  >
                    {dayBlocks.map(block => (
                      <div
                        key={block.id}
                        className="week-block"
                        style={{ background: block.color + '22', borderLeft: `2px solid ${block.color}` }}
                        onClick={e => e.stopPropagation()}
                      >
                        <span className="week-block-text">{block.title || block.text}</span>
                        {block.startLabel && (
                          <span className="week-block-time">{block.startLabel}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </>
          )
        })}
      </div>
    </div>
  )
}
