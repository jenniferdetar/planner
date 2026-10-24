import { useState, useEffect } from 'react'
import { usePlannerDocs, useDebouncedSave } from '../hooks/usePlannerDocs'
import { stackPages } from './spread'
import './BinderPages.css'

const AREAS = [
  { key: 'Work', icon: '💼' },
  { key: 'Home', icon: '🏡' },
]
// Each area always has a General folder, even before anything is saved
const GENERAL = { Work: 'work-general', Home: 'home-general' }

function FolderIcon({ size = 30 }) {
  return (
    <svg viewBox="0 0 32 26" width={size} height={size * 26 / 32} aria-hidden="true">
      <path d="M2 5a3 3 0 0 1 3-3h7l3 3h12a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2 10h28" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function snippet(text) {
  const line = (text || '').split('\n').map(l => l.trim()).filter(Boolean)[0] || ''
  return line.length > 90 ? line.slice(0, 90) + '…' : line
}
function fmtModified(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// Notes filed in folders under Work and Home. Left page: search + folders with
// counts. Right page: the open folder's notes and the note being edited.
export default function NotesPanel({ userId, spread = stackPages }) {
  const { docs: notes, save: saveNote, remove: removeNote } = usePlannerDocs(userId, 'notes')
  const { docs: savedFolders, save: saveFolder } = usePlannerDocs(userId, 'note_folders')
  const { queue, flush, cancel } = useDebouncedSave(saveNote)

  const [query, setQuery] = useState('')
  const [folderId, setFolderId] = useState(null)
  const [noteId, setNoteId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [newest, setNewest] = useState(true)
  const [addingIn, setAddingIn] = useState(null)
  const [folderName, setFolderName] = useState('')
  const [armDelete, setArmDelete] = useState(false)

  const folders = [
    ...AREAS.map(a => ({ id: GENERAL[a.key], name: 'General', area: a.key })),
    ...savedFolders.filter(f => !Object.values(GENERAL).includes(f.id)),
  ]
  const folder = folders.find(f => f.id === folderId) || null
  const countIn = id => notes.filter(n => n.folderId === id).length

  // Open the chosen note in the editor (saving the previous one first)
  useEffect(() => {
    flush()
    const n = notes.find(x => x.id === noteId)
    setDraft(n ? { ...n } : null)
    setArmDelete(false)
  }, [noteId]) // eslint-disable-line react-hooks/exhaustive-deps

  function openFolder(id) { setFolderId(id); setNoteId(null) }

  async function addFolder(e, area) {
    e.preventDefault()
    const name = folderName.trim()
    if (!name) return
    const id = await saveFolder({ name, area })
    setFolderName(''); setAddingIn(null); openFolder(id)
  }

  async function addNote() {
    const target = folderId || GENERAL.Work
    if (!folderId) setFolderId(target)
    const id = await saveNote({ title: '', body: '', folderId: target })
    setNoteId(id)
  }

  function update(field, value) {
    const next = { ...draft, [field]: value }
    setDraft(next)
    queue(next)
  }

  const q = query.trim().toLowerCase()
  const results = q
    ? notes.filter(n => `${n.title} ${n.body}`.toLowerCase().includes(q))
    : []
  const inFolder = notes
    .filter(n => n.folderId === folderId)
    .sort((a, b) => (newest ? -1 : 1) * (a.updatedAt || '').localeCompare(b.updatedAt || ''))

  const noteRow = n => (
    <button type="button" key={n.id} className={`bp-note-row${n.id === noteId ? ' sel' : ''}`}
      onClick={() => { setFolderId(n.folderId); setNoteId(n.id) }}>
      <span className="bp-note-title">{n.title || 'Untitled note'}</span>
      <span className="bp-note-meta">{fmtModified(n.updatedAt)} · {snippet(n.body) || 'No text'}</span>
    </button>
  )

  const left = (
    <div className="bp-wrap">
      <div className="bp-search-row">
        <input className="bp-search" type="search" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search notes" />
        <button type="button" className="bp-icon-btn" onClick={addNote} title="New note" aria-label="New note">✎</button>
      </div>
      <div className="bp-muted">{notes.length} {notes.length === 1 ? 'Note' : 'Notes'} in all folders</div>

      {q ? (
        <div className="bp-results">
          {results.map(noteRow)}
          {results.length === 0 && <p className="bp-empty">No notes match “{query}”.</p>}
        </div>
      ) : AREAS.map(area => (
        <div key={area.key} className="bp-area-group">
          <div className="bp-area-head">
            <span className="bp-area-icon" aria-hidden="true">{area.icon}</span>
            <span>{area.key}</span>
            <button type="button" className="bp-mini-add" onClick={() => { setAddingIn(area.key); setFolderName('') }}
              aria-label={`New ${area.key} folder`} title="New folder">+</button>
          </div>
          {folders.filter(f => f.area === area.key).map(f => (
            <button type="button" key={f.id} className={`bp-folder${f.id === folderId ? ' sel' : ''}`} onClick={() => openFolder(f.id)}>
              <FolderIcon />
              <span className="bp-folder-name">{f.name}</span>
              <span className="bp-count">{countIn(f.id)}</span>
              <span className="bp-chev" aria-hidden="true">›</span>
            </button>
          ))}
          {addingIn === area.key && (
            <form className="bp-inline-form" onSubmit={e => addFolder(e, area.key)}>
              <input autoFocus value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="Folder name"
                onKeyDown={e => { if (e.key === 'Escape') setAddingIn(null) }} />
              <button type="submit">Add</button>
            </form>
          )}
        </div>
      ))}
    </div>
  )

  let right
  if (draft) {
    right = (
      <div className="bp-wrap">
        <div className="bp-crumb">
          <button type="button" className="bp-link" onClick={() => setNoteId(null)}>‹ {folder ? folder.name : 'Notes'}</button>
          <span className="bp-muted">Edited {fmtModified(notes.find(n => n.id === draft.id)?.updatedAt)}</span>
        </div>
        <input className="bp-title-input" value={draft.title || ''} onChange={e => update('title', e.target.value)} placeholder="Title" aria-label="Note title" />
        <textarea className="bp-note-body" value={draft.body || ''} onChange={e => update('body', e.target.value)} placeholder="Start writing…" aria-label="Note text" />
        <div className="bp-foot">
          <select value={draft.folderId} onChange={e => { update('folderId', e.target.value); setFolderId(e.target.value) }} aria-label="Move to folder">
            {folders.map(f => <option key={f.id} value={f.id}>{f.area} › {f.name}</option>)}
          </select>
          <button type="button" className={`bp-danger${armDelete ? ' armed' : ''}`}
            onClick={() => { if (!armDelete) { setArmDelete(true); return } cancel(); removeNote(draft.id); setNoteId(null) }}>
            {armDelete ? 'Tap again to delete' : 'Delete note'}
          </button>
        </div>
      </div>
    )
  } else if (folder) {
    right = (
      <div className="bp-wrap">
        <div className="bp-folder-head">
          <FolderIcon size={56} />
          <button type="button" className="bp-icon-btn bp-compose" onClick={addNote} title="New note" aria-label="New note">✎</button>
        </div>
        <div className="bp-folder-title">{folder.area} › {folder.name}</div>
        <div className="bp-toolbar">
          <span>{inFolder.length} {inFolder.length === 1 ? 'Note' : 'Notes'}</span>
          <button type="button" className="bp-link" onClick={() => setNewest(v => !v)}>Modified: {newest ? 'Newest' : 'Oldest'}</button>
        </div>
        <div className="bp-results">{inFolder.map(noteRow)}</div>
        {inFolder.length === 0 && <p className="bp-empty">No notes here yet. Tap ✎ to write one.</p>}
      </div>
    )
  } else {
    right = (
      <div className="bp-wrap bp-placeholder">
        <div className="bp-ph-icon"><FolderIcon size={120} /></div>
        <p>Select a folder.</p>
      </div>
    )
  }

  return spread(left, right)
}
