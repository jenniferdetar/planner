'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
    fetchHealthData();
  }, []);

  async function fetchHealthData() {
    setLoading(true);
    const { data: metadata, error } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', 'opus-health-data')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Error fetching health data:', error);
    } else if (metadata?.value) {
      setData(metadata.value as typeof MASTER_LIST);
    }
    setLoading(false);
  }

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
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#0ea5e9]">Health Hub</h1>
          <p className="text-gray-600">Wellness & Medication Tracking</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('produce')}
            className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'produce' ? 'bg-[#0ea5e9] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Produce Inventory
          </button>
          <button 
            onClick={() => setActiveTab('medication')}
            className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'medication' ? 'bg-[#0ea5e9] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Medication Tracker
          </button>
        </div>
      </header>

      <div className="bg-white p-8 rounded-xl border shadow-sm">
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading health data...</div>
        ) : activeTab === 'produce' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ListSection title="🍎 Fruits" type="fruits" items={data.fruits} onUpdate={updateItem} onAdd={addItem} onRemove={removeItem} />
            <ListSection title="🥦 Vegetables" type="vegetables" items={data.vegetables} onUpdate={updateItem} onAdd={addItem} onRemove={removeItem} />
            <ListSection title="🥜 Legumes & Nuts" type="legumes" items={data.legumes} onUpdate={updateItem} onAdd={addItem} onRemove={removeItem} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <ListSection title="💊 Medication" type="medication" items={data.medication} onUpdate={updateItem} onAdd={addItem} onRemove={removeItem} />
          </div>
        )}
      </div>

      <footer className="mt-12 text-center text-sm text-gray-400 italic">
        "Your peace is protected on purpose."
      </footer>
    </div>
  );
}

function ListSection({ title, type, items, onUpdate, onAdd, onRemove }: any) {
  return (
    <section>
      <h2 className="text-2xl font-handwriting mb-4 text-[#0ea5e9] border-b pb-2">{title}</h2>
      <div className="space-y-2">
        {items.map((item: string, index: number) => (
          <div key={index} className="flex items-center gap-2 group">
            <input 
              type="text" 
              value={item} 
              onChange={(e) => onUpdate(type, index, e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg text-gray-700 font-medium"
            />
            <button 
              onClick={() => onRemove(type, index)}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button 
        onClick={() => onAdd(type)}
        className="mt-4 text-sm text-green-600 font-bold hover:underline"
      >
        + Add Item
      </button>
    </section>
  );
}
