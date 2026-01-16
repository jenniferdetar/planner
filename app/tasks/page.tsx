'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OpusTask } from '@/types/database.types';
import { 
  CheckCircle2, Circle, Clock, Calendar, 
  Tag, AlertCircle, ChevronRight, Plus,
  Trash2, Search, ArrowUpRight, Activity,
  Briefcase, ClipboardList, ShieldCheck, Landmark
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<OpusTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      const { data, error } = await supabase
        .from('opus_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        setError(error.message);
      } else {
        setTasks(data || []);
      }
      setLoading(false);
    }

    fetchTasks();
  }, []);

  if (error) {
    return <div className="p-8 text-red-500">Error loading tasks: {error}</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-[#1e40af] flex items-center justify-center shadow-xl shadow-[#1e40af]/20">
            <ClipboardList className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1e3a8a] tracking-tight uppercase">Operations Hub</h1>
            <p className="text-gray-400 font-bold tracking-widest text-xs italic">"Precision in execution, excellence in output"</p>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#93c5fd] rounded-[3rem] p-10 mb-12 text-white shadow-2xl shadow-[#1e3a8a]/30">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black mb-4 leading-tight">Professional Operations Matrix</h2>
          <p className="text-xl text-white/80 font-medium leading-relaxed mb-8">
            Manage your daily directives, track operational milestones, and maintain a high-fidelity registry of project achievements.
          </p>
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">{tasks.filter(t => !t.completed).length}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-white">Active Directives</span>
            </div>
            <div className="w-px h-12 bg-white/20 mx-4"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">{tasks.filter(t => t.completed).length}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-white">Resolved Tasks</span>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 text-[20rem] opacity-10 pointer-events-none text-white font-black">📋</div>
      </section>

      <div className="grid gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Activity className="text-slate-300 animate-pulse mb-4" size={48} />
            <div className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Operations Ledger...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task: OpusTask) => (
              <div key={task.id} className="group bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden flex items-center justify-between gap-6">
                <div className="flex items-center gap-6 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${
                    task.completed ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-[#1e3a8a]'
                  }`}>
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} className="opacity-20 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className={`text-xl font-black tracking-tight uppercase ${
                        task.completed ? 'text-slate-400 line-through' : 'text-[#1e3a8a]'
                      }`}>
                        {task.title}
                      </h2>
                      {task.priority && (
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' : 
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {task.priority} Priority
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {task.due_date && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <Calendar size={12} className="text-slate-300" />
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                      {task.category && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                          <Tag size={12} />
                          {task.category}
                        </div>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-2 italic font-medium">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-3 text-slate-200 hover:text-[#1e3a8a] transition-colors bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-100">
                    <Search size={18} />
                  </button>
                  <button className="p-3 text-slate-200 hover:text-red-500 transition-colors bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div className="py-32 text-center bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100">
                <Briefcase className="text-slate-200 mx-auto mb-6" size={64} />
                <p className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">Zero Active Directives</p>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Operational capacity at 100%. Awaiting further instructions.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <section className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-[#1e3a8a]" size={24} />
              <h2 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tight">Operation Security</h2>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed italic mb-8">
              All task directives are synchronized with the secure administrative ledger for real-time operational continuity.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[#1e3a8a] font-black text-xs uppercase tracking-[0.2em] bg-white p-4 rounded-2xl border">
            <ArrowUpRight size={16} />
            Operational Integrity Verified
          </div>
        </div>

        <div className="bg-[#1e3a8a]/5 p-10 rounded-[3rem] border-2 border-[#1e3a8a]/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Landmark className="text-[#1e3a8a]" size={24} />
              <h2 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tight">Execution Metrics</h2>
            </div>
            <p className="text-[#1e3a8a]/70 font-medium leading-relaxed italic mb-8">
              Task resolution velocity is currently optimized. High-priority items are being addressed with maximum efficiency.
            </p>
          </div>
          <div className="text-4xl font-black text-[#1e3a8a] opacity-10">2026 Productivity Data</div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Professional Operations Ledger © 2026</p>
      </footer>
    </div>
  );
}
