import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const SELECTED_KEY = 'ucm_selected_org'

// Loads the organizations (chapters) the signed-in user belongs to, and tracks
// which one is currently active. This is the tenant-selection layer that sits
// between auth and every data hook.
export function useOrg(user) {
  const [orgs, setOrgs] = useState([])
  const [currentOrgId, setCurrentOrgId] = useState(() => localStorage.getItem(SELECTED_KEY))
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) {
      setOrgs([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('memberships')
      .select('role, organizations (id, name, join_code)')
      .eq('user_id', user.id)

    const rows = (data || [])
      .filter((m) => m.organizations)
      .map((m) => ({
        id: m.organizations.id,
        name: m.organizations.name,
        joinCode: m.organizations.join_code,
        role: m.role,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    setOrgs(rows)
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  // Keep the active selection valid as the org list changes.
  useEffect(() => {
    if (loading) return
    if (orgs.length === 0) {
      setCurrentOrgId(null)
      return
    }
    if (!currentOrgId || !orgs.some((o) => o.id === currentOrgId)) {
      setCurrentOrgId(orgs[0].id)
    }
  }, [orgs, loading, currentOrgId])

  const switchOrg = useCallback((id) => {
    localStorage.setItem(SELECTED_KEY, id)
    setCurrentOrgId(id)
  }, [])

  async function createOrganization(name) {
    const { data, error } = await supabase.rpc('create_organization', { org_name: name })
    if (error) throw error
    await load()
    if (data?.id) switchOrg(data.id)
    return data
  }

  async function joinOrganization(code) {
    const { data, error } = await supabase.rpc('join_organization', { code })
    if (error) throw error
    await load()
    if (data?.id) switchOrg(data.id)
    return data
  }

  const currentOrg = orgs.find((o) => o.id === currentOrgId) || null

  return {
    orgs,
    currentOrg,
    currentOrgId: currentOrg?.id || null,
    loading,
    switchOrg,
    createOrganization,
    joinOrganization,
    reload: load,
  }
}
