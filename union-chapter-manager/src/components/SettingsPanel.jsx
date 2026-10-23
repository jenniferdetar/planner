import { useState } from 'react'
import { ORG_ROLES } from '../lib/roles'

export default function SettingsPanel({ user, org }) {
  const current = org.currentOrg
  const [mode, setMode] = useState(null) // null | 'create' | 'join'
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(null)
    try {
      if (mode === 'create') await org.createOrganization(value)
      else await org.joinOrganization(value)
      setValue('')
      setMode(null)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(current.joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Settings</h2>
          <p className="panel-sub">Chapter and account</p>
        </div>
      </div>

      <div className="card">
        <h3>{current.name}</h3>
        <p className="meta" style={{ marginTop: '0.3rem' }}>
          Your role: <strong>{ORG_ROLES[current.role] || current.role}</strong>
        </p>
        <div className="row-gap" style={{ marginTop: '0.8rem' }}>
          <span className="meta">Invite co-admins with this join code:</span>
          <code style={{ background: 'var(--blue-light)', padding: '0.2rem 0.5rem', borderRadius: 6 }}>{current.joinCode}</code>
          <button className="btn-secondary btn-sm" onClick={copyCode}>{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      </div>

      <div className="card">
        <h3>Your chapters</h3>
        <div className="stack" style={{ marginTop: '0.5rem' }}>
          {org.orgs.map((o) => (
            <div className="row-gap" key={o.id}>
              <button
                className={`pill ${o.id === current.id ? 'active' : ''}`}
                onClick={() => org.switchOrg(o.id)}
              >
                {o.name}
              </button>
              <span className="meta">{ORG_ROLES[o.role] || o.role}</span>
            </div>
          ))}
        </div>

        <div className="row-gap" style={{ marginTop: '1rem' }}>
          <button className="btn-secondary btn-sm" onClick={() => { setMode('create'); setError(null) }}>Create another chapter</button>
          <button className="btn-secondary btn-sm" onClick={() => { setMode('join'); setError(null) }}>Join with a code</button>
        </div>

        {mode && (
          <form className="row-gap" style={{ marginTop: '0.8rem' }} onSubmit={submit}>
            <input
              className="field"
              placeholder={mode === 'create' ? 'New chapter name' : 'Join code'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
            <button className="btn btn-sm" type="submit">{mode === 'create' ? 'Create' : 'Join'}</button>
            <button type="button" className="btn-ghost" onClick={() => { setMode(null); setValue('') }}>Cancel</button>
          </form>
        )}
        {error && <div className="auth-error" style={{ marginTop: '0.6rem' }}>{error}</div>}
      </div>

      <div className="card">
        <h3>Account</h3>
        <p className="meta" style={{ marginTop: '0.3rem' }}>{user.email}</p>
      </div>
    </div>
  )
}
