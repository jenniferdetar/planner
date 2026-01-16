'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
      { name: 'DWP', budget: 100 },
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
      { name: 'ADT', budget: 53 },
      { name: 'Amazon', budget: 100 },
      { name: 'Groceries', budget: 600 },
      { name: 'Hair', budget: 110 },
      { name: 'Orkin', budget: 50 }
    ]
  },
  {
    name: 'Housing',
    items: [
      { name: 'HELOC', budget: 357 },
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
      { name: 'HSA', budget: 200 },
      { name: 'Summer Saver', budget: 400 },
      { name: "Tahoe's Major Repairs", budget: 200 },
      { name: 'Vacation', budget: 125 }
    ]
  }
];

const PAY_WEEKS = [
  { id: 'jf1', label: 'Jeff Disability' },
  { id: 'j1', label: 'Jennifer 1st' },
  { id: 'j2', label: 'Jennifer 2nd' }
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
    async function fetchState() {
      setLoading(true);
      const { data: metadata, error } = await supabase
        .from('opus_metadata')
        .select('value')
        .eq('key', storageKey)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching spending plan:', error);
      } else if (metadata?.value) {
        setState(metadata.value as SpendingState);
      }
      setLoading(false);
    }
    fetchState();
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
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  // Calculations
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading plan...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#0a2f5f]">Spending Plan</h1>
          <p className="text-gray-600">Allocated Spending by Pay Week</p>
        </div>
        <Link href="/finance" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
          Back to Finance
        </Link>
      </header>

      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#f1f5f9] text-[#0a2f5f] text-xs font-bold uppercase">
              <th className="p-4 border-b sticky left-0 bg-[#f1f5f9] z-10" rowSpan={2}>Item</th>
              <th className="p-4 border-b text-center" rowSpan={2}>Budget</th>
              {PAY_WEEKS.map(pw => (
                <th key={pw.id} className="p-4 border-b text-center border-l" colSpan={2}>{pw.label}</th>
              ))}
              <th className="p-4 border-b text-center border-l" rowSpan={2}>Actual Spent</th>
              <th className="p-4 border-b text-center border-l" rowSpan={2}>Remaining</th>
            </tr>
            <tr className="bg-[#f8fafc] text-[#0a2f5f] text-[10px] font-bold uppercase">
              {PAY_WEEKS.map(pw => (
                <React.Fragment key={pw.id}>
                  <th className="p-2 border-b text-center border-l">Spent</th>
                  <th className="p-2 border-b text-center">Rem. Income</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-blue-50 font-bold">
              <td className="p-4 border-b sticky left-0 bg-blue-50 z-10 text-[#0a2f5f]">INCOME</td>
              <td className="p-4 border-b text-center">{formatCurrency(calculations.totalBudget)}</td>
              {PAY_WEEKS.map(pw => (
                <React.Fragment key={pw.id}>
                  <td className="p-2 border-b border-l">
                    <input 
                      type="number" 
                      className="w-full p-1 border rounded text-right bg-white"
                      value={state.income[pw.id] || ''}
                      onChange={(e) => handleIncomeChange(pw.id, e.target.value)}
                    />
                  </td>
                  <td className="p-2 border-b text-center text-blue-700">
                    {formatCurrency(calculations.payWeekRemaining[pw.id])}
                  </td>
                </React.Fragment>
              ))}
              <td className="p-4 border-b text-center border-l">{formatCurrency(calculations.totalIncome)}</td>
              <td className="p-4 border-b text-center border-l text-green-600">
                {formatCurrency(calculations.totalIncome - calculations.totalSpent)}
              </td>
            </tr>

            {CATEGORIES.map(cat => (
              <React.Fragment key={cat.name}>
                <tr className="bg-gray-100 font-bold text-[#0a2f5f]">
                  <td colSpan={10} className="p-2 border-b">{cat.name}</td>
                </tr>
                {cat.items.map(item => {
                  const itemKey = `${cat.name}:${item.name}`;
                  const actual = calculations.itemActuals[itemKey];
                  const remaining = item.budget - actual;
                  return (
                    <tr key={item.name} className="hover:bg-gray-50 text-sm">
                      <td className="p-3 border-b sticky left-0 bg-white hover:bg-gray-50 z-10 text-gray-700 font-medium">{item.name}</td>
                      <td className="p-3 border-b text-center text-gray-500">{formatCurrency(item.budget)}</td>
                      {PAY_WEEKS.map(pw => (
                        <React.Fragment key={pw.id}>
                          <td className="p-1 border-b border-l">
                            <input 
                              type="number"
                              className="w-full p-1 border-transparent hover:border-gray-300 focus:border-blue-500 rounded text-right transition-all outline-none"
                              value={state.spending[itemKey]?.[pw.id] || ''}
                              onChange={(e) => handleSpendingChange(itemKey, pw.id, e.target.value)}
                            />
                          </td>
                          <td className="p-1 border-b"></td>
                        </React.Fragment>
                      ))}
                      <td className="p-3 border-b text-center border-l font-semibold text-gray-700">{formatCurrency(actual)}</td>
                      <td className={`p-3 border-b text-center border-l font-bold ${remaining < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {formatCurrency(remaining)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-bold text-xs">
                  <td className="p-3 border-b sticky left-0 bg-gray-50 z-10">{cat.name} Total</td>
                  <td className="p-3 border-b text-center">{formatCurrency(calculations.categoryTotals[cat.name].budget)}</td>
                  {PAY_WEEKS.map(pw => (
                    <React.Fragment key={pw.id}>
                      <td className="p-3 border-b border-l text-right">
                        {formatCurrency(cat.items.reduce((acc, item) => acc + (state.spending[`${cat.name}:${item.name}`]?.[pw.id] || 0), 0))}
                      </td>
                      <td className="p-3 border-b"></td>
                    </React.Fragment>
                  ))}
                  <td className="p-3 border-b text-center border-l">{formatCurrency(calculations.categoryTotals[cat.name].actual)}</td>
                  <td className="p-3 border-b text-center border-l"></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#0a2f5f] text-white font-bold">
              <td className="p-4 sticky left-0 bg-[#0a2f5f] z-10">GRAND TOTAL</td>
              <td className="p-4 text-center">{formatCurrency(calculations.totalBudget)}</td>
              {PAY_WEEKS.map(pw => (
                <React.Fragment key={pw.id}>
                  <td className="p-4 border-l text-right">
                    {formatCurrency(CATEGORIES.reduce((acc, cat) => acc + cat.items.reduce((a, b) => a + (state.spending[`${cat.name}:${b.name}`]?.[pw.id] || 0), 0), 0))}
                  </td>
                  <td className="p-4 text-center">
                    {formatCurrency(calculations.payWeekRemaining[pw.id])}
                  </td>
                </React.Fragment>
              ))}
              <td className="p-4 text-center border-l">{formatCurrency(calculations.totalSpent)}</td>
              <td className="p-4 text-center border-l">{formatCurrency(calculations.totalBudget - calculations.totalSpent)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {saving && (
        <div className="fixed bottom-4 right-4 bg-[#0a2f5f] text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-pulse">
          Saving changes...
        </div>
      )}
    </div>
  );
}
