'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Wallet, Receipt, Calendar, 
  BarChart3, PiggyBank, ArrowUpRight, ShieldCheck,
  TrendingUp, Landmark
} from 'lucide-react';
import HubHeader from '@/components/HubHeader';

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
      <HubHeader 
        title="Finance" 
        subtitle='"Master your resources with precision and foresight"' 
        icon={Landmark} 
        iconBgColor="bg-[#FFC68D]"
        textColor="text-[#0a2f5f]"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {financeLinks.map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            className={`group relative flex flex-col justify-between p-8 rounded-[2.5rem] border-2 ${link.borderColor} bg-white shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${link.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-2xl ${link.color} flex items-center justify-center mb-6 shadow-inner`}>
                {link.icon}
              </div>
              <h3 className="text-2xl font-black text-[#0a2f5f] mb-2">{link.label}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                {link.sub}
              </p>
            </div>
            <div className="mt-8 flex items-center text-[#0a2f5f] font-black text-sm uppercase tracking-widest gap-2">
              Review Ledger <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-[#0a2f5f]" size={24} />
              <h2 className="text-2xl font-black text-[#0a2f5f] uppercase tracking-tight">Financial Security</h2>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed italic mb-8">
              Your financial records are encrypted and synchronized across the administrative network for real-time reporting.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[#0a2f5f] font-black text-xs uppercase tracking-[0.2em] bg-white p-4 rounded-2xl border">
            <ArrowUpRight size={16} />
            Data Integrity Verified
          </div>
        </div>

        <div className="bg-[#99B3C5]/10 p-10 rounded-[3rem] border-2 border-[#99B3C5]/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-[#0a2f5f]" size={24} />
              <h2 className="text-2xl font-black text-[#0a2f5f] uppercase tracking-tight">Growth Projection</h2>
            </div>
            <p className="text-[#0a2f5f]/70 font-medium leading-relaxed italic mb-8">
              Current trajectory indicates a stable expansion of reserves. Continue monitoring savings goals to maintain momentum.
            </p>
          </div>
          <div className="text-4xl font-black text-[#0a2f5f] opacity-20">2026 Projections</div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Fiscal Operations Registry © 2026</p>
      </footer>
    </div>
  );
}
