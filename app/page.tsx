'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Calendar as CalendarIcon, ChevronRight, 
  Activity
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


      <section className="mb-16">
        <div>
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
                <div key={`empty-${i}`} className="min-h-[7rem]"></div>
              ))}
              {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = events.filter(e => e.date === dateStr);
                const isToday = day === new Date().getDate() && new Date().getMonth() === new Date().getMonth();
                
                return (
                  <div key={day} className={`min-h-[7rem] h-auto rounded-2xl border-2 transition-all p-3 flex flex-col gap-1 overflow-hidden ${
                    isToday ? 'bg-[#0a2f5f] border-[#0a2f5f] shadow-lg shadow-[#0a2f5f]/20 scale-105 relative z-10' : 'bg-slate-50 border-transparent hover:border-[#0a2f5f]/10 hover:bg-white'
                  }`}>
                    <span className={`text-sm font-black ${isToday ? 'text-white' : 'text-gray-700'}`}>{day}</span>
                    <div className="flex flex-col gap-1">
                      {dayEvents.slice(0, 4).map(e => (
                        <div key={e.id} className={`text-[8px] p-1 rounded font-black uppercase tracking-tighter ${
                          isToday ? 'bg-white/20 text-white' : 
                          e.category?.toUpperCase().includes('CSEA') ? 'bg-[#00326b] text-[#ffca38] border border-[#ffca38]' :
                          e.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                          e.type === 'task' ? 'bg-amber-100 text-amber-700' :
                          e.type === 'expense' ? 'bg-rose-100 text-rose-700' :
                          'bg-[#0a2f5f]/10 text-[#0a2f5f]'
                        }`}>
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 4 && (
                        <div className={`text-[8px] font-black uppercase ${isToday ? 'text-white/60' : 'text-gray-400'}`}>
                          + {dayEvents.length - 4} More
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </section>



      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Life Architecture Command © 2026</p>
      </footer>
      </div>
    </div>
  );
}
