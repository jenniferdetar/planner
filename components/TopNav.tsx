'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ROWS = [
  [
    { label: 'Home', href: '/', color: 'bg-[#f8a1b2]' },
    { label: 'Personal Planner', href: '/planning/personal', color: 'bg-[#f2b671]' },
    { label: 'Work Planner', href: '/planning/work', color: 'bg-[#a7d9df]' },
    { label: 'CSEA', href: '/csea', color: 'bg-[#3d6f8d] text-white' },
    { label: 'Goals', href: '/goals', color: 'bg-[#f8a1b2]' },
    { label: 'Notes', href: '/icaap/notes', color: 'bg-[#f2b671]' }
  ],
  [
    { label: 'Meetings', href: '/planning/meetings', color: 'bg-[#a7d9df]' },
    { label: 'Mission', href: '/planning/mission', color: 'bg-[#f8a1b2]' },
    { label: 'Mantra', href: '/planning/mantra', color: 'bg-[#f2b671]' },
    { label: 'Intentions & Dreams', href: '/planning/intentions', color: 'bg-[#a7d9df]' },
    { label: 'Monthly Review', href: '/planning/review', color: 'bg-[#3d6f8d] text-white' },
    { label: 'Fruits & Vegetables', href: '/health', color: 'bg-[#f8a1b2]' }
  ],
  [
    { label: 'Dream Big Home', href: '/planning', color: 'bg-[#f2b671]' },
    { label: 'Budget Overview', href: '/finance/budget-overview', color: 'bg-[#a7d9df]' },
    { label: 'Bill Payment Schedule', href: '/finance/bill-schedule', color: 'bg-[#f8a1b2]' },
    { label: 'Spending Plan', href: '/finance/spending-plan', color: 'bg-[#f2b671]' },
    { label: 'Savings Goal', href: '/finance/savings-goals', color: 'bg-[#a7d9df]' }
  ]
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="bg-[#0a2f5f] border-b-4 border-[#f2b671]">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="text-white text-xl font-black tracking-tight uppercase mb-4">
          Strategic Command
        </div>
        <div className="flex flex-col gap-2">
          {NAV_ROWS.map((row, rowIdx) => (
            <div key={`row-${rowIdx}`} className="flex gap-2 w-full">
              {row.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex-1 text-center text-[11px] font-black uppercase py-2.5 rounded-xl border-2 border-[#0a2f5f] shadow-sm ${item.color} ${
                      isActive ? 'ring-2 ring-white ring-inset' : ''
                    } transition-all hover:brightness-105 active:scale-[0.98] flex items-center justify-center min-h-[44px] leading-tight px-1`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
