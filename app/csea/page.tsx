'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CseaIssue, CseaMember } from '@/types/database.types';

export default function CseaPage() {
  const [activeTab, setActiveTab] = useState('issues');
  const [issues, setIssues] = useState<CseaIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [meetingNotes, setMeetingNotes] = useState<any[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchIssues();
    fetchCseaMetadata();
  }, []);

  async function fetchIssues() {
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
  }

  async function fetchCseaMetadata() {
    const { data, error } = await supabase
      .from('opus_metadata')
      .select('*')
      .ilike('key', 'csea-%');
    
    if (error) {
      console.error('Error fetching CSEA metadata:', error);
    } else if (data) {
      data.forEach(item => {
        if (item.key === 'csea-meeting-notes') setMeetingNotes(item.value || []);
        if (item.key === 'csea-general-notes') setGeneralNotes(item.value?.content || '');
      });
    }
  }

  async function saveMetadata(key: string, value: any) {
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

  const filteredIssues = issues.filter(issue => 
    (issue.csea_members?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (issue.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (issue.steward || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'Open').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#00326b]">CSEA Tracker</h1>
          <p className="text-gray-600">Stewarded member issues at a glance</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'issues' ? 'bg-[#00326b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Issue Log
          </button>
          <button 
            onClick={() => setActiveTab('meetings')}
            className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'meetings' ? 'bg-[#00326b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Meeting Notes
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'notes' ? 'bg-[#00326b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            General Notes
          </button>
        </div>
      </header>

      {activeTab === 'issues' && (
        <div className="space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total Issues" value={stats.total} color="text-[#00326b]" />
            <StatCard title="Open" value={stats.open} color="text-blue-600" />
            <StatCard title="In Progress" value={stats.inProgress} color="text-yellow-600" />
            <StatCard title="Resolved/Closed" value={stats.resolved} color="text-green-600" />
          </section>

          <section className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>🔍</span> Search Issues
            </h2>
            <input 
              type="text" 
              placeholder="Search by name, description, or steward..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00326b] outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </section>

          <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading issues...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#00326b] text-white">
                  <tr>
                    <th className="p-4 text-sm font-semibold uppercase tracking-wider">Member ID</th>
                    <th className="p-4 text-sm font-semibold uppercase tracking-wider">Member</th>
                    <th className="p-4 text-sm font-semibold uppercase tracking-wider">Type</th>
                    <th className="p-4 text-sm font-semibold uppercase tracking-wider">Description</th>
                    <th className="p-4 text-sm font-semibold uppercase tracking-wider">Steward</th>
                    <th className="p-4 text-sm font-semibold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-700">{issue.csea_members?.member_id || '-'}</td>
                      <td className="p-4 text-sm font-semibold text-gray-900">{issue.csea_members?.full_name || 'Unknown'}</td>
                      <td className="p-4 text-sm text-gray-600">{issue.issue_type}</td>
                      <td className="p-4 text-sm text-gray-600 max-w-md">{issue.description}</td>
                      <td className="p-4 text-sm text-gray-600">{issue.steward}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          issue.status === 'Closed' || issue.status === 'Resolved' ? 'bg-gray-100 text-gray-600' : 
                          issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {issue.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredIssues.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">No issues found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold text-[#00326b]">Meeting Notes</h2>
            <button 
              onClick={addMeetingNote}
              className="px-6 py-2 bg-[#00326b] text-white rounded-full font-bold hover:bg-[#00254d] transition-all"
            >
              + Add New Meeting
            </button>
          </div>
          
          <div className="space-y-4">
            {meetingNotes.map((meeting, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <div className="flex gap-4">
                  <input 
                    type="date"
                    value={meeting.date}
                    onChange={(e) => {
                      const next = [...meetingNotes]; next[i].date = e.target.value; setMeetingNotes(next);
                    }}
                    className="p-2 border rounded font-semibold text-gray-700"
                  />
                  <input 
                    type="text"
                    placeholder="Meeting Title (e.g. Executive Board)"
                    value={meeting.title}
                    onChange={(e) => {
                      const next = [...meetingNotes]; next[i].title = e.target.value; setMeetingNotes(next);
                    }}
                    className="flex-1 p-2 border rounded font-bold text-[#00326b]"
                  />
                  <button 
                    onClick={() => {
                      const next = meetingNotes.filter((_, idx) => idx !== i);
                      setMeetingNotes(next);
                      saveMetadata('csea-meeting-notes', next);
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
                <textarea 
                  placeholder="What was discussed?"
                  value={meeting.notes}
                  onChange={(e) => {
                    const next = [...meetingNotes]; next[i].notes = e.target.value; setMeetingNotes(next);
                  }}
                  className="w-full min-h-[150px] p-4 border rounded bg-gray-50 focus:ring-2 focus:ring-[#00326b] outline-none"
                />
                <div className="flex justify-end">
                  <button 
                    onClick={() => saveMetadata('csea-meeting-notes', meetingNotes)}
                    className="px-4 py-1 text-sm bg-blue-50 text-[#00326b] font-bold rounded hover:bg-blue-100"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ))}
            {meetingNotes.length === 0 && (
              <p className="text-center text-gray-400 italic py-12">No meeting notes recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white p-8 rounded-xl border shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-[#00326b]">General Notes</h2>
            <button 
              onClick={() => saveMetadata('csea-general-notes', { content: generalNotes })}
              disabled={saving}
              className="px-8 py-2 bg-[#00326b] text-white rounded-full font-bold hover:bg-[#00254d] transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save General Notes'}
            </button>
          </div>
          <textarea 
            placeholder="Capture random thoughts, reminders, or miscellaneous info here..."
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            className="w-full min-h-[400px] p-6 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#00326b] outline-none text-lg leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
