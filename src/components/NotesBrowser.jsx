import { useState, useMemo, useRef } from 'react'
import { useNoteFolders } from '../hooks/useNoteFolders'
import { useNotePages } from '../hooks/useNotePages'
import './NotesBrowser.css'

// Shared state/handlers so the folder tree and the note content can render
// as two independent components (e.g. on separate binder pages) while
// staying in sync.
export function useNotesBrowser(userId) {
  const { folders, addFolder, deleteFolder } = useNoteFolders(userId)
  const { notes, addNote, updateNote, deleteNote } = useNotePages(userId)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [addingFolderFor, setAddingFolderFor] = useState(undefined) // undefined = not adding, null = root, id = child of that folder
  const [newFolderName, setNewFolderName] = useState('')

  const roots = useMemo(() => folders.filter(f => !f.parent_id), [folders])
  const childrenOf = (id) => folders.filter(f => f.parent_id === id)
  const noteCount = (folderId) => notes.filter(n => n.folder_id === folderId).length

  const folderNotes = selectedFolder ? notes.filter(n => n.folder_id === selectedFolder) : []
  const currentNote = notes.find(n => n.id === selectedNote)

  async function handleAddFolder(e) {
    e.preventDefault()
    if (!newFolderName.trim()) return
    await addFolder(newFolderName.trim(), addingFolderFor ?? null)
    setNewFolderName('')
    setAddingFolderFor(undefined)
  }

  async function handleAddNote() {
    if (!selectedFolder) return
    const note = await addNote(selectedFolder, 'Untitled')
    if (note) setSelectedNote(note.id)
  }

  function handleBodyChange(field, value) {
    updateNote(currentNote.id, { [field]: value })
  }

  function selectFolder(id) {
    setSelectedFolder(id)
    setSelectedNote(null)
  }

  return {
    folders, notes, roots, childrenOf, noteCount,
    folderNotes, currentNote,
    selectedFolder, selectedNote, setSelectedNote, selectFolder,
    addingFolderFor, setAddingFolderFor,
    newFolderName, setNewFolderName,
    handleAddFolder, handleAddNote, handleBodyChange, deleteNote,
  }
}

function FolderRow({ api, folder, depth }) {
  const kids = api.childrenOf(folder.id)
  const isSelected = api.selectedFolder === folder.id
  return (
    <div className="nb-folder-group">
      <button
        className={`nb-folder-row${isSelected ? ' active' : ''}`}
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => api.selectFolder(folder.id)}
      >
        <span className="nb-folder-icon">📁</span>
        <span className="nb-folder-name">{folder.name}</span>
        <span className="nb-folder-count">{api.noteCount(folder.id)}</span>
        <span className="nb-folder-chevron">›</span>
      </button>
      {kids.map(k => <FolderRow key={k.id} api={api} folder={k} depth={depth + 1} />)}
      {api.addingFolderFor === folder.id && (
        <form className="nb-add-folder-form" style={{ marginLeft: 12 + (depth + 1) * 16 }} onSubmit={api.handleAddFolder}>
          <input autoFocus value={api.newFolderName} onChange={e => api.setNewFolderName(e.target.value)} placeholder="Folder name…" className="nb-add-input" />
          <button type="submit" className="nb-add-save">✓</button>
          <button type="button" className="nb-add-cancel" onClick={() => api.setAddingFolderFor(undefined)}>✕</button>
        </form>
      )}
      <button className="nb-add-subfolder-btn" style={{ marginLeft: 12 + (depth + 1) * 16 }} onClick={() => { api.setAddingFolderFor(folder.id); api.setNewFolderName('') }}>+ subfolder</button>
    </div>
  )
}

export function NotesFolderTree({ api }) {
  return (
    <div className="nb-tree-col nb-tree-col-standalone">
      <div className="nb-tree-header">
        <span className="nb-tree-title">Notes</span>
        <span className="nb-tree-count">{api.notes.length} Notes</span>
      </div>
      <div className="nb-tree-body">
        {api.roots.map(f => <FolderRow key={f.id} api={api} folder={f} depth={0} />)}
        {api.folders.length === 0 && <p className="nb-empty">No folders yet.</p>}
        {api.addingFolderFor === null ? (
          <form className="nb-add-folder-form" onSubmit={api.handleAddFolder}>
            <input autoFocus value={api.newFolderName} onChange={e => api.setNewFolderName(e.target.value)} placeholder="Folder name…" className="nb-add-input" />
            <button type="submit" className="nb-add-save">✓</button>
            <button type="button" className="nb-add-cancel" onClick={() => api.setAddingFolderFor(undefined)}>✕</button>
          </form>
        ) : (
          <button className="nb-new-folder-btn" onClick={() => { api.setAddingFolderFor(null); api.setNewFolderName('') }}>+ New Folder</button>
        )}
      </div>
    </div>
  )
}

export function NotesContent({ api }) {
  return (
    <div className="nb-content-col nb-content-col-standalone">
      {!api.selectedFolder && (
        <div className="nb-placeholder">
          <span className="nb-placeholder-icon">📂</span>
          <p>Select a folder.</p>
        </div>
      )}

      {api.selectedFolder && !api.currentNote && (
        <>
          <div className="nb-content-header">
            <span>{api.folders.find(f => f.id === api.selectedFolder)?.name}</span>
            <button className="nb-new-note-btn" onClick={api.handleAddNote}>+ New Note</button>
          </div>
          <div className="nb-note-list">
            {api.folderNotes.length === 0 && <p className="nb-empty">No notes in this folder.</p>}
            {api.folderNotes.map(n => (
              <div key={n.id} className="nb-note-row" onClick={() => api.setSelectedNote(n.id)}>
                <span className="nb-note-title">{n.title || 'Untitled'}</span>
                <span className="nb-note-preview">{(n.body || '').slice(0, 60)}</span>
                <button className="nb-note-del" onClick={e => { e.stopPropagation(); api.deleteNote(n.id) }}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}

      {api.currentNote && (
        <div className="nb-editor">
          <div className="nb-editor-header">
            <button className="nb-back-btn" onClick={() => api.setSelectedNote(null)}>‹ Back</button>
            <button className="nb-note-del" onClick={() => { api.deleteNote(api.currentNote.id); api.setSelectedNote(null) }}>Delete</button>
          </div>
          <input
            className="nb-editor-title"
            value={api.currentNote.title}
            onChange={e => api.handleBodyChange('title', e.target.value)}
            placeholder="Untitled"
          />
          <textarea
            className="nb-editor-body"
            value={api.currentNote.body}
            onChange={e => api.handleBodyChange('body', e.target.value)}
            placeholder="Start writing…"
          />
        </div>
      )}
    </div>
  )
}

export default function NotesBrowser({ userId }) {
  const api = useNotesBrowser(userId)
  return (
    <div className="nb-wrap">
      <NotesFolderTree api={api} />
      <NotesContent api={api} />
    </div>
  )
}
