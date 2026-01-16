import React from 'react';
import Link from 'next/link';

const financeLinks = [
  {
    href: '/finance/transactions',
    icon: '💰',
    label: 'Transactions',
    sub: 'Projected checkbook',
    color: 'bg-[#99B3C5]'
  },
  {
    href: '/finance/bill-schedule',
    icon: '📆',
    label: 'Bill Payment Schedule',
    sub: 'Never miss a due date',
    color: 'bg-[#FFA1AB]'
  },
  {
    href: '/finance/budget-overview',
    icon: '📊',
    label: 'Budget Overview',
    sub: 'Dashboard at a glance',
    color: 'bg-[#FFC68D]'
  },
  {
    href: '/finance/savings-goals',
    icon: '🏦',
    label: 'Savings Goal',
    sub: 'Build your reserves',
    color: 'bg-[#9ADBDE]'
  },
  {
    href: '/finance/spending-plan',
    icon: '🧾',
    label: 'Spending Plan',
    sub: 'Track income & expenses',
    color: 'bg-[#99B3C5]'
  }
];

export default function FinancePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#0a2f5f]">Finance Hub</h1>
        <p className="text-gray-600">Quick access to your money tools</p>
      </header>

      <div className="bg-gradient-to-r from-[#0f4c75] via-[#3282b8] to-[#bbe1fa] rounded-xl p-8 mb-8 text-white shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Stay on top of your money</h2>
          <p className="text-lg opacity-90">Budgets, bills, and savings—organized in one spot.</p>
        </div>
        <div className="text-5xl">💰</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {financeLinks.map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            className={`flex items-center gap-4 p-4 rounded-full border-2 border-blue-50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ${link.color} bg-opacity-90`}
          >
            <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center text-xl shadow-inner">
              {link.icon}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#0a2f5f]">{link.label}</span>
              <span className="text-sm text-[#0a2f5f]/80 font-medium">{link.sub}</span>
            </div>
          </Link>
        ))}
      </div>

      <footer className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500 text-center">
        Finance Hub • Securely synced with Supabase.
      </footer>
    </div>
  );
}
