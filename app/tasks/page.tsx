import { supabase } from '@/lib/supabase';
import { OpusTask } from '@/types/database.types';

export default async function TasksPage() {
  const { data: tasks, error } = await supabase
    .from('opus_tasks')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) {
    return <div className="p-8 text-red-500">Error loading tasks: {error.message}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>
      <div className="grid gap-4">
        {tasks?.map((task: OpusTask) => (
          <div key={task.id} className="p-4 border rounded-lg shadow-sm bg-white flex items-center justify-between">
            <div>
              <h2 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h2>
              <div className="text-sm text-gray-600">
                {task.due_date && <span>Due: {task.due_date} </span>}
                {task.priority && (
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' : 
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {task.priority}
                  </span>
                )}
              </div>
              {task.description && <p className="text-sm mt-1">{task.description}</p>}
            </div>
            <div className="flex items-center">
              <span className={`text-xs px-2 py-1 rounded ${task.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {task.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>
        ))}
        {tasks?.length === 0 && <p className="text-gray-500">No tasks found.</p>}
      </div>
    </div>
  );
}
