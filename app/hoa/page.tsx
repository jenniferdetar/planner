'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Home, Megaphone, Users, Landmark, FileText, 
  ShieldCheck, Gavel, Wrench, Receipt, 
  Building2, ChevronRight, Upload, Plus,
  Trash2, Search, ArrowUpRight, Activity
} from 'lucide-react';

const hoaCategories = [
  { icon: <Megaphone size={20} />, title: 'Announcements', note: 'Community updates', color: 'bg-[#9ADBDE]' },
  { icon: <Users size={20} />, title: 'BOD', note: 'Board of Directors', color: 'bg-[#FFA1AB]' },
  { icon: <Landmark size={20} />, title: 'Financials', note: 'Budgets & dues', color: 'bg-[#FFC68D]' },
  { icon: <FileText size={20} />, title: 'Documents', note: 'Policies & bylaws', color: 'bg-[#99B3C5]' },
  { icon: <ShieldCheck size={20} />, title: 'Insurance', note: 'Coverage details', color: 'bg-[#9ADBDE]' },
  { icon: <Gavel size={20} />, title: 'Legal', note: 'Compliance records', color: 'bg-[#FFA1AB]' },
  { icon: <Wrench size={20} />, title: 'Maintenance', note: 'Vendor history', color: 'bg-[#FFC68D]' },
  { icon: <Receipt size={20} />, title: 'Statements', note: 'Monthly summaries', color: 'bg-[#99B3C5]' },
  { icon: <Building2 size={20} />, title: 'Units', note: 'Owner roster', color: 'bg-[#9ADBDE]' }
];

export default function HoaPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    fetchHoaData();
  }, []);

  async function fetchHoaData() {
    setLoading(true);
    const { data: metadata, error } = await supabase
      .from('opus_metadata')
      .select('*')
      .ilike('key', 'hoa-%');
    
    if (error) {
      console.error('Error fetching HOA data:', error);
    } else if (metadata) {
      metadata.forEach(item => {
        if (item.key === 'hoa-financials') setFinancials(item.value || []);
        if (item.key === 'hoa-maintenance') setMaintenance(item.value || []);
        if (item.key === 'hoa-units') setUnits(item.value || []);
      });
    }
    setLoading(false);
  }

  async function saveData(key: string, value: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key,
        value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) console.error(`Error saving ${key}:`, error);
  }

  const addFinancial = () => {
    const newItem = { date: new Date().toISOString().split('T')[0], description: '', amount: 0, type: 'Expense' };
    const newData = [...financials, newItem];
    setFinancials(newData);
    saveData('hoa-financials', newData);
  };

  const addMaintenance = () => {
    const newItem = { date: new Date().toISOString().split('T')[0], task: '', status: 'Pending', vendor: '' };
    const newData = [...maintenance, newItem];
    setMaintenance(newData);
    saveData('hoa-maintenance', newData);
  };

  const addUnit = () => {
    const newItem = { unit: '', owner: '', contact: '', status: 'Owner Occupied' };
    const newData = [...units, newItem];
    setUnits(newData);
    saveData('hoa-units', newData);
  };

  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-[#1e3a8a] flex items-center justify-center shadow-xl shadow-[#1e3a8a]/20">
            <Home className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1e3a8a] tracking-tight uppercase">HOA Hub</h1>
            <p className="text-gray-400 font-bold tracking-widest text-xs italic">"Protecting community value through diligent administration"</p>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#93c5fd] rounded-[3rem] p-10 mb-12 text-white shadow-2xl shadow-[#1e3a8a]/30">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black mb-4 leading-tight">Community Administrative Registry</h2>
          <p className="text-xl text-white/80 font-medium leading-relaxed mb-8">
            Access board records, monitor financial health, and track maintenance operations for the homeowners association.
          </p>
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">2026</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-white">Fiscal Year</span>
            </div>
            <div className="w-px h-12 bg-white/20 mx-4"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">Active</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-white">Registry Status</span>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 text-[20rem] opacity-10 pointer-events-none text-white font-black">🏢</div>
      </section>

      <div className="flex flex-wrap gap-4 mb-12">
        {['overview', 'financials', 'maintenance', 'units'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
              activeTab === tab 
                ? 'bg-[#1e3a8a] text-white shadow-lg' 
                : 'bg-white text-[#1e3a8a] border-2 border-[#1e3a8a]/10 hover:bg-[#1e3a8a]/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Activity className="text-slate-300 animate-pulse mb-4" size={48} />
            <div className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Administrative Records...</div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-12">
                <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-[#9ADBDE] flex items-center justify-center shadow-inner">
                        <Upload size={20} className="text-[#1e3a8a]" />
                      </div>
                      <h2 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tight">Document Submission</h2>
                    </div>
                    
                    <div className="border-4 border-dashed border-slate-100 rounded-[2rem] p-12 text-center bg-slate-50/50 hover:bg-slate-50 hover:border-[#3b82f6]/30 transition-all group cursor-pointer">
                      <input type="file" className="hidden" id="hoa-pdf" accept=".pdf" />
                      <label htmlFor="hoa-pdf" className="cursor-pointer">
                        <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                          <Upload size={32} className="text-[#3b82f6]" />
                        </div>
                        <p className="text-xl font-black text-[#1e3a8a] mb-2">Ingest Administrative PDF</p>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Supports Bylaws, Minutes, and Notices</p>
                      </label>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b82f6] opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <Search className="text-[#1e3a8a]" size={24} />
                    <h2 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tight">Administrative Library</h2>
                    <div className="h-px flex-grow bg-gradient-to-r from-[#1e3a8a]/20 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hoaCategories.map((cat) => (
                      <div key={cat.title} className={`group relative p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden cursor-pointer`}>
                        <div className={`absolute -right-4 -top-4 w-24 h-24 ${cat.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                        <div className="relative z-10">
                          <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-6 shadow-inner`}>
                            {cat.icon}
                          </div>
                          <h3 className="text-2xl font-black text-[#1e3a8a] mb-2">{cat.title}</h3>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                            {cat.note}
                          </p>
                        </div>
                        <div className="mt-8 flex items-center text-[#1e3a8a] font-black text-sm uppercase tracking-widest gap-2">
                          Access Archive <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'financials' && (
              <section className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div>
                    <h2 className="text-3xl font-black text-[#1e3a8a] uppercase tracking-tight">Financial Ledger</h2>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Audit of community expenditures and income</p>
                  </div>
                  <button onClick={addFinancial} className="flex items-center gap-2 px-6 py-3 bg-[#1e3a8a] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#1e3a8a]/90 transition-all shadow-lg shadow-[#1e3a8a]/20">
                    <Plus size={16} /> Add Record
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">Date</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">Description</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">Type</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b text-right">Amount</th>
                        <th className="p-6 text-center border-b"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {financials.map((row, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="p-6">
                            <input type="date" value={row.date} onChange={(e) => {
                              const next = [...financials]; next[i].date = e.target.value; setFinancials(next); saveData('hoa-financials', next);
                            }} className="bg-transparent border-none p-0 focus:ring-0 font-bold text-[#1e3a8a]" />
                          </td>
                          <td className="p-6">
                            <input type="text" value={row.description} onChange={(e) => {
                              const next = [...financials]; next[i].description = e.target.value; setFinancials(next); saveData('hoa-financials', next);
                            }} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-gray-700 placeholder:text-gray-300" placeholder="Enter description..." />
                          </td>
                          <td className="p-6">
                            <select value={row.type} onChange={(e) => {
                              const next = [...financials]; next[i].type = e.target.value; setFinancials(next); saveData('hoa-financials', next);
                            }} className="bg-transparent border-none p-0 focus:ring-0 font-black uppercase tracking-widest text-[10px] text-[#3b82f6]">
                              <option>Expense</option><option>Income</option><option>Reserve</option>
                            </select>
                          </td>
                          <td className="p-6 text-right">
                            <input type="number" value={row.amount} onChange={(e) => {
                              const next = [...financials]; next[i].amount = parseFloat(e.target.value); setFinancials(next); saveData('hoa-financials', next);
                            }} className="bg-transparent border-none p-0 focus:ring-0 font-black text-lg text-[#1e3a8a] text-right w-32" />
                          </td>
                          <td className="p-6 text-center">
                            <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'maintenance' && (
              <section className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div>
                    <h2 className="text-3xl font-black text-[#1e3a8a] uppercase tracking-tight">Maintenance Ops</h2>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Operational tracking of community repairs</p>
                  </div>
                  <button onClick={addMaintenance} className="flex items-center gap-2 px-6 py-3 bg-[#1e3a8a] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#1e3a8a]/90 transition-all shadow-lg shadow-[#1e3a8a]/20">
                    <Plus size={16} /> Add Task
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">Date</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">Task</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">Vendor</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">Status</th>
                        <th className="p-6 text-center border-b"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {maintenance.map((row, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="p-6">
                            <input type="date" value={row.date} onChange={(e) => {
                              const next = [...maintenance]; next[i].date = e.target.value; setMaintenance(next); saveData('hoa-maintenance', next);
                            }} className="bg-transparent border-none p-0 focus:ring-0 font-bold text-[#1e3a8a]" />
                          </td>
                          <td className="p-6">
                            <input type="text" value={row.task} onChange={(e) => {
                              const next = [...maintenance]; next[i].task = e.target.value; setMaintenance(next); saveData('hoa-maintenance', next);
                            }} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-gray-700 placeholder:text-gray-300" placeholder="Enter task..." />
                          </td>
                          <td className="p-6">
                            <input type="text" value={row.vendor} onChange={(e) => {
                              const next = [...maintenance]; next[i].vendor = e.target.value; setMaintenance(next); saveData('hoa-maintenance', next);
                            }} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-gray-500 italic placeholder:text-gray-300" placeholder="Enter vendor..." />
                          </td>
                          <td className="p-6">
                            <select value={row.status} onChange={(e) => {
                              const next = [...maintenance]; next[i].status = e.target.value; setMaintenance(next); saveData('hoa-maintenance', next);
                            }} className={`bg-transparent border-none p-0 focus:ring-0 font-black uppercase tracking-widest text-[10px] ${
                              row.status === 'Completed' ? 'text-green-500' : row.status === 'Pending' ? 'text-amber-500' : 'text-blue-500'
                            }`}>
                              <option>Pending</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
                            </select>
                          </td>
                          <td className="p-6 text-center">
                            <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'units' && (
              <section className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div>
                    <h2 className="text-3xl font-black text-[#1e3a8a] uppercase tracking-tight">Unit Roster</h2>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Comprehensive directory of community residents</p>
                  </div>
                  <button onClick={addUnit} className="flex items-center gap-2 px-6 py-3 bg-[#1e3a8a] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#1e3a8a]/90 transition-all shadow-lg shadow-[#1e3a8a]/20">
                    <Plus size={16} /> Add Unit
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">Unit</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">Owner</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">Contact</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">Status</th>
                        <th className="p-6 text-center border-b"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {units.map((row, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="p-6 font-black text-[#1e3a8a]">
                            <input type="text" value={row.unit} onChange={(e) => {
                              const next = [...units]; next[i].unit = e.target.value; setUnits(next); saveData('hoa-units', next);
                            }} className="bg-transparent border-none p-0 focus:ring-0 font-black text-[#1e3a8a] w-20" placeholder="Unit #" />
                          </td>
                          <td className="p-6">
                            <input type="text" value={row.owner} onChange={(e) => {
                              const next = [...units]; next[i].owner = e.target.value; setUnits(next); saveData('hoa-units', next);
                            }} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-gray-700 placeholder:text-gray-300" placeholder="Enter owner name..." />
                          </td>
                          <td className="p-6">
                            <input type="text" value={row.contact} onChange={(e) => {
                              const next = [...units]; next[i].contact = e.target.value; setUnits(next); saveData('hoa-units', next);
                            }} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-gray-500 placeholder:text-gray-300" placeholder="Enter contact info..." />
                          </td>
                          <td className="p-6">
                            <select value={row.status} onChange={(e) => {
                              const next = [...units]; next[i].status = e.target.value; setUnits(next); saveData('hoa-units', next);
                            }} className="bg-transparent border-none p-0 focus:ring-0 font-black uppercase tracking-widest text-[10px] text-[#3b82f6]">
                              <option>Owner Occupied</option><option>Rented</option><option>Vacant</option>
                            </select>
                          </td>
                          <td className="p-6 text-center">
                            <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <section className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-[#1e3a8a]" size={24} />
              <h2 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tight">Compliance Status</h2>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed italic mb-8">
              Community records are audited for regulatory compliance and archived in the official administrative ledger.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[#1e3a8a] font-black text-xs uppercase tracking-[0.2em] bg-white p-4 rounded-2xl border">
            <ArrowUpRight size={16} />
            Administrative Integrity Verified
          </div>
        </div>

        <div className="bg-[#1e3a8a]/5 p-10 rounded-[3rem] border-2 border-[#1e3a8a]/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Landmark className="text-[#1e3a8a]" size={24} />
              <h2 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tight">Reserve Analysis</h2>
            </div>
            <p className="text-[#1e3a8a]/70 font-medium leading-relaxed italic mb-8">
              Current reserve funding levels are optimized for long-term structural maintenance and community growth.
            </p>
          </div>
          <div className="text-4xl font-black text-[#1e3a8a] opacity-10">2026 Fiscal Outlook</div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Community Operations Registry © 2026</p>
      </footer>
    </div>
  );
}

