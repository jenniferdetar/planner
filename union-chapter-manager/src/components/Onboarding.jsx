import { useState } from 'react'
import { signOut } from '../lib/supabase'

// Shown when a signed-in user belongs to no chapter yet: create one or join
// an existing one with a code.
export default function Onboarding({ user, onCreate, onJoin }) {
  const [tab, setTab] = useState('create') // 'create' | 'join'
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (tab === 'create') await onCreate(name)
      else await onJoin(code)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Welcome</h1>
        <p className="auth-sub">Signed in as {user.email}. Set up your chapter to continue.</p>

        <div className="onboard-choice">
          <button className={tab === 'create' ? 'active' : ''} onClick={() => setTab('create')}>Create a chapter</button>
          <button className={tab === 'join' ? 'active' : ''} onClick={() => setTab('join')}>Join with a code</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {error && <div className="auth-error">{error}</div>}
          {tab === 'create' ? (
            <input
              className="field"
              placeholder="Chapter name (e.g. CSEA Chapter 500)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          ) : (
            <input
              className="field"
              placeholder="Join code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          )}
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : tab === 'create' ? 'Create chapter' : 'Join chapter'}
          </button>
        </form>

        <div className="auth-toggle">
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      </div>
    </div>
  )
}
