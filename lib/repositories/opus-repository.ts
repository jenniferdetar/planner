import { createClient } from '@/lib/supabase/client'

export const opusRepository = {
  // Tasks
  async getTasks() {
    const supabase = createClient()
    const { data, error } = await supabase.from('tasks').select('*')
    if (error) throw error
    return data
  },

  async createTask(task: any) {
    const supabase = createClient()
    const { data, error } = await supabase.from('tasks').insert(task).select().single()
    if (error) throw error
    return data
  },

  async updateTask(id: string, updates: any) {
    const supabase = createClient()
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async deleteTask(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
  },

  // Calendar
  async getRecurringEvents() {
    const supabase = createClient()
    const { data, error } = await supabase.from('calendar_recurring').select('*')
    if (error) throw error
    return (data || []).map(ev => ({
      title: ev.title,
      frequency: ev.frequency,
      startDate: ev.start_date,
      endDate: ev.end_date,
      time: ev.time,
      endTime: ev.end_time,
      pattern: ev.pattern,
      dayOfMonth: ev.day_of_month,
      weekdays: ev.weekdays,
      skipMonths: ev.skip_months,
      skipHolidays: ev.skip_holidays,
      skipDates: ev.skip_dates,
      category: ev.category
    }))
  },

  async getEventsByDate() {
    const supabase = createClient()
    const { data, error } = await supabase.from('calendar_by_date').select('*')
    if (error) throw error
    
    const byDate: Record<string, any[]> = {}
    data?.forEach(ev => {
      if (!byDate[ev.date]) byDate[ev.date] = []
      byDate[ev.date].push({
        title: ev.title,
        category: ev.category
      })
    })
    return byDate
  },

  // Goals
  async getSMARTGoals() {
    const supabase = createClient()
    const { data, error } = await supabase.from('goals').select('*')
    if (error) throw error
    
    const goals: Record<string, any> = {}
    data?.forEach(g => {
      goals[g.title] = {
        category: g.category,
        specific: g.specific,
        measurable: g.measurable,
        achievable: g.achievable,
        relevant: g.relevant,
        timebound: g.timebound,
        statement: g.statement,
        weeklyTasks: g.weekly_tasks,
        tiesTo: g.ties_to
      }
    })
    return goals
  },

  // Hours Worked
  async getHoursWorked() {
    const supabase = createClient()
    const { data, error } = await supabase.from('hours_worked').select('*').order('name')
    if (error) throw error
    return data || []
  },

  // Vision Board
  async getVisionBoardPhotos() {
    const supabase = createClient()
    const { data, error } = await supabase.from('vision_board_photos').select('*')
    if (error) throw error
    return data || []
  },

  // Work Planner Persistence
  async getWorkPlannerEdits() {
    const supabase = createClient()
    const { data, error } = await supabase.from('work_planner_edits').select('*')
    if (error) throw error
    
    const edits: Record<string, any> = {}
    data?.forEach(e => {
      if (!edits[e.date_key]) edits[e.date_key] = {}
      edits[e.date_key][e.slot_key] = e.value
    })
    return edits
  },

  async upsertWorkPlannerEdit(dateKey: string, slotKey: string, value: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('work_planner_edits').upsert({
      date_key: dateKey,
      slot_key: slotKey,
      value: value,
      user_id: user?.id
    }, { onConflict: 'date_key,slot_key,user_id' })
    
    if (error) throw error
  },

  async getUserPriorities() {
    const supabase = createClient()
    const { data, error } = await supabase.from('user_priorities').select('*')
    if (error) throw error
    
    const priorities: Record<string, string> = {}
    data?.forEach(p => {
      priorities[p.key] = p.value
    })
    return priorities
  },

  async upsertUserPriority(key: string, value: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('user_priorities').upsert({
      key: key,
      value: value,
      user_id: user?.id
    }, { onConflict: 'key,user_id' })
    
    if (error) throw error
  },

  // Assets (Storage)
  async getAssetUrl(path: string, bucket: string = 'assets') {
    const supabase = createClient()
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }
}
