import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

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
          <Sidebar />
          <div className="planner-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
