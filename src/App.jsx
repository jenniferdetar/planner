import './PlannerTheme.css'
import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { supabase, signOut, signInWithGoogle } from './lib/supabase'
import { useMasterTasks, useDailyTasks, useMeetings, useNotes, useTaskCounts, useMeetingsInRange } from './hooks/usePlannerData'
import { useDailyLog } from './hooks/useDailyLog'
import { useWeeklyTasks } from './hooks/useWeeklyTasks'
import { usePlannerSections } from './hooks/usePlannerSections'
import { useCalendarEvents } from './hooks/useCalendarEvents'
import { useCseaIssues, useMemberInteractions, useCseaNotes } from './hooks/useCseaData'
import { useIcaapItems } from './hooks/useIcaapData'
import { useIcaapAttendance } from './hooks/useIcaapAttendance'
import { useIcaapNotes } from './hooks/useIcaapNotes'
import { useTransactions, useBills, useFinancialGoals, usePaychecks } from './hooks/useFinancialData'
import { useAsanaTasks } from './hooks/useAsanaTasks'
import { useAsanaTaskTags } from './hooks/useAsanaTaskTags'
import { fetchWorkspaces, findOrCreateProject, createTask } from './lib/asana'
import { GCU_COURSES } from './components/GcuPanel'
import { useLibrary } from './hooks/useLibrary'
import { useFamilyTree } from './hooks/useFamilyTree'
import Sidebar from './components/Sidebar'
import DailyPlanner from './components/DailyPlanner'
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
const BLOCK_COLORS = ['#2d7a4f', '#1e4d31', '#4a90d9', '#e05c5c', '#f0a040', '#9b59b6']

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2,'0')} ${suffix}`
}

function meetingToBlock(meeting, fallbackColor) {
  const hour = parseInt(meeting.start_time?.split(':')[0] ?? '9', 10)
  return {
    id: meeting.id,
    hour,
    text: meeting.title,
    color: meeting.color ?? fallbackColor ?? '#4a90d9',
    source: 'supabase',
    startLabel: meeting.start_time ? formatTime(meeting.start_time) : null,
    endLabel: meeting.end_time ? formatTime(meeting.end_time) : null,
  }
}

export default function App() {
  const today = new Date()
  const { session, user, providerToken, loading, clearProviderToken } = useAuth()
  const [selectedDate, setSelectedDate] = useState(today)
  const [view, setView] = useState('day')
  const [personalSubTab, setPersonalSubTab] = useState('log')
  const [calViewYear, setCalViewYear] = useState(today.getFullYear())
  const [calViewMonth, setCalViewMonth] = useState(today.getMonth())

  const userId = user?.id ?? null
  const quote = QUOTES[today.getDate() % QUOTES.length]
  const dateStr = selectedDate.toISOString().split('T')[0]

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
  const { meetings, addMeeting, bulkAddMeetings, deleteMeeting } = useMeetings(userId, selectedDate)
  const { content: noteContent, onChange: onNoteChange } = useNotes(userId, selectedDate)
  const taskCounts = useTaskCounts(userId)
  const { issues: cseaIssues, addIssue: addCseaIssue, updateIssueStatus: updateCseaStatus, deleteIssue: deleteCseaIssue } = useCseaIssues(userId)
  const { interactions: cseaInteractions, addInteraction: addCseaInteraction, updateInteraction: updateCseaInteraction, showArchived: showArchivedInteractions, setShowArchived: setShowArchivedInteractions } = useMemberInteractions(userId)
  const { notes: cseaNotes, addNote: addCseaNote, deleteNote: deleteCseaNote } = useCseaNotes(userId)
  const { masterTasks: asanaTasks, todayTasks: asanaTodayTasks, cseaTasks: asanaCseaTasks, icaapTasks: asanaIcaapTasks, projects: asanaProjects, status: asanaStatus, completeTask: completeAsanaTask, updateTaskNotes: updateAsanaNotes, addTask: addAsanaTask, refresh: refreshAsana } = useAsanaTasks()
  const { transactions, addTransaction, deleteTransaction } = useTransactions(userId)
  const { bills, addBill, toggleBillPaid, deleteBill } = useBills(userId)
  const { goals, addGoal, updateGoalAmount, deleteGoal } = useFinancialGoals(userId)
  const { paychecks, addPaycheck, updatePaycheckAmount, togglePaycheckBill, deletePaycheck } = usePaychecks(userId)
  const { items: icaapItems, addItem: addIcaapItem, updateItem: updateIcaapItem, deleteItem: deleteIcaapItem } = useIcaapItems(userId)
  const { records: attendanceRecords, upsertAttendance, updateNotes: updateAttendanceNotes } = useIcaapAttendance(userId)
  const { notes: icaapNotes, addNote: addIcaapNote, deleteNote: deleteIcaapNote } = useIcaapNotes(userId)
  const { books, addBook, updateStatus: updateBookStatus, deleteBook, importDefaults: importBooks } = useLibrary(userId)
  const { members: familyMembers, addMember: addFamilyMember, updateMember: updateFamilyMember, deleteMember: deleteFamilyMember, importDefaults: importFamilyDefaults } = useFamilyTree(userId)
  const { sections, updateSection } = usePlannerSections(userId)
  const { tags: asanaTaskTags, cycleTag: cycleAsanaTaskTag } = useAsanaTaskTags()
  const { tasksByDate: weeklyTasks, toggleTask: toggleWeeklyTask, addTask: addWeeklyTask } = useWeeklyTasks(userId, selectedDate)
  const { addEntry: addLogEntry } = useDailyLog(userId, dateStr)

  const [gcuPushing, setGcuPushing] = useState(false)
  async function handlePushGcuToAsana() {
    const token = import.meta.env.VITE_ASANA_TOKEN
    if (!token) { alert('Asana token not configured'); return }
    setGcuPushing(true)
    try {
      const workspaces = await fetchWorkspaces(token)
      if (!workspaces.length) throw new Error('No Asana workspaces found')
      const wsGid = workspaces[0].gid
      const project = await findOrCreateProject(token, wsGid, 'GCU – MPA Government & Policy')
      for (const course of GCU_COURSES) {
        await createTask(token, wsGid, project.gid, `${course.code}: ${course.name}`, course.description)
      }
      alert(`✓ ${GCU_COURSES.length} courses pushed to Asana project "GCU – MPA Government & Policy"`)
    } catch (err) {
      console.error('GCU Asana push failed:', err)
      alert(`Failed to push to Asana: ${err.message}`)
    } finally {
      setGcuPushing(false)
    }
  }

  // Merge Asana tasks into local lists (read-only, source='asana')
  const allMasterTasks = masterTasks
  const allDailyTasks = [...dailyTasks, ...asanaTasks.filter(t => t.due_on)]

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
    d.setDate(d.getDate() + 34) // 5 weeks so week-view navigation shows future events
    return d
  })()

  const { events: calEvents, authExpired: calAuthExpired } = useCalendarEvents(providerToken, calFetchStart, calFetchEnd, clearProviderToken)

  // Fetch all Supabase meetings in the calendar view range for the month grid
  const rangedMeetings = useMeetingsInRange(userId, calFetchStart, calFetchEnd)

  async function reconnectGoogle() {
    try {
      // Clear session first, then immediately redirect to Google OAuth with calendar scope
      await supabase.auth.signOut()
      await signInWithGoogle()
    } catch (e) {
      console.error('reconnectGoogle error:', e)
      // Fallback: just redirect to Google sign-in
      await signInWithGoogle()
    }
  }

  // Merge Supabase meetings + Google Calendar events into time blocks for the selected day
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
    if (String(id).startsWith('asana_')) {
      const task = allDailyTasks.find(t => t.id === id)
      if (task && !task.completed) addLogEntry(`Completed: ${task.title || task.name}`)
      return completeAsanaTask(id)
    }
    const task = allDailyTasks.find(t => t.id === id)
    if (task && !task.completed) addLogEntry(`Completed: ${task.title}`)
    return toggleDailyTask(id)
  }

  async function handleToggleWeeklyTask(id, date) {
    const allWeekly = Object.values(weeklyTasks).flat()
    const task = allWeekly.find(t => t.id === id)
    if (task && !task.completed) addLogEntry(`Completed: ${task.title}`)
    return toggleWeeklyTask(id, date)
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
      <div style={{ display: 'none' }}>
        <Sidebar
          asanaTasks={asanaTasks}
          asanaProjects={asanaProjects}
          asanaStatus={asanaStatus}
          onAddAsanaTask={addAsanaTask}
          onCompleteAsanaTask={completeAsanaTask}
          onRefreshAsana={refreshAsana}
          user={user}
          sections={sections}
          onUpdateSection={updateSection}
          view={view}
          onViewChange={(v) => {
            if (v === 'month') { setCalViewYear(selectedDate.getFullYear()); setCalViewMonth(selectedDate.getMonth()) }
            setView(v)
          }}
          personalSubTab={personalSubTab}
          onPersonalSubTabChange={setPersonalSubTab}
        />
      </div>
      <div className={mp === null || mp === 'main' ? 'mobile-active' : undefined}>
        <DailyPlanner
          userId={userId}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          masterTasks={masterTasks}
          onDeleteMasterTask={deleteMasterTask}
          dailyTasks={allDailyTasks}
          timeBlocks={allTimeBlocks}
          calendarBlocks={allCalendarBlocks}
          onAddTask={addDailyTask}
          onToggleTask={handleToggleDailyTask}
          onDeleteTask={handleDeleteDailyTask}
          onUpdateTaskNotes={handleUpdateTaskNotes}
          onAddBlock={handleAddBlock}
          onBulkAddMeetings={bulkAddMeetings}
          onDeleteBlock={handleDeleteBlock}
          noteContent={noteContent}
          onNoteChange={onNoteChange}
          view={view}
          onLeatherViewChange={(v) => {
            if (v === 'month') { setCalViewYear(selectedDate.getFullYear()); setCalViewMonth(selectedDate.getMonth()) }
            setView(v)
          }}
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
          onUpdateCseaInteraction={updateCseaInteraction}
          showArchivedInteractions={showArchivedInteractions}
          onToggleArchivedInteractions={() => setShowArchivedInteractions(v => !v)}
          cseaNotes={cseaNotes}
          onAddCseaNote={addCseaNote}
          onDeleteCseaNote={deleteCseaNote}
          asanaTasks={asanaTasks}
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
          paychecks={paychecks}
          onAddPaycheck={addPaycheck}
          onUpdatePaycheckAmount={updatePaycheckAmount}
          onTogglePaycheckBill={togglePaycheckBill}
          onDeletePaycheck={deletePaycheck}
          icaapItems={icaapItems}
          onAddIcaapItem={addIcaapItem}
          onUpdateIcaapItem={updateIcaapItem}
          onDeleteIcaapItem={deleteIcaapItem}
          attendanceRecords={attendanceRecords}
          onUpsertAttendance={upsertAttendance}
          onUpdateAttendanceNotes={updateAttendanceNotes}
          icaapNotes={icaapNotes}
          onAddIcaapNote={addIcaapNote}
          onDeleteIcaapNote={deleteIcaapNote}
          calAuthExpired={calAuthExpired}
          onReconnectGoogle={reconnectGoogle}
          calEventCount={calEvents.length}
          onSignOut={() => signOut()}
          books={books}
          onAddBook={addBook}
          onUpdateBookStatus={updateBookStatus}
          onDeleteBook={deleteBook}
          onImportBooks={importBooks}
          onPushGcuToAsana={handlePushGcuToAsana}
          gcuPushing={gcuPushing}
          providerToken={providerToken}
          weeklyTasks={weeklyTasks}
          onToggleWeeklyTask={handleToggleWeeklyTask}
          onAddWeeklyTask={addWeeklyTask}
          personalSubTab={personalSubTab}
          onPersonalSubTabChange={setPersonalSubTab}
          familyMembers={familyMembers}
          onAddFamilyMember={addFamilyMember}
          onUpdateFamilyMember={updateFamilyMember}
          onDeleteFamilyMember={deleteFamilyMember}
          onImportFamilyDefaults={importFamilyDefaults}
          sections={sections}
          onUpdateSection={updateSection}
          asanaTaskTags={asanaTaskTags}
          onCycleAsanaTaskTag={cycleAsanaTaskTag}
        />
      </div>
      <div className={mp === 'right' ? 'mobile-active' : undefined}>
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
        </nav>
      )}
    </div>
  )
}
