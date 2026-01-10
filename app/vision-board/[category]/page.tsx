'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { opusRepository } from '@/lib/repositories/opus-repository'

const CATEGORY_MAP: Record<string, { title: string, icon: string, sub: string }> = {
  'professional-growth': { 
    title: 'Professional Growth', 
    icon: '💼', 
    sub: 'Map the impact, leadership, and opportunities you want next.' 
  },
  'living-space': { 
    title: 'Living Space', 
    icon: '🏠', 
    sub: 'Envision the home environment that supports your peace and productivity.' 
  },
  'relationships': { 
    title: 'Relationships', 
    icon: '❤️', 
    sub: 'Focus on the connections and memories you want to build.' 
  },
  'travel-play': { 
    title: 'Travel & Play', 
    icon: '✈️', 
    sub: 'Explore the adventures and recreation that recharge you.' 
  },
  'well-being': { 
    title: 'Well-being', 
    icon: '🧘', 
    sub: 'Prioritize the health and habits that keep you grounded.' 
  }
}

export default function VisionBoardCategoryPage() {
  const params = useParams()
  const categoryKey = params.category as string
  const category = CATEGORY_MAP[categoryKey] || { title: categoryKey, icon: '✨', sub: '' }

  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const allPhotos = await opusRepository.getVisionBoardPhotos()
        setPhotos(allPhotos.filter(p => p.category === categoryKey))
        
        // Load notes from localStorage for now
        const savedNotes = localStorage.getItem(`vision-board:${categoryKey}:notes`) || ''
        setNotes(savedNotes)
      } catch (err) {
        console.error('Failed to load vision board data', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [categoryKey])

  const handleNotesChange = (val: string) => {
    setNotes(val)
    localStorage.setItem(`vision-board:${categoryKey}:notes`, val)
  }

  if (loading) return <div className="p-8 text-center">Loading vision board...</div>

  return (
    <>
      <header className="planner-header">
        <div className="planner-header-left">
          <h1>Vision Board: {category.title}</h1>
          <p>{category.sub}</p>
        </div>
        <div className="planner-header-right">
          <div className="planner-header-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </header>

      <main className="planner-main">
        <section className="planner-section">
          <div className="planner-section-header">
            <span className="planner-section-icon">{category.icon}</span>
            <h2 className="planner-section-title">Vision Focus</h2>
          </div>
          <div className="planner-section-content">
            <div className="planner-form-group">
              <label className="planner-form-label">Notes & ideas</label>
              <textarea 
                className="planner-form-textarea" 
                placeholder="Add roles, projects, recognition, and skills to build..."
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
              ></textarea>
            </div>
          </div>
        </section>

        <section className="planner-section">
          <div className="planner-section-content">
            <div className="vision-photo-board">
              <div className="vision-photo-header">
                <div>
                  <h3 className="vision-photo-title">{category.title} Gallery</h3>
                  <p className="vision-photo-sub">Highlight inspiration and milestones.</p>
                </div>
                <div className="vision-photo-actions">
                  <button className="vision-photo-button" type="button">Add photos</button>
                </div>
              </div>
              
              <div className="vision-photo-grid">
                {photos.length === 0 ? (
                  <div className="vision-photo-empty">Add photos to build your vision board.</div>
                ) : (
                  photos.map((photo, i) => (
                    <div key={photo.id || i} className="vision-photo-card">
                      <img src={photo.url} alt={photo.title || 'Vision board photo'} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {categoryKey === 'professional-growth' && (
          <section className="planner-section">
            <div className="planner-section-header">
              <span className="planner-section-icon">📖</span>
              <h2 className="planner-section-title">Reading Tracker</h2>
            </div>
            <div className="planner-section-content vision-reading-tracker">
              {/* Reading tracker implementation would go here */}
              <p className="text-sm opacity-70 italic">Reading tracker integration coming soon.</p>
            </div>
          </section>
        )}
      </main>

      <footer className="planner-footer">
        Vision Board • {category.title}
      </footer>
    </>
  )
}
