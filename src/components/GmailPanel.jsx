import { useState } from 'react'
import { sendEmail } from '../lib/gmail'
import './GmailPanel.css'

const FOLDERS = [
  { key: 'in:inbox', label: 'Inbox' },
  { key: 'in:sent', label: 'Sent' },
  { key: 'is:starred', label: 'Starred' },
  { key: 'is:unread in:inbox', label: 'Unread' },
]

export default function GmailPanel({ messages, loading, authExpired, error, reload, markRead, archive, providerToken, onReconnect }) {
  const [folder, setFolder] = useState('in:inbox')
  const [selected, setSelected] = useState(null)
  const [composing, setComposing] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [search, setSearch] = useState('')
  const [searchActive, setSearchActive] = useState(false)

  const unreadCount = messages.filter(m => m.unread).length

  function openMessage(msg) {
    setSelected(msg)
    setComposing(false)
    if (msg.unread) markRead(msg.id)
  }

  function handleFolderChange(key) {
    setFolder(key)
    setSelected(null)
    setSearchActive(false)
    reload(key)
  }

  function handleSearch(e) {
    e.preventDefault()
    if (!search.trim()) return
    setSearchActive(true)
    setSelected(null)
    reload(search.trim())
  }

  if (authExpired) {
    return (
      <div className="gmail-auth-wall">
        <div className="gmail-auth-icon">✉️</div>
        <p className="gmail-auth-msg">Connect your Gmail to read and send email.</p>
        <button className="gmail-reconnect-btn" onClick={onReconnect}>
          Connect Gmail
        </button>
        <p className="gmail-auth-note">You'll be redirected to Google to grant access, then returned here.</p>
      </div>
    )
  }

  return (
    <div className="gmail-panel">
      {/* Sidebar */}
      <div className="gmail-sidebar">
        <button
          className="gmail-compose-btn"
          onClick={() => { setComposing(true); setSelected(null); setReplyTo(null) }}
        >
          + Compose
        </button>

        <nav className="gmail-folders">
          {FOLDERS.map(f => (
            <button
              key={f.key}
              className={`gmail-folder-btn ${folder === f.key && !searchActive ? 'active' : ''}`}
              onClick={() => handleFolderChange(f.key)}
            >
              {f.label}
              {f.key === 'in:inbox' && unreadCount > 0 && (
                <span className="gmail-unread-badge">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        <form className="gmail-search-form" onSubmit={handleSearch}>
          <input
            className="gmail-search-input"
            placeholder="Search mail…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="gmail-search-btn">⌕</button>
        </form>

        <button className="gmail-refresh-btn" onClick={() => reload(searchActive ? search : folder)} disabled={loading}>
          {loading ? '…' : '↻ Refresh'}
        </button>
      </div>

      {/* Message list */}
      <div className="gmail-list">
        {error && <p className="gmail-error">{error}</p>}
        {loading && messages.length === 0 && (
          <div className="gmail-loading">Loading…</div>
        )}
        {!loading && messages.length === 0 && (
          <div className="gmail-empty">No messages</div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`gmail-msg-row ${msg.unread ? 'unread' : ''} ${selected?.id === msg.id ? 'selected' : ''}`}
            onClick={() => openMessage(msg)}
          >
            <div className="gmail-msg-from">{formatFrom(msg.from)}</div>
            <div className="gmail-msg-subject">{msg.subject}</div>
            <div className="gmail-msg-snippet">{msg.snippet}</div>
            <div className="gmail-msg-date">{formatDate(msg.date)}</div>
          </div>
        ))}
      </div>

      {/* Detail / compose pane */}
      <div className="gmail-detail">
        {composing && (
          <ComposeForm
            providerToken={providerToken}
            replyTo={replyTo}
            onClose={() => { setComposing(false); setReplyTo(null) }}
          />
        )}
        {!composing && selected && (
          <MessageDetail
            msg={selected}
            onArchive={() => { archive(selected.id); setSelected(null) }}
            onReply={() => { setReplyTo(selected); setComposing(true) }}
            onClose={() => setSelected(null)}
          />
        )}
        {!composing && !selected && (
          <div className="gmail-detail-empty">Select a message to read it</div>
        )}
      </div>
    </div>
  )
}

function MessageDetail({ msg, onArchive, onReply, onClose }) {
  return (
    <div className="gmail-message">
      <div className="gmail-message-header">
        <div className="gmail-message-subject">{msg.subject}</div>
        <div className="gmail-message-meta">
          <span className="gmail-message-from">{msg.from}</span>
          <span className="gmail-message-date">{msg.date?.toLocaleString()}</span>
        </div>
        <div className="gmail-message-actions">
          <button className="gmail-action-btn reply" onClick={onReply}>↩ Reply</button>
          <button className="gmail-action-btn archive" onClick={onArchive}>Archive</button>
          <button className="gmail-action-btn close" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="gmail-message-body">
        {msg.body
          ? <pre className="gmail-body-text">{msg.body}</pre>
          : <p className="gmail-body-snippet">{msg.snippet}</p>
        }
      </div>
    </div>
  )
}

function ComposeForm({ providerToken, replyTo, onClose }) {
  const [to, setTo] = useState(replyTo ? formatFrom(replyTo.from, true) : '')
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSend(e) {
    e.preventDefault()
    if (!to.trim() || !subject.trim()) return
    setSending(true)
    try {
      await sendEmail(providerToken, {
        to: to.trim(),
        subject: subject.trim(),
        body,
        replyToMessageId: replyTo?.id,
        threadId: replyTo?.threadId,
      })
      setSent(true)
      setTimeout(onClose, 1200)
    } catch (err) {
      alert(`Failed to send: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="gmail-compose" onSubmit={handleSend}>
      <div className="gmail-compose-header">
        <span>{replyTo ? 'Reply' : 'New Message'}</span>
        <button type="button" className="gmail-action-btn close" onClick={onClose}>✕</button>
      </div>
      <input className="gmail-compose-field" placeholder="To" value={to} onChange={e => setTo(e.target.value)} required />
      <input className="gmail-compose-field" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
      {replyTo && (
        <div className="gmail-compose-quote">
          <p className="gmail-quote-label">— Original message from {replyTo.from}</p>
          <p className="gmail-quote-text">{replyTo.snippet}</p>
        </div>
      )}
      <textarea
        className="gmail-compose-body"
        placeholder="Write your message…"
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={10}
      />
      <div className="gmail-compose-footer">
        {sent
          ? <span className="gmail-sent-confirm">✓ Sent!</span>
          : <button type="submit" className="gmail-send-btn" disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
        }
      </div>
    </form>
  )
}

function formatFrom(from, emailOnly = false) {
  if (!from) return ''
  const match = from.match(/^(.*?)\s*<(.+)>$/)
  if (match) return emailOnly ? match[2] : match[1].replace(/"/g, '') || match[2]
  return from
}

function formatDate(date) {
  if (!date) return ''
  const now = new Date()
  const diff = now - date
  if (diff < 86400000 && now.getDate() === date.getDate()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diff < 7 * 86400000) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
