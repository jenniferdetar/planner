import './DailyPlanner.css'
import LeatherDayView from './LeatherDayView'

export default function DailyPlanner({
  userId,
  selectedDate, onDateChange,
  masterTasks, onDeleteMasterTask, onUpdateMasterTask,
  dailyTasks, timeBlocks,
  onAddTask, onToggleTask, onDeleteTask, onUpdateTaskNotes,
  onAddBlock, onBulkAddMeetings, onDeleteBlock,
  noteContent, onNoteChange,
  view, onViewChange, onLeatherViewChange,
  taskCounts,
  cseaIssues, onAddCseaIssue, onUpdateCseaStatus, onDeleteCseaIssue,
  cseaInteractions, onAddCseaInteraction, onUpdateCseaInteraction, showArchivedInteractions, onToggleArchivedInteractions,
  cseaNotes, onAddCseaNote, onDeleteCseaNote,
  cseaIssueNotes, onAddCseaIssueNote, onDeleteCseaIssueNote,
  asanaTasks, asanaCseaTasks, asanaIcaapTasks, onCompleteAsanaTask, onUpdateAsanaTaskNotes,
  onMonthChange,
  transactions, onAddTransaction, onDeleteTransaction,
  bills, onAddBill, onToggleBillPaid, onDeleteBill,
  goals, onAddGoal, onUpdateGoalAmount, onDeleteGoal,
  paychecks, onAddPaycheck, onUpdatePaycheckAmount, onTogglePaycheckBill, onDeletePaycheck,
  icaapItems, onAddIcaapItem, onUpdateIcaapItem, onDeleteIcaapItem,
  attendanceRecords, onUpsertAttendance, onUpdateAttendanceNotes,
  icaapNotes, onAddIcaapNote, onDeleteIcaapNote,
  calendarBlocks,
  calAuthExpired, onReconnectGoogle, providerToken, calEventCount, onSignOut,
  books, onAddBook, onUpdateBookStatus, onUpdateBookChapter, onDeleteBook, onImportBooks,
  onPushGcuToAsana, gcuPushing,
  weeklyTasks, onToggleWeeklyTask, onAddWeeklyTask,
  personalSubTab, onPersonalSubTabChange,
  familyMembers, onAddFamilyMember, onUpdateFamilyMember, onDeleteFamilyMember, onImportFamilyDefaults,
  sections, onUpdateSection,
  asanaTaskTags, onCycleAsanaTaskTag,
}) {
  return (
    <main className="daily-planner">
      <LeatherDayView
        view={view}
        onViewChange={onLeatherViewChange || onViewChange}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        dailyTasks={dailyTasks || []}
        onAddTask={onAddTask}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        timeBlocks={timeBlocks || []}
        onAddBlock={onAddBlock}
        onDeleteBlock={onDeleteBlock}
        masterTasks={masterTasks || []}
        onDeleteMasterTask={onDeleteMasterTask}
        onUpdateMasterTask={onUpdateMasterTask}
        sections={sections}
        onUpdateSection={onUpdateSection}
        asanaTaskTags={asanaTaskTags}
        onCycleAsanaTaskTag={onCycleAsanaTaskTag}
        userId={userId}
        weeklyTasks={weeklyTasks}
        onToggleWeeklyTask={onToggleWeeklyTask}
        onAddWeeklyTask={onAddWeeklyTask}
        calendarBlocks={calendarBlocks}
        taskCounts={taskCounts}
        onMonthChange={onMonthChange}
        cseaIssues={cseaIssues}
        onAddCseaIssue={onAddCseaIssue}
        onUpdateCseaStatus={onUpdateCseaStatus}
        onDeleteCseaIssue={onDeleteCseaIssue}
        cseaInteractions={cseaInteractions}
        onAddCseaInteraction={onAddCseaInteraction}
        onUpdateCseaInteraction={onUpdateCseaInteraction}
        showArchivedInteractions={showArchivedInteractions}
        onToggleArchivedInteractions={onToggleArchivedInteractions}
        asanaTasks={asanaTasks}
        asanaCseaTasks={asanaCseaTasks}
        onCompleteAsanaTask={onCompleteAsanaTask}
        onUpdateAsanaTaskNotes={onUpdateAsanaTaskNotes}
        cseaNotes={cseaNotes}
        onAddCseaNote={onAddCseaNote}
        onDeleteCseaNote={onDeleteCseaNote}
        cseaIssueNotes={cseaIssueNotes}
        onAddCseaIssueNote={onAddCseaIssueNote}
        onDeleteCseaIssueNote={onDeleteCseaIssueNote}
        icaapItems={icaapItems}
        onAddIcaapItem={onAddIcaapItem}
        onUpdateIcaapItem={onUpdateIcaapItem}
        onDeleteIcaapItem={onDeleteIcaapItem}
        asanaIcaapTasks={asanaIcaapTasks}
        attendanceRecords={attendanceRecords}
        onUpsertAttendance={onUpsertAttendance}
        onUpdateAttendanceNotes={onUpdateAttendanceNotes}
        icaapNotes={icaapNotes}
        onAddIcaapNote={onAddIcaapNote}
        onDeleteIcaapNote={onDeleteIcaapNote}
        onPushGcuToAsana={onPushGcuToAsana}
        gcuPushing={gcuPushing}
        calAuthExpired={calAuthExpired}
        onReconnectGoogle={onReconnectGoogle}
        calEventCount={calEventCount}
        onSignOut={onSignOut}
        transactions={transactions}
        onAddTransaction={onAddTransaction}
        onDeleteTransaction={onDeleteTransaction}
        bills={bills}
        onAddBill={onAddBill}
        onToggleBillPaid={onToggleBillPaid}
        onDeleteBill={onDeleteBill}
        goals={goals}
        onAddGoal={onAddGoal}
        onUpdateGoalAmount={onUpdateGoalAmount}
        onDeleteGoal={onDeleteGoal}
        paychecks={paychecks}
        onAddPaycheck={onAddPaycheck}
        onUpdatePaycheckAmount={onUpdatePaycheckAmount}
        onTogglePaycheckBill={onTogglePaycheckBill}
        onDeletePaycheck={onDeletePaycheck}
        books={books}
        onAddBook={onAddBook}
        onUpdateBookStatus={onUpdateBookStatus}
        onUpdateBookChapter={onUpdateBookChapter}
        onDeleteBook={onDeleteBook}
        onImportBooks={onImportBooks}
      />
    </main>
  )
}
