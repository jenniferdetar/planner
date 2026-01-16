'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronRight, FileText, Clock, FileSpreadsheet, ClipboardList, GraduationCap, Save, History } from 'lucide-react';

const icaapLinks = [
  {
    href: '/icaap/pay-log',
    icon: <FileSpreadsheet className="text-[#0a2f5f]" size={24} />,
    label: 'Pay Log',
    sub: 'Track earnings & hours',
    color: 'bg-[#99B3C5]',
    borderColor: 'border-[#99B3C5]'
  },
  {
    href: '/icaap/hours',
    icon: <Clock className="text-[#0a2f5f]" size={24} />,
    label: 'Hours Worked',
    sub: 'Monthly breakdown',
    color: 'bg-[#FFA1AB]',
    borderColor: 'border-[#FFA1AB]'
  },
  {
    href: '/icaap/notes',
    icon: <FileText className="text-[#0a2f5f]" size={24} />,
    label: 'Records',
    sub: 'iCAAP records & notes',
    color: 'bg-[#FFC68D]',
    borderColor: 'border-[#FFC68D]'
  },
  {
    href: '/icaap/forms',
    icon: <ClipboardList className="text-[#0a2f5f]" size={24} />,
    label: 'Forms',
    sub: 'Transcripts & requisitions',
    color: 'bg-[#9ADBDE]',
    borderColor: 'border-[#9ADBDE]'
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-[#00326b] flex items-center justify-center shadow-xl shadow-[#00326b]/20">
            <GraduationCap className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#00326b] tracking-tight uppercase">iCAAP Hub</h1>
            <p className="text-gray-400 font-bold tracking-widest text-xs">Internship & Career Advancement Program Tracking</p>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#00326b] via-[#5d84b2] to-[#9ad1d6] rounded-[3rem] p-10 mb-12 text-white shadow-2xl shadow-[#00326b]/30">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black mb-4 leading-tight">Professional Advancement & Records Management</h2>
          <p className="text-xl text-white/80 font-medium leading-relaxed mb-8">
            Access your unified payroll logs, track professional hours, and manage official documents with high-fidelity administrative tools.
          </p>
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-3xl font-black">2025/26</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Academic Cycle</span>
            </div>
            <div className="w-px h-12 bg-white/20 mx-4"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-black">Active</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Program Status</span>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 text-[20rem] opacity-10 pointer-events-none">🎓</div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {icaapLinks.map((link) => (
          <Link 
            key={link.href}
            href={link.href}
            className={`group relative flex flex-col justify-between p-8 rounded-[2.5rem] border-2 ${link.borderColor} bg-white shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${link.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-2xl ${link.color} flex items-center justify-center mb-6 shadow-inner`}>
                {link.icon}
              </div>
              <h3 className="text-2xl font-black text-[#0a2f5f] mb-2">{link.label}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                {link.sub}
              </p>
            </div>
            <div className="mt-8 flex items-center text-[#0a2f5f] font-black text-sm uppercase tracking-widest gap-2">
              Explore <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border-2 border-gray-100 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <History className="text-[#00326b]" size={24} />
              <h2 className="text-2xl font-black text-[#00326b] uppercase tracking-tight">Administrative Briefing</h2>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-4 py-2 rounded-full border">
              Auto-Saving Draft
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00326b] mb-4"></div>
              <div className="text-xs font-black uppercase tracking-widest">Loading Records...</div>
            </div>
          ) : (
            <>
              <textarea 
                placeholder="Compose your general iCAAP notes, follow-ups, or meeting reminders here..."
                className="w-full min-h-[300px] p-8 border-2 border-gray-50 bg-[#f8fafc] rounded-3xl text-lg font-medium text-gray-700 focus:ring-4 focus:ring-[#00326b]/5 focus:bg-white outline-none transition-all shadow-inner leading-relaxed"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={saveNotes}
                  disabled={saving}
                  className="group flex items-center gap-3 px-10 py-4 bg-[#00326b] text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-[#0a2f5f] transition-all disabled:opacity-50 shadow-xl shadow-[#00326b]/20"
                >
                  {saving ? 'Processing...' : 'Save Notes'}
                  <Save size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#99B3C5]/10 p-8 rounded-[2.5rem] border-2 border-[#99B3C5]/20">
            <h4 className="text-[#0a2f5f] font-black uppercase tracking-widest text-xs mb-4">Quick Tip</h4>
            <p className="text-[#0a2f5f] font-medium leading-relaxed italic">
              "Always cross-reference your Pay Log with the Hours Worked Registry to ensure 100% accuracy before the monthly deadline."
            </p>
          </div>
          <div className="bg-[#FFA1AB]/10 p-8 rounded-[2.5rem] border-2 border-[#FFA1AB]/20">
            <h4 className="text-[#0a2f5f] font-black uppercase tracking-widest text-xs mb-4">Upcoming Deadline</h4>
            <div className="text-3xl font-black text-[#0a2f5f] mb-1">Jan 31</div>
            <p className="text-[#0a2f5f]/60 text-xs font-bold uppercase tracking-widest">January Paylog Submission</p>
          </div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">iCAAP Central Hub Portal © 2026</p>
      </footer>
    </div>
  );
}
