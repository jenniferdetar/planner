import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import path from 'path';
import { getPaydayEvents } from '@/lib/paydayEvents';

type CalendarEvent = {
  id: string;
  title: string;
  category: string;
  date: string;
  type: 'meeting' | 'task' | 'event' | 'expense';
  time?: string | null;
  endTime?: string | null;
};

const decodeHtml = (value: string) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const loadCalendarFallback = async (start: string, end: string) => {
  const filePath = path.join(process.cwd(), 'supabase', 'html', 'calendar_by_date.html');
  const html = await readFile(filePath, 'utf-8');
  const rows: CalendarEvent[] = [];
  const rowRegex = /<tr><td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td>/g;
  let match = rowRegex.exec(html);

  while (match) {
    const id = decodeHtml(match[1]);
    const date = decodeHtml(match[2]);
    const title = decodeHtml(match[3]);
    const category = decodeHtml(match[4]) || 'Event';

    if (date >= start && date <= end) {
      rows.push({
        id,
        title,
        category,
        date,
        type: 'event'
      });
    }
    match = rowRegex.exec(html);
  }

  return rows;
};

const dedupeEvents = (events: CalendarEvent[]) => {
  const seen = new Set<string>();
  return events.filter((event) => {
    const key = `${event.title}|${event.date}|${event.time || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json({ error: 'Missing start/end parameters' }, { status: 400 });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  const hasSupabase =
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseKey.includes('placeholder');

  let meetings: CalendarEvent[] = [];
  let tasks: CalendarEvent[] = [];
  let calendarEvents: CalendarEvent[] = [];
  let expenses: CalendarEvent[] = [];

  if (hasSupabase) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });

      const [{ data: meetingsData }, { data: tasksData }, { data: calendarData }, { data: expensesData }] =
        await Promise.all([
          supabase.from('opus_meetings').select('*').gte('date', start).lte('date', end),
          supabase.from('opus_tasks').select('*').gte('due_date', start).lte('due_date', end),
          supabase.from('calendar_by_date').select('*').gte('date', start).lte('date', end),
          supabase.from('hoa_expenses').select('*').gte('date', start).lte('date', end)
        ]);

      meetings = (meetingsData || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        category: m.category || 'Meeting',
        date: m.date,
        type: 'meeting',
        time: m.start_time,
        endTime: m.end_time
      }));

      tasks = (tasksData || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        category: t.category || 'Opus Task',
        date: t.due_date,
        type: 'task',
        time: t.due_time
      }));

      calendarEvents = (calendarData || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        category: e.category || 'Event',
        date: e.date,
        type: 'event'
      }));

      expenses = (expensesData || []).map((ex: any) => ({
        id: ex.id,
        title: `${ex.vendor}: $${ex.amount}`,
        category: 'Expense',
        date: ex.date,
        type: 'expense'
      }));
    } catch (error) {
      console.error('Calendar API Supabase error:', error);
    }
  }

  if (calendarEvents.length === 0) {
    try {
      calendarEvents = await loadCalendarFallback(start, end);
    } catch (error) {
      console.error('Calendar API fallback error:', error);
    }
  }

  const combined = dedupeEvents([
    ...meetings,
    ...tasks,
    ...calendarEvents,
    ...expenses,
    ...getPaydayEvents(start, end)
  ]);

  return NextResponse.json({ events: combined });
}
