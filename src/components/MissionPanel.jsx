import { useState, useEffect, useRef } from 'react'
import { useMission } from '../hooks/useMission'
import ValuesPanel from './ValuesPanel'
import { stackPages } from './spread'
import './BinderPages.css'

// Mission statement on the left page, personal values on the right — the same
// mission and values shown under Personal › Mantra & Mission.
export default function MissionPanel({ userId, spread = stackPages }) {
  const { mission, setMission, save, saved } = useMission(userId)
  const [editing, setEditing] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  function change(value) {
    setMission(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => save(value), 700)
  }

  function finish() {
    clearTimeout(timer.current)
    save(mission)
    setEditing(false)
  }

  const paragraphs = (mission || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)

  const left = (
    <div className="bp-wrap">
      <div className="bp-head-row">
        <span className="bp-head-sub">Mission Statement</span>
        {editing ? (
          <button type="button" className="bp-add" onClick={finish}>Done</button>
        ) : (
          <button type="button" className="bp-add" onClick={() => setEditing(true)}>
            {paragraphs.length ? 'Edit' : 'Write'} <span className="bp-plus" aria-hidden="true">+</span>
          </button>
        )}
      </div>
      {editing ? (
        <>
          <textarea autoFocus className="bp-note-body bp-mission-edit" value={mission} onChange={e => change(e.target.value)}
            placeholder="What do you stand for? What kind of person do you want to be, and what do you want to do?"
            aria-label="Mission statement" />
          <div className="bp-muted">{saved ? 'Saved' : 'Saves as you type · leave a blank line between paragraphs'}</div>
        </>
      ) : paragraphs.length ? (
        <div className="bp-mission" onDoubleClick={() => setEditing(true)}>
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      ) : (
        <p className="bp-empty">No mission statement yet. Tap Write to start one.</p>
      )}
    </div>
  )

  const right = (
    <div className="bp-wrap bp-values">
      <ValuesPanel userId={userId} />
    </div>
  )

  return spread(left, right)
}
