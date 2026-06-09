import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const TOKEN_KEY = 'gcal_provider_token'

// Module-level listener captures SIGNED_IN before React mounts.
// Supabase fires this event during SDK init (when it detects the OAuth
// redirect hash), which happens before any useEffect can run.
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.provider_token) {
    localStorage.setItem(TOKEN_KEY, session.provider_token)
  }
})

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
      } else {
        // Pick up whatever the module-level listener just wrote
        const stored = localStorage.getItem(TOKEN_KEY)
        if (stored) setCachedToken(stored)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (session?.provider_token) {
        localStorage.setItem(TOKEN_KEY, session.provider_token)
        setCachedToken(session.provider_token)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const stored = localStorage.getItem(TOKEN_KEY)
        if (stored) setCachedToken(stored)
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
