import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const ATTENDANCE_MEMBERS = [
  'Pernin, Patricia',
  'Ratner, Bonnie',
  'Rodriguez, Eberardo',
  'Estell, Maikai',
  'Gaudet, Rene',
  'Maccarone, Stephen',
]

export function useIcaapAttendance(userId) {
  const [records, setRecords] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('icaap_attendance')
      .select('*')
      .eq('user_id', userId)
      .order('meeting_date', { ascending: false })
      .then(({ data }) => setRecords(data || []))
  }, [userId])

  async function upsertAttendance(meeting_date, member_name, status, notes) {
    const existing = records.find(
      r => r.meeting_date === meeting_date && r.member_name === member_name
    )
    if (existing) {
      const { data } = await supabase
        .from('icaap_attendance')
        .update({ status, notes: notes ?? existing.notes, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      if (data) setRecords(prev => prev.map(r => r.id === existing.id ? data : r))
    } else {
      const { data } = await supabase
        .from('icaap_attendance')
        .insert({ user_id: userId, meeting_date, member_name, status, notes: notes || null })
        .select()
        .single()
      if (data) setRecords(prev => [...prev, data])
    }
  }

  async function updateNotes(meeting_date, member_name, notes) {
    const existing = records.find(
      r => r.meeting_date === meeting_date && r.member_name === member_name
    )
    if (existing) {
      const { data } = await supabase
        .from('icaap_attendance')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      if (data) setRecords(prev => prev.map(r => r.id === existing.id ? data : r))
    } else {
      // Create with default Present status
      await upsertAttendance(meeting_date, member_name, 'Present', notes)
    }
  }

  return { records, upsertAttendance, updateNotes }
}
