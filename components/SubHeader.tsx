'use client';

import React from 'react';

interface SubHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SubHeader({ title, subtitle }: SubHeaderProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-[#0a2f5f] text-white px-6 py-2 flex justify-between items-center shadow-inner">
      <div className="flex items-baseline gap-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {subtitle && <span className="text-xs font-medium text-white/70 uppercase tracking-wider">{subtitle}</span>}
      </div>
      <div className="text-sm font-bold tracking-tight">
        {today}
      </div>
    </div>
  );
}
