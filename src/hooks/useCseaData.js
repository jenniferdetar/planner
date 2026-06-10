import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCseaMembers() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const query = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults([]); return }
    setLoading(true)
    const term = q.trim()
    const { data } = await supabase
      .from('csea_members')
      .select('"First Name", "Last Name", "Employee Number"')
      .or(`"First Name".ilike.%${term}%,"Last Name".ilike.%${term}%`)
      .order('"Last Name"')
      .limit(10)
    setResults((data || []).map(r => ({
      first_name: r['First Name'],
      last_name: r['Last Name'],
      employee_number: r['Employee Number'],
    })))
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => query(search), 250)
    return () => clearTimeout(timer)
  }, [search, query])

  return { search, setSearch, results, loading }
}

export function useWorkLocations() {
  const [locations, setLocations] = useState([])
  useEffect(() => {
    supabase
      .from('school directory')
      .select('"School Name"')
      .order('"School Name"')
      .limit(2000)
      .then(({ data }) => setLocations((data || []).map(r => r['School Name'])))
  }, [])
  return locations
}

export function useCseaIssues(userId) {
  const [issues, setIssues] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('csea_issues')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setIssues(data || []))
  }, [userId])

  async function addIssue(fields) {
    const { data } = await supabase
      .from('csea_issues')
      .insert({ ...fields, user_id: userId, issue_date: new Date().toISOString().split('T')[0] })
      .select()
      .single()
    if (data) setIssues((prev) => [data, ...prev])
  }

  async function updateIssueStatus(id, status) {
    const { data } = await supabase
      .from('csea_issues')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) setIssues((prev) => prev.map((i) => (i.id === id ? data : i)))
  }

  async function deleteIssue(id) {
    await supabase.from('csea_issues').delete().eq('id', id)
    setIssues((prev) => prev.filter((i) => i.id !== id))
  }

  return { issues, addIssue, updateIssueStatus, deleteIssue }
}

export function useMemberInteractions(userId) {
  const [interactions, setInteractions] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('member_interactions')
      .select('*')
      .order('date_spoke', { ascending: false })
      .limit(20)
      .then(({ data }) => setInteractions(data || []))
  }, [userId])

  async function addInteraction(fields) {
    const { data } = await supabase
      .from('member_interactions')
      .insert({ ...fields, date_spoke: fields.date_spoke || new Date().toISOString().split('T')[0] })
      .select()
      .single()
    if (data) setInteractions((prev) => [data, ...prev])
  }

  async function updateInteraction(id, fields) {
    const { data } = await supabase
      .from('member_interactions')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (data) setInteractions((prev) => prev.map(i => i.id === id ? data : i))
  }

  return { interactions, addInteraction, updateInteraction }
}
