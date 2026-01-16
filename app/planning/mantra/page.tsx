'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronLeft, Zap, Save, Sun, Moon, Quote, Sparkles } from 'lucide-react';

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
    <div className="p-4 md:p-8 max-w-4xl mx-auto bg-[#fdfdfd] min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#00326b] flex items-center justify-center shadow-lg transform rotate-6">
              <Zap className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-black text-[#00326b] tracking-tight uppercase">Daily Mantra</h1>
          </div>
          <p className="text-gray-400 font-bold tracking-widest text-xs uppercase">Your core focus & intention for the cycle</p>
        </div>
        <div className="flex gap-4">
          <Link href="/planning" className="flex items-center gap-2 px-6 py-2 bg-white border-2 border-[#00326b]/10 rounded-full font-bold text-[#00326b] hover:bg-[#00326b]/5 transition-all shadow-sm">
            <ChevronLeft size={20} />
            Back to Hub
          </Link>
        </div>
      </header>

      <section className="relative group mb-12">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#00326b] via-[#5d84b2] to-[#9ad4f2] rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-white p-12 md:p-20 rounded-[3rem] border-2 border-[#00326b]/5 shadow-2xl text-center overflow-hidden">
          <div className="absolute top-10 left-10 opacity-5">
            <Quote size={80} className="text-[#00326b]" />
          </div>
          <div className="absolute bottom-10 right-10 opacity-5 rotate-180">
            <Quote size={80} className="text-[#00326b]" />
          </div>
          
          <div className="relative z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00326b]"></div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#00326b]">Channeling Intent...</div>
              </div>
            ) : (
              <>
                <textarea 
                  placeholder="What is your focus today? What intent do you want to carry?"
                  className="w-full min-h-[250px] bg-transparent border-none text-center text-4xl md:text-5xl font-serif font-black text-[#00326b] placeholder:text-gray-100 outline-none leading-tight resize-none italic"
                  value={mantra}
                  onChange={(e) => setMantra(e.target.value)}
                ></textarea>
                
                <div className="mt-12 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-400" size={20} />
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#00326b]/10 to-transparent"></div>
                    <Sparkles className="text-amber-400" size={20} />
                  </div>
                  
                  <button 
                    onClick={saveMantra}
                    disabled={saving}
                    className="group flex items-center gap-3 px-12 py-4 bg-[#00326b] text-white font-black text-sm uppercase tracking-[0.2em] rounded-full hover:bg-[#0a2f5f] transition-all disabled:opacity-50 shadow-2xl shadow-[#00326b]/20"
                  >
                    {saving ? 'Saving...' : 'Set Mantra'}
                    <Save size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#00326b] to-[#5d84b2] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
              <Sun size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-60">Morning Reflection</h3>
              <p className="text-sm font-medium leading-relaxed opacity-90">
                Recite your mantra first thing in the morning to set your tone and align your actions with your core purpose.
              </p>
            </div>
          </div>
          <Sun className="absolute -bottom-10 -right-10 text-[10rem] opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        </div>

        <div className="bg-[#f8fafc] p-8 rounded-[2.5rem] border-2 border-gray-50 flex items-start gap-4 group">
          <div className="w-10 h-10 rounded-2xl bg-[#00326b]/5 flex items-center justify-center shadow-inner group-hover:-rotate-12 transition-transform">
            <Moon className="text-[#00326b]" size={20} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#00326b]/40 mb-2">Evening Calm</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Reflect on how your mantra guided your decisions throughout the day. Acknowledge your alignment and recalibrate for tomorrow.
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.5em]">Intentional Living Portal © 2026</p>
      </footer>
    </div>
  );
}
