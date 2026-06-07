import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useMasterTasks, useDailyTasks, useMeetings, useNotes, useTaskCounts, useMeetingsInRange } from './hooks/usePlannerData'
import { usePlannerSections } from './hooks/usePlannerSections'
import { useCalendarEvents } from './hooks/useCalendarEvents'
import { useCseaIssues, useMemberInteractions } from './hooks/useCseaData'
import { useIcaapItems } from './hooks/useIcaapData'
import { useIcaapAttendance } from './hooks/useIcaapAttendance'
import { useTransactions, useBills, useFinancialGoals } from './hooks/useFinancialData'
import { useAsanaTasks } from './hooks/useAsanaTasks'
import { useLibrary } from './hooks/useLibrary'
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

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2,'0')} ${suffix}`
}

function meetingToBlock(meeting, color) {
  const hour = parseInt(meeting.start_time?.split(':')[0] ?? '9', 10)
  return {
    id: meeting.id,
    hour,
    text: meeting.title,
    color: color ?? '#4a90d9',
    source: 'supabase',
    startLabel: meeting.start_time ? formatTime(meeting.start_time) : null,
    endLabel: meeting.end_time ? formatTime(meeting.end_time) : null,
  }
}

export default function App() {
  const today = new Date()
  const { session, user, providerToken, loading, clearProviderToken } = useAuth()
  const [selectedDate, setSelectedDate] = useState(today)
  const [view, setView] = useState('month')
  const [calViewYear, setCalViewYear] = useState(today.getFullYear())
  const [calViewMonth, setCalViewMonth] = useState(today.getMonth())

  const userId = user?.id ?? null
  const quote = QUOTES[today.getDate() % QUOTES.length]

  const [mobilePanel, setMobilePanel] = useState('main') // 'sidebar' | 'main' | 'right'
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const { tasks: masterTasks, addTask: addMasterTask, deleteTask: deleteMasterTask } = useMasterTasks(userId)
  const { tasks: dailyTasks, addTask: addDailyTask, toggleTask: toggleDailyTask, deleteTask: deleteDailyTask, updateTaskDescription } = useDailyTasks(userId, selectedDate)
  const { meetings, addMeeting, deleteMeeting } = useMeetings(userId, selectedDate)
  const { content: noteContent, onChange: onNoteChange } = useNotes(userId, selectedDate)
  const taskCounts = useTaskCounts(userId)
  const { issues: cseaIssues, addIssue: addCseaIssue, updateIssueStatus: updateCseaStatus, deleteIssue: deleteCseaIssue } = useCseaIssues(userId)
  const { interactions: cseaInteractions, addInteraction: addCseaInteraction } = useMemberInteractions(userId)
  const { todayTasks: asanaTodayTasks, cseaTasks: asanaCseaTasks, icaapTasks: asanaIcaapTasks, completeTask: completeAsanaTask, updateTaskNotes: updateAsanaNotes } = useAsanaTasks()
  const { transactions, addTransaction, deleteTransaction } = useTransactions(userId)
  const { bills, addBill, toggleBillPaid, deleteBill } = useBills(userId)
  const { goals, addGoal, updateGoalAmount, deleteGoal } = useFinancialGoals(userId)
  const { items: icaapItems, addItem: addIcaapItem, updateItem: updateIcaapItem, deleteItem: deleteIcaapItem } = useIcaapItems(userId)
  const { records: attendanceRecords, upsertAttendance, updateNotes: updateAttendanceNotes } = useIcaapAttendance(userId)
  const { books, addBook, updateStatus: updateBookStatus, deleteBook, importDefaults: importBooks } = useLibrary(userId)
  const { sections, updateSection } = usePlannerSections(userId)

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

  const { events: calEvents, authExpired: calAuthExpired } = useCalendarEvents(providerToken, calFetchStart, calFetchEnd)

  // Fetch all Supabase meetings in the calendar view range for the month grid
  const rangedMeetings = useMeetingsInRange(userId, calFetchStart, calFetchEnd)

  async function reconnectGoogle() {
    clearProviderToken()
    const { supabase } = await import('./lib/supabase')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar.readonly',
        redirectTo: window.location.href,
      },
    })
  }

  // Merge Supabase meetings + Google Calendar events into time blocks for the selected day
  const dateStr = selectedDate.toISOString().split('T')[0]
  const supabaseBlocks = meetings.map((m) => meetingToBlock(m, BLOCK_COLORS[0]))
  const gcalBlocksForDay = calEvents.filter((e) => e.startIso?.startsWith(dateStr))
  const allTimeBlocks = [...supabaseBlocks, ...gcalBlocksForDay]

  // All timed events for the month calendar grid (Supabase + Google Cal)
  const supabaseBlocksForMonth = rangedMeetings.map((m) => ({
    ...meetingToBlock(m, BLOCK_COLORS[0]),
    startIso: `${m.date}T${m.start_time || '00:00:00'}`,
  }))
  const allCalendarBlocks = [...supabaseBlocksForMonth, ...calEvents]

  async function handleAddBlock(hour, text, color, startTime, endTime) {
    await addMeeting(text, hour, color, startTime, endTime)
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

  const mp = isMobile ? mobilePanel : null

  return (
    <div className="app">
      <div className={mp === 'sidebar' ? 'mobile-active' : undefined}>
        <Sidebar
          masterTasks={masterTasks}
          onAddTask={addMasterTask}
          onDeleteTask={deleteMasterTask}
          quote={quote}
          user={user}
          sections={sections}
          onUpdateSection={updateSection}
        />
      </div>
      <div className={mp === null || mp === 'main' ? 'mobile-active' : undefined}>
        <DailyPlanner
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          dailyTasks={allDailyTasks}
          timeBlocks={allTimeBlocks}
          calendarBlocks={allCalendarBlocks}
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
          asanaCseaTasks={asanaCseaTasks}
          asanaIcaapTasks={asanaIcaapTasks}
          onCompleteAsanaTask={completeAsanaTask}
          onUpdateAsanaTaskNotes={updateAsanaNotes}
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
          icaapItems={icaapItems}
          onAddIcaapItem={addIcaapItem}
          onUpdateIcaapItem={updateIcaapItem}
          onDeleteIcaapItem={deleteIcaapItem}
          attendanceRecords={attendanceRecords}
          onUpsertAttendance={upsertAttendance}
          onUpdateAttendanceNotes={updateAttendanceNotes}
          calAuthExpired={calAuthExpired}
          onReconnectGoogle={reconnectGoogle}
          books={books}
          onAddBook={addBook}
          onUpdateBookStatus={updateBookStatus}
          onDeleteBook={deleteBook}
          onImportBooks={importBooks}
        />
      </div>
      <div className={mp === 'right' ? 'mobile-active' : undefined}>
        <RightPanel
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          taskCounts={taskCounts}
          dailyTasks={dailyTasks}
          timeBlocks={allTimeBlocks}
          noteContent={noteContent}
          onNoteChange={onNoteChange}
          calAuthExpired={calAuthExpired}
          onReconnectGoogle={reconnectGoogle}
        />
      </div>
      {isMobile && (
        <nav className="mobile-nav">
          <button className={`mobile-nav-btn${mobilePanel === 'sidebar' ? ' active' : ''}`} onClick={() => setMobilePanel('sidebar')}>
            <span className="mobile-nav-icon">☰</span>
            Tasks
          </button>
          <button className={`mobile-nav-btn${mobilePanel === 'main' ? ' active' : ''}`} onClick={() => setMobilePanel('main')}>
            <span className="mobile-nav-icon">📅</span>
            Planner
          </button>
          <button className={`mobile-nav-btn${mobilePanel === 'right' ? ' active' : ''}`} onClick={() => setMobilePanel('right')}>
            <span className="mobile-nav-icon">◆</span>
            Summary
          </button>
        </nav>
      )}
    </div>
  )
}
