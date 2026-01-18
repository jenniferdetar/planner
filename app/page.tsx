'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar as CalendarIcon, ChevronRight, 
  Activity, ChevronLeft
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  type: 'meeting' | 'task' | 'event' | 'expense';
  time?: string;
}


export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const fetchCalendarData = React.useCallback(async (date: Date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const startStr = startOfMonth.toISOString().split('T')[0];
    
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
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

    // Deduplicate events by title and date
    const uniqueEvents = combinedEvents.reduce((acc: CalendarEvent[], current) => {
      const x = acc.find(item => item.title === current.title && item.date === current.date);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    setEvents(uniqueEvents.sort((a, b) => a.date.localeCompare(b.date)));
  }, []);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      if (!ignore) fetchCalendarData(currentDate);
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [currentDate, fetchCalendarData]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-Us', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-[#fdfdfd] min-h-screen">
      <div className="p-3 md:p-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-3 mb-6">
          <Link href="/planning/personal" className="planner-header-pill pill-personal">Personal Planner</Link>
          <Link href="/planning/work" className="planner-header-pill pill-work">Work Planner</Link>
        </div>
      <section className="mb-10">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <CalendarIcon className="text-[#0a2f5f]" size={24} />
              <h2 className="text-2xl font-black text-[#0a2f5f] tracking-tight">Operational Calendar</h2>
              <span className="ml-4 text-xl font-bold text-[#0a2f5f]/60">{monthName} {year}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={goToToday}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-[10px] font-black text-[#0a2f5f] transition-colors mr-2"
              >
                Today
              </button>
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-[#0a2f5f]"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-[#0a2f5f]"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm overflow-hidden p-6">
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[5rem]"></div>
              ))}
              {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = events.filter(e => e.date === dateStr);
                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                
                return (
                  <div key={day} className={`min-h-[5rem] h-auto rounded-2xl border-2 transition-all p-2 flex flex-col gap-1 overflow-hidden text-center ${
                    isToday ? 'bg-[#0a2f5f] border-[#0a2f5f] shadow-lg shadow-[#0a2f5f]/20 scale-105 relative z-10' : 'bg-slate-50 border-slate-200 hover:border-[#0a2f5f]/20 hover:bg-white'
                  }`}>
                    <span className={`text-sm font-black ${isToday ? 'text-white' : 'text-gray-700'}`}>{day}</span>
                    <div className="flex flex-col gap-1">
                      {dayEvents.slice(0, 4).map(e => (
                        <div 
                          key={e.id} 
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setSelectedEvent(e);
                          }}
                          className={`text-[8px] px-2 py-1 rounded-full font-black cursor-pointer hover:brightness-95 transition-all ${
                            isToday ? 'bg-white/20 text-white border border-white/30' : 
                            e.category?.toUpperCase().includes('CSEA') ? 'bg-[#00326b] text-[#ffca38] border border-[#ffca38]' :
                            e.type === 'meeting' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            e.type === 'task' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            e.type === 'expense' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                            'bg-[#0a2f5f]/10 text-[#0a2f5f] border border-[#0a2f5f]/20'
                          }`}
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 4 && (
                        <div className={`text-[8px] font-black px-2 ${isToday ? 'text-white/60' : 'text-gray-400'}`}>
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
        <p className="text-gray-400 text-[10px] font-black">Life Architecture Command © 2026</p>
      </footer>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-[#0a2f5f]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border-4 border-[#0a2f5f]/10 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className={`px-4 py-2 rounded-2xl text-[10px] font-black ${
                selectedEvent.category?.toUpperCase().includes('CSEA') ? 'bg-[#00326b] text-[#ffca38]' : 'bg-slate-100 text-slate-500'
              }`}>
                {selectedEvent.category}
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Activity size={20} className="text-slate-300" />
              </button>
            </div>
            
            <h3 className="text-3xl font-black text-[#0a2f5f] tracking-tight mb-4">
              {selectedEvent.title}
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-gray-500">
                <CalendarIcon size={18} />
                <span className="font-bold text-xs">
                  {formatDate(selectedEvent.date)} {selectedEvent.time ? `@ ${selectedEvent.time}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <div className={`w-3 h-3 rounded-full ${
                  selectedEvent.type === 'meeting' ? 'bg-blue-400' :
                  selectedEvent.type === 'task' ? 'bg-amber-400' :
                  selectedEvent.type === 'expense' ? 'bg-rose-400' :
                  'bg-slate-400'
                }`} />
                <span className="font-bold text-xs">
                  Operational type: {selectedEvent.type}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedEvent(null)}
              className="w-full py-4 bg-[#0a2f5f] text-white rounded-2xl font-black text-xs shadow-xl shadow-[#0a2f5f]/20 hover:bg-[#00254d] transition-all"
            >
              Acknowledge directive
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
