'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const planningCards = [
  { icon: '🎯', title: 'Goals', sub: 'SMART goal tracker', href: '/goals', color: 'bg-[#99B3C5]' },
  { icon: '📜', title: 'Mission', sub: 'Your purpose & values', href: '/planning/mission', color: 'bg-[#FFA1AB]' },
  { icon: '🧘', title: 'Mantra', sub: 'Daily focus & intent', href: '/planning/mantra', color: 'bg-[#FFC68D]' },
  { icon: '📚', title: 'Books to Read', sub: 'Reading wishlist', href: '/planning/books', color: 'bg-[#9ADBDE]' },
  { icon: '✨', title: 'Intentions', sub: 'Dreams & big ideas', href: '/planning/intentions', color: 'bg-[#99B3C5]' },
  { icon: '🗓️', title: 'Monthly Review', sub: 'Reflect & recalibrate', href: '/planning/review', color: 'bg-[#FFA1AB]' }
];

const visionBoardCards = [
  { icon: '🎓', title: 'Learning', sub: 'Skills & knowledge', href: '/planning/vision/learning' },
  { icon: '🏠', title: 'Living Space', sub: 'Home & environment', href: '/planning/vision/living' },
  { icon: '📈', title: 'Growth', sub: 'Professional path', href: '/planning/vision/growth' },
  { icon: '🤝', title: 'Relationships', sub: 'Family & community', href: '/planning/vision/relationships' },
  { icon: '✈️', title: 'Travel & Play', sub: 'Adventure & fun', href: '/planning/vision/travel' },
  { icon: '🌱', title: 'Well-being', sub: 'Health & harmony', href: '/planning/vision/wellbeing' }
];

export default function PlanningPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#0f3d91]">Planning Hub</h1>
        <p className="text-gray-600">Design your life with purpose and intention.</p>
      </header>

      <div className="bg-gradient-to-r from-[#0f3d91] via-[#3a7bd5] to-[#9ad4f2] rounded-xl p-8 mb-12 text-white shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Manifest Your Future</h2>
          <p className="text-lg opacity-90">Vision boards, mission statements, and goal setting.</p>
        </div>
        <div className="text-5xl">✨</div>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6 text-[#0f3d91] flex items-center gap-2">
          <span>🎯</span> Core Planning
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {planningCards.map((card) => (
            <Link 
              key={card.title}
              href={card.href}
              className={`flex flex-col items-center justify-center p-6 rounded-full border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ${card.color} bg-opacity-90`}
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl shadow-inner mb-2">
                {card.icon}
              </div>
              <span className="font-bold text-[#0a2f5f]">{card.title}</span>
              <span className="text-xs text-[#0a2f5f]/70 font-bold">{card.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#0f3d91]">Vision Board</h2>
            <p className="text-gray-500 font-medium">Visualize your dreams across all areas of life.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visionBoardCards.map((card, idx) => (
              <Link 
                key={card.title}
                href={card.href}
                className={`p-6 rounded-full flex flex-col items-center gap-2 border shadow-sm hover:shadow-md transition-all ${
                  idx % 4 === 0 ? 'bg-[#99B3C5]' : 
                  idx % 4 === 1 ? 'bg-[#FFA1AB]' : 
                  idx % 4 === 2 ? 'bg-[#FFC68D]' : 'bg-[#9ADBDE]'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl shadow-inner border border-blue-50">
                  {card.icon}
                </div>
                <div className="text-center">
                  <span className="block font-bold text-[#0a2f5f]">{card.title}</span>
                  <span className="text-[10px] uppercase font-black text-[#0a2f5f]/60 tracking-wider">{card.sub}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
