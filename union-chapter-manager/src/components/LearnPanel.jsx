import { useState } from 'react'
import { COURSE, LESSONS, LEARN_DISCLAIMER } from '../lib/lessons'

function Lesson({ lesson }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card lesson">
      <button className="lesson-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <div className="stack">
          <strong>{lesson.title}</strong>
          <span className="meta">{lesson.summary}</span>
        </div>
        <span className="lesson-meta">
          <span className="tag tag-role">{lesson.minutes} min</span>
          <span className="lesson-chevron">{open ? '▾' : '▸'}</span>
        </span>
      </button>
      {open && (
        <div className="lesson-body">
          {lesson.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}
    </div>
  )
}

export default function LearnPanel() {
  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Learn</h2>
          <p className="panel-sub">Short guides for running your local — and the full course</p>
        </div>
      </div>

      <div className="course-hero">
        <div className="course-hero-body">
          <span className="course-kicker">Full course</span>
          <h3>{COURSE.name}</h3>
          <p>{COURSE.tagline}</p>
          <ul className="course-bullets">
            {COURSE.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
        <div className="course-hero-cta">
          <span className="course-price">{COURSE.price}</span>
          <a
            className="btn"
            href={COURSE.url}
            target={COURSE.url === '#' ? undefined : '_blank'}
            rel="noreferrer"
          >
            {COURSE.url === '#' ? 'Course coming soon' : 'Get the course'}
          </a>
        </div>
      </div>

      <h3 style={{ margin: '1.5rem 0 0.8rem' }}>Free lessons</h3>
      {LESSONS.map((lesson) => <Lesson key={lesson.id} lesson={lesson} />)}

      <p className="meta" style={{ marginTop: '1rem', fontStyle: 'italic' }}>{LEARN_DISCLAIMER}</p>
    </div>
  )
}
