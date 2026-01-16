'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const hoaCategories = [
  { icon: '📣', title: 'Announcements', note: 'Community updates and notices.' },
  { icon: '👥', title: 'BOD', note: 'Board of Directors contacts.' },
  { icon: '💵', title: 'Financials', note: 'Budgets, expenses, and dues.' },
  { icon: '📂', title: 'Homeowner Documents', note: 'Policies, bylaws, and forms.' },
  { icon: '🛡️', title: 'Insurance', note: 'Coverage and claim details.' },
  { icon: '⚖️', title: 'Legal', note: 'Compliance and legal records.' },
  { icon: '🛠️', title: 'Maintenance & Repairs', note: 'Work orders and vendor history.' },
  { icon: '🧾', title: 'Statements', note: 'Monthly statements and summaries.' },
  { icon: '🏘️', title: 'Units', note: 'Unit roster and owner info.' }
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
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#0a2f5f]">HOA Hub</h1>
          <p className="text-gray-600">Track HOA reminders, documents, and community updates.</p>
        </div>
        <div className="flex gap-2">
          {['overview', 'financials', 'maintenance', 'units'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full font-bold transition-all capitalize ${activeTab === tab ? 'bg-[#0a2f5f] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#0a2f5f]">
              <span>📄</span> Upload & Summarize PDF
            </h2>
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center bg-blue-50/30">
              <input type="file" className="hidden" id="hoa-pdf" accept=".pdf" />
              <label htmlFor="hoa-pdf" className="cursor-pointer">
                <div className="text-4xl mb-2">📤</div>
                <p className="text-[#0a2f5f] font-semibold">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">PDF documents only</p>
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-6 text-[#0a2f5f] flex items-center gap-2">
              <span>🏡</span> HOA Library
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hoaCategories.map((cat, idx) => (
                <div key={cat.title} className={`p-4 rounded-full flex items-center gap-4 border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  idx % 4 === 0 ? 'bg-[#99B3C5]' : 
                  idx % 4 === 1 ? 'bg-[#FFA1AB]' : 
                  idx % 4 === 2 ? 'bg-[#FFC68D]' : 'bg-[#9ADBDE]'
                }`}>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl border shadow-inner shrink-0">
                    {cat.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#0a2f5f] leading-tight">{cat.title}</span>
                    <span className="text-xs text-[#0a2f5f]/70 font-medium">{cat.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'financials' && (
        <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0a2f5f]">Financial Records</h2>
            <button onClick={addFinancial} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">+ Add Record</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Description</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Type</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {financials.map((row, i) => (
                <tr key={i}>
                  <td className="p-4"><input type="date" value={row.date} onChange={(e) => {
                    const next = [...financials]; next[i].date = e.target.value; setFinancials(next); saveData('hoa-financials', next);
                  }} className="bg-transparent border-none p-0 focus:ring-0" /></td>
                  <td className="p-4"><input type="text" value={row.description} onChange={(e) => {
                    const next = [...financials]; next[i].description = e.target.value; setFinancials(next); saveData('hoa-financials', next);
                  }} className="w-full bg-transparent border-none p-0 focus:ring-0" /></td>
                  <td className="p-4"><select value={row.type} onChange={(e) => {
                    const next = [...financials]; next[i].type = e.target.value; setFinancials(next); saveData('hoa-financials', next);
                  }} className="bg-transparent border-none p-0 focus:ring-0">
                    <option>Expense</option><option>Income</option><option>Reserve</option>
                  </select></td>
                  <td className="p-4"><input type="number" value={row.amount} onChange={(e) => {
                    const next = [...financials]; next[i].amount = parseFloat(e.target.value); setFinancials(next); saveData('hoa-financials', next);
                  }} className="bg-transparent border-none p-0 focus:ring-0" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'maintenance' && (
        <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0a2f5f]">Maintenance & Repairs</h2>
            <button onClick={addMaintenance} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">+ Add Task</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Task</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Vendor</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {maintenance.map((row, i) => (
                <tr key={i}>
                  <td className="p-4"><input type="date" value={row.date} onChange={(e) => {
                    const next = [...maintenance]; next[i].date = e.target.value; setMaintenance(next); saveData('hoa-maintenance', next);
                  }} className="bg-transparent border-none p-0 focus:ring-0" /></td>
                  <td className="p-4"><input type="text" value={row.task} onChange={(e) => {
                    const next = [...maintenance]; next[i].task = e.target.value; setMaintenance(next); saveData('hoa-maintenance', next);
                  }} className="w-full bg-transparent border-none p-0 focus:ring-0" /></td>
                  <td className="p-4"><input type="text" value={row.vendor} onChange={(e) => {
                    const next = [...maintenance]; next[i].vendor = e.target.value; setMaintenance(next); saveData('hoa-maintenance', next);
                  }} className="w-full bg-transparent border-none p-0 focus:ring-0" /></td>
                  <td className="p-4"><select value={row.status} onChange={(e) => {
                    const next = [...maintenance]; next[i].status = e.target.value; setMaintenance(next); saveData('hoa-maintenance', next);
                  }} className="bg-transparent border-none p-0 focus:ring-0">
                    <option>Pending</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
                  </select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'units' && (
        <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0a2f5f]">Unit Roster</h2>
            <button onClick={addUnit} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">+ Add Unit</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Unit</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Owner</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Contact</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {units.map((row, i) => (
                <tr key={i}>
                  <td className="p-4"><input type="text" value={row.unit} onChange={(e) => {
                    const next = [...units]; next[i].unit = e.target.value; setUnits(next); saveData('hoa-units', next);
                  }} className="bg-transparent border-none p-0 focus:ring-0" /></td>
                  <td className="p-4"><input type="text" value={row.owner} onChange={(e) => {
                    const next = [...units]; next[i].owner = e.target.value; setUnits(next); saveData('hoa-units', next);
                  }} className="w-full bg-transparent border-none p-0 focus:ring-0" /></td>
                  <td className="p-4"><input type="text" value={row.contact} onChange={(e) => {
                    const next = [...units]; next[i].contact = e.target.value; setUnits(next); saveData('hoa-units', next);
                  }} className="w-full bg-transparent border-none p-0 focus:ring-0" /></td>
                  <td className="p-4"><select value={row.status} onChange={(e) => {
                    const next = [...units]; next[i].status = e.target.value; setUnits(next); saveData('hoa-units', next);
                  }} className="bg-transparent border-none p-0 focus:ring-0">
                    <option>Owner Occupied</option><option>Rented</option><option>Vacant</option>
                  </select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
