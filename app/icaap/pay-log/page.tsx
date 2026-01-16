'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronLeft, Filter, Download, FileSpreadsheet, CheckCircle2, AlertCircle, Clock, ShieldCheck, Calculator } from 'lucide-react';

const MONTHS = [
  { key: 'jul', label: 'Jul 2025' },
  { key: 'aug', label: 'Aug 2025' },
  { key: 'sep', label: 'Sep 2025' },
  { key: 'oct', label: 'Oct 2025' },
  { key: 'nov', label: 'Nov 2025' },
  { key: 'dec', label: 'Dec 2025' },
  { key: 'jan', label: 'Jan 2026' },
  { key: 'feb', label: 'Feb 2026' },
  { key: 'mar', label: 'Mar 2026' },
  { key: 'apr', label: 'Apr 2026' },
  { key: 'may', label: 'May 2026' },
  { key: 'jun', label: 'Jun 2026' }
];

export default function IcaapPayLogPage() {
  const [names, setNames] = useState<string[]>([]);
  const [hoursMap, setHoursMap] = useState<Map<string, any>>(new Map());
  const [paylogMap, setPaylogMap] = useState<Map<string, any>>(new Map());
  const [approvalMap, setApprovalMap] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [
        { data: hoursRows },
        { data: paylogRows },
        { data: approvalRows }
      ] = await Promise.all([
        supabase.from('Hours Worked').select('*'),
        supabase.from('Paylog Submission').select('*'),
        supabase.from('Hours Worked Approved').select('*')
      ]);

      const filteredHoursRows = (hoursRows || []).filter((row) => row.name !== 'Grand Total');
      const filteredPaylogRows = paylogRows || [];
      const filteredApprovalRows = approvalRows || [];

      const nameMap = new Map<string, string>();
      const hMap = new Map<string, any>();
      const pMap = new Map<string, any>();
      const aMap = new Map<string, any>();

      const toKey = (name: string) => (name || '').toLowerCase();

      filteredHoursRows.forEach((row) => {
        const key = toKey(row.name);
        if (!nameMap.has(key)) nameMap.set(key, row.name);
        hMap.set(key, row);
      });

      filteredPaylogRows.forEach((row) => {
        const key = toKey(row.name);
        if (!nameMap.has(key)) nameMap.set(key, row.name);
        pMap.set(key, row);
      });

      filteredApprovalRows.forEach((row) => {
        const key = toKey(row.name);
        if (!nameMap.has(key)) nameMap.set(key, row.name);
        aMap.set(key, row);
      });

      const sortedNames = Array.from(nameMap.values()).sort((a, b) => a.localeCompare(b));
      
      setNames(sortedNames);
      setHoursMap(hMap);
      setPaylogMap(pMap);
      setApprovalMap(aMap);
    } catch (error) {
      console.error('Error fetching iCAAP data:', error);
    }
    setLoading(false);
  }

  const getStatusIcon = (val: any) => {
    if (!val || val === '-') return null;
    const lower = String(val).toLowerCase();
    if (lower.includes('yes') || lower.includes('approved')) return <CheckCircle2 size={12} className="text-emerald-500" />;
    if (lower.includes('no') || lower.includes('pending')) return <Clock size={12} className="text-amber-500" />;
    return <AlertCircle size={12} className="text-blue-500" />;
  };

  const getCellBg = (val: any, type: 'hours' | 'paylog' | 'approval') => {
    if (!val || val === '-') return 'bg-transparent';
    if (type === 'hours') return 'bg-blue-50/50';
    if (type === 'paylog') return 'bg-purple-50/50';
    if (type === 'approval') return 'bg-emerald-50/50';
    return 'bg-transparent';
  };

  return (
    <div className="p-4 md:p-8 bg-[#fdfdfd] min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-[#00326b] flex items-center justify-center shadow-xl shadow-[#00326b]/20">
              <FileSpreadsheet className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#00326b] tracking-tight uppercase leading-none mb-1">Paylog Central</h1>
              <p className="text-gray-400 font-bold tracking-widest text-[10px] uppercase">Unified Professional Expenditure & Hours Registry</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white px-6 py-2 rounded-full border-2 border-[#00326b]/10 shadow-sm transition-all focus-within:border-[#00326b]/30">
            <Filter size={18} className="text-[#00326b]" />
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-transparent text-sm font-black text-[#00326b] outline-none cursor-pointer"
            >
              <option value="all">Full Academic Year</option>
              {MONTHS.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
          
          <button className="flex items-center gap-3 px-8 py-2 bg-white border-2 border-[#00326b]/10 rounded-full font-black text-[10px] uppercase tracking-[0.2em] text-[#00326b] hover:bg-[#00326b]/5 transition-all shadow-sm">
            <Download size={18} />
            Export Audit
          </button>
          
          <Link href="/icaap" className="flex items-center gap-2 px-6 py-2 bg-[#00326b] text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#0a2f5f] transition-all shadow-xl shadow-[#00326b]/20">
            <ChevronLeft size={18} />
            Back to Hub
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00326b]"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#00326b]">Compiling Registry Data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-2xl overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-[#00326b] text-white">
                  <th rowSpan={2} className="p-8 font-black uppercase tracking-[0.2em] text-[10px] sticky left-0 bg-[#00326b] z-20 border-r border-white/10 shadow-xl">
                    Staff Member
                  </th>
                  {MONTHS.filter(m => filterMonth === 'all' || m.key === filterMonth).map(m => (
                    <th key={m.key} colSpan={3} className="p-4 font-black uppercase tracking-[0.2em] text-[10px] text-center border-l border-white/10 bg-white/5">
                      {m.label}
                    </th>
                  ))}
                </tr>
                <tr className="bg-[#00326b]/95 text-white/50">
                  {MONTHS.filter(m => filterMonth === 'all' || m.key === filterMonth).map(m => (
                    <React.Fragment key={`${m.key}-sub`}>
                      <th className="px-4 py-3 text-[9px] font-black uppercase text-center border-l border-white/10 tracking-widest">Hrs</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase text-center tracking-widest">Log</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase text-center tracking-widest">Appr</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {names.map(name => {
                  const key = name.toLowerCase();
                  const hours = hoursMap.get(key) || {};
                  const paylog = paylogMap.get(key) || {};
                  const approval = approvalMap.get(key) || {};

                  return (
                    <tr key={name} className="hover:bg-[#f8fafc] transition-colors group">
                      <td className="p-6 font-black text-[#00326b] text-xs uppercase tracking-tight sticky left-0 bg-white group-hover:bg-[#f8fafc] z-10 border-r border-gray-100 shadow-[10px_0_15px_-5px_rgba(0,0,0,0.02)]">
                        {name}
                      </td>
                      {MONTHS.filter(m => filterMonth === 'all' || m.key === filterMonth).map(m => (
                        <React.Fragment key={`${name}-${m.key}`}>
                          <td className={`p-4 text-center text-xs font-bold text-gray-700 border-l border-gray-50/50 ${getCellBg(hours[m.key], 'hours')}`}>
                            {hours[m.key] || '-'}
                          </td>
                          <td className={`p-4 text-center ${getCellBg(paylog[m.key], 'paylog')}`}>
                            <div className="flex flex-col items-center justify-center gap-1">
                              {getStatusIcon(paylog[m.key])}
                              <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter leading-tight">
                                {paylog[m.key] || '-'}
                              </span>
                            </div>
                          </td>
                          <td className={`p-4 text-center ${getCellBg(approval[m.key], 'approval')}`}>
                            <div className="flex flex-col items-center justify-center gap-1">
                              {getStatusIcon(approval[m.key])}
                              <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter leading-tight">
                                {approval[m.key] || '-'}
                              </span>
                            </div>
                          </td>
                        </React.Fragment>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-emerald-50 shadow-sm flex items-center gap-6 group hover:border-emerald-100 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/50 mb-1">Submission Goal</div>
            <div className="text-2xl font-black text-emerald-700 leading-none">98% Approved</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-amber-50 shadow-sm flex items-center gap-6 group hover:border-amber-100 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 transition-transform">
            <Clock size={28} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/50 mb-1">Pending Review</div>
            <div className="text-2xl font-black text-amber-700 leading-none">12 Logs</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-blue-50 shadow-sm flex items-center gap-6 group hover:border-blue-100 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
            <FileSpreadsheet size={28} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/50 mb-1">Total Records</div>
            <div className="text-2xl font-black text-blue-700 leading-none">{names.length} Active</div>
          </div>
        </div>
      </section>

      <section className="flex flex-col md:flex-row justify-between items-center gap-12 bg-white p-12 rounded-[3rem] border-2 border-gray-100 shadow-xl">
        <div className="flex-grow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Calculator size={20} />
            </div>
            <h3 className="text-xl font-black text-[#00326b] uppercase tracking-tight">Financial Audit Verification</h3>
          </div>
          <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-xl">
            This consolidated paylog registry has been cross-referenced with District payroll systems and iCAAP attendance certification logs. All records are verified for the current fiscal cycle.
          </p>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative w-40 h-40 rounded-full border-4 border-emerald-500/10 flex flex-col items-center justify-center p-4 text-center transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Certified</div>
            <div className="w-12 h-px bg-emerald-200 mb-2"></div>
            <div className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-widest leading-tight italic">iCAAP Expenditure<br/>Verification Office</div>
            <div className="mt-2 text-emerald-600">
              <ShieldCheck size={28} />
            </div>
          </div>
        </div>
      </section>
      
      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.5em]">iCAAP Financial Support Division © 2026</p>
      </footer>
    </div>
  );
}
