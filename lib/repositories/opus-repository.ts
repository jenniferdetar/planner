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

  // Goals
  async getGoals() {
    const supabase = createClient()
    const { data, error } = await supabase.from('goals').select('*')
    if (error) throw error
    return data
  },

  async createGoal(goal: any) {
    const supabase = createClient()
    const { data, error } = await supabase.from('goals').insert(goal).select().single()
    if (error) throw error
    return data
  },

  // Notes
  async getNotes() {
    const supabase = createClient()
    const { data, error } = await supabase.from('notes').select('*')
    if (error) throw error
    return data
  },

  // Meetings
  async getMeetings() {
    const supabase = createClient()
    const { data, error } = await supabase.from('meetings').select('*')
    if (error) throw error
    return data
  },

  // Preferences
  async getPreferences() {
    const supabase = createClient()
    const { data, error } = await supabase.from('preferences').select('*').single()
    if (error) throw error
    return data
  },

  async updatePreference(key: string, value: any) {
    const supabase = createClient()
    const { data, error } = await supabase.from('preferences').update({ [key]: value }).select().single()
    if (error) throw error
    return data
  }
}
