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

  const dayHeaderColors = ['#f38aa3', '#f3a25a', '#7fc9d6', '#3c6f8f', '#f28b85', '#f1c07a', '#7fc9d6'];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const renderRoutines = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-8">
      {ROUTINES.map((routine) => {
        return (
          <div key={routine.title} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-[140px] flex justify-between px-1">
                {dayLabels.map((label, i) => (
                  <span key={i} className="text-[12px] font-black" style={{ color: dayHeaderColors[i] }}>{label}</span>
                ))}
              </div>
              <div className="flex-grow text-center pr-12">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">{routine.title}</h3>
              </div>
            </div>
            
            <div className="space-y-2">
              {routine.items.map((item, itemIdx) => {
                const habits = habitStatus[`${routine.title}-${itemIdx}`] || Array(7).fill(false);
                return (
                  <div key={item} className="flex items-center gap-4">
                    <div className="grid grid-cols-7 gap-1 w-[140px] shrink-0">
                      {habits.map((completed, dayIdx) => (
                        <div 
                          key={dayIdx} 
                          onClick={() => toggleHabit(routine.title, itemIdx, dayIdx)}
                          className="w-[18px] h-[18px] rounded-sm border border-slate-100 cursor-pointer transition-all hover:scale-110" 
                          style={{ 
                            backgroundColor: completed ? routine.color : `${routine.color}22` 
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[14pt] text-slate-500 font-medium leading-tight truncate">{item}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="p-4 md:p-6 w-full bg-[#fdfdfd] min-h-screen font-sans">
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
      <div className="grid grid-cols-1 gap-12">
        {weekDays.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayTasks = tasks.filter(t => t.due_date === dateStr);
          const dayLabel = day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
          const dayColor = DAYS[idx].color;

          return (
            <div key={dateStr} className="border-t-2 pt-6 pb-6 bg-white rounded-2xl px-6 shadow-sm border-slate-100" style={{ borderTopColor: dayColor }}>
              <h2 className="text-[16px] font-black tracking-[0.2em] mb-8" style={{ color: dayColor }}>
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
