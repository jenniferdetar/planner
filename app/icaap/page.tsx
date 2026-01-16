'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const icaapLinks = [
  {
    href: '/icaap/pay-log',
    icon: '🧾',
    label: 'Pay Log',
    sub: 'Track earnings & hours',
    color: 'bg-[#99B3C5]'
  },
  {
    href: '/icaap/hours',
    icon: '⏱️',
    label: 'Hours Worked',
    sub: 'Monthly breakdown',
    color: 'bg-[#FFA1AB]'
  },
  {
    href: '/icaap/notes',
    icon: '📝',
    label: 'Notes',
    sub: 'iCAAP records',
    color: 'bg-[#FFC68D]'
  },
  {
    href: '/icaap/forms',
    icon: '📋',
    label: 'Forms',
    sub: 'Transcript requests & more',
    color: 'bg-[#9ADBDE]'
  }
];

export default function IcaapPage() {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const storageKey = 'icaap-general-notes';

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setLoading(true);
    const { data: metadata, error } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', storageKey)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching ICAAP notes:', error);
    } else if (metadata?.value) {
      setNotes(metadata.value.content || '');
    }
    setLoading(false);
  }

  async function saveNotes() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: storageKey,
        value: { content: notes },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) {
      console.error('Error saving ICAAP notes:', error);
    }
    setSaving(false);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#00326b]">iCAAP Hub</h1>
        <p className="text-gray-600">Internship & Career Advancement Program Tracking</p>
      </header>

      <div className="bg-gradient-to-r from-[#00326b] via-[#5d84b2] to-[#9ad1d6] rounded-xl p-8 mb-8 text-white shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Advance Your Career</h2>
          <p className="text-lg opacity-90">Manage your hours, pay, and professional documents.</p>
        </div>
        <div className="text-5xl">🎓</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {icaapLinks.map((link) => (
          <div 
            key={link.href}
            className={`flex items-center gap-4 p-4 rounded-full border-2 border-blue-50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer ${link.color} bg-opacity-90`}
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-inner shrink-0">
              {link.icon}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#0a2f5f] text-sm">{link.label}</span>
              <span className="text-[10px] text-[#0a2f5f]/80 font-bold uppercase">{link.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-12 bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-[#00326b]">General Notes</h2>
        {loading ? (
          <div className="text-center text-gray-500 py-8 italic">Loading notes...</div>
        ) : (
          <>
            <textarea 
              placeholder="Add iCAAP follow-ups or reminders here..."
              className="w-full min-h-[150px] p-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#00326b] outline-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={saveNotes}
                disabled={saving}
                className="px-6 py-2 bg-[#99B3C5] text-[#0a2f5f] font-bold rounded-lg hover:bg-[#86a0b2] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
