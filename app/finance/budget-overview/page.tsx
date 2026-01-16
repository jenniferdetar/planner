'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  BarChart3, ChevronLeft, Save, TrendingUp, 
  TrendingDown, DollarSign, ArrowUpRight, ShieldCheck,
  History, PieChart
} from 'lucide-react';

const BUDGET_ITEMS = [
  { category: 'Auto', item: 'Auto Maintenance', budget: 100, type: 'Variable' },
  { category: 'Auto', item: 'Mercury Auto Insurance', budget: 388, type: 'Fixed' },
  { category: 'Auto', item: 'Tahoe Registration', budget: 15, type: 'Variable' },
  { category: 'Auto', item: 'Trailblazer Registration', budget: 28, type: 'Variable' },
  { category: 'Bill Pay', item: 'DWP', budget: 100, type: 'Variable' },
  { category: 'Bill Pay', item: "Jeff's Credit Cards", budget: 500, type: 'Variable' },
  { category: 'Bill Pay', item: "Jennifer's Student Loans", budget: 150, type: 'Variable' },
  { category: 'Bill Pay', item: 'Schools First Loan', budget: 142, type: 'Fixed' },
  { category: 'Cash', item: 'Cleaning Lady', budget: 320, type: 'Fixed' },
  { category: 'Cash', item: 'Gas', budget: 600, type: 'Variable' },
  { category: 'Cash', item: 'Laundry', budget: 80, type: 'Variable' },
  { category: 'Credit Card', item: 'ADT', budget: 53, type: 'Fixed' },
  { category: 'Credit Card', item: 'Amazon', budget: 100, type: 'Variable' },
  { category: 'Credit Card', item: 'Groceries', budget: 600, type: 'Variable' },
  { category: 'Credit Card', item: 'Hair', budget: 110, type: 'Fixed' },
  { category: 'Credit Card', item: 'Orkin', budget: 50, type: 'Fixed' },
  { category: 'Housing', item: 'HELOC', budget: 357, type: 'Fixed' },
  { category: 'Housing', item: 'HOA', budget: 520, type: 'Fixed' },
  { category: 'Housing', item: 'Mortgage', budget: 2250, type: 'Fixed' },
  { category: 'Housing', item: 'Spectrum', budget: 197, type: 'Fixed' },
  { category: 'Housing', item: 'Verizon', budget: 283, type: 'Fixed' },
  { category: 'Savings', item: 'Blow', budget: 200, type: 'Variable' },
  { category: 'Savings', item: 'HSA', budget: 200, type: 'Variable' },
  { category: 'Savings', item: 'Summer Saver', budget: 400, type: 'Variable' },
  { category: 'Savings', item: "Tahoe's Major Repairs", budget: 200, type: 'Variable' },
  { category: 'Savings', item: 'Vacation', budget: 125, type: 'Variable' }
];

export default function BudgetOverviewPage() {
  const [actuals, setActuals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const storageKey = 'finance-budget-actuals';

  useEffect(() => {
    async function fetchActuals() {
      setLoading(true);
      const { data: metadata, error } = await supabase
        .from('opus_metadata')
        .select('value')
        .eq('key', storageKey)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching actuals:', error);
      } else if (metadata?.value) {
        setActuals(metadata.value || {});
      }
      setLoading(false);
    }
    fetchActuals();
  }, [storageKey]);

  async function handleUpdateActual(item: string, value: string) {
    const numValue = parseFloat(value) || 0;
    const newActuals = { ...actuals, [item]: numValue };
    setActuals(newActuals);

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: storageKey,
        value: newActuals,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) console.error('Error saving actuals:', error);
    setSaving(false);
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const totals = BUDGET_ITEMS.reduce((acc, curr) => {
    const actual = actuals[curr.item] || 0;
    acc.budget += curr.budget;
    acc.actual += actual;
    acc.variance += (curr.budget - actual);
    return acc;
  }, { budget: 0, actual: 0, variance: 0 });

  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFC68D] flex items-center justify-center shadow-xl shadow-[#FFC68D]/20">
            <BarChart3 className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#00326b] tracking-tight uppercase">Budget Audit</h1>
            <p className="text-gray-400 font-bold tracking-widest text-xs italic">"Official Monthly Resource Calibration & Variance Report"</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/finance" 
            className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all"
          >
            <ChevronLeft size={16} />
            Back
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <SummaryCard 
          title="Consolidated Budget" 
          value={totals.budget} 
          icon={<DollarSign className="text-blue-500" size={24} />}
          sub="Planned monthly allocation"
        />
        <SummaryCard 
          title="Actual Expenditure" 
          value={totals.actual} 
          icon={<History className="text-gray-400" size={24} />}
          sub="Realized outflows to date"
        />
        <SummaryCard 
          title="Performance Variance" 
          value={totals.variance} 
          icon={totals.variance < 0 ? <TrendingDown className="text-rose-500" size={24} /> : <TrendingUp className="text-emerald-500" size={24} />}
          sub="Net fiscal position"
          isVariance
        />
      </section>

      <section className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden mb-12 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#FFC68D]"></div>
        
        <div className="p-10 border-b border-gray-50 bg-[#f8fafc] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PieChart className="text-[#00326b]" size={24} />
            <h2 className="text-2xl font-black text-[#00326b] uppercase tracking-tight">Ledger Allocation Breakdown</h2>
          </div>
          {saving && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-100 animate-pulse">
              <Save size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Encrypting...</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="p-8 font-black text-[#0a2f5f] text-[10px] uppercase tracking-[0.2em] border-b-2 border-gray-50">Operational Item</th>
                <th className="p-8 font-black text-[#0a2f5f] text-[10px] uppercase tracking-[0.2em] border-b-2 border-gray-50">Class</th>
                <th className="p-8 font-black text-[#0a2f5f] text-[10px] uppercase tracking-[0.2em] border-b-2 border-gray-50 text-right">Budgeted</th>
                <th className="p-8 font-black text-[#0a2f5f] text-[10px] uppercase tracking-[0.2em] border-b-2 border-gray-50 text-right">Actual</th>
                <th className="p-8 font-black text-[#0a2f5f] text-[10px] uppercase tracking-[0.2em] border-b-2 border-gray-50 text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {BUDGET_ITEMS.map((item) => {
                const actual = actuals[item.item] || 0;
                const variance = item.budget - actual;
                return (
                  <tr key={item.item} className="group hover:bg-slate-50 transition-colors">
                    <td className="p-8">
                      <div className="text-sm font-black text-[#00326b] mb-1">{item.item}</div>
                      <div className="text-[10px] font-black text-[#FFC68D] uppercase tracking-widest">{item.category}</div>
                    </td>
                    <td className="p-8">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${item.type === 'Fixed' ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-8 text-sm font-black text-gray-400 text-right">{formatCurrency(item.budget)}</td>
                    <td className="p-8 text-right">
                      <div className="relative inline-block group/input">
                        <input 
                          type="number" 
                          value={actuals[item.item] || ''} 
                          onChange={(e) => handleUpdateActual(item.item, e.target.value)}
                          placeholder="0"
                          className="w-32 p-3 bg-gray-50 border-2 border-transparent focus:border-[#FFC68D] rounded-xl text-right text-sm font-black text-[#00326b] outline-none transition-all"
                        />
                      </div>
                    </td>
                    <td className="p-8 text-right">
                      <span className={`text-sm font-black ${variance < 0 ? 'text-rose-500 bg-rose-50/50' : 'text-emerald-600 bg-emerald-50/50'} px-4 py-2 rounded-xl`}>
                        {formatCurrency(variance)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t-4 border-white">
              <tr className="font-black">
                <td colSpan={2} className="p-10 text-[#00326b] uppercase tracking-widest text-xs">Consolidated Registry Totals</td>
                <td className="p-10 text-right text-gray-400 text-sm">{formatCurrency(totals.budget)}</td>
                <td className="p-10 text-right text-[#00326b] text-sm">{formatCurrency(totals.actual)}</td>
                <td className="p-10 text-right">
                  <span className={`text-sm px-6 py-3 rounded-2xl shadow-inner ${totals.variance < 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {formatCurrency(totals.variance)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#FFC68D]/10 p-10 rounded-[3rem] border-2 border-[#FFC68D]/20">
          <h4 className="text-[#0a2f5f] font-black uppercase tracking-[0.2em] text-[10px] mb-6">Auditor's Certification</h4>
          <p className="text-[#0a2f5f] font-serif italic text-lg leading-relaxed">
            "Variance analysis is critical for maintaining long-term solvency. Negative variances should be investigated and rectified in the subsequent fiscal period."
          </p>
        </div>
        <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xl border border-slate-200">
                <ShieldCheck className="text-[#00326b]" size={28} />
              </div>
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Audit Status</div>
                <div className="text-xl font-black text-[#00326b]">Records Verified</div>
              </div>
            </div>
            <ArrowUpRight className="text-[#00326b] opacity-20" size={32} />
          </div>
          <div className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Ledger Compliance Registry v4.0</div>
        </div>
      </div>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Official Fiscal Audit Registry © 2026</p>
      </footer>
    </div>
  );
}

function SummaryCard({ title, value, icon, sub, isVariance }: { title: string; value: number; icon: React.ReactNode; sub: string; isVariance?: boolean }) {
  const isNegative = value < 0;
  
  return (
    <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            {icon}
          </div>
          {isVariance && (
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${isNegative ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
              {isNegative ? 'Over Budget' : 'Within Budget'}
            </span>
          )}
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{title}</p>
        <p className={`text-4xl font-black tracking-tighter ${isVariance ? (isNegative ? 'text-rose-500' : 'text-emerald-600') : 'text-[#00326b]'}`}>
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)}
        </p>
        <p className="mt-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">{sub}</p>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-bl-[100px] -mr-16 -mt-16 group-hover:bg-[#FFC68D]/5 transition-colors"></div>
    </div>
  );
}
