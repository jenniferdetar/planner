'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OpusTask } from '@/types/database.types';
import { 
  CheckCircle2, Circle, 
  Utensils, Flower2, DollarSign,
  Heart, Home, Calendar, Clock,
  ChevronLeft, ChevronRight
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
  const [habitStatus, setHabitStatus] = useState<Record<string, boolean[]>>({});
  const [dailyNotes, setDailyNotes] = useState<Record<string, Record<string, string>>>({});
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday as start
    return new Date(d.setDate(diff));
  });

  useEffect(() => {
    async function fetchData() {
      // Fetch Tasks
      const start = new Date(currentWeekStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const { data: tasksData } = await supabase
        .from('opus_tasks')
        .select('*')
        .gte('due_date', start.toISOString().split('T')[0])
        .lte('due_date', end.toISOString().split('T')[0]);

      if (tasksData) {
        // Deduplicate tasks by title and date
        const uniqueTasks = tasksData.reduce((acc: OpusTask[], current) => {
          const x = acc.find(item => item.title === current.title && item.due_date === current.due_date);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        setTasks(uniqueTasks);
      }

      // Fetch Metadata
      const { data: metadata } = await supabase
        .from('opus_metadata')
        .select('key, value')
        .in('key', ['personalHabits', 'personalNotes']);

      const habits = metadata?.find(m => m.key === 'personalHabits')?.value as Record<string, boolean[]> || {};
      const notes = metadata?.find(m => m.key === 'personalNotes')?.value as Record<string, Record<string, string>> || {};
      
      setHabitStatus(habits);
      setDailyNotes(notes);
    }
    fetchData();
  }, [currentWeekStart]);

  const saveMetadata = async (key: string, value: Record<string, unknown> | boolean[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key,
        value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });
  };

  const toggleHabit = (routineTitle: string, itemIndex: number, dayIndex: number) => {
    const key = `${routineTitle}-${itemIndex}`;
    const current = habitStatus[key] || Array(7).fill(false);
    const updated = [...current];
    updated[dayIndex] = !updated[dayIndex];
    
    const newHabits = { ...habitStatus, [key]: updated };
    setHabitStatus(newHabits);
    saveMetadata('personalHabits', newHabits);
  };

  const updateNote = (dateStr: string, key: string, text: string) => {
    const newNotes = { ...dailyNotes };
    if (!newNotes[dateStr]) newNotes[dateStr] = {};
    newNotes[dateStr][key] = text;
    
    setDailyNotes(newNotes);
    saveMetadata('personalNotes', newNotes);
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, completed: !currentStatus } : t
    );
    setTasks(updatedTasks);

    await supabase
      .from('opus_tasks')
      .update({ completed: !currentStatus })
      .eq('id', taskId);
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

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const weekRangeLabel = `${weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()} - ${weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}`;

  const dayHeaderColors = ['#f7b7b7', '#f7d1a3', '#c7e7ea', '#b7c4d3', '#f7b7b7', '#f7d1a3', '#c7e7ea'];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Force redeploy trigger
  const renderRoutines = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 mb-10">
      {ROUTINES.map((routine, routineIdx) => {
        return (
          <div key={routine.title} className="bg-transparent p-0">
            <h3 className="text-lg font-black text-center tracking-[0.12em] text-slate-700 mb-4">
              {routine.title}
            </h3>
            <div className="grid grid-cols-[auto_1fr] gap-6 items-start">
              <div>
                {routineIdx < 2 && (
                  <div className="grid grid-cols-7 gap-2 mb-3 justify-items-center">
                    {dayLabels.map((label, i) => (
                      <span key={`${label}-${i}`} className="text-sm font-black" style={{ color: dayHeaderColors[i] }}>
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {routine.items.map((_, itemIdx) => {
                    const habits = habitStatus[`${routine.title}-${itemIdx}`] || Array(7).fill(false);
                    return (
                      <div key={`${routine.title}-${itemIdx}`} className="grid grid-cols-7 gap-2">
                        {habits.map((completed, dayIdx) => (
                          <button
                            key={`${routine.title}-${itemIdx}-${dayIdx}`}
                            type="button"
                            onClick={() => toggleHabit(routine.title, itemIdx, dayIdx)}
                            className="w-[22px] h-[22px] rounded-sm border border-white/80 cursor-pointer transition-transform hover:scale-105"
                            style={{
                              backgroundColor: dayHeaderColors[dayIdx],
                              opacity: completed ? 1 : 0.55
                            }}
                            aria-pressed={completed}
                            aria-label={`${routine.title} ${routine.items[itemIdx]} ${DAYS[dayIdx].label}`}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
              <ul
                className={`text-[22px] text-slate-600 font-medium leading-none list-none flex flex-col gap-2 ${
                  routineIdx < 2 ? 'pt-[36px]' : 'pt-[6px]'
                }`}
              >
                {routine.items.map((item) => (
                  <li key={item} className="h-[22px] flex items-center">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="p-4 md:p-6 w-full bg-[#fdfdfd] min-h-screen font-handwriting">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={prevWeek}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-grow bg-[#3c6f8f] text-white py-2 px-6 text-center text-sm font-black tracking-[0.4em] rounded-sm">
            {weekRangeLabel}
          </div>
          <button 
            onClick={nextWeek}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        {renderRoutines()}
        <div className="bg-[#f38aa3]/10 border-l-4 border-[#f38aa3] py-2 px-4 mb-8">
          <p className="text-[#f38aa3] text-sm font-black tracking-widest uppercase">
            ❤️ ENJOY YOUR FAMILY ❤️
          </p>
        </div>
      </header>

      {/* Weekly Columns */}
      <div className="flex flex-col gap-12">
        {weekDays.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayTasks = tasks.filter(t => t.due_date === dateStr);
          const dayLabel = day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
          const dayColor = DAYS[idx].color;

          return (
            <div key={dateStr} className="border-t-2 pt-6 pb-6 bg-white rounded-2xl px-6 shadow-sm border-slate-100" style={{ borderTopColor: dayColor }}>
              <h2 className="text-lg font-black tracking-[0.2em] mb-8" style={{ color: dayColor }}>
                {dayLabel}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
                {/* Left Side: Daily Chores/Notes */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-slate-300 rounded-sm" />
                        <div 
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateNote(dateStr, `chore-${i}`, e.target.innerText)}
                          className="flex-grow text-sm text-slate-500 font-medium outline-none min-h-[14px]"
                        >
                          {dailyNotes[dateStr]?.[`chore-${i}`] || ''}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Utensils size={14} className="text-slate-300 shrink-0" />
                      <div 
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => updateNote(dateStr, 'meals', e.target.innerText)}
                        className="w-full border-b border-slate-100 text-sm text-slate-500 font-medium outline-none min-h-[16px]"
                      >
                        {dailyNotes[dateStr]?.['meals'] || ''}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Flower2 size={14} className="text-slate-300 shrink-0" />
                      <div 
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => updateNote(dateStr, 'growth', e.target.innerText)}
                        className="w-full border-b border-slate-100 text-sm text-slate-500 font-medium outline-none min-h-[16px]"
                      >
                        {dailyNotes[dateStr]?.['growth'] || ''}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <DollarSign size={14} className="text-slate-300 shrink-0" />
                      <div 
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => updateNote(dateStr, 'finance', e.target.innerText)}
                        className="w-full border-b border-slate-100 text-sm text-slate-500 font-medium outline-none min-h-[16px]"
                      >
                        {dailyNotes[dateStr]?.['finance'] || ''}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Opus Tasks */}
                <div className="space-y-1">
                  {dayTasks.length > 0 ? (
                    dayTasks.map(task => (
                      <div key={task.id} className="flex items-start gap-3 py-1 group">
                        <div className="mt-1 cursor-pointer" onClick={() => toggleTask(task.id, task.completed)}>
                          {task.completed ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : (
                            <Circle size={14} className="text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {task.title}
                          </p>
                          {task.due_time && (
                            <span className="text-sm text-slate-400 font-medium">@ {task.due_time}</span>
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
        <p className="text-slate-300 text-sm font-black tracking-widest uppercase">
          Opus Personal Planner • Professional Life Architecture
        </p>
      </footer>
    </div>
  );
}
