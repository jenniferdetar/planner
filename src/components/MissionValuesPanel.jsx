import { useState, useEffect, useRef } from 'react'
import { useMission } from '../hooks/useMission'
import ValuesPanel from './ValuesPanel'
import './MissionValuesPanel.css'

const SUB_TABS = [
  { key: 'mission', label: 'Mission' },
  { key: 'values',  label: 'Values' },
]

export default function MissionValuesPanel({ userId }) {
  const { mission, setMission, save, saved } = useMission(userId)
  const [text, setText] = useState(mission)
  const [subTab, setSubTab] = useState('mission')
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
      <div className="mv-subtabs">
        {SUB_TABS.map(t => (
          <button
            key={t.key}
            className={`mv-subtab${subTab === t.key ? ' active' : ''}`}
            onClick={() => setSubTab(t.key)}
          >{t.label}</button>
        ))}
      </div>

      {subTab === 'mission' && (
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
      )}

      {subTab === 'values' && (
        <div className="mv-values-col">
          <ValuesPanel userId={userId} />
        </div>
      )}
    </div>
  )
}
