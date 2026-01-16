'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, FileText, ClipboardCheck, Scroll, FileEdit, Truck, ArrowRight } from 'lucide-react';

const forms = [
  {
    title: 'Purchase Requisition',
    description: 'Formal request for departmental supplies, instructional materials, or specialized services.',
    icon: <ClipboardCheck className="text-[#0a2f5f]" size={24} />,
    href: '/icaap/forms/purchase-requisition',
    color: 'bg-[#99B3C5]'
  },
  {
    title: 'Transcript Request',
    description: 'Order official or unofficial academic transcripts for credential verification and career advancement.',
    icon: <Scroll className="text-[#0a2f5f]" size={24} />,
    href: '/icaap/forms/transcript-request',
    color: 'bg-[#FFA1AB]'
  },
  {
    title: 'Professional Expert Agreement',
    description: 'Annual contract update and specialized service agreement for expert consultants.',
    icon: <FileEdit className="text-[#0a2f5f]" size={24} />,
    href: '/icaap/forms/professional-expert-agreement',
    color: 'bg-[#FFC68D]'
  },
  {
    title: 'Travel Reimbursement',
    description: 'Claim professional mileage, conference expenses, and approved travel-related disbursements.',
    icon: <Truck className="text-[#0a2f5f]" size={24} />,
    href: '/icaap/forms/travel-reimbursement',
    color: 'bg-[#9ADBDE]'
  }
];

export default function IcaapFormsPage() {
  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto bg-[#fdfdfd] min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-[#00326b] flex items-center justify-center shadow-xl shadow-[#00326b]/20">
              <FileText className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#00326b] tracking-tight uppercase">iCAAP Forms</h1>
              <p className="text-gray-400 font-bold tracking-widest text-xs">Official Professional Documentation Repository</p>
            </div>
          </div>
        </div>
        <Link href="/icaap" className="flex items-center gap-2 px-6 py-2 bg-white border-2 border-[#00326b]/10 rounded-full font-bold text-[#00326b] hover:bg-[#00326b]/5 transition-all shadow-sm">
          <ChevronLeft size={20} />
          Back to Hub
        </Link>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {forms.map((form) => (
          <div key={form.title} className="group relative flex flex-col p-8 rounded-[3rem] border-2 border-gray-100 bg-white hover:border-[#00326b]/10 hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <div className={`absolute -right-10 -top-10 w-40 h-40 ${form.color} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-1000`}></div>
            
            <div className="relative z-10 flex gap-6 items-start">
              <div className={`w-16 h-16 rounded-[1.5rem] ${form.color} flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform`}>
                {form.icon}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-black text-[#00326b]">{form.title}</h2>
                  {form.href === '#' && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 bg-gray-50 px-3 py-1 rounded-full border">In Queue</span>
                  )}
                </div>
                <p className="text-gray-500 font-medium leading-relaxed mb-6">
                  {form.description}
                </p>
                
                {form.href === '#' ? (
                  <div className="flex items-center gap-2 text-gray-300 font-black text-xs uppercase tracking-widest cursor-not-allowed">
                    Under Development <ArrowRight size={14} />
                  </div>
                ) : (
                  <Link 
                    href={form.href} 
                    className="inline-flex items-center gap-2 text-[#00326b] font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all"
                  >
                    Initiate Document <ArrowRight size={14} className="text-[#00326b]" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="bg-[#00326b] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-black mb-4">Submission Guidelines</h3>
            <p className="text-white/70 font-medium leading-relaxed mb-6">
              All documents are processed within 3-5 business days. Ensure all mandatory fields are completed to avoid processing delays in your professional advancement track.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                <span className="text-xs font-black uppercase tracking-widest opacity-60">Real-time Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
                <span className="text-xs font-black uppercase tracking-widest opacity-60">Secure Storage</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-black mb-1">100%</div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-tight">Digital Filing</div>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-black mb-1">24/7</div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-tight">Access Availability</div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 text-[20rem] opacity-5 pointer-events-none">📋</div>
      </div>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">iCAAP Documentation Portal © 2026</p>
      </footer>
    </div>
  );
}
