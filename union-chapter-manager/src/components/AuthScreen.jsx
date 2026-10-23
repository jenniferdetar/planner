import { useState } from 'react'
import { signIn, signUp } from '../lib/supabase'

export default function AuthScreen() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await signUp(email, password)
        if (error) throw error
        // If email confirmation is on, there's no session yet.
        if (!data.session) {
          setNotice('Account created. Check your email to confirm, then sign in.')
          setMode('signin')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Union Chapter Manager</h1>
        <p className="auth-sub">
          {mode === 'signin' ? 'Sign in to your chapter workspace.' : 'Create an account to get started.'}
        </p>

        <form className="auth-form" onSubmit={submit}>
          {error && <div className="auth-error">{error}</div>}
          {notice && <div className="auth-notice">{notice}</div>}
          <input
            className="field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'signin' ? (
            <>New here? <button onClick={() => { setMode('signup'); setError(null) }}>Create an account</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('signin'); setError(null) }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  )
}
