'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OpusGoal } from '@/types/database.types';

export default function GoalsPage() {
  const [goals, setGoals] = useState<OpusGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGoals() {
      setLoading(true);
      const { data, error } = await supabase
        .from('opus_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        setError(error.message);
      } else {
        setGoals(data || []);
      }
      setLoading(false);
    }

    fetchGoals();
  }, []);

  if (error) {
    return <div className="p-8 text-red-500">Error loading goals: {error}</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#0f3d91]">Goals</h1>
        <p className="text-gray-600">Track your progress and achievements</p>
      </header>

      {loading ? (
        <div className="text-center text-gray-500 py-12 italic">Loading goals...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {goals.map((goal: OpusGoal) => (
            <div key={goal.id} className="p-6 border rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-[#0a2f5f]">{goal.title}</h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-100 text-[#0f3d91]">
                  {goal.category}
                </span>
              </div>
              
              {goal.description && <p className="text-gray-600 text-sm mb-4">{goal.description}</p>}
              
              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                  <span>PROGRESS</span>
                  <span>{goal.progress_percent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${goal.progress_percent}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                  goal.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {goal.status}
                </span>
              </div>
            </div>
          ))}
          {goals.length === 0 && (
            <div className="col-span-2 text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">No goals found. Start by adding one!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
