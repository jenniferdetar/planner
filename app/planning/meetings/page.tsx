'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { OpusMeeting } from '@/types/database.types';
import Link from 'next/link';
import { Users, Calendar, MapPin, Plus, Trash2, Save, ChevronLeft, FileText, Clock, Info, Search } from 'lucide-react';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<OpusMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Partial<OpusMeeting> | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<OpusMeeting>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '10:00',
    location: '',
    attendees: [],
    agenda: '',
    notes: ''
  });

  const [attendeeInput, setAttendeeInput] = useState('');

  const fetchMeetings = useCallback(async (ignore = false) => {
    const { data, error } = await supabase
      .from('opus_meetings')
      .select('*')
      .order('date', { ascending: true });
    
    if (!ignore) {
      if (error) {
        console.error('Error fetching meetings:', error);
      } else {
        setMeetings(data || []);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const timeoutId = setTimeout(() => {
      fetchMeetings(ignore);
    }, 0);
    return () => { 
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [fetchMeetings]);

  async function handleSaveMeeting(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      ...formData,
      user_id: user.id,
      updated_at: new Date().toISOString()
    };

    let error;
    if (editingMeeting?.id) {
      const { error: err } = await supabase
        .from('opus_meetings')
        .update(payload)
        .eq('id', editingMeeting.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('opus_meetings')
        .insert([payload]);
      error = err;
    }

    if (error) {
      console.error('Error saving meeting:', error);
    } else {
      setEditingMeeting(null);
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        location: '',
        attendees: [],
        agenda: '',
        notes: ''
      });
      fetchMeetings();
    }
    setSaving(false);
  }

  async function handleDeleteMeeting(id: string) {
    if (!confirm('Are you sure you want to delete this meeting?')) return;
    
    const { error } = await supabase
      .from('opus_meetings')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting meeting:', error);
    } else {
      fetchMeetings();
      if (editingMeeting?.id === id) setEditingMeeting(null);
    }
  }

  const addAttendee = () => {
    if (!attendeeInput.trim()) return;
    setFormData({
      ...formData,
      attendees: [...(formData.attendees || []), attendeeInput.trim()]
    });
    setAttendeeInput('');
  };

  const removeAttendee = (index: number) => {
    const next = (formData.attendees || []).filter((_, i) => i !== index);
    setFormData({ ...formData, attendees: next });
  };

  const startEdit = (m: OpusMeeting) => {
    setEditingMeeting(m);
    setFormData(m);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Meeting Form */}
        <section className="lg:col-span-8 space-y-12">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#FFC68D]"></div>
            
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-[#0a2f5f] tracking-tight flex items-center gap-3">
                {editingMeeting ? <Plus className="rotate-45" size={24} /> : <Plus size={24} />}
                {editingMeeting ? 'Edit Registry Entry' : 'New Meeting Record'}
              </h2>
              {editingMeeting && (
                <button 
                  type="button"
                  onClick={() => {
                    setEditingMeeting(null);
                    setFormData({ title: '', date: new Date().toISOString().split('T')[0], attendees: [] });
                  }}
                  className="text-[10px] font-black tracking-wider text-gray-400 hover:text-red-500 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleSaveMeeting} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 tracking-wider ml-4">Meeting Title *</label>
                  <input 
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-[#FFC68D]/20 rounded-2xl outline-none font-bold text-[#0a2f5f] transition-all"
                    placeholder="Enter official meeting title..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 tracking-wider ml-4">Registry Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FFC68D]" size={18} />
                    <input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full p-6 pl-16 bg-slate-50 border-2 border-transparent focus:border-[#FFC68D]/20 rounded-2xl outline-none font-bold text-[#0a2f5f] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 tracking-wider ml-4">Location / Venue</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FFC68D]" size={18} />
                    <input 
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full p-6 pl-16 bg-slate-50 border-2 border-transparent focus:border-[#FFC68D]/20 rounded-2xl outline-none font-bold text-[#0a2f5f] transition-all"
                      placeholder="Zoom, Office, Hq..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 tracking-wider ml-4">Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FFC68D]" size={18} />
                    <input 
                      type="time"
                      value={formData.start_time || ''}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      className="w-full p-6 pl-16 bg-slate-50 border-2 border-transparent focus:border-[#FFC68D]/20 rounded-2xl outline-none font-bold text-[#0a2f5f] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 tracking-wider ml-4">End Time</label>
                  <div className="relative">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FFC68D]" size={18} />
                    <input 
                      type="time"
                      value={formData.end_time || ''}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                      className="w-full p-6 pl-16 bg-slate-50 border-2 border-transparent focus:border-[#FFC68D]/20 rounded-2xl outline-none font-bold text-[#0a2f5f] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 tracking-wider ml-4">Attendees Registry</label>
                <div className="flex gap-4">
                  <input 
                    type="text"
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
                    className="flex-1 p-6 bg-slate-50 border-2 border-transparent focus:border-[#FFC68D]/20 rounded-2xl outline-none font-bold text-[#0a2f5f] transition-all"
                    placeholder="Register attendee name..."
                  />
                  <button 
                    type="button"
                    onClick={addAttendee}
                    className="px-8 bg-[#FFC68D] text-[#0a2f5f] font-black tracking-wider text-xs rounded-2xl hover:bg-[#ffb05c] transition-all shadow-lg shadow-[#FFC68D]/20"
                  >
                    Register
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(formData.attendees || []).map((name, i) => (
                    <span key={i} className="px-6 py-2 bg-slate-100 text-[#0a2f5f] text-[10px] font-black tracking-wider rounded-full flex items-center gap-3 border border-slate-200">
                      {name}
                      <button type="button" onClick={() => removeAttendee(i)} className="hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 tracking-wider ml-4">Meeting Agenda</label>
                <textarea 
                  value={formData.agenda || ''}
                  onChange={(e) => setFormData({...formData, agenda: e.target.value})}
                  className="w-full min-h-[150px] p-8 bg-slate-50 border-2 border-transparent focus:border-[#FFC68D]/20 rounded-[2rem] outline-none font-serif text-lg text-[#0a2f5f] transition-all resize-none"
                  placeholder="Official objectives and talking points..."
                />
              </div>

              <div className="pt-8 flex justify-between items-center border-t border-gray-50">
                {editingMeeting && (
                  <button 
                    type="button"
                    onClick={() => handleDeleteMeeting(editingMeeting.id!)}
                    className="flex items-center gap-2 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black tracking-wider text-xs hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={16} />
                    Expunge Record
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={saving}
                  className="ml-auto flex items-center gap-3 px-12 py-5 bg-[#0a2f5f] text-white rounded-2xl font-black tracking-wider text-xs hover:bg-[#0a2f5f] transition-all disabled:opacity-50 shadow-2xl shadow-[#0a2f5f]/20"
                >
                  <Save size={18} />
                  {saving ? 'Processing...' : editingMeeting ? 'Update Record' : 'Certify Meeting'}
                </button>
              </div>
            </form>
          </div>

          {/* Meeting Notes Area (High Fidelity) */}
          <div className="bg-[#fdfbf7] p-12 rounded-[4rem] border-2 border-[#e6e2d3] shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 left-20 w-0.5 h-full bg-red-100 opacity-50"></div>
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-[#e6e2d3] flex items-center justify-center text-[#0a2f5f]">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#0a2f5f] tracking-tight">Executive Minutes</h2>
                <p className="text-[10px] font-black text-gray-400 tracking-wider">Formal discussion log and action items</p>
              </div>
            </div>
            <textarea 
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Record formal minutes and definitive outcomes..."
              className="w-full min-h-[500px] p-8 bg-transparent border-none focus:ring-0 text-2xl font-serif leading-[2.5rem] outline-none relative z-10 text-[#0a2f5f]/80"
              style={{ backgroundImage: 'linear-gradient(#e6e2d3 1px, transparent 1px)', backgroundSize: '100% 2.5rem' }}
            />
            <div className="absolute -bottom-10 -right-10 text-[15rem] opacity-[0.02] pointer-events-none font-black text-[#0a2f5f]">
              Log
            </div>
          </div>
        </section>

        {/* Sidebar: Upcoming Meetings */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="text-[#FFC68D]" size={20} />
              <h2 className="text-xl font-black text-[#0a2f5f] tracking-tight">Archive Registry</h2>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-8 h-8 border-4 border-[#FFC68D]/20 border-t-[#FFC68D] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-gray-300 tracking-wider">Querying Records...</p>
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-20 px-8">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="text-slate-200" size={24} />
                </div>
                <p className="text-sm font-bold text-gray-400 italic">No historical data found in registry.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((m) => {
                  const isPast = new Date(m.date) < new Date(new Date().setHours(0,0,0,0));
                  return (
                    <div 
                      key={m.id} 
                      onClick={() => startEdit(m)}
                      className={`group p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                        editingMeeting?.id === m.id
                        ? 'bg-[#0a2f5f] border-[#0a2f5f] text-white shadow-2xl scale-[1.02]'
                        : isPast 
                          ? 'bg-slate-50 border-slate-100 opacity-60 grayscale hover:grayscale-0 hover:bg-white hover:border-[#FFC68D]/30' 
                          : 'bg-white border-gray-50 hover:border-[#FFC68D]/50 hover:shadow-xl'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          editingMeeting?.id === m.id ? 'bg-white/10 text-white' : 'bg-[#FFC68D]/10 text-[#FFC68D]'
                        }`}>
                          {new Date(m.date).toLocaleDateString('en-Us', { month: 'short', day: 'numeric' })}
                        </div>
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${editingMeeting?.id === m.id ? 'text-white/60' : 'text-gray-400'}`}>
                          <Clock size={10} />
                          {m.start_time}
                        </span>
                      </div>
                      <h3 className={`font-black text-sm leading-tight group-hover:translate-x-1 transition-transform ${editingMeeting?.id === m.id ? 'text-white' : 'text-[#0a2f5f]'}`}>
                        {m.title}
                      </h3>
                      {m.location && (
                        <p className={`text-[10px] font-bold mt-3 flex items-center gap-2 ${editingMeeting?.id === m.id ? 'text-white/40' : 'text-gray-400'}`}>
                          <MapPin size={10} />
                          {m.location}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="absolute top-0 right-0 w-32 h-32 bg-grid-slate-100/[0.5] [mask-image:radial-gradient(white,transparent_70%)]"></div>
          </div>

          <div className="bg-[#0a2f5f] text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Info className="text-[#FFC68D]" size={20} />
                <h3 className="text-lg font-black uppercase tracking-tight">System Notice</h3>
              </div>
              <p className="text-xs font-medium opacity-70 leading-relaxed italic mb-8">
                &quot;Registry records are immutable once certified. Ensure all attendees and outcomes are accurately captured before archiving.&quot;
              </p>
              <div className="w-full h-px bg-white/10 mb-8"></div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center font-black text-xs">A</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Auth Level</p>
                  <p className="text-[10px] font-bold text-[#FFC68D]">Administrator</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 text-[10rem] opacity-[0.05] pointer-events-none font-black">?</div>
          </div>
        </aside>
      </div>
      
      <footer className="mt-20 py-16 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Official Communication Log © 2026</p>
      </footer>
    </div>
  );
}
