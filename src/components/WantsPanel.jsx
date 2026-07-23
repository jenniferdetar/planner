import { useState, useMemo } from 'react'
import { useWants, CATEGORIES } from '../hooks/useWants'
import './WantsPanel.css'

const CATEGORY_COLORS = {
  Faith: '#7b5ea7',
  Health: '#3a9188',
  Career: '#3164a0',
  Education: '#cc7a29',
  Home: '#5cb85c',
  Finances: '#4a7a6a',
  Jeff: '#a23b3b',
  Other: '#8a8a8a',
}

function EditableText({ value, placeholder, onSave, className }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function start() {
    setDraft(value)
    setEditing(true)
  }
  function commit() {
    setEditing(false)
    if (draft !== value) onSave(draft)
  }

  if (editing) {
    return (
      <input
        className="wants-input"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commit() }
          if (e.key === 'Escape') setEditing(false)
        }}
      />
    )
  }
  return (
    <span className={`${className} ${!value ? 'empty' : ''}`} onClick={start}>
      {value || placeholder}
    </span>
  )
}

export default function WantsPanel({ providerToken }) {
  const {
    wants, loading, error, saving, needsSetup,
    reload, migrate, updateField, toggleAnswered, addWant,
  } = useWants(providerToken)

  const [filterCat, setFilterCat] = useState('All')
  const [hideAnswered, setHideAnswered] = useState(false)
  const [newText, setNewText] = useState('')

  const answeredCount = wants.filter((w) => w.answered).length
  const pct = wants.length ? Math.round((answeredCount / wants.length) * 100) : 0

  const usedCategories = useMemo(
    () => CATEGORIES.filter((c) => wants.some((w) => w.category === c)),
    [wants]
  )

  const visible = wants.filter((w) => {
    if (filterCat !== 'All' && w.category !== filterCat) return false
    if (hideAnswered && w.answered) return false
    return true
  })

  async function handleAdd(e) {
    e.preventDefault()
    const text = newText.trim()
    if (!text || saving) return
    await addWant(text)
    setNewText('')
  }

  const showEmptyState = !loading && !error && (needsSetup || wants.length === 0)

  return (
    <div className="wants-panel">
      <div className="wants-header">
        <span className="wants-title">Wants</span>
        <div className="wants-header-right">
          {saving && <span className="wants-saving">Saving…</span>}
          <button className="wants-reload-btn" onClick={reload} disabled={loading}>↺</button>
        </div>
      </div>

      <div className="wants-body">
        {error && (
          <div className="wants-error">
            {/insufficient authentication scopes|scope_insufficient|insufficient permission/i.test(error) ? (
              <>
                <strong>Google didn't grant Sheets access.</strong> Sign out, sign back in, and on the
                Google permission screen make sure the <em>Google Sheets</em> checkbox is ticked before
                continuing.
                <span className="wants-error-detail">Google says: {error}</span>
              </>
            ) : /has not been used in project|is disabled|SERVICE_DISABLED/i.test(error) ? (
              <>
                <strong>The Google Sheets API is turned off for this app's Google project.</strong> It has
                to be enabled once in the Google Cloud console, then wait a minute and reload.
                <span className="wants-error-detail">Google says: {error}</span>
              </>
            ) : /401|unauthenticated|invalid credentials|invalid authentication/i.test(error) ? (
              'Your Google sign-in expired. Sign out and sign back in to refresh access.'
            ) : (
              error
            )}
          </div>
        )}

        {loading && <div className="wants-loading">Loading…</div>}

        {showEmptyState && (
          <div className="wants-setup">
            <h3 className="wants-setup-title">Set up your Wants list</h3>
            <p className="wants-setup-text">
              This builds a clean, single list on a new <strong>List</strong> tab in your sheet —
              your original grid stays exactly as it is. Your existing wants are imported,
              duplicates removed, and each one is sorted into a category so you can track which
              prayers have been answered.
            </p>
            <button className="wants-setup-btn" onClick={migrate} disabled={saving}>
              {saving ? 'Importing…' : 'Import my existing wants'}
            </button>
          </div>
        )}

        {!loading && !error && !showEmptyState && (
          <>
            <div className="wants-progress">
              <div className="wants-progress-label">
                <span>{answeredCount} of {wants.length} answered 🙏</span>
                <span>{pct}%</span>
              </div>
              <div className="wants-progress-track">
                <div className="wants-progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="wants-filters">
              <button
                className={`wants-chip ${filterCat === 'All' ? 'active' : ''}`}
                onClick={() => setFilterCat('All')}
              >All</button>
              {usedCategories.map((c) => (
                <button
                  key={c}
                  className={`wants-chip ${filterCat === c ? 'active' : ''}`}
                  style={{ '--chip-color': CATEGORY_COLORS[c] }}
                  onClick={() => setFilterCat(c)}
                >{c}</button>
              ))}
              <label className="wants-hide-toggle">
                <input
                  type="checkbox"
                  checked={hideAnswered}
                  onChange={(e) => setHideAnswered(e.target.checked)}
                />
                Hide answered
              </label>
            </div>

            <form className="wants-add-form" onSubmit={handleAdd}>
              <input
                className="wants-add-input"
                placeholder="Add a new want…"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
              />
              <button type="submit" className="wants-add-btn" disabled={saving || !newText.trim()}>
                + Add
              </button>
            </form>

            <div className="wants-list">
              {visible.length === 0 && (
                <p className="wants-loading">Nothing here with this filter.</p>
              )}
              {visible.map((want) => (
                <div key={want.rowIndex} className={`wants-row ${want.answered ? 'answered' : ''}`}>
                  <button
                    className={`wants-check ${want.answered ? 'on' : ''}`}
                    onClick={() => toggleAnswered(want)}
                    title={want.answered ? 'Mark as not yet answered' : 'Mark as answered'}
                  >
                    {want.answered ? '✓' : ''}
                  </button>

                  <span className="wants-num">{want.num}</span>

                  <div className="wants-main">
                    <EditableText
                      className="wants-text"
                      value={want.text}
                      placeholder="Click to add…"
                      onSave={(v) => updateField(want, 'text', v)}
                    />
                    <div className="wants-meta">
                      <EditableText
                        className="wants-notes"
                        value={want.notes}
                        placeholder="+ note"
                        onSave={(v) => updateField(want, 'notes', v)}
                      />
                      {want.answered && want.date && (
                        <span className="wants-date">answered {want.date}</span>
                      )}
                    </div>
                  </div>

                  <select
                    className="wants-cat-select"
                    value={want.category || 'Other'}
                    onChange={(e) => updateField(want, 'category', e.target.value)}
                    style={{ '--cat-color': CATEGORY_COLORS[want.category] || CATEGORY_COLORS.Other }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
