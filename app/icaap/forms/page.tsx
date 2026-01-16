'use client';

import React from 'react';
import Link from 'next/link';

const forms = [
  {
    title: 'Purchase Requisition',
    description: 'Submit a request for supplies or services.',
    icon: '🛒',
    href: '/icaap/forms/purchase-requisition'
  },
  {
    title: 'Transcript Request',
    description: 'Request official or unofficial transcripts.',
    icon: '📜',
    href: '#'
  },
  {
    title: 'Professional Expert Agreement',
    description: 'Update your annual contract details.',
    icon: '✍️',
    href: '#'
  },
  {
    title: 'Travel Reimbursement',
    description: 'Claim mileage and travel expenses.',
    icon: '🚗',
    href: '#'
  }
];

export default function IcaapFormsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#00326b]">iCAAP Forms</h1>
          <p className="text-gray-600">Quick access to professional documents</p>
        </div>
        <Link href="/icaap" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
          Back
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.map((form) => (
          <div key={form.title} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl shrink-0">
              {form.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#00326b] mb-1">{form.title}</h2>
              <p className="text-gray-500 text-sm mb-4">{form.description}</p>
              {form.href === '#' ? (
                <span className="text-gray-400 text-sm font-bold italic cursor-not-allowed">Coming Soon</span>
              ) : (
                <Link href={form.href} className="text-blue-600 font-bold hover:underline text-sm">
                  Open Form →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
