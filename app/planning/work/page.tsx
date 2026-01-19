'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

import { Briefcase, Target, Zap, Award, Clock, User, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { OpusGoal } from '@/types/database.types';

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

const STYLE_MAP: Record<string, { bg: string; border: string; text: string }> = {
  due:    { bg: '#dc2626', border: '#facc15', text: '#ffffff' },
  holiday:{ bg: '#ffe1b0', border: '#f59e0b', text: '#9a4d00' },
  csea:   { bg: '#b7dbff', border: '#3b82f6', text: '#0b3b70' },
  payday: { bg: '#22c55e', border: '#facc15', text: '#ffffff' },
  budget: { bg: '#ffd4a8', border: '#f97316', text: '#9a3412' },
  budgetpay: { bg: '#bff0d4', border: '#10b981', text: '#0b4a3a' },
  lunch: { bg: '#00493a', border: '#00493a', text: '#edf0ee' },
  christmas: { bg: '#0f6b3a', border: '#dc2626', text: '#ffffff' },
  birthday:{ bg: '#ffd9b5', border: '#fb923c', text: '#8a2d0f' },
  travel:  { bg: '#e0ccff', border: '#8b5cf6', text: '#4c1d95' },
  home:    { bg: '#ffeab5', border: '#eab308', text: '#7a5b00' },
  personal:{ bg: '#dbeafe', border: '#60a5fa', text: '#1e3a8a' },
  burntorange: { bg: '#c75b12', border: '#8d3f0c', text: '#ffffff' },
  default:{ bg: '#e5e7eb', border: '#9ca3af', text: '#111827' }
};

const getHourSlots = (start: number, end: number, step: number = 30) => {
  const slots = [];
  for (let hour = start; hour <= end; hour++) {
    for (let min = 0; min < 60; min += step) {
      if (hour === end && min > 0) break;
      const hh = String(hour).padStart(2, '0');
      const mm = String(min).padStart(2, '0');
      const time = `${hh}:${mm}`;
      const displayH = hour % 12 || 12;
      const ampm = hour >= 12 ? 'pm' : 'am';
      slots.push({ time, display: `${displayH}:${mm}${ampm}` });
    }
  }
  return slots;
};

const TIME_SLOTS = getHourSlots(5, 20); // 5am to 8pm

export default function WorkPlannerPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    date.setDate(d.getDate() - day);
    return date;
  });

  const [edits, setEdits] = useState<Record<string, Record<string, string>>>({});
  const [priorities, setPriorities] = useState<Record<string, string>>({});
  const [weeklyTaskStatus, setWeeklyTaskStatus] = useState<Record<string, Record<string, boolean>>>({});
  const [eventsByDate, setEventsByDate] = useState<Record<string, PlannerEvent[]>>({});
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<OpusGoal[]>([]);

  const fetchWorkData = useCallback(async () => {
    setLoading(true);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      weekDates.push(d.toISOString().split('T')[0]);
    }
    const startDate = weekDates[0];
    const endDate = weekDates[6];

    try {
      const { data: metadata } = await supabase
        .from('opus_metadata')
        .select('key, value')
        .in('key', ['workPlannerEdits', 'workPlannerPriorities', 'weeklyTaskStatus', 'smartGoals']);

      setEdits(metadata?.find(d => d.key === 'workPlannerEdits')?.value || {});
      setPriorities(metadata?.find(d => d.key === 'workPlannerPriorities')?.value || {});
      setWeeklyTaskStatus(metadata?.find(d => d.key === 'weeklyTaskStatus')?.value || {});
      
      const { data: goalsData } = await supabase.from('opus_goals').select('*');
      setGoals(goalsData || []);

      const { data: tasks } = await supabase
        .from('opus_tasks')
        .select('*')
        .gte('due_date', startDate)
        .lte('due_date', endDate);

      const { data: meetings } = await supabase
        .from('opus_meetings')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      const eventMap: Record<string, PlannerEvent[]> = {};
      weekDates.forEach(date => {
        eventMap[date] = [];
        tasks?.filter(t => t.due_date === date).forEach(t => {
          let dueTime = t.due_time;
          if (t.title?.toUpperCase().includes('NEO')) {
            dueTime = '12:00';
          } else if (t.title?.toUpperCase().includes('RPM')) {
            dueTime = '17:30';
          }
          
          eventMap[date].push({
            id: t.id,
            title: t.title,
            time: dueTime,
            category: t.category,
            type: 'task',
            priority: t.priority,
            completed: t.completed
          });
        });
        meetings?.filter(m => m.date === date).forEach(m => {
          let startTime = m.start_time;
          if (m.title?.toUpperCase().includes('NEO')) {
            startTime = '12:00';
          } else if (m.title?.toUpperCase().includes('RPM')) {
            startTime = '17:30';
          }

          eventMap[date].push({
            id: m.id,
            title: m.title,
            time: startTime,
            endTime: m.end_time,
            category: 'meeting',
            type: 'meeting'
          });
        });
      });
      setEventsByDate(eventMap);
    } catch (error) {
      console.error('Error fetching work planner data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchWorkData();
  }, [fetchWorkData]);

  const handleEdit = async (dateKey: string, slotKey: string, text: string) => {
    const newEdits = { ...edits };
    if (!newEdits[dateKey]) newEdits[dateKey] = {};
    if (text) {
      newEdits[dateKey][slotKey] = text;
    } else {
      delete newEdits[dateKey][slotKey];
      if (Object.keys(newEdits[dateKey]).length === 0) delete newEdits[dateKey];
    }
    setEdits(newEdits);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: 'workPlannerEdits',
        value: newEdits,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });
  };

  const handlePriorityEdit = async (key: string, text: string) => {
    const newPriorities = { ...priorities, [key]: text };
    setPriorities(newPriorities);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: 'workPlannerPriorities',
        value: newPriorities,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });
  };

  const toggleWeeklyTask = async (weekKey: string, taskName: string) => {
    const newStatus = { ...weeklyTaskStatus };
    if (!newStatus[weekKey]) newStatus[weekKey] = {};
    newStatus[weekKey][taskName] = !newStatus[weekKey][taskName];
    setWeeklyTaskStatus(newStatus);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: 'weeklyTaskStatus',
        value: newStatus,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const timeToMinutes = (hhmm: string | null) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  const coversSlot = (event: PlannerEvent, slotMinutes: number) => {
    const start = timeToMinutes(event.time);
    if (start === null) return false;
    const end = event.endTime ? (timeToMinutes(event.endTime) ?? start + 30) : start + 30;
    return slotMinutes >= start && slotMinutes < end;
  };

  const classifyEvent = (event: PlannerEvent) => {
    const text = (event.title || '').toLowerCase();
    const category = (event.category || '').toLowerCase();
    if (/due/i.test(text) || /due/i.test(category)) return 'due';
    if (category === 'meeting' || /meeting/i.test(text)) return 'csea';
    if (/lunch/i.test(text)) return 'lunch';
    if (/paydy/i.test(text) || /payday/i.test(text)) return 'payday';
    return 'default';
  };

  const weekKey = currentWeekStart.toISOString().split('T')[0];

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto bg-[#fdfdfd] min-h-screen">

      {/* Priorities Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <Target className="text-[#9ADBDE]" size={24} />
          <h2 className="text-2xl font-black text-[#0a2f5f] tracking-tight">Strategic Priorities</h2>
          <div className="h-px flex-grow bg-gradient-to-r from-[#0a2f5f]/20 to-transparent"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { key: 'p1', label: 'Primary Directive', icon: <Award className="text-amber-500" size={18} />, placeholder: 'Priority #1' },
            { key: 'p2', label: 'Secondary Goal', icon: <Target className="text-emerald-500" size={18} />, placeholder: 'Priority #2' },
            { key: 'p3', label: 'Tactical Objective', icon: <Zap className="text-indigo-500" size={18} />, placeholder: 'Priority #3' },
            { key: 'look-forward', label: 'Future Milestone', icon: <Clock className="text-rose-500" size={18} />, placeholder: 'One thing I&apos;m looking forward to' },
            { key: 'encourage', label: 'Team Engagement', icon: <User className="text-sky-500" size={18} />, placeholder: 'Someone I can encourage' },
            { key: 'learn', label: 'Skill Acquisition', icon: <Briefcase className="text-purple-500" size={18} />, placeholder: 'Something I&apos;d like to read or listen to' },
          ].map((item) => (
            <div key={item.key} className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 shadow-xl shadow-gray-200/40 group hover:border-[#9ADBDE]/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">{item.icon}</div>
                <label className="text-[10px] font-black text-gray-400 tracking-wider">{item.label}</label>
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handlePriorityEdit(item.key, e.target.innerText)}
                className="w-full min-h-[80px] p-6 bg-slate-50/50 border-2 border-transparent focus:border-[#9ADBDE]/20 rounded-2xl outline-none font-bold text-[#0a2f5f] transition-all text-sm leading-relaxed relative"
              >
                {priorities[item.key] || ''}
                {!priorities[item.key] && (
                  <span className="absolute inset-0 p-6 pointer-events-none text-gray-300 italic font-medium">
                    {item.placeholder}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Weekly Grid */}
      <section className="bg-white rounded-[3.5rem] border-2 border-gray-50 shadow-2xl shadow-gray-200/50 overflow-hidden mb-16 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#9ADBDE]"></div>
        
        <div className="bg-[#0a2f5f] p-10 text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight">Weekly Operations Matrix</h2>
            <p className="text-xs opacity-60 font-bold tracking-wider mt-2">Real-time scheduling and registry log</p>
            <div className="flex items-center gap-4 mt-6">
              <button 
                onClick={prevWeek}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-sm font-black tracking-widest uppercase">
                Week of {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <button 
                onClick={nextWeek}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-end">
            <div className="text-[10px] font-black tracking-widest bg-[#9ADBDE] px-6 py-2 rounded-full shadow-xl text-[#0a2f5f]">High Fidelity Record</div>
            <div className="text-[9px] font-bold opacity-40 mt-3 tracking-wider italic text-white">Archival System v2.0</div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-full bg-grid-white/[0.05] [mask-image:linear-gradient(to_left,white,transparent)]"></div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex min-w-[1400px]">
            {DAYS.map((day: string, dIdx: number) => {
              const date = new Date(currentWeekStart);
              date.setDate(date.getDate() + dIdx);
              const dateKey = date.toISOString().split('T')[0];
              const dayEvents = eventsByDate[dateKey] || [];
              const allDayEvents = dayEvents.filter(e => !e.time);

              return (
                <div key={day} className={`flex-1 min-w-[200px] border-r border-gray-50 last:border-r-0 ${
                  dIdx === 0 || dIdx === 6 ? 'bg-slate-50/30' : 'bg-white'
                }`}>
                  <div className={`p-6 text-center border-b-2 font-black ${
                    dIdx === 0 ? 'border-red-100 text-[#0a2f5f]' :
                    dIdx === 6 ? 'border-blue-100 text-[#0a2f5f]' :
                    'border-gray-50 text-[#0a2f5f]'
                  }`}>
                    <div className="text-[10px] tracking-wider opacity-40 mb-1">{day}</div>
                    <div className="text-xl tracking-tight">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>

                  {/* All Day Slot */}
                  <div className="p-4 min-h-[80px] border-b border-gray-50 bg-amber-50/20 relative group">
                    <div className="absolute top-2 left-4 text-[8px] font-black text-amber-600/40 tracking-wider">Global Events</div>
                    {allDayEvents.length > 0 ? (
                      <div className="space-y-1.5 pt-4">
                        {allDayEvents.map((e, i) => (
                          <div key={i} className="text-[9px] p-2 bg-amber-100 text-amber-800 rounded-xl font-black tracking-wider border border-amber-200 shadow-sm">
                            {e.title}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleEdit(dateKey, 'all-day', e.target.innerText)}
                        className="w-full h-full text-[9px] pt-4 outline-none font-black tracking-wider text-gray-300 italic"
                      >
                        {edits[dateKey]?.['all-day'] || 'Log Entry...'}
                      </div>
                    )}
                  </div>

                  {/* 30-min Slots */}
                  <div className="divide-y divide-gray-50/50">
                    {TIME_SLOTS.map((slot) => {
                      const slotMinutes = timeToMinutes(slot.time) || 0;
                      const slotEvents = dayEvents.filter(e => e.time && coversSlot(e, slotMinutes));
                      const isEven = (slotMinutes / 30) % 2 === 0;

                      return (
                        <div key={slot.time} className={`flex h-14 group transition-all hover:bg-[#9ADBDE]/5 ${!isEven ? 'bg-slate-50/10' : ''}`}>
                          <div className="w-14 text-[8px] font-black text-gray-300 flex items-center justify-center border-r border-gray-50 bg-white/50">
                            {isEven ? slot.display.toLowerCase() : ''}
                          </div>
                          <div className="flex-grow p-1.5 overflow-hidden relative">
                            {slotEvents.length > 0 ? (
                              <div className="space-y-1">
                                {slotEvents.map((e, i) => {
                                  const style = STYLE_MAP[classifyEvent(e)] || STYLE_MAP.default;
                                  return (
                                    <div 
                                      key={i} 
                                      className="text-[9px] p-1.5 rounded-lg border leading-tight truncate font-black tracking-wider shadow-sm hover:scale-[1.02] transition-transform"
                                      style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text }}
                                    >
                                      {e.title}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleEdit(dateKey, slot.time, e.target.innerText)}
                                className="w-full h-full text-[9px] p-1 outline-none font-bold text-gray-400 group-hover:text-[#0a2f5f] opacity-0 group-hover:opacity-100 transition-all"
                              >
                                {edits[dateKey]?.[slot.time] || ''}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-[#9ADBDE]/20 border-t-[#9ADBDE] rounded-full animate-spin mb-4 shadow-2xl"></div>
          <p className="text-[10px] font-black text-[#0a2f5f] tracking-widest">Synchronizing Registry...</p>
        </div>
      )}
      
      <footer className="mt-24 py-16 border-t border-gray-100 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] opacity-[0.02] pointer-events-none font-black text-[#0a2f5f]">
          Operations
        </div>
        <p className="text-gray-400 text-[10px] font-black tracking-widest relative z-10">Professional Operations Log © 2026</p>
      </footer>

      {/* Weekly Tasks Section */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#0a2f5f] flex items-center gap-2">
            <span>📋</span> Weekly Tasks
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#e0592a] transition-all duration-500"
                style={{ width: `${Math.round(((Object.values(weeklyTaskStatus[weekKey] || {}).filter(Boolean).length) / Math.max(1, goals.length)) * 100)}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-gray-500">Progress</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {goals.length > 0 ? (
            goals.map((goal, gIdx) => (
              <button
                key={gIdx}
                onClick={() => toggleWeeklyTask(weekKey, goal.title)}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all group ${
                  weeklyTaskStatus[weekKey]?.[goal.title] 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-white border-gray-100 hover:border-orange-200 hover:bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  weeklyTaskStatus[weekKey]?.[goal.title]
                  ? 'bg-[#e0592a] border-[#e0592a] text-white'
                  : 'border-gray-200 group-hover:border-[#e0592a]'
                }`}>
                  {weeklyTaskStatus[weekKey]?.[goal.title] && <CheckCircle2 size={14} />}
                </div>
                <span className={`font-semibold text-sm ${weeklyTaskStatus[weekKey]?.[goal.title] ? 'text-[#e0592a] line-through' : 'text-gray-700'}`}>
                  {goal.title}
                </span>
              </button>
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed">
              No active goals found. Set some goals in the Planning Hub to see weekly tasks.
            </div>
          )}
        </div>
      </section>

      {loading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e0592a]"></div>
        </div>
      )}
    </div>
  );
}
