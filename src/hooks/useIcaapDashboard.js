import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { currentSchoolYearStart } from '../lib/schoolYear'

// Built from the school year in progress (July start year) so this doesn't
// need a manual code update every July — e.g. for the year starting July
// 2026: Jul 2026 ... Dec 2026, then Jan 2027 ... Jun 2027.
const MONTH_ABBRS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

export const DASHBOARD_MONTHS = (() => {
  const startYear = currentSchoolYearStart().getFullYear()
  return MONTH_ABBRS.map((key, i) => {
    const year = i < 6 ? startYear : startYear + 1
    return { key, paylogKey: `${key} ${year}`, label: key }
  })
})()

// Normalize the month string from the form (col J) to a paylogKey like "Jan 2026"
export function normalizePaylogMonth(raw) {
  if (!raw) return null
  const monthMap = {
    january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr',
    may: 'May', june: 'Jun', july: 'Jul', august: 'Aug',
    september: 'Sep', october: 'Oct', november: 'Nov', december: 'Dec',
    jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr',
    jun: 'Jun', jul: 'Jul', aug: 'Aug', sep: 'Sep',
    oct: 'Oct', nov: 'Nov', dec: 'Dec',
  }
  const str = raw.trim()
  // Try to match "Month Year" pattern
  const match = str.match(/([A-Za-z]+)\s+(\d{4})/)
  if (match) {
    const abbr = monthMap[match[1].toLowerCase()]
    if (abbr) return `${abbr} ${match[2]}`
  }
  // Already in correct format like "Jan 2026"
  const direct = DASHBOARD_MONTHS.find(m => m.paylogKey.toLowerCase() === str.toLowerCase())
  if (direct) return direct.paylogKey
  return null
}

export function useIcaapDashboard() {
  const [hoursWorked, setHoursWorked] = useState([])
  const [paylogSubmission, setPaylogSubmission] = useState([])
  const [approvalDates, setApprovalDates] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
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
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // rows keyed by name
  const rows = hoursWorked.map(hw => {
    const name = hw['Name']
    const ps = paylogSubmission.find(p => p['Employee Name'] === name) || {}
    const ad = approvalDates.find(a => a['Name'] === name) || {}
    return { name, hw, ps, ad }
  })

  // Import parsed CSV rows: [{ name, monthCol, dateValue }]
  async function importPaylogRows(parsedRows) {
    const results = await Promise.all(
      parsedRows.map(({ name, monthCol, dateValue }) =>
        supabase.from('paylog submission').update({ [monthCol]: dateValue }).eq('Employee Name', name)
          .then(({ error }) => error ? { name, error: error.message } : null)
      )
    )
    const errors = results.filter(Boolean)
    await fetchAll()
    return errors
  }

  // Import hours: [{ name, updates: { Jul: 40, Aug: 38, ... } }]
  async function importHoursRows(parsedRows) {
    const results = await Promise.all(
      parsedRows.map(({ name, updates }) =>
        supabase.from('hours_worked').update(updates).eq('Name', name)
          .then(({ error }) => error ? { name, error: error.message } : null)
      )
    )
    const errors = results.filter(Boolean)
    await fetchAll()
    return errors
  }

  async function updateHoursWorked(name, monthKey, rawValue) {
    const val = rawValue === '' ? null : parseFloat(rawValue)
    const numeric = isNaN(val) ? null : val
    await supabase.from('hours_worked').update({ [monthKey]: numeric }).eq('Name', name)
    setHoursWorked(prev => prev.map(r => r['Name'] === name ? { ...r, [monthKey]: numeric } : r))
  }

  async function updateApprovalDate(name, monthKey, rawValue) {
    const val = rawValue?.trim() || null
    await supabase.from('approval_dates').update({ [monthKey]: val }).eq('Name', name)
    setApprovalDates(prev => prev.map(r => r['Name'] === name ? { ...r, [monthKey]: val } : r))
  }

  async function updatePaylogDate(name, paylogKey, rawValue) {
    const val = rawValue?.trim() || null
    await supabase.from('paylog submission').update({ [paylogKey]: val }).eq('Employee Name', name)
    setPaylogSubmission(prev => prev.map(r => r['Employee Name'] === name ? { ...r, [paylogKey]: val } : r))
  }

  return { rows, loading, importPaylogRows, importHoursRows, updateHoursWorked, updateApprovalDate, updatePaylogDate, refresh: fetchAll }
}
