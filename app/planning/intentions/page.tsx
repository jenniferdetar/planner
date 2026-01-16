'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Intention {
  text: string;
  category: string;
}

export default function IntentionsPage() {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const storageKey = 'planning-intentions';

  useEffect(() => {
    fetchIntentions();
  }, []);

  async function fetchIntentions() {
    setLoading(true);
    const { data: metadata, error } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', storageKey)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching intentions:', error);
    } else if (metadata?.value) {
      setIntentions(metadata.value.intentions || []);
    }
    setLoading(false);
  }

  async function saveIntentions(newIntentions: Intention[]) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: storageKey,
        value: { intentions: newIntentions },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) {
      console.error('Error saving intentions:', error);
    }
    setSaving(false);
  }

  const addIntention = () => {
    setIntentions([...intentions, { text: '', category: 'Personal' }]);
  };

  const updateIntention = (index: number, field: keyof Intention, value: string) => {
    const next = [...intentions];
    next[index] = { ...next[index], [field]: value };
    setIntentions(next);
  };

  const removeIntention = (index: number) => {
    const next = intentions.filter((_, i) => i !== index);
    setIntentions(next);
    saveIntentions(next);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0f3d91]">Intentions</h1>
          <p className="text-gray-600">Dreams and big ideas for your future</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => saveIntentions(intentions)}
            disabled={saving}
            className="px-6 py-2 bg-[#0f3d91] text-white rounded-full font-bold hover:bg-[#0a2f5f] transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Intentions'}
          </button>
          <Link href="/planning" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
            Back
          </Link>
        </div>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-gray-500 italic">Loading intentions...</div>
        ) : (
          <>
            {intentions.map((intention, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border shadow-sm flex gap-4 items-start group">
                <div className="flex-1 space-y-2">
                  <input 
                    type="text"
                    value={intention.category}
                    onChange={(e) => updateIntention(index, 'category', e.target.value)}
                    placeholder="Category (e.g. Travel, Career)"
                    className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-transparent border-none p-0 focus:ring-0 w-full"
                  />
                  <textarea 
                    value={intention.text}
                    onChange={(e) => updateIntention(index, 'text', e.target.value)}
                    placeholder="Describe your intention..."
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg text-gray-800 placeholder:text-gray-300 min-h-[60px] resize-none"
                  />
                </div>
                <button 
                  onClick={() => removeIntention(index)}
                  className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button 
              onClick={addIntention}
              className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-[#0f3d91] hover:text-[#0f3d91] transition-all bg-white/50"
            >
              + Add a New Intention
            </button>
          </>
        )}
      </div>
    </div>
  );
}
