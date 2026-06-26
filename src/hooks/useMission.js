import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMission(userId) {
  const [mission, setMission] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('personal_mission')
      .select('mission_text')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => { if (data?.mission_text) setMission(data.mission_text) })
  }, [userId])

  async function save(text) {
    await supabase.from('personal_mission').upsert({ user_id: userId, mission_text: text, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return { mission, setMission, save, saved }
}
