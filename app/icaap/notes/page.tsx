'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
        value: { current: currentNote, items: newSavedNotes },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) {
      console.error('Error saving ICAAP notes:', error);
    } else {
      setSavedNotes(newSavedNotes);
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
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#00326b]">iCAAP Notes</h1>
          <p className="text-gray-600">Records, reminders, and follow-ups</p>
        </div>
        <Link href="/icaap" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
          Back
        </Link>
      </header>

      <section className="bg-white p-6 rounded-xl border shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-4 text-[#00326b]">Add New Note</h2>
        <textarea 
          placeholder="What's on your mind regarding iCAAP?"
          className="w-full min-h-[150px] p-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#00326b] outline-none"
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
        ></textarea>
        <div className="mt-4 flex justify-end">
          <button 
            onClick={saveNote}
            disabled={saving || !currentNote.trim()}
            className="px-6 py-2 bg-[#00326b] text-white font-bold rounded-lg hover:bg-[#00254d] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-bold mb-4 text-[#00326b]">History</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-400 italic">Loading history...</div>
        ) : savedNotes.length > 0 ? (
          <div className="space-y-4">
            {savedNotes.map((note, i) => (
              <div key={i} className="p-4 border rounded-lg bg-gray-50 group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-400">{formatDate(note.savedAt)}</span>
                  <button 
                    onClick={() => deleteNote(i)}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{note.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-400 italic">No notes saved yet.</p>
        )}
      </section>
    </div>
  );
}
