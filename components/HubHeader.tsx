'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface HubHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconBgColor?: string;
  textColor?: string;
  hideHubSuffix?: boolean;
  children?: React.ReactNode;
}

export default function HubHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  iconBgColor = 'bg-[var(--asana-accent)]',
  textColor = 'text-[var(--asana-text)]',
  hideHubSuffix = false,
  children
}: HubHeaderProps) {
  return (
    <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${iconBgColor} flex items-center justify-center shadow-lg shadow-black/20`}>
          <Icon className="text-white" size={32} />
        </div>
        <div>
          <h1 className={`text-3xl font-bold ${textColor} tracking-tight font-display`}>
            {title}{!hideHubSuffix && ' Hub'}
          </h1>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--asana-muted)]">{subtitle}</p>
        </div>
      </div>
      {children && (
        <div className="flex gap-3">
          {children}
        </div>
      )}
    </header>
  );
}
