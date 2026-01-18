'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronLeft, Zap, Save, Sun, Moon, Quote, Sparkles } from 'lucide-react';

import HubHeader from '@/components/HubHeader';

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
      <HubHeader 
        title="Daily Mantra" 
        subtitle="Your core focus & intention for the cycle" 
        icon={Zap} 
        iconBgColor="bg-[#0a2f5f]"
        hideHubSuffix={true}
      >
        <Link href="/planning" className="flex items-center gap-2 px-6 py-2 bg-white border-2 border-[#0a2f5f]/10 rounded-full font-bold text-[#0a2f5f] hover:bg-[#0a2f5f]/5 transition-all shadow-sm">
          <ChevronLeft size={20} />
          Back to Hub
        </Link>
      </HubHeader>

      <section className="relative group mb-12">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#0a2f5f] via-[#5d84b2] to-[#9ad4f2] rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-white p-12 md:p-20 rounded-[3rem] border-2 border-[#0a2f5f]/5 shadow-2xl text-center overflow-hidden">
          <div className="absolute top-10 left-10 opacity-5">
            <Quote size={80} className="text-[#0a2f5f]" />
          </div>
          <div className="absolute bottom-10 right-10 opacity-5 rotate-180">
            <Quote size={80} className="text-[#0a2f5f]" />
          </div>
          
          <div className="relative z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a2f5f]"></div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#0a2f5f]">Channeling Intent...</div>
              </div>
            ) : (
              <>
                <textarea 
                  placeholder="What is your focus today? What intent do you want to carry?"
                  className="w-full min-h-[250px] bg-transparent border-none text-center text-4xl md:text-5xl font-serif font-black text-[#0a2f5f] placeholder:text-gray-100 outline-none leading-tight resize-none italic"
                  value={mantra}
                  onChange={(e) => setMantra(e.target.value)}
                ></textarea>
                
                <div className="mt-12 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-400" size={20} />
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#0a2f5f]/10 to-transparent"></div>
                    <Sparkles className="text-amber-400" size={20} />
                  </div>
                  
                  <button 
                    onClick={saveMantra}
                    disabled={saving}
                    className="group flex items-center gap-3 px-12 py-4 bg-[#0a2f5f] text-white font-black text-sm uppercase tracking-[0.2em] rounded-full hover:bg-[#0a2f5f] transition-all disabled:opacity-50 shadow-2xl shadow-[#0a2f5f]/20"
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
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#99B3C5] opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#99B3C5] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform text-[#0a2f5f]">
              <Sun size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-2 text-gray-400">Morning Reflection</h3>
              <p className="text-sm font-medium leading-relaxed text-gray-600">
                Recite your mantra first thing in the morning to set your tone and align your actions with your core purpose.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FFA1AB] opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFA1AB] flex items-center justify-center shadow-inner group-hover:-rotate-12 transition-transform text-[#0a2f5f]">
              <Moon size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Evening Calm</h3>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">
                Reflect on how your mantra guided your decisions throughout the day. Acknowledge your alignment and recalibrate for tomorrow.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.5em]">Intentional Living Portal © 2026</p>
      </footer>
    </div>
  );
}
