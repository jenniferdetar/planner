'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

import { Save, ShieldCheck, Target, Quote } from 'lucide-react';

export default function MissionPage() {
  const [mission, setMission] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const storageKey = 'planning-mission';

  const fetchMission = useCallback(async (ignore = false) => {
    const { data: metadata, error } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', storageKey)
      .single();
    
    if (!ignore) {
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching mission:', error);
      } else if (metadata?.value) {
        setMission(metadata.value.content || '');
      }
      setLoading(false);
    }
  }, [storageKey]);

  useEffect(() => {
    let ignore = false;
    const timeoutId = setTimeout(() => {
      fetchMission(ignore);
    }, 0);
    return () => { 
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [fetchMission]);

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

      <section className="relative group mb-12">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#0a2f5f] to-[#5d84b2] rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-white p-8 md:p-12 rounded-3xl border-2 border-[#0a2f5f]/5 shadow-2xl overflow-hidden">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0a2f5f]/5 rounded-bl-[5rem] flex items-center justify-center pointer-events-none">
            <Quote className="text-[#0a2f5f]/10 -rotate-12" size={48} />
          </div>

          <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0a2f5f]">
                <Target size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#0a2f5f] tracking-tight">Core Directive</h2>
                <p className="text-sm font-bold text-gray-400 tracking-wider">Personal Values & Purpose Archive</p>
              </div>
            </div>
            <div className="hidden md:block text-sm font-black tracking-wider text-[#0a2f5f]/20 bg-gray-50 px-4 py-2 rounded-full border">
              Official Record • 2026
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 opacity-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a2f5f]"></div>
              <div className="text-sm font-black tracking-wider text-[#0a2f5f]">Retrieving Purpose...</div>
            </div>
          ) : (
            <div className="relative">
              <textarea 
                placeholder="What is your purpose? What values drive you? Compose your mission statement here..."
                className="w-full min-h-[400px] p-8 bg-[#fdfbf7] border-2 border-[#e6e2d3] rounded-2xl text-xl font-serif leading-[3.5rem] focus:ring-4 focus:ring-[#0a2f5f]/5 outline-none transition-all shadow-inner"
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
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={saveMission}
                  disabled={saving}
                  className="group flex items-center gap-3 px-10 py-4 bg-[#0a2f5f] text-white font-black text-sm tracking-wider rounded-xl hover:bg-[#0a2f5f] transition-all disabled:opacity-50 shadow-2xl shadow-[#0a2f5f]/20"
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
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <Quote size={24} />
          </div>
          <div>
            <p className="text-gray-600 font-serif italic text-lg leading-relaxed mb-4">
              &quot;The key is not to prioritize what&apos;s on your schedule, but to schedule your priorities.&quot;
            </p>
            <div className="text-sm font-black tracking-wider text-gray-400">— Stephen Covey</div>
          </div>
        </div>

        <div className="relative group flex justify-center md:justify-end">
          <div className="absolute inset-0 bg-[#0a2f5f] rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative w-40 h-40 rounded-full border-4 border-[#0a2f5f]/10 flex flex-col items-center justify-center p-6 text-center transform rotate-6 group-hover:rotate-0 transition-transform duration-1000">
            <div className="text-sm font-black text-[#0a2f5f]/60 tracking-wider mb-1">Certified</div>
            <div className="w-12 h-px bg-[#0a2f5f]/20 mb-2"></div>
            <div className="text-sm font-bold text-[#0a2f5f]/40 tracking-wider leading-tight">Personal Vision<br/>Records Office</div>
            <div className="mt-2 text-[#0a2f5f]">
              <ShieldCheck size={28} />
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-[#0a2f5f]/5 text-center">
        <p className="text-[#0a2f5f]/20 text-sm font-black tracking-widest">Life Architecture Archive © 2026</p>
      </footer>
    </div>
  );
}
