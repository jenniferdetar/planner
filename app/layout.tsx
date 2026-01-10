import type { Metadata } from 'next'
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
            <a href="/" className="planner-sidebar-item">Home</a>
            <a href="/csea" className="planner-sidebar-item">CSEA</a>
            <a href="/finance" className="planner-sidebar-item">Finance</a>
            <a href="/health" className="planner-sidebar-item">Health</a>
            <a href="/hoa" className="planner-sidebar-item">HOA</a>
            <a href="/icaap" className="planner-sidebar-item">iCAAP</a>
            <a href="/planning" className="planner-sidebar-item">Planning</a>
          </aside>
          <div className="planner-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
