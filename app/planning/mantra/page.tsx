'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function MantraPage() {
  const [mantra, setMantra] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const storageKey = 'planning-mantra';

  useEffect(() => {
    fetchMantra();
  }, []);

  async function fetchMantra() {
    setLoading(true);
    const { data: metadata, error } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', storageKey)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching mantra:', error);
    } else if (metadata?.value) {
      setMantra(metadata.value.content || '');
    }
    setLoading(false);
  }

  async function saveMantra() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: storageKey,
        value: { content: mantra },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) {
      console.error('Error saving mantra:', error);
    }
    setSaving(false);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0f3d91]">Daily Mantra</h1>
          <p className="text-gray-600">Daily focus and intent</p>
        </div>
        <Link href="/planning" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
          Back to Planning
        </Link>
      </header>

      <section className="bg-white p-8 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-[#0f3d91]">My Daily Mantra</h2>
        {loading ? (
          <div className="text-center text-gray-500 py-12 italic">Loading mantra...</div>
        ) : (
          <>
            <textarea 
              placeholder="What is your focus today? What intent do you want to carry? Write your daily mantra here..."
              className="w-full min-h-[200px] p-6 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#0f3d91] outline-none text-2xl text-center font-serif leading-relaxed"
              value={mantra}
              onChange={(e) => setMantra(e.target.value)}
            ></textarea>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={saveMantra}
                disabled={saving}
                className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${saving ? 'bg-gray-400' : 'bg-[#0f3d91] hover:bg-[#0a2f5f]'}`}
              >
                {saving ? 'Saving...' : 'Save Mantra'}
              </button>
            </div>
          </>
        )}
      </section>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 className="font-bold text-[#0f3d91] mb-2">Morning Reflection</h3>
          <p className="text-sm text-gray-600">Recite your mantra first thing in the morning to set your tone for the day.</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 className="font-bold text-[#0f3d91] mb-2">Evening Calm</h3>
          <p className="text-sm text-gray-600">Reflect on how your mantra guided your actions and decisions throughout the day.</p>
        </div>
      </div>
    </div>
  );
}
