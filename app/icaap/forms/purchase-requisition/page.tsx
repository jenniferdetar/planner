'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  ChevronLeft, Printer, Save, Trash2, Plus, 
  Building2, UserCircle, Briefcase, FileText, 
  Landmark, Receipt, ShieldCheck, Calculator,
  History
} from 'lucide-react';

interface PRItem {
  id: string;
  qty: number;
  unit: string;
  pg: string;
  commodityCode: string;
  description: string;
  unitCost: number;
}

interface PRData {
  isWarehouseOrder: boolean;
  isOutsideVendor: boolean;
  vendor: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    contact: string;
    phone: string;
    email: string;
  };
  office: {
    name: string;
    requestor: string;
    phone: string;
    cubicle: string;
    date: string;
  };
  items: PRItem[];
  justification: {
    usedBy: string;
    reason1: string;
    reason2: string;
  };
  accounting: {
    cc1: string; fund1: string; func1: string; gl1: string;
    cc2: string; fund2: string; func2: string; gl2: string;
    cc3: string; fund3: string; func3: string; gl3: string;
  };
  tax: number;
  delivery: number;
}

const EMPTY_ITEM = (): PRItem => ({
  id: crypto.randomUUID(),
  qty: 0,
  unit: '',
  pg: '',
  commodityCode: '',
  description: '',
  unitCost: 0,
});

const INITIAL_DATA: PRData = {
  isWarehouseOrder: false,
  isOutsideVendor: false,
  vendor: {
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    contact: '',
    phone: '',
    email: '',
  },
  office: {
    name: '',
    requestor: 'Patricia Pernin, Ed.D.',
    phone: '213-241-2468',
    cubicle: '15-162',
    date: new Date().toISOString().split('T')[0],
  },
  items: Array.from({ length: 8 }, () => EMPTY_ITEM()),
  justification: {
    usedBy: '',
    reason1: '',
    reason2: '',
  },
  accounting: {
    cc1: '', fund1: '', func1: '', gl1: '',
    cc2: '', fund2: '', func2: '', gl2: '',
    cc3: '', fund3: '', func3: '', gl3: '',
  },
  tax: 0,
  delivery: 0,
};

export default function PurchaseRequisitionPage() {
  const [data, setData] = useState<PRData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (ignore = false) => {
    const { data: metadata } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', 'purchaseRequisitionData')
      .single();

    if (!ignore) {
      if (metadata?.value) {
        setData(metadata.value as PRData);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    // Use setTimeout to move the call to the next tick, avoiding synchronous setState in effect
    const timeoutId = setTimeout(() => {
      void fetchData(ignore);
    }, 0);
    return () => { 
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in to save.');
      setSaving(false);
      return;
    }

    await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: 'purchaseRequisitionData',
        value: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });
    
    setSaving(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const updateItem = (index: number, field: keyof PRItem, value: string | number) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value } as PRItem;
    setData({ ...data, items: newItems });
  };

  const addItem = () => {
    setData({ ...data, items: [...data.items, EMPTY_ITEM()] });
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    setData({ ...data, items: newItems });
  };

  const calculateSubtotal = () => {
    return data.items.reduce((sum, item) => sum + (item.qty * item.unitCost), 0);
  };

  const subtotal = calculateSubtotal();
  const total = subtotal + data.tax + data.delivery;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">

      {/* Form Container */}
      <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-2xl overflow-hidden mb-12">
        {/* Official Header Section */}
        <div className="bg-[#0a2f5f] p-10 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-[0.2em]  mb-1">Los Angeles Unified School District</h2>
            <h3 className="text-lg font-bold opacity-80  tracking-widest mb-4">Human Resources Division • Management Services</h3>
            <div className="inline-block px-8 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <span className="text-xs font-black  tracking-[0.3em]">Purchase Requisition Form</span>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] opacity-5 pointer-events-none font-black">Lausd</div>
        </div>

        <div className="p-10">
          {/* Order Type Selection */}
          <div className="flex flex-wrap gap-8 mb-12 p-8 bg-gray-50 rounded-[2.5rem] border-2 border-gray-100 shadow-inner">
            <label className="group flex items-center gap-4 cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={data.isWarehouseOrder} 
                  onChange={e => setData({...data, isWarehouseOrder: e.target.checked})}
                  className="peer appearance-none w-10 h-10 rounded-2xl border-2 border-gray-300 checked:border-[#0a2f5f] checked:bg-[#0a2f5f] transition-all cursor-pointer shadow-sm"
                />
                <Plus className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-[#0a2f5f]  tracking-wider group-hover:translate-x-1 transition-transform">District Warehouse Order</span>
                <span className="text-[10px] font-bold text-gray-400  tracking-widest">Standard Inventory fulfillment</span>
              </div>
            </label>
            <div className="w-px h-12 bg-gray-200 hidden lg:block"></div>
            <label className="group flex items-center gap-4 cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={data.isOutsideVendor} 
                  onChange={e => setData({...data, isOutsideVendor: e.target.checked})}
                  className="peer appearance-none w-10 h-10 rounded-2xl border-2 border-gray-300 checked:border-[#0a2f5f] checked:bg-[#0a2f5f] transition-all cursor-pointer shadow-sm"
                />
                <Plus className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-[#0a2f5f]  tracking-wider group-hover:translate-x-1 transition-transform">Outside Vendor</span>
                <span className="text-[10px] font-bold text-gray-400  tracking-widest">Quote document must be attached</span>
              </div>
            </label>
          </div>

          {/* Vendor & Office Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            {/* Vendor Box */}
            <div className="group relative bg-white p-10 rounded-[3rem] border-2 border-gray-100 hover:border-[#0a2f5f]/20 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-8 border-b border-gray-50 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#99B3C5]/20 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                  <Building2 className="text-[#0a2f5f]" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#0a2f5f]  tracking-tight">Vendor Details</h4>
                  <p className="text-[10px] font-bold text-gray-400  tracking-widest">Payee Information</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Company Name</label>
                  <input 
                    type="text" 
                    value={data.vendor.name} 
                    onChange={e => setData({...data, vendor: {...data.vendor, name: e.target.value}})}
                    placeholder="Enter vendor name..."
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0a2f5f]/20 focus:ring-4 focus:ring-[#0a2f5f]/5 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-200"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Mailing Address</label>
                  <textarea 
                    value={data.vendor.address} 
                    onChange={e => setData({...data, vendor: {...data.vendor, address: e.target.value}})}
                    placeholder="Street address or Po Box..."
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0a2f5f]/20 focus:ring-4 focus:ring-[#0a2f5f]/5 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-200 min-h-[120px] resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">City</label>
                    <input 
                      type="text" 
                      value={data.vendor.city} 
                      onChange={e => setData({...data, vendor: {...data.vendor, city: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0a2f5f]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">State / Zip Code</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={data.vendor.state} 
                        onChange={e => setData({...data, vendor: {...data.vendor, state: e.target.value}})}
                        className="w-1/3 px-2 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0a2f5f]/20 outline-none transition-all font-bold text-gray-700 text-center shadow-inner "
                      />
                      <input 
                        type="text" 
                        value={data.vendor.zip} 
                        onChange={e => setData({...data, vendor: {...data.vendor, zip: e.target.value}})}
                        className="flex-1 px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0a2f5f]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Requesting Office Box */}
            <div className="group relative bg-white p-10 rounded-[3rem] border-2 border-gray-100 hover:border-[#0a2f5f]/20 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-8 border-b border-gray-50 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FFA1AB]/20 flex items-center justify-center shadow-inner group-hover:-rotate-6 transition-transform">
                  <Briefcase className="text-[#0a2f5f]" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#0a2f5f]  tracking-tight">Requesting Office</h4>
                  <p className="text-[10px] font-bold text-gray-400  tracking-widest">Department Source</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Office / Unit Name</label>
                  <input 
                    type="text" 
                    value={data.office.name} 
                    onChange={e => setData({...data, office: {...data.office, name: e.target.value}})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0a2f5f]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Official Requestor</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={data.office.requestor} 
                      onChange={e => setData({...data, office: {...data.office, requestor: e.target.value}})}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0a2f5f]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                    <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0a2f5f]/40" size={24} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Phone Extension</label>
                    <input 
                      type="text" 
                      value={data.office.phone} 
                      onChange={e => setData({...data, office: {...data.office, phone: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0a2f5f]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Location / Cubicle</label>
                    <input 
                      type="text" 
                      value={data.office.cubicle} 
                      onChange={e => setData({...data, office: {...data.office, cubicle: e.target.value}})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0a2f5f]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Document Date</label>
                  <input 
                    type="date" 
                    value={data.office.date} 
                    onChange={e => setData({...data, office: {...data.office, date: e.target.value}})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0a2f5f]/20 outline-none transition-all font-bold text-gray-700 shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#9ADBDE]/20 flex items-center justify-center shadow-inner">
                  <Receipt className="text-[#0a2f5f]" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#0a2f5f]  tracking-tight">Line Item Details</h4>
                  <p className="text-[10px] font-bold text-gray-400  tracking-widest">Inventory & Service breakdown</p>
                </div>
              </div>
              <button 
                onClick={addItem}
                className="group flex items-center gap-2 px-8 py-3 bg-[#0a2f5f] text-white font-black text-[10px]  tracking-widest rounded-2xl hover:bg-[#0a2f5f] transition-all shadow-xl shadow-[#0a2f5f]/20"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Add New Row
              </button>
            </div>

            <div className="overflow-hidden rounded-[2.5rem] border-2 border-gray-100 shadow-xl bg-white">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 border-b-2 border-gray-100">
                      <th className="p-6 text-center font-black text-[#0a2f5f]  tracking-widest w-[80px]">Ln</th>
                      <th className="p-6 text-center font-black text-[#0a2f5f]  tracking-widest w-[100px]">Qty</th>
                      <th className="p-6 text-center font-black text-[#0a2f5f]  tracking-widest w-[100px]">Unit</th>
                      <th className="p-6 text-center font-black text-[#0a2f5f]  tracking-widest w-[100px]">Pg</th>
                      <th className="p-6 text-left font-black text-[#0a2f5f]  tracking-widest w-[220px]">Stock # / Code</th>
                      <th className="p-6 text-left font-black text-[#0a2f5f]  tracking-widest">Description</th>
                      <th className="p-6 text-right font-black text-[#0a2f5f]  tracking-widest w-[140px]">Unit Cost</th>
                      <th className="p-6 text-right font-black text-[#0a2f5f]  tracking-widest w-[160px]">Total</th>
                      <th className="p-6 text-center w-[80px] print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.items.map((item, idx) => (
                      <tr key={item.id} className="group hover:bg-[#0a2f5f]/5 transition-colors">
                        <td className="p-6 font-black text-[#0a2f5f] bg-gray-50/30 group-hover:bg-[#0a2f5f]/10 transition-colors text-center text-sm">{idx + 1}</td>
                        <td className="p-2">
                          <input 
                            type="number" 
                            value={item.qty || ''} 
                            onChange={e => updateItem(idx, 'qty', parseFloat(e.target.value) || 0)}
                            className="w-full p-4 bg-transparent focus:bg-white rounded-xl outline-none font-bold text-center group-hover:bg-white/50 transition-all text-base"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="text" 
                            value={item.unit} 
                            onChange={e => updateItem(idx, 'unit', e.target.value)}
                            className="w-full p-4 bg-transparent focus:bg-white rounded-xl outline-none font-black text-center  group-hover:bg-white/50 transition-all text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="text" 
                            value={item.pg} 
                            onChange={e => updateItem(idx, 'pg', e.target.value)}
                            className="w-full p-4 bg-transparent focus:bg-white rounded-xl outline-none font-bold text-center group-hover:bg-white/50 transition-all text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="text" 
                            value={item.commodityCode} 
                            onChange={e => updateItem(idx, 'commodityCode', e.target.value)}
                            className="w-full p-4 bg-transparent focus:bg-white rounded-xl outline-none font-bold group-hover:bg-white/50 transition-all text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <textarea 
                            value={item.description} 
                            onChange={e => updateItem(idx, 'description', e.target.value)}
                            className="w-full p-4 bg-transparent focus:bg-white rounded-xl outline-none font-medium group-hover:bg-white/50 transition-all text-sm min-h-[50px] resize-none"
                          />
                        </td>
                        <td className="p-2">
                          <div className="relative group/cost">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input 
                              type="number" 
                              value={item.unitCost || ''} 
                              onChange={e => updateItem(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                              className="w-full pl-8 pr-4 py-4 bg-transparent focus:bg-white rounded-xl outline-none font-black text-right group-hover:bg-white/50 transition-all text-base"
                            />
                          </div>
                        </td>
                        <td className="p-6 text-right font-black text-[#0a2f5f] text-base">
                          ${(item.qty * item.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-center print:hidden">
                          <button 
                            onClick={() => removeItem(idx)}
                            className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Justification & Financials */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-7 space-y-10">
              <div className="bg-gray-50 p-10 rounded-[3rem] border-2 border-gray-100 shadow-inner">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    <FileText className="text-[#0a2f5f]" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#0a2f5f]  tracking-tight">Justification</h4>
                    <p className="text-[10px] font-bold text-gray-400  tracking-widest">Reasoning for procurement</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Equipment to be used by</label>
                    <input 
                      type="text" 
                      value={data.justification.usedBy} 
                      onChange={e => setData({...data, justification: {...data.justification, usedBy: e.target.value}})}
                      className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-[#0a2f5f]/20 outline-none transition-all font-bold text-gray-700 shadow-sm"
                      placeholder="Name of individual or unit..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest ml-2">Formal Reason for Request</label>
                    <textarea 
                      value={data.justification.reason1} 
                      onChange={e => setData({...data, justification: {...data.justification, reason1: e.target.value}})}
                      className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-[#0a2f5f]/20 outline-none transition-all font-bold text-gray-700 shadow-sm min-h-[100px] resize-none leading-relaxed"
                      placeholder="Primary justification line..."
                    />
                    <textarea 
                      value={data.justification.reason2} 
                      onChange={e => setData({...data, justification: {...data.justification, reason2: e.target.value}})}
                      className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-[#0a2f5f]/20 outline-none transition-all font-bold text-gray-700 shadow-sm min-h-[100px] resize-none leading-relaxed"
                      placeholder="Supplemental justification line..."
                    />
                  </div>
                </div>
              </div>

              {/* Accounting Process */}
              <div className="bg-white p-10 rounded-[3rem] border-2 border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFC68D]/20 flex items-center justify-center shadow-inner">
                    <Calculator className="text-[#0a2f5f]" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#0a2f5f]  tracking-tight">Accounting Process</h4>
                    <p className="text-[10px] font-bold text-gray-400  tracking-widest">Funding allocation strings</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm">
                  <table className="w-full border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-4 text-center font-black text-[#0a2f5f]  tracking-widest w-[60px]">Acct</th>
                        <th className="p-4 text-left font-black text-[#0a2f5f]  tracking-widest">Cost Center</th>
                        <th className="p-4 text-left font-black text-[#0a2f5f]  tracking-widest w-[100px]">Fund</th>
                        <th className="p-4 text-left font-black text-[#0a2f5f]  tracking-widest w-[120px]">Functional Area</th>
                        <th className="p-4 text-left font-black text-[#0a2f5f]  tracking-widest w-[120px]">Gl / Acct</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[1, 2, 3].map(num => (
                        <tr key={num} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 text-center font-black text-[#0a2f5f] bg-gray-50/20">0{num}</td>
                          <td className="p-1">
                            <input 
                              type="text" 
                              value={(data.accounting as Record<string, string>)[`cc${num}`]} 
                              onChange={e => setData({...data, accounting: {...data.accounting, [`cc${num}`]: e.target.value}})}
                              className="w-full p-3 bg-transparent focus:bg-white rounded-lg outline-none font-bold transition-all text-gray-600"
                            />
                          </td>
                          <td className="p-1">
                            <input 
                              type="text" 
                              value={(data.accounting as Record<string, string>)[`fund${num}`]} 
                              onChange={e => setData({...data, accounting: {...data.accounting, [`fund${num}`]: e.target.value}})}
                              className="w-full p-3 bg-transparent focus:bg-white rounded-lg outline-none font-bold transition-all text-gray-600"
                            />
                          </td>
                          <td className="p-1">
                            <input 
                              type="text" 
                              value={(data.accounting as Record<string, string>)[`func${num}`]} 
                              onChange={e => setData({...data, accounting: {...data.accounting, [`func${num}`]: e.target.value}})}
                              className="w-full p-3 bg-transparent focus:bg-white rounded-lg outline-none font-bold transition-all text-gray-600"
                            />
                          </td>
                          <td className="p-1">
                            <input 
                              type="text" 
                              value={(data.accounting as Record<string, string>)[`gl${num}`]} 
                              onChange={e => setData({...data, accounting: {...data.accounting, [`gl${num}`]: e.target.value}})}
                              className="w-full p-3 bg-transparent focus:bg-white rounded-lg outline-none font-bold transition-all text-gray-600"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-[#0a2f5f] p-12 rounded-[4rem] text-white shadow-2xl shadow-[#0a2f5f]/30 sticky top-12 overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-sm font-black  tracking-[0.3em] mb-10 text-white/50 border-b border-white/10 pb-4">Financial Summary</h4>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span className="opacity-40  text-[10px] tracking-[0.2em]">Merchandise Subtotal</span>
                      <span className="font-black font-mono tracking-tight">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span className="opacity-40  text-[10px] tracking-[0.2em]">Estimated Sales Tax</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">$</span>
                        <input 
                          type="number" 
                          value={data.tax || ''} 
                          onChange={e => setData({...data, tax: parseFloat(e.target.value) || 0})}
                          className="w-40 bg-white/10 border-2 border-white/5 outline-none text-right pl-6 pr-3 py-3 focus:bg-white/20 focus:border-white/20 transition-all rounded-2xl font-black font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span className="opacity-40  text-[10px] tracking-[0.2em]">Delivery & Handling</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">$</span>
                        <input 
                          type="number" 
                          value={data.delivery || ''} 
                          onChange={e => setData({...data, delivery: parseFloat(e.target.value) || 0})}
                          className="w-40 bg-white/10 border-2 border-white/5 outline-none text-right pl-6 pr-3 py-3 focus:bg-white/20 focus:border-white/20 transition-all rounded-2xl font-black font-mono"
                        />
                      </div>
                    </div>
                    <div className="pt-10 mt-10 border-t border-white/10">
                      <div className="flex justify-between items-end mb-8">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black  tracking-[0.4em] text-white/40 mb-2">Total Fiscal Obligation</span>
                          <span className="text-6xl font-black text-[#ffca38] tracking-tighter font-mono">
                            ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="bg-[#ffca38]/20 w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner mb-2">
                          <Landmark className="text-[#ffca38]" size={32} />
                        </div>
                      </div>
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                        <div className="flex items-center gap-3 text-[#ffca38] mb-2">
                          <ShieldCheck size={18} />
                          <span className="text-[10px] font-black  tracking-widest">Encumbrance Verification</span>
                        </div>
                        <p className="text-[10px] text-white/50 leading-relaxed font-bold italic">
                          &quot;I hereby certify that the items listed are necessary for the conduct of official business of the Los Angeles Unified School District.&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-20 -right-20 text-[20rem] opacity-5 pointer-events-none font-black select-none">$$$</div>
              </div>
            </div>
          </div>

          {/* Approval Process Section */}
          <div className="mt-20 pt-16 border-t-2 border-gray-100">
            <div className="flex items-center gap-4 mb-12 justify-center">
              <History className="text-[#0a2f5f]" size={24} />
              <h4 className="text-2xl font-black text-[#0a2f5f]  tracking-[0.2em]">Official Approval Workflow</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="relative group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-[#0a2f5f] border-4 border-white shadow-lg group-hover:scale-110 transition-transform">01</div>
                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-sm group-hover:shadow-xl transition-all h-full">
                  <h5 className="text-xs font-black  tracking-widest text-gray-400 mb-6">Unit Administrator</h5>
                  <div className="space-y-4">
                    <div className="h-px bg-gray-100 w-full mb-8"></div>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black  tracking-widest opacity-30">Signature</span>
                      <span className="text-[10px] font-black  tracking-widest opacity-30">Date</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-[#0a2f5f] border-4 border-white shadow-lg group-hover:scale-110 transition-transform">02</div>
                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-sm group-hover:shadow-xl transition-all h-full">
                  <h5 className="text-xs font-black  tracking-widest text-gray-400 mb-6">Budget Approval</h5>
                  <div className="space-y-4">
                    <div className="h-px bg-gray-100 w-full mb-8"></div>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black  tracking-widest opacity-30">Signature</span>
                      <span className="text-[10px] font-black  tracking-widest opacity-30">Date</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-[#0a2f5f] border-4 border-white shadow-lg group-hover:scale-110 transition-transform">03</div>
                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-sm group-hover:shadow-xl transition-all h-full">
                  <h5 className="text-xs font-black  tracking-widest text-gray-400 mb-1 leading-tight">Branch Administrator</h5>
                  <p className="text-[9px] font-bold text-gray-300  tracking-tighter mb-4">(Orders $500.00+)</p>
                  <div className="space-y-4">
                    <div className="h-px bg-gray-100 w-full mb-8"></div>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black  tracking-widest opacity-30">Signature</span>
                      <span className="text-[10px] font-black  tracking-widest opacity-30">Date</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black  tracking-[0.4em]">Lausd Management Services Document Repository © 2026</p>
      </footer>

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0a2f5f] mb-6 shadow-2xl"></div>
          <div className="text-xs font-black  tracking-[0.5em] text-[#0a2f5f] animate-pulse">Initializing Document...</div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page {
            size: portrait;
            margin: 0.5in;
          }
          header, footer, .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
          }
          .bg-white {
            border: none !important;
            box-shadow: none !important;
          }
          .bg-[#0a2f5f] {
            background-color: #0a2f5f !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
          }
          .bg-gray-50 {
            background-color: #f9f9f9 !important;
            -webkit-print-color-adjust: exact;
          }
          input, textarea {
            border-bottom: 1px solid #ddd !important;
            background: transparent !important;
          }
          .rounded-[3rem], .rounded-[4rem], .rounded-[2.5rem] {
            border-radius: 0.5rem !important;
          }
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
