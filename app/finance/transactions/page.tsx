'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types/database.types';
import Link from 'next/link';

const ACCOUNTS = [
  "Currently in Checking",
  "Jennifer's Check",
  "Tithe",
  "ADT",
  "Amazon",
  "Auto Maintenance",
  "Blow",
  "Cleaning Lady",
  "DWP",
  "Gas",
  "Groceries",
  "Hair",
  "HSA",
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

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      const { data, error } = await supabase
        .from('Check Breakdown')
        .select('*');
      
      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    }
    fetchTransactions();
  }, []);

  async function handleUpdate(account: string, date: string, amount: number) {
    const existing = transactions.find(t => t.account === account && t.date === date);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
    fetchTransactions(); // Refresh
  }

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#0a2f5f]">Transactions</h1>
          <p className="text-gray-600">Projected checkbook and account tracking</p>
        </div>
        <Link href="/finance" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
          Back to Finance
        </Link>
      </header>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading transactions...</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-[#f1f5f9]">
                <th className="p-4 border-b font-bold text-[#0a2f5f] sticky left-0 bg-[#f1f5f9] z-10">Account</th>
                {DATES.map(date => (
                  <th key={date} className="p-4 border-b font-bold text-[#0a2f5f] text-center">
                    <div className="text-xs whitespace-nowrap">
                      💵 {new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACCOUNTS.map(account => (
                <tr key={account} className="hover:bg-gray-50 group">
                  <td className="p-4 border-b font-medium text-gray-700 sticky left-0 bg-white group-hover:bg-gray-50 z-10">{account}</td>
                  {DATES.map(date => {
                    const tx = transactions.find(t => t.account === account && t.date === date);
                    const amount = tx ? tx.amount : 0;
                    return (
                      <td key={date} className="p-2 border-b text-center">
                        <TransactionInput 
                          initialValue={amount} 
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
    </div>
  );
}

function TransactionInput({ initialValue, onUpdate }: { initialValue: number; onUpdate: (val: number) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue.toString());

  useEffect(() => {
    setValue(initialValue.toString());
  }, [initialValue]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numericValue = parseFloat(value) || 0;
    if (numericValue !== initialValue) {
      onUpdate(numericValue);
    }
  };

  if (isEditing) {
    return (
      <input 
        autoFocus
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        className="w-24 p-1 border rounded text-right outline-none focus:ring-1 focus:ring-blue-500"
      />
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer p-1 rounded hover:bg-gray-100 text-sm ${initialValue < 0 ? 'text-red-600' : 'text-gray-700'}`}
    >
      {formatCurrency(initialValue)}
    </div>
  );
}
