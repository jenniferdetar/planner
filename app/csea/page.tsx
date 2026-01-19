'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { CseaIssue, CseaSteward } from '@/types/database.types';
import { 
  Users, Shield, Search, 
  Plus, Trash2, 
  MessageSquare, Clock, CheckCircle2,
  AlertCircle, Activity
} from 'lucide-react';

import StatCard from '@/components/StatCard';

export default function CseaPage() {
  const [activeTab, setActiveTab] = useState('issues');
  const [issues, setIssues] = useState<CseaIssue[]>([]);
  const [stewards, setStewards] = useState<CseaSteward[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [meetingNotes, setMeetingNotes] = useState<{ date: string; title: string; notes: string }[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [newIssue, setNewIssue] = useState<Partial<CseaIssue>>({
    issue_date: new Date().toISOString().split('T')[0],
    member_name: '',
    work_location: '',
    description: '',
    involved_parties: '',
    steward: '',
    status: 'Open',
    issue_type: 'Grievance'
  });

  const fetchIssues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('csea_issues')
      .select('*, csea_members(*)');
    
    if (error) {
      console.error('Error fetching issues:', error);
    } else {
      setIssues(data || []);
    }
    setLoading(false);
  };

  const fetchCseaMetadata = async () => {
    const { data, error } = await supabase
      .from('opus_metadata')
      .select('*')
      .ilike('key', 'csea-%');
    
    if (error) {
      console.error('Error fetching CSEA metadata:', error);
    } else if (data) {
      data.forEach(item => {
        if (item.key === 'csea-meeting-notes') setMeetingNotes(item.value as { date: string; title: string; notes: string }[] || []);
        if (item.key === 'csea-general-notes') setGeneralNotes((item.value as { content: string })?.content || '');
      });
    }
  };

  const fetchStewards = async () => {
    const { data, error } = await supabase
      .from('csea_stewards')
      .select('*');

    if (error) {
      console.error('Error fetching CSEA stewards:', error);
    } else {
      setStewards(data || []);
    }
  };

  useEffect(() => {
    const init = async () => {
      // loading is already true by default, no need to set it synchronously
      await Promise.all([
        fetchIssues(),
        fetchCseaMetadata(),
        fetchStewards()
      ]);
      setLoading(false);
    };
    init();
  }, []); // Missing dependencies will be handled later

  async function saveMetadata(key: string, value: unknown) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key,
        value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) console.error(`Error saving ${key}:`, error);
    setSaving(false);
  }

  const addMeetingNote = () => {
    const next = [...meetingNotes, { date: new Date().toISOString().split('T')[0], title: '', notes: '' }];
    setMeetingNotes(next);
  };

  const stewardById = useMemo(() => {
    return new Map(stewards.map(steward => [steward.id, steward.name]));
  }, [stewards]);

  const stewardByName = useMemo(() => {
    return new Map(stewards.map(steward => [steward.name.toLowerCase(), steward.name]));
  }, [stewards]);

  const handleAddIssue = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('csea_issues')
      .insert([{ ...newIssue, user_id: user.id }]);

    if (error) {
      console.error('Error adding issue:', error);
    } else {
      fetchIssues();
      setNewIssue({
        issue_date: new Date().toISOString().split('T')[0],
        member_name: '',
        work_location: '',
        description: '',
        involved_parties: '',
        steward: '',
        status: 'Open',
        issue_type: 'Grievance'
      });
    }
  };

  const resolveStewardName = (stewardValue: string | null) => {
    if (!stewardValue) return '-';
    const byId = stewardById.get(stewardValue);
    if (byId) return byId;
    const byName = stewardByName.get(stewardValue.toLowerCase());
    return byName || stewardValue;
  };

  const filteredIssues = issues.filter(issue => {
    const stewardName = resolveStewardName(issue.steward);
    const searchLower = searchTerm.toLowerCase();
    return (
      (issue.csea_members?.full_name || '').toLowerCase().includes(searchLower) ||
      (issue.member_name || '').toLowerCase().includes(searchLower) ||
      (issue.work_location || '').toLowerCase().includes(searchLower) ||
      (issue.description || '').toLowerCase().includes(searchLower) ||
      (issue.involved_parties || '').toLowerCase().includes(searchLower) ||
      stewardName.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'Open').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length
  };

  return (
    <div className="p-4 md:p-8 w-full bg-[#fdfdfd] min-h-screen">
<div className="flex flex-wrap gap-4 mb-12">
        <button 
          onClick={() => setActiveTab('issues')}
          className={`px-8 py-4 rounded-2xl font-black  tracking-widest text-xs transition-all border-2 ${
            activeTab === 'issues' 
              ? 'bg-[#00326b] text-[#ffca38] border-[#ffca38] shadow-lg' 
              : 'bg-white text-[#00326b] border-[#ffca38]/10 hover:bg-[#ffca38]/5'
          }`}
        >
          Issue Log
        </button>
        <button 
          onClick={() => setActiveTab('meetings')}
          className={`px-8 py-4 rounded-2xl font-black  tracking-widest text-xs transition-all border-2 ${
            activeTab === 'meetings' 
              ? 'bg-[#00326b] text-[#ffca38] border-[#ffca38] shadow-lg' 
              : 'bg-white text-[#00326b] border-[#ffca38]/10 hover:bg-[#ffca38]/5'
          }`}
        >
          Meeting Minutes
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          className={`px-8 py-4 rounded-2xl font-black  tracking-widest text-xs transition-all border-2 ${
            activeTab === 'notes' 
              ? 'bg-[#00326b] text-[#ffca38] border-[#ffca38] shadow-lg' 
              : 'bg-white text-[#00326b] border-[#ffca38]/10 hover:bg-[#ffca38]/5'
          }`}
        >
          General Archive
        </button>
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'issues' && (
          <div className="space-y-12">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Registry" value={stats.total} icon={<Users size={20} />} color="bg-[#99B3C5]" />
              <StatCard title="Open Inquiries" value={stats.open} icon={<AlertCircle size={20} />} color="bg-[#ffca38]" />
              <StatCard title="In Progress" value={stats.inProgress} icon={<Clock size={20} />} color="bg-[#FFC68D]" />
              <StatCard title="Resolved Case" value={stats.resolved} icon={<CheckCircle2 size={20} />} color="bg-[#9ADBDE]" />
            </section>

            <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Plus size={20} className="text-[#0a2f5f]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#0a2f5f] tracking-tight">Add New Issue</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Date</label>
                    <input 
                      type="date"
                      value={newIssue.issue_date || ''}
                      onChange={(e) => setNewIssue({...newIssue, issue_date: e.target.value})}
                      className="p-3 bg-slate-50 border-2 border-transparent focus:border-[#0a2f5f]/10 rounded-xl font-bold text-gray-700 outline-none text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Member Name</label>
                    <input 
                      type="text"
                      placeholder="Full Name"
                      value={newIssue.member_name || ''}
                      onChange={(e) => setNewIssue({...newIssue, member_name: e.target.value})}
                      className="p-3 bg-slate-50 border-2 border-transparent focus:border-[#0a2f5f]/10 rounded-xl font-bold text-gray-700 outline-none text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Work Location</label>
                    <input 
                      type="text"
                      placeholder="School/Office"
                      value={newIssue.work_location || ''}
                      onChange={(e) => setNewIssue({...newIssue, work_location: e.target.value})}
                      className="p-3 bg-slate-50 border-2 border-transparent focus:border-[#0a2f5f]/10 rounded-xl font-bold text-gray-700 outline-none text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Discussed</label>
                    <input 
                      type="text"
                      placeholder="Description"
                      value={newIssue.description || ''}
                      onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                      className="p-3 bg-slate-50 border-2 border-transparent focus:border-[#0a2f5f]/10 rounded-xl font-bold text-gray-700 outline-none text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Involved</label>
                    <input 
                      type="text"
                      placeholder="Parties involved"
                      value={newIssue.involved_parties || ''}
                      onChange={(e) => setNewIssue({...newIssue, involved_parties: e.target.value})}
                      className="p-3 bg-slate-50 border-2 border-transparent focus:border-[#0a2f5f]/10 rounded-xl font-bold text-gray-700 outline-none text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Steward</label>
                    <select 
                      value={newIssue.steward || ''}
                      onChange={(e) => setNewIssue({...newIssue, steward: e.target.value})}
                      className="p-3 bg-slate-50 border-2 border-transparent focus:border-[#0a2f5f]/10 rounded-xl font-bold text-gray-700 outline-none text-xs appearance-none"
                    >
                      <option value="">Select Steward</option>
                      {stewards.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleAddIssue}
                  className="mt-6 w-full py-4 bg-[#00326b] text-[#ffca38] border-2 border-[#ffca38] rounded-2xl font-black tracking-widest text-xs hover:bg-[#00254d] transition-all shadow-xl shadow-[#00326b]/20"
                >
                  Append Record
                </button>
              </div>
            </section>

            <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Search size={20} className="text-[#0a2f5f]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#0a2f5f]  tracking-tight">Search Registry</h2>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search by name, description, or steward..."
                    className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-[#0a2f5f]/20 focus:bg-white rounded-2xl outline-none font-bold text-gray-700 transition-all pl-16"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b-2 border-slate-50 bg-slate-50/30">
                <h2 className="text-3xl font-black text-[#0a2f5f]  tracking-tight">Issue Log</h2>
                <p className="text-xs font-black text-gray-400  tracking-widest mt-1">Official registry of labor relations cases</p>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Activity className="text-slate-300 animate-pulse mb-4" size={48} />
                    <div className="text-slate-400 font-black  tracking-widest text-xs">Accessing Case Files...</div>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="p-6 text-[10px] font-black text-gray-400  tracking-[0.2em] border-b">Date Spoke with Member</th>
                        <th className="p-6 text-[10px] font-black text-gray-400  tracking-[0.2em] border-b">Member Name</th>
                        <th className="p-6 text-[10px] font-black text-gray-400  tracking-[0.2em] border-b">Member Work Location</th>
                        <th className="p-6 text-[10px] font-black text-gray-400  tracking-[0.2em] border-b">What was discussed</th>
                        <th className="p-6 text-[10px] font-black text-gray-400  tracking-[0.2em] border-b">Who was involved</th>
                        <th className="p-6 text-[10px] font-black text-gray-400  tracking-[0.2em] border-b">CSEA Contact Person</th>
                        <th className="p-6 text-[10px] font-black text-gray-400  tracking-[0.2em] border-b text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredIssues.map((issue) => (
                        <tr key={issue.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="p-6 text-sm font-bold text-[#0a2f5f]">{issue.issue_date}</td>
                          <td className="p-6">
                            <div className="font-black text-gray-900">{issue.member_name || issue.csea_members?.full_name || 'Unknown'}</div>
                          </td>
                          <td className="p-6 text-sm font-bold text-gray-600">{issue.work_location}</td>
                          <td className="p-6 text-sm text-gray-600 max-w-md leading-relaxed">{issue.description}</td>
                          <td className="p-6 text-sm text-gray-600">{issue.involved_parties}</td>
                          <td className="p-6 text-sm text-gray-600 font-bold">{resolveStewardName(issue.steward)}</td>
                          <td className="p-6">
                            <div className={`mx-auto w-fit px-4 py-2 rounded-xl text-[10px] font-black  tracking-widest ${
                              issue.status === 'Closed' || issue.status === 'Resolved' ? 'bg-slate-100 text-slate-500' : 
                              issue.status === 'In Progress' ? 'bg-amber-100 text-amber-700 shadow-sm shadow-amber-100/50' :
                              'bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100/50'
                            }`}>
                              {issue.status}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredIssues.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-20 text-center">
                            <p className="text-gray-400 font-black  tracking-widest text-xs">No case records found matching search parameters</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm">
              <div>
                <h2 className="text-3xl font-black text-[#0a2f5f]  tracking-tight">Meeting Minutes</h2>
                <p className="text-xs font-black text-gray-400  tracking-widest mt-1">Archive of official board proceedings</p>
              </div>
              <button 
                onClick={addMeetingNote}
                className="flex items-center gap-2 px-8 py-4 bg-[#00326b] text-[#ffca38] border-2 border-[#ffca38] rounded-2xl font-black  tracking-widest text-xs hover:bg-[#00254d] transition-all shadow-xl shadow-[#00326b]/20"
              >
                <Plus size={18} /> Record Session
              </button>
            </div>
            
            <div className="space-y-6">
              {meetingNotes.map((meeting, i) => (
                <div key={i} className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8 relative overflow-hidden group">
                  <div className="flex flex-wrap gap-6 relative z-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-gray-400  tracking-widest">Session Date</span>
                      <input 
                        type="date"
                        value={meeting.date}
                        onChange={(e) => {
                          const next = [...meetingNotes]; next[i].date = e.target.value; setMeetingNotes(next);
                        }}
                        className="p-4 bg-slate-50 border-2 border-transparent focus:border-[#0a2f5f]/10 rounded-xl font-black text-[#0a2f5f] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-grow">
                      <span className="text-[10px] font-black text-gray-400  tracking-widest">Proceedings Title</span>
                      <input 
                        type="text"
                        placeholder="Meeting Title (e.g. Executive Board)"
                        value={meeting.title}
                        onChange={(e) => {
                          const next = [...meetingNotes]; next[i].title = e.target.value; setMeetingNotes(next);
                        }}
                        className="p-4 bg-slate-50 border-2 border-transparent focus:border-[#0a2f5f]/10 rounded-xl font-black text-[#0a2f5f] outline-none text-xl"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const next = meetingNotes.filter((_, idx) => idx !== i);
                        setMeetingNotes(next);
                        saveMetadata('csea-meeting-notes', next);
                      }}
                      className="self-end p-4 text-slate-300 hover:text-red-500 transition-all bg-slate-50 rounded-xl hover:bg-red-50"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                  <div className="relative z-10">
                    <span className="text-[10px] font-black text-gray-400  tracking-widest mb-1 block">Official Notes</span>
                    <textarea 
                      placeholder="What was discussed?"
                      value={meeting.notes}
                      onChange={(e) => {
                        const next = [...meetingNotes]; next[i].notes = e.target.value; setMeetingNotes(next);
                      }}
                      className="w-full min-h-[200px] p-8 bg-slate-50 border-2 border-transparent focus:border-[#0a2f5f]/10 rounded-[2rem] outline-none font-medium text-gray-700 leading-relaxed text-lg"
                    />
                  </div>
                  <div className="flex justify-end relative z-10">
                    <button 
                      onClick={() => saveMetadata('csea-meeting-notes', meetingNotes)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-[#0a2f5f] font-black  tracking-widest text-[10px] rounded-xl hover:bg-blue-100 transition-all"
                    >
                      <Shield size={14} /> Certify Minutes
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 opacity-20 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                </div>
              ))}
              {meetingNotes.length === 0 && (
                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <MessageSquare className="text-slate-200 mx-auto mb-4" size={48} />
                  <p className="text-slate-400 font-black  tracking-widest text-xs">No administrative sessions recorded</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="bg-white p-12 rounded-[4rem] border-2 border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center border-b border-slate-50 pb-8 mb-8">
                <div>
                  <h2 className="text-3xl font-black text-[#0a2f5f]  tracking-tight">General Archive</h2>
                  <p className="text-xs font-black text-gray-400  tracking-widest mt-1">Central repository for miscellaneous labor records</p>
                </div>
                <button 
                  onClick={() => saveMetadata('csea-general-notes', { content: generalNotes })}
                  disabled={saving}
                  className="px-10 py-4 bg-[#00326b] text-[#ffca38] border-2 border-[#ffca38] rounded-2xl font-black  tracking-widest text-xs hover:bg-[#00254d] transition-all disabled:opacity-50 shadow-xl shadow-[#00326b]/20"
                >
                  {saving ? 'Synchronizing...' : 'Save Registry'}
                </button>
              </div>
              <textarea 
                placeholder="Capture random thoughts, reminders, or miscellaneous info here..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="w-full min-h-[500px] p-10 bg-slate-50/50 border-2 border-transparent focus:border-[#0a2f5f]/10 rounded-[3rem] outline-none text-xl leading-relaxed font-medium text-gray-700"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0a2f5f] opacity-[0.02] rounded-full translate-x-1/3 translate-y-1/3"></div>
          </div>
        )}
      </div>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black  tracking-[0.4em]">Labor Operations Registry © 2026</p>
      </footer>
    </div>
  );
}
