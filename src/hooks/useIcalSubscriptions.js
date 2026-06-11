import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { parseIcalText } from '../lib/icalParser'

const PROXY = 'https://corsproxy.io/?url='

export function useIcalSubscriptions(userId) {
  const [subscriptions, setSubscriptions] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!userId) return
    supabase.from('ical_subscriptions').select('*').eq('user_id', userId).order('created_at')
      .then(({ data }) => setSubscriptions(data || []))
  }, [userId])

  useEffect(() => {
    if (!subscriptions.length) { setEvents([]); return }
    setLoading(true)
    const errs = {}
    Promise.all(subscriptions.map(async (sub) => {
      try {
        const res = await fetch(PROXY + encodeURIComponent(sub.url))
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        const parsed = parseIcalText(text)
        return parsed.map((e, idx) => ({
          ...e,
          id: `ical_${sub.id}_${idx}`,
          color: sub.color,
          source: 'ical',
          calendarName: sub.name,
          title: e.title,
          startLabel: new Date(e.startIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endLabel: new Date(e.endIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hour: new Date(e.startIso).getHours(),
        }))
      } catch (err) {
        errs[sub.id] = err.message
        return []
      }
    })).then((results) => {
      setEvents(results.flat())
      setErrors(errs)
      setLoading(false)
    })
  }, [subscriptions])

  async function addSub(url, name, color) {
    const { data } = await supabase.from('ical_subscriptions')
      .insert({ url, name, color, user_id: userId }).select().single()
    if (data) setSubscriptions(prev => [...prev, data])
  }

  async function deleteSub(id) {
    await supabase.from('ical_subscriptions').delete().eq('id', id)
    setSubscriptions(prev => prev.filter(s => s.id !== id))
  }

  return { subscriptions, events, loading, errors, addSub, deleteSub }
}
