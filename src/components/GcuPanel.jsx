import { useState } from 'react'
import './GcuPanel.css'

export const GCU_COURSES = [
  // Core Courses — sorted oldest to newest by start date
  { code: 'ADM-624', name: 'Public Governance', credits: 4, type: 'core', start: '7/16/2026', end: '9/9/2026', description: 'Best practices in public governance, transparency, participation, and accountability.' },
  { code: 'ADM-530', name: 'Public and Nonprofit Administration', credits: 4, type: 'core', start: '9/10/2026', end: '11/4/2026', description: 'Principles and practices of managing public and nonprofit organizations; structure, accountability, and service delivery.' },
  { code: 'HRM-635', name: 'Acquiring, Developing, and Leveraging Human Capital', credits: 4, type: 'core', start: '11/5/2026', end: '1/6/2027', description: 'Strategic human resource management in the public sector: recruitment, development, and retention of talent.' },
  { code: 'ADM-560', name: 'Influence, Power, and Politics in Public Administration', credits: 4, type: 'core', start: '1/7/2027', end: '3/3/2027', description: 'How power dynamics and political forces shape public administration decisions and outcomes.' },
  { code: 'ADM-620', name: 'Leading Public Organizations', credits: 4, type: 'core', start: '3/4/2027', end: '4/28/2027', description: 'Leadership practices and qualities necessary to lead public organizations effectively.' },
  { code: 'ADM-626', name: 'Public Budgeting and Financial Management', credits: 4, type: 'core', start: '4/29/2027', end: '6/23/2027', description: 'Revenue and expenditure structure of the public sector, budget structure and administration.' },
  { code: 'ADM-614', name: 'Economics for Public Administrators', credits: 4, type: 'core', start: '8/19/2027', end: '10/13/2027', description: 'Explores the role of government in the economy in the context of market failure and social equity.' },
  { code: 'ADM-640', name: 'Program Evaluation', credits: 4, type: 'core', start: '10/14/2027', end: '12/8/2027', description: 'Capstone. Methods for evaluating the effectiveness of public programs and policies.' },
  // Government & Policy Emphasis
  { code: 'ADM-634', name: 'Policy Studies', credits: 4, type: 'emphasis', start: '6/24/2027', end: '8/18/2027', description: 'How societal challenges become policy issues; leading theories in policy analysis and the policy-making process.' },
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
            <p className="gcu-subtitle">Grand Canyon University · College of Humanities and Social Sciences · <a href="https://newportal.gcu.edu/#!/dashboard" target="_blank" rel="noreferrer" style={{ color: '#f0c070' }}>Student Portal</a></p>
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
                {course.start && <span className="gcu-course-dates">{course.start} – {course.end}</span>}
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
