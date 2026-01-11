'use client'

import React, { useState, useEffect } from 'react'
import { opusRepository } from '@/lib/repositories/opus-repository'
import { SHEET_SECTIONS, getSheetSection, normalizeGoalTitle } from '@/lib/goals-utils'
import Link from 'next/link'

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingGoal, setEditingGoal] = useState<any>(null)

  useEffect(() => {
    async function loadGoals() {
      try {
        const data = await opusRepository.getSMARTGoals()
        // Convert record back to array for easier processing
        const goalsArray = Object.entries(data).map(([title, val]: [string, any]) => ({
          title,
          ...val
        }))
        setGoals(goalsArray)
      } catch (err) {
        console.error('Failed to load goals', err)
      } finally {
        setLoading(false)
      }
    }
    loadGoals()
  }, [])

  const groupedGoals = goals.reduce((acc: Record<string, any[]>, goal) => {
    const section = getSheetSection(goal)
    if (!acc[section]) acc[section] = []
    acc[section].push(goal)
    return acc
  }, {})

  if (loading) return <div className="p-8 text-center">Loading goals...</div>

  return (
    <>
      <header className="planner-header">
        <div className="planner-header-left">
          <h1>Goals</h1>
          <p>Track your progress toward your goals</p>
        </div>
        <div className="planner-header-right">
          <Link href="/smart-goals" className="planner-button planner-button-secondary">SMART Sheet</Link>
          <div className="planner-header-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </header>

      <main className="planner-main">
        <section className="planner-section goals-sheet-section">
          <div className="goals-sheet">
            <div className="goals-sheet-header">
              <div className="goals-sheet-icon">🏆</div>
              <div>
                <div className="goals-sheet-title">My Personal Goals</div>
                <p className="goals-sheet-subtitle">
                  What one thing do you want to be intentional about this year? Decide what you
                  want to track and keep up with it weekly.
                </p>
              </div>
            </div>
            <div className="goals-sheet-divider"></div>
            
            <div className="goals-sheet-grid">
              {SHEET_SECTIONS.map((section) => {
                const items = groupedGoals[section.label] || []
                const lineCount = Math.max(6, items.length)
                
                return (
                  <div key={section.label} className={`goal-sheet-card tone-${section.tone}`}>
                    <div className="goal-sheet-title">{section.label}</div>
                    <div className="goal-sheet-lines">
                      {Array.from({ length: lineCount }).map((_, i) => (
                        <div key={i} className={`goal-sheet-line ${i >= items.length ? 'empty' : ''}`}>
                          {i < items.length ? (
                            normalizeGoalTitle(items[i].title).toLowerCase() === 'read' ? (
                              <Link href="/books-to-read" className="goal-sheet-item">
                                {items[i].title}
                              </Link>
                            ) : (
                              <button 
                                type="button" 
                                className={`goal-sheet-item ${items[i].title.length > 24 ? 'goal-sheet-item-compact' : ''}`}
                                onClick={() => setEditingGoal(items[i])}
                              >
                                {items[i].title}
                              </button>
                            )
                          ) : (
                            <span className="goal-sheet-item">&nbsp;</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="goals-sheet-total">TOTAL: <span>{goals.length}</span></div>
          </div>
        </section>

        {/* Create/Edit form would go here - omitted for brevity in first pass or implemented as needed */}
      </main>

      <footer className="planner-footer">
        Active goals: {goals.filter(g => g.status !== 'Completed').length} | Completed: {goals.filter(g => g.status === 'Completed').length}
      </footer>
    </>
  )
}
