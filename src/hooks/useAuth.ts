import { useState, useEffect } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const TOKEN_KEY = 'gcal_provider_token'

supabase.auth.onAuthStateChange((event, session) => {
  if (session?.provider_token) {
    localStorage.setItem(TOKEN_KEY, session.provider_token)
  }
})

interface UseAuthReturn {
  session: Session | null
  user: User | null
  providerToken: string | null | undefined
  loading: boolean
  clearProviderToken: () => void
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [cachedToken, setCachedToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession()
      let sess = data.session

      if (sess?.provider_token) {
        localStorage.setItem(TOKEN_KEY, sess.provider_token)
        setCachedToken(sess.provider_token)
      } else if (sess) {
        // Session exists but no provider_token — try refreshing to get a fresh Google token
        const { data: refreshed } = await supabase.auth.refreshSession()
        if (refreshed?.session?.provider_token) {
          sess = refreshed.session
          localStorage.setItem(TOKEN_KEY, refreshed.session.provider_token)
          setCachedToken(refreshed.session.provider_token)
        } else {
          const stored = localStorage.getItem(TOKEN_KEY)
          if (stored) setCachedToken(stored)
        }
      }

      setSession(sess)
      setLoading(false)
    }

    init()

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
