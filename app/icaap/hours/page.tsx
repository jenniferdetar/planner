'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const MONTHS = ['jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar', 'apr', 'may', 'jun'];
const MONTH_LABELS: Record<string, string> = {
  jul: 'Jul 25', aug: 'Aug 25', sep: 'Sep 25', oct: 'Oct 25', nov: 'Nov 25', dec: 'Dec 25',
  jan: 'Jan 26', feb: 'Feb 26', mar: 'Mar 26', apr: 'Apr 26', may: 'May 26', jun: 'Jun 26'
};

export default function IcaapHoursPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHours();
  }, []);

  async function fetchHours() {
    setLoading(true);
    const { data: hoursRows, error } = await supabase
      .from('Hours Worked')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching hours:', error);
    } else {
      setData((hoursRows || []).filter(row => row.name !== 'Grand Total'));
    }
    setLoading(false);
  }

  const parseVal = (val: any) => {
    if (!val) return 0;
    return parseFloat(String(val).replace(/,/g, '')) || 0;
  };

  const formatVal = (val: number) => {
    if (val === 0) return '-';
    return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const calculateTotals = () => {
    const columnTotals: Record<string, number> = {};
    MONTHS.forEach(m => {
      columnTotals[m] = data.reduce((sum, row) => sum + parseVal(row[m]), 0);
    });
    
    const rowTotals = data.map(row => 
      MONTHS.reduce((sum, m) => sum + parseVal(row[m]), 0)
    );
    
    const grandTotal = rowTotals.reduce((sum, val) => sum + val, 0);
    
    return { columnTotals, rowTotals, grandTotal };
  };

  const { columnTotals, rowTotals, grandTotal } = calculateTotals();

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#00326b]">Hours Worked</h1>
          <p className="text-gray-600">Monthly breakdown of hours by employee</p>
        </div>
        <Link href="/icaap" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
          Back to iCAAP
        </Link>
      </header>

      {loading ? (
        <div className="text-center py-20 text-gray-500 italic">Loading hours data...</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-[#f1f5f9]">
                <th className="p-4 border-b font-bold text-[#00326b] sticky left-0 bg-[#f1f5f9] z-10">Name</th>
                {MONTHS.map(m => (
                  <th key={m} className="p-4 border-b font-bold text-[#00326b] text-center text-xs uppercase tracking-wider">
                    {MONTH_LABELS[m]}
                  </th>
                ))}
                <th className="p-4 border-b font-bold text-[#00326b] text-center text-xs uppercase tracking-wider bg-blue-50">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row, i) => (
                <tr key={row.name} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 border-b text-sm font-semibold text-gray-700 sticky left-0 bg-white group-hover:bg-gray-50 z-10">
                    {row.name}
                  </td>
                  {MONTHS.map(m => (
                    <td key={m} className="p-4 border-b text-center text-sm text-gray-600">
                      {row[m] || '-'}
                    </td>
                  ))}
                  <td className="p-4 border-b text-center text-sm font-bold text-[#00326b] bg-blue-50/30">
                    {formatVal(rowTotals[i])}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#f8fafc] font-bold">
              <tr>
                <td className="p-4 border-t sticky left-0 bg-[#f8fafc] z-10 text-[#00326b]">Grand Total</td>
                {MONTHS.map(m => (
                  <td key={m} className="p-4 border-t text-center text-[#00326b]">
                    {formatVal(columnTotals[m])}
                  </td>
                ))}
                <td className="p-4 border-t text-center text-white bg-[#00326b]">
                  {formatVal(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
