'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  ChevronLeft, Printer, Save, Plus, Trash2,
  MapPin, Car, Receipt, CreditCard, Landmark,
  Calendar, UserCircle, ShieldCheck, ArrowRight,
  Plane, Hotel, Coffee
} from 'lucide-react';

interface MileageEntry {
  id: string;
  date: string;
  from: string;
  to: string;
  miles: number;
}

interface OtherExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
}

interface TRData {
  claimant: {
    name: string;
    employeeId: string;
    unit: string;
    phone: string;
    email: string;
  };
  trip: {
    purpose: string;
    destination: string;
    startDate: string;
    endDate: string;
  };
  mileage: {
    entries: MileageEntry[];
    rate: number;
  };
  expenses: OtherExpense[];
  accounting: {
    cc: string;
    fund: string;
    functionalArea: string;
    glAccount: string;
  };
}

const EMPTY_MILEAGE = (): MileageEntry => ({
  id: crypto.randomUUID(),
  date: '',
  from: '',
  to: '',
  miles: 0,
});

const EMPTY_EXPENSE = (): OtherExpense => ({
  id: crypto.randomUUID(),
  date: '',
  description: '',
  amount: 0,
});

const INITIAL_DATA: TRData = {
  claimant: {
    name: '',
    employeeId: '',
    unit: 'iCAAP / Induction',
    phone: '213-241-2468',
    email: '',
  },
  trip: {
    purpose: '',
    destination: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  },
  mileage: {
    entries: [EMPTY_MILEAGE()],
    rate: 0.67, // Standard 2024 IRS rate
  },
  expenses: [EMPTY_EXPENSE()],
  accounting: {
    cc: '',
    fund: '',
    functionalArea: '',
    glAccount: '',
  },
};

export default function TravelReimbursementPage() {
  const [data, setData] = useState<TRData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: metadata } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', 'travelReimbursementData')
      .single();

    if (metadata?.value) {
      setData(metadata.value as TRData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in to save.');
      setSaving(false);
      return;
    }

    await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: 'travelReimbursementData',
        value: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });
    
    setSaving(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const addMileage = () => {
    setData({
      ...data,
      mileage: { ...data.mileage, entries: [...data.mileage.entries, EMPTY_MILEAGE()] }
    });
  };

  const removeMileage = (id: string) => {
    setData({
      ...data,
      mileage: { ...data.mileage, entries: data.mileage.entries.filter(e => e.id !== id) }
    });
  };

  const updateMileage = (id: string, field: keyof MileageEntry, value: any) => {
    setData({
      ...data,
      mileage: {
        ...data.mileage,
        entries: data.mileage.entries.map(e => e.id === id ? { ...e, [field]: value } : e)
      }
    });
  };

  const addExpense = () => {
    setData({ ...data, expenses: [...data.expenses, EMPTY_EXPENSE()] });
  };

  const removeExpense = (id: string) => {
    setData({ ...data, expenses: data.expenses.filter(e => e.id !== id) });
  };

  const updateExpense = (id: string, field: keyof OtherExpense, value: any) => {
    setData({
      ...data,
      expenses: data.expenses.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const totalMiles = data.mileage.entries.reduce((sum, e) => sum + e.miles, 0);
  const mileageCost = totalMiles * data.mileage.rate;
  const otherCost = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const grandTotal = mileageCost + otherCost;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-[#00326b] flex items-center justify-center shadow-xl shadow-[#00326b]/20">
              <Plane className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#00326b] tracking-tight uppercase leading-none mb-1">Travel Reimbursement</h1>
              <p className="text-gray-400 font-bold tracking-widest text-[10px] uppercase">Official Expense Claim • iCAAP Administration</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/icaap/forms" className="flex items-center gap-2 px-6 py-2 bg-white border-2 border-[#00326b]/10 rounded-full font-bold text-[#00326b] hover:bg-[#00326b]/5 transition-all shadow-sm">
            <ChevronLeft size={20} />
            Back
          </Link>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="group flex items-center gap-3 px-8 py-2 bg-[#00326b] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-[#0a2f5f] transition-all disabled:opacity-50 shadow-lg shadow-[#00326b]/20"
          >
            <Save size={18} className="group-hover:scale-110 transition-transform" />
            {saving ? 'Syncing...' : 'Save Claim'}
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-3 px-8 py-2 bg-[#9ADBDE] text-[#00326b] font-black text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-[#7cc8cc] transition-all shadow-lg shadow-[#9ADBDE]/20"
          >
            <Printer size={18} />
            Print Form
          </button>
        </div>
      </header>

      {/* Form Container */}
      <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-2xl overflow-hidden mb-12">
        {/* Official Header */}
        <div className="bg-[#00326b] p-10 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-[0.2em] uppercase mb-1">Los Angeles Unified School District</h2>
            <h3 className="text-lg font-bold opacity-80 uppercase tracking-widest mb-4">Travel & Professional Expense Reimbursement</h3>
            <div className="inline-block px-8 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <span className="text-xs font-black uppercase tracking-[0.3em]">Official Expenditure Claim</span>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] opacity-5 pointer-events-none font-black">TRAVEL</div>
        </div>

        <div className="p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            {/* Claimant Details */}
            <div className="group relative bg-white p-10 rounded-[3rem] border-2 border-gray-100 hover:border-[#9ADBDE]/20 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-8 border-b border-gray-50 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#9ADBDE]/20 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                  <UserCircle className="text-[#00326b]" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#00326b] uppercase tracking-tight">Claimant Information</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Personnel Details</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Full Name</label>
                    <input 
                      type="text" 
                      value={data.claimant.name} 
                      onChange={e => setData({...data, claimant: {...data.claimant, name: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#9ADBDE]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Employee ID</label>
                    <input 
                      type="text" 
                      value={data.claimant.employeeId} 
                      onChange={e => setData({...data, claimant: {...data.claimant, employeeId: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#9ADBDE]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Office / Unit</label>
                  <input 
                    type="text" 
                    value={data.claimant.unit} 
                    onChange={e => setData({...data, claimant: {...data.claimant, unit: e.target.value}})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#9ADBDE]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Phone</label>
                    <input 
                      type="tel" 
                      value={data.claimant.phone} 
                      onChange={e => setData({...data, claimant: {...data.claimant, phone: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#9ADBDE]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email</label>
                    <input 
                      type="email" 
                      value={data.claimant.email} 
                      onChange={e => setData({...data, claimant: {...data.claimant, email: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#9ADBDE]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="group relative bg-white p-10 rounded-[3rem] border-2 border-gray-100 hover:border-[#9ADBDE]/20 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-8 border-b border-gray-50 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#9ADBDE]/20 flex items-center justify-center shadow-inner group-hover:-rotate-6 transition-transform">
                  <MapPin className="text-[#00326b]" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#00326b] uppercase tracking-tight">Trip Details</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Purpose & Destination</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Purpose of Travel</label>
                  <div className="relative">
                    <textarea 
                      value={data.trip.purpose} 
                      onChange={e => setData({...data, trip: {...data.trip, purpose: e.target.value}})}
                      placeholder="Conference name, school visit, or specialized training..."
                      className="w-full px-8 py-8 bg-[#fdfbf7] border-2 border-[#e6e2d3] rounded-2xl text-lg font-serif leading-loose focus:ring-4 focus:ring-[#9ADBDE]/5 outline-none transition-all shadow-inner min-h-[150px] resize-none"
                      style={{ 
                        backgroundImage: 'linear-gradient(#e6e2d3 1px, transparent 1px)', 
                        backgroundSize: '100% 2.5rem',
                        lineHeight: '2.5rem',
                        paddingTop: '2rem'
                      }}
                    />
                    <div className="absolute top-0 left-10 bottom-0 w-0.5 bg-red-200/30"></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Destination</label>
                  <input 
                    type="text" 
                    value={data.trip.destination} 
                    onChange={e => setData({...data, trip: {...data.trip, destination: e.target.value}})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#9ADBDE]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Departure Date</label>
                    <input 
                      type="date" 
                      value={data.trip.startDate} 
                      onChange={e => setData({...data, trip: {...data.trip, startDate: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#9ADBDE]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Return Date</label>
                    <input 
                      type="date" 
                      value={data.trip.endDate} 
                      onChange={e => setData({...data, trip: {...data.trip, endDate: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#9ADBDE]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mileage Log */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border-2 border-gray-100">
                  <Car className="text-[#00326b]" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#00326b] uppercase tracking-tight">Mileage Log</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Official Mileage Claim</p>
                </div>
              </div>
              <button 
                onClick={addMileage}
                className="flex items-center gap-2 px-6 py-2 bg-[#00326b] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#0a2f5f] transition-all shadow-lg shadow-[#00326b]/20"
              >
                <Plus size={16} />
                Add Entry
              </button>
            </div>

            <div className="bg-gray-50 rounded-[2.5rem] border-2 border-gray-100 overflow-hidden shadow-inner p-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Origin</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Destination</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Miles</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.mileage.entries.map((entry) => (
                    <tr key={entry.id} className="group/row hover:bg-white transition-all">
                      <td className="p-4">
                        <input 
                          type="date" 
                          value={entry.date}
                          onChange={e => updateMileage(entry.id, 'date', e.target.value)}
                          className="w-full bg-transparent border-0 font-bold text-[#00326b] focus:ring-0"
                        />
                      </td>
                      <td className="p-4">
                        <input 
                          type="text" 
                          value={entry.from}
                          onChange={e => updateMileage(entry.id, 'from', e.target.value)}
                          placeholder="Start point..."
                          className="w-full bg-transparent border-0 font-bold text-gray-700 placeholder:text-gray-200 focus:ring-0"
                        />
                      </td>
                      <td className="p-4">
                        <input 
                          type="text" 
                          value={entry.to}
                          onChange={e => updateMileage(entry.id, 'to', e.target.value)}
                          placeholder="End point..."
                          className="w-full bg-transparent border-0 font-bold text-gray-700 placeholder:text-gray-200 focus:ring-0"
                        />
                      </td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          value={entry.miles}
                          onChange={e => updateMileage(entry.id, 'miles', parseFloat(e.target.value) || 0)}
                          className="w-20 mx-auto text-center bg-white border-2 border-gray-100 rounded-xl py-2 font-black text-[#00326b] focus:border-[#9ADBDE]/40 outline-none"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => removeMileage(entry.id)}
                          className="p-2 text-gray-200 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Other Expenses */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border-2 border-gray-100">
                  <Receipt className="text-[#00326b]" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#00326b] uppercase tracking-tight">Incidental Expenses</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tolls, Parking, Registration, etc.</p>
                </div>
              </div>
              <button 
                onClick={addExpense}
                className="flex items-center gap-2 px-6 py-2 bg-[#00326b] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#0a2f5f] transition-all shadow-lg shadow-[#00326b]/20"
              >
                <Plus size={16} />
                Add Expense
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.expenses.map((expense) => (
                <div key={expense.id} className="relative group bg-white p-6 rounded-[2rem] border-2 border-gray-100 hover:border-[#9ADBDE]/20 hover:shadow-xl transition-all duration-500">
                  <button 
                    onClick={() => removeExpense(expense.id)}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-gray-300 hover:text-red-500 hover:border-red-100 transition-all shadow-sm z-10"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center">
                      <input 
                        type="date" 
                        value={expense.date}
                        onChange={e => updateExpense(expense.id, 'date', e.target.value)}
                        className="bg-transparent border-0 font-bold text-xs text-gray-400 uppercase tracking-widest focus:ring-0 p-0"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-400">$</span>
                        <input 
                          type="number" 
                          value={expense.amount}
                          onChange={e => updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-24 bg-gray-50 border-0 rounded-xl px-3 py-1 font-black text-right text-[#00326b] focus:ring-2 focus:ring-[#9ADBDE]/20"
                        />
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={expense.description}
                      onChange={e => updateExpense(expense.id, 'description', e.target.value)}
                      placeholder="Expense description..."
                      className="w-full bg-transparent border-0 font-bold text-gray-700 placeholder:text-gray-200 focus:ring-0 p-0 text-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Summary & Accounting */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Accounting */}
            <div className="lg:col-span-8 bg-gray-50 rounded-[3rem] p-10 border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <Landmark className="text-[#00326b]" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#00326b] uppercase tracking-tight">Administrative Allocation</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Structure</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(data.accounting).map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                      {key === 'cc' ? 'Cost Center' : key === 'functionalArea' ? 'Func Area' : key.toUpperCase()}
                    </label>
                    <input 
                      type="text" 
                      value={(data.accounting as any)[key]} 
                      onChange={e => setData({...data, accounting: {...data.accounting, [key]: e.target.value}})}
                      className="w-full px-4 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-[#9ADBDE]/20 outline-none transition-all font-bold text-gray-700 shadow-sm text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Final Total */}
            <div className="lg:col-span-4">
              <div className="bg-[#00326b] rounded-[3rem] p-10 text-white shadow-2xl shadow-[#00326b]/30 relative overflow-hidden h-full">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-white/60 font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                      <ShieldCheck size={14} />
                      Claim Summary
                    </h4>
                    <div className="text-6xl font-black mb-2 tracking-tighter">
                      ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Total Reimbursement Due</p>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40 font-black uppercase tracking-widest flex items-center gap-2">
                        <Car size={12} /> Mileage
                      </span>
                      <span className="font-bold">${mileageCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40 font-black uppercase tracking-widest flex items-center gap-2">
                        <Receipt size={12} /> Incidental
                      </span>
                      <span className="font-bold">${otherCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 text-[12rem] opacity-10 pointer-events-none font-black">✈️</div>
              </div>
            </div>
          </div>

          {/* Authorization */}
          <div className="mt-12 p-10 bg-white border-2 border-gray-100 rounded-[3rem] group hover:border-[#9ADBDE]/20 transition-all duration-500">
            <h4 className="text-[#00326b] font-black uppercase tracking-widest text-xs mb-8">Official Authorizations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="h-16 border-b-2 border-gray-200 flex items-end pb-2 italic text-gray-300 font-serif">Claimant Signature</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee / Claimant</div>
              </div>
              <div className="space-y-4">
                <div className="h-16 border-b-2 border-gray-200 flex items-end pb-2 font-bold text-[#00326b] uppercase tracking-tight italic text-gray-200 font-handwriting">P. Pernin</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrative Approval</div>
              </div>
              <div className="space-y-4">
                <div className="h-16 border-b-2 border-gray-200 flex items-end pb-2 font-bold text-[#00326b]">{new Date().toLocaleDateString()}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date of Filing</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center print:hidden">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">iCAAP Fiscal Services Division © 2026</p>
      </footer>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .p-4, .p-12 { padding: 0 !important; }
          .max-w-7xl { max-width: none !important; }
          .shadow-2xl, .shadow-xl, .shadow-sm { shadow: none !important; box-shadow: none !important; }
          .rounded-[3rem], .rounded-[2.5rem] { border-radius: 0 !important; }
          .border-2 { border-width: 1px !important; }
          .bg-gray-50, .bg-[#fdfdfd] { background: white !important; }
          input, textarea, select { border: 1px solid #eee !important; background: white !important; }
        }
      `}</style>
    </div>
  );
}
