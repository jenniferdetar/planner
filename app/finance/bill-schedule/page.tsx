'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const BILL_ITEMS = [
  { category: 'Auto', item: 'Auto Maintenance', amount: 100 },
  { category: 'Auto', item: 'Mercury Auto Insurance', amount: 388 },
  { category: 'Auto', item: 'Tahoe Registration', amount: 15 },
  { category: 'Auto', item: 'Trailblazer Registration', amount: 28 },
  { category: 'Bill Pay', item: 'DWP', amount: 100 },
  { category: 'Bill Pay', item: 'Jeff\'s Credit Cards', amount: 500 },
  { category: 'Bill Pay', item: 'Jennifer\'s Student Loans', amount: 150 },
  { category: 'Bill Pay', item: 'Schools First Loan', amount: 142 },
  { category: 'Cash', item: 'Cleaning Lady', amount: 200 },
  { category: 'Cash', item: 'Gas', amount: 600 },
  { category: 'Cash', item: 'Laundry', amount: 80 },
  { category: 'Credit Card', item: 'ADT', amount: 53 },
  { category: 'Credit Card', item: 'Amazon', amount: 100 },
  { category: 'Credit Card', item: 'Groceries', amount: 600 },
  { category: 'Credit Card', item: 'Hair', amount: 110 },
  { category: 'Credit Card', item: 'Orkin', amount: 50 },
  { category: 'Housing', item: 'HELOC', amount: 357 },
  { category: 'Housing', item: 'HOA', amount: 520 },
  { category: 'Housing', item: 'Mortgage', amount: 2250 },
  { category: 'Housing', item: 'Spectrum', amount: 197 },
  { category: 'Housing', item: 'Verizon', amount: 283 },
  { category: 'Savings', item: 'Blow', amount: 200 },
  { category: 'Savings', item: 'HSA', amount: 200 },
  { category: 'Savings', item: 'Summer Saver', amount: 400 },
  { category: 'Savings', item: 'Tahoe\'s Major Repairs', amount: 200 },
  { category: 'Savings', item: 'Vacation', amount: 125 }
];

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export default function BillSchedulePage() {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const storageKey = 'bill-payment-schedule:checked';

  useEffect(() => {
    fetchCheckedState();
  }, []);

  async function fetchCheckedState() {
    setLoading(true);
    const { data: metadata, error } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', storageKey)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching bill schedule state:', error);
    } else if (metadata?.value) {
      setCheckedState(metadata.value as Record<string, boolean>);
    }
    setLoading(false);
  }

  async function toggleBox(item: string, monthIndex: number) {
    const boxKey = `${item}:${monthIndex}`;
    const newCheckedState = {
      ...checkedState,
      [boxKey]: !checkedState[boxKey]
    };
    setCheckedState(newCheckedState);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: storageKey,
        value: newCheckedState,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) console.error('Error saving bill schedule state:', error);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#0a2f5f]">Bill Payment Schedule</h1>
          <p className="text-gray-600">Track recurring expenses and payments</p>
        </div>
        <Link href="/finance" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
          Back to Finance
        </Link>
      </header>

      <div className="bg-white p-8 rounded-xl border shadow-sm">
        <p className="text-gray-500 text-sm mb-6 pb-6 border-b">
          Keep track of your bill payments by listing recurring expenses, including how much they cost and what date they are typically paid. 
          Check them off the list below as you pay your bills each month.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-4 pr-4">Category</th>
                <th className="pb-4 pr-4">Item</th>
                <th className="pb-4 pr-4">Amount</th>
                <th className="pb-4">
                  <div className="grid grid-cols-12 gap-1 text-center w-full min-w-[300px]">
                    {MONTHS.map((m, i) => <span key={i}>{m}</span>)}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {BILL_ITEMS.map((row, i) => (
                <tr key={i} className="group hover:bg-gray-50">
                  <td className="py-3 pr-4 text-sm font-semibold text-gray-500">{row.category}</td>
                  <td className="py-3 pr-4 text-sm font-bold text-gray-700">{row.item}</td>
                  <td className="py-3 pr-4 text-sm text-gray-600">${row.amount}</td>
                  <td className="py-3">
                    <div className="grid grid-cols-12 gap-1 w-full min-w-[300px]">
                      {MONTHS.map((_, mIdx) => {
                        const isChecked = checkedState[`${row.item}:${mIdx}`];
                        return (
                          <div 
                            key={mIdx}
                            onClick={() => toggleBox(row.item, mIdx)}
                            className={`h-6 w-full rounded border cursor-pointer transition-all ${
                              isChecked ? 'bg-green-500 border-green-600' : 'bg-gray-100 border-gray-200 hover:border-gray-400'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
