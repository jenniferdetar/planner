import { useState } from 'react'
import './EisenhowerMatrix.css'

const QUADRANTS = [
  { key: 'q1', label: 'Do First',  color: '#003087', bg: 'rgba(0,48,135,0.05)',   desc: 'Urgent + Important' },
  { key: 'q2', label: 'Schedule',  color: '#003087', bg: 'rgba(0,48,135,0.04)',  desc: 'Not Urgent + Important' },
  { key: 'q3', label: 'Delegate',  color: '#b8860b', bg: 'rgba(184,134,11,0.06)', desc: 'Urgent + Not Important' },
  { key: 'q4', label: 'Eliminate', color: '#53575a', bg: 'rgba(83,87,90,0.05)',   desc: 'Not Urgent + Not Important' },
]

export default function EisenhowerMatrix({ masterTasks = [], onUpdateTask }) {
  const [pickingFor, setPickingFor] = useState(null)

  const byQuadrant = {
    q1: masterTasks.filter(t => t.quadrant === 'q1'),
    q2: masterTasks.filter(t => t.quadrant === 'q2'),
    q3: masterTasks.filter(t => t.quadrant === 'q3'),
    q4: masterTasks.filter(t => t.quadrant === 'q4'),
  }
  const unassigned = masterTasks.filter(t => !t.quadrant)

  function assign(taskId, quadrant) {
    onUpdateTask?.(taskId, { quadrant: quadrant || null })
    setPickingFor(null)
  }

  function togglePick(taskId) {
    setPickingFor(prev => prev === taskId ? null : taskId)
  }

  return (
    <div className="em-root" onClick={() => setPickingFor(null)}>
      <div className="em-matrix" onClick={e => e.stopPropagation()}>

        {/* Column headers */}
        <div className="em-corner" />
        <div className="em-col-header urgent">Urgent</div>
        <div className="em-col-header not-urgent">Not Urgent</div>

        {/* Row 1: Important */}
        <div className="em-row-header important">Important</div>
        <Quadrant
          q={QUADRANTS[0]} tasks={byQuadrant.q1}
          pickingFor={pickingFor} onTogglePick={togglePick} onAssign={assign}
        />
        <Quadrant
          q={QUADRANTS[1]} tasks={byQuadrant.q2}
          pickingFor={pickingFor} onTogglePick={togglePick} onAssign={assign}
        />

        {/* Row 2: Not Important */}
        <div className="em-row-header not-important">Not Important</div>
        <Quadrant
          q={QUADRANTS[2]} tasks={byQuadrant.q3}
          pickingFor={pickingFor} onTogglePick={togglePick} onAssign={assign}
        />
        <Quadrant
          q={QUADRANTS[3]} tasks={byQuadrant.q4}
          pickingFor={pickingFor} onTogglePick={togglePick} onAssign={assign}
        />
      </div>

      {unassigned.length > 0 && (
        <div className="em-unassigned">
          <div className="em-unassigned-hdr">Unassigned — {unassigned.length} task{unassigned.length !== 1 ? 's' : ''}</div>
          <div className="em-unassigned-list">
            {unassigned.map(task => (
              <div key={task.id} className="em-unassigned-row">
                <span className="em-task-title">{task.title}</span>
                <div className="em-assign-btns">
                  {QUADRANTS.map(q => (
                    <button
                      key={q.key}
                      className="em-assign-btn"
                      style={{ '--qc': q.color }}
                      onClick={() => assign(task.id, q.key)}
                      title={q.desc}
                    >{q.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unassigned.length === 0 && masterTasks.length === 0 && (
        <div className="em-empty">No master tasks yet. Add tasks in the Master Tasks tab.</div>
      )}
    </div>
  )
}

function Quadrant({ q, tasks, pickingFor, onTogglePick, onAssign }) {
  return (
    <div className="em-quadrant" style={{ '--qc': q.color, '--qbg': q.bg }}>
      <div className="em-q-header">
        <span className="em-q-label">{q.label}</span>
        <span className="em-q-count">{tasks.length}</span>
      </div>
      <div className="em-q-tasks">
        {tasks.map(task => (
          <div key={task.id} className="em-task-row">
            <span className="em-task-title">{task.title}</span>
            <button
              className={`em-task-move ${pickingFor === task.id ? 'active' : ''}`}
              onClick={e => { e.stopPropagation(); onTogglePick(task.id) }}
              title="Move to another quadrant"
            >⇄</button>
            {pickingFor === task.id && (
              <div className="em-pick-menu" onClick={e => e.stopPropagation()}>
                {QUADRANTS.filter(p => p.key !== q.key).map(p => (
                  <button key={p.key} className="em-pick-opt" style={{ '--pc': p.color }} onClick={() => onAssign(task.id, p.key)}>{p.label}</button>
                ))}
                <button className="em-pick-opt unassign" onClick={() => onAssign(task.id, null)}>Unassign</button>
              </div>
            )}
          </div>
        ))}
        {tasks.length === 0 && <p className="em-q-empty">Empty</p>}
      </div>
    </div>
  )
}
