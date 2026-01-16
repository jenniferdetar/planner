'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OpusGoal } from '@/types/database.types';
import { 
  Target, Trophy, Rocket, Star, 
  ChevronRight, Activity, ShieldCheck, 
  TrendingUp, Award, Flag, Flame
} from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState<OpusGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGoals() {
      setLoading(true);
      const { data, error } = await supabase
        .from('opus_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        setError(error.message);
      } else {
        setGoals(data || []);
      }
      setLoading(false);
    }

    fetchGoals();
  }, []);

  if (error) {
    return <div className="p-8 text-red-500">Error loading goals: {error}</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-[#ea580c] flex items-center justify-center shadow-xl shadow-[#ea580c]/20">
            <Target className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#7c2d12] tracking-tight uppercase">Achievement Registry</h1>
            <p className="text-gray-400 font-bold tracking-widest text-xs italic">"Strategic alignment of ambition and execution"</p>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#7c2d12] via-[#ea580c] to-[#fb923c] rounded-[3rem] p-10 mb-12 text-white shadow-2xl shadow-[#7c2d12]/30">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black mb-4 leading-tight">SMART Objective Architecture</h2>
          <p className="text-xl text-white/80 font-medium leading-relaxed mb-8">
            Define high-impact objectives, track execution velocity, and certify your progress toward long-term strategic milestones.
          </p>
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">2026</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-white">Execution Year</span>
            </div>
            <div className="w-px h-12 bg-white/20 mx-4"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">{goals.filter(g => g.status === 'completed').length}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-white">Completed Goals</span>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 text-[20rem] opacity-10 pointer-events-none text-white font-black">🎯</div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <Activity className="text-slate-300 animate-pulse mb-4" size={48} />
          <div className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Objective Database...</div>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {goals.map((goal: OpusGoal) => (
            <div key={goal.id} className="group relative bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ea580c] opacity-[0.03] rounded-full translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shadow-inner">
                      {goal.status === 'completed' ? <Trophy size={20} className="text-[#ea580c]" /> : <Flame size={20} className="text-[#ea580c]" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[#7c2d12] leading-tight uppercase tracking-tighter">{goal.title}</h2>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{goal.category}</div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    goal.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {goal.status}
                  </div>
                </div>
                
                {goal.description && (
                  <p className="text-gray-500 font-medium leading-relaxed italic mb-8">
                    {goal.description}
                  </p>
                )}
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Execution Progress</span>
                    <span className="text-2xl font-black text-[#ea580c]">{goal.progress_percent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                        goal.progress_percent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#ea580c] to-[#fb923c]'
                      }`}
                      style={{ width: `${goal.progress_percent}%` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Award size={14} className="text-[#ea580c]" />
                    SMART Certified
                  </div>
                  <button className="flex items-center gap-2 text-[#ea580c] font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    View Details <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {goals.length === 0 && (
            <div className="col-span-2 py-32 text-center bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100">
              <Rocket className="text-slate-200 mx-auto mb-6" size={64} />
              <p className="text-xl font-black text-[#7c2d12] uppercase tracking-tight">No Active Objectives</p>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Initialize your strategic roadmap to begin tracking progress</p>
            </div>
          )}
        </div>
      )}

      <section className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-[#7c2d12]" size={24} />
              <h2 className="text-2xl font-black text-[#7c2d12] uppercase tracking-tight">Strategy Verification</h2>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed italic mb-8">
              Achievement records are audited against strategic criteria to ensure alignment with your long-term vision board.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[#7c2d12] font-black text-xs uppercase tracking-[0.2em] bg-white p-4 rounded-2xl border">
            <Award size={16} />
            Achievement Data Integrity Verified
          </div>
        </div>

        <div className="bg-[#ea580c]/5 p-10 rounded-[3rem] border-2 border-[#ea580c]/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-[#ea580c]" size={24} />
              <h2 className="text-2xl font-black text-[#ea580c] uppercase tracking-tight">Achievement Momentum</h2>
            </div>
            <p className="text-[#ea580c]/70 font-medium leading-relaxed italic mb-8">
              Current progress indicates high execution velocity. Maintain focus on quarterly milestones to maximize output.
            </p>
          </div>
          <div className="text-4xl font-black text-[#ea580c] opacity-10 uppercase italic tracking-tighter">Velocity Projections</div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Strategic Achievement Portal © 2026</p>
      </footer>
    </div>
  );
}
