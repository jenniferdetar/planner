import { useState, useEffect, useRef } from 'react'
import { useMission } from '../hooks/useMission'
import { useMantra } from '../hooks/useMantra'
import ValuesPanel from './ValuesPanel'
import './MissionValuesPanel.css'

const SUB_TABS = [
  { key: 'mission', label: 'Mission' },
  { key: 'mantra',  label: 'Mantra' },
  { key: 'values',  label: 'Values' },
]

function AutosaveTextPanel({ title, value, setValue, save, saved, placeholder }) {
  const [text, setText] = useState(value)
  const saveTimer = useRef(null)

  useEffect(() => { setText(value) }, [value])

  function handleChange(e) {
    const val = e.target.value
    setText(val)
    setValue(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(val), 800)
  }

  return (
    <div className="mv-mission-col">
      <div className="mv-mission-header">
        <span className="mv-mission-title">{title}</span>
        {saved && <span className="mv-saved">Saved ✓</span>}
      </div>
      <textarea
        className="mv-mission-textarea"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  )
}

export default function MissionValuesPanel({ userId }) {
  const { mission, setMission, save: saveMission, saved: missionSaved } = useMission(userId)
  const { mantra, setMantra, save: saveMantra, saved: mantraSaved } = useMantra(userId)
  const [subTab, setSubTab] = useState('mission')

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
        <AutosaveTextPanel
          title="Mission Statement"
          value={mission}
          setValue={setMission}
          save={saveMission}
          saved={missionSaved}
          placeholder="Write your personal mission statement here…"
        />
      )}

      {subTab === 'mantra' && (
        <AutosaveTextPanel
          title="My Personal Mantra"
          value={mantra}
          setValue={setMantra}
          save={saveMantra}
          saved={mantraSaved}
          placeholder="Write your personal mantra here… what words center and inspire you?"
        />
      )}

      {subTab === 'values' && (
        <div className="mv-values-col">
          <ValuesPanel userId={userId} />
        </div>
      )}
    </div>
  )
}
