import Link from 'next/link';

export default function PlannerShell({
  title = 'Personal Ops Hub',
  subtitle = 'not perfect',
  currentRange,
  onPrev,
  onNext,
  active = 'home',
  children
}) {
  return (
    <div>
      <header className="hero">
        <div className="stripe-bar" aria-hidden>
          <div className="stripe coral" />
          <div className="stripe gold" />
          <div className="stripe teal" />
          <div className="stripe navy" />
          <div className="stripe coral" />
          <div className="stripe gold" />
          <div className="stripe teal" />
        </div>
        <div className="hero-text">
          <h1>{title}</h1>
          <div className="subtitle">{subtitle}</div>
        </div>
        <div className="pill-group">
          <button className="pill-button" type="button" onClick={onPrev}>
            ← Prev
          </button>
          <Link className={`pill-button ${active === 'home' ? 'pill-active' : ''}`} href="/">
            Home
          </Link>
          <Link className={`pill-button ${active === 'personal' ? 'pill-active' : ''}`} href="/personal-planner">
            Personal
          </Link>
          <Link className={`pill-button pill-work ${active === 'work' ? 'pill-active' : ''}`} href="/work-planner">
            Work
          </Link>
          <button className="pill-button" type="button" onClick={onNext}>
            Next →
          </button>
        </div>
      </header>
      {currentRange ? (
        <div className="weekly-range">{currentRange}</div>
      ) : null}
      {children}
    </div>
  );
}
