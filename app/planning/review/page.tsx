'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Review {
  month: string;
  wins: string;
  challenges: string;
  lessons: string;
  focusNextMonth: string;
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeReview, setActiveReview] = useState<Review>({
    month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    wins: '',
    challenges: '',
    lessons: '',
    focusNextMonth: ''
  });

  const storageKey = 'planning-monthly-reviews';

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    const { data: metadata, error } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', storageKey)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching reviews:', error);
    } else if (metadata?.value) {
      const allReviews = metadata.value.reviews || [];
      setReviews(allReviews);
      
      const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const existing = allReviews.find((r: Review) => r.month === currentMonth);
      if (existing) {
        setActiveReview(existing);
      }
    }
    setLoading(false);
  }

  async function saveReview() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updatedReviews = [...reviews.filter(r => r.month !== activeReview.month), activeReview];
    
    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: storageKey,
        value: { reviews: updatedReviews },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) {
      console.error('Error saving review:', error);
    } else {
      setReviews(updatedReviews);
    }
    setSaving(false);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0f3d91]">Monthly Review</h1>
          <p className="text-gray-600">Reflect, recalibrate, and grow</p>
        </div>
        <Link href="/planning" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
          Back
        </Link>
      </header>

      <section className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
        <div className="bg-[#0f3d91] p-6 text-white">
          <h2 className="text-xl font-bold">{activeReview.month} Reflection</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500 italic">Loading review...</div>
        ) : (
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Biggest Wins & Achievements</label>
              <textarea 
                value={activeReview.wins}
                onChange={(e) => setActiveReview({...activeReview, wins: e.target.value})}
                placeholder="What went well this month?"
                className="w-full min-h-[100px] p-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#0f3d91] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Challenges & Obstacles</label>
              <textarea 
                value={activeReview.challenges}
                onChange={(e) => setActiveReview({...activeReview, challenges: e.target.value})}
                placeholder="What was difficult? How did you handle it?"
                className="w-full min-h-[100px] p-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#0f3d91] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Key Lessons Learned</label>
              <textarea 
                value={activeReview.lessons}
                onChange={(e) => setActiveReview({...activeReview, lessons: e.target.value})}
                placeholder="What did this month teach you?"
                className="w-full min-h-[100px] p-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#0f3d91] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Focus for Next Month</label>
              <textarea 
                value={activeReview.focusNextMonth}
                onChange={(e) => setActiveReview({...activeReview, focusNextMonth: e.target.value})}
                placeholder="What are your primary intentions for the coming month?"
                className="w-full min-h-[100px] p-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#0f3d91] outline-none"
              />
            </div>

            <div className="flex justify-end border-t pt-6">
              <button 
                onClick={saveReview}
                disabled={saving}
                className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${saving ? 'bg-gray-400' : 'bg-[#0f3d91] hover:bg-[#0a2f5f]'}`}
              >
                {saving ? 'Saving...' : 'Save Monthly Review'}
              </button>
            </div>
          </div>
        )}
      </section>

      {reviews.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-[#0f3d91] mb-4">Past Reviews</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {reviews.map((r, i) => (
              <button 
                key={i}
                onClick={() => setActiveReview(r)}
                className={`p-4 rounded-xl border text-left transition-all ${activeReview.month === r.month ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'}`}
              >
                <span className="block font-bold text-[#0f3d91]">{r.month}</span>
                <span className="text-xs text-gray-500">{r.wins.length > 0 ? 'Completed' : 'Draft'}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
