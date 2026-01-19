'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OpusTask } from '@/types/database.types';
import { 
  CheckCircle2, Circle, 
  Utensils, Flower2, DollarSign,
  Heart, Home, Calendar, Clock
} from 'lucide-react';

const DAYS = [
  { label: 'Sunday', color: '#f38aa3' },
  { label: 'Monday', color: '#f3a25a' },
  { label: 'Tuesday', color: '#7fc9d6' },
  { label: 'Wednesday', color: '#3c6f8f' },
  { label: 'Thursday', color: '#f28b85' },
  { label: 'Friday', color: '#f1c07a' },
  { label: 'Saturday', color: '#7fc9d6' }
];

const ROUTINES = [
  {
    title: 'Home Care',
    items: ['Make beds', 'Ana - Cleaning', 'Recycling'],
    color: '#3c6f8f',
    icon: <Home size={14} className="text-[#3c6f8f]" />
  },
  {
    title: 'Self Care',
    items: ['Shower', 'Read', 'Bring lunch to work'],
    color: '#f38aa3',
    icon: <Heart size={14} className="text-[#f38aa3]" />
  },
  {
    title: 'Week days',
    items: ['Get up at 5:00 am', 'Leave work at 3:30 pm', 'Take train to work', 'Listen to Bible app'],
    color: '#f3a25a',
    icon: <Clock size={14} className="text-[#f3a25a]" />
  },
  {
    title: 'Weekends',
    items: ['Get up at 7:00 am', 'Plan/prep meals for the week', 'Laundry'],
    color: '#7fc9d6',
    icon: <Calendar size={14} className="text-[#7fc9d6]" />
  }
];

export default function PersonalPlannerPage() {
  const [tasks, setTasks] = useState<OpusTask[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday as start
    return new Date(d.setDate(diff));
  });

  useEffect(() => {
    async function fetchTasks() {
      const start = new Date(currentWeekStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 7);
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('opus_tasks')
        .select('*')
        .gte('due_date', start.toISOString().split('T')[0])
        .lte('due_date', end.toISOString().split('T')[0]);

      if (!error && data) {
        setTasks(data);
      }
    }
    fetchTasks();
  }, [currentWeekStart]);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const weekRangeLabel = `${weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()} - ${weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}`;

  const renderRoutines = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {ROUTINES.map((routine) => (
        <div key={routine.title} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            {routine.icon}
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700">{routine.title}</h3>
          </div>
          <div className="flex gap-4">
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-3 h-3 rounded-sm border border-slate-100" 
                  style={{ backgroundColor: `${routine.color}${i % 7 === 0 ? '44' : '11'}` }}
                />
              ))}
            </div>
            <ul className="space-y-1">
              {routine.items.map((item) => (
                <li key={item} className="text-[9px] text-slate-500 font-medium leading-tight">• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto bg-[#fdfdfd] min-h-screen font-sans">
      {/* Header */}
      <header className="mb-8">
        <div className="bg-[#3c6f8f] text-white py-2 px-6 text-center text-[11px] font-black tracking-[0.4em] rounded-sm mb-4">
          {weekRangeLabel}
        </div>
        {renderRoutines()}
        <div className="bg-[#f38aa3]/10 border-l-4 border-[#f38aa3] py-2 px-4 mb-8">
          <p className="text-[#f38aa3] text-[10px] font-black tracking-widest uppercase">
            ❤️ ENJOY YOUR FAMILY ❤️
          </p>
        </div>
      </header>

      {/* Weekly Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {weekDays.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayTasks = tasks.filter(t => t.due_date === dateStr);
          const dayLabel = day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
          const dayColor = DAYS[idx].color;

          return (
            <div key={dateStr} className="border-t-2 pt-4" style={{ borderColor: dayColor }}>
              <h2 className="text-[12px] font-black tracking-widest mb-6" style={{ color: dayColor }}>
                {dayLabel}
              </h2>
              
              <div className="grid grid-cols-[1fr_2fr] gap-6">
                {/* Left Side: Daily Chores/Notes */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-slate-300 rounded-sm" />
                        <div className="h-px flex-grow bg-slate-100" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Utensils size={14} className="text-slate-300 shrink-0" />
                      <div className="w-full border-b border-slate-100 h-4" />
                    </div>
                    <div className="flex gap-3">
                      <Flower2 size={14} className="text-slate-300 shrink-0" />
                      <div className="w-full border-b border-slate-100 h-4" />
                    </div>
                    <div className="flex gap-3">
                      <DollarSign size={14} className="text-slate-300 shrink-0" />
                      <div className="w-full border-b border-slate-100 h-4" />
                    </div>
                  </div>
                </div>

                {/* Right Side: Opus Tasks */}
                <div className="space-y-1">
                  {dayTasks.length > 0 ? (
                    dayTasks.map(task => (
                      <div key={task.id} className="flex items-start gap-3 py-1 group">
                        <div className="mt-1">
                          {task.completed ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : (
                            <Circle size={14} className="text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className={`text-[11px] font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {task.title}
                          </p>
                          {task.due_time && (
                            <span className="text-[9px] text-slate-400 font-medium">@ {task.due_time}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-1">
                        <div className="w-3 h-3 border border-slate-200 rounded-sm" />
                        <div className="h-px flex-grow bg-slate-50" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="mt-20 py-12 text-center">
        <p className="text-slate-300 text-[10px] font-black tracking-widest uppercase">
          Opus Personal Planner • Professional Life Architecture
        </p>
      </footer>
    </div>
  );
}
