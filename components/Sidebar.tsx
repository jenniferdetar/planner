'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

const sidebarItems = [
  { href: '/calendar', text: 'Home', class: 'nav-home' },
  { href: '/csea', text: 'CSEA', class: 'nav-csea' },
  { href: '/finance', text: 'Finance', class: 'nav-finance' },
  { href: '/health', text: 'Health', class: 'nav-health' },
  { href: '/hoa', text: 'HOA', class: 'nav-hoa' },
  { href: '/icaap', text: 'iCAAP', class: 'nav-icaap' },
  { href: '/planning', text: 'Planning', class: 'nav-planning' }
];

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0a2f5f] text-white flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-[#ffffff22]">
        OPUS ONE
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/calendar' && pathname === '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded transition-colors ${
                  isActive 
                    ? 'bg-[#ffca38] text-[#0a2f5f] font-bold' 
                    : 'hover:bg-[#ffffff11]'
                }`}
              >
                {item.text}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-[#ffffff22]">
        {user && (
          <div className="mb-4">
            <p className="text-xs opacity-70 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-[#ffca38] text-[#0a2f5f] font-bold rounded hover:bg-[#e5b632] transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
