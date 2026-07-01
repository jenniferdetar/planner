import { useState, useEffect, useRef } from 'react'
import { useMission } from '../hooks/useMission'
import ValuesPanel from './ValuesPanel'
import './MissionValuesPanel.css'

export default function MissionValuesPanel({ userId }) {
  const { mission, setMission, save, saved } = useMission(userId)
  const [text, setText] = useState(mission)
  const saveTimer = useRef(null)

  useEffect(() => { setText(mission) }, [mission])

  function handleChange(e) {
    const val = e.target.value
    setText(val)
    setMission(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(val), 800)
  }

  return (
    <div className="mv-panel">
      <div className="mv-mission-col">
        <div className="mv-mission-header">
          <span className="mv-mission-title">Mission Statement</span>
          {saved && <span className="mv-saved">Saved ✓</span>}
        </div>
        <textarea
          className="mv-mission-textarea"
          value={text}
          onChange={handleChange}
          placeholder="Write your personal mission statement here…"
        />
      </div>
      <div className="mv-values-col">
        <ValuesPanel userId={userId} />
      </div>
    </div>
  )
}
