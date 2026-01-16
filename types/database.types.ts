export interface OpusMeeting {
  id: string;
  user_id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  attendees: string[] | null;
  agenda: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpusGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  category: string;
  progress_percent: number;
  created_at: string;
  updated_at: string;
}

export interface OpusTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  priority: string;
  completed: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}
