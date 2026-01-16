'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function MissionPage() {
  const [mission, setMission] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const storageKey = 'planning-mission';

  useEffect(() => {
    fetchMission();
  }, []);

  async function fetchMission() {
    setLoading(true);
    const { data: metadata, error } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', storageKey)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching mission:', error);
    } else if (metadata?.value) {
      setMission(metadata.value.content || '');
    }
    setLoading(false);
  }

  async function saveMission() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: storageKey,
        value: { content: mission },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) {
      console.error('Error saving mission:', error);
    }
    setSaving(false);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0f3d91]">Personal Mission Statement</h1>
          <p className="text-gray-600">Your purpose and values</p>
        </div>
        <Link href="/planning" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
          Back to Planning
        </Link>
      </header>

      <section className="bg-white p-8 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-[#0f3d91]">My Mission</h2>
        {loading ? (
          <div className="text-center text-gray-500 py-12 italic">Loading mission...</div>
        ) : (
          <>
            <textarea 
              placeholder="What is your purpose? What values drive you? Write your mission statement here..."
              className="w-full min-h-[300px] p-6 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#0f3d91] outline-none text-lg leading-relaxed"
              value={mission}
              onChange={(e) => setMission(e.target.value)}
            ></textarea>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={saveMission}
                disabled={saving}
                className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${saving ? 'bg-gray-400' : 'bg-[#0f3d91] hover:bg-[#0a2f5f]'}`}
              >
                {saving ? 'Saving...' : 'Save Mission Statement'}
              </button>
            </div>
          </>
        )}
      </section>

      <footer className="mt-12 text-center text-gray-400 italic">
        "The key is not to prioritize what's on your schedule, but to schedule your priorities."
      </footer>
    </div>
  );
}
