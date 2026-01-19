'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Award, Search, FileText, CheckCircle2, Target, Zap, Sparkles } from 'lucide-react';

interface Review {
  month: string;
  // Legacy fields (v1)
  wins?: string;
  challenges?: string;
  lessons?: string;
  focusNextMonth?: string;
  // High-fidelity fields (v2)
  biggestWin?: string;
  doneDifferently?: string;
  funActivities?: string;
  changeToContinue?: string;
  managedWell?: string;
  nextMonthGoal?: string;
  lookingForward?: string;
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReview, setActiveReview] = useState<Review>({
    month: new Date().toLocaleDateString('en-Us', { month: 'long', year: 'numeric' }),
    biggestWin: '',
    doneDifferently: '',
    funActivities: '',
    changeToContinue: '',
    managedWell: '',
    nextMonthGoal: '',
    lookingForward: ''
  });

  const storageKey = 'planning-monthly-reviews';
  
  useEffect(() => {
    let ignore = false;
    
    async function load() {
      // loading is true by default
      const { data: metadata, error } = await supabase
        .from('opus_metadata')
        .select('value')
        .eq('key', storageKey)
        .single();
      
      if (ignore) return;
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching reviews:', error);
      } else if (metadata?.value) {
        const allReviews = (metadata.value.reviews as Review[] || []).map((r: Review) => ({
          ...r,
          biggestWin: r.biggestWin || r.wins || '',
          doneDifferently: r.doneDifferently || r.challenges || '',
          nextMonthGoal: r.nextMonthGoal || r.focusNextMonth || '',
          funActivities: r.funActivities || '',
          changeToContinue: r.changeToContinue || '',
          managedWell: r.managedWell || '',
          lookingForward: r.lookingForward || ''
        }));
        setReviews(allReviews);
        
        const currentMonth = new Date().toLocaleDateString('en-Us', { month: 'long', year: 'numeric' });
        const existing = allReviews.find((r: Review) => r.month === currentMonth);
        if (existing) {
          setActiveReview(existing);
        }
      }
      setLoading(false);
    }

    load();
    return () => { ignore = true; };
  }, [storageKey]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">

      <section className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#FFA1AB]"></div>
        
        <div className="bg-[#FFA1AB]/5 p-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-[#0a2f5f] tracking-tight">{activeReview.month} Reflection</h2>
            <p className="text-sm font-black text-[#FFA1AB] tracking-wider mt-1">Official Performance Record</p>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl border border-[#FFA1AB]/20 text-sm font-black text-[#0a2f5f] tracking-wider shadow-sm">
            Draft Mode
          </div>
        </div>
        
        {loading ? (
          <div className="p-20 text-center text-gray-400 italic font-serif text-xl">Loading archived reviews...</div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="text-[#FFA1AB]" size={20} />
                  <label className="text-sm font-black text-gray-400 tracking-wider">Biggest Win This Month</label>
                </div>
                <textarea 
                  value={activeReview.biggestWin}
                  onChange={(e) => setActiveReview({...activeReview, biggestWin: e.target.value})}
                  placeholder="Analyze your successes..."
                  className="w-full min-h-[150px] p-4 bg-slate-50 border-2 border-transparent focus:border-[#FFA1AB]/20 rounded-2xl outline-none font-serif text-lg text-[#0a2f5f] transition-all"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="text-[#99B3C5]" size={20} />
                  <label className="text-sm font-black text-gray-400 tracking-wider">Wish I&apos;d Done Differently</label>
                </div>
                <textarea 
                  value={activeReview.doneDifferently}
                  onChange={(e) => setActiveReview({...activeReview, doneDifferently: e.target.value})}
                  placeholder="Identify areas for adjustment..."
                  className="w-full min-h-[150px] p-4 bg-slate-50 border-2 border-transparent focus:border-[#99B3C5]/20 rounded-2xl outline-none font-serif text-lg text-[#0a2f5f] transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="text-[#FFC68D]" size={20} />
                  <label className="text-sm font-black text-gray-400 tracking-wider">Fun Personal or Professional Moments</label>
                </div>
                <textarea 
                  value={activeReview.funActivities}
                  onChange={(e) => setActiveReview({...activeReview, funActivities: e.target.value})}
                  placeholder="Document high-joy activities..."
                  className="w-full min-h-[120px] p-4 bg-[#fdfbf7] border-2 border-[#e6e2d3] rounded-2xl outline-none font-serif text-lg text-[#0a2f5f] transition-all"
                  style={{ backgroundImage: 'linear-gradient(#e6e2d3 1px, transparent 1px)', backgroundSize: '100% 2.5rem' }}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-[#9ADBDE]" size={20} />
                  <label className="text-sm font-black text-gray-400 tracking-wider">Change to Continue</label>
                </div>
                <textarea 
                  value={activeReview.changeToContinue}
                  onChange={(e) => setActiveReview({...activeReview, changeToContinue: e.target.value})}
                  placeholder="Positive habits to maintain..."
                  className="w-full min-h-[150px] p-4 bg-slate-50 border-2 border-transparent focus:border-[#9ADBDE]/20 rounded-2xl outline-none font-serif text-lg text-[#0a2f5f] transition-all"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="text-[#0a2f5f]" size={20} />
                  <label className="text-sm font-black text-gray-400 tracking-wider">Managed Well</label>
                </div>
                <textarea 
                  value={activeReview.managedWell}
                  onChange={(e) => setActiveReview({...activeReview, managedWell: e.target.value})}
                  placeholder="Operational successes..."
                  className="w-full min-h-[150px] p-4 bg-slate-50 border-2 border-transparent focus:border-[#0a2f5f]/10 rounded-2xl outline-none font-serif text-lg text-[#0a2f5f] transition-all"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="text-[#FFA1AB]" size={20} />
                  <label className="text-sm font-black text-gray-400 tracking-wider">Next Month&apos;s Biggest Goal</label>
                </div>
                <textarea 
                  value={activeReview.nextMonthGoal}
                  onChange={(e) => setActiveReview({...activeReview, nextMonthGoal: e.target.value})}
                  placeholder="Define primary objective..."
                  className="w-full min-h-[150px] p-4 bg-[#0a2f5f]/5 border-2 border-[#0a2f5f]/10 rounded-2xl outline-none font-serif text-lg text-[#0a2f5f] transition-all"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[#FFC68D]" size={20} />
                  <label className="text-sm font-black text-gray-400 tracking-wider">Looking Forward To</label>
                </div>
                <textarea 
                  value={activeReview.lookingForward}
                  onChange={(e) => setActiveReview({...activeReview, lookingForward: e.target.value})}
                  placeholder="Future aspirations..."
                  className="w-full min-h-[150px] p-4 bg-slate-50 border-2 border-transparent focus:border-slate-100 rounded-2xl outline-none font-serif text-lg text-[#0a2f5f] transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {reviews.length > 0 && (
        <section className="pb-12">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="text-[#0a2f5f]" size={24} />
            <h3 className="text-2xl font-black text-[#0a2f5f] tracking-tight">Archives</h3>
            <div className="h-px flex-grow bg-gradient-to-r from-[#0a2f5f]/20 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {reviews.map((r, i) => (
              <button 
                key={i}
                onClick={() => setActiveReview(r)}
                className={`group p-8 rounded-2xl text-left transition-all duration-500 border-2 ${
                  activeReview.month === r.month 
                  ? 'bg-[#0a2f5f] border-[#0a2f5f] text-white shadow-2xl shadow-[#0a2f5f]/20 scale-105' 
                  : 'bg-white border-gray-100 hover:border-[#FFA1AB]/30 text-[#0a2f5f] hover:shadow-xl'
                }`}
              >
                <span className={`block text-sm font-black tracking-wider mb-2 ${activeReview.month === r.month ? 'text-white/60' : 'text-[#FFA1AB]'}`}>
                  {r.month.split(' ')[1]}
                </span>
                <span className="block text-xl font-black mb-4">{r.month.split(' ')[0]}</span>
                <div className={`text-sm font-black tracking-wider ${activeReview.month === r.month ? 'text-white/40' : 'text-gray-300'}`}>
                  {r.biggestWin && r.biggestWin.length > 0 ? 'Verified Archive' : 'Open Draft'}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-8 py-8 border-t border-gray-100 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] opacity-[0.02] pointer-events-none font-black text-[#0a2f5f]">
          Review
        </div>
        <p className="text-gray-400 text-sm font-black tracking-widest relative z-10">Monthly Performance Audit © 2026</p>
      </footer>
    </div>
  );
}
