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
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(153, 179, 197, 0.2);
          border: 1px solid rgba(10, 47, 95, 0.1);
          font-family: inherit;
        }
        .user-info {
          font-size: 0.7rem;
          color: #0a2f5f;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .logout-btn {
          width: auto;
          padding: 2px 8px;
          background: #FFA1AB;
          border: 1px solid rgba(10, 47, 95, 0.2);
          color: #0a2f5f;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: #ffffff;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}
