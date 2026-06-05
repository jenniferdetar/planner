import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useMasterTasks, useDailyTasks, useMeetings, useNotes, useTaskCounts } from './hooks/usePlannerData'
import { useCalendarEvents } from './hooks/useCalendarEvents'
import Sidebar from './components/Sidebar'
import DailyPlanner from './components/DailyPlanner'
import RightPanel from './components/RightPanel'
import LoginScreen from './components/LoginScreen'
import './App.css'

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It's not about having time, it's about making time.", author: "Unknown" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Small steps every day.", author: "Unknown" },
]

// Color palette for Supabase-created time blocks
const BLOCK_COLORS = ['#4a90d9', '#e05c5c', '#5cb85c', '#f0a040', '#9b59b6', '#c9a96e']

function meetingToBlock(meeting, color) {
  const hour = parseInt(meeting.start_time?.split(':')[0] ?? '9', 10)
  return {
    id: meeting.id,
    hour,
    text: meeting.title,
    color: color ?? '#4a90d9',
    source: 'supabase',
  }
}

export default function App() {
  const today = new Date()
  const { session, user, providerToken, loading } = useAuth()
  const [selectedDate, setSelectedDate] = useState(today)
  const [view, setView] = useState('day')

  const userId = user?.id ?? null
  const quote = QUOTES[today.getDate() % QUOTES.length]

  const { tasks: masterTasks, addTask: addMasterTask, deleteTask: deleteMasterTask } = useMasterTasks(userId)
  const { tasks: dailyTasks, addTask: addDailyTask, toggleTask: toggleDailyTask, deleteTask: deleteDailyTask } = useDailyTasks(userId, selectedDate)
  const { meetings, addMeeting, deleteMeeting } = useMeetings(userId, selectedDate)
  const { content: noteContent, onChange: onNoteChange } = useNotes(userId, selectedDate)
  const taskCounts = useTaskCounts(userId)

  // Fetch Google Calendar events for the current week
  const weekStart = new Date(selectedDate)
  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const { events: calEvents } = useCalendarEvents(providerToken, weekStart, weekEnd)

  // Merge Supabase meetings + Google Calendar events into time blocks for the selected day
  const dateStr = selectedDate.toISOString().split('T')[0]
  const supabaseBlocks = meetings.map((m) => meetingToBlock(m, BLOCK_COLORS[0]))
  const gcalBlocksForDay = calEvents.filter((e) => e.startIso?.startsWith(dateStr))
  const allTimeBlocks = [...supabaseBlocks, ...gcalBlocksForDay]

  async function handleAddBlock(hour, text, color) {
    await addMeeting(text, hour, color)
  }

  async function handleDeleteBlock(id) {
    if (String(id).startsWith('gcal_')) return // Google Calendar events are read-only
    await deleteMeeting(id)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f4f0', fontFamily: 'Inter, sans-serif', color: '#aaa', fontSize: 14 }}>
        Loading…
      </div>
    )
  }

  if (!session) return <LoginScreen />

  return (
    <div className="app">
      <Sidebar
        masterTasks={masterTasks}
        onAddTask={addMasterTask}
        onDeleteTask={deleteMasterTask}
        quote={quote}
        user={user}
      />
      <DailyPlanner
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        dailyTasks={dailyTasks}
        timeBlocks={allTimeBlocks}
        onAddTask={addDailyTask}
        onToggleTask={toggleDailyTask}
        onDeleteTask={deleteDailyTask}
        onAddBlock={handleAddBlock}
        onDeleteBlock={handleDeleteBlock}
        view={view}
        onViewChange={setView}
      />
      <RightPanel
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        taskCounts={taskCounts}
        dailyTasks={dailyTasks}
        timeBlocks={allTimeBlocks}
        noteContent={noteContent}
        onNoteChange={onNoteChange}
      />
    </div>
  )
}
