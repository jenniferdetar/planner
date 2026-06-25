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
    async function fetchAll() {
      const PAGE = 1000
      let all = []
      let from = 0
      while (true) {
        const { data } = await supabase
          .from('school directory')
          .select('"School Name"')
          .order('"School Name"')
          .range(from, from + PAGE - 1)
        if (!data || data.length === 0) break
        all = all.concat(data.map(r => r['School Name']))
        if (data.length < PAGE) break
        from += PAGE
      }
      setLocations(all)
    }
    fetchAll()
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
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    if (!userId) return
    let q = supabase
      .from('member_interactions')
      .select('*')
      .order('date_spoke', { ascending: false })
    if (!showArchived) q = q.eq('archived', false)
    q.then(({ data }) => setInteractions(data || []))
  }, [userId, showArchived])

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

  return { interactions, addInteraction, updateInteraction, showArchived, setShowArchived }
}

export function useCseaIssueNotes(userId) {
  const [notesByIssue, setNotesByIssue] = useState({})

  useEffect(() => {
    if (!userId) return
    supabase
      .from('csea_issue_notes')
      .select('*')
      .eq('user_id', userId)
      .order('note_date', { ascending: true })
      .then(({ data }) => {
        const grouped = {}
        for (const n of (data || [])) {
          if (!grouped[n.issue_id]) grouped[n.issue_id] = []
          grouped[n.issue_id].push(n)
        }
        setNotesByIssue(grouped)
      })
  }, [userId])

  async function addNote(issueId, noteText, noteDate) {
    const { data } = await supabase
      .from('csea_issue_notes')
      .insert({ issue_id: issueId, note_text: noteText, note_date: noteDate || null, user_id: userId })
      .select()
      .single()
    if (data) {
      setNotesByIssue(prev => ({
        ...prev,
        [issueId]: [...(prev[issueId] || []), data],
      }))
    }
  }

  async function deleteNote(issueId, noteId) {
    await supabase.from('csea_issue_notes').delete().eq('id', noteId)
    setNotesByIssue(prev => ({
      ...prev,
      [issueId]: (prev[issueId] || []).filter(n => n.id !== noteId),
    }))
  }

  return { notesByIssue, addNote, deleteNote }
}

export function useCseaNotes(userId) {
  const [notes, setNotes] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('csea_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotes(data || []))
  }, [userId])

  async function addNote(note, source) {
    const { data } = await supabase
      .from('csea_notes')
      .insert({ note, source: source || null, user_id: userId })
      .select()
      .single()
    if (data) setNotes((prev) => [data, ...prev])
  }

  async function deleteNote(id) {
    await supabase.from('csea_notes').delete().eq('id', id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return { notes, addNote, deleteNote }
}
