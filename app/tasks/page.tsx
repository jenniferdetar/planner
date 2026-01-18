'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OpusTask } from '@/types/database.types';
import { 
  CheckCircle2, Circle, Calendar, 
  Tag, AlertCircle,
  Trash2, Search, Activity,
  Briefcase, ClipboardList
} from 'lucide-react';

import HubHeader from '@/components/HubHeader';
import StatCard from '@/components/StatCard';

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
      <HubHeader 
        title="Operations" 
        subtitle="&quot;Precision in execution, excellence in output&quot;" 
        icon={ClipboardList}
        iconBgColor="bg-[#99B3C5]"
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard 
          title="Total Registry" 
          value={tasks.length} 
          icon={<ClipboardList size={20} />} 
          color="bg-[#99B3C5]" 
        />
        <StatCard 
          title="Active Directives" 
          value={tasks.filter(t => !t.completed).length} 
          icon={<AlertCircle size={20} />} 
          color="bg-[#FFA1AB]" 
        />
        <StatCard 
          title="Resolved Tasks" 
          value={tasks.filter(t => t.completed).length} 
          icon={<CheckCircle2 size={20} />} 
          color="bg-[#9ADBDE]" 
        />
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
                    task.completed ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-[#0a2f5f]'
                  }`}>
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} className="opacity-20 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className={`text-xl font-black tracking-tight uppercase ${
                        task.completed ? 'text-slate-400 line-through' : 'text-[#0a2f5f]'
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
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                          task.category.toUpperCase().includes('CSEA')
                            ? 'bg-[#00326b] text-[#ffca38] border-[#ffca38]'
                            : 'bg-blue-50 text-[#0a2f5f] border-transparent'
                        }`}>
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
                  <button className="p-3 text-slate-200 hover:text-[#0a2f5f] transition-colors bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-100">
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
                <p className="text-xl font-black text-[#0a2f5f] uppercase tracking-tight">Zero Active Directives</p>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Operational capacity at 100%. Awaiting further instructions.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Professional Operations Ledger © 2026</p>
      </footer>
    </div>
  );
}
