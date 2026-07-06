import { useState } from 'react'
import './GcuPanel.css'

export const GCU_COURSES = [
  // Completed
  { code: 'UNV-504', name: 'Introduction to Graduate Studies in the Liberal Arts', credits: 2, type: 'completed', start: '5/20/2021', end: '6/16/2021', description: 'Introduction to graduate-level academic expectations, research, and writing in the liberal arts.' },
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

const GRADE_POINTS = {
  'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
}

function calcGPA(grades) {
  const graded = GCU_COURSES.filter(c => {
    const g = grades[c.code]?.trim().toUpperCase()
    return g && GRADE_POINTS[g] !== undefined
  })
  if (!graded.length) return null
  const totalPoints = graded.reduce((s, c) => s + GRADE_POINTS[grades[c.code].trim().toUpperCase()] * c.credits, 0)
  const totalCredits = graded.reduce((s, c) => s + c.credits, 0)
  return (totalPoints / totalCredits).toFixed(2)
}

export function useGcuState() {
  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(GCU_COURSES.map(c => [c.code, c.type === 'completed' ? 'completed' : 'not started']))
  )
  const [grades, setGrades] = useState(() =>
    Object.fromEntries(GCU_COURSES.map(c => [c.code, c.type === 'completed' ? 'A' : '']))
  )
  const [expanded, setExpanded] = useState(null)

  function setGrade(code, value) {
    setGrades(prev => ({ ...prev, [code]: value }))
  }

  function cycleStatus(code) {
    setStatuses(prev => {
      const i = STATUS_CYCLE.indexOf(prev[code])
      return { ...prev, [code]: STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length] }
    })
  }

  const completed = GCU_COURSES.filter(c => c.type === 'completed')
  const core = GCU_COURSES.filter(c => c.type === 'core')
  const emphasis = GCU_COURSES.filter(c => c.type === 'emphasis')
  const total = GCU_COURSES.reduce((s, c) => s + c.credits, 0)
  const done = GCU_COURSES.filter(c => statuses[c.code] === 'completed').reduce((s, c) => s + c.credits, 0)
  const gpa = calcGPA(grades)

  return { statuses, grades, expanded, setExpanded, setGrade, cycleStatus, completed, core, emphasis, total, done, gpa }
}

function CourseGroup({ label, courses, api }) {
  const { statuses, grades, expanded, setExpanded, cycleStatus, setGrade } = api
  return (
    <div className="gcu-group">
      <div className="gcu-group-label" dangerouslySetInnerHTML={{ __html: label }} />
      {courses.map(course => {
        const status = statuses[course.code]
        const isOpen = expanded === course.code
        return (
          <div key={course.code} className={`gcu-course-row ${isOpen ? 'open' : ''}`}>
            <div className="gcu-course-main" onClick={() => setExpanded(isOpen ? null : course.code)}>
              <button
                className="gcu-status-dot"
                style={{ background: STATUS_COLORS[status] }}
                onClick={e => { e.stopPropagation(); cycleStatus(course.code) }}
                title={`Status: ${status}`}
              />
              <div className="gcu-course-info">
                <span className="gcu-course-code">{course.code}</span>
                <span className="gcu-course-name">{course.name}</span>
                {course.end && <span className="gcu-course-due"><span className="gcu-due-label">Due</span> {course.end}</span>}
              </div>
              <div className="gcu-controls">
                <input
                  className="gcu-grade-input"
                  type="text"
                  value={grades[course.code]}
                  onChange={e => setGrade(course.code, e.target.value)}
                  onClick={e => e.stopPropagation()}
                  placeholder="Grade"
                  maxLength={6}
                />
                <span className="gcu-credits">{course.credits} cr</span>
                <span className="gcu-status-label" style={{ color: STATUS_COLORS[status] }}>{status}</span>
                <span className="gcu-chevron">{isOpen ? '▲' : '▾'}</span>
              </div>
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

export default function GcuPanel({ onPushToAsana, pushing }) {
  const api = useGcuState()
  return (
    <div className="gcu-panel">
      <div className="gcu-page-header">
        <span className="gcu-page-title">MPA – Government &amp; Policy</span>
        <button
          className={`gcu-asana-btn ${pushing ? 'pushing' : ''}`}
          onClick={onPushToAsana}
          disabled={pushing}
        >
          {pushing ? '⏳ Pushing…' : '↑ Push to Asana'}
        </button>
      </div>
      <div className="gcu-progress-section">
        <p className="gcu-subtitle">Grand Canyon University · College of Humanities and Social Sciences · <a href="https://newportal.gcu.edu/#!/dashboard" target="_blank" rel="noreferrer" style={{ color: '#a23b3b' }}>Student Portal</a></p>
        <div className="gcu-progress-bar-wrap">
          <div className="gcu-progress-bar" style={{ width: `${(api.done / api.total) * 100}%` }} />
        </div>
        <div className="gcu-progress-label">
          {api.done} / {api.total} credit hours complete
          {api.gpa !== null && <span className="gcu-gpa-badge">GPA {api.gpa}</span>}
        </div>
      </div>

      <div className="gcu-body">
        <CourseGroup label="Completed" courses={api.completed} api={api} />
        <CourseGroup label="Core Courses" courses={api.core} api={api} />
        <CourseGroup label="Government &amp; Policy Emphasis" courses={api.emphasis} api={api} />
      </div>
    </div>
  )
}
