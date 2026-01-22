import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export function usePlannerEvents(startDate, daysCount = 7) {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return null;
    return createClient(supabaseUrl, supabaseKey);
  }, []);

  useEffect(() => {
    if (!supabase || !startDate) return;

    let cancelled = false;
    async function fetchEvents() {
      try {
        setStatus('loading');
        setError(null);
        const startStr = startDate.toISOString().slice(0, 10);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + daysCount - 1);
        const endStr = endDate.toISOString().slice(0, 10);

        const { data, error: queryError } = await supabase
          .from('calendar_by_date')
          .select('*')
          .gte('date', startStr)
          .lte('date', endStr);

        if (queryError) throw queryError;
        if (!cancelled) {
          setEvents((data || []).map(item => ({ ...item, title: item.title || '' })));
          setStatus('success');
        }
      } catch (err) {
        if (!cancelled) {
          setEvents([]);
          setError(err);
          setStatus('error');
        }
      }
    }

    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [supabase, startDate, daysCount]);

  return { events, status, error, hasSupabase: Boolean(supabase) };
}
