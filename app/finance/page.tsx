'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Wallet, Receipt, Calendar, 
  BarChart3, PiggyBank, ArrowUpRight, ShieldCheck,
  TrendingUp, Landmark
} from 'lucide-react';

const financeLinks = [
  {
    href: '/finance/transactions',
    icon: <Receipt className="text-[#0a2f5f]" size={24} />,
    label: 'Transactions',
    sub: 'Projected checkbook',
    color: 'bg-[#99B3C5]',
    borderColor: 'border-[#99B3C5]'
  },
  {
    href: '/finance/bill-schedule',
    icon: <Calendar className="text-[#0a2f5f]" size={24} />,
    label: 'Bill Payment Schedule',
    sub: 'Payment calendar',
    color: 'bg-[#FFA1AB]',
    borderColor: 'border-[#FFA1AB]'
  },
  {
    href: '/finance/budget-overview',
    icon: <BarChart3 className="text-[#0a2f5f]" size={24} />,
    label: 'Budget Overview',
    sub: 'Financial health',
    color: 'bg-[#FFC68D]',
    borderColor: 'border-[#FFC68D]'
  },
  {
    href: '/finance/savings-goals',
    icon: <PiggyBank className="text-[#0a2f5f]" size={24} />,
    label: 'Savings',
    sub: 'Build your future',
    color: 'bg-[#9ADBDE]',
    borderColor: 'border-[#9ADBDE]'
  },
  {
    href: '/finance/spending-plan',
    icon: <Wallet className="text-[#0a2f5f]" size={24} />,
    label: 'Spending Plan',
    sub: 'Income & expenses',
    color: 'bg-[#99B3C5]',
    borderColor: 'border-[#99B3C5]'
  }
];

export default function FinancePage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
        {financeLinks.map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            className={`group relative flex flex-col justify-between p-6 rounded-[2rem] border-2 ${link.borderColor} bg-white shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${link.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-2xl ${link.color} flex items-center justify-center mb-6 shadow-inner`}>
                {link.icon}
              </div>
              <h3 className="text-2xl font-black text-[#0a2f5f] mb-2">{link.label}</h3>
              <p className="text-xs font-bold text-gray-400  tracking-widest leading-relaxed">
                {link.sub}
              </p>
            </div>
            <div className="mt-8 flex items-center text-[#0a2f5f] font-black text-sm  tracking-widest gap-2">
              Review Ledger <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black  tracking-[0.4em]">Fiscal Operations Registry © 2026</p>
      </footer>
    </div>
  );
}
