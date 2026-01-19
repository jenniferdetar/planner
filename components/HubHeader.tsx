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
  iconBgColor = 'bg-[#0a2f5f]',
  textColor = 'text-[#0a2f5f]',
  hideHubSuffix = false,
  children
}: HubHeaderProps) {
  return (
    <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl ${iconBgColor} flex items-center justify-center shadow-xl shadow-black/10`}>
          <Icon className="text-white" size={32} />
        </div>
        <div>
          <h1 className={`text-4xl font-black ${textColor} tracking-tight`}>
            {title}{!hideHubSuffix && ' Hub'}
          </h1>
          <p className="text-gray-400 font-bold tracking-widest text-xs italic">{subtitle}</p>
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
