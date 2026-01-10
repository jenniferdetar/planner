'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function UserNav() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!user) return null

  return (
    <div className="user-nav">
      <div className="user-info">
        <span className="user-email">{user.email}</span>
      </div>
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>

      <style jsx>{`
        .user-nav {
          padding: 1rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          margin-top: auto;
        }
        .user-info {
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          color: #aaa;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .logout-btn {
          width: 100%;
          padding: 0.5rem;
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }
        .logout-btn:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  )
}
