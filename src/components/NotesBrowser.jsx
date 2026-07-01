import { useState, useMemo, useRef } from 'react'
import { useNoteFolders } from '../hooks/useNoteFolders'
import { useNotePages } from '../hooks/useNotePages'
import './NotesBrowser.css'

export default function NotesBrowser({ userId }) {
  const { folders, addFolder, deleteFolder } = useNoteFolders(userId)
  const { notes, addNote, updateNote, deleteNote } = useNotePages(userId)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [addingFolderFor, setAddingFolderFor] = useState(undefined) // undefined = not adding, null = root, id = child of that folder
  const [newFolderName, setNewFolderName] = useState('')
  const bodyTimer = useRef(null)

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

  function FolderRow({ folder, depth }) {
    const kids = childrenOf(folder.id)
    const isSelected = selectedFolder === folder.id
    return (
      <div className="nb-folder-group">
        <button
          className={`nb-folder-row${isSelected ? ' active' : ''}`}
          style={{ paddingLeft: 12 + depth * 16 }}
          onClick={() => { setSelectedFolder(folder.id); setSelectedNote(null) }}
        >
          <span className="nb-folder-icon">📁</span>
          <span className="nb-folder-name">{folder.name}</span>
          <span className="nb-folder-count">{noteCount(folder.id)}</span>
          <span className="nb-folder-chevron">›</span>
        </button>
        {kids.map(k => <FolderRow key={k.id} folder={k} depth={depth + 1} />)}
        {addingFolderFor === folder.id && (
          <form className="nb-add-folder-form" style={{ marginLeft: 12 + (depth + 1) * 16 }} onSubmit={handleAddFolder}>
            <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name…" className="nb-add-input" />
            <button type="submit" className="nb-add-save">✓</button>
            <button type="button" className="nb-add-cancel" onClick={() => setAddingFolderFor(undefined)}>✕</button>
          </form>
        )}
        <button className="nb-add-subfolder-btn" style={{ marginLeft: 12 + (depth + 1) * 16 }} onClick={() => { setAddingFolderFor(folder.id); setNewFolderName('') }}>+ subfolder</button>
      </div>
    )
  }

  return (
    <div className="nb-wrap">
      <div className="nb-tree-col">
        <div className="nb-tree-header">
          <span className="nb-tree-title">Notes</span>
          <span className="nb-tree-count">{notes.length} Notes</span>
        </div>
        <div className="nb-tree-body">
          {roots.map(f => <FolderRow key={f.id} folder={f} depth={0} />)}
          {folders.length === 0 && <p className="nb-empty">No folders yet.</p>}
          {addingFolderFor === null ? (
            <form className="nb-add-folder-form" onSubmit={handleAddFolder}>
              <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name…" className="nb-add-input" />
              <button type="submit" className="nb-add-save">✓</button>
              <button type="button" className="nb-add-cancel" onClick={() => setAddingFolderFor(undefined)}>✕</button>
            </form>
          ) : (
            <button className="nb-new-folder-btn" onClick={() => { setAddingFolderFor(null); setNewFolderName('') }}>+ New Folder</button>
          )}
        </div>
      </div>

      <div className="nb-content-col">
        {!selectedFolder && (
          <div className="nb-placeholder">
            <span className="nb-placeholder-icon">📂</span>
            <p>Select a folder.</p>
          </div>
        )}

        {selectedFolder && !currentNote && (
          <>
            <div className="nb-content-header">
              <span>{folders.find(f => f.id === selectedFolder)?.name}</span>
              <button className="nb-new-note-btn" onClick={handleAddNote}>+ New Note</button>
            </div>
            <div className="nb-note-list">
              {folderNotes.length === 0 && <p className="nb-empty">No notes in this folder.</p>}
              {folderNotes.map(n => (
                <div key={n.id} className="nb-note-row" onClick={() => setSelectedNote(n.id)}>
                  <span className="nb-note-title">{n.title || 'Untitled'}</span>
                  <span className="nb-note-preview">{(n.body || '').slice(0, 60)}</span>
                  <button className="nb-note-del" onClick={e => { e.stopPropagation(); deleteNote(n.id) }}>✕</button>
                </div>
              ))}
            </div>
          </>
        )}

        {currentNote && (
          <div className="nb-editor">
            <div className="nb-editor-header">
              <button className="nb-back-btn" onClick={() => setSelectedNote(null)}>‹ Back</button>
              <button className="nb-note-del" onClick={() => { deleteNote(currentNote.id); setSelectedNote(null) }}>Delete</button>
            </div>
            <input
              className="nb-editor-title"
              value={currentNote.title}
              onChange={e => handleBodyChange('title', e.target.value)}
              placeholder="Untitled"
            />
            <textarea
              className="nb-editor-body"
              value={currentNote.body}
              onChange={e => handleBodyChange('body', e.target.value)}
              placeholder="Start writing…"
            />
          </div>
        )}
      </div>
    </div>
  )
}
