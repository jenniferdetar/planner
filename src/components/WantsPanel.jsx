import { useState, useRef } from 'react'
import { useWants } from '../hooks/useWants'
import './WantsPanel.css'

export default function WantsPanel({ providerToken }) {
  const { wants, loading, error, saving, reload, updateWant } = useWants(providerToken)
  const [editingNum, setEditingNum] = useState(null)
  const [editText, setEditText] = useState('')
  const inputRef = useRef(null)

  function startEdit(want) {
    setEditingNum(want.num)
    setEditText(want.text)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  async function commitEdit(want) {
    if (editText !== want.text) {
      await updateWant(want, editText)
    }
    setEditingNum(null)
  }

  function handleKeyDown(e, want) {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(want) }
    if (e.key === 'Escape') { setEditingNum(null) }
  }

  return (
    <div className="wants-panel">
      <div className="wants-header">
        <span className="wants-title">Wants</span>
        <div className="wants-header-right">
          {saving && <span className="wants-saving">Saving…</span>}
          <button className="wants-reload-btn" onClick={reload} disabled={loading}>↺</button>
        </div>
      </div>

      {error && (
        <div className="wants-error">
          {error.includes('401') || error.includes('403')
            ? 'Sign out and sign back in with Google to refresh access.'
            : error}
        </div>
      )}

      {loading && <div className="wants-loading">Loading…</div>}

      {!loading && !error && (
        <div className="wants-list">
          {wants.map(want => (
            <div
              key={want.num}
              className={`wants-item ${editingNum === want.num ? 'editing' : ''}`}
              onClick={() => editingNum !== want.num && startEdit(want)}
            >
              <span className="wants-num">{want.num}.</span>
              {editingNum === want.num ? (
                <input
                  ref={inputRef}
                  className="wants-input"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onBlur={() => commitEdit(want)}
                  onKeyDown={e => handleKeyDown(e, want)}
                />
              ) : (
                <span className={`wants-text ${!want.text ? 'empty' : ''}`}>
                  {want.text || 'Click to add…'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
