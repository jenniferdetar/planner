'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Bell,
  CheckCircle2,
  ChevronDown,
  Home,
  Layers,
  Plus,
  Search,
  Target,
  WalletCards
} from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const PRIMARY_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'My tasks', href: '/planning/work', icon: CheckCircle2 }
];

const PROJECT_ITEMS: NavItem[] = [
  { label: 'Planning', href: '/planning', icon: Activity },
  { label: 'Finance', href: '/finance', icon: WalletCards },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Health', href: '/health', icon: Activity },
  { label: 'HOA', href: '/hoa', icon: Layers },
  { label: 'iCAAP', href: '/icaap', icon: Layers },
  { label: 'CSEA', href: '/csea', icon: Layers }
];

function NavSection({
  title,
  items,
  pathname
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between px-3 text-[11px] uppercase tracking-[0.25em] text-[var(--asana-muted)]">
        <span>{title}</span>
        <ChevronDown size={14} className="opacity-60" />
      </div>
      <div className="mt-2 space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold transition ${
                isActive
                  ? 'bg-[var(--asana-selected)] text-white shadow-inner'
                  : 'text-[var(--asana-text)] hover:bg-[var(--asana-hover)]'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-[var(--asana-muted)]'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="asana-shell">
      <aside className="asana-sidebar">
        <div className="flex items-center gap-2 px-4 py-5">
          <div className="h-9 w-9 rounded-xl bg-[var(--asana-accent)] text-white flex items-center justify-center font-black">
            O
          </div>
          <div className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--asana-text)]">Opus</div>
        </div>
        <NavSection title="Work" items={PRIMARY_ITEMS} pathname={pathname} />
        <NavSection title="Projects" items={PROJECT_ITEMS} pathname={pathname} />
        <div className="mt-auto px-4 pb-4 pt-6">
          <button className="w-full rounded-xl bg-[var(--asana-cta)] py-3 text-[13px] font-bold text-[#1f1f1f] shadow-sm shadow-black/20 hover:brightness-105">
            Upgrade
          </button>
          <div className="mt-3 text-[11px] text-[var(--asana-muted)]">
            Navigation redesign
          </div>
        </div>
      </aside>

      <div className="asana-main">
        <header className="asana-topbar">
          <div className="flex items-center gap-3">
            <button className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-[var(--asana-chip)] text-[var(--asana-text)]">
              <Plus size={16} />
            </button>
            <div className="asana-search">
              <Search size={16} className="text-[var(--asana-muted)]" />
              <input
                type="text"
                placeholder="Search"
                className="flex-1 bg-transparent text-sm text-[var(--asana-text)] placeholder:text-[var(--asana-muted)] focus:outline-none"
              />
              <span className="asana-kbd">Cmd K</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="asana-icon-btn" aria-label="Notifications">
              <Bell size={16} />
            </button>
            <button className="asana-icon-btn" aria-label="Profile">
              <span className="h-7 w-7 rounded-full bg-[var(--asana-accent-2)] text-[10px] font-bold text-white flex items-center justify-center">
                JD
              </span>
            </button>
          </div>
        </header>

        <main className="asana-content">
          {children}
        </main>
      </div>
    </div>
  );
}
