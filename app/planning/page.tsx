'use client'

import React from 'react'
import Link from 'next/link'

export default function PlanningHub() {
  const sections = [
    {
      title: 'Vision Board',
      icon: '✨',
      items: [
        { name: 'Professional Growth', href: '/vision-board/professional-growth' },
        { name: 'Living Space', href: '/vision-board/living-space' },
        { name: 'Relationships', href: '/vision-board/relationships' },
        { name: 'Travel & Play', href: '/vision-board/travel-play' },
        { name: 'Well-being', href: '/vision-board/well-being' }
      ]
    },
    {
      title: 'Goals & Review',
      icon: '🎯',
      items: [
        { name: 'Goal Sheet', href: '/goals' },
        { name: 'SMART Sheet', href: '/smart-goals' },
        { name: 'Monthly Review', href: '/monthly-review' }
      ]
    },
    {
      title: 'Daily & Weekly',
      icon: '🗓️',
      items: [
        { name: 'Personal Planner', href: '/personal-planner' },
        { name: 'Work Planner', href: '/work-planner' },
        { name: 'Weekly Tasks', href: '/weekly-tasks' }
      ]
    }
  ]

  return (
    <>
      <header className="planner-header">
        <div className="planner-header-left">
          <h1>Planning Hub</h1>
          <p>Organize your life, goals, and vision in one place.</p>
        </div>
      </header>

      <main className="planner-main">
        <div className="planner-grid-3">
          {sections.map(section => (
            <section key={section.title} className="planner-section">
              <div className="planner-section-header">
                <span className="planner-section-icon">{section.icon}</span>
                <h2 className="planner-section-title">{section.title}</h2>
              </div>
              <div className="planner-section-content">
                <ul className="planner-link-list">
                  {section.items.map(item => (
                    <li key={item.href}>
                      <Link href={item.href} className="planner-link-item">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="planner-footer">
        Planning Hub • Unified Navigation
      </footer>

      <style jsx>{`
        .planner-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .planner-link-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .planner-link-item {
          display: block;
          padding: 0.75rem 1rem;
          color: var(--planner-text);
          text-decoration: none;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .planner-link-item:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--planner-primary);
        }
      `}</style>
    </>
  )
}
