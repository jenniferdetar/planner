'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen, Heart, Activity, Users, Plane, ChevronLeft, Compass, Save } from 'lucide-react';
import HubHeader from '@/components/HubHeader';

export default function VisionCategoryPage() {
  const params = useParams();
  const category = params.category as string;
  
  const [vision, setVision] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const storageKey = `planning-vision-${category}`;

  const categoryConfigs: Record<string, { title: string; icon: any; color: string }> = {
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto bg-[#fdfdfd] min-h-screen">
      <HubHeader 
        title={`Vision: ${title}`} 
        subtitle={`Visualize your dreams for your ${title.toLowerCase()}`} 
        icon={icon} 
        iconBgColor={color}
        hideHubSuffix={true}
      >
        <Link 
          href="/planning" 
          className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all"
        >
          <ChevronLeft size={16} />
          Back
        </Link>
      </HubHeader>

      <section className="relative bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${color}`}></div>
        <div className="absolute top-10 left-10 opacity-5">
          {React.createElement(icon, { size: 120, className: "text-[#0a2f5f]" })}
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a2f5f]"></div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#0a2f5f]">Accessing Vision Board...</div>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-100 opacity-50"></div>
              <textarea 
                placeholder={`Describe your ideal ${title.toLowerCase()}... What does it look like? How does it feel?`}
                className="w-full min-h-[500px] p-12 bg-[#fdfbf7] border-2 border-[#e6e2d3] rounded-[3rem] text-2xl font-serif leading-[3rem] focus:ring-0 outline-none shadow-inner resize-none text-[#0a2f5f]/80"
                style={{ backgroundImage: 'linear-gradient(#e6e2d3 1px, transparent 1px)', backgroundSize: '100% 3rem' }}
                value={vision}
                onChange={(e) => setVision(e.target.value)}
              ></textarea>
            </div>
            
            <div className="mt-12 flex justify-center">
              <button 
                onClick={saveVision}
                disabled={saving}
                className="group flex items-center gap-3 px-12 py-5 bg-[#0a2f5f] text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-[#0a2f5f] transition-all disabled:opacity-50 shadow-2xl shadow-[#0a2f5f]/20"
              >
                {saving ? 'Processing...' : 'Certify Vision'}
                <Save size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        )}
        
        <div className="absolute -bottom-20 -right-20 text-[20rem] opacity-[0.02] pointer-events-none font-black text-[#0a2f5f] uppercase">
          {title}
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Strategic Vision Registry © 2026</p>
      </footer>
    </div>
  );
}
