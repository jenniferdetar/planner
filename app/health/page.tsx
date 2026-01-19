'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Activity, Apple, Beaker, 
  Plus, Trash2, ShieldCheck,
  Stethoscope, Pill, Leaf, TrendingUp
} from 'lucide-react';

const MASTER_LIST = {
  fruits: [
    'Apple', 'Banana', 'Blackberry', 'Blueberry', 'Cantaloupes', 'Date', 'Fig', 'Grape','Honeydew', 'Pear', 'Raspberry',
    'Strawberries', 'Watermelon'
  ],
  vegetables: [
    'Basil', 'Beet Root','Broccoli', 'Carrot','Celery', 'Chives', 'Cilantro','Corn', 'Cucumber', 'Daikon', 'Dill',
    'Garlic', 'Ginger', 'Iceberg Lettuce','Lettuce', 'Mustard', 'Onion', 'Parsley', 'Peppers', 'Potato', 'Romaine Lettuce', 'Spinach', 'Thyme', 'Tomato', 
  ],
  legumes: [
    'Acorns', 'Almonds', 'Cashews', 'Green Bean', 'Peanuts', 'Peas', 'Pecans', 'Walnuts'
  ],
  medication: [
    'Ozempic 4 mg/3ml Inj Novo',
    'Glipizide 5 mg Tab Apot',
    'Ozempic 8 mg/3ml Inj Novo',
    'Rosuvastatin 20 mg Tab Torr',
    'Ozempic 2 mg/3ml Inj Novo',
    'Buspirone 10 mg Tab Unic',
    'Jardiance 25 MG Tab Boeh',
    'Metformin 1,000 mg Tab Gran',
    'Estradiol 2 mg Tab Nort',
    'Bupropion XL 300 mg Tab Lupi',
    'Nexium 24HR 20 mg Oral Cpdr Sr Cap'
  ]
};

export default function HealthPage() {
  const [activeTab, setActiveTab] = useState('produce');
  const [data, setData] = useState(MASTER_LIST);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchHealthData() {
      setLoading(true);
      const { data: metadata, error } = await supabase
        .from('opus_metadata')
        .select('value')
        .eq('key', 'opus-health-data')
        .single();
      
      if (!ignore) {
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching health data:', error);
        } else if (metadata?.value) {
          setData(metadata.value as typeof MASTER_LIST);
        }
        setLoading(false);
      }
    }

    fetchHealthData();
    return () => { ignore = true; };
  }, []);

  async function saveHealthData(newData: typeof MASTER_LIST) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: 'opus-health-data',
        value: newData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) {
      console.error('Error saving health data:', error);
    }
  }

  const addItem = (type: keyof typeof MASTER_LIST) => {
    const newData = {
      ...data,
      [type]: [...data[type], '']
    };
    setData(newData);
    saveHealthData(newData);
  };

  const updateItem = (type: keyof typeof MASTER_LIST, index: number, value: string) => {
    const newList = [...data[type]];
    newList[index] = value;
    const newData = {
      ...data,
      [type]: newList
    };
    setData(newData);
    // Use a debounce if needed, but for now simple save
    saveHealthData(newData);
  };

  const removeItem = (type: keyof typeof MASTER_LIST, index: number) => {
    const newList = [...data[type]];
    newList.splice(index, 1);
    const newData = {
      ...data,
      [type]: newList
    };
    setData(newData);
    saveHealthData(newData);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#fdfdfd] min-h-screen">
<div className="flex flex-wrap gap-4 mb-12">
        <button 
          onClick={() => setActiveTab('produce')}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black  tracking-widest text-xs transition-all ${
            activeTab === 'produce' 
              ? 'bg-[#9ADBDE] text-[#0a2f5f] shadow-lg' 
              : 'bg-white text-[#0a2f5f] border-2 border-[#9ADBDE]/20 hover:bg-[#9ADBDE]/5'
          }`}
        >
          <Leaf size={16} />
          Produce Inventory
        </button>
        <button 
          onClick={() => setActiveTab('medication')}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black  tracking-widest text-xs transition-all ${
            activeTab === 'medication' 
              ? 'bg-[#9ADBDE] text-[#0a2f5f] shadow-lg' 
              : 'bg-white text-[#0a2f5f] border-2 border-[#9ADBDE]/20 hover:bg-[#9ADBDE]/5'
          }`}
        >
          <Pill size={16} />
          Medication Tracker
        </button>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Activity className="text-slate-300 animate-pulse mb-4" size={48} />
            <div className="text-slate-400 font-black  tracking-widest text-xs">Accessing Medical Records...</div>
          </div>
        ) : activeTab === 'produce' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ListSection title="Fruits" type="fruits" icon={<Apple size={20} className="text-[#0a2f5f]" />} items={data.fruits} onUpdate={updateItem} onAdd={addItem} onRemove={removeItem} color="bg-[#9ADBDE]" />
            <ListSection title="Vegetables" type="vegetables" icon={<Leaf size={20} className="text-[#0a2f5f]" />} items={data.vegetables} onUpdate={updateItem} onAdd={addItem} onRemove={removeItem} color="bg-[#FFC68D]" />
            <ListSection title="Legumes & Nuts" type="legumes" icon={<Activity size={20} className="text-[#0a2f5f]" />} items={data.legumes} onUpdate={updateItem} onAdd={addItem} onRemove={removeItem} color="bg-[#99B3C5]" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <ListSection 
              title="Medication Registry" 
              type="medication" 
              icon={<Beaker size={20} className="text-[#0a2f5f]" />} 
              items={data.medication} 
              onUpdate={updateItem} 
              onAdd={addItem} 
              onRemove={removeItem} 
              color="bg-[#FFA1AB]"
              isLarge
            />
          </div>
        )}
      </div>

      <section className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-[#0a2f5f]" size={24} />
              <h2 className="text-2xl font-black text-[#0a2f5f]  tracking-tight">Data Integrity</h2>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed italic mb-8">
              Wellness records are synchronized with the secure administrative ledger to ensure continuity of care.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[#0a2f5f] font-black text-xs  tracking-[0.2em] bg-white p-4 rounded-2xl border">
            <Stethoscope size={16} />
            Medical Records Verified
          </div>
        </div>

        <div className="bg-[#9ADBDE]/10 p-10 rounded-[3rem] border-2 border-[#9ADBDE]/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-[#0a2f5f]" size={24} />
              <h2 className="text-2xl font-black text-[#0a2f5f]  tracking-tight">Vitality Metrics</h2>
            </div>
            <p className="text-[#0a2f5f]/70 font-medium leading-relaxed italic mb-8">
              Current nutritional intake and medication adherence are within optimal parameters. Maintain consistency.
            </p>
          </div>
          <div className="text-4xl font-black text-[#0a2f5f] opacity-20 italic">&quot;Your peace is protected on purpose.&quot;</div>
        </div>
      </section>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black  tracking-[0.4em]">Health & Wellness Registry © 2026</p>
      </footer>
    </div>
  );
}

interface ListSectionProps {
  title: string;
  type: keyof typeof MASTER_LIST;
  icon: React.ReactNode;
  items: string[];
  onUpdate: (type: keyof typeof MASTER_LIST, index: number, value: string) => void;
  onAdd: (type: keyof typeof MASTER_LIST) => void;
  onRemove: (type: keyof typeof MASTER_LIST, index: number) => void;
  color: string;
  isLarge?: boolean;
}

function ListSection({ title, type, icon, items, onUpdate, onAdd, onRemove, color, isLarge }: ListSectionProps) {
  return (
    <section className={`flex flex-col h-full bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500`}>
      <div className="p-8 border-b-2 border-slate-50">
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-inner`}>
            {icon}
          </div>
          <h2 className="text-xl font-black text-[#0a2f5f]  tracking-tight">{title}</h2>
        </div>
        <p className="text-[10px] font-black text-gray-400  tracking-widest">
          {items.length} Registered Items
        </p>
      </div>

      <div className={`flex-grow p-6 ${isLarge ? 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2' : 'space-y-2'}`}>
        {items.map((item: string, index: number) => (
          <div key={index} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className={`w-2 h-2 rounded-full ${color} opacity-20 group-hover:opacity-100 transition-opacity`}></div>
            <input 
              type="text" 
              value={item} 
              onChange={(e) => onUpdate(type, index, e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-gray-700 font-bold placeholder:text-gray-300"
              placeholder="Enter record..."
            />
            <button 
              onClick={() => onRemove(type, index)}
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-400 italic">No records found</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50/50 mt-auto">
        <button 
          onClick={() => onAdd(type)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white border-2 border-[#0a2f5f]/10 text-[#0a2f5f] font-black  tracking-widest text-[10px] hover:bg-[#0a2f5f] hover:text-white hover:border-[#0a2f5f] transition-all shadow-sm"
        >
          <Plus size={14} />
          Append Record
        </button>
      </div>
    </section>
  );
}
