import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePlannerSections(userId: string | null) {
  const [sections, setSections] = useState<Record<string, string>>({})
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    if (!userId) return
    supabase
      .from('planner_sections')
      .select('section, content')
      .eq('user_id', userId)
      .then(({ data }) => {
        const map: Record<string, string> = {}
        for (const row of data || []) map[row.section] = row.content
        setSections(map)
      })
  }, [userId])

  const updateSection = useCallback((section: string, content: string) => {
    setSections(prev => ({ ...prev, [section]: content }))
    clearTimeout(saveTimers.current[section])
    saveTimers.current[section] = setTimeout(async () => {
      await supabase
        .from('planner_sections')
        .upsert(
          { user_id: userId, section, content, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,section' }
        )
    }, 800)
  }, [userId])

  return { sections, updateSection }
}
