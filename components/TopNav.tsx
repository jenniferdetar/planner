'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Home', href: '/', color: 'bg-[#f8a1b2]' },
  { label: 'CSEA', href: '/csea', color: 'bg-[#3d6f8d] text-white' },
  { label: 'Finance', href: '/finance', color: 'bg-[#f2b671]' },
  { label: 'Health', href: '/health', color: 'bg-[#f8a1b2]' },
  { label: 'HOA', href: '/hoa', color: 'bg-[#a7d9df]' },
  { label: 'iCAAP', href: '/icaap', color: 'bg-[#f2b671]' },
  { label: 'Planning', href: '/planning', color: 'bg-[#a7d9df]' }
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="bg-[#0a2f5f] border-b-4 border-[#f2b671]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
        <div className="text-white text-lg font-black tracking-tight uppercase mb-3">
          Strategic Command
        </div>
        <div className="grid gap-2">
          <div className="grid gap-2 md:grid-cols-7">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-center text-sm font-bold uppercase rounded-lg px-3 py-2 border-2 border-[#0a2f5f] ${item.color} ${
                    isActive ? 'ring-2 ring-white/70' : ''
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
