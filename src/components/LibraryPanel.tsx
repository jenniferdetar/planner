// @ts-nocheck
import { useState } from 'react'
import { SHELVES } from '../hooks/useLibrary'
import './LibraryPanel.css'

const STATUS_COLORS: Record<string, string> = {
  'want-to-read': '#888',
  'reading': '#4a90d9',
  'read': '#5cb85c',
}

const PALETTE = ['#8B2B3A', '#6E2232', '#501A28', '#2F1019']

const STATUS_LABELS = {
  'want-to-read': 'Want to Read',
  'reading': 'Reading',
  'read': 'Read',
}

const STATUS_CYCLE = ['want-to-read', 'reading', 'read']

interface Book {
  id: string | number
  title: string
  author?: string
  shelf: string
  status: string
}

interface LibraryPanelProps {
  books: Book[]
  onAddBook: (title: string, author: string, shelf: string) => Promise<void>
  onUpdateStatus: (id: string | number, status: string) => Promise<void>
  onDeleteBook: (id: string | number) => Promise<void>
  onImportBooks: (defaults: any[], existing: Book[]) => Promise<void>
}

const DEFAULTS = [
  // Fiction
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
  // Business
  { title: '12 Months to $1 Million', author: 'Ryan Daniel Moran', shelf: 'Business', status: 'want-to-read' },
  { title: '45 Practical Effective Tips to Generate More Revenue from Your Events', author: 'Disa Palega', shelf: 'Business', status: 'want-to-read' },
  { title: 'Start Up Using Chat GPT', author: '', shelf: 'Business', status: 'want-to-read' },
  { title: 'The Absolute Beginner\'s Guide to HTML and CSS', author: '', shelf: 'Business', status: 'want-to-read' },
  { title: 'Amazon Ads for Books', author: '', shelf: 'Business', status: 'want-to-read' },
  { title: 'Amazon Seller Pro Tips', author: '', shelf: 'Business', status: 'want-to-read' },
  { title: 'Bootstrap Brilliance: Mastering Self-Funding for a Start-Up Business', author: 'B.R. Wayne', shelf: 'Business', status: 'want-to-read' },
  { title: 'Building eCommerce Applications', author: '', shelf: 'Business', status: 'want-to-read' },
  { title: 'Business Boutique', author: 'Christy Wright', shelf: 'Business', status: 'want-to-read' },
  { title: 'Delegation', author: 'Dave Ramsey', shelf: 'Business', status: 'want-to-read' },
  { title: 'Dover', author: 'Jon Acuff', shelf: 'Business', status: 'want-to-read' },
  { title: "Don't Drop It", author: '', shelf: 'Business', status: 'want-to-read' },
  { title: 'Dropshipping', author: 'James Moore', shelf: 'Business', status: 'want-to-read' },
  { title: 'Entrepreneur Mind Sets and Habits', author: 'James Mazur', shelf: 'Business', status: 'want-to-read' },
  { title: 'Startups (magazine)', author: '', shelf: 'Business', status: 'want-to-read' },
  { title: 'From Paycheck to Purpose', author: 'Ken Coleman', shelf: 'Business', status: 'want-to-read' },
  { title: 'How to Build a Million Dollar App', author: 'George Berkowski', shelf: 'Business', status: 'want-to-read' },
  { title: 'Kingdom Business Breakthrough', author: 'Candice Zakariya', shelf: 'Business', status: 'want-to-read' },
  { title: 'Little Me, Big Business', author: 'Nailea Devora', shelf: 'Business', status: 'want-to-read' },
  { title: 'Manifest $10,000', author: 'Cassie Parks', shelf: 'Business', status: 'want-to-read' },
  { title: 'The Proximity Principle', author: 'Ken Coleman', shelf: 'Business', status: 'want-to-read' },
  { title: 'Purpose + Profit', author: 'George Sarsten', shelf: 'Business', status: 'want-to-read' },
  { title: 'The Restart Roadmap', author: 'Jason Tarlick', shelf: 'Business', status: 'want-to-read' },
  { title: 'Running Remote', author: 'Liam Martin & Rob Rawson', shelf: 'Business', status: 'want-to-read' },
  { title: 'Small Business Owner\'s Bible 2024', author: '', shelf: 'Business', status: 'want-to-read' },
  { title: 'Punch Fear in the Face Escape Average Do Work That Matters START', author: 'Jon Acuff', shelf: 'Business', status: 'want-to-read' },
  { title: 'Super Simple Pod', author: '', shelf: 'Business', status: 'want-to-read' },
  { title: 'Workbook for Rich Dad Poor Dad', author: 'Robert T. Kiyosaki', shelf: 'Business', status: 'want-to-read' },
  // Religious
  { title: "Hinds' Feet on High Places", author: 'Hannah Hurnard', shelf: 'Religious', status: 'want-to-read' },
  { title: 'This Is My Day! 31 Days of Supernatural Living', author: 'Kayode Fadele', shelf: 'Religious', status: 'want-to-read' },
  { title: 'Own Your Past Change Your Future', author: 'Dr. John Delony', shelf: 'Religious', status: 'want-to-read' },
  { title: 'Punch Fear in the Face START', author: 'Jon Acuff', shelf: 'Religious', status: 'want-to-read' },
  { title: 'Dover', author: 'Jon Acuff', shelf: 'Religious', status: 'want-to-read' },
  { title: 'Business Boutique', author: 'Christy Wright', shelf: 'Religious', status: 'want-to-read' },
  { title: 'Words of Peace and Welcome', author: 'Horatio Bonar', shelf: 'Religious', status: 'want-to-read' },
  { title: 'The Angel City Rapture', author: 'Moses Angel Hernandez Jr.', shelf: 'Religious', status: 'want-to-read' },
  { title: 'Christians and the Supernatural', author: '', shelf: 'Religious', status: 'want-to-read' },
  { title: 'Israel My Beloved', author: 'Kay Arthur', shelf: 'Religious', status: 'want-to-read' },
  { title: 'The Chronicles of Narnia', author: 'C.S. Lewis', shelf: 'Religious', status: 'want-to-read' },
  { title: 'He Speaks to Me', author: 'Priscilla Shirer', shelf: 'Religious', status: 'want-to-read' },
  { title: 'The Pursuit of God', author: 'A.W. Tozer', shelf: 'Religious', status: 'want-to-read' },
  { title: 'From Paycheck to Purpose', author: 'Ken Coleman', shelf: 'Religious', status: 'want-to-read' },
  { title: 'Redefining Anxiety', author: '', shelf: 'Religious', status: 'want-to-read' },
  { title: 'The Proximity Principle', author: 'Ken Coleman', shelf: 'Religious', status: 'want-to-read' },
  // Self-Help
  { title: 'Own Your Past Change Your Future', author: 'Dr. John Delony', shelf: 'Self-Help', status: 'want-to-read' },
  { title: 'Punch Fear in the Face START', author: 'Jon Acuff', shelf: 'Self-Help', status: 'want-to-read' },
  { title: 'Ketogenic Cookbook for Weight Loss', author: '', shelf: 'Self-Help', status: 'want-to-read' },
  { title: 'Instant Pot Cookbook', author: '', shelf: 'Self-Help', status: 'want-to-read' },
  { title: 'I Will Teach You to Be Rich', author: 'Ramit Sethi', shelf: 'Self-Help', status: 'want-to-read' },
  { title: 'The Restart Roadmap', author: 'Jason Tarlick', shelf: 'Self-Help', status: 'want-to-read' },
  { title: 'He Speaks to Me', author: 'Priscilla Shirer', shelf: 'Self-Help', status: 'want-to-read' },
  { title: 'Redefining Anxiety', author: '', shelf: 'Self-Help', status: 'want-to-read' },
  // Education
  { title: "The Absolute Beginner's Guide to HTML and CSS", author: '', shelf: 'Education', status: 'want-to-read' },
  { title: 'Ketogenic Cookbook for Weight Loss', author: '', shelf: 'Education', status: 'want-to-read' },
  { title: 'Instant Pot Cookbook', author: '', shelf: 'Education', status: 'want-to-read' },
  { title: 'Manifest $10,000', author: 'Cassie Parks', shelf: 'Education', status: 'want-to-read' },
  { title: 'I Will Teach You to Be Rich', author: 'Ramit Sethi', shelf: 'Education', status: 'want-to-read' },
  { title: 'Running Remote', author: 'Liam Martin & Rob Rawson', shelf: 'Education', status: 'want-to-read' },
  // Magazine
  { title: 'Startups', author: '', shelf: 'Magazine', status: 'want-to-read' },
  { title: 'Real Simple', author: '', shelf: 'Magazine', status: 'want-to-read' },
  { title: 'Better Homes and Gardens', author: '', shelf: 'Magazine', status: 'want-to-read' },
  { title: 'Popular Mechanics', author: '', shelf: 'Magazine', status: 'want-to-read' },
]

export default function LibraryPanel({ books, onAddBook, onUpdateStatus, onDeleteBook, onImportBooks }: LibraryPanelProps) {
  const [activeShelf, setActiveShelf] = useState('Fiction')
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [hoveredId, setHoveredId] = useState<string | number | null>(null)
  const [importing, setImporting] = useState(false)

  const shelfBooks = books.filter(b => b.shelf === activeShelf)

  function cycleStatus(book: Book) {
    const idx = STATUS_CYCLE.indexOf(book.status)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    onUpdateStatus(book.id, next)
  }

  async function handleAdd(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!newTitle.trim()) return
    await onAddBook(newTitle.trim(), newAuthor.trim(), activeShelf)
    setNewTitle('')
    setNewAuthor('')
  }

  async function handleImport() {
    setImporting(true)
    await onImportBooks(DEFAULTS, books)
    setImporting(false)
  }

  const shelfCount = (shelf: string) => books.filter(b => b.shelf === shelf).length

  return (
    <div className="library-panel">
      <div className="library-header">
        <div>
          <h2 className="library-title">My Library</h2>
          <p className="library-subtitle">Nook Book Collection</p>
        </div>
        <button className="import-btn" onClick={handleImport} disabled={importing}>
          {importing ? 'Importing…' : '↓ Sync Nook library'}
        </button>
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
        {shelfBooks.length === 0 && (
          <div className="shelf-empty">
            <p>No books on this shelf yet.</p>
          </div>
        )}

        <div className="book-grid">
          {shelfBooks.map((book, idx) => {
            const paletteColor = PALETTE[idx % PALETTE.length]
            return (
            <div
              key={book.id}
              className="book-card"
              onMouseEnter={() => setHoveredId(book.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="book-card-spine" style={{ background: paletteColor + '33', borderTopColor: paletteColor }} />
              <div className="book-card-body">
                <span className="book-title">{book.title}</span>
                {book.author && <span className="book-author">{book.author}</span>}
              </div>
              <div className="book-card-footer">
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
          )})}
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
