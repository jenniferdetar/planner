'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, Heart, Sparkles, Clock, CheckCircle2, User, Layout } from 'lucide-react';

interface HabitItem {
  name: string;
}

interface Habit {
  title: string;
  items: HabitItem[];
}

interface HabitStatus {
  [key: string]: boolean;
}

interface PlannerEvent {
  id: string;
  title: string;
  time: string | null;
  endTime?: string | null;
  category: string;
  type: 'task' | 'meeting' | 'event';
  priority?: string;
  completed?: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_CLASSES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const STYLE_MAP: Record<string, { bg: string; border: string; text: string }> = {
  due:    { bg: '#ffd6e2', border: '#ff6b98', text: '#7a0f2b' },
  holiday:{ bg: '#ffe1b0', border: '#f59e0b', text: '#9a4d00' },
  csea:   { bg: '#b7dbff', border: '#3b82f6', text: '#0b3b70' },
  payday: { bg: '#c9f5dd', border: '#22c55e', text: '#0f4d2c' },
  budget: { bg: '#ffd4a8', border: '#f97316', text: '#9a3412' },
  budgetpay: { bg: '#bff0d4', border: '#10b981', text: '#0b4a3a' },
  christmas: { bg: '#0f6b3a', border: '#dc2626', text: '#ffffff' },
  birthday:{ bg: '#ffd9b5', border: '#fb923c', text: '#8a2d0f' },
  travel:  { bg: '#e0ccff', border: '#8b5cf6', text: '#4c1d95' },
  home:    { bg: '#ffeab5', border: '#eab308', text: '#7a5b00' },
  personal:{ bg: '#dbeafe', border: '#60a5fa', text: '#1e3a8a' },
  burntorange: { bg: '#c75b12', border: '#8d3f0c', text: '#ffffff' },
  default:{ bg: '#e5e7eb', border: '#9ca3af', text: '#111827' }
};

const BUDGET_DATA: Record<string, number> = {
  'ADT': 53,
  'HELOC': 357,
  'HOA': 520,
  'Mortgage': 2250,
  'Spectrum': 197,
  'Verizon': 283,
  'Paramount+': 13,
  'Taxes': 0
};

export default function PersonalPlannerPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
  });

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitStatus, setHabitStatus] = useState<HabitStatus>({});
  const [eventsByDate, setEventsByDate] = useState<Record<string, PlannerEvent[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchPlannerData = useCallback(async () => {
    setLoading(true);
    
    // Calculate week range
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      weekDates.push(d.toISOString().split('T')[0]);
    }
    const startDate = weekDates[0];
    const endDate = weekDates[6];

    try {
      // 1. Fetch habits and habit status
      const { data: habitsData } = await supabase
        .from('opus_metadata')
        .select('key, value')
        .in('key', ['habits', 'habitStatus']);

      const habitsList = habitsData?.find(d => d.key === 'habits')?.value || [];
      const statusMap = habitsData?.find(d => d.key === 'habitStatus')?.value || {};
      
      setHabits(habitsList);
      setHabitStatus(statusMap);

      // 2. Fetch tasks for the week
      const { data: tasks } = await supabase
        .from('opus_tasks')
        .select('*')
        .gte('due_date', startDate)
        .lte('due_date', endDate);

      // 3. Fetch meetings for the week
      const { data: meetings } = await supabase
        .from('opus_meetings')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      // Organize events by date
      const eventMap: Record<string, PlannerEvent[]> = {};
      weekDates.forEach(date => {
        eventMap[date] = [];
        
        // Add tasks
        tasks?.filter(t => t.due_date === date).forEach(t => {
          eventMap[date].push({
            id: t.id,
            title: t.title,
            time: t.due_time,
            category: t.category,
            type: 'task',
            priority: t.priority,
            completed: t.completed
          });
        });

        // Add meetings
        meetings?.filter(m => m.date === date).forEach(m => {
          eventMap[date].push({
            id: m.id,
            title: m.title,
            time: m.start_time,
            endTime: m.end_time,
            category: 'meeting',
            type: 'meeting'
          });
        });
        
        // Sort by time
        eventMap[date].sort((a, b) => {
          if (!a.time) return -1;
          if (!b.time) return 1;
          return a.time.localeCompare(b.time);
        });
      });

      setEventsByDate(eventMap);
    } catch (error) {
      console.error('Error fetching planner data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchPlannerData();
  }, [fetchPlannerData]);

  const navigateWeek = (direction: number) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction * 7));
    setCurrentWeekStart(newStart);
  };

  const toggleHabit = async (completionKey: string) => {
    const newStatus = { ...habitStatus, [completionKey]: !habitStatus[completionKey] };
    setHabitStatus(newStatus);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: 'habitStatus',
        value: newStatus,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });
  };

  const formatDateRange = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return `${currentWeekStart.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const classifyEvent = (event: PlannerEvent) => {
    const text = (event.title || '').toLowerCase();
    const category = (event.category || '').toLowerCase();
    const holidays = /new year|ml king|groundhog|valentine|president|chinese new year|mardi gras|ash wednesday|st\.? patrick|easter|april fool|passover|good friday|cinco de mayo|mother's day|armed forces|memorial|juneteenth|father's day|independence|labor|patriot|rosh hashanah|grandparent|constitution|yom kippur|columbus|boss's|united nations|halloween|veteran|daylight saving|thanksgiving|christmas|kwanzaa|new year's eve|pearl harbor/i;

    if (category === 'birthday' || /birthday/i.test(text)) return 'birthday';
    if (/payday/i.test(text)) return 'payday';
    if (/budget.*pay|pay.*bills/i.test(text)) return 'budgetpay';
    if (/budget/i.test(text) || category === 'budget') return 'budget';
    if (category === 'christmas' || /christmas/i.test(text)) return 'christmas';
    if (/content release|mentored session/i.test(text)) return 'burntorange';
    if (/due/i.test(text) || category === 'finance') return 'due';
    if (holidays.test(text) || category === 'holiday') return 'holiday';
    if (/csea/i.test(text) || /la fed/i.test(text) || category === 'csea') return 'csea';
    if (/stay at|travel|hotel|vacation/i.test(text) || category === 'travel') return 'travel';
    if (/laundry|sweeping|cleaning|home care/i.test(text) || category === 'home') return 'home';
    if (/shower|bedtime|self care/i.test(text) || category === 'personal') return 'personal';
    return 'default';
  };

  const getEventStyle = (event: PlannerEvent) => {
    const type = classifyEvent(event);
    return STYLE_MAP[type] || STYLE_MAP.default;
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minutes}${ampm}`;
  };

  const weekKey = currentWeekStart.toISOString().split('T')[0];

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto bg-[#fdfdfd] min-h-screen">
      <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-[#99B3C5] flex items-center justify-center shadow-2xl shadow-[#99B3C5]/20">
            <User className="text-[#00326b]" size={36} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#00326b] tracking-tight uppercase">Personal Planner</h1>
            <div className="flex gap-3 mt-2">
              <span className="px-3 py-1 bg-[#99B3C5]/10 text-[#99B3C5] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#99B3C5]/20">Life Architecture</span>
              <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100 italic">Weekly Schedule & Habits</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border-2 border-gray-100 shadow-xl shadow-gray-200/40 w-full sm:w-auto justify-between sm:justify-start">
            <button onClick={() => navigateWeek(-1)} className="p-3 hover:bg-[#99B3C5]/10 text-[#00326b] rounded-xl transition-all"><ChevronLeft size={20} /></button>
            <div className="font-black text-[#00326b] uppercase tracking-widest text-xs min-w-[280px] text-center">{formatDateRange()}</div>
            <button onClick={() => navigateWeek(1)} className="p-3 hover:bg-[#99B3C5]/10 text-[#00326b] rounded-xl transition-all"><ChevronRight size={20} /></button>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Link 
              href="/planning/personal" 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-[#99B3C5] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#99B3C5]/30 transition-all"
            >
              <User size={14} />
              Personal
            </Link>
            <Link 
              href="/planning/work" 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all"
            >
              <Layout size={14} />
              Work Grid
            </Link>
          </div>
        </div>
      </header>

      {/* Habit Grid */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="text-[#99B3C5]" size={24} />
          <h2 className="text-2xl font-black text-[#00326b] uppercase tracking-tight">Habit Matrix</h2>
          <div className="h-px flex-grow bg-gradient-to-r from-[#00326b]/20 to-transparent"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {habits.map((habit, hIdx) => (
            <div key={hIdx} className="bg-white rounded-[2.5rem] border-2 border-gray-50 p-8 shadow-xl shadow-gray-200/40 hover:border-[#99B3C5]/30 transition-all group">
              <h2 className="text-2xl font-black text-[#00326b] mb-6 flex items-center justify-between">
                {habit.title}
                <div className={`w-8 h-8 rounded-xl ${hIdx === 0 ? 'bg-[#99B3C5]' : hIdx === 1 ? 'bg-[#FFA1AB]' : 'bg-[#FFC68D]'} opacity-20 group-hover:opacity-100 transition-opacity`}></div>
              </h2>
              <div className="mb-8 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                <div className="flex justify-between text-[9px] font-black text-gray-300 mb-3 px-2">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => <span key={i} className="w-8 text-center">{d}</span>)}
                </div>
                <div className="space-y-2">
                  {(habit.items.length > 0 ? habit.items : [{ name: '' }, { name: '' }, { name: '' }]).map((item, iIdx) => (
                    <div key={iIdx} className="flex justify-between items-center gap-1">
                      {DAYS.map((_, dIdx) => {
                        const dayClass = DAY_CLASSES[dIdx];
                        const completionKey = `${weekKey}-${habit.title}-${item.name}-${dayClass}`;
                        const isCompleted = habitStatus[completionKey];
                        return (
                          <button
                            key={dIdx}
                            onClick={() => item.name && toggleHabit(completionKey)}
                            className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${
                              !item.name ? 'border-transparent bg-gray-50/50' :
                              isCompleted 
                                ? 'bg-[#00326b] border-[#00326b] shadow-lg shadow-[#00326b]/20 scale-110' 
                                : 'bg-white border-gray-100 hover:border-[#99B3C5]'
                            }`}
                          >
                            {isCompleted && <CheckCircle2 size={14} className="text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <ul className="space-y-3">
                {habit.items.map((item, iIdx) => (
                  <li key={iIdx} className="text-xs font-bold text-gray-500 flex items-center gap-3 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#99B3C5]"></div>
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full h-2 bg-gradient-to-r from-transparent via-red-50 to-transparent mb-16 relative">
        <div className="absolute left-1/2 -translate-x-1/2 -top-4 bg-[#fdfdfd] px-8 text-[#FFA1AB] font-black uppercase tracking-[0.4em] text-xs">Enjoy Your Family ♥</div>
      </div>

      {/* Weekly Schedule Blocks */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        {DAYS.map((day, dIdx) => {
          const date = new Date(currentWeekStart);
          date.setDate(date.getDate() + dIdx);
          const dateKey = date.toISOString().split('T')[0];
          const dayEvents = eventsByDate[dateKey] || [];
          
          let dayDueTotal = 0;
          dayEvents.forEach(e => {
            if (e.title.toLowerCase().includes('due')) {
              const itemKey = e.title.replace(/\s+Due$/i, '').trim();
              dayDueTotal += BUDGET_DATA[itemKey] || 0;
            }
          });

          return (
            <div key={day} className="flex flex-col h-full bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/30 overflow-hidden min-h-[500px] group hover:border-[#99B3C5]/30 transition-all">
              <div className={`p-6 text-center border-b-2 font-black ${
                dIdx === 0 ? 'bg-red-50/30 border-red-100 text-[#00326b]' :
                dIdx === 6 ? 'bg-blue-50/30 border-blue-100 text-[#00326b]' :
                'bg-slate-50/50 border-gray-50 text-[#00326b]'
              }`}>
                <div className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-1">{day}</div>
                <div className="text-xl tracking-tight">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
              
              <div className="p-6 flex-grow space-y-6">
                {/* Visual Indicators */}
                <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg grayscale group-hover:grayscale-0 transition-all">🍴</span>
                    <div className="h-0.5 flex-grow bg-gray-100 group-hover:bg-[#FFC68D]/20 transition-all"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg grayscale group-hover:grayscale-0 transition-all">✿</span>
                    <div className="h-0.5 flex-grow bg-gray-100 group-hover:bg-[#FFA1AB]/20 transition-all"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-[#99B3C5]">$</span>
                    <div className="h-0.5 flex-grow bg-gray-100 group-hover:bg-[#99B3C5]/20 transition-all text-right font-black text-[#00326b] text-[10px] tracking-widest">
                      {dayDueTotal > 0 ? `$${dayDueTotal}` : ''}
                    </div>
                  </div>
                </div>

                {/* Events Section */}
                <div className="space-y-3">
                  {dayEvents.map((event, eIdx) => {
                    const style = getEventStyle(event);
                    return (
                      <div 
                        key={eIdx}
                        className="p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border leading-tight shadow-sm hover:scale-105 transition-transform"
                        style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text }}
                      >
                        {event.time && <div className="mb-1 opacity-60 flex items-center gap-1"><Clock size={10} /> {formatTime(event.time)}</div>}
                        {event.title}
                      </div>
                    );
                  })}
                  
                  {/* Registry Lines */}
                  {Array.from({ length: Math.max(0, 8 - dayEvents.length) }).map((_, i) => (
                    <div key={i} className="h-8 border-b border-dashed border-gray-100 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-[#99B3C5]/20 border-t-[#99B3C5] rounded-full animate-spin mb-4 shadow-2xl"></div>
          <p className="text-[10px] font-black text-[#00326b] uppercase tracking-[0.4em]">Calibrating Planner...</p>
        </div>
      )}
      
      <footer className="mt-24 py-16 border-t border-gray-100 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] opacity-[0.02] pointer-events-none font-black text-[#00326b]">
          2026
        </div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] relative z-10">Life Architecture Registry © 2026</p>
      </footer>
    </div>
  );
}
