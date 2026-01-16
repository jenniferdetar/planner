'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
      { item: 'DWP', monthly: 100 },
      { item: "Jeff's Credit Cards", monthly: 500 },
      { item: "Jennifer's Student Loans", monthly: 150 },
      { item: 'Schools First Loan', monthly: 142 }
    ]
  },
  {
    name: 'Credit Card',
    items: [
      { item: 'ADT', monthly: 53 },
      { item: 'Amazon', monthly: 100 },
      { item: 'Groceries', monthly: 600 },
      { item: 'Hair', monthly: 110 },
      { item: 'Orkin', monthly: 50 }
    ]
  },
  {
    name: 'Housing',
    items: [
      { item: 'HELOC', monthly: 357 },
      { item: 'HOA', monthly: 520 },
      { item: 'Mortgage', monthly: 2250 },
      { item: 'Spectrum', monthly: 197 },
      { item: 'Verizon', monthly: 283 }
    ]
  },
  {
    name: 'Savings',
    items: [
      { item: 'HSA', monthly: 200 },
      { item: 'Summer Saver', monthly: 400 },
      { item: "Tahoe's Major Repairs", monthly: 200 },
      { item: 'Vacation', monthly: 125 }
    ]
  }
];

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    setLoading(true);
    const { data: metadata, error } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', 'finance-savings-text-goals')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching savings goals:', error);
    } else if (metadata?.value) {
      setGoals(metadata.value.items || []);
    }
    setLoading(false);
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getSubtotal = (items: { monthly: number }[]) => {
    return items.reduce((sum, i) => sum + i.monthly, 0);
  };

  const grandTotalMonthly = SAVINGS_CATEGORIES.reduce((sum, cat) => sum + getSubtotal(cat.items), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#0a2f5f]">Savings Goal</h1>
          <p className="text-gray-600">Build reserves and financial stability</p>
        </div>
        <Link href="/finance" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
          Back to Finance
        </Link>
      </header>

      <section className="bg-white p-8 rounded-2xl border shadow-sm mb-8 border-t-8 border-t-[#9ADBDE]">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#9ADBDE] flex items-center justify-center text-white text-2xl font-bold">$</div>
          <h2 className="text-2xl font-bold text-[#0a2f5f]">2026 Financial Goals</h2>
        </div>
        <p className="text-gray-500 mb-6 italic">
          What is the biggest financial goal that you would like to accomplish in 2026? 
          Create a list of any additional financial goals you have and refer to them throughout the year.
        </p>
        <div className="space-y-2 border-l-4 border-blue-50 pl-4">
          {goals.length > 0 ? goals.map((g, i) => (
            <div key={i} className="text-[#0a2f5f] font-medium py-1 border-b border-dashed border-gray-100 last:border-0">{g}</div>
          )) : (
            <div className="text-gray-400 italic">No specific goals added yet.</div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: Math.ceil(SAVINGS_CATEGORIES.length / 2) }).map((_, idx) => (
          <div key={idx} className="space-y-8">
            {[SAVINGS_CATEGORIES[idx * 2], SAVINGS_CATEGORIES[idx * 2 + 1]].filter(Boolean).map(cat => (
              <div key={cat!.name} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-4 font-bold text-[#0a2f5f]">{cat!.name}</th>
                      <th className="p-4 text-center text-[10px] font-black uppercase text-gray-400">3 Months</th>
                      <th className="p-4 text-center text-[10px] font-black uppercase text-gray-400">6 Months</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cat!.items.map(item => (
                      <tr key={item.item}>
                        <td className="p-4 text-sm text-gray-700">{item.item}</td>
                        <td className="p-4 text-center text-sm text-gray-500">{formatCurrency(item.monthly * 3)}</td>
                        <td className="p-4 text-center text-sm text-gray-500">{formatCurrency(item.monthly * 6)}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50/30 font-bold">
                      <td className="p-4 text-sm text-[#0a2f5f]">{cat!.name} Total</td>
                      <td className="p-4 text-center text-sm text-[#0a2f5f]">{formatCurrency(getSubtotal(cat!.items) * 3)}</td>
                      <td className="p-4 text-center text-sm text-[#0a2f5f]">{formatCurrency(getSubtotal(cat!.items) * 6)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}
      </div>

      <section className="mt-12 bg-[#0a2f5f] text-white p-8 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Total Reserve Goals</h2>
          <p className="opacity-80">Accumulated target for all categories</p>
        </div>
        <div className="flex gap-12">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">3 Month Reserve</p>
            <p className="text-3xl font-bold">{formatCurrency(grandTotalMonthly * 3)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">6 Month Reserve</p>
            <p className="text-3xl font-bold">{formatCurrency(grandTotalMonthly * 6)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
