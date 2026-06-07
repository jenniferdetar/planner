import { useState } from 'react'
import './GcuPanel.css'

export const GCU_COURSES = [
  // Core
  { code: 'UNV-504', name: 'Introduction to Graduate Studies', credits: 4, type: 'core', description: 'Prepares students for graduate-level academic work, research methods, and APA writing.' },
  { code: 'ADM-611', name: 'Public Organizational Theory', credits: 4, type: 'core', description: 'Examines organizational behavior, leadership science, and effective public sector management.' },
  { code: 'ADM-614', name: 'Economics for Public Administrators', credits: 4, type: 'core', description: 'Explores the role of government in the economy in the context of market failure and social equity.' },
  { code: 'ADM-624', name: 'Public Governance', credits: 4, type: 'core', description: 'Best practices in public governance, transparency, participation, and accountability.' },
  { code: 'ADM-626', name: 'Public Budgeting and Financial Management', credits: 4, type: 'core', description: 'Revenue and expenditure structure of the public sector, budget structure and administration.' },
  { code: 'ADM-628', name: 'Leading Public Organizations', credits: 4, type: 'core', description: 'Leadership practices and qualities necessary to lead public organizations effectively.' },
  { code: 'ADM-640', name: 'Program Evaluation', credits: 4, type: 'core', description: 'Capstone. Methods for evaluating the effectiveness of public programs and policies.' },
  // Government & Policy Emphasis
  { code: 'ADM-632', name: 'Intergovernmental Relations', credits: 4, type: 'emphasis', description: 'Federal, state, and local government interactions; cooperative and conflicting interests.' },
  { code: 'ADM-634', name: 'Policy Studies', credits: 4, type: 'emphasis', description: 'How societal challenges become policy issues; leading theories in policy analysis and the policy-making process.' },
  { code: 'ADM-636', name: 'Law and Administrative Process', credits: 4, type: 'emphasis', description: 'Administrative law, agency discretion, regulatory process, and judicial review of agency action.' },
]

const STATUS_CYCLE = ['not started', 'in progress', 'completed']
const STATUS_COLORS = { 'not started': '#bbb', 'in progress': '#f0a040', 'completed': '#5cb85c' }

export default function GcuPanel({ onPushToAsana, pushing }) {
  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(GCU_COURSES.map(c => [c.code, 'not started']))
  )
  const [expanded, setExpanded] = useState(null)

  function cycleStatus(code) {
    setStatuses(prev => {
      const i = STATUS_CYCLE.indexOf(prev[code])
      return { ...prev, [code]: STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length] }
    })
  }

  const core = GCU_COURSES.filter(c => c.type === 'core')
  const emphasis = GCU_COURSES.filter(c => c.type === 'emphasis')
  const total = GCU_COURSES.reduce((s, c) => s + c.credits, 0)
  const done = GCU_COURSES.filter(c => statuses[c.code] === 'completed').reduce((s, c) => s + c.credits, 0)

  return (
    <div className="gcu-panel">
      <div className="gcu-header">
        <div className="gcu-title-row">
          <div>
            <h2 className="gcu-title">MPA – Government &amp; Policy</h2>
            <p className="gcu-subtitle">Grand Canyon University · College of Humanities and Social Sciences</p>
          </div>
          <button
            className={`gcu-asana-btn ${pushing ? 'pushing' : ''}`}
            onClick={onPushToAsana}
            disabled={pushing}
          >
            {pushing ? '⏳ Pushing…' : '↑ Push to Asana'}
          </button>
        </div>
        <div className="gcu-progress-bar-wrap">
          <div className="gcu-progress-bar" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <div className="gcu-progress-label">{done} / {total} credit hours complete</div>
      </div>

      <div className="gcu-body">
        <CourseGroup
          label="Core Courses"
          courses={core}
          statuses={statuses}
          expanded={expanded}
          onToggle={setExpanded}
          onCycle={cycleStatus}
        />
        <CourseGroup
          label="Government &amp; Policy Emphasis"
          courses={emphasis}
          statuses={statuses}
          expanded={expanded}
          onToggle={setExpanded}
          onCycle={cycleStatus}
        />
      </div>
    </div>
  )
}

function CourseGroup({ label, courses, statuses, expanded, onToggle, onCycle }) {
  return (
    <div className="gcu-group">
      <div className="gcu-group-label" dangerouslySetInnerHTML={{ __html: label }} />
      {courses.map(course => {
        const status = statuses[course.code]
        const isOpen = expanded === course.code
        return (
          <div key={course.code} className={`gcu-course-row ${isOpen ? 'open' : ''}`}>
            <div className="gcu-course-main" onClick={() => onToggle(isOpen ? null : course.code)}>
              <button
                className="gcu-status-dot"
                style={{ background: STATUS_COLORS[status] }}
                onClick={e => { e.stopPropagation(); onCycle(course.code) }}
                title={`Status: ${status}`}
              />
              <div className="gcu-course-info">
                <span className="gcu-course-code">{course.code}</span>
                <span className="gcu-course-name">{course.name}</span>
              </div>
              <span className="gcu-credits">{course.credits} cr</span>
              <span className="gcu-status-label" style={{ color: STATUS_COLORS[status] }}>{status}</span>
              <span className="gcu-chevron">{isOpen ? '▲' : '▾'}</span>
            </div>
            {isOpen && (
              <div className="gcu-course-desc">{course.description}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
