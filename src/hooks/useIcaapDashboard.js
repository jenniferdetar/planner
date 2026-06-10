import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const DASHBOARD_MONTHS = [
  { key: 'Jul', paylogKey: 'Jul 2025', label: 'Jul' },
  { key: 'Aug', paylogKey: 'Aug 2025', label: 'Aug' },
  { key: 'Sep', paylogKey: 'Sep 2025', label: 'Sep' },
  { key: 'Oct', paylogKey: 'Oct 2025', label: 'Oct' },
  { key: 'Nov', paylogKey: 'Nov 2025', label: 'Nov' },
  { key: 'Dec', paylogKey: 'Dec 2025', label: 'Dec' },
  { key: 'Jan', paylogKey: 'Jan 2026', label: 'Jan' },
  { key: 'Feb', paylogKey: 'Feb 2026', label: 'Feb' },
  { key: 'Mar', paylogKey: 'Mar 2026', label: 'Mar' },
  { key: 'Apr', paylogKey: 'Apr 2026', label: 'Apr' },
  { key: 'May', paylogKey: 'May 2026', label: 'May' },
  { key: 'Jun', paylogKey: 'Jun 2026', label: 'Jun' },
]

export function useIcaapDashboard() {
  const [hoursWorked, setHoursWorked] = useState([])
  const [paylogSubmission, setPaylogSubmission] = useState([])
  const [approvalDates, setApprovalDates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      const [hw, ps, ad] = await Promise.all([
        supabase.from('hours_worked').select('*').order('Name'),
        supabase.from('paylog submission').select('*').order('"Employee Name"'),
        supabase.from('approval_dates').select('*').order('Name'),
      ])
      setHoursWorked(hw.data || [])
      setPaylogSubmission(ps.data || [])
      setApprovalDates(ad.data || [])
      setLoading(false)
    }
    fetchAll()
  }, [])

  // Build combined rows keyed by name
  const rows = hoursWorked.map(hw => {
    const name = hw['Name']
    const ps = paylogSubmission.find(p => p['Employee Name'] === name) || {}
    const ad = approvalDates.find(a => a['Name'] === name) || {}
    return { name, hw, ps, ad }
  })

  return { rows, loading }
}
