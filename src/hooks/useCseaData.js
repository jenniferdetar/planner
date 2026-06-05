import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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

  return { interactions, addInteraction }
}
