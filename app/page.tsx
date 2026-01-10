import Calendar from '@/components/Calendar'

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
            <a href="/personal-planner" className="planner-header-pill">Personal Planner</a>
            <a href="/work-planner" className="planner-header-pill">Work Planner</a>
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
