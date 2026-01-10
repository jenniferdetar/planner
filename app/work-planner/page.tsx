'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { opusRepository } from '@/lib/repositories/opus-repository'
import { toKey, classifyEvent, styleMap, parseISO, isHoliday } from '@/lib/calendar-utils'
import Link from 'next/link'

// Helper for 30-min slots
function getHourSlots(startHour = 5, endHour = 20, stepMinutes = 30) {
  const slots = []
  const startMinutes = startHour * 60
  const endMinutes = endHour * 60
  for (let m = startMinutes; m <= endMinutes; m += stepMinutes) {
    const hours24 = Math.floor(m / 60)
    const minutes = m % 60
    const hour24 = String(hours24).padStart(2, '0')
    const minsStr = String(minutes).padStart(2, '0')
    const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12
    const ampm = hours24 >= 12 ? 'PM' : 'AM'
    slots.push({
      hour24,
      display: `${hour12}:${minsStr} ${ampm}`,
      time: `${hour24}:${minsStr}`
    })
  }
  return slots
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d
}

export default function WorkPlannerPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [planner, setPlanner] = useState<any[]>([])
  const [eventsByDate, setEventsByDate] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  
  // Local storage for edits/priorities (can be moved to Supabase later)
  const [edits, setEdits] = useState<Record<string, any>>({})
  const [priorities, setPriorities] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadData() {
      try {
        const [recurring, byDate, cloudEdits, cloudPriorities] = await Promise.all([
          opusRepository.getRecurringEvents(),
          opusRepository.getEventsByDate(),
          opusRepository.getWorkPlannerEdits(),
          opusRepository.getUserPriorities()
        ])
        setPlanner(recurring)
        setEventsByDate(byDate)
        
        // Load localStorage data as secondary fallback if cloud is empty
        const savedEdits = JSON.parse(localStorage.getItem('workPlannerEdits') || '{}')
        const savedPriorities = JSON.parse(localStorage.getItem('workPlannerPriorities') || '{}')
        
        setEdits({ ...savedEdits, ...cloudEdits })
        setPriorities({ ...savedPriorities, ...cloudPriorities })
      } catch (err) {
        console.error('Failed to load work planner data', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    })
  }, [weekStart])

  const timeSlots = useMemo(() => getHourSlots(), [])

  const shiftWeek = (offset: number) => {
    const next = new Date(weekStart)
    next.setDate(weekStart.getDate() + offset * 7)
    setWeekStart(next)
  }

  const handlePriorityChange = async (key: string, value: string) => {
    const next = { ...priorities, [key]: value }
    setPriorities(next)
    localStorage.setItem('workPlannerPriorities', JSON.stringify(next))
    try {
      await opusRepository.upsertUserPriority(key, value)
    } catch (err) {
      console.error('Failed to save priority to cloud', err)
    }
  }

  const handleEditChange = async (dateKey: string, slotKey: string, value: string) => {
    const next = { ...edits }
    if (!next[dateKey]) next[dateKey] = {}
    if (value) {
      next[dateKey][slotKey] = value
    } else {
      delete next[dateKey][slotKey]
      if (Object.keys(next[dateKey]).length === 0) delete next[dateKey]
    }
    setEdits(next)
    localStorage.setItem('workPlannerEdits', JSON.stringify(next))
    try {
      await opusRepository.upsertWorkPlannerEdit(dateKey, slotKey, value)
    } catch (err) {
      console.error('Failed to save edit to cloud', err)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading work planner...</div>

  return (
    <div className="work-planner-page">
      <nav className="planner-subpage-nav">
        <Link href="/personal-planner" className="planner-subpage-pill">Personal Planner</Link>
        <Link href="/work-planner" className="planner-subpage-pill active">Work Planner</Link>
      </nav>

      <header className="planner-header">
        <div className="planner-header-bar">
          <div className="planner-header-left">
            <h1>Work Planner</h1>
            <p>Weekly schedule with editable lines</p>
          </div>
          <div className="planner-header-right">
            <div className="planner-header-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      <main className="planner-main work-planner-main">
        <section className="work-controls">
          <div className="week-nav">
            <button onClick={() => shiftWeek(-1)} className="calendar-btn">◀ Previous</button>
            <div className="week-range">
              {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <button onClick={() => shiftWeek(1)} className="calendar-btn">Next ▶</button>
          </div>
        </section>

        <section className="work-priorities">
          <h2 className="section-title">Priorities & Encouragement</h2>
          <div className="priority-grid">
            {['p1', 'p2', 'p3', 'look-forward', 'encourage', 'learn'].map((key) => (
              <div 
                key={key}
                className="priority-cell" 
                contentEditable 
                onBlur={(e) => handlePriorityChange(key, e.currentTarget.textContent || '')}
                suppressContentEditableWarning
              >
                {priorities[key] || (
                  key === 'p1' ? 'Priority #1' :
                  key === 'p2' ? 'Priority #2' :
                  key === 'p3' ? 'Priority #3' :
                  key === 'look-forward' ? "One thing I'm looking forward to" :
                  key === 'encourage' ? "Someone I can encourage" :
                  "Something I'd like to read or listen to"
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="work-grid-card">
          <div className="work-grid-header">
            <div className="work-grid-title">Editable Week</div>
            <div className="work-grid-subtitle">Times auto-filled from events; click any line to edit</div>
          </div>
          
          <div className="work-grid">
            <div className="work-grid-row header">
              <div className="work-time-col">Time</div>
              {weekDates.map((date) => (
                <div key={date.toISOString()} className={`work-day-col ${date.getDay() === 0 || date.getDay() === 6 ? 'weekend' : ''}`}>
                  <div className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="day-date">{date.getDate()}</div>
                </div>
              ))}
            </div>

            {timeSlots.map((slot) => (
              <div key={slot.time} className="work-grid-row">
                <div className="work-time-col">{slot.display}</div>
                {weekDates.map((date) => {
                  const dateKey = toKey(date)
                  const slotKey = slot.time
                  const userText = edits[dateKey]?.[slotKey] || ''
                  
                  // This is a simplified version of event mapping - real logic would be more complex
                  const events = (eventsByDate[dateKey] || []).filter(ev => {
                    if (!ev.time) return false
                    // Handle time matching logic here
                    return ev.time.includes(slot.display.split(' ')[0]) // Very basic match
                  })

                  return (
                    <div key={dateKey} className="work-day-col">
                      <div 
                        className="work-cell" 
                        contentEditable
                        onBlur={(e) => handleEditChange(dateKey, slotKey, e.currentTarget.textContent || '')}
                        suppressContentEditableWarning
                      >
                        {userText || events.map(e => e.title).join(', ')}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="planner-footer">
        Work Planner • Editable weekly view
      </footer>
    </div>
  )
}
