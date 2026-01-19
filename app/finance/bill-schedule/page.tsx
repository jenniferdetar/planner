'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Calendar, ChevronLeft, Save, CheckCircle2, 
  AlertCircle, DollarSign, ArrowUpRight, Search
} from 'lucide-react';

const BILL_ITEMS = [
  { category: 'Auto', item: 'Auto Maintenance', amount: 100 },
  { category: 'Auto', item: 'Mercury Auto Insurance', amount: 388 },
  { category: 'Auto', item: 'Tahoe Registration', amount: 15 },
  { category: 'Auto', item: 'Trailblazer Registration', amount: 28 },
  { category: 'Bill Pay', item: 'Dwp', amount: 100 },
  { category: 'Bill Pay', item: 'Jeff\'s Credit Cards', amount: 500 },
  { category: 'Bill Pay', item: 'Jennifer\'s Student Loans', amount: 150 },
  { category: 'Bill Pay', item: 'Schools First Loan', amount: 142 },
  { category: 'Cash', item: 'Cleaning Lady', amount: 200 },
  { category: 'Cash', item: 'Gas', amount: 600 },
  { category: 'Cash', item: 'Laundry', amount: 80 },
  { category: 'Credit Card', item: 'Adt', amount: 53 },
  { category: 'Credit Card', item: 'Amazon', amount: 100 },
  { category: 'Credit Card', item: 'Groceries', amount: 600 },
  { category: 'Credit Card', item: 'Hair', amount: 110 },
  { category: 'Credit Card', item: 'Orkin', amount: 50 },
  { category: 'Housing', item: 'Heloc', amount: 357 },
  { category: 'Housing', item: 'HOA', amount: 520 },
  { category: 'Housing', item: 'Mortgage', amount: 2250 },
  { category: 'Housing', item: 'Spectrum', amount: 197 },
  { category: 'Housing', item: 'Verizon', amount: 283 },
  { category: 'Savings', item: 'Blow', amount: 200 },
  { category: 'Savings', item: 'Hsa', amount: 200 },
  { category: 'Savings', item: 'Summer Saver', amount: 400 },
  { category: 'Savings', item: 'Tahoe\'s Major Repairs', amount: 200 },
  { category: 'Savings', item: 'Vacation', amount: 125 }
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CATEGORY_COLORS: Record<string, string> = {
  Auto: '#99B3C5',
  'Bill Pay': '#FFA1AB',
  Cash: '#9ADBDE',
  'Credit Card': '#FFC68D',
  Housing: '#99B3C5',
  Savings: '#FFA1AB'
};

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || '#94a3b8';
}

export default function BillSchedulePage() {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});

  const storageKey = 'bill-payment-schedule:checked';

  useEffect(() => {
    let ignore = false;
    async function fetchCheckedState() {
      const { data: metadata, error } = await supabase
        .from('opus_metadata')
        .select('value')
        .eq('key', storageKey)
        .single();
      
      if (!ignore) {
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching bill schedule state:', error);
        } else if (metadata?.value) {
          setCheckedState(metadata.value as Record<string, boolean>);
        }
      }
    }
    const timeoutId = setTimeout(() => {
      fetchCheckedState();
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [storageKey]);

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
    <div className="bg-[#fdfdfd] min-h-screen">
        <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden mb-12 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#FFA1AB]"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-black text-[#0a2f5f]  tracking-tight mb-4 flex items-center gap-3">
              <CheckCircle2 className="text-[#FFA1AB]" size={24} />
              Annual Payment Registry
            </h2>
            <p className="text-gray-500 font-medium leading-relaxed italic">
              Maintain precise records of recurring financial obligations. Verify completion by marking the corresponding month in the registry below.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400  tracking-[0.2em] bg-gray-50 px-6 py-3 rounded-full border">
            <Search size={14} />
            Filter Categories
          </div>
        </div>

        <div className="overflow-x-auto -mx-8 md:-mx-12 px-8 md:px-12">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-6 font-black text-[#0a2f5f] text-[10px]  tracking-[0.2em] w-32">Category</th>
                <th className="py-6 font-black text-[#0a2f5f] text-[10px]  tracking-[0.2em] w-48">Registry Item</th>
                <th className="py-6 font-black text-[#0a2f5f] text-[10px]  tracking-[0.2em] w-24">Amount</th>
                <th className="py-6">
                  <div className="grid grid-cols-12 gap-2 text-center">
                    {MONTHS.map((m, i) => (
                      <span key={i} className="text-[10px] font-black text-[#0a2f5f]  tracking-widest opacity-40">
                        {m}
                      </span>
                    ))}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {BILL_ITEMS.map((row, i) => {
                const categoryColor = getCategoryColor(row.category);
                return (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5">
                    <span
                      className="text-[10px] font-black  tracking-widest px-3 py-1 rounded-full border"
                      style={{
                        color: categoryColor,
                        backgroundColor: `${categoryColor}14`,
                        borderColor: `${categoryColor}33`
                      }}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="py-5 pr-4 text-sm font-bold text-[#0a2f5f]">{row.item}</td>
                  <td className="py-5 pr-4">
                    <div className="flex items-center gap-1 text-sm font-black text-gray-400">
                      <DollarSign size={14} className="opacity-30" />
                      {row.amount}
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="grid grid-cols-12 gap-2 w-full">
                      {MONTHS.map((_, mIdx) => {
                        const isChecked = checkedState[`${row.item}:${mIdx}`];
                        return (
                          <div 
                            key={mIdx}
                            onClick={() => toggleBox(row.item, mIdx)}
                            className={`h-8 w-full rounded-lg border-2 cursor-pointer transition-all flex items-center justify-center ${
                              isChecked 
                                ? 'shadow-lg text-white' 
                                : 'bg-gray-50 border-gray-100'
                            }`}
                            style={isChecked ? { backgroundColor: categoryColor, borderColor: categoryColor, boxShadow: `0 10px 20px ${categoryColor}33` } : { borderColor: `${categoryColor}33` }}
                          >
                            {isChecked && <Save size={12} className="animate-in fade-in zoom-in" />}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#FFA1AB]/10 p-8 rounded-[2rem] border-2 border-[#FFA1AB]/20">
          <h4 className="text-[#0a2f5f] font-black  tracking-[0.2em] text-[10px] mb-4 flex items-center gap-2">
            <AlertCircle size={14} />
            Compliance Note
          </h4>
          <p className="text-[#0a2f5f] font-serif italic text-lg leading-relaxed">
            &quot;Ensure all digital transactions are cross-referenced with bank statements before final monthly certification.&quot;
          </p>
        </div>
        <div className="md:col-span-2 bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200">
              <ArrowUpRight className="text-[#0a2f5f]" size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black text-gray-400  tracking-widest mb-1">Liability Status</div>
              <div className="text-lg font-black text-[#0a2f5f]">All Systems Operational</div>
            </div>
          </div>
          <div className="text-[10px] font-black  tracking-[0.3em] text-[#0a2f5f]/30 italic">Registry Secure</div>
        </div>
      </div>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black  tracking-[0.4em]">Official Liability Registry © 2026</p>
      </footer>
      </div>
    </div>
  );
}
