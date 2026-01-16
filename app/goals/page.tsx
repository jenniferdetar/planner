import { supabase } from '@/lib/supabase';
import { OpusGoal } from '@/types/database.types';

export default async function GoalsPage() {
  const { data: goals, error } = await supabase
    .from('opus_goals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Error loading goals: {error.message}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Goals</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {goals?.map((goal: OpusGoal) => (
          <div key={goal.id} className="p-6 border rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{goal.title}</h2>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                {goal.category}
              </span>
            </div>
            
            {goal.description && <p className="text-gray-600 text-sm mb-4">{goal.description}</p>}
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{goal.progress_percent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${goal.progress_percent}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded ${
                goal.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {goal.status}
              </span>
            </div>
          </div>
        ))}
        {goals?.length === 0 && <p className="text-gray-500 col-span-2">No goals found.</p>}
      </div>
    </div>
  );
}
