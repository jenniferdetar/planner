'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types/database.types';

import Link from 'next/link';
import { 
  Receipt, ChevronLeft, Loader2, 
  ArrowUpRight, Landmark, Filter, Download
} from 'lucide-react';

const ACCOUNTS = [
  "Currently in Checking",
  "Jennifer's Check",
  "Tithe",
  "Adt",
  "Amazon",
  "Auto Maintenance",
  "Blow",
  "Cleaning Lady",
  "Dwp",
  "Gas",
  "Groceries",
  "Hair",
  "Hsa",
  "Laundry",
  "Mercury Auto Insurance",
  "Orkin",
  "Summer Saver",
  "Schools First Loan",
  "Spectrum",
  "Tahoe Registration",
  "Trailblazer Registration",
  "Verizon"
];

const DATES = [
  "2025-07-08", "2025-07-23", "2025-08-08", "2025-08-23",
  "2025-09-08", "2025-09-23", "2025-10-08", "2025-10-23",
  "2025-11-08", "2025-11-23", "2025-12-08", "2025-12-23",
  "2026-01-08"
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchTransactions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('Check Breakdown')
        .select('*');
      
      if (!ignore) {
        if (error) {
          console.error('Error fetching transactions:', error);
        } else {
          setTransactions(data || []);
        }
        setLoading(false);
      }
    };

    fetchTransactions();
    return () => { ignore = true; };
  }, []);

  async function handleUpdate(account: string, date: string, amount: number) {
    const key = `${account}-${date}`;
    setSaving(key);
    const existing = transactions.find(t => t.account === account && t.date === date);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(null);
      return;
    }

    if (existing) {
      const { error } = await supabase
        .from('Check Breakdown')
        .update({ amount, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      
      if (error) console.error('Error updating transaction:', error);
    } else {
      const { error } = await supabase
        .from('Check Breakdown')
        .insert({
          user_id: user.id,
          account,
          date,
          amount,
          category: 'General',
          updated_at: new Date().toISOString()
        });
      
      if (error) console.error('Error inserting transaction:', error);
    }
    
    // Optimistic update
    const nextTransactions = [...transactions.filter(t => !(t.account === account && t.date === date))];
    nextTransactions.push({ 
      account, 
      date, 
      amount, 
      id: existing?.id || crypto.randomUUID(), 
      user_id: user.id,
      category: 'General',
      updated_at: new Date().toISOString() 
    } as Transaction);
    setTransactions(nextTransactions);
    setSaving(null);
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto bg-[#fdfdfd] min-h-screen font-sans">

      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden mb-12">
        <div className="p-8 border-b border-gray-50 bg-[#f8fafc] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Landmark className="text-[#0a2f5f]" size={20} />
            <h2 className="text-lg font-black text-[#0a2f5f] uppercase tracking-tight">Financial Matrix</h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-full border">
            <Filter size={12} />
            Filter Registry
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
            <Loader2 className="animate-spin mb-4" size={48} />
            <div className="text-xs font-black uppercase tracking-widest">Compiling Records...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="p-6 font-black text-[#0a2f5f] text-[10px] uppercase tracking-[0.2em] sticky left-0 bg-white z-20 border-r border-gray-50">
                    Account Detail
                  </th>
                  {DATES.map((date: string) => (
                    <th key={date} className="p-6 font-black text-[#0a2f5f] text-center border-r border-gray-50 last:border-r-0">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-sm font-black text-[#0a2f5f] whitespace-nowrap">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACCOUNTS.map((account: string, idx: number) => (
                  <tr key={account} className={`group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-blue-50/50 transition-colors`}>
                    <td className="p-6 border-b border-gray-50 font-bold text-[#0a2f5f] sticky left-0 bg-inherit group-hover:bg-inherit z-20 border-r border-gray-50 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#99B3C5]"></div>
                        {account}
                      </div>
                    </td>
                    {DATES.map((date: string) => {
                      const tx = transactions.find(t => t.account === account && t.date === date);
                      const amount = tx ? tx.amount : 0;
                      const isSaving = saving === `${account}-${date}`;
                      return (
                        <td key={date} className="p-2 border-b border-gray-50 text-center border-r border-gray-50 last:border-r-0 group-hover:border-blue-100/50">
                          <TransactionInput 
                            initialValue={amount} 
                            isSaving={isSaving}
                            onUpdate={(val) => handleUpdate(account, date, val)} 
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#99B3C5]/10 p-8 rounded-[2rem] border-2 border-[#99B3C5]/20">
          <h4 className="text-[#0a2f5f] font-black uppercase tracking-[0.2em] text-[10px] mb-4">Ledger Insight</h4>
          <p className="text-[#0a2f5f] font-serif italic text-lg leading-relaxed">
            &quot;Projected balances assist in identifying potential liquidity gaps before they materialize.&quot;
          </p>
        </div>
        <div className="md:col-span-2 bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200">
              <ArrowUpRight className="text-[#0a2f5f]" size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Reconciled</div>
              <div className="text-lg font-black text-[#0a2f5f]">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0a2f5f]/30">Verified Record</div>
        </div>
      </div>
    </div>
  );
}

function TransactionInput({ initialValue, onUpdate, isSaving }: { initialValue: number; onUpdate: (val: number) => void; isSaving: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue.toString());

  useEffect(() => {
    setValue(initialValue.toString());
  }, [initialValue]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numericValue = parseFloat(value) || 0;
    if (numericValue !== initialValue) {
      onUpdate(numericValue);
    }
  };

  if (isSaving) {
    return (
      <div className="flex justify-center items-center py-2 h-8">
        <Loader2 size={14} className="animate-spin text-blue-400" />
      </div>
    );
  }

  if (isEditing) {
    return (
      <input 
        autoFocus
        type="number"
        step="1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
        className="w-24 p-1 bg-white border-2 border-[#99B3C5] rounded-lg text-right outline-none font-black text-[#0a2f5f] shadow-inner"
      />
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer px-3 py-2 rounded-xl hover:bg-white hover:shadow-md transition-all font-black text-sm text-center ${initialValue < 0 ? 'text-rose-500 bg-rose-50/50' : 'text-[#0a2f5f]'}`}
    >
      {formatCurrency(initialValue)}
    </div>
  );
}
