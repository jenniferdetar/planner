import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Grievances/issues plus their per-issue note timelines.
export function useIssues(orgId, userId) {
  const [issues, setIssues] = useState([])
  const [notesByIssue, setNotesByIssue] = useState({})

  const load = useCallback(async () => {
    if (!orgId) {
      setIssues([])
      setNotesByIssue({})
      return
    }
    const [{ data: issueRows }, { data: noteRows }] = await Promise.all([
      supabase.from('issues').select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
      supabase.from('issue_notes').select('*').eq('org_id', orgId).order('created_at', { ascending: true }),
    ])
    setIssues(issueRows || [])
    const grouped = {}
    for (const n of noteRows || []) {
      ;(grouped[n.issue_id] ||= []).push(n)
    }
    setNotesByIssue(grouped)
  }, [orgId])

  useEffect(() => {
    load()
  }, [load])

  async function addIssue(fields) {
    const { data } = await supabase
      .from('issues')
      .insert({ ...fields, org_id: orgId, created_by: userId })
      .select()
      .single()
    if (data) setIssues((prev) => [data, ...prev])
    return data
  }

  async function updateIssue(id, patch) {
    const { data } = await supabase
      .from('issues')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (data) setIssues((prev) => prev.map((i) => (i.id === id ? data : i)))
  }

  async function deleteIssue(id) {
    await supabase.from('issues').delete().eq('id', id)
    setIssues((prev) => prev.filter((i) => i.id !== id))
    setNotesByIssue((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  async function addNote(issueId, noteText, noteDate) {
    const { data } = await supabase
      .from('issue_notes')
      .insert({ org_id: orgId, issue_id: issueId, note_text: noteText, note_date: noteDate || null, created_by: userId })
      .select()
      .single()
    if (data) {
      setNotesByIssue((prev) => ({ ...prev, [issueId]: [...(prev[issueId] || []), data] }))
    }
  }

  async function deleteNote(issueId, noteId) {
    await supabase.from('issue_notes').delete().eq('id', noteId)
    setNotesByIssue((prev) => ({
      ...prev,
      [issueId]: (prev[issueId] || []).filter((n) => n.id !== noteId),
    }))
  }

  return { issues, notesByIssue, addIssue, updateIssue, deleteIssue, addNote, deleteNote }
}
