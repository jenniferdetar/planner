import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useMasterTasks, useDailyTasks, useMeetings, useNotes, useTaskCounts } from './hooks/usePlannerData'
import { useCalendarEvents } from './hooks/useCalendarEvents'
import { useCseaIssues, useMemberInteractions } from './hooks/useCseaData'
import { useTransactions, useBills, useFinancialGoals } from './hooks/useFinancialData'
import { useAsanaTasks } from './hooks/useAsanaTasks'
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
  const [view, setView] = useState('month')
  const [calViewYear, setCalViewYear] = useState(today.getFullYear())
  const [calViewMonth, setCalViewMonth] = useState(today.getMonth())

  const userId = user?.id ?? null
  const quote = QUOTES[today.getDate() % QUOTES.length]

  const { tasks: masterTasks, addTask: addMasterTask, deleteTask: deleteMasterTask } = useMasterTasks(userId)
  const { tasks: dailyTasks, addTask: addDailyTask, toggleTask: toggleDailyTask, deleteTask: deleteDailyTask, updateTaskDescription } = useDailyTasks(userId, selectedDate)
  const { meetings, addMeeting, deleteMeeting } = useMeetings(userId, selectedDate)
  const { content: noteContent, onChange: onNoteChange } = useNotes(userId, selectedDate)
  const taskCounts = useTaskCounts(userId)
  const { issues: cseaIssues, addIssue: addCseaIssue, updateIssueStatus: updateCseaStatus, deleteIssue: deleteCseaIssue } = useCseaIssues(userId)
  const { interactions: cseaInteractions, addInteraction: addCseaInteraction } = useMemberInteractions(userId)
  const { todayTasks: asanaTodayTasks, completeTask: completeAsanaTask, updateTaskNotes: updateAsanaNotes } = useAsanaTasks()
  const { transactions, addTransaction, deleteTransaction } = useTransactions(userId)
  const { bills, addBill, toggleBillPaid, deleteBill } = useBills(userId)
  const { goals, addGoal, updateGoalAmount, deleteGoal } = useFinancialGoals(userId)

  // Merge Asana tasks into local lists (read-only, source='asana')
  const allMasterTasks = masterTasks
  const allDailyTasks = [...dailyTasks, ...asanaTodayTasks]

  // Fetch Google Calendar events: full month grid when in month view, else current week
  const calFetchStart = (() => {
    if (view === 'month') {
      const d = new Date(calViewYear, calViewMonth, 1)
      d.setDate(d.getDate() - d.getDay()) // back to Sunday
      return d
    }
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - d.getDay())
    return d
  })()
  const calFetchEnd = (() => {
    if (view === 'month') {
      const d = new Date(calViewYear, calViewMonth, 1)
      d.setDate(d.getDate() - d.getDay() + 41) // 6 weeks of grid
      return d
    }
    const d = new Date(calFetchStart)
    d.setDate(d.getDate() + 6)
    return d
  })()

  const { events: calEvents } = useCalendarEvents(providerToken, calFetchStart, calFetchEnd)

  // Merge Supabase meetings + Google Calendar events into time blocks for the selected day
  const dateStr = selectedDate.toISOString().split('T')[0]
  const supabaseBlocks = meetings.map((m) => meetingToBlock(m, BLOCK_COLORS[0]))
  const gcalBlocksForDay = calEvents.filter((e) => e.startIso?.startsWith(dateStr))
  const allTimeBlocks = [...supabaseBlocks, ...gcalBlocksForDay]

  async function handleAddBlock(hour, text, color) {
    await addMeeting(text, hour, color)
  }

  async function handleToggleDailyTask(id) {
    if (String(id).startsWith('asana_')) return completeAsanaTask(id)
    return toggleDailyTask(id)
  }

  async function handleDeleteDailyTask(id) {
    if (String(id).startsWith('asana_')) return completeAsanaTask(id)
    return deleteDailyTask(id)
  }

  async function handleUpdateTaskNotes(id, notes) {
    if (String(id).startsWith('asana_')) return updateAsanaNotes(id, notes)
    return updateTaskDescription(id, notes)
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
        dailyTasks={allDailyTasks}
        timeBlocks={allTimeBlocks}
        onAddTask={addDailyTask}
        onToggleTask={handleToggleDailyTask}
        onDeleteTask={handleDeleteDailyTask}
        onUpdateTaskNotes={handleUpdateTaskNotes}
        onAddBlock={handleAddBlock}
        onDeleteBlock={handleDeleteBlock}
        view={view}
        onViewChange={(v) => {
          if (v === 'month') { setCalViewYear(selectedDate.getFullYear()); setCalViewMonth(selectedDate.getMonth()) }
          setView(v)
        }}
        taskCounts={taskCounts}
        cseaIssues={cseaIssues}
        onAddCseaIssue={addCseaIssue}
        onUpdateCseaStatus={updateCseaStatus}
        onDeleteCseaIssue={deleteCseaIssue}
        cseaInteractions={cseaInteractions}
        onAddCseaInteraction={addCseaInteraction}
        onMonthChange={(y, m) => { setCalViewYear(y); setCalViewMonth(m) }}
        transactions={transactions}
        onAddTransaction={addTransaction}
        onDeleteTransaction={deleteTransaction}
        bills={bills}
        onAddBill={addBill}
        onToggleBillPaid={toggleBillPaid}
        onDeleteBill={deleteBill}
        goals={goals}
        onAddGoal={addGoal}
        onUpdateGoalAmount={updateGoalAmount}
        onDeleteGoal={deleteGoal}
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
