'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Wallet, ChevronLeft, Loader2, 
  Landmark, Info, Activity, PieChart, CheckCircle2
} from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Auto',
    items: [
      { name: 'Auto Maintenance', budget: 100 },
      { name: 'Mercury Auto Insurance', budget: 388 },
      { name: 'Tahoe Registration', budget: 15 },
      { name: 'Trailblazer Registration', budget: 28 }
    ]
  },
  {
    name: 'Bill Pay',
    items: [
      { name: 'Dwp', budget: 100 },
      { name: "Jeff's Credit Cards", budget: 500 },
      { name: "Jennifer's Student Loans", budget: 150 },
      { name: 'Schools First Loan', budget: 142 },
      { name: 'Tithe', budget: 0 }
    ]
  },
  {
    name: 'Cash',
    items: [
      { name: 'Cleaning Lady', budget: 320 },
      { name: 'Gas', budget: 600 },
      { name: 'Laundry', budget: 80 }
    ]
  },
  {
    name: 'Credit Card',
    items: [
      { name: 'Adt', budget: 53 },
      { name: 'Amazon', budget: 100 },
      { name: 'Groceries', budget: 600 },
      { name: 'Hair', budget: 110 },
      { name: 'Orkin', budget: 50 }
    ]
  },
  {
    name: 'Housing',
    items: [
      { name: 'Heloc', budget: 357 },
      { name: 'HOA', budget: 520 },
      { name: 'Mortgage', budget: 2250 },
      { name: 'Spectrum', budget: 197 },
      { name: 'Verizon', budget: 283 }
    ]
  },
  {
    name: 'Savings',
    items: [
      { name: 'Blow', budget: 200 },
      { name: 'Hsa', budget: 200 },
      { name: 'Summer Saver', budget: 400 },
      { name: "Tahoe's Major Repairs", budget: 200 },
      { name: 'Vacation', budget: 125 }
    ]
  }
];

const PAY_WEEKS = [
  { id: 'jf1', label: 'Jeff Disability', color: 'bg-emerald-500' },
  { id: 'j1', label: 'Jennifer 1st', color: 'bg-indigo-500' },
  { id: 'j2', label: 'Jennifer 2nd', color: 'bg-amber-500' }
];

interface SpendingState {
  income: Record<string, number>;
  spending: Record<string, Record<string, number>>; // itemKey -> payWeekId -> amount
}

export default function SpendingPlanPage() {
  const [state, setState] = useState<SpendingState>({
    income: { jf1: 0, j1: 0, j2: 0 },
    spending: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const storageKey = 'finance-spending-plan';

  useEffect(() => {
    let ignore = false;
    async function fetchState() {
      setLoading(true);
      const { data: metadata, error } = await supabase
        .from('opus_metadata')
        .select('value')
        .eq('key', storageKey)
        .single();
      
      if (!ignore) {
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching spending plan:', error);
        } else if (metadata?.value) {
          setState(metadata.value as SpendingState);
        }
        setLoading(false);
      }
    }
    const timeoutId = setTimeout(() => {
      fetchState();
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [storageKey]);

  async function saveState(newState: SpendingState) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: storageKey,
        value: newState,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) console.error('Error saving spending plan:', error);
    setSaving(false);
  }

  const handleIncomeChange = (payWeekId: string, value: string) => {
    const num = parseFloat(value) || 0;
    const newState = {
      ...state,
      income: { ...state.income, [payWeekId]: num }
    };
    setState(newState);
    saveState(newState);
  };

  const handleSpendingChange = (itemKey: string, payWeekId: string, value: string) => {
    const num = parseFloat(value) || 0;
    const newState = {
      ...state,
      spending: {
        ...state.spending,
        [itemKey]: {
          ...(state.spending[itemKey] || {}),
          [payWeekId]: num
        }
      }
    };
    setState(newState);
    saveState(newState);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const calculations = useMemo(() => {
    const payWeekRemaining: Record<string, number> = { ...state.income };
    const itemActuals: Record<string, number> = {};
    const categoryTotals: Record<string, { budget: number, actual: number }> = {};

    CATEGORIES.forEach(cat => {
      categoryTotals[cat.name] = { budget: 0, actual: 0 };
      cat.items.forEach(item => {
        const itemKey = `${cat.name}:${item.name}`;
        categoryTotals[cat.name].budget += item.budget;
        
        let itemTotal = 0;
        PAY_WEEKS.forEach(pw => {
          const spent = state.spending[itemKey]?.[pw.id] || 0;
          itemTotal += spent;
          payWeekRemaining[pw.id] -= spent;
        });
        
        itemActuals[itemKey] = itemTotal;
        categoryTotals[cat.name].actual += itemTotal;
      });
    });

    const totalIncome = Object.values(state.income).reduce((a, b) => a + b, 0);
    const totalSpent = Object.values(itemActuals).reduce((a, b) => a + b, 0);
    const totalBudget = CATEGORIES.reduce((acc, cat) => acc + cat.items.reduce((a, b) => a + b.budget, 0), 0);

    return { payWeekRemaining, itemActuals, categoryTotals, totalIncome, totalSpent, totalBudget };
  }, [state]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfdfd]">
      <Loader2 className="animate-spin text-[#99B3C5] mb-4" size={48} />
      <div className="text-xs font-black  tracking-[0.3em] text-gray-400">Loading Allocation Ledger...</div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto bg-[#fdfdfd] min-h-screen font-sans">

      <section className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden mb-12 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#99B3C5]"></div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-100">
                <th className="p-8 font-black text-[#0a2f5f] text-[10px]  tracking-[0.2em] sticky left-0 bg-[#f8fafc] z-20 border-r border-gray-50" rowSpan={2}>Operational Item</th>
                <th className="p-8 font-black text-[#0a2f5f] text-[10px]  tracking-[0.2em] text-center border-r border-gray-50" rowSpan={2}>Budgeted</th>
                {PAY_WEEKS.map(pw => (
                  <th key={pw.id} className="p-6 font-black text-[#0a2f5f] text-[10px]  tracking-[0.2em] text-center border-r border-gray-50" colSpan={2}>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${pw.color} opacity-50 animate-pulse`}></div>
                      {pw.label}
                    </div>
                  </th>
                ))}
                <th className="p-8 font-black text-[#0a2f5f] text-[10px]  tracking-[0.2em] text-center border-l border-gray-50" rowSpan={2}>Total Spent</th>
                <th className="p-8 font-black text-[#0a2f5f] text-[10px]  tracking-[0.2em] text-center border-l border-gray-50" rowSpan={2}>Registry Remainder</th>
              </tr>
              <tr className="bg-white border-b border-gray-100">
                {PAY_WEEKS.map(pw => (
                  <React.Fragment key={pw.id}>
                    <th className="p-4 font-black text-gray-400 text-[9px]  tracking-widest text-center border-r border-gray-50 bg-slate-50/50">Spent</th>
                    <th className="p-4 font-black text-blue-400 text-[9px]  tracking-widest text-center border-r border-gray-50">Cycle Rem.</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Income Header Row */}
              <tr className="bg-blue-50/50 group">
                <td className="p-8 border-b border-blue-100 sticky left-0 bg-blue-50 group-hover:bg-blue-100/50 z-20 border-r border-blue-100 font-black text-[#0a2f5f]  tracking-widest text-xs">
                  <div className="flex items-center gap-3">
                    <Activity size={16} className="text-[#0a2f5f]/40" />
                    Income Baseline
                  </div>
                </td>
                <td className="p-8 border-b border-blue-100 text-center font-black text-gray-400 text-sm border-r border-blue-100 italic">
                  {formatCurrency(calculations.totalBudget)}
                </td>
                {PAY_WEEKS.map(pw => (
                  <React.Fragment key={pw.id}>
                    <td className="p-4 border-b border-blue-100 border-r border-blue-100">
                      <input 
                        type="number" 
                        className="w-full p-4 bg-white border-2 border-transparent focus:border-[#0a2f5f]/20 rounded-2xl text-right font-black text-[#0a2f5f] outline-none transition-all shadow-inner"
                        value={state.income[pw.id] || ''}
                        onChange={(e) => handleIncomeChange(pw.id, e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td className="p-4 border-b border-blue-100 text-center font-black text-blue-600 text-sm border-r border-blue-100 bg-blue-100/20">
                      {formatCurrency(calculations.payWeekRemaining[pw.id])}
                    </td>
                  </React.Fragment>
                ))}
                <td className="p-8 border-b border-blue-100 text-center font-black text-[#0a2f5f] text-sm border-l border-blue-100">
                  {formatCurrency(calculations.totalIncome)}
                </td>
                <td className="p-8 border-b border-blue-100 text-center font-black text-emerald-600 text-sm border-l border-blue-100 bg-emerald-50/50">
                  {formatCurrency(calculations.totalIncome - calculations.totalSpent)}
                </td>
              </tr>

              {/* Categories */}
              {CATEGORIES.map(cat => (
                <React.Fragment key={cat.name}>
                  <tr className="bg-slate-100/50">
                    <td colSpan={10} className="p-4 px-8 border-b border-slate-200 font-black text-[#0a2f5f]  tracking-[0.3em] text-[10px] italic">
                      {cat.name} Portfolio
                    </td>
                  </tr>
                  {cat.items.map(item => {
                    const itemKey = `${cat.name}:${item.name}`;
                    const actual = calculations.itemActuals[itemKey];
                    const remaining = item.budget - actual;
                    return (
                      <tr key={item.name} className="group hover:bg-slate-50 transition-colors">
                        <td className="p-8 border-b border-gray-50 sticky left-0 bg-white group-hover:bg-slate-50 z-20 border-r border-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#99B3C5]"></div>
                            <span className="text-sm font-black text-gray-700">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-8 border-b border-gray-50 text-center text-sm font-black text-gray-300 border-r border-gray-50 italic">
                          {formatCurrency(item.budget)}
                        </td>
                        {PAY_WEEKS.map(pw => (
                          <React.Fragment key={pw.id}>
                            <td className="p-2 border-b border-gray-50 border-r border-gray-50">
                              <input 
                                type="number"
                                className="w-full p-4 bg-transparent border-2 border-transparent hover:border-slate-100 focus:border-[#99B3C5]/30 focus:bg-white rounded-2xl text-right font-black text-gray-700 outline-none transition-all"
                                value={state.spending[itemKey]?.[pw.id] || ''}
                                onChange={(e) => handleSpendingChange(itemKey, pw.id, e.target.value)}
                                placeholder="..."
                              />
                            </td>
                            <td className="p-2 border-b border-gray-50 border-r border-gray-50 bg-slate-50/20"></td>
                          </React.Fragment>
                        ))}
                        <td className="p-8 border-b border-gray-50 text-center font-black text-[#0a2f5f] text-sm border-l border-gray-50">
                          {formatCurrency(actual)}
                        </td>
                        <td className={`p-8 border-b border-gray-50 text-center font-black text-sm border-l border-gray-50 ${remaining < 0 ? 'text-rose-500 bg-rose-50/50' : 'text-gray-200'}`}>
                          {formatCurrency(remaining)}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
            {/* Footer */}
            <tfoot>
              <tr className="bg-[#0a2f5f] text-white">
                <td className="p-10 sticky left-0 bg-[#0a2f5f] z-20 font-black  tracking-[0.3em] text-xs">Aggregate Totals</td>
                <td className="p-10 text-center font-black opacity-60 text-sm border-r border-white/10">{formatCurrency(calculations.totalBudget)}</td>
                {PAY_WEEKS.map(pw => (
                  <React.Fragment key={pw.id}>
                    <td className="p-10 text-right font-black text-sm border-r border-white/10 bg-white/5">
                      {formatCurrency(CATEGORIES.reduce((acc: number, cat) => acc + cat.items.reduce((a: number, b) => a + (state.spending[`${cat.name}:${b.name}`]?.[pw.id] || 0), 0), 0))}
                    </td>
                    <td className="p-10 text-center font-black text-emerald-400 text-sm border-r border-white/10">
                      {formatCurrency(calculations.payWeekRemaining[pw.id])}
                    </td>
                  </React.Fragment>
                ))}
                <td className="p-10 text-center font-black text-sm border-l border-white/10 bg-white/10">{formatCurrency(calculations.totalSpent)}</td>
                <td className="p-10 text-center font-black text-sm border-l border-white/10">{formatCurrency(calculations.totalBudget - calculations.totalSpent)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#99B3C5]/10 p-10 rounded-[3rem] border-2 border-[#99B3C5]/20 relative overflow-hidden">
          <Info className="text-[#0a2f5f]/20 absolute -right-4 -top-4" size={120} />
          <div className="relative z-10">
            <h4 className="text-[#0a2f5f] font-black  tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
              <Landmark size={14} />
              Fiscal Directive
            </h4>
            <p className="text-[#0a2f5f] font-serif italic text-lg leading-relaxed">
              &quot;Allocation by cycle ensures that disbursement does not exceed verified liquidity. Reconcile weekly to maintain 100% compliance.&quot;
            </p>
          </div>
        </div>
        
        <div className="md:col-span-2 bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-xl border border-slate-200">
              <PieChart className="text-[#0a2f5f]" size={32} />
            </div>
            <div>
              <div className="text-[10px] font-black text-gray-400  tracking-widest mb-1">Operational Integrity</div>
              <div className="text-2xl font-black text-[#0a2f5f]">Ledger Synchronized</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-black text-gray-400  tracking-widest mb-1">Net Position</div>
              <div className="text-xl font-black text-[#0a2f5f]">{formatCurrency(calculations.totalIncome - calculations.totalSpent)}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black  tracking-[0.4em]">Official Disbursement Allocation Registry © 2026</p>
      </footer>

      {saving && (
        <div className="fixed bottom-8 right-8 bg-[#0a2f5f] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-500">
          <Loader2 className="animate-spin" size={20} />
          <span className="font-black  tracking-widest text-xs">Registry Auto-Save Active</span>
        </div>
      )}
    </div>
  );
}
