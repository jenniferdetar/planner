'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Calendar as CalendarIcon, Clock, ChevronRight, 
  LayoutDashboard, Activity, ShieldCheck, 
  ArrowUpRight, Landmark, Briefcase,
  HeartPulse, Target, ClipboardList,
  Home as HomeIcon, Scale, Compass, Sparkles
} from 'lucide-react';

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
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-[#00326b] flex items-center justify-center shadow-xl shadow-[#00326b]/20">
            <LayoutDashboard className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#00326b] tracking-tight uppercase">Strategic Command</h1>
            <p className="text-gray-400 font-bold tracking-widest text-xs italic">"Central intelligence & operations registry"</p>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a2f5f] via-[#1e40af] to-[#3b82f6] rounded-[3rem] p-10 mb-12 text-white shadow-2xl shadow-[#0a2f5f]/30">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black mb-4 leading-tight">Life Architecture Intelligence</h2>
          <p className="text-xl text-white/80 font-medium leading-relaxed mb-8">
            Access your unified administrative network. Monitor financial assets, strategic objectives, and operational directives from a single command interface.
          </p>
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">2026</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-white">Active Cycle</span>
            </div>
            <div className="w-px h-12 bg-white/20 mx-4"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">Online</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-white">Registry Status</span>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 text-[20rem] opacity-10 pointer-events-none text-white font-black">🏢</div>
      </section>

      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="text-[#00326b]" size={24} />
          <h2 className="text-2xl font-black text-[#00326b] uppercase tracking-tight">Administrative Hubs</h2>
          <div className="h-px flex-grow bg-gradient-to-r from-[#00326b]/20 to-transparent"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          <HubLink href="/planning" icon={<Compass size={24} />} label="Planning" color="bg-[#9ADBDE]" />
          <HubLink href="/finance" icon={<Landmark size={24} />} label="Finance" color="bg-[#FFC68D]" />
          <HubLink href="/icaap" icon={<ShieldCheck size={24} />} label="iCAAP" color="bg-[#FFA1AB]" />
          <HubLink href="/health" icon={<HeartPulse size={24} />} label="Health" color="bg-[#99B3C5]" />
          <HubLink href="/goals" icon={<Target size={24} />} label="Goals" color="bg-[#FFC68D]" />
          <HubLink href="/tasks" icon={<ClipboardList size={24} />} label="Tasks" color="bg-[#9ADBDE]" />
          <HubLink href="/hoa" icon={<HomeIcon size={24} />} label="HOA" color="bg-[#99B3C5]" />
          <HubLink href="/csea" icon={<Scale size={24} />} label="CSEA" color="bg-[#FFA1AB]" />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <CalendarIcon className="text-[#00326b]" size={24} />
            <h2 className="text-2xl font-black text-[#00326b] uppercase tracking-tight">Operational Calendar</h2>
            <div className="h-px flex-grow bg-gradient-to-r from-[#00326b]/20 to-transparent"></div>
          </div>
          
          <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-sm overflow-hidden p-8">
            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24"></div>
              ))}
              {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayMeetings = meetings.filter(m => m.date === dateStr);
                const isToday = day === new Date().getDate() && new Date().getMonth() === new Date().getMonth();
                
                return (
                  <div key={day} className={`h-24 rounded-2xl border-2 transition-all p-3 flex flex-col gap-1 overflow-hidden ${
                    isToday ? 'bg-[#00326b] border-[#00326b] shadow-lg shadow-[#00326b]/20 scale-105 relative z-10' : 'bg-slate-50 border-transparent hover:border-[#00326b]/10 hover:bg-white'
                  }`}>
                    <span className={`text-sm font-black ${isToday ? 'text-white' : 'text-gray-700'}`}>{day}</span>
                    <div className="flex flex-col gap-1">
                      {dayMeetings.slice(0, 2).map(m => (
                        <div key={m.id} className={`text-[8px] p-1 rounded font-black uppercase tracking-tighter truncate ${
                          isToday ? 'bg-white/20 text-white' : 'bg-[#00326b]/10 text-[#00326b]'
                        }`}>
                          {m.title}
                        </div>
                      ))}
                      {dayMeetings.length > 2 && (
                        <div className={`text-[8px] font-black uppercase ${isToday ? 'text-white/60' : 'text-gray-400'}`}>
                          + {dayMeetings.length - 2} More
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <Clock className="text-[#00326b]" size={24} />
            <h2 className="text-2xl font-black text-[#00326b] uppercase tracking-tight">Directives</h2>
            <div className="h-px flex-grow bg-gradient-to-r from-[#00326b]/20 to-transparent"></div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-4">
            {loading ? (
              <div className="py-20 text-center">
                <Activity className="text-slate-300 animate-pulse mx-auto mb-4" size={32} />
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing...</div>
              </div>
            ) : meetings.length > 0 ? (
              meetings.slice(0, 6).map((meeting) => (
                <div key={meeting.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                  <div>
                    <div className="text-sm font-black text-[#00326b] uppercase tracking-tight truncate max-w-[150px]">{meeting.title}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(meeting.date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-[#00326b] opacity-40">{meeting.start_time}</div>
                    <ChevronRight size={16} className="text-slate-200 group-hover:translate-x-1 group-hover:text-[#00326b] transition-all ml-auto mt-1" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center italic text-gray-400 text-sm">No scheduled events</div>
            )}
            <Link href="/planning/meetings" className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white border-2 border-[#00326b]/10 text-[#00326b] font-black uppercase tracking-widest text-[10px] hover:bg-[#00326b] hover:text-white transition-all">
              Launch Meeting Registry
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-[#00326b]" size={24} />
              <h2 className="text-2xl font-black text-[#00326b] uppercase tracking-tight">System Security</h2>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed italic mb-8">
              Your administrative network is fully operational. All data points are encrypted and verified across the secure ledger.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[#00326b] font-black text-xs uppercase tracking-[0.2em] bg-white p-4 rounded-2xl border">
            <ArrowUpRight size={16} />
            Network Integrity Verified
          </div>
        </div>

        <div className="bg-[#00326b]/5 p-10 rounded-[3rem] border-2 border-[#00326b]/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-[#00326b]" size={24} />
              <h2 className="text-2xl font-black text-[#00326b] uppercase tracking-tight">Performance Metrics</h2>
            </div>
            <p className="text-[#00326b]/70 font-medium leading-relaxed italic mb-8">
              Operational velocity is within optimal parameters. Strategic objectives are advancing at the projected rate.
            </p>
          </div>
          <div className="text-4xl font-black text-[#00326b] opacity-10">2026 Cycle Insights</div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Life Architecture Command © 2026</p>
      </footer>
    </div>
  );
}

function HubLink({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link href={href} className="group relative p-6 rounded-[2rem] bg-white border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 overflow-hidden flex flex-col items-center gap-4">
      <div className={`absolute -right-4 -top-4 w-16 h-16 ${color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-[#00326b] shadow-inner relative z-10 group-hover:rotate-6 transition-transform`}>
        {icon}
      </div>
      <span className="text-sm font-black text-[#00326b] uppercase tracking-widest relative z-10">{label}</span>
      <div className="absolute bottom-2 right-4 opacity-0 group-hover:opacity-100 group-hover:right-2 transition-all">
        <ChevronRight size={14} className="text-[#00326b]" />
      </div>
    </Link>
  );
}
