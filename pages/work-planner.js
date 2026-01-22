import { useEffect, useState } from 'react';
import PlannerShell from '../components/PlannerShell';
import WorkPlanner from '../components/WorkPlanner';
import { addDays, getStartOfWeek, getWeekRangeLabel } from '../lib/planner';
import { usePlannerEvents } from '../lib/usePlannerEvents';

export default function WorkPlannerPage() {
  const [weekStart, setWeekStart] = useState(null);

  useEffect(() => {
    setWeekStart(getStartOfWeek(new Date()));
  }, []);

  const { events, status, hasSupabase } = usePlannerEvents(weekStart);
  const currentWeekRange = weekStart ? getWeekRangeLabel(weekStart) : '';

  return (
    <PlannerShell
      title="BE REAL"
      subtitle="not perfect"
      currentRange={currentWeekRange}
      onPrev={() => setWeekStart(prev => (prev ? addDays(prev, -7) : prev))}
      onNext={() => setWeekStart(prev => (prev ? addDays(prev, 7) : prev))}
      active="work"
    >
      {!weekStart ? (
        <div className="status-banner">Preparing your week...</div>
      ) : !hasSupabase ? (
        <div className="status-banner">Supabase env vars are missing; events will not load.</div>
      ) : status === 'loading' ? (
        <div className="status-banner">Loading week data...</div>
      ) : null}
      {weekStart ? <WorkPlanner events={events} weekStart={weekStart} /> : null}
    </PlannerShell>
  );
}
