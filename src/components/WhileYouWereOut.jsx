import { useState, useEffect, useRef } from 'react'
import { useIcaapNote } from '../hooks/useIcaapNote'
import './WhileYouWereOut.css'

const TO_CONTACTS = [
  { name: 'Patricia Pernin',    email: 'patricia.pernin@lausd.net' },
  { name: 'Bonnie Ratner',      email: 'bonnie.ratner@lausd.net' },
  { name: 'Stephen Maccarone', email: 'snm3706@lausd.net' },
  { name: 'Maikai Estell',      email: 'mcarson@lausd.net' },
  { name: 'Eberardo Rodriguez', email: 'exr6140@lausd.net' },
  { name: 'Rene Gaudet',        email: 'rene.gaudet@lausd.net' },
]

const BLANK = {
  to: '', urgent: false,
  date: '', time: '', ampm: 'A.M.',
  from: '', of: '',
  phone: '', fax: '',
  telephoned: false, pleaseCall: false,
  cameToSeeYou: false, wantsToSeeYou: false,
  returnedYourCall: false, willCallAgain: false,
  message: '',
  signed: '',
}

function fmtPhone(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 10)
  if (d.length < 4) return d
  if (d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
}

function stamp() {
  const d = new Date()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const dy = String(d.getDate()).padStart(2, '0')
  const yr = d.getFullYear()
  let h = d.getHours(); const ampm = h >= 12 ? 'P.M.' : 'A.M.'
  if (h > 12) h -= 12; if (h === 0) h = 12
  const min = String(d.getMinutes()).padStart(2, '0')
  return { date: `${mo}/${dy}/${yr}`, time: `${h}:${min}`, ampm }
}

export default function WhileYouWereOut({ userId }) {
  const { content: raw, handleChange: saveRaw } = useIcaapNote(userId, 'wywo-messages')
  const [messages, setMessages] = useState(null)
  const [form, setForm] = useState({ ...BLANK, ...stamp() })
  const [view, setView] = useState('form') // 'form' | 'log'

  useEffect(() => {
    if (raw === undefined) return
    try { setMessages(raw ? JSON.parse(raw) : []) } catch { setMessages([]) }
  }, [raw])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function handleSubmit(e) {
    e.preventDefault()
    const next = [{ ...form, id: Date.now() }, ...(messages || [])]
    setMessages(next)
    saveRaw(JSON.stringify(next))
    setForm({ ...BLANK, ...stamp() })
    setView('log')
  }

  function handleDelete(id) {
    const next = messages.filter(m => m.id !== id)
    setMessages(next)
    saveRaw(JSON.stringify(next))
  }

  function handleNew() {
    setForm({ ...BLANK, ...stamp() })
    setView('form')
  }

  if (!messages) return <div className="wywo-loading">Loading…</div>

  return (
    <div className="wywo-wrap">
      <div className="wywo-top-bar">
        <button className={`wywo-tab${view === 'form' ? ' active' : ''}`} onClick={() => setView('form')}>New Message</button>
        <button className={`wywo-tab${view === 'log' ? ' active' : ''}`} onClick={() => setView('log')}>
          Message Log {messages.length > 0 && <span className="wywo-badge">{messages.length}</span>}
        </button>
      </div>

      {view === 'form' && (
        <div className="wywo-center">
          <form className="wywo-pad" onSubmit={handleSubmit}>
            {/* TO + URGENT */}
            <div className="wywo-row wywo-to-row">
              <div className="wywo-label-inline">
                <span className="wywo-field-label">To</span>
                <ToTypeahead value={form.to} onChange={v => set('to', v)} />
              </div>
              <label className="wywo-urgent-label">
                <input type="checkbox" checked={form.urgent} onChange={e => set('urgent', e.target.checked)} />
                <span className="wywo-urgent-text">URGENT</span>
              </label>
            </div>

            {/* DATE / TIME / AM-PM */}
            <div className="wywo-row wywo-datetime-row">
              <label className="wywo-label-inline wywo-date">
                <span className="wywo-field-label">Date</span>
                <input className="wywo-underline" value={form.date} onChange={e => set('date', e.target.value)} />
              </label>
              <label className="wywo-label-inline wywo-time">
                <span className="wywo-field-label">Time</span>
                <input className="wywo-underline" value={form.time} onChange={e => set('time', e.target.value)} />
              </label>
              <div className="wywo-ampm">
                <label><input type="radio" name="ampm" value="A.M." checked={form.ampm === 'A.M.'} onChange={e => set('ampm', e.target.value)} /> A.M.</label>
                <label><input type="radio" name="ampm" value="P.M." checked={form.ampm === 'P.M.'} onChange={e => set('ampm', e.target.value)} /> P.M.</label>
              </div>
            </div>

            {/* TITLE */}
            <div className="wywo-title">WHILE YOU WERE OUT</div>

            {/* FROM */}
            <div className="wywo-row">
              <label className="wywo-label-inline">
                <span className="wywo-field-label">From</span>
                <input className="wywo-underline" value={form.from} onChange={e => set('from', e.target.value)} />
              </label>
            </div>

            {/* OF */}
            <div className="wywo-row">
              <label className="wywo-label-inline">
                <span className="wywo-field-label">of</span>
                <input className="wywo-underline" value={form.of} onChange={e => set('of', e.target.value)} />
              </label>
            </div>

            {/* PHONE */}
            <div className="wywo-row">
              <label className="wywo-label-inline">
                <span className="wywo-field-label">Phone</span>
                <input
                  className="wywo-underline"
                  value={form.phone}
                  onChange={e => set('phone', fmtPhone(e.target.value))}
                  placeholder="(___) ___-____"
                  inputMode="tel"
                />
              </label>
            </div>

            {/* FAX */}
            <div className="wywo-row">
              <label className="wywo-label-inline">
                <span className="wywo-field-label">Fax</span>
                <input
                  className="wywo-underline"
                  value={form.fax}
                  onChange={e => set('fax', fmtPhone(e.target.value))}
                  placeholder="(___) ___-____"
                  inputMode="tel"
                />
              </label>
            </div>

            {/* CHECKBOXES */}
            <div className="wywo-checks">
              <div className="wywo-checks-col">
                <label className="wywo-check-row"><span>Telephoned</span><input type="checkbox" checked={form.telephoned} onChange={e => set('telephoned', e.target.checked)} /></label>
                <label className="wywo-check-row"><span>Came to see you</span><input type="checkbox" checked={form.cameToSeeYou} onChange={e => set('cameToSeeYou', e.target.checked)} /></label>
                <label className="wywo-check-row"><span>Returned your call</span><input type="checkbox" checked={form.returnedYourCall} onChange={e => set('returnedYourCall', e.target.checked)} /></label>
              </div>
              <div className="wywo-checks-col">
                <label className="wywo-check-row"><span>Please Call</span><input type="checkbox" checked={form.pleaseCall} onChange={e => set('pleaseCall', e.target.checked)} /></label>
                <label className="wywo-check-row"><span>Wants to see you</span><input type="checkbox" checked={form.wantsToSeeYou} onChange={e => set('wantsToSeeYou', e.target.checked)} /></label>
                <label className="wywo-check-row"><span>Will call again</span><input type="checkbox" checked={form.willCallAgain} onChange={e => set('willCallAgain', e.target.checked)} /></label>
              </div>
            </div>

            {/* MESSAGE */}
            <div className="wywo-row">
              <label className="wywo-label-inline wywo-message-label">
                <span className="wywo-field-label">Message</span>
                <textarea className="wywo-message-area" value={form.message} onChange={e => set('message', e.target.value)} rows={5} />
              </label>
            </div>

            {/* SIGNED */}
            <div className="wywo-row wywo-signed-row">
              <label className="wywo-label-inline">
                <span className="wywo-field-label">Signed</span>
                <input className="wywo-underline" value={form.signed} onChange={e => set('signed', e.target.value)} />
              </label>
            </div>

            <button type="submit" className="wywo-submit">Save Message</button>
          </form>
        </div>
      )}

      {view === 'log' && (
        <div className="wywo-log">
          {messages.length === 0 ? (
            <div className="wywo-empty">No messages yet. <button className="wywo-link" onClick={handleNew}>Take a message →</button></div>
          ) : (
            <>
              <div className="wywo-log-actions">
                <button className="wywo-submit" onClick={handleNew}>+ New Message</button>
              </div>
              <div className="wywo-log-list">
                {messages.map(m => (
                  <div key={m.id} className={`wywo-log-card${m.urgent ? ' wywo-log-urgent' : ''}`}>
                    <div className="wywo-log-header">
                      <div>
                        <span className="wywo-log-to">To: <strong>{m.to || '—'}</strong></span>
                        {m.urgent && <span className="wywo-log-urgent-badge">URGENT</span>}
                      </div>
                      <div className="wywo-log-meta">{m.date} {m.time} {m.ampm}</div>
                      <button className="wywo-log-del" onClick={() => handleDelete(m.id)} title="Delete">✕</button>
                    </div>
                    <div className="wywo-log-from">From: <strong>{m.from || '—'}</strong>{m.of ? ` of ${m.of}` : ''}</div>
                    {m.phone && <div className="wywo-log-phone">Phone: {m.phone}</div>}
                    {m.fax && <div className="wywo-log-phone">Fax: {m.fax}</div>}
                    <div className="wywo-log-tags">
                      {m.telephoned && <span className="wywo-tag">Telephoned</span>}
                      {m.pleaseCall && <span className="wywo-tag">Please Call</span>}
                      {m.cameToSeeYou && <span className="wywo-tag">Came to see you</span>}
                      {m.wantsToSeeYou && <span className="wywo-tag">Wants to see you</span>}
                      {m.returnedYourCall && <span className="wywo-tag">Returned your call</span>}
                      {m.willCallAgain && <span className="wywo-tag">Will call again</span>}
                    </div>
                    {m.message && <div className="wywo-log-msg">{m.message}</div>}
                    {m.signed && <div className="wywo-log-signed">Signed: {m.signed}</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ToTypeahead({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const matches = value.trim()
    ? TO_CONTACTS.filter(c =>
        c.name.toLowerCase().includes(value.toLowerCase())
      )
    : []

  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  return (
    <div className="wywo-typeahead" ref={ref}>
      <input
        className="wywo-underline"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => value.trim() && setOpen(true)}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul className="wywo-suggestions">
          {matches.map(c => (
            <li
              key={c.email}
              className="wywo-suggestion"
              onMouseDown={() => { onChange(c.name); setOpen(false) }}
            >
              <span className="wywo-sug-name">{c.name}</span>
              <span className="wywo-sug-email">{c.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
