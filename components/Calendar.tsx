'use client'

import React, { useState, useEffect } from 'react'
import { startOfGrid, toKey, expandPlannerForMonth, classifyEvent, styleMap } from '@/lib/calendar-utils'

export default function Calendar() {
  const [current, setCurrent] = useState(new Date())
  const [planner, setPlanner] = useState<any[]>([])
  const [eventsByDate, setEventsByDate] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/data/calendar-data.json')
        const data = await res.json()
        setPlanner(data.recurring || [])
        setEventsByDate(data.byDate || {})
      } catch (err) {
        console.error('Failed to load calendar data', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const year = current.getFullYear()
  const month = current.getMonth()
  const gridStart = startOfGrid(current)
  const plannerMonth = expandPlannerForMonth(planner, year, month)

  const getEventsForDate = (date: Date) => {
    const key = toKey(date)
    const out: any[] = []
    const seen = new Set()

    if (eventsByDate[key]) {
      eventsByDate[key].forEach((entry: any) => {
        const item = typeof entry === 'string' ? { title: entry, category: '' } : entry
        out.push(item)
      })
    }

    if (plannerMonth[key]) {
      out.push(...plannerMonth[key])
    }

    return out.filter(item => {
      const normalizedTitle = (item.title || '').trim().toLowerCase().replace(/\s+/g, ' ')
      const seenKey = `${normalizedTitle}|${(item.category || '').trim().toLowerCase()}`
      if (seen.has(seenKey)) return false
      seen.add(seenKey)
      return true
    })
  }

  const shiftMonth = (offset: number) => {
    setCurrent(new Date(year, month + offset, 1))
  }

  if (loading) return <div>Loading calendar...</div>

  const weeks = []
  for (let w = 0; w < 6; w++) {
    const days = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(gridStart)
      date.setDate(gridStart.getDate() + w * 7 + d)
      days.push(date)
    }
    weeks.push(days)
  }

  return (
    <>
      <section className="calendar-controls">
        <div className="calendar-nav">
          <button onClick={() => shiftMonth(-1)} className="calendar-btn">
            <span>&#9664; Previous</span>
          </button>
          <h2 className="calendar-month-label">
            {current.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => shiftMonth(1)} className="calendar-btn">
            <span>Next &#9654;</span>
          </button>
        </div>
      </section>
      <section className="calendar-section">
        <table className="calendar-table">
          <thead>
            <tr className="calendar-header-row">
              <th className="calendar-header">Sunday</th>
              <th className="calendar-header">Monday</th>
              <th className="calendar-header">Tuesday</th>
              <th className="calendar-header">Wednesday</th>
              <th className="calendar-header">Thursday</th>
              <th className="calendar-header">Friday</th>
              <th className="calendar-header">Saturday</th>
            </tr>
          </thead>
          <tbody className="calendar-body">
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((date, di) => {
                  const inMonth = date.getMonth() === month
                  const events = getEventsForDate(date)
                  return (
                    <td key={di} className={`calendar-cell ${!inMonth ? 'calendar-other-month' : ''}`}>
                      <div className="calendar-day-number">{date.getDate()}</div>
                      <div className="calendar-events">
                        {events.map((event, ei) => {
                          const type = classifyEvent(event)
                          const style = styleMap[type] || styleMap.default
                          return (
                            <div
                              key={ei}
                              className="calendar-event"
                              style={{
                                backgroundColor: style.bg,
                                color: style.text,
                                borderColor: style.border
                              }}
                            >
                              {event.title === "New Year's Day" ? (
                                <span className="calendar-event-text calendar-event-small">
                                  New Year's<br />Day
                                </span>
                              ) : (
                                event.title
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
