import { useState, useEffect } from 'react'
import { usePlannerDocs, useDebouncedSave } from '../hooks/usePlannerDocs'
import { toDateStr } from '../utils/dateUtils'
import { stackPages } from './spread'
import './BinderPages.css'

const SHORT_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function weekStartOf(d) {
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  s.setDate(s.getDate() - s.getDay())
  return s
}
function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return `${SHORT_MONTH[m - 1]} ${d}${y !== new Date().getFullYear() ? `, ${y}` : ''}`
}
function fmtWeek(start) {
  const end = new Date(start); end.setDate(start.getDate() + 6)
  return start.getMonth() === end.getMonth()
    ? `${MONTHS[start.getMonth()]} ${start.getDate()} – ${end.getDate()}`
    : `${SHORT_MONTH[start.getMonth()]} ${start.getDate()} – ${SHORT_MONTH[end.getMonth()]} ${end.getDate()}`
}

const FIELDS = [
  ['attendees', 'Attendees', 'Who will be there'],
  ['agenda', 'Agenda', 'Topics to cover, in order'],
  ['notes', 'Notes', 'What was discussed'],
  ['actions', 'Action Items', 'Who does what, by when'],
]

// Meeting planners: one sheet per meeting (name, dates, place, event, agenda,
// notes, follow-ups). The week's meetings are listed on the left page; the
// chosen planner opens on the right.
export default function MeetingsPanel({ userId, selectedDate, spread = stackPages }) {
  const { docs, save, remove } = usePlannerDocs(userId, 'meetings')
  const [weekStart, setWeekStart] = useState(() => weekStartOf(selectedDate))
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [armDelete, setArmDelete] = useState(false)
  const { queue, flush, cancel } = useDebouncedSave(save)

  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6)
  const ws = toDateStr(weekStart), we = toDateStr(weekEnd)
  const inWeek = docs
    .filter(m => (m.start || '') <= we && (m.end || m.start || '') >= ws)
    .sort((a, b) => (a.start || '').localeCompare(b.start || '') || (a.name || '').localeCompare(b.name || ''))

  // Load the chosen planner into the editor
  const selected = docs.find(d => d.id === selectedId) || null
  useEffect(() => {
    flush()
    setDraft(selected ? { ...selected } : null)
    setArmDelete(false)
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  function shiftWeek(n) {
    const d = new Date(weekStart); d.setDate(d.getDate() + 7 * n); setWeekStart(d)
  }

  async function addMeeting() {
    const day = toDateStr(selectedDate) >= ws && toDateStr(selectedDate) <= we ? toDateStr(selectedDate) : ws
    const id = await save({ name: 'New meeting', start: day, end: day, location: '', event: '' })
    setSelectedId(id)
  }

  function update(field, value) {
    const next = { ...draft, [field]: value }
    if (field === 'start' && next.end && next.end < value) next.end = value
    setDraft(next)
    queue(next)
  }

  const left = (
    <div className="bp-wrap">
      <div className="bp-head-row">
        <span className="bp-head-sub">Meeting Planners</span>
        <button type="button" className="bp-add" onClick={addMeeting}>
          Add <span className="bp-plus" aria-hidden="true">+</span>
        </button>
      </div>

      <div className="bp-weeknav">
        <button type="button" className="bp-arrow" onClick={() => shiftWeek(-1)} aria-label="Previous week">‹</button>
        <span>{fmtWeek(weekStart)}</span>
        <button type="button" className="bp-arrow" onClick={() => shiftWeek(1)} aria-label="Next week">›</button>
      </div>

      <table className="bp-table">
        <thead>
          <tr><th>Name</th><th>Start Date</th><th>End Date</th><th>Location</th><th>Event</th></tr>
        </thead>
        <tbody>
          {inWeek.map(m => (
            <tr key={m.id} className={m.id === selectedId ? 'sel' : ''} onClick={() => setSelectedId(m.id)} tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') setSelectedId(m.id) }}>
              <td className="bp-strong">{m.name || 'Untitled'}</td>
              <td>{fmtDate(m.start)}</td>
              <td>{fmtDate(m.end)}</td>
              <td>{m.location || '—'}</td>
              <td>{m.event || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {inWeek.length === 0 && <p className="bp-empty">No meeting planners this week. Tap Add to start one.</p>}
    </div>
  )

  const right = draft ? (
    <div className="bp-wrap">
      <input className="bp-title-input" value={draft.name || ''} onChange={e => update('name', e.target.value)} placeholder="Meeting name" aria-label="Meeting name" />
      <div className="bp-field-grid">
        <label>Start Date<input type="date" value={draft.start || ''} onChange={e => update('start', e.target.value)} /></label>
        <label>End Date<input type="date" value={draft.end || ''} min={draft.start || undefined} onChange={e => update('end', e.target.value)} /></label>
        <label>Location<input value={draft.location || ''} onChange={e => update('location', e.target.value)} placeholder="Where" /></label>
        <label>Event<input value={draft.event || ''} onChange={e => update('event', e.target.value)} placeholder="Conference, board meeting…" /></label>
      </div>
      {FIELDS.map(([key, label, hint]) => (
        <label key={key} className="bp-area">
          <span>{label}</span>
          <textarea value={draft[key] || ''} onChange={e => update(key, e.target.value)} placeholder={hint} rows={key === 'agenda' || key === 'notes' ? 6 : 3} />
        </label>
      ))}
      <div className="bp-foot">
        <button type="button" className="bp-link" onClick={() => setSelectedId(null)}>Close</button>
        <button
          type="button"
          className={`bp-danger${armDelete ? ' armed' : ''}`}
          onClick={() => {
            if (!armDelete) { setArmDelete(true); return }
            cancel()
            remove(draft.id); setSelectedId(null)
          }}
        >{armDelete ? 'Tap again to delete' : 'Delete planner'}</button>
      </div>
    </div>
  ) : (
    <div className="bp-wrap bp-placeholder">
      <div className="bp-ph-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="72" height="72"><rect x="8" y="10" width="32" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="3"/><path d="M8 18h32M16 6v8M32 6v8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
      </div>
      <p>Select a meeting planner, or tap <b>Add</b> to start one.</p>
    </div>
  )

  return spread(left, right)
}
