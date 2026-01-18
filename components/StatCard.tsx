import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="relative overflow-hidden p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500">
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 shadow-inner text-[#0a2f5f]`}>
          {icon}
        </div>
        <div className="text-4xl font-black text-[#0a2f5f] mb-1">{value}</div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</div>
      </div>
    </div>
  );
}
