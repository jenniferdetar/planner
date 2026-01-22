import { useEffect, useState } from 'react';
import MonthCalendar from '../components/MonthCalendar';
import PlannerShell from '../components/PlannerShell';
import { getMonthInfo } from '../lib/planner';
import { usePlannerEvents } from '../lib/usePlannerEvents';

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const monthDate = currentDate ? getMonthInfo(currentDate) : null;
  // Fetch a broad range to cover the whole month (e.g. 42 days from first day)
  const { events, status, hasSupabase } = usePlannerEvents(
    monthDate?.firstDay,
    42
  );

  const handlePrev = () => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  return (
    <PlannerShell
      title="BE REAL"
      subtitle="not perfect"
      onPrev={handlePrev}
      onNext={handleNext}
      active="home"
    >
      {!currentDate ? (
        <div className="status-banner">Preparing calendar...</div>
      ) : !hasSupabase ? (
        <div className="status-banner">Supabase env vars are missing; events will not load.</div>
      ) : status === 'loading' ? (
        <div className="status-banner">Loading calendar data...</div>
      ) : null}
      {monthDate ? <MonthCalendar events={events} monthDate={monthDate} /> : null}
    </PlannerShell>
  );
}
