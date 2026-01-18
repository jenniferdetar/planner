'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  PiggyBank, ChevronLeft, Plus, 
  Target, ShieldCheck, Landmark,
  TrendingUp, Wallet, Trash2, Scroll
} from 'lucide-react';

const SAVINGS_CATEGORIES = [
  {
    name: 'Auto',
    items: [
      { item: 'Auto Maintenance', monthly: 100 },
      { item: 'Mercury Auto Insurance', monthly: 388 },
      { item: 'Tahoe Registration', monthly: 15 },
      { item: 'Trailblazer Registration', monthly: 28 }
    ]
  },
  {
    name: 'Cash',
    items: [
      { item: 'Cleaning Lady', monthly: 320 },
      { item: 'Gas', monthly: 600 },
      { item: 'Laundry', monthly: 80 },
      { item: 'Blow', monthly: 200 }
    ]
  },
  {
    name: 'Bill Pay',
    items: [
      { item: 'Dwp', monthly: 100 },
      { item: "Jeff's Credit Cards", monthly: 500 },
      { item: "Jennifer's Student Loans", monthly: 150 },
      { item: 'Schools First Loan', monthly: 142 }
    ]
  },
  {
    name: 'Credit Card',
    items: [
      { item: 'Adt', monthly: 53 },
      { item: 'Amazon', monthly: 100 },
      { item: 'Groceries', monthly: 600 },
      { item: 'Hair', monthly: 110 },
      { item: 'Orkin', monthly: 50 }
    ]
  },
  {
    name: 'Housing',
    items: [
      { item: 'Heloc', monthly: 357 },
      { item: 'HOA', monthly: 520 },
      { item: 'Mortgage', monthly: 2250 },
      { item: 'Spectrum', monthly: 197 },
      { item: 'Verizon', monthly: 283 }
    ]
  },
  {
    name: 'Savings',
    items: [
      { item: 'Hsa', monthly: 200 },
      { item: 'Summer Saver', monthly: 400 },
      { item: "Tahoe's Major Repairs", monthly: 200 },
      { item: 'Vacation', monthly: 125 }
    ]
  }
];

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');

  const saveGoals = async (updatedGoals: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: 'finance-savings-text-goals',
        value: { items: updatedGoals },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) console.error('Error saving goals:', error);
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      const { data: metadata, error } = await supabase
        .from('opus_metadata')
        .select('value')
        .eq('key', 'finance-savings-text-goals')
        .single();
      
      if (ignore) return;
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching savings goals:', error);
      } else if (metadata?.value) {
        setGoals(metadata.value.items || []);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const next = [...goals, newGoal.trim()];
    setGoals(next);
    saveGoals(next);
    setNewGoal('');
  };

  const removeGoal = (idx: number) => {
    const next = goals.filter((_, i) => i !== idx);
    setGoals(next);
    saveGoals(next);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-Us', { 
      style: 'currency', 
      currency: 'Usd',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getSubtotal = (items: { monthly: number }[]) => {
    return items.reduce((sum, i) => sum + i.monthly, 0);
  };

  const grandTotalMonthly = SAVINGS_CATEGORIES.reduce((sum, cat) => sum + getSubtotal(cat.items), 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">

      <section className="relative bg-white p-8 md:p-16 rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden mb-16">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#9ADBDE] via-[#99B3C5] to-[#FFC68D]"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Scroll className="text-[#9ADBDE]" size={24} />
              <h2 className="text-2xl font-black text-[#0a2f5f] uppercase tracking-tight">Financial Vision 2026</h2>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed italic mb-8">
              Define the primary objectives for your capital growth this year. These goals serve as the benchmark for all fiscal decisions.
            </p>
            
            <div className="relative mb-8">
              <input 
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                placeholder="Declare a new capital goal..."
                className="w-full p-6 bg-[#f8fafc] border-2 border-gray-50 rounded-2xl font-serif text-lg outline-none focus:bg-white focus:border-[#9ADBDE] transition-all shadow-inner"
              />
              <button 
                onClick={addGoal}
                className="absolute right-3 top-3 w-12 h-12 bg-[#0a2f5f] text-white rounded-xl flex items-center justify-center hover:bg-[#0a2f5f] transition-all"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {goals.map((goal, idx) => (
                <div key={idx} className="group flex items-center justify-between p-6 bg-white border-2 border-gray-50 rounded-[1.5rem] hover:border-[#9ADBDE]/30 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#9ADBDE]/10 flex items-center justify-center text-[#9ADBDE]">
                      <Target size={16} />
                    </div>
                    <span className="text-lg font-serif text-[#0a2f5f] italic">{goal}</span>
                  </div>
                  <button 
                    onClick={() => removeGoal(idx)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-rose-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {goals.length === 0 && (
                <div className="text-center py-12 border-4 border-dashed border-gray-50 rounded-[2.5rem]">
                  <p className="text-gray-300 font-black uppercase tracking-widest text-[10px]">No Registered Objectives</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="text-[#0a2f5f]" size={24} />
                  <h3 className="text-xl font-black text-[#0a2f5f] uppercase tracking-tight">Security Protocol</h3>
                </div>
                <p className="text-gray-500 font-medium leading-relaxed italic mb-8">
                  &quot;Reserves are not merely savings; they are the architectural foundation of freedom. Aim for a minimum of 6 months for total system stability.&quot;
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reserve Status</span>
                  <span className="text-[10px] font-black text-[#9ADBDE] uppercase tracking-widest">Active Monitoring</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-gradient-to-r from-[#9ADBDE] to-[#99B3C5]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <Landmark className="text-[#0a2f5f]" size={24} />
          <h2 className="text-2xl font-black text-[#0a2f5f] uppercase tracking-tight text-center lg:text-left">Strategic Reserve Matrix</h2>
          <div className="h-px flex-grow bg-gradient-to-r from-[#0a2f5f]/20 to-transparent"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SAVINGS_CATEGORIES.map(cat => (
            <div key={cat.name} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden group hover:-translate-y-2 transition-all duration-500">
              <div className="p-8 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-black text-[#0a2f5f] uppercase tracking-tight">{cat.name}</h3>
                <Wallet className="text-gray-300" size={18} />
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  {cat.items.map(item => (
                    <div key={item.item} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <span className="text-sm font-bold text-gray-500">{item.item}</span>
                      <div className="text-right">
                        <div className="text-xs font-black text-[#0a2f5f]">{formatCurrency(item.monthly * 3)} <span className="text-gray-300 ml-1 font-bold">3M</span></div>
                        <div className="text-[10px] font-bold text-gray-300">{formatCurrency(item.monthly * 6)} 6M</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t-2 border-dashed border-gray-100 flex justify-between items-end">
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Target</div>
                    <div className="text-2xl font-black text-[#0a2f5f]">{formatCurrency(getSubtotal(cat.items) * 6)}</div>
                  </div>
                  <div className="text-[10px] font-black text-[#9ADBDE] uppercase tracking-widest bg-[#9ADBDE]/5 px-3 py-1 rounded-full border border-[#9ADBDE]/10">
                    6 Months
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a2f5f] via-[#2d5a8e] to-[#6a93cb] rounded-[4rem] p-12 md:p-20 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="max-w-xl text-center lg:text-left">
            <h2 className="text-4xl font-black mb-6 tracking-tight uppercase">Consolidated Reserve Targets</h2>
            <p className="text-white/60 font-bold leading-relaxed">
              Aggregate valuation of all operational reserves required to maintain total system integrity across all registered categories.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 flex-1 lg:w-72 text-center group hover:bg-white/20 transition-all">
              <TrendingUp className="text-[#9ADBDE] mx-auto mb-6" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2 text-white">3 Month Liquidity</p>
              <p className="text-4xl font-black text-white tracking-tighter">{formatCurrency(grandTotalMonthly * 3)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 flex-1 lg:w-72 text-center group hover:bg-white/20 transition-all">
              <Landmark className="text-[#FFC68D] mx-auto mb-6" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2 text-white">6 Month Fortress</p>
              <p className="text-4xl font-black text-white tracking-tighter">{formatCurrency(grandTotalMonthly * 6)}</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-grid-white/[0.02] [mask-image:radial-gradient(white,transparent_70%)]"></div>
        <div className="absolute -bottom-24 -right-24 text-[20rem] opacity-5 pointer-events-none font-black text-white">Safe</div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Official Capital Reserves Registry © 2026</p>
      </footer>
    </div>
  );
}
