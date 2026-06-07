import { useState } from 'react'
import { SHELVES } from '../hooks/useLibrary'
import './LibraryPanel.css'

const STATUS_COLORS = {
  'want-to-read': '#888',
  'reading': '#4a90d9',
  'read': '#5cb85c',
}

const STATUS_LABELS = {
  'want-to-read': 'Want to Read',
  'reading': 'Reading',
  'read': 'Read',
}

const STATUS_CYCLE = ['want-to-read', 'reading', 'read']

const FICTION_DEFAULTS = [
  { title: 'Mark of the Lion', author: 'Francine Rivers', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Piercing the Darkness', author: 'Frank Peretti', shelf: 'Fiction', status: 'want-to-read' },
  { title: "Hinds' Feet on High Places", author: 'Hannah Hurnard', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Scales of the Dragon', author: 'Katee Robert', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Heavy', author: 'Skye Warren', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'This Present Darkness', author: 'Frank Peretti', shelf: 'Fiction', status: 'read' },
  { title: 'Hazardous Duty', author: 'Christy Barrett', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Welcome Home to Murder', author: 'Cindy Kline', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Limonello Yellow', author: 'Tracy Andrighetti', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Rebecca Again', author: '', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Harmony House', author: 'Ruth Hay', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'The Honorable Imposter', author: 'Gilbert Morris', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'The Inadventurous Heart', author: 'Gilbert Morris', shelf: 'Fiction', status: 'want-to-read' },
  { title: "Highlander's Captive", author: 'Mariah Stone', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'The Angel City Rapture', author: 'Moses Angel Hernandez Jr.', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Edge of Oblivion', author: '', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Triple Shot', author: 'Melissa F. Miller', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Ultimate Marriage', author: 'Lucinda Brant', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Servant of the Crown', author: 'Paul J. Bennett', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Tempered Steel', author: 'Paul J. Bennett', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Ashes of the Frozen Flame', author: 'Paul J. Bennett', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'The Count of Monte Cristo', author: 'Alexandre Dumas', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'The Glass Menagerie', author: 'Tennessee Williams', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'The Captive Bride', author: 'Gilbert Morris', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'The Help', author: 'Kathryn Stockett', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'War and Peace', author: 'Leo Tolstoy', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Israel My Beloved', author: 'Kay Arthur', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'The Chronicles of Narnia', author: 'C.S. Lewis', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Gone with the Wind', author: 'Margaret Mitchell', shelf: 'Fiction', status: 'want-to-read' },
  { title: "The Pilgrim's Progress", author: 'John Bunyan', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Sense and Sensibility', author: 'Jane Austen', shelf: 'Fiction', status: 'want-to-read' },
  { title: "Grimm's Fairy Tales", author: 'Brothers Grimm', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Treasure Island', author: 'Robert Louis Stevenson', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'A Tale of Two Cities', author: 'Charles Dickens', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'The Secret Garden', author: 'Frances Hodgson Burnett', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'Sons of Encouragement', author: 'Francine Rivers', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'The Adventures of Pinocchio', author: 'Carlo Collodi', shelf: 'Fiction', status: 'want-to-read' },
  { title: 'The Secret Adversary', author: 'Agatha Christie', shelf: 'Fiction', status: 'want-to-read' },
]

export default function LibraryPanel({ books, onAddBook, onUpdateStatus, onDeleteBook, onImportBooks }) {
  const [activeShelf, setActiveShelf] = useState('Fiction')
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [hoveredId, setHoveredId] = useState(null)
  const [importing, setImporting] = useState(false)

  const shelfBooks = books.filter(b => b.shelf === activeShelf)

  function cycleStatus(book) {
    const idx = STATUS_CYCLE.indexOf(book.status)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    onUpdateStatus(book.id, next)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    await onAddBook(newTitle.trim(), newAuthor.trim(), activeShelf)
    setNewTitle('')
    setNewAuthor('')
  }

  async function handleImport() {
    setImporting(true)
    await onImportBooks(FICTION_DEFAULTS)
    setImporting(false)
  }

  const shelfCount = (shelf) => books.filter(b => b.shelf === shelf).length

  return (
    <div className="library-panel">
      <div className="library-header">
        <h2 className="library-title">My Library</h2>
        <p className="library-subtitle">Nook Book Collection</p>
      </div>

      <div className="library-shelf-tabs">
        {SHELVES.map(shelf => (
          <button
            key={shelf}
            className={`shelf-tab ${activeShelf === shelf ? 'active' : ''}`}
            onClick={() => setActiveShelf(shelf)}
          >
            {shelf}
            {shelfCount(shelf) > 0 && (
              <span className="shelf-badge">{shelfCount(shelf)}</span>
            )}
          </button>
        ))}
      </div>

      <div className="library-body">
        {books.length === 0 && (
          <div className="library-empty-state">
            <p className="empty-state-text">Your library is empty.</p>
            <button
              className="import-btn"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? 'Importing…' : 'Import my Nook library'}
            </button>
          </div>
        )}

        {books.length > 0 && shelfBooks.length === 0 && (
          <div className="shelf-empty">
            <p>No books on this shelf yet.</p>
          </div>
        )}

        <div className="book-list">
          {shelfBooks.map(book => (
            <div
              key={book.id}
              className="book-row"
              onMouseEnter={() => setHoveredId(book.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="book-info">
                <span className="book-title">{book.title}</span>
                {book.author && <span className="book-author">{book.author}</span>}
              </div>
              <div className="book-actions">
                <button
                  className="status-pill"
                  style={{ background: STATUS_COLORS[book.status] + '22', color: STATUS_COLORS[book.status], borderColor: STATUS_COLORS[book.status] + '55' }}
                  onClick={() => cycleStatus(book)}
                  title="Click to change status"
                >
                  {STATUS_LABELS[book.status]}
                </button>
                {hoveredId === book.id && (
                  <button
                    className="delete-book-btn"
                    onClick={() => onDeleteBook(book.id)}
                    title="Remove book"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <form className="add-book-form" onSubmit={handleAdd}>
          <input
            type="text"
            className="add-book-input"
            placeholder="Book title…"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <input
            type="text"
            className="add-book-input"
            placeholder="Author (optional)"
            value={newAuthor}
            onChange={e => setNewAuthor(e.target.value)}
          />
          <button type="submit" className="add-book-btn">+ Add book</button>
        </form>
      </div>
    </div>
  )
}
