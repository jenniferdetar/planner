'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Calendar as CalendarIcon, Clock, ChevronRight, 
  Activity, ShieldCheck, 
  ArrowUpRight
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  type: 'meeting' | 'task' | 'event' | 'expense';
  time?: string;
}

import HubHeader from '@/components/HubHeader';

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCalendarData() {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const startStr = startOfMonth.toISOString().split('T')[0];
      
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      const endStr = endOfMonth.toISOString().split('T')[0];

      // Fetch Meetings
      const { data: meetings, error: meetingsError } = await supabase
        .from('opus_meetings')
        .select('*')
        .gte('date', startStr)
        .lte('date', endStr);

      // Fetch Tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('opus_tasks')
        .select('*')
        .gte('due_date', startStr)
        .lte('due_date', endStr);

      // Fetch Tasks from tasks table
      const { data: otherTasks, error: otherTasksError } = await supabase
        .from('tasks')
        .select('*')
        .gte('due_date', startStr)
        .lte('due_date', endStr);

      // Fetch Events from calendar_by_date
      const { data: calendarEvents, error: calendarError } = await supabase
        .from('calendar_by_date')
        .select('*')
        .gte('date', startStr)
        .lte('date', endStr);

      // Fetch HOA Expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('hoa_expenses')
        .select('*')
        .gte('date', startStr)
        .lte('date', endStr);

      if (meetingsError) console.error('Error fetching meetings:', meetingsError);
      if (tasksError) console.error('Error fetching opus tasks:', tasksError);
      if (otherTasksError) console.error('Error fetching other tasks:', otherTasksError);
      if (calendarError) console.error('Error fetching calendar events:', calendarError);
      if (expensesError) console.error('Error fetching expenses:', expensesError);

      const combinedEvents: CalendarEvent[] = [
        ...(meetings || []).map(m => ({
          id: m.id,
          title: m.title,
          category: m.category || 'Meeting',
          date: m.date,
          type: 'meeting' as const,
          time: m.start_time
        })),
        ...(tasks || []).map(t => ({
          id: t.id,
          title: t.title,
          category: t.category || 'Opus Task',
          date: t.due_date,
          type: 'task' as const,
          time: t.due_time
        })),
        ...(otherTasks || []).map(t => ({
          id: t.id,
          title: t.title,
          category: 'Task',
          date: t.due_date,
          type: 'task' as const
        })),
        ...(calendarEvents || []).map(e => ({
          id: e.id,
          title: e.title,
          category: e.category || 'Event',
          date: e.date,
          type: 'event' as const
        })),
        ...(expenses || []).map(ex => ({
          id: ex.id,
          title: `${ex.vendor}: $${ex.amount}`,
          category: 'Expense',
          date: ex.date,
          type: 'expense' as const
        }))
      ];

      setEvents(combinedEvents.sort((a, b) => a.date.localeCompare(b.date)));
      setLoading(false);
    }

    fetchCalendarData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-[#fdfdfd] min-h-screen">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <HubHeader 
          title="Calendar" 
          subtitle="Monthly View & Events" 
          icon={CalendarIcon} 
          iconBgColor="bg-[#99B3C5]"
          hideHubSuffix={true}
        />


      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <CalendarIcon className="text-[#0a2f5f]" size={24} />
            <h2 className="text-2xl font-black text-[#0a2f5f] uppercase tracking-tight">Operational Calendar</h2>
            <div className="h-px flex-grow bg-gradient-to-r from-[#0a2f5f]/20 to-transparent"></div>
          </div>
          
          <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-sm overflow-hidden p-8">
            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24"></div>
              ))}
              {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = events.filter(e => e.date === dateStr);
                const isToday = day === new Date().getDate() && new Date().getMonth() === new Date().getMonth();
                
                return (
                  <div key={day} className={`h-24 rounded-2xl border-2 transition-all p-3 flex flex-col gap-1 overflow-hidden ${
                    isToday ? 'bg-[#0a2f5f] border-[#0a2f5f] shadow-lg shadow-[#0a2f5f]/20 scale-105 relative z-10' : 'bg-slate-50 border-transparent hover:border-[#0a2f5f]/10 hover:bg-white'
                  }`}>
                    <span className={`text-sm font-black ${isToday ? 'text-white' : 'text-gray-700'}`}>{day}</span>
                    <div className="flex flex-col gap-1">
                      {dayEvents.slice(0, 2).map(e => (
                        <div key={e.id} className={`text-[8px] p-1 rounded font-black uppercase tracking-tighter truncate ${
                          isToday ? 'bg-white/20 text-white' : 
                          e.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                          e.type === 'task' ? 'bg-amber-100 text-amber-700' :
                          e.type === 'expense' ? 'bg-rose-100 text-rose-700' :
                          'bg-[#0a2f5f]/10 text-[#0a2f5f]'
                        }`}>
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className={`text-[8px] font-black uppercase ${isToday ? 'text-white/60' : 'text-gray-400'}`}>
                          + {dayEvents.length - 2} More
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <Clock className="text-[#0a2f5f]" size={24} />
            <h2 className="text-2xl font-black text-[#0a2f5f] uppercase tracking-tight">Directives</h2>
            <div className="h-px flex-grow bg-gradient-to-r from-[#0a2f5f]/20 to-transparent"></div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-4">
            {loading ? (
              <div className="py-20 text-center">
                <Activity className="text-slate-300 animate-pulse mx-auto mb-4" size={32} />
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing...</div>
              </div>
            ) : events.length > 0 ? (
              events.slice(0, 6).map((event) => (
                <div key={event.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                  <div>
                    <div className="text-sm font-black text-[#0a2f5f] uppercase tracking-tight truncate max-w-[150px]">{event.title}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(event.date)} • {event.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-[#0a2f5f] opacity-40">{event.time}</div>
                    <ChevronRight size={16} className="text-slate-200 group-hover:translate-x-1 group-hover:text-[#0a2f5f] transition-all ml-auto mt-1" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center italic text-gray-400 text-sm">No scheduled events</div>
            )}
            <Link href="/planning/meetings" className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white border-2 border-[#0a2f5f]/10 text-[#0a2f5f] font-black uppercase tracking-widest text-[10px] hover:bg-[#0a2f5f] hover:text-white transition-all">
              Launch Meeting Registry
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-[#0a2f5f]" size={24} />
              <h2 className="text-2xl font-black text-[#0a2f5f] uppercase tracking-tight">System Security</h2>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed italic mb-8">
              Your administrative network is fully operational. All data points are encrypted and verified across the secure ledger.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[#0a2f5f] font-black text-xs uppercase tracking-[0.2em] bg-white p-4 rounded-2xl border">
            <ArrowUpRight size={16} />
            Network Integrity Verified
          </div>
        </div>

        <div className="bg-[#0a2f5f]/5 p-10 rounded-[3rem] border-2 border-[#0a2f5f]/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-[#0a2f5f]" size={24} />
              <h2 className="text-2xl font-black text-[#0a2f5f] uppercase tracking-tight">Performance Metrics</h2>
            </div>
            <p className="text-[#0a2f5f]/70 font-medium leading-relaxed italic mb-8">
              Operational velocity is within optimal parameters. Strategic objectives are advancing at the projected rate.
            </p>
          </div>
          <div className="text-4xl font-black text-[#0a2f5f] opacity-10">2026 Cycle Insights</div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Life Architecture Command © 2026</p>
      </footer>
      </div>
    </div>
  );
}
