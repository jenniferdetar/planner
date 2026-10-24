import { useState, useEffect } from 'react'
import { usePlannerDocs, useDebouncedSave } from '../hooks/usePlannerDocs'
import { toDateStr } from '../utils/dateUtils'
import BinderCalendar from './BinderCalendar'
import { stackPages } from './spread'
import './BinderPages.css'

const COVERS = ['#c8323a', '#2f5d8a', '#3f7a52', '#8a5a2b', '#6a4c8c', '#1f2b3a']
const ALL = 'all'

function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`
}
function longDate(d) {
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function Book({ color, title, sub, active, onClick }) {
  return (
    <button type="button" className={`bp-book${active ? ' active' : ''}`} onClick={onClick} aria-pressed={active}>
      <span className="bp-book-cover" style={{ '--cover': color }} aria-hidden="true"><span className="bp-book-band" /></span>
      <span className="bp-book-title">{title}</span>
      <span className="bp-book-sub">{sub}</span>
    </button>
  )
}

// Journals: several named journals, one entry per journal per day. Left page:
// the journals as books, then the entries as a list or a calendar. Right page:
// the selected day's entry, ready to write in.
export default function JournalPanel({ userId, selectedDate, spread = stackPages }) {
  const { docs: journals, save: saveJournal } = usePlannerDocs(userId, 'journals')
  const { docs: entries, save: saveEntry, remove: removeEntry } = usePlannerDocs(userId, 'journal_entries')
  const { queue, flush } = useDebouncedSave(saveEntry)

  const [journalId, setJournalId] = useState(ALL)
  const [day, setDay] = useState(selectedDate)
  const [mode, setMode] = useState('calendar')
  const [naming, setNaming] = useState(false)
  const [newName, setNewName] = useState('')
  const [text, setText] = useState('')

  const dayStr = toDateStr(day)
  const sortedJournals = journals.slice().sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
  const journal = journals.find(j => j.id === journalId) || null
  const scoped = journalId === ALL ? entries : entries.filter(e => e.journalId === journalId)
  const marked = new Set(scoped.filter(e => (e.text || '').trim()).map(e => e.date))
  const entryId = journal ? `${journal.id}_${dayStr}` : null
  const entry = entryId ? entries.find(e => e.id === entryId) : null

  // Load the day's entry into the editor whenever the journal or day changes
  useEffect(() => {
    flush()
    setText(entry?.text || '')
  }, [entryId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function createJournal(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    const id = await saveJournal({ name, color: COVERS[(journals.length + 1) % COVERS.length], createdAt: new Date().toISOString() })
    setNewName(''); setNaming(false); setJournalId(id)
  }

  function write(value) {
    setText(value)
    queue({ id: entryId, journalId: journal.id, date: dayStr, text: value })
  }

  const listed = scoped
    .filter(e => (e.text || '').trim())
    .sort((a, b) => b.date.localeCompare(a.date))

  const left = (
    <div className="bp-wrap">
      <div className="bp-head-row">
        <span className="bp-head-sub">Journals</span>
        <button type="button" className="bp-add" onClick={() => setNaming(true)}>
          <span className="bp-plus" aria-hidden="true">+</span> New
        </button>
      </div>
      {naming && (
        <form className="bp-inline-form" onSubmit={createJournal}>
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="Journal name (e.g. Gratitude)"
            onKeyDown={e => { if (e.key === 'Escape') setNaming(false) }} />
          <button type="submit">Create</button>
        </form>
      )}

      <div className="bp-shelf">
        <Book color="#c8323a" title="All Journals" sub={`${entries.filter(e => (e.text || '').trim()).length} Total`}
          active={journalId === ALL} onClick={() => setJournalId(ALL)} />
        {sortedJournals.map(j => (
          <Book key={j.id} color={j.color} title={j.name}
            sub={plural(entries.filter(e => e.journalId === j.id && (e.text || '').trim()).length, 'Entry', 'Entries')}
            active={journalId === j.id} onClick={() => setJournalId(j.id)} />
        ))}
      </div>

      <div className="bp-head-row bp-entries-head">
        <span className="bp-head-sub">Entries</span>
        <div className="bp-seg" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'list'} onClick={() => setMode('list')}>List</button>
          <button type="button" role="tab" aria-selected={mode === 'calendar'} onClick={() => setMode('calendar')}>Calendar</button>
        </div>
      </div>

      {mode === 'calendar' ? (
        <>
          <div className="bp-today-row">
            <button type="button" className="bp-link bp-today" onClick={() => setDay(new Date())}>Today</button>
          </div>
          <BinderCalendar selectedDate={day} onSelect={setDay} marked={marked} />
        </>
      ) : (
        <div className="bp-results">
          {listed.map(e => (
            <button type="button" key={e.id} className={`bp-note-row${e.date === dayStr && e.journalId === journalId ? ' sel' : ''}`}
              onClick={() => { setDay(parseDate(e.date)); setJournalId(e.journalId) }}>
              <span className="bp-note-title">{longDate(parseDate(e.date))}</span>
              <span className="bp-note-meta">
                {journals.find(j => j.id === e.journalId)?.name || 'Journal'} · {(e.text || '').trim().slice(0, 80)}
              </span>
            </button>
          ))}
          {listed.length === 0 && <p className="bp-empty">No entries yet.</p>}
        </div>
      )}
    </div>
  )

  let body
  if (journal) {
    body = (
      <>
        <div className="bp-journal-name" style={{ '--cover': journal.color }}>{journal.name}</div>
        <textarea className="bp-note-body bp-journal-text" value={text} onChange={e => write(e.target.value)}
          placeholder="Write about your day…" aria-label={`${journal.name} entry for ${longDate(day)}`} />
        {entry && (entry.text || '').trim() && (
          <div className="bp-foot">
            <span className="bp-muted">Saved automatically</span>
            <button type="button" className="bp-link" onClick={() => { removeEntry(entry.id); setText('') }}>Clear entry</button>
          </div>
        )}
      </>
    )
  } else {
    const ofDay = entries.filter(e => e.date === dayStr && (e.text || '').trim())
    body = ofDay.length ? (
      ofDay.map(e => {
        const j = journals.find(x => x.id === e.journalId)
        return (
          <div key={e.id} className="bp-entry-card">
            <button type="button" className="bp-journal-name" style={{ '--cover': j?.color }} onClick={() => setJournalId(e.journalId)}>
              {j?.name || 'Journal'} ›
            </button>
            <p className="bp-entry-text">{e.text}</p>
          </div>
        )
      })
    ) : (
      <div className="bp-hint-card">
        <div className="bp-hint-title">📓 Select a journal</div>
        <p>Choose a journal on the left to view entries or create a new entry for the selected date.</p>
        <ol>
          <li>Pick a journal from the shelf{journals.length === 0 ? ' — or tap New to make your first one' : ''}.</li>
          <li>Choose a day in the calendar or tap an entry in the list.</li>
        </ol>
      </div>
    )
  }

  const right = (
    <div className="bp-wrap">
      <div className="bp-muted bp-small-cap">Selected date</div>
      <div className="bp-date-title">{longDate(day)}</div>
      {body}
    </div>
  )

  return spread(left, right)
}
