'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Sparkles, ChevronLeft, Save, Trash2, Plus, Target, Heart, Zap, Scroll } from 'lucide-react';

interface Intention {
  text: string;
  category: string;
}

interface VisionData {
  workVision: string;
  loves: string[];
  favoriteThing: string;
  didntEnjoy: string;
  simplyFun: string;
  dreamFinancially: string;
  dreamPhysically: string;
  dreamEmotionally: string;
  dreamSpiritually: string;
  focusOn: string;
  energyOn: string;
  lessTimeOn: string;
  dreamBigAbout: string;
  worthItBecause: string;
}

const LOVE_OPTIONS = [
  'Creative', 'Energetic', 'Fun', 'Quiet', 'Generous', 'Loud', 'Encouraging', 
  'Involved', 'Reliable', 'Genuine', 'Independent', 'Curious', 'Excited', 
  'Valuable', 'A leader', 'Servant-hearted'
];

const STORAGE_KEY = 'planning-intentions-v2';
const LEGACY_STORAGE_KEY = 'planning-intentions';

export default function IntentionsPage() {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [vision, setVision] = useState<VisionData>({
    workVision: '',
    loves: [],
    favoriteThing: '',
    didntEnjoy: '',
    simplyFun: '',
    dreamFinancially: '',
    dreamPhysically: '',
    dreamEmotionally: '',
    dreamSpiritually: '',
    focusOn: '',
    energyOn: '',
    lessTimeOn: '',
    dreamBigAbout: '',
    worthItBecause: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    // Fetch new v2 data
    const { data: metadata, error } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', STORAGE_KEY)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching vision data:', error);
    } else if (metadata?.value) {
      setVision(metadata.value.vision || vision);
      setIntentions(metadata.value.intentions || []);
    } else {
      // Try legacy key
      const { data: legacyMetadata } = await supabase
        .from('opus_metadata')
        .select('value')
        .eq('key', LEGACY_STORAGE_KEY)
        .single();
      
      if (legacyMetadata?.value) {
        setIntentions(legacyMetadata.value.intentions || []);
      }
    }
    setLoading(false);
  }, [vision]);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      if (!ignore) fetchData();
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [fetchData]);

  async function saveData() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: STORAGE_KEY,
        value: { vision, intentions },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) {
      console.error('Error saving data:', error);
    }
    setSaving(false);
  }

  const toggleLove = (love: string) => {
    const nextLoves = vision.loves.includes(love)
      ? vision.loves.filter(l => l !== love)
      : [...vision.loves, love];
    setVision({ ...vision, loves: nextLoves });
  };

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
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500 italic">Loading your vision board...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">

      <div className="space-y-12">
        {/* Main Vision Paper */}
        <section className="relative bg-white p-8 md:p-16 rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#99B3C5] via-[#FFA1AB] to-[#FFC68D]"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <Scroll className="text-[#99B3C5]" size={24} />
                <h2 className="text-2xl font-black text-[#0a2f5f]  tracking-tight">Work Vision</h2>
              </div>
              <p className="text-gray-500 font-medium leading-relaxed italic">
                When looking forward to the coming year, what would you love for your work to look like each day? 
                What fills you up in the time you spend at work?
              </p>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-100 opacity-50"></div>
                <textarea 
                  value={vision.workVision}
                  onChange={(e) => setVision({...vision, workVision: e.target.value})}
                  placeholder="I&apos;d love for my work to feel..."
                  className="w-full min-h-[350px] p-12 bg-[#fdfbf7] border-2 border-[#e6e2d3] rounded-3xl text-xl font-serif leading-[2.5rem] focus:ring-0 outline-none shadow-inner"
                  style={{ backgroundImage: 'linear-gradient(#e6e2d3 1px, transparent 1px)', backgroundSize: '100% 2.5rem' }}
                />
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="text-[#FFA1AB]" size={24} />
                <h2 className="text-2xl font-black text-[#0a2f5f]  tracking-tight">Core Values</h2>
              </div>
              <p className="text-gray-500 font-medium leading-relaxed italic">
                Do you love it when you have the time to be...
              </p>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                {LOVE_OPTIONS.map(option => (
                  <label key={option} className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox"
                        checked={vision.loves.includes(option)}
                        onChange={() => toggleLove(option)}
                        className="peer appearance-none w-6 h-6 border-2 border-[#99B3C5] rounded-lg checked:bg-[#99B3C5] transition-all cursor-pointer"
                      />
                      <Zap size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className={`text-sm font-black  tracking-widest transition-colors ${vision.loves.includes(option) ? 'text-[#0a2f5f]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
              <div className="p-8 bg-amber-50/50 rounded-[2rem] border border-amber-100/50">
                <p className="text-xs font-bold text-amber-800/60  tracking-[0.2em] mb-4">Official Affirmation</p>
                <p className="font-serif italic text-lg text-amber-900/80 leading-relaxed">
                  &quot;These values represent the foundation of my professional and personal growth for the year 2026.&quot;
                </p>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-20 -right-20 text-[20rem] opacity-[0.03] pointer-events-none font-black text-[#0a2f5f]">
            Vision
          </div>
        </section>

        {/* Triple Insight Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Primary Delight', key: 'favoriteThing', color: 'bg-[#99B3C5]', icon: <Sparkles size={20} />, sub: 'Favorite thing at work each day' },
            { label: 'Growth Area', key: 'didntEnjoy', color: 'bg-[#FFA1AB]', icon: <Target size={20} />, sub: 'What didn&apos;t you enjoy last year' },
            { label: 'Pure Joy', key: 'simplyFun', color: 'bg-[#FFC68D]', icon: <Zap size={20} />, sub: 'What was simply fun for you' }
          ].map(field => (
            <div key={field.key} className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-xl shadow-gray-200/50 group hover:-translate-y-2 transition-all duration-500">
              <div className={`w-12 h-12 ${field.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                {field.icon}
              </div>
              <label className="block text-xs font-black text-gray-400  tracking-[0.2em] mb-2">{field.label}</label>
              <p className="text-[10px] font-bold text-gray-300  tracking-widest mb-6">{field.sub}</p>
              <input 
                type="text"
                value={vision[field.key as keyof VisionData]}
                onChange={(e) => setVision({...vision, [field.key]: e.target.value})}
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-100 rounded-2xl outline-none font-serif text-xl text-[#0a2f5f] transition-all"
                placeholder="..."
              />
            </div>
          ))}
        </section>

        {/* Dream Big Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0a2f5f] to-[#0a2f5f] rounded-[4rem] p-12 md:p-20 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <div className="inline-block px-4 py-1 bg-white/10 rounded-full text-[10px] font-black  tracking-[0.3em] mb-4">Aspiration Matrix</div>
              <h2 className="text-5xl font-black mb-6 tracking-tight ">Dream Big</h2>
              <p className="text-white/60 font-bold leading-relaxed">Where would you like to be in a year? Run a marathon? Pay off your home? Hit an income goal? Define your trajectory.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'Financially', key: 'dreamFinancially', color: 'border-emerald-500/30', glow: 'shadow-emerald-500/10' },
                { label: 'Physically', key: 'dreamPhysically', color: 'border-rose-500/30', glow: 'shadow-rose-500/10' },
                { label: 'Emotionally', key: 'dreamEmotionally', color: 'border-indigo-500/30', glow: 'shadow-indigo-500/10' },
                { label: 'Spiritually', key: 'dreamSpiritually', color: 'border-amber-500/30', glow: 'shadow-amber-500/10' }
              ].map(field => (
                <div key={field.key} className={`bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border ${field.color} ${field.glow} shadow-2xl focus-within:bg-white/10 transition-all`}>
                  <label className="block font-black  tracking-[0.2em] text-[10px] mb-6 opacity-60">{field.label}</label>
                  <textarea 
                    value={vision[field.key as keyof VisionData]}
                    onChange={(e) => setVision({...vision, [field.key]: e.target.value})}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-serif placeholder:text-white/10 min-h-[150px] resize-none leading-relaxed"
                    placeholder="Visualize..."
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-full h-full bg-grid-white/[0.02] [mask-image:radial-gradient(white,transparent_70%)]"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#99B3C5] opacity-10 blur-[100px] rounded-full"></div>
        </section>

        {/* Narrative Manifest */}
        <section className="relative p-12 md:p-20 rounded-[4rem] border-4 border-dashed border-gray-100 bg-[#fdfbf7] shadow-inner overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10 text-2xl md:text-3xl leading-[4.5rem] font-serif text-[#0a2f5f]/80">
            <span className="text-sm font-black  tracking-[0.3em] text-[#99B3C5] block mb-8">Narrative Manifest</span>
            This year, more than anything else, I want to focus on {' '}
            <input 
              type="text" 
              value={vision.focusOn}
              onChange={(e) => setVision({...vision, focusOn: e.target.value})}
              className="bg-transparent border-b-2 border-[#99B3C5]/30 focus:border-[#99B3C5] outline-none px-4 w-full md:w-80 transition-all placeholder:text-gray-200"
              placeholder="Primary Focus"
            />.
            <br />
            To make that happen, I&apos;m going to spend my time and energy on {' '}
            <input 
              type="text" 
              value={vision.energyOn}
              onChange={(e) => setVision({...vision, energyOn: e.target.value})}
              className="bg-transparent border-b-2 border-[#FFA1AB]/30 focus:border-[#FFA1AB] outline-none px-4 w-full md:w-96 transition-all placeholder:text-gray-200"
              placeholder="Core Actions"
            />.
            <br />
            Instead of spending too much time on {' '}
            <input 
              type="text" 
              value={vision.lessTimeOn}
              onChange={(e) => setVision({...vision, lessTimeOn: e.target.value})}
              className="bg-transparent border-b-2 border-gray-200 focus:border-gray-400 outline-none px-4 w-full md:w-64 transition-all placeholder:text-gray-200"
              placeholder="Distractions"
            />,
            I&apos;m going to dream big about {' '}
            <input 
              type="text" 
              value={vision.dreamBigAbout}
              onChange={(e) => setVision({...vision, dreamBigAbout: e.target.value})}
              className="bg-transparent border-b-2 border-[#FFC68D]/30 focus:border-[#FFC68D] outline-none px-4 w-full md:w-80 transition-all placeholder:text-gray-200"
              placeholder="Big Dreams"
            />.
            <br />
            This is so worth it because {' '}
            <input 
              type="text" 
              value={vision.worthItBecause}
              onChange={(e) => setVision({...vision, worthItBecause: e.target.value})}
              className="bg-transparent border-b-2 border-[#9ADBDE]/30 focus:border-[#9ADBDE] outline-none px-4 w-full md:w-[32rem] transition-all placeholder:text-gray-200"
              placeholder="The People/Reasons"
            /> are depending on me!
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40rem] opacity-[0.02] pointer-events-none font-black text-[#0a2f5f]">
            2026
          </div>
        </section>

        {/* Specific Intentions List */}
        <section className="pb-20">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-black text-[#0a2f5f]  tracking-tight">Specific Intentions</h2>
              <p className="text-gray-400 font-bold  tracking-widest text-[10px] mt-1">Categorized milestones and action items</p>
            </div>
            <button 
              onClick={addIntention}
              className="flex items-center gap-2 px-8 py-4 bg-[#99B3C5]/10 text-[#99B3C5] font-black  tracking-widest text-xs rounded-2xl hover:bg-[#99B3C5]/20 transition-all shadow-sm"
            >
              <Plus size={16} />
              Add Intention
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {intentions.map((intention, index) => (
              <div key={index} className="bg-white p-10 rounded-[3rem] border-2 border-gray-50 shadow-xl shadow-gray-200/40 flex gap-8 items-start group hover:border-[#99B3C5]/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#99B3C5] group-hover:bg-[#99B3C5] group-hover:text-white transition-all shadow-inner">
                  <Target size={20} />
                </div>
                <div className="flex-1 space-y-4">
                  <input 
                    type="text"
                    value={intention.category}
                    onChange={(e) => updateIntention(index, 'category', e.target.value)}
                    className="text-[10px] font-black  tracking-[0.3em] text-[#99B3C5] bg-transparent border-none p-0 focus:ring-0 w-full"
                    placeholder="Category"
                  />
                  <textarea 
                    value={intention.text}
                    onChange={(e) => updateIntention(index, 'text', e.target.value)}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl text-[#0a2f5f] font-serif placeholder:text-gray-200 min-h-[80px] resize-none leading-relaxed"
                    placeholder="Describe your intention..."
                  />
                </div>
                <button 
                  onClick={() => removeIntention(index)}
                  className="text-gray-100 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-20 py-16 border-t border-gray-100 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-20 h-20 bg-[#0a2f5f]/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <Sparkles className="text-[#0a2f5f]/20" size={32} />
          </div>
          <p className="text-[#0a2f5f]/40 text-xs font-black  tracking-[0.4em] mb-4">Official Vision Document</p>
          <p className="text-gray-300 font-serif italic text-lg max-w-lg mx-auto leading-relaxed">
            &quot;Dream big, plan with intention, and live with purpose.&quot;
          </p>
          <div className="mt-12 flex justify-center gap-8">
            <div className="text-center">
              <span className="block text-[10px] font-black  tracking-widest text-gray-400 mb-1">Status</span>
              <span className="text-xs font-bold text-[#0a2f5f]">Authenticated</span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-black  tracking-widest text-gray-400 mb-1">Cycle</span>
              <span className="text-xs font-bold text-[#0a2f5f]">2026_PLAN_01</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
