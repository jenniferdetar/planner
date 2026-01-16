'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function VisionCategoryPage() {
  const params = useParams();
  const category = params.category as string;
  
  const [vision, setVision] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const storageKey = `planning-vision-${category}`;

  const categoryTitles: Record<string, string> = {
    learning: 'Learning',
    living: 'Living Space',
    growth: 'Growth',
    relationships: 'Relationships',
    travel: 'Travel & Play',
    wellbeing: 'Well-being'
  };

  const title = categoryTitles[category] || category.charAt(0).toUpperCase() + category.slice(1);

  useEffect(() => {
    fetchVision();
  }, [category]);

  async function fetchVision() {
    setLoading(true);
    const { data: metadata, error } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', storageKey)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching vision:', error);
    } else if (metadata?.value) {
      setVision(metadata.value.content || '');
    } else {
      setVision('');
    }
    setLoading(false);
  }

  async function saveVision() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: storageKey,
        value: { content: vision },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) {
      console.error('Error saving vision:', error);
    }
    setSaving(false);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0f3d91]">Vision: {title}</h1>
          <p className="text-gray-600">Visualize your dreams for your {title.toLowerCase()}</p>
        </div>
        <Link href="/planning" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
          Back
        </Link>
      </header>

      <section className="bg-white p-8 rounded-xl border shadow-sm">
        {loading ? (
          <div className="text-center text-gray-500 py-12 italic">Loading your vision...</div>
        ) : (
          <>
            <textarea 
              placeholder={`Describe your ideal ${title.toLowerCase()}... What does it look like? How does it feel?`}
              className="w-full min-h-[400px] p-6 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#0f3d91] outline-none text-lg leading-relaxed"
              value={vision}
              onChange={(e) => setVision(e.target.value)}
            ></textarea>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={saveVision}
                disabled={saving}
                className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${saving ? 'bg-gray-400' : 'bg-[#0f3d91] hover:bg-[#0a2f5f]'}`}
              >
                {saving ? 'Saving...' : 'Save Vision'}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
