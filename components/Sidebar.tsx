'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserNav } from './UserNav'

export function Sidebar() {
  const pathname = usePathname()
  
  // Hide sidebar on login and auth callback pages
  if (pathname === '/login' || pathname === '/auth/callback') {
    return null
  }

  return (
    <aside className="planner-sidebar">
      <div className="sidebar-links">
        <Link href="/" className="planner-sidebar-item">Home</Link>
        <Link href="/work-planner" className="planner-sidebar-item">Work Planner</Link>
        <Link href="/goals" className="planner-sidebar-item">Goals</Link>
        <Link href="/csea" className="planner-sidebar-item">CSEA</Link>
        <Link href="/finance" className="planner-sidebar-item">Finance</Link>
        <Link href="/health" className="planner-sidebar-item">Health</Link>
        <Link href="/hoa" className="planner-sidebar-item">HOA</Link>
        <Link href="/icaap" className="planner-sidebar-item">iCAAP</Link>
        <Link href="/planning" className="planner-sidebar-item">Planning</Link>
      </div>
      <UserNav />
    </aside>
  )
}
