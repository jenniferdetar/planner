import Calendar from '@/components/Calendar'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <header className="planner-header">
        <div className="planner-header-left">
          <h1>Calendar</h1>
          <p>Monthly View & Events</p>
        </div>
        <div className="planner-header-right">
          <div className="planner-header-actions">
            <Link href="/personal-planner" className="planner-header-pill">Personal Planner</Link>
            <Link href="/work-planner" className="planner-header-pill">Work Planner</Link>
            <Link href="/goals" className="planner-header-pill">Goals</Link>
          </div>
          <div className="planner-header-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </header>
      <div className="planner-main">
        <Calendar />
      </div>

      <footer className="planner-footer">
        <p>&copy; 2025 Opus One Planner. Calendar.</p>
      </footer>
    </>
  )
}
