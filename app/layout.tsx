import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Opus One Planner',
  description: 'Your unified planning companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="planner-container">
          <aside className="planner-sidebar">
            <Link href="/" className="planner-sidebar-item">Home</Link>
            <Link href="/work-planner" className="planner-sidebar-item">Work Planner</Link>
            <Link href="/goals" className="planner-sidebar-item">Goals</Link>
            <Link href="/csea" className="planner-sidebar-item">CSEA</Link>
            <Link href="/finance" className="planner-sidebar-item">Finance</Link>
            <Link href="/health" className="planner-sidebar-item">Health</Link>
            <Link href="/hoa" className="planner-sidebar-item">HOA</Link>
            <Link href="/icaap" className="planner-sidebar-item">iCAAP</Link>
            <Link href="/planning" className="planner-sidebar-item">Planning</Link>
          </aside>
          <div className="planner-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
