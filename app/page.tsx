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
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const startStr = startOfMonth.toISOString().split('T')[0];
      
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      const endStr = endOfMonth.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('opus_meetings')
        .select('*')
        .gte('date', startStr)
        .lte('date', endStr)
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

      <div className="planner-card mb-8">
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 p-2 text-center text-xs font-bold text-gray-500 uppercase">
              {day}
            </div>
          ))}
          {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-white p-4 h-24"></div>
          ))}
          {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayMeetings = meetings.filter(m => m.date === dateStr);
            const isToday = day === new Date().getDate() && new Date().getMonth() === new Date().getMonth();
            
            return (
              <div key={day} className={`bg-white p-2 h-24 border-t border-gray-100 flex flex-col gap-1 transition-colors hover:bg-blue-50/30 ${isToday ? 'bg-blue-50' : ''}`}>
                <span className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{day}</span>
                <div className="flex flex-col gap-1 overflow-y-auto">
                  {dayMeetings.slice(0, 2).map(m => (
                    <div key={m.id} className="text-[10px] p-1 bg-blue-100 text-blue-700 rounded truncate font-medium" title={m.title}>
                      {m.title}
                    </div>
                  ))}
                  {dayMeetings.length > 2 && (
                    <div className="text-[10px] text-gray-400 font-medium pl-1">
                      + {dayMeetings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
