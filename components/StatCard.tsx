import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="relative overflow-hidden p-6 rounded-2xl bg-[var(--asana-card)] border border-[var(--asana-border)] shadow-lg shadow-black/20 group hover:shadow-xl transition-all duration-500">
      <div className={`absolute -right-6 -top-6 w-24 h-24 ${color} opacity-20 rounded-full blur-sm group-hover:scale-150 transition-transform duration-700`}></div>
      <div className="relative z-10">
        <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center mb-4 text-white/90 shadow-inner`}>
          {icon}
        </div>
        <div className="text-3xl font-bold font-display text-[var(--asana-text)] mb-1">{value}</div>
        <div className="text-[10px] font-semibold text-[var(--asana-muted)] tracking-[0.25em] uppercase">{title}</div>
      </div>
    </div>
  );
}
