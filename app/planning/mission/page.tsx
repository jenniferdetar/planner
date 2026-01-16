'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronLeft, Scroll, Save, ShieldCheck, Target, Quote } from 'lucide-react';

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
    <div className="p-4 md:p-8 max-w-5xl mx-auto bg-[#fdfbf7] min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#00326b] flex items-center justify-center shadow-lg transform -rotate-3">
              <Scroll className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-bold text-[#00326b] font-handwriting">Mission Statement</h1>
          </div>
          <p className="text-gray-500 italic font-serif tracking-wide">"Defining purpose, values, and the architecture of life"</p>
        </div>
        <div className="flex gap-4">
          <Link href="/planning" className="flex items-center gap-2 px-6 py-2 bg-white border-2 border-[#00326b]/10 rounded-full font-bold text-[#00326b] hover:bg-[#00326b]/5 transition-all shadow-sm">
            <ChevronLeft size={20} />
            Back to Hub
          </Link>
        </div>
      </header>

      <section className="relative group mb-16">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#00326b] to-[#5d84b2] rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-white p-10 md:p-16 rounded-[3rem] border-2 border-[#00326b]/5 shadow-2xl overflow-hidden">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00326b]/5 rounded-bl-[5rem] flex items-center justify-center pointer-events-none">
            <Quote className="text-[#00326b]/10 -rotate-12" size={48} />
          </div>

          <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#00326b]">
                <Target size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#00326b] uppercase tracking-tight">Core Directive</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Personal Values & Purpose Archive</p>
              </div>
            </div>
            <div className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-[#00326b]/20 bg-gray-50 px-4 py-2 rounded-full border">
              Official Record • 2026
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00326b]"></div>
              <div className="text-xs font-black uppercase tracking-widest text-[#00326b]">Retrieving Purpose...</div>
            </div>
          ) : (
            <div className="relative">
              <textarea 
                placeholder="What is your purpose? What values drive you? Compose your mission statement here..."
                className="w-full min-h-[450px] p-10 bg-[#fdfbf7] border-2 border-[#e6e2d3] rounded-3xl text-2xl font-serif leading-[3.5rem] focus:ring-4 focus:ring-[#00326b]/5 outline-none transition-all shadow-inner"
                style={{ 
                  backgroundImage: 'linear-gradient(#e6e2d3 1px, transparent 1px)', 
                  backgroundSize: '100% 3.5rem',
                  paddingTop: '3rem'
                }}
                value={mission}
                onChange={(e) => setMission(e.target.value)}
              ></textarea>
              {/* Vertical red line for notebook feel */}
              <div className="absolute top-0 left-16 bottom-0 w-0.5 bg-red-200/40"></div>
              
              <div className="mt-12 flex justify-end">
                <button 
                  onClick={saveMission}
                  disabled={saving}
                  className="group flex items-center gap-3 px-12 py-5 bg-[#00326b] text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-[#0a2f5f] transition-all disabled:opacity-50 shadow-2xl shadow-[#00326b]/20"
                >
                  {saving ? 'Archiving...' : 'Finalize Statement'}
                  <Save size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <Quote size={24} />
          </div>
          <div>
            <p className="text-gray-600 font-serif italic text-lg leading-relaxed mb-4">
              "The key is not to prioritize what's on your schedule, but to schedule your priorities."
            </p>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">— Stephen Covey</div>
          </div>
        </div>

        <div className="relative group flex justify-center md:justify-end">
          <div className="absolute inset-0 bg-[#00326b] rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative w-44 h-44 rounded-full border-4 border-[#00326b]/10 flex flex-col items-center justify-center p-6 text-center transform rotate-6 group-hover:rotate-0 transition-transform duration-1000">
            <div className="text-[10px] font-black text-[#00326b]/60 uppercase tracking-[0.2em] mb-1">Certified</div>
            <div className="w-12 h-px bg-[#00326b]/20 mb-2"></div>
            <div className="text-[8px] font-bold text-[#00326b]/40 uppercase tracking-widest leading-tight">Personal Vision<br/>Records Office</div>
            <div className="mt-2 text-[#00326b]">
              <ShieldCheck size={28} />
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-[#00326b]/5 text-center">
        <p className="text-[#00326b]/20 text-[10px] font-black uppercase tracking-[0.5em]">Life Architecture Archive © 2026</p>
      </footer>
    </div>
  );
}
