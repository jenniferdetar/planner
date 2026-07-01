import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Rolls up personal_goals.completed by role_id so Roles can show a progress bar.
export function useRoleProgress(userId) {
  const [progressByRole, setProgressByRole] = useState({})

  useEffect(() => {
    if (!userId) return
    supabase
      .from('personal_goals')
      .select('role_id, completed')
      .eq('user_id', userId)
      .not('role_id', 'is', null)
      .then(({ data }) => {
        const map = {}
        for (const g of data || []) {
          if (!map[g.role_id]) map[g.role_id] = { completed: 0, total: 0 }
          map[g.role_id].total += 1
          if (g.completed) map[g.role_id].completed += 1
        }
        for (const roleId of Object.keys(map)) {
          const { completed, total } = map[roleId]
          map[roleId].pct = total > 0 ? Math.round((completed / total) * 100) : 0
        }
        setProgressByRole(map)
      })
  }, [userId])

  return progressByRole
}
