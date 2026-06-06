import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const TOKEN_KEY = 'gcal_provider_token'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cachedToken, setCachedToken] = useState(() => localStorage.getItem(TOKEN_KEY))

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.provider_token) {
        localStorage.setItem(TOKEN_KEY, data.session.provider_token)
        setCachedToken(data.session.provider_token)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.provider_token) {
        localStorage.setItem(TOKEN_KEY, session.provider_token)
        setCachedToken(session.provider_token)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return {
    session,
    user: session?.user ?? null,
    providerToken: session?.provider_token ?? cachedToken,
    loading,
    clearProviderToken: () => {
      localStorage.removeItem(TOKEN_KEY)
      setCachedToken(null)
    },
  }
}
