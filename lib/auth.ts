import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const auth = {
  async getUser() {
    const supabase = createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) return null
    return user
  },

  async getSession() {
    const supabase = createServerClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) return null
    return session
  },

  async signIn(email: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  },

  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}
