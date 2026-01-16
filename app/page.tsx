'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Meeting {
  id: string;
  title: string;
  category: string;
  date: string;
  start_time: string;
}

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetings() {
      const today = new Date().toISOString().split('T')[0];
      const twoWeeksLater = new Date();
      twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
      const endDate = twoWeeksLater.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('opus_meetings')
        .select('*')
        .gte('date', today)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching meetings:', error);
      } else {
        setMeetings(data || []);
      }
      setLoading(false);
    }

    fetchMeetings();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[#0a2f5f]">Calendar</h1>
          <p className="text-gray-500">Monthly View & Events</p>
        </div>
        <div className="flex gap-3">
          <Link href="/planning" className="planner-header-pill">Goals</Link>
          <div className="text-sm font-medium text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </header>

      <div className="flex justify-center gap-4 mb-8">
        <Link href="/personal-planner" className="planner-header-pill hover:bg-[#00326b] hover:text-white">
          Personal Planner
        </Link>
        <Link href="/work-planner" className="planner-header-pill hover:bg-[#e0592a] hover:text-white">
          Work Planner
        </Link>
      </div>

      <div className="planner-card mb-8 min-h-[400px] flex items-center justify-center text-gray-400">
        <p>Calendar visualization will be integrated here</p>
      </div>

      <section id="upcoming-events-section">
        <div className="planner-card">
          <h2 className="text-xl font-bold text-[#0a2f5f] border-b-2 border-[#ffca38] pb-3 mb-6">
            Upcoming Events & Meetings
          </h2>
          
          <div className="space-y-1">
            {loading ? (
              <p className="p-4 text-center text-gray-500 italic">Loading events...</p>
            ) : meetings.length > 0 ? (
              meetings.map((meeting) => (
                <div key={meeting.id} className="planner-list-item">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#0a2f5f]">{meeting.title}</span>
                    <span className="text-xs text-gray-500">{meeting.category || "General"}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#0a2f5f]">{formatDate(meeting.date)}</div>
                    <div className="text-xs text-gray-500">{meeting.start_time}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-gray-500 italic">No upcoming events scheduled.</p>
            )}
          </div>
        </div>
      </section>

      <footer className="mt-12 py-6 text-center text-gray-400 text-sm border-t border-gray-200">
        <p>&copy; {new Date().getFullYear()} Opus One Planner. Calendar.</p>
      </footer>
    </div>
  );
}
