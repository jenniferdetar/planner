'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OpusTask } from '@/types/database.types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<OpusTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      const { data, error } = await supabase
        .from('opus_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        setError(error.message);
      } else {
        setTasks(data || []);
      }
      setLoading(false);
    }

    fetchTasks();
  }, []);

  if (error) {
    return <div className="p-8 text-red-500">Error loading tasks: {error}</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#0f3d91]">Tasks</h1>
        <p className="text-gray-600">Stay organized and productive</p>
      </header>

      {loading ? (
        <div className="text-center text-gray-500 py-12 italic">Loading tasks...</div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task: OpusTask) => (
            <div key={task.id} className="p-5 border rounded-xl shadow-sm bg-white flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className={`font-bold text-lg ${task.completed ? 'line-through text-gray-400' : 'text-[#0a2f5f]'}`}>
                    {task.title}
                  </h2>
                  {task.priority && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' : 
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {task.priority}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  {task.due_date && (
                    <span className="flex items-center gap-1">
                      <span>📅</span> {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                  {task.category && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">
                      {task.category}
                    </span>
                  )}
                </div>
                {task.description && <p className="text-sm text-gray-600 mt-2 italic">{task.description}</p>}
              </div>
              <div className="ml-4">
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                  task.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  {task.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">Your task list is empty. Take it easy!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
