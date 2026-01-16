'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  ChevronLeft, Save, Plus, Printer, Search, 
  Scroll, UserCircle, Briefcase, Calendar, 
  Filter, FileText, History, ArrowRight,
  ClipboardList, CheckCircle2
} from 'lucide-react';
import { INITIAL_TRANSCRIPT_LOG, TranscriptRequest } from './data';

const ADVISER_MAP: Record<string, string> = {
  "Preliminary Multiple Subject": "Rene Gaudet",
  "Preliminary Single Subject": "Zina Dixon",
  "Preliminary Special Education Programs (Includes: MMSN/MMD, MOD/ESN, ECSE) CENTSE Programs and Preliminary Added Specialty Programs": "Eberardo Rodriguez",
  "Portfolio (Preliminary Clinical Practice)": "Stephen Maccarone",
  "AA/ASD": "Eberardo Rodriguez",
  "AA/ECSE (Year 2 only)": "Eberardo Rodriguez",
  "AA/BiLAA": "Zina Dixon",
  "AA/RLAA": "Wendy Marrero & Rene Gaudet",
  "Induction Program": "Maikai Finnell & Wendy Marrero",
  "TPSL": "Eberardo Rodriguez"
};

const PROGRAMS = Object.keys(ADVISER_MAP);

export default function TranscriptRequestPage() {
  const [log, setLog] = useState<TranscriptRequest[]>(INITIAL_TRANSCRIPT_LOG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  
  const [newRequest, setNewRequest] = useState<TranscriptRequest>({
    en: '',
    name: '',
    requestFrom: '',
    dateReceived: new Date().toISOString().split('T')[0],
    program: '',
    nature: '',
    adviser: '',
    dateSent: '',
    by: 'JD',
    notes: '',
    dateReturnAdviser: '',
    dateReturnSalary: '',
    sentTo: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: metadata } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', 'transcriptRequestLog')
      .single();

    if (metadata?.value) {
      const savedLog = metadata.value as TranscriptRequest[];
      const merged = [...savedLog];
      
      INITIAL_TRANSCRIPT_LOG.forEach(initial => {
        const exists = savedLog.some(s => s.en === initial.en && s.name === initial.name && s.dateReceived === initial.dateReceived);
        if (!exists) merged.push(initial);
      });

      merged.sort((a, b) => new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime());
      setLog(merged);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (updatedLog: TranscriptRequest[]) => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: 'transcriptRequestLog',
        value: updatedLog,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });
    
    setSaving(false);
  };

  const addRequest = () => {
    if (!newRequest.name) return;
    const updatedLog = [newRequest, ...log];
    setLog(updatedLog);
    handleSave(updatedLog);
    setNewRequest({
      en: '',
      name: '',
      requestFrom: '',
      dateReceived: new Date().toISOString().split('T')[0],
      program: '',
      nature: '',
      adviser: '',
      dateSent: '',
      by: 'JD',
      notes: '',
      dateReturnAdviser: '',
      dateReturnSalary: '',
      sentTo: ''
    });
  };

  const handleProgramChange = (program: string) => {
    setNewRequest({
      ...newRequest,
      program,
      adviser: ADVISER_MAP[program] || ''
    });
  };

  const filteredLog = log.filter(entry => 
    entry.name.toLowerCase().includes(search.toLowerCase()) || 
    entry.en.includes(search) ||
    entry.program.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto bg-[#fdfdfd] min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-[#00326b] flex items-center justify-center shadow-xl shadow-[#00326b]/20">
              <Scroll className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#00326b] tracking-tight uppercase leading-none mb-1">Transcript Records</h1>
              <p className="text-gray-400 font-bold tracking-widest text-[10px] uppercase">Official Education Records Form & Request Log</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/icaap/forms" className="flex items-center gap-2 px-6 py-2 bg-white border-2 border-[#00326b]/10 rounded-full font-bold text-[#00326b] hover:bg-[#00326b]/5 transition-all shadow-sm">
            <ChevronLeft size={20} />
            Back
          </Link>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-3 px-8 py-2 bg-[#ffca38] text-[#00326b] font-black text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-[#eeb125] transition-all shadow-lg shadow-[#ffca38]/20"
          >
            <Printer size={18} />
            Export Log
          </button>
        </div>
      </header>

      {/* Entry Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 print:hidden">
        {/* New Request Form */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border-2 border-gray-100 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10 border-b border-gray-50 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#00326b]/5 flex items-center justify-center shadow-inner">
                <Plus className="text-[#00326b]" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#00326b] uppercase tracking-tight">New Request Intake</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Register incoming academic records</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Employee Number (EN)</label>
                <input 
                  type="text" 
                  value={newRequest.en} 
                  onChange={e => setNewRequest({...newRequest, en: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#00326b]/20 focus:ring-4 focus:ring-[#00326b]/5 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-200 shadow-inner"
                  placeholder="00000000"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Teacher Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={newRequest.name} 
                    onChange={e => setNewRequest({...newRequest, name: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#00326b]/20 focus:ring-4 focus:ring-[#00326b]/5 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    placeholder="Last, First..."
                  />
                  <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00326b]/20" size={24} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Source / From</label>
                <div className="relative">
                  <select 
                    value={newRequest.requestFrom} 
                    onChange={e => setNewRequest({...newRequest, requestFrom: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#00326b]/20 focus:ring-4 focus:ring-[#00326b]/5 outline-none transition-all font-bold text-gray-700 shadow-inner appearance-none"
                  >
                    <option value="">Select...</option>
                    <option>Teacher</option>
                    <option>Salary Credit Assistants</option>
                    <option>Staff</option>
                  </select>
                  <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00326b]/20 pointer-events-none" size={24} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Date Received</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={newRequest.dateReceived} 
                    onChange={e => setNewRequest({...newRequest, dateReceived: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#00326b]/20 focus:ring-4 focus:ring-[#00326b]/5 outline-none transition-all font-bold text-gray-700 shadow-inner"
                  />
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00326b]/20" size={24} />
                </div>
              </div>

              <div className="space-y-1 md:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Program Track</label>
                <select 
                  value={newRequest.program} 
                  onChange={e => handleProgramChange(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#00326b]/20 focus:ring-4 focus:ring-[#00326b]/5 outline-none transition-all font-black text-[#00326b] shadow-inner text-sm"
                >
                  <option value="">Select Program Path...</option>
                  {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Assigned Adviser</label>
                <input 
                  type="text" 
                  value={newRequest.adviser} 
                  readOnly
                  className="w-full px-6 py-4 bg-[#00326b]/5 border-2 border-transparent rounded-2xl text-[#00326b] font-black shadow-inner"
                />
              </div>

              <div className="space-y-1 lg:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nature of Inquiry</label>
                <textarea 
                  value={newRequest.nature} 
                  onChange={e => setNewRequest({...newRequest, nature: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#00326b]/20 focus:ring-4 focus:ring-[#00326b]/5 outline-none transition-all font-bold text-gray-700 shadow-inner min-h-[100px] resize-none leading-relaxed"
                  placeholder="Describe the request..."
                />
              </div>
              <div className="space-y-1 lg:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Processing Notes</label>
                <textarea 
                  value={newRequest.notes} 
                  onChange={e => setNewRequest({...newRequest, notes: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#00326b]/20 focus:ring-4 focus:ring-[#00326b]/5 outline-none transition-all font-bold text-gray-700 shadow-inner min-h-[100px] resize-none leading-relaxed"
                  placeholder="Internal tracking notes..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-50">
              <button 
                onClick={addRequest}
                disabled={!newRequest.name}
                className="group flex items-center gap-3 px-12 py-4 bg-[#00326b] text-white font-black text-sm uppercase tracking-[0.2em] rounded-[2rem] hover:bg-[#0a2f5f] transition-all disabled:opacity-50 shadow-2xl shadow-[#00326b]/20"
              >
                Initiate Log Entry
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 text-[25rem] opacity-5 pointer-events-none font-black select-none">RECORD</div>
        </div>

        {/* Stats Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#99B3C5] p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 opacity-60">Log Summary</h3>
              <div className="flex flex-col gap-1">
                <span className="text-6xl font-black tracking-tighter">{filteredLog.length}</span>
                <span className="text-xs font-black uppercase tracking-widest opacity-80">Active Requests</span>
              </div>
              <div className="mt-10 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 size={16} className="text-white/60" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Real-time Sync Active</span>
                </div>
                <p className="text-[10px] text-white/40 font-bold uppercase leading-tight">Last Entry: {filteredLog[0]?.dateReceived || 'N/A'}</p>
              </div>
            </div>
            <ClipboardList className="absolute -bottom-10 -right-10 text-[15rem] opacity-10 group-hover:rotate-12 transition-transform duration-700" />
          </div>

          <div className="bg-white p-10 rounded-[3rem] border-2 border-gray-100 shadow-xl">
            <h4 className="text-[#0a2f5f] font-black uppercase tracking-widest text-xs mb-6 border-b border-gray-50 pb-4">Internal Guidance</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-[#ffca38] mt-1 shrink-0 shadow-[0_0_8px_rgba(255,202,56,0.6)]"></div>
                <p className="text-[11px] text-[#0a2f5f] font-bold leading-relaxed uppercase tracking-wider">
                  Ensure all Employee Numbers are verified against SAP before entry.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-[#FFA1AB] mt-1 shrink-0 shadow-[0_0_8px_rgba(255,161,171,0.6)]"></div>
                <p className="text-[11px] text-[#0a2f5f] font-bold leading-relaxed uppercase tracking-wider">
                  Flag requests from "Salary Credit Assistants" for priority processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Log View Section */}
      <section className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-2xl overflow-hidden mb-20">
        <div className="bg-[#00326b] p-8 text-white flex flex-col lg:row-reverse lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
              <Filter className="text-white/60" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">Transcript Request Log</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Administrative Master Log • 2025/26 Cycle</p>
            </div>
          </div>
          
          <div className="relative w-full lg:w-[400px] print:hidden">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={20} />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by EN, Name, or Program Track..."
              className="w-full pl-16 pr-6 py-4 bg-white/10 border-2 border-white/10 rounded-2xl text-sm outline-none focus:bg-white/20 focus:border-white/30 transition-all placeholder:text-white/30 font-bold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b-2 border-gray-100">
                <th className="p-6 text-center font-black text-[#00326b] uppercase tracking-widest w-[120px]">Employee #</th>
                <th className="p-6 text-left font-black text-[#00326b] uppercase tracking-widest w-[250px]">Teacher Name</th>
                <th className="p-6 text-center font-black text-[#00326b] uppercase tracking-widest w-[140px]">Date Rec.</th>
                <th className="p-6 text-left font-black text-[#00326b] uppercase tracking-widest w-[250px]">Program Track</th>
                <th className="p-6 text-left font-black text-[#00326b] uppercase tracking-widest">Nature of Inquiry</th>
                <th className="p-6 text-left font-black text-[#00326b] uppercase tracking-widest w-[180px]">Adviser</th>
                <th className="p-6 text-center font-black text-[#00326b] uppercase tracking-widest w-[80px]">By</th>
                <th className="p-6 text-left font-black text-[#00326b] uppercase tracking-widest w-[250px]">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLog.map((entry, idx) => (
                <tr key={`${entry.en}-${entry.name}-${idx}`} className="group hover:bg-[#00326b]/5 transition-colors">
                  <td className="p-6 font-black text-[#00326b] bg-gray-50/30 group-hover:bg-[#00326b]/10 transition-colors text-center text-sm tabular-nums tracking-tighter">
                    {entry.en}
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#00326b] group-hover:translate-x-1 transition-transform">{entry.name}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">From: {entry.requestFrom}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center font-bold text-gray-500 tabular-nums">
                    {entry.dateReceived}
                  </td>
                  <td className="p-6">
                    <span className="px-4 py-1.5 bg-[#9ADBDE]/20 text-[#00326b] rounded-full text-[10px] font-black uppercase tracking-wider border border-[#9ADBDE]/30">
                      {entry.program}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="text-gray-600 font-medium leading-relaxed italic text-[11px] line-clamp-2 hover:line-clamp-none transition-all">
                      "{entry.nature}"
                    </p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-[10px] text-[#00326b]">
                        {entry.adviser.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-bold text-[#00326b]">{entry.adviser}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="font-black text-xs text-[#00326b]/40">{entry.by}</span>
                  </td>
                  <td className="p-6">
                    <p className="text-gray-400 font-bold leading-relaxed text-[10px] uppercase tracking-tight">
                      {entry.notes || '—'}
                    </p>
                  </td>
                </tr>
              ))}
              {filteredLog.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Search size={64} className="text-[#00326b]" />
                      <div className="text-xs font-black uppercase tracking-[0.5em] text-[#00326b]">No Matching Records Found</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#00326b] mb-6 shadow-2xl"></div>
          <div className="text-xs font-black uppercase tracking-[0.5em] text-[#00326b] animate-pulse">Accessing Archive...</div>
        </div>
      )}

      {saving && (
        <div className="fixed bottom-12 right-12 bg-[#00326b] text-white px-10 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce z-50 border-2 border-white/20">
          <Save size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Synchronizing Log...</span>
        </div>
      )}

      <footer className="py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">LAUSD Management Services Document Repository © 2026</p>
      </footer>

      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5in;
          }
          header, section:first-of-type, footer, .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
          }
          .rounded-[3rem] {
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .bg-[#00326b] {
            background-color: white !important;
            color: black !important;
            border-bottom: 2px solid black !important;
            padding: 0 !important;
          }
          table {
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #eee !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
