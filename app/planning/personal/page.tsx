'use client';

import React from 'react';

const DAYS = [
  { label: 'Sunday', color: '#f38aa3' },
  { label: 'Monday', color: '#f3a25a' },
  { label: 'Tuesday', color: '#7fc9d6' },
  { label: 'Wednesday', color: '#3c6f8f' },
  { label: 'Thursday', color: '#f28b85' },
  { label: 'Friday', color: '#f1c07a' },
  { label: 'Saturday', color: '#7fc9d6' }
];

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = 42;
  const cells: Array<{ day: number | null }> = [];

  for (let i = 0; i < totalCells; i += 1) {
    const dayNumber = i - firstDay + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      cells.push({ day: null });
    } else {
      cells.push({ day: dayNumber });
    }
  }

  return cells;
}

import { Calendar as CalendarIcon, User, Layout } from 'lucide-react';
import Link from 'next/link';

export default function PersonalPlannerPage() {
  const year = 2026;
  const month = 0;
  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
  const cells = buildMonthGrid(year, month);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto bg-[#fdfdfd] min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 items-start">
        <aside className="border border-slate-200 rounded-xl p-5">
          <div className="text-center text-[11px] font-black  tracking-[0.3em] text-[#4a7f8f] mb-4">
            Notes
          </div>
          <div className="space-y-2">
            {Array.from({ length: 24 }).map((_, idx) => (
              <div key={idx} className="border-b border-slate-200 h-4"></div>
            ))}
          </div>
          <div className="mt-8 text-[10px] font-black  tracking-[0.3em] text-gray-400">February</div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-[10px] text-gray-400">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <div key={day} className="text-center">{day}</div>
            ))}
            {Array.from({ length: 35 }).map((_, idx) => (
              <div key={idx} className="h-4 border border-slate-200/60"></div>
            ))}
          </div>
        </aside>

        <section className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-center gap-3 py-3 text-[12px] font-black  tracking-[0.4em] text-[#f38aa3]">
            {monthLabel}
          </div>
          <div className="grid grid-cols-7 border-t border-slate-200">
            {DAYS.map((day: { label: string, color: string }) => (
              <div
                key={day.label}
                className="text-center text-[10px] font-black  tracking-[0.3em] py-2 text-white"
                style={{ backgroundColor: day.color }}
              >
                {day.label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-t border-slate-200">
            {cells.map((cell, idx) => {
              const isRowEnd = (idx + 1) % 7 === 0;
              return (
                <div
                  key={idx}
                  className={`min-h-[110px] border-t border-slate-200 ${isRowEnd ? '' : 'border-r'}`}
                >
                  {cell.day && (
                    <div className="text-[10px] text-gray-500 font-bold p-2">{cell.day}</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
