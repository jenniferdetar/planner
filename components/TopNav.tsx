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
    <header className="bg-[#0a2f5f] shadow-md border-b border-[#0a2f5f]">
      <div className="max-w-full mx-auto px-2 py-2">
        <div className="flex flex-col gap-1.5">
          {NAV_ROWS.map((row, rowIdx) => (
            <div key={`row-${rowIdx}`} className="flex gap-1.5 w-full">
              {row.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex-1 text-center text-[13px] font-bold py-1.5 rounded-[4px] border border-black/10 ${item.color} ${
                      isActive ? 'ring-2 ring-white/50 z-10' : ''
                    } transition-all hover:brightness-110 active:scale-[0.98] truncate`}
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
