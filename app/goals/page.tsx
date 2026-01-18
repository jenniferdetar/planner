'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OpusGoal } from '@/types/database.types';
import { 
  Target, Trophy, Rocket, Star, 
  ChevronRight, Activity, ShieldCheck, 
  TrendingUp, Award, Flag, Flame, Calendar
} from 'lucide-react';

import HubHeader from '@/components/HubHeader';
import StatCard from '@/components/StatCard';

const PERSONAL_GOAL_SECTIONS = [
  {
    title: 'Physical',
    headerClass: 'bg-[#9ADBDE]/30',
    items: ['Lose 5 lbs', 'Exercise more (Start with walking)', '', '', '']
  },
  {
    title: 'Mental',
    headerClass: 'bg-[#9ADBDE]/30',
    items: ['Journal at least 3x a week', 'Attend church more often', '', '', '']
  },
  {
    title: 'Relational',
    headerClass: 'bg-[#9ADBDE]/30',
    items: ['Have one outing w/Jeff monthly', 'Attend church more often', '', '', '']
  },
  {
    title: 'Self-Care',
    headerClass: 'bg-[#FFA1AB]/30',
    items: ['Get nails done', 'Make more home made meals', '', '', '']
  },
  {
    title: 'Hobbies',
    headerClass: 'bg-[#FFA1AB]/30',
    items: ['', '', '', '', '']
  },
  {
    title: 'Home',
    headerClass: 'bg-[#FFA1AB]/30',
    items: ['Can meals', 'Save up for a freeze dryer', '', '', '']
  },
  {
    title: 'Career',
    headerClass: 'bg-[#99B3C5]/30',
    items: ['Promote, if possible', 'Get side gigs to leave LAUSD', '', '', '']
  },
  {
    title: 'Financial',
    headerClass: 'bg-[#99B3C5]/30',
    items: ['Help Jeff with Disability', 'Fully Funded Emergency Fund', 'Make more home made meals', '', '']
  },
  {
    title: 'Organizational',
    headerClass: 'bg-[#99B3C5]/30',
    items: ['De-clutter the living room', 'Clean up the office', "Donate what's not being used", '', '']
  },
  {
    title: 'Screen Time',
    headerClass: 'bg-[#FFC68D]/30',
    items: ['Keep to commute/work only', '', '', '', '']
  },
  {
    title: 'Learn',
    headerClass: 'bg-[#FFC68D]/30',
    items: ['Complete coding course strong', 'Complete MBA', '', '', '']
  },
  {
    title: 'CSEA',
    headerClass: 'bg-[#FFC68D]/30',
    items: ['Build relationships/network', 'Talk to more members', 'Re-elected for MB Committee', 'Represent more members', 'Find ways to grow meetings']
  }
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<OpusGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGoals() {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Error fetching user:', authError);
        setError(authError.message);
        setLoading(false);
        return;
      }
      if (!user) {
        setGoals([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('opus_goals')
        .select('*')
        .eq('user_id', user.id)
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
      <HubHeader 
        title="Achievement" 
        subtitle='"Strategic alignment of ambition and execution"' 
        icon={Target}
        iconBgColor="bg-[#FFC68D]"
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard 
          title="Execution Year" 
          value={2026} 
          icon={<Calendar size={20} />} 
          color="bg-[#9ADBDE]" 
        />
        <StatCard 
          title="Total Objectives" 
          value={goals.length} 
          icon={<Target size={20} />} 
          color="bg-[#FFC68D]" 
        />
        <StatCard 
          title="Completed Goals" 
          value={goals.filter(g => g.status === 'completed').length} 
          icon={<Trophy size={20} />} 
          color="bg-[#FFA1AB]" 
        />
      </section>

      <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 md:p-12 mb-12">
        <div className="text-center mb-8">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">My Personal Goals</div>
          <p className="text-xs text-gray-500 mt-2">
            What one thing do you want to be intentional about this year? Decide what you want to track and define one way to clearly measure success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERSONAL_GOAL_SECTIONS.map((section) => (
            <div key={section.title} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className={`${section.headerClass} text-center py-2 text-[11px] font-bold tracking-widest`}>
                {section.title}
              </div>
              <div className="px-4 py-3 space-y-2">
                {section.items.map((item, idx) => (
                  <div key={`${section.title}-${idx}`} className="border-b border-slate-200 pb-1 text-[13px] font-[family:var(--font-coming-soon)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-[#d7eef0] px-4 py-2 text-[11px] font-bold tracking-widest">TOTAL:</div>
          <div className="h-10 border-t border-slate-200"></div>
        </div>
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
                      {goal.status === 'completed' ? <Trophy size={20} className="text-[#FFC68D]" /> : <Flame size={20} className="text-[#FFC68D]" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[#0a2f5f] leading-tight uppercase tracking-tighter">{goal.title}</h2>
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
                    <span className="text-2xl font-black text-[#FFC68D]">{goal.progress_percent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                        goal.progress_percent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#FFC68D] to-[#FFA1AB]'
                      }`}
                      style={{ width: `${goal.progress_percent}%` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Award size={14} className="text-[#FFC68D]" />
                    SMART Certified
                  </div>
                  <button className="flex items-center gap-2 text-[#FFC68D] font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
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
              <ShieldCheck className="text-[#0a2f5f]" size={24} />
              <h2 className="text-2xl font-black text-[#0a2f5f] uppercase tracking-tight">Strategy Verification</h2>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed italic mb-8">
              Achievement records are audited against strategic criteria to ensure alignment with your long-term vision board.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[#0a2f5f] font-black text-xs uppercase tracking-[0.2em] bg-white p-4 rounded-2xl border">
            <Award size={16} />
            Achievement Data Integrity Verified
          </div>
        </div>

        <div className="bg-[#FFC68D]/10 p-10 rounded-[3rem] border-2 border-[#FFC68D]/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-[#FFC68D]" size={24} />
              <h2 className="text-2xl font-black text-[#0a2f5f] uppercase tracking-tight">Achievement Momentum</h2>
            </div>
            <p className="text-[#0a2f5f]/70 font-medium leading-relaxed italic mb-8">
              Current progress indicates high execution velocity. Maintain focus on quarterly milestones to maximize output.
            </p>
          </div>
          <div className="text-4xl font-black text-[#0a2f5f] opacity-10 uppercase italic tracking-tighter">Velocity Projections</div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Strategic Achievement Portal © 2026</p>
      </footer>
    </div>
  );
}
