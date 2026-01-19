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

export interface CseaMember {
  id: string;
  user_id: string;
  member_id: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface CseaSteward {
  id: string;
  name: string;
  role: string | null;
  title: string | null;
  district: string | null;
  office: string | null;
  email: string | null;
  phone: string | null;
  focus_areas: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CseaIssue {
  id: string;
  user_id: string;
  member_id: string | null;
  issue_type: 'Grievance' | 'Gripe' | 'Complaint' | null;
  description: string | null;
  steward: string | null;
  priority: 'Low' | 'Medium' | 'High' | null;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | null;
  issue_date: string | null;
  created_at: string;
  updated_at: string;
  csea_members?: CseaMember;
}

export interface CheckBreakdown {
  id: number;
  account: string | null;
  [key: string]: string | number | boolean | null | undefined | { [key: string]: unknown } | unknown[];
}

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  account: string;
  amount: number;
  category: string;
  updated_at: string;
}

export interface OpusMetadata {
  user_id: string;
  key: string;
  value: string | number | boolean | null | { [key: string]: unknown } | unknown[];
  updated_at: string;
}
