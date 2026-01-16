'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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

  const formatValue = (val: any) => {
    if (!val) return '-';
    return val;
  };

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#00326b]">Hours + Paylog</h1>
          <p className="text-gray-600">Track monthly hours and submission status</p>
        </div>
        <div className="flex gap-4 items-center">
          <select 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="p-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#00326b] outline-none"
          >
            <option value="all">All Months</option>
            {MONTHS.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
          <Link href="/icaap" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all text-sm">
            Back to iCAAP
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 text-gray-500 italic">Loading iCAAP data...</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#f1f5f9]">
                <th rowSpan={2} className="p-4 border-b font-bold text-[#00326b] sticky left-0 bg-[#f1f5f9] z-10">Row Labels</th>
                {MONTHS.filter(m => filterMonth === 'all' || m.key === filterMonth).map(m => (
                  <th key={m.key} colSpan={3} className="p-4 border-b font-bold text-[#00326b] text-center uppercase tracking-wider text-xs border-l">
                    {m.label}
                  </th>
                ))}
              </tr>
              <tr className="bg-[#f8fafc]">
                {MONTHS.filter(m => filterMonth === 'all' || m.key === filterMonth).map(m => (
                  <React.Fragment key={`${m.key}-sub`}>
                    <th className="p-2 border-b text-[10px] font-black uppercase text-gray-500 text-center border-l">Hours</th>
                    <th className="p-2 border-b text-[10px] font-black uppercase text-gray-500 text-center">Paylog</th>
                    <th className="p-2 border-b text-[10px] font-black uppercase text-gray-500 text-center">Approval</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {names.map(name => {
                const key = name.toLowerCase();
                const hours = hoursMap.get(key) || {};
                const paylog = paylogMap.get(key) || {};
                const approval = approvalMap.get(key) || {};

                return (
                  <tr key={name} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 border-b text-sm font-semibold text-gray-700 sticky left-0 bg-white group-hover:bg-gray-50 z-10">
                      {name}
                    </td>
                    {MONTHS.filter(m => filterMonth === 'all' || m.key === filterMonth).map(m => (
                      <React.Fragment key={`${name}-${m.key}`}>
                        <td className="p-2 border-b text-center text-xs text-gray-600 border-l">{formatValue(hours[m.key])}</td>
                        <td className="p-2 border-b text-center text-[10px] text-gray-500 leading-tight">{formatValue(paylog[m.key])}</td>
                        <td className="p-2 border-b text-center text-[10px] text-gray-500 leading-tight">{formatValue(approval[m.key])}</td>
                      </React.Fragment>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
