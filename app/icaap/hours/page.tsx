'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

import StatCard from '@/components/StatCard';
import { Calendar, Users, Calculator, History, ShieldCheck } from 'lucide-react';

const MONTHS = ['jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar', 'apr', 'may', 'jun'];
const MONTH_LABELS: Record<string, string> = {
  jul: 'Jul 25', aug: 'Aug 25', sep: 'Sep 25', oct: 'Oct 25', nov: 'Nov 25', dec: 'Dec 25',
  jan: 'Jan 26', feb: 'Feb 26', mar: 'Mar 26', apr: 'Apr 26', may: 'May 26', jun: 'Jun 26'
};

const ADDITIONAL_HOURS = [
  { name: 'Aaron, Robin', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Aguirre, Genesis', program: 'Rlaa IFs/Mentors', hours: '40' },
  { name: 'Aki, Ma Teresa', program: 'Catpa', hours: '40' },
  { name: 'Alcorn, Eileen', program: 'Catpa', hours: '39' },
  { name: 'Anthony Zarate', program: 'Lead Induction Mentors', hours: '40 hours' },
  { name: 'Bacon, Dulce', program: 'If', hours: '60' },
  { name: 'Bagadiong Trice, Tarah', program: 'Catpa', hours: '34' },
  { name: 'Bennett, Marie', program: 'If', hours: '40' },
  { name: 'Black, Leslie', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Booker, Chevon', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Bouillot, Jittima', program: 'Rlaa IFs/Mentors', hours: '40' },
  { name: 'Bravo, Ralph', program: 'If', hours: '' },
  { name: 'Castillo, Patricia', program: 'Catpa', hours: '34' },
  { name: 'Cohen, Crystal', program: 'Catpa', hours: '34' },
  { name: 'Cruz, Jacqueline', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'De Guzman, Jhun', program: 'Induction', hours: '5' },
  { name: 'Dean, Gene', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Deloach, Susan', program: 'Catpa', hours: '34' },
  { name: 'Edith Janec', program: 'Rlaa IFs/Mentors', hours: '40' },
  { name: 'Elizalde, Elizabeth', program: 'Rlaa IFs/Mentors', hours: '40' },
  { name: 'Fuentes, Carmen', program: 'Catpa', hours: '34' },
  { name: 'Garcia Armstrong, Jeanne', program: 'Rlaa IFs/Mentors', hours: '40' },
  { name: 'Gonzalez, Emir', program: 'If', hours: '40' },
  { name: 'Grant, D.M.', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Grewell-Goodinez, Bernice', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Griffiths, Irma', program: 'Catpa', hours: '34' },
  { name: 'Griffiths, Joshua', program: 'Catpa', hours: '40' },
  { name: 'Gutierrez, Rodolfo', program: 'Catpa', hours: '34' },
  { name: 'Han, Alyson', program: 'Catpa', hours: '40' },
  { name: 'Hashimoto, Yolanda', program: 'If', hours: '40' },
  { name: 'Hawkins, Kionna', program: 'Induction', hours: '5' },
  { name: 'Holmes, Staci', program: 'Catpa', hours: '32' },
  { name: 'Irvine, Adrian', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Izuakor, Charles', program: 'Catpa', hours: '34' },
  { name: 'Jakeisha Gibson-Sanders', program: 'Rlaa IFs/Mentors', hours: '40' },
  { name: 'Jasso, Wendy', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Jones, Robert', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Kasper, Joy', program: 'Catpa', hours: '39' },
  { name: 'Lewis, Agnes', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Lilly (Yasmin Willis), Aimee', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Linda Nguyen', program: 'Rlaa IFs/Mentors', hours: '40' },
  { name: 'Makar, Enas', program: 'If', hours: '60' },
  { name: 'Malika Ferrell', program: 'Lead Induction Mentors', hours: '40 hours' },
  { name: 'Manzo Reyes, Sofia', program: 'Rlaa IFs/Mentors', hours: '40' },
  { name: 'Maria Aldave Cabrera', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Marks, Lisa', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Marlene Yu', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'McFarlane, Evelyn', program: 'Rlaa IFs/Mentors', hours: '40' },
  { name: 'Morales, Andreina', program: 'If', hours: '40' },
  { name: 'Morales, Andreina', program: 'Catpa', hours: '34' },
  { name: 'Morales, Anthony', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Nolan, Susan', program: 'Catpa', hours: '34' },
  { name: 'Pena, Brigette', program: 'Induction', hours: '5' },
  { name: 'Pinto, Maria', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Pizzuto, Marla', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Quijada, Ida', program: 'If', hours: '40' },
  { name: 'Rabas, Kimberly', program: 'Catpa', hours: '35' },
  { name: 'Ramos, Lawrence', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Ray, Praveen', program: 'Catpa', hours: '34' },
  { name: 'Rios, Malina', program: 'Induction', hours: '5' },
  { name: 'Rodriguez Sifontes, Veronica', program: 'Rlaa IFs/Mentors', hours: '40' },
  { name: 'Rogers, Sherita', program: 'Catpa', hours: '34' },
  { name: 'Romero, Jose', program: 'Catpa', hours: '34' },
  { name: 'Ronning, Melanie', program: 'Rlaa IFs/Mentors', hours: '40' },
  { name: 'Rosa-Madrigal, Lila', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Saidi, Mandana', program: 'Instructional Faculty', hours: '40' },
  { name: 'Sanchez-Rodriguez, Adalid', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Sayer, Shannon', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Schull, Tacy', program: 'Catpa', hours: '39' },
  { name: 'Segovia, Jasmin', program: 'Catpa', hours: '34' },
  { name: 'Shelley, Paulette', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Shigenaga, Aya', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Vojkovich, Tiffany', program: 'If', hours: '40' },
  { name: 'Watanabe, Nora', program: 'Lead Induction Mentors', hours: '30 hours' },
  { name: 'Winter, Bennett', program: 'Induction', hours: '5' }
];

interface HoursRow {
  name: string;
  [key: string]: string | number | undefined;
}

export default function IcaapHoursPage() {
  const [data, setData] = useState<HoursRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHours = React.useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      if (!ignore) fetchHours();
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [fetchHours]);

  const parseVal = (val: string | number | undefined | null) => {
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
    <div className="p-4 md:p-8 bg-[#fdfdfd] min-h-screen">

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Annual Total"
          value={formatVal(grandTotal)}
          icon={<Calculator size={24} />}
          color="bg-[#FFA1AB]"
        />
        <StatCard 
          title="Total Staff"
          value={data.length}
          icon={<Users size={24} />}
          color="bg-[#9ADBDE]"
        />
        <StatCard 
          title="Current Month"
          value={formatVal(columnTotals['dec'] || 0)}
          icon={<Calendar size={24} />}
          color="bg-[#C0D1A9]"
        />
        <StatCard 
          title="Avg. Per Month"
          value={formatVal(grandTotal / 12)}
          icon={<History size={24} />}
          color="bg-[#EAE4D3]"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2f5f]"></div>
          <div className="text-sm font-black text-[#0a2f5f]">Syncing registry...</div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border-2 border-[#0a2f5f]/5 shadow-2xl overflow-hidden mb-16">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b-2 border-gray-100">
                  <th className="p-6 font-black  tracking-widest text-[10px] text-[#0a2f5f] sticky left-0 bg-[#f8fafc] z-10 border-r border-gray-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">Staff Member</th>
                  {MONTHS.map(m => (
                    <th key={m} className="p-4 font-black  tracking-widest text-[10px] text-gray-400 text-center">
                      {MONTH_LABELS[m]}
                    </th>
                  ))}
                  <th className="p-4 font-black  tracking-widest text-[10px] text-center bg-[#0a2f5f] text-white">Ytd Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((row, i) => (
                  <tr key={row.name} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="p-5 border-r border-gray-50 text-sm font-bold text-gray-700 sticky left-0 bg-white group-hover:bg-[#f8fafc] z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                      {row.name}
                    </td>
                    {MONTHS.map(m => (
                      <td key={m} className="p-4 text-center text-sm font-medium text-gray-500">
                        {row[m] || <span className="text-gray-200">0.0</span>}
                      </td>
                    ))}
                    <td className="p-4 text-center text-sm font-black text-[#0a2f5f] bg-[#0a2f5f]/5">
                      {formatVal(rowTotals[i])}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#f8fafc] font-black border-t-4 border-[#0a2f5f]">
                <tr>
                  <td className="p-6 sticky left-0 bg-[#f8fafc] z-10 text-[#0a2f5f]  tracking-widest text-xs border-r border-gray-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">Registry Grand Total</td>
                  {MONTHS.map(m => (
                    <td key={m} className="p-4 text-center text-[#0a2f5f] text-lg">
                      {formatVal(columnTotals[m])}
                    </td>
                  ))}
                  <td className="p-4 text-center text-white bg-[#0a2f5f] text-xl">
                    {formatVal(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Additional Hours Section */}
      <section className="mt-20">
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="text-[#0a2f5f]" size={24} />
          <h2 className="text-2xl font-black text-[#0a2f5f]  tracking-tight">Dec 2025 Roster</h2>
          <div className="h-px flex-grow bg-gradient-to-r from-[#0a2f5f]/20 to-transparent"></div>
        </div>
        <p className="text-gray-400 font-bold  tracking-widest text-[10px] mb-8 -mt-4">Additional Compensation Records</p>
        
        <div className="bg-white rounded-[2.5rem] border-2 border-[#0a2f5f]/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-6 font-black  tracking-widest text-[10px] text-gray-400">Staff Member</th>
                  <th className="p-6 font-black  tracking-widest text-[10px] text-gray-400">Assigned Program</th>
                  <th className="p-6 font-black  tracking-widest text-[10px] text-gray-400 text-center">Approved Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ADDITIONAL_HOURS.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 text-sm font-bold text-gray-700">{row.name}</td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-blue-50 text-[#0a2f5f] text-[10px] font-black  tracking-widest rounded-full border border-blue-100">
                        {row.program}
                      </span>
                    </td>
                    <td className="p-5 text-sm font-black text-[#0a2f5f] text-center font-mono bg-gray-50/50">
                      {row.hours ? `${row.hours}` : <span className="text-gray-200">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-20 flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex-grow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Calculator size={20} />
            </div>
            <h3 className="text-xl font-black text-[#0a2f5f]  tracking-tight">Audit Verification</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
            These records have been cross-referenced with Sap payroll data and iCAAP attendance logs. All hours listed are approved for the 2025/26 Academic Cycle.
          </p>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative w-40 h-40 rounded-full border-4 border-emerald-500/20 flex flex-col items-center justify-center p-4 text-center transform -rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <div className="text-[10px] font-black text-emerald-600  tracking-[0.2em] mb-1">Certified</div>
            <div className="w-12 h-px bg-emerald-200 mb-2"></div>
            <div className="text-[8px] font-bold text-emerald-500/60  tracking-widest leading-tight">iCAAP Administrative<br/>Records Office</div>
            <div className="mt-2 text-emerald-600">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black  tracking-[0.4em]">iCAAP Payroll Support Division © 2026</p>
      </footer>
    </div>
  );
}
