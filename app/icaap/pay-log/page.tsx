'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

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
  const [hoursMap, setHoursMap] = useState<Map<string, Record<string, string | number | null | undefined>>>(new Map());
  const [paylogMap, setPaylogMap] = useState<Map<string, Record<string, string | number | null | undefined>>>(new Map());
  const [approvalMap, setApprovalMap] = useState<Map<string, Record<string, string | number | null | undefined>>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchData = React.useCallback(async (ignore = false) => {
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

      if (ignore) return;

      const filteredHoursRows = (hoursRows || []).filter((row) => row.name !== 'Grand Total');
      const filteredPaylogRows = paylogRows || [];
      const filteredApprovalRows = approvalRows || [];

      const nameMap = new Map<string, string>();
      const hMap = new Map<string, Record<string, string | number | null | undefined>>();
      const pMap = new Map<string, Record<string, string | number | null | undefined>>();
      const aMap = new Map<string, Record<string, string | number | null | undefined>>();

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
  }, []);

  useEffect(() => {
    let ignore = false;
    const timeoutId = setTimeout(() => {
      fetchData(ignore);
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [fetchData]);

  const getStatusIcon = (val: string | number | null | undefined) => {
    if (!val || val === '-') return null;
    const lower = String(val).toLowerCase();
    if (lower.includes('yes') || lower.includes('approved')) return <CheckCircle2 size={12} className="text-emerald-500" />;
    if (lower.includes('no') || lower.includes('pending')) return <Clock size={12} className="text-amber-500" />;
    return <AlertCircle size={12} className="text-blue-500" />;
  };

  const getCellBg = (val: string | number | null | undefined, type: 'hours' | 'paylog' | 'approval') => {
    if (!val || val === '-') return 'bg-transparent';
    if (type === 'hours') return 'bg-blue-50/50';
    if (type === 'paylog') return 'bg-purple-50/50';
    if (type === 'approval') return 'bg-emerald-50/50';
    return 'bg-transparent';
  };

  return (
    <div className="p-4 md:p-8 bg-[#fdfdfd] min-h-screen">

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2f5f]"></div>
          <p className="text-[10px] font-black  tracking-widest text-[#0a2f5f]">Compiling Registry Data...</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-gray-100 shadow-2xl overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-[#0a2f5f] text-white">
                  <th rowSpan={2} className="p-8 font-black  tracking-[0.2em] text-[10px] sticky left-0 bg-[#0a2f5f] z-20 border-r border-white/10 shadow-xl">
                    Staff Member
                  </th>
                  {MONTHS.map(m => (
                    <th key={m.key} colSpan={3} className="p-4 font-black  tracking-[0.2em] text-[10px] text-center border-l border-white/10 bg-white/5">
                      {m.label}
                    </th>
                  ))}
                </tr>
                <tr className="bg-[#0a2f5f]/95 text-white/50">
                  {MONTHS.map(m => (
                    <React.Fragment key={`${m.key}-sub`}>
                      <th className="px-4 py-3 text-[9px] font-black  text-center border-l border-white/10 tracking-widest">Hrs</th>
                      <th className="px-4 py-3 text-[9px] font-black  text-center tracking-widest">Log</th>
                      <th className="px-4 py-3 text-[9px] font-black  text-center tracking-widest">Appr</th>
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
                      <td className="p-6 font-black text-[#0a2f5f] text-xs  tracking-tight sticky left-0 bg-white group-hover:bg-[#f8fafc] z-10 border-r border-gray-100 shadow-[10px_0_15px_-5px_rgba(0,0,0,0.02)]">
                        {name}
                      </td>
                      {MONTHS.map(m => (
                        <React.Fragment key={`${name}-${m.key}`}>
                          <td className={`p-4 text-center text-xs font-bold text-gray-700 border-l border-gray-50/50 ${getCellBg(hours[m.key], 'hours')}`}>
                            {hours[m.key] || '-'}
                          </td>
                          <td className={`p-4 text-center ${getCellBg(paylog[m.key], 'paylog')}`}>
                            <div className="flex flex-col items-center justify-center gap-1">
                              {getStatusIcon(paylog[m.key])}
                              <span className="text-[9px] font-black  text-gray-400 tracking-tighter leading-tight">
                                {paylog[m.key] || '-'}
                              </span>
                            </div>
                          </td>
                          <td className={`p-4 text-center ${getCellBg(approval[m.key], 'approval')}`}>
                            <div className="flex flex-col items-center justify-center gap-1">
                              {getStatusIcon(approval[m.key])}
                              <span className="text-[9px] font-black  text-gray-400 tracking-tighter leading-tight">
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
      
      <div className="mb-20"></div>
      
      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black  tracking-[0.5em]">iCAAP Financial Support Division © 2026</p>
      </footer>
    </div>
  );
}
