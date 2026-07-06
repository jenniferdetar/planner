import './PlannerTheme.css'
import './Scrapbook.css'
import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { supabase, signOut, signInWithGoogle } from './lib/supabase'
import { useMasterTasks, useDailyTasks, useMeetings, useTaskCounts, useMeetingsInRange } from './hooks/usePlannerData'
import { useDailyLog } from './hooks/useDailyLog'
import { useWeeklyTasks } from './hooks/useWeeklyTasks'
import { useCalendarEvents } from './hooks/useCalendarEvents'
import { useCseaIssues, useMemberInteractions, useCseaNotes, useCseaIssueNotes } from './hooks/useCseaData'
import { useIcaapItems } from './hooks/useIcaapData'
import { useIcaapAttendance } from './hooks/useIcaapAttendance'
import { useIcaapNotes } from './hooks/useIcaapNotes'
import { useTransactions, useBills, useFinancialGoals, usePaychecks } from './hooks/useFinancialData'
import { useAsanaTasks } from './hooks/useAsanaTasks'
import { fetchWorkspaces, findOrCreateProject, createTask } from './lib/asana'
import { GCU_COURSES } from './components/GcuPanel'
import { useLibrary } from './hooks/useLibrary'
import { useFamilyTree } from './hooks/useFamilyTree'
import DashboardView from './components/DashboardView'
import LoginScreen from './components/LoginScreen'
import './App.css'

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
  const [calViewYear, setCalViewYear] = useState(today.getFullYear())
  const [calViewMonth, setCalViewMonth] = useState(today.getMonth())

  const userId = user?.id ?? null
  const dateStr = selectedDate.toISOString().split('T')[0]

  const { tasks: masterTasks, addTask: addMasterTask, updateTask: updateMasterTask, deleteTask: deleteMasterTask } = useMasterTasks(userId)
  const { tasks: dailyTasks, addTask: addDailyTask, toggleTask: toggleDailyTask, deleteTask: deleteDailyTask, updateTaskDescription } = useDailyTasks(userId, selectedDate)
  const { meetings, addMeeting, deleteMeeting } = useMeetings(userId, selectedDate)
  const taskCounts = useTaskCounts(userId)
  const { issues: cseaIssues, addIssue: addCseaIssue, updateIssueStatus: updateCseaStatus, deleteIssue: deleteCseaIssue } = useCseaIssues(userId)
  const { interactions: cseaInteractions, addInteraction: addCseaInteraction, updateInteraction: updateCseaInteraction, showArchived: showArchivedInteractions, setShowArchived: setShowArchivedInteractions } = useMemberInteractions(userId)
  const { notes: cseaNotes, addNote: addCseaNote, deleteNote: deleteCseaNote } = useCseaNotes(userId)
  const { notesByIssue: cseaIssueNotes, addNote: addCseaIssueNote, deleteNote: deleteCseaIssueNote } = useCseaIssueNotes(userId)
  const { masterTasks: asanaTasks, cseaTasks: asanaCseaTasks, icaapTasks: asanaIcaapTasks, completeTask: completeAsanaTask, updateTaskNotes: updateAsanaNotes } = useAsanaTasks()
  const { transactions, addTransaction, deleteTransaction } = useTransactions(userId)
  const { bills, addBill, toggleBillPaid, deleteBill } = useBills(userId)
  const { goals, addGoal, updateGoalAmount, deleteGoal } = useFinancialGoals(userId)
  const { paychecks, addPaycheck, updatePaycheckAmount, togglePaycheckBill, deletePaycheck } = usePaychecks(userId)
  const { items: icaapItems, addItem: addIcaapItem, updateItem: updateIcaapItem, deleteItem: deleteIcaapItem } = useIcaapItems(userId)
  const { records: attendanceRecords, upsertAttendance, updateNotes: updateAttendanceNotes } = useIcaapAttendance(userId)
  const { notes: icaapNotes, addNote: addIcaapNote, deleteNote: deleteIcaapNote } = useIcaapNotes(userId)
  const { books, addBook, updateStatus: updateBookStatus, updateChapter: updateBookChapter, deleteBook, importDefaults: importBooks, reload: reloadBooks, coverSync: bookCoverSync, fetchCovers: fetchBookCovers } = useLibrary(userId)
  const { members: familyMembers, addMember: addFamilyMember, updateMember: updateFamilyMember, deleteMember: deleteFamilyMember, importDefaults: importFamilyDefaults } = useFamilyTree(userId)
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

  // Merge Asana tasks into local lists — only tasks due within the current week
  const _ws = new Date(selectedDate); _ws.setDate(_ws.getDate() - _ws.getDay())
  const _we = new Date(_ws); _we.setDate(_we.getDate() + 6)
  const _weekStart = _ws.toISOString().split('T')[0]
  const _weekEnd   = _we.toISOString().split('T')[0]
  const allDailyTasks = [
    ...dailyTasks,
    ...asanaTasks.filter(t => t.due_on && t.due_on >= _weekStart && t.due_on <= _weekEnd),
  ]

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
  // Google Cal events take precedence — drop any Supabase block whose title matches a gcal event
  const supabaseBlocks = meetings.map((m) => meetingToBlock(m, BLOCK_COLORS[0]))
  const gcalBlocksForDay = calEvents.filter((e) => e.startIso?.startsWith(dateStr))
  const gcalTitles = new Set(gcalBlocksForDay.map(e => (e.title || e.text)?.trim().toLowerCase()).filter(Boolean))
  const dedupedSupabaseBlocks = supabaseBlocks.filter(b => !gcalTitles.has((b.title || b.text)?.trim().toLowerCase()))
  const allTimeBlocks = [...dedupedSupabaseBlocks, ...gcalBlocksForDay]

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

  return (
      <DashboardView
        userId={userId}
        providerToken={providerToken}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        dailyTasks={allDailyTasks}
        onAddTask={addDailyTask}
        onToggleTask={handleToggleDailyTask}
        onDeleteTask={handleDeleteDailyTask}
        timeBlocks={allTimeBlocks}
        onAddBlock={handleAddBlock}
        onDeleteBlock={handleDeleteBlock}
        masterTasks={masterTasks}
        onAddMasterTask={addMasterTask}
        onDeleteMasterTask={deleteMasterTask}
        onUpdateMasterTask={updateMasterTask}
        cseaIssues={cseaIssues}
        onAddCseaIssue={addCseaIssue}
        onUpdateCseaStatus={updateCseaStatus}
        onDeleteCseaIssue={deleteCseaIssue}
        cseaInteractions={cseaInteractions}
        onAddCseaInteraction={addCseaInteraction}
        onUpdateCseaInteraction={updateCseaInteraction}
        showArchivedInteractions={showArchivedInteractions}
        onToggleArchivedInteractions={() => setShowArchivedInteractions(v => !v)}
        asanaCseaTasks={asanaCseaTasks}
        onCompleteAsanaTask={completeAsanaTask}
        onUpdateAsanaTaskNotes={updateAsanaNotes}
        cseaNotes={cseaNotes}
        onAddCseaNote={addCseaNote}
        onDeleteCseaNote={deleteCseaNote}
        cseaIssueNotes={cseaIssueNotes}
        onAddCseaIssueNote={addCseaIssueNote}
        onDeleteCseaIssueNote={deleteCseaIssueNote}
        icaapItems={icaapItems}
        onAddIcaapItem={addIcaapItem}
        onUpdateIcaapItem={updateIcaapItem}
        onDeleteIcaapItem={deleteIcaapItem}
        asanaIcaapTasks={asanaIcaapTasks}
        attendanceRecords={attendanceRecords}
        onUpsertAttendance={upsertAttendance}
        onUpdateAttendanceNotes={updateAttendanceNotes}
        icaapNotes={icaapNotes}
        onAddIcaapNote={addIcaapNote}
        onDeleteIcaapNote={deleteIcaapNote}
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
        onPushGcuToAsana={handlePushGcuToAsana}
        gcuPushing={gcuPushing}
        books={books}
        onAddBook={addBook}
        onUpdateBookStatus={updateBookStatus}
        onUpdateBookChapter={updateBookChapter}
        onDeleteBook={deleteBook}
        onImportBooks={importBooks}
        onReloadBooks={reloadBooks}
        familyMembers={familyMembers}
        onAddFamilyMember={addFamilyMember}
        onUpdateFamilyMember={updateFamilyMember}
        onDeleteFamilyMember={deleteFamilyMember}
        onImportFamilyDefaults={importFamilyDefaults}
        bookCoverSync={bookCoverSync}
        onFetchBookCovers={fetchBookCovers}
        calendarBlocks={allCalendarBlocks}
        weeklyTasks={weeklyTasks}
        onToggleWeeklyTask={handleToggleWeeklyTask}
        onAddWeeklyTask={addWeeklyTask}
        taskCounts={taskCounts}
        onMonthChange={(y, m) => { setCalViewYear(y); setCalViewMonth(m) }}
        calAuthExpired={calAuthExpired}
        onReconnectGoogle={reconnectGoogle}
        calEventCount={calEvents.length}
        onSignOut={() => signOut()}
      />
  )
}
