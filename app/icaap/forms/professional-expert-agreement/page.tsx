'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  UserCircle, Briefcase, 
  Landmark, ShieldCheck, Calendar, Clock, DollarSign,
  UserCheck, AlertCircle
} from 'lucide-react';

interface PEAData {
  expert: {
    name: string;
    employeeId: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
  };
  agreement: {
    serviceDescription: string;
    startDate: string;
    endDate: string;
    rateType: 'hourly' | 'daily' | 'flat';
    rate: number;
    maxHours: number;
    totalAmount: number;
  };
  office: {
    name: string;
    contact: string;
    phone: string;
    date: string;
  };
  accounting: {
    cc: string;
    fund: string;
    functionalArea: string;
    glAccount: string;
  };
}

const INITIAL_DATA: PEAData = {
  expert: {
    name: '',
    employeeId: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
  },
  agreement: {
    serviceDescription: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    rateType: 'hourly',
    rate: 0,
    maxHours: 0,
    totalAmount: 0,
  },
  office: {
    name: 'iCAAP / Induction',
    contact: 'Patricia Pernin, Ed.D.',
    phone: '213-241-2468',
    date: new Date().toISOString().split('T')[0],
  },
  accounting: {
    cc: '',
    fund: '',
    functionalArea: '',
    glAccount: '',
  },
};

export default function ProfessionalExpertAgreementPage() {
  const [data, setData] = useState<PEAData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      setLoading(true);
      const { data: metadata } = await supabase
        .from('opus_metadata')
        .select('value')
        .eq('key', 'professionalExpertAgreementData')
        .single();

      if (!ignore) {
        if (metadata?.value) {
          setData(metadata.value as PEAData);
        }
        setLoading(false);
      }
    };

    fetchData();
    return () => { ignore = true; };
  }, []);

  const totalAmount = useMemo(() => {
    if (data.agreement.rateType === 'flat') return data.agreement.rate;
    return data.agreement.rate * data.agreement.maxHours;
  }, [data.agreement.rate, data.agreement.maxHours, data.agreement.rateType]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">

      {/* Form Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-2 border-gray-100 shadow-xl">
          <Clock className="animate-spin text-[#0a2f5f] mb-4" size={48} />
          <div className="text-xs font-black  tracking-widest text-gray-400">Loading Agreement Details...</div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-2xl overflow-hidden mb-12">
          {/* Official Header Section */}
          <div className="bg-[#0a2f5f] p-10 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-[0.2em]  mb-1">Los Angeles Unified School District</h2>
            <h3 className="text-lg font-bold opacity-80  tracking-widest mb-4">Professional Expert Assignment Agreement</h3>
            <div className="inline-block px-8 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <span className="text-xs font-black  tracking-[0.3em]">Contractual Service Authorization</span>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] opacity-5 pointer-events-none font-black">Expert</div>
        </div>

        <div className="p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            {/* Expert Details */}
            <div className="group relative bg-white p-10 rounded-[3rem] border-2 border-gray-100 hover:border-[#FFC68D]/20 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-8 border-b border-gray-50 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FFC68D]/20 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                  <UserCircle className="text-[#0a2f5f]" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#0a2f5f]  tracking-tight">Expert / Consultant</h4>
                  <p className="text-[10px] font-bold text-gray-400  tracking-widest">Personal Information</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Full Legal Name</label>
                    <input 
                      type="text" 
                      value={data.expert.name} 
                      onChange={e => setData({...data, expert: {...data.expert, name: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Employee Id (if applicable)</label>
                    <input 
                      type="text" 
                      value={data.expert.employeeId} 
                      onChange={e => setData({...data, expert: {...data.expert, employeeId: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Mailing Address</label>
                  <input 
                    type="text" 
                    value={data.expert.address} 
                    onChange={e => setData({...data, expert: {...data.expert, address: e.target.value}})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">City</label>
                    <input 
                      type="text" 
                      value={data.expert.city} 
                      onChange={e => setData({...data, expert: {...data.expert, city: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">State</label>
                      <input 
                        type="text" 
                        value={data.expert.state} 
                        onChange={e => setData({...data, expert: {...data.expert, state: e.target.value}})}
                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 text-center shadow-inner "
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Zip</label>
                      <input 
                        type="text" 
                        value={data.expert.zip} 
                        onChange={e => setData({...data, expert: {...data.expert, zip: e.target.value}})}
                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Phone Number</label>
                    <input 
                      type="tel" 
                      value={data.expert.phone} 
                      onChange={e => setData({...data, expert: {...data.expert, phone: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Email Address</label>
                    <input 
                      type="email" 
                      value={data.expert.email} 
                      onChange={e => setData({...data, expert: {...data.expert, email: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Details */}
            <div className="group relative bg-white p-10 rounded-[3rem] border-2 border-gray-100 hover:border-[#FFC68D]/20 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-8 border-b border-gray-50 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#9ADBDE]/20 flex items-center justify-center shadow-inner group-hover:-rotate-6 transition-transform">
                  <Briefcase className="text-[#0a2f5f]" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#0a2f5f]  tracking-tight">Assignment Details</h4>
                  <p className="text-[10px] font-bold text-gray-400  tracking-widest">Scope of Services</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Description of Services</label>
                  <div className="relative">
                    <textarea 
                      value={data.agreement.serviceDescription} 
                      onChange={e => setData({...data, agreement: {...data.agreement, serviceDescription: e.target.value}})}
                      placeholder="Provide a detailed description of the professional expert services to be performed..."
                      className="w-full px-8 py-8 bg-[#fdfbf7] border-2 border-[#e6e2d3] rounded-2xl text-lg font-serif leading-loose focus:ring-4 focus:ring-[#FFC68D]/5 outline-none transition-all shadow-inner min-h-[200px] resize-none"
                      style={{ 
                        backgroundImage: 'linear-gradient(#e6e2d3 1px, transparent 1px)', 
                        backgroundSize: '100% 2.5rem',
                        lineHeight: '2.5rem',
                        paddingTop: '2rem'
                      }}
                    />
                    <div className="absolute top-0 left-12 bottom-0 w-0.5 bg-red-200/30"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Service Start Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={data.agreement.startDate} 
                        onChange={e => setData({...data, agreement: {...data.agreement, startDate: e.target.value}})}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                      />
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#0a2f5f]/30" size={20} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Service End Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={data.agreement.endDate} 
                        onChange={e => setData({...data, agreement: {...data.agreement, endDate: e.target.value}})}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                      />
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#0a2f5f]/30" size={20} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Rate Type</label>
                    <select 
                      value={data.agreement.rateType}
                      onChange={e => setData({...data, agreement: {...data.agreement, rateType: e.target.value as PEAData['agreement']['rateType']}})}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="flat">Flat Fee</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Rate ($)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={data.agreement.rate} 
                        onChange={e => setData({...data, agreement: {...data.agreement, rate: parseFloat(e.target.value) || 0}})}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                      />
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0a2f5f]/30" size={18} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Max Hours/Days</label>
                    <input 
                      type="number" 
                      value={data.agreement.maxHours} 
                      onChange={e => setData({...data, agreement: {...data.agreement, maxHours: parseFloat(e.target.value) || 0}})}
                      disabled={data.agreement.rateType === 'flat'}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-inner disabled:opacity-30"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Accounting & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Accounting Codes */}
            <div className="lg:col-span-8 bg-gray-50 rounded-[3rem] p-10 border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <Landmark className="text-[#0a2f5f]" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#0a2f5f]  tracking-tight">Accounting Codes</h4>
                  <p className="text-[10px] font-bold text-gray-400  tracking-widest">Funding Allocation</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Cost Center</label>
                  <input 
                    type="text" 
                    value={data.accounting.cc} 
                    onChange={e => setData({...data, accounting: {...data.accounting, cc: e.target.value}})}
                    className="w-full px-4 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-sm text-center"
                    placeholder="1XXXXXX"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Fund</label>
                  <input 
                    type="text" 
                    value={data.accounting.fund} 
                    onChange={e => setData({...data, accounting: {...data.accounting, fund: e.target.value}})}
                    className="w-full px-4 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-sm text-center"
                    placeholder="010-Xxxx"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Func. Area</label>
                  <input 
                    type="text" 
                    value={data.accounting.functionalArea} 
                    onChange={e => setData({...data, accounting: {...data.accounting, functionalArea: e.target.value}})}
                    className="w-full px-4 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-sm text-center"
                    placeholder="Xxxx-Xxxx-Xxxxx"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Gl Account</label>
                  <input 
                    type="text" 
                    value={data.accounting.glAccount} 
                    onChange={e => setData({...data, accounting: {...data.accounting, glAccount: e.target.value}})}
                    className="w-full px-4 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-[#FFC68D]/20 outline-none transition-all font-bold text-gray-700 shadow-sm text-center"
                    placeholder="Xxxxxx"
                  />
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="lg:col-span-4">
              <div className="bg-[#0a2f5f] rounded-[3rem] p-10 text-white shadow-2xl shadow-[#0a2f5f]/30 relative overflow-hidden h-full">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-white/60 font-black  tracking-widest text-[10px] mb-6 flex items-center gap-2">
                      <ShieldCheck size={14} />
                      Agreement Value
                    </h4>
                    <div className="text-6xl font-black mb-2 tracking-tighter">
                      ${totalAmount.toLocaleString()}
                    </div>
                    <p className="text-white/40 text-[10px] font-bold  tracking-widest">Estimated Total Contract Amount</p>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-[10px] font-black  tracking-widest">Rate</span>
                      <span className="font-bold">${data.agreement.rate} / {data.agreement.rateType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-[10px] font-black  tracking-widest">Duration</span>
                      <span className="font-bold">{data.agreement.maxHours} {data.agreement.rateType === 'hourly' ? 'Hours' : 'Days'}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 text-[12rem] opacity-10 pointer-events-none font-black">$</div>
              </div>
            </div>
          </div>

          {/* Authorization Section */}
          <div className="mt-12 p-10 bg-white border-2 border-gray-100 rounded-[3rem] group hover:border-[#FFC68D]/20 transition-all duration-500">
            <h4 className="text-[#0a2f5f] font-black  tracking-widest text-xs mb-8 flex items-center gap-2">
              <UserCheck size={18} />
              Administrative Authorization
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="h-16 border-b-2 border-gray-200 flex items-end pb-2 italic text-gray-300 font-serif">Signature of Expert</div>
                <div className="text-[10px] font-black text-gray-400  tracking-widest">Expert / Consultant Signature</div>
              </div>
              <div className="space-y-4">
                <div className="h-16 border-b-2 border-gray-200 flex items-end pb-2 font-bold text-[#0a2f5f]  tracking-tight">Patricia Pernin, Ed.D.</div>
                <div className="text-[10px] font-black text-gray-400  tracking-widest">Department Head / Designee</div>
              </div>
              <div className="space-y-4">
                <div className="h-16 border-b-2 border-gray-200 flex items-end pb-2 font-bold text-[#0a2f5f]">{data.office.date}</div>
                <div className="text-[10px] font-black text-gray-400  tracking-widest">Date of Execution</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
          <p className="text-[9px] font-bold text-gray-400  tracking-[0.3em]">
            Form Hr-Pea-2026 • Electronic Processing via iCAAP Administrative Suite
          </p>
        </div>
      </div>
      )}

      {/* Compliance Note */}
      <div className="flex items-center gap-4 p-8 bg-amber-50 rounded-[2.5rem] border-2 border-amber-100 mb-12 print:hidden">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <AlertCircle className="text-amber-600" size={24} />
        </div>
        <div>
          <h5 className="text-amber-800 font-black text-xs  tracking-widest mb-1">Compliance Requirement</h5>
          <p className="text-amber-700/70 text-sm font-medium">
            Agreement must be fully executed and approved by the Human Resources Division prior to the commencement of any professional services. Attach specialized credentials if required.
          </p>
        </div>
      </div>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center print:hidden">
        <p className="text-gray-400 text-[10px] font-black  tracking-[0.4em]">iCAAP Contractual Services Division © 2026</p>
      </footer>

      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .p-4, .p-12 { padding: 0 !important; }
          .max-w-7xl { max-width: none !important; }
          .shadow-2xl, .shadow-xl, .shadow-sm { shadow: none !important; box-shadow: none !important; }
          .rounded-[3rem], .rounded-[2.5rem] { border-radius: 0 !important; }
          .border-2 { border-width: 1px !important; }
          .bg-gray-50, .bg-[#fdfdfd] { background: white !important; }
          input, textarea, select { border: 1px solid #eee !important; background: white !important; }
        }
      `}</style>
    </div>
  );
}
