'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { BookOpen, Heart, Activity, Users, Plane, Compass, Save, LucideIcon } from 'lucide-react';

export default function VisionCategoryPage() {
  const params = useParams();
  const category = params.category as string;
  
  const [vision, setVision] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const storageKey = `planning-vision-${category}`;

  useEffect(() => {
    let ignore = false;
    
    async function load() {
      setLoading(true);
      const { data: metadata, error } = await supabase
        .from('opus_metadata')
        .select('value')
        .eq('key', storageKey)
        .single();
      
      if (ignore) return;
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching vision:', error);
      } else if (metadata?.value) {
        setVision(metadata.value.content || '');
      } else {
        setVision('');
      }
      setLoading(false);
    }

    load();
    return () => { ignore = true; };
  }, [category, storageKey]);

  const categoryConfigs: Record<string, { title: string; icon: LucideIcon; color: string }> = {
    learning: { title: 'Learning', icon: BookOpen, color: 'bg-[#99B3C5]' },
    living: { title: 'Living Space', icon: Heart, color: 'bg-[#FFA1AB]' },
    growth: { title: 'Growth', icon: Activity, color: 'bg-[#FFC68D]' },
    relationships: { title: 'Relationships', icon: Users, color: 'bg-[#9ADBDE]' },
    travel: { title: 'Travel & Play', icon: Plane, color: 'bg-[#99B3C5]' },
    wellbeing: { title: 'Well-being', icon: Activity, color: 'bg-[#FFA1AB]' }
  };

  const config = categoryConfigs[category] || { 
    title: category.charAt(0).toUpperCase() + category.slice(1),
    icon: Compass,
    color: 'bg-[#99B3C5]'
  };

  const { title, icon, color } = config;

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
    <div className="p-4 md:p-6 max-w-5xl mx-auto bg-[#fdfdfd] min-h-screen font-handwriting">

      <section className="relative bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${color}`}></div>
        <div className="absolute top-10 left-10 opacity-5">
          {React.createElement(icon, { size: 120, className: "text-[#0a2f5f]" })}
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a2f5f]"></div>
            <div className="text-sm font-black tracking-wider text-[#0a2f5f]">Accessing Vision Board...</div>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-100 opacity-50"></div>
              <textarea 
                placeholder={`Describe your ideal ${title.toLowerCase()}... What does it look like? How does it feel?`}
                className="w-full min-h-[500px] p-8 bg-[#fdfbf7] border-2 border-[#e6e2d3] rounded-2xl text-sm leading-[3rem] focus:ring-0 outline-none shadow-inner resize-none text-[#0a2f5f]/80"
                style={{ backgroundImage: 'linear-gradient(#e6e2d3 1px, transparent 1px)', backgroundSize: '100% 3rem' }}
                value={vision}
                onChange={(e) => setVision(e.target.value)}
              ></textarea>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button 
                onClick={saveVision}
                disabled={saving}
                className="group flex items-center gap-3 px-12 py-5 bg-[#0a2f5f] text-white font-black text-sm tracking-wider rounded-2xl hover:bg-[#0a2f5f] transition-all disabled:opacity-50 shadow-2xl shadow-[#0a2f5f]/20"
              >
                {saving ? 'Processing...' : 'Certify Vision'}
                <Save size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        )}
        
        <div className="absolute -bottom-20 -right-20 text-[20rem] opacity-[0.02] pointer-events-none font-black text-[#0a2f5f]">
          {title}
        </div>
      </section>

      <footer className="mt-12 py-8 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-sm font-black tracking-widest">Strategic Vision Registry © 2026</p>
      </footer>
    </div>
  );
}
