'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Target, Scroll, Sparkles, 
  BookOpen, Calendar, Briefcase, Heart, 
  Plane, Activity, PieChart, Users, Zap,
  Compass
} from 'lucide-react';

const corePlanningCards = [
  { icon: <Calendar className="text-[#0a2f5f]" size={24} />, title: 'Personal Planner', sub: 'Weekly Schedule & Habits', href: '/planning/personal', color: 'bg-[#99B3C5]', borderColor: 'border-[#99B3C5]' },
  { icon: <Briefcase className="text-[#0a2f5f]" size={24} />, title: 'Work Planner', sub: 'Weekly Grid & Priorities', href: '/planning/work', color: 'bg-[#E0592A]', borderColor: 'border-[#E0592A]' },
  { icon: <Target className="text-[#0a2f5f]" size={24} />, title: 'Goals', sub: 'SMART goal tracker', href: '/goals', color: 'bg-[#FFC68D]', borderColor: 'border-[#FFC68D]' },
  { icon: <Scroll className="text-[#0a2f5f]" size={24} />, title: 'Mission', sub: 'Your purpose & values', href: '/planning/mission', color: 'bg-[#FFA1AB]', borderColor: 'border-[#FFA1AB]' },
  { icon: <Zap className="text-[#0a2f5f]" size={24} />, title: 'Mantra', sub: 'Daily focus & intent', href: '/planning/mantra', color: 'bg-[#9ADBDE]', borderColor: 'border-[#9ADBDE]' },
  { icon: <BookOpen className="text-[#0a2f5f]" size={24} />, title: 'Books to Read', sub: 'Reading wishlist', href: '/planning/books', color: 'bg-[#9ADBDE]', borderColor: 'border-[#9ADBDE]' },
  { icon: <Sparkles className="text-[#0a2f5f]" size={24} />, title: 'Intentions', sub: 'Dreams & big ideas', href: '/planning/intentions', color: 'bg-[#99B3C5]', borderColor: 'border-[#99B3C5]' },
  { icon: <PieChart className="text-[#0a2f5f]" size={24} />, title: 'Monthly Review', sub: 'Reflect & recalibrate', href: '/planning/review', color: 'bg-[#FFA1AB]', borderColor: 'border-[#FFA1AB]' },
  { icon: <Users className="text-[#0a2f5f]" size={24} />, title: 'Meetings', sub: 'Schedule & Records', href: '/planning/meetings', color: 'bg-[#FFC68D]', borderColor: 'border-[#FFC68D]' }
];

const visionBoardCards = [
  { icon: <BookOpen size={20} />, title: 'Learning', sub: 'Skills & knowledge', href: '/planning/vision/learning', color: 'bg-[#99B3C5]' },
  { icon: <Heart size={20} />, title: 'Living Space', sub: 'Home & environment', href: '/planning/vision/living', color: 'bg-[#FFA1AB]' },
  { icon: <Activity size={20} />, title: 'Growth', sub: 'Professional path', href: '/planning/vision/growth', color: 'bg-[#FFC68D]' },
  { icon: <Users size={20} />, title: 'Relationships', sub: 'Family & community', href: '/planning/vision/relationships', color: 'bg-[#9ADBDE]' },
  { icon: <Plane size={20} />, title: 'Travel & Play', sub: 'Adventure & fun', href: '/planning/vision/travel', color: 'bg-[#99B3C5]' },
  { icon: <Activity size={20} />, title: 'Well-being', sub: 'Health & harmony', href: '/planning/vision/wellbeing', color: 'bg-[#FFA1AB]' }
];

export default function PlanningPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-[#00326b] flex items-center justify-center shadow-xl shadow-[#00326b]/20">
            <Compass className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#00326b] tracking-tight uppercase">Planning Hub</h1>
            <p className="text-gray-400 font-bold tracking-widest text-xs">Design your life with purpose and intention</p>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f3d91] via-[#3a7bd5] to-[#9ad4f2] rounded-[3rem] p-10 mb-12 text-white shadow-2xl shadow-[#0f3d91]/30">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black mb-4 leading-tight text-white">Manifest Your Future</h2>
          <p className="text-xl text-white/80 font-medium leading-relaxed mb-8">
            Visualize your dreams, set SMART goals, and align your daily actions with your core mission statement.
          </p>
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">2026</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-white">Vision Year</span>
            </div>
            <div className="w-px h-12 bg-white/20 mx-4"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">Active</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-white">Planning Mode</span>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 text-[20rem] opacity-10 pointer-events-none text-white">✨</div>
      </section>

      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <Target className="text-[#00326b]" size={24} />
          <h2 className="text-2xl font-black text-[#00326b] uppercase tracking-tight">Core Planning</h2>
          <div className="h-px flex-grow bg-gradient-to-r from-[#00326b]/20 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {corePlanningCards.map((card) => (
            <Link 
              key={card.title}
              href={card.href}
              className={`group relative flex flex-col justify-between p-8 rounded-[2.5rem] border-2 ${card.borderColor} bg-white shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden`}
            >
              <div className={`absolute -right-4 -top-4 w-24 h-24 ${card.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center mb-6 shadow-inner`}>
                  {card.icon}
                </div>
                <h3 className="text-2xl font-black text-[#0a2f5f] mb-2">{card.title}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                  {card.sub}
                </p>
              </div>
              <div className="mt-8 flex items-center text-[#0a2f5f] font-black text-sm uppercase tracking-widest gap-2">
                Explore <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="bg-slate-50 p-12 rounded-[4rem] border-2 border-slate-100 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-[#00326b] uppercase tracking-tight mb-2">Vision Board</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Visualize your dreams across all areas of life</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visionBoardCards.map((card) => (
                <Link 
                  key={card.title}
                  href={card.href}
                  className={`group p-8 rounded-[2.5rem] flex flex-col items-center gap-4 bg-white border-2 border-transparent hover:border-[#00326b]/10 shadow-sm hover:shadow-xl transition-all duration-500`}
                >
                  <div className={`w-16 h-16 rounded-full ${card.color} flex items-center justify-center text-[#0a2f5f] shadow-inner group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-black text-[#0a2f5f] mb-1">{card.title}</span>
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">{card.sub}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-100/[0.5] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Life Architecture Portal © 2026</p>
      </footer>
    </div>
  );
}
