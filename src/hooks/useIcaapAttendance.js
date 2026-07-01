import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { isBeforeCurrentSchoolYear } from '../lib/schoolYear'

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
      .then(async ({ data }) => {
        const rows = data || []
        setRecords(rows)

        // Auto-archive attendance from a completed school year
        const staleIds = rows
          .filter(r => !r.archived && isBeforeCurrentSchoolYear(r.meeting_date))
          .map(r => r.id)
        if (staleIds.length) {
          await supabase.from('icaap_attendance').update({ archived: true }).in('id', staleIds)
          setRecords(prev => prev.map(r => staleIds.includes(r.id) ? { ...r, archived: true } : r))
        }
      })
  }, [userId])

  async function upsertAttendance(meeting_date, member_name, status, notes, time_in) {
    const existing = records.find(
      r => r.meeting_date === meeting_date && r.member_name === member_name
    )
    if (existing) {
      const { data } = await supabase
        .from('icaap_attendance')
        .update({
          status,
          notes: notes ?? existing.notes,
          time_in: time_in !== undefined ? time_in : existing.time_in,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()
      if (data) setRecords(prev => prev.map(r => r.id === existing.id ? data : r))
    } else {
      const { data } = await supabase
        .from('icaap_attendance')
        .insert({ user_id: userId, meeting_date, member_name, status, notes: notes || null, time_in: time_in || null })
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
