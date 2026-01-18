'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, Calendar, Clock, BookOpen } from 'lucide-react';
import HubHeader from '@/components/HubHeader';

interface SavedNote {
  text: string;
  savedAt: string;
}

export default function IcaapNotesPage() {
  const [currentNote, setCurrentNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const storageKey = 'icaap-notes-collection';

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
      setSavedNotes(metadata.value.items || []);
      setCurrentNote(metadata.value.current || '');
    }
    setLoading(false);
  }

  async function saveNote() {
    if (!currentNote.trim()) return;
    
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newSavedNotes = [
      { text: currentNote, savedAt: new Date().toISOString() },
      ...savedNotes
    ].slice(0, 50); // Keep last 50

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: storageKey,
        value: { current: '', items: newSavedNotes },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) {
      console.error('Error saving ICAAP notes:', error);
    } else {
      setSavedNotes(newSavedNotes);
      setCurrentNote('');
    }
    setSaving(false);
  }

  async function deleteNote(index: number) {
    const newSavedNotes = savedNotes.filter((_, i) => i !== index);
    setSavedNotes(newSavedNotes);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: storageKey,
        value: { current: currentNote, items: newSavedNotes },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto bg-[#fdfbf7] min-h-screen">
      <HubHeader
        title="iCAAP Records"
        subtitle='"Official records, reminders, and professional follow-ups"'
        icon={BookOpen}
        hideHubSuffix
      >
        <Link href="/icaap" className="flex items-center gap-2 px-6 py-2 bg-white border-2 border-[#0a2f5f]/10 rounded-full font-bold text-[#0a2f5f] hover:bg-[#0a2f5f]/5 transition-all shadow-sm">
          <ChevronLeft size={20} />
          Back to iCAAP
        </Link>
      </HubHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* New Note Area */}
        <div className="lg:col-span-7">
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#0a2f5f] to-[#5d84b2] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white p-8 rounded-3xl border-2 border-[#0a2f5f]/5 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#0a2f5f] flex items-center gap-2">
                  <Plus className="text-[#5d84b2]" size={24} />
                  New Record Entry
                </h2>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#0a2f5f]/30 px-3 py-1 bg-[#0a2f5f]/5 rounded-full">
                  Lined Paper Mode
                </div>
              </div>
              
              <div className="relative">
                <textarea 
                  placeholder="Record your iCAAP follow-ups or meeting notes here..."
                  className="w-full min-h-[400px] p-8 bg-[#fdfbf7] border-2 border-[#e6e2d3] rounded-2xl text-xl font-serif leading-loose focus:ring-4 focus:ring-[#0a2f5f]/5 outline-none transition-all shadow-inner"
                  style={{ 
                    backgroundImage: 'linear-gradient(#e6e2d3 1px, transparent 1px)', 
                    backgroundSize: '100% 3rem',
                    lineHeight: '3rem',
                    paddingTop: '2.5rem'
                  }}
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                ></textarea>
                <div className="absolute top-0 left-12 bottom-0 w-0.5 bg-red-200/50"></div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={saveNote}
                  disabled={saving || !currentNote.trim()}
                  className="group relative flex items-center gap-2 px-10 py-4 bg-[#0a2f5f] text-white font-bold rounded-2xl hover:bg-[#00254d] transition-all disabled:opacity-50 shadow-lg hover:shadow-[#0a2f5f]/20"
                >
                  <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                  {saving ? 'Recording Entry...' : 'Finalize Record'}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* History / Sidebar */}
        <div className="lg:col-span-5 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold text-[#0a2f5f]">Recent History</h2>
              <div className="h-px flex-grow bg-gradient-to-r from-[#0a2f5f]/20 to-transparent"></div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a2f5f]"></div>
                <div className="text-sm font-bold uppercase tracking-widest text-[#0a2f5f]">Archiving...</div>
              </div>
            ) : savedNotes.length > 0 ? (
              <div className="space-y-6">
                {savedNotes.map((note, i) => (
                  <div key={i} className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-50 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs font-black text-[#0a2f5f]/40 uppercase tracking-tighter">
                            <Calendar size={12} />
                            {formatDate(note.savedAt)}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-black text-[#0a2f5f]/40 uppercase tracking-tighter">
                            <Clock size={12} />
                            {formatTime(note.savedAt)}
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteNote(i)}
                          className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap font-serif text-lg leading-relaxed border-l-4 border-[#5d84b2]/20 pl-4">
                        {note.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-4 grayscale opacity-50">📂</div>
                <p className="text-gray-400 italic">No historical records found.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      <footer className="mt-20 pt-12 border-t border-[#0a2f5f]/5 text-center">
        <p className="text-[#0a2f5f]/30 text-sm font-bold uppercase tracking-[0.2em]">iCAAP Administrative Archive © 2026</p>
      </footer>
    </div>
  );
}
