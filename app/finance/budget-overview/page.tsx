'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
  const [saving, setSaving] = useState(false);

  const storageKey = 'finance-budget-actuals';

  useEffect(() => {
    async function fetchActuals() {
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
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const totals = BUDGET_ITEMS.reduce((acc, curr) => {
    const actual = actuals[curr.item] || 0;
    acc.budget += curr.budget;
    acc.actual += actual;
    acc.variance += (curr.budget - actual);
    return acc;
  }, { budget: 0, actual: 0, variance: 0 });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#0a2f5f]">Budget Overview</h1>
          <p className="text-gray-600">Monthly Budget & Variance Analysis</p>
        </div>
        <Link href="/finance" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
          Back to Finance
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard title="Total Budget" value={totals.budget} color="text-blue-600" />
        <SummaryCard title="Total Actual" value={totals.actual} color="text-gray-700" />
        <SummaryCard 
          title="Net Variance" 
          value={totals.variance} 
          color={totals.variance < 0 ? 'text-red-600' : 'text-green-600'} 
        />
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="font-bold text-[#0a2f5f]">Budget Breakdown</h2>
          {saving && <span className="text-xs text-blue-500 animate-pulse font-bold">Saving...</span>}
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
              <th className="p-4 border-b">Item</th>
              <th className="p-4 border-b">Type</th>
              <th className="p-4 border-b text-right">Budget</th>
              <th className="p-4 border-b text-right">Actual</th>
              <th className="p-4 border-b text-right">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {BUDGET_ITEMS.map((item) => {
              const actual = actuals[item.item] || 0;
              const variance = item.budget - actual;
              return (
                <tr key={item.item} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-gray-700">
                    <div>{item.item}</div>
                    <div className="text-[10px] text-gray-400 uppercase">{item.category}</div>
                  </td>
                  <td className="p-4 text-xs font-bold text-gray-500">{item.type}</td>
                  <td className="p-4 text-sm text-right text-gray-600">{formatCurrency(item.budget)}</td>
                  <td className="p-4 text-right">
                    <input 
                      type="number" 
                      value={actuals[item.item] || ''} 
                      onChange={(e) => handleUpdateActual(item.item, e.target.value)}
                      placeholder="0"
                      className="w-24 p-1 border rounded text-right text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </td>
                  <td className={`p-4 text-sm text-right font-bold ${variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(variance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-[#f8fafc] font-bold border-t-2">
            <tr>
              <td colSpan={2} className="p-4 text-[#0a2f5f]">GRAND TOTAL</td>
              <td className="p-4 text-right text-[#0a2f5f]">{formatCurrency(totals.budget)}</td>
              <td className="p-4 text-right text-[#0a2f5f]">{formatCurrency(totals.actual)}</td>
              <td className={`p-4 text-right ${totals.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(totals.variance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
      </p>
    </div>
  );
}
