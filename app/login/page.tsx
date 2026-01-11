'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the confirmation link.')
    }
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Opus One Planner</h1>
        <p>Sign in to sync your data across devices</p>
        
        <form className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          
          <div className="login-actions">
            <button 
              type="submit" 
              onClick={handleLogin} 
              disabled={loading}
              className="planner-button planner-button-primary"
            >
              {loading ? 'Processing...' : 'Login'}
            </button>
            <button 
              type="button" 
              onClick={handleSignUp} 
              disabled={loading}
              className="planner-button planner-button-secondary"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
        }
        .login-box {
          background: white;
          padding: 2.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        h1 { margin-bottom: 0.5rem; color: #333; }
        p { color: #666; margin-bottom: 2rem; }
        .login-form { text-align: left; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
        .form-group input { 
          width: 100%; 
          padding: 0.75rem; 
          border: 1px solid #ddd; 
          border-radius: 4px;
          font-size: 1rem;
        }
        .login-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        .login-actions button { flex: 1; }
        .error-message { color: #d32f2f; background: #ffebee; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; }
        .success-message { color: #2e7d32; background: #e8f5e9; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; }
      `}</style>
    </div>
  )
}
