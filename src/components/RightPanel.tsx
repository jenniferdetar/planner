// @ts-nocheck
import { useState } from 'react'
import './RightPanel.css'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_ABBR = ['S','M','T','W','T','F','S']
const DAY_NAMES_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

interface RightPanelProps {
  selectedDate: Date
  onDateChange: (d: Date) => void
  taskCounts: Record<string, { total: number; done: number }>
  dailyTasks: any[]
  onToggleTask?: (id: any) => void
  timeBlocks: any[]
  noteContent?: string
  onNoteChange: (v: string) => void
  calAuthExpired?: boolean
  onReconnectGoogle?: () => void
  asanaTasks?: any[]
  onCompleteAsanaTask?: (id: any) => void
  onRefreshAsana?: () => void
}

export default function RightPanel({
  selectedDate, onDateChange,
  taskCounts,
  dailyTasks,
  onToggleTask,
  timeBlocks,
  noteContent,
  onNoteChange,
  calAuthExpired,
  onReconnectGoogle,
  asanaTasks = [],
  onCompleteAsanaTask,
  onRefreshAsana,
}: RightPanelProps) {
  const today = new Date()
  const [calYear, setCalYear] = useState(selectedDate.getFullYear())
  const [calMonth, setCalMonth] = useState(selectedDate.getMonth())

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }

  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  function selectDay(day: number) {
    onDateChange(new Date(calYear, calMonth, day))
  }

  function countForDay(d: Date): number {
    return taskCounts[toDateStr(d)]?.total ?? 0
  }

  // Summary for selected date
  const tasks = dailyTasks || []
  const gcalCount = (timeBlocks || []).filter((b: any) => b.source === 'google').length
  const supabaseMeetings = (timeBlocks || []).filter((b: any) => b.source === 'supabase').length
  const doneCount = tasks.filter((t: any) => t.completed).length
  const totalTasks = tasks.length
  const pct = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0

  return (
    <aside className="right-panel">
      {/* Summary */}
      <div className="day-summary">
        <div className="panel-section-label">Day Summary</div>
        <div className="summary-items">
          {totalTasks === 0 && gcalCount === 0 && supabaseMeetings === 0 ? (
            <div className="summary-empty">Nothing scheduled</div>
          ) : (
            <>
              <div className="summary-stat-row">
                <div className="summary-stat">
                  <span className="summary-num">{gcalCount + supabaseMeetings}</span>
                  <span className="summary-lbl">events</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-num">{totalTasks}</span>
                  <span className="summary-lbl">tasks</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-num">{doneCount}</span>
                  <span className="summary-lbl">done</span>
                </div>
              </div>
              {totalTasks > 0 && (
                <div className="summary-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="progress-label">{pct}% complete</span>
                </div>
              )}
              {gcalCount > 0 && (
                <div className="gcal-indicator">
                  <span className="gcal-dot" />
                  {gcalCount} event{gcalCount !== 1 ? 's' : ''} from Google Calendar
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Task List for selected day */}
      {tasks.length > 0 && (
        <div className="day-task-list">
          <div className="panel-section-label">Tasks</div>
          <ul className="day-tasks">
            {tasks.map((task: any) => (
              <li
                key={task.id}
                className={`day-task-item ${task.completed ? 'done' : ''}`}
                onClick={() => onToggleTask?.(task.id)}
              >
                <span className={`day-task-dot ${task.completed ? 'done' : ''}`} />
                <span className="day-task-text">{task.description || task.title || task.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Asana Tasks */}
      {asanaTasks.length > 0 && (
        <div className="asana-section">
          <div className="panel-section-label">
            Asana Tasks <span className="asana-count">{asanaTasks.length}</span>
            <button className="asana-sync-btn" onClick={onRefreshAsana} title="Sync with Asana">↻</button>
          </div>
          <ul className="asana-task-list">
            {asanaTasks.map((task: any) => (
              <li key={task.gid ?? task.id} className="asana-task-item">
                <button className="asana-check-btn" onClick={() => onCompleteAsanaTask?.(task.gid ?? task.id)} title="Complete" />
                <span className="asana-task-name">{task.name ?? task.title}</span>
                {task.due_on && <span className="asana-task-due">{task.due_on}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes — persisted to Supabase */}
      <div className="notes-section">
        <div className="panel-section-label">
          Notes
          <span className="notes-hint">auto-saved</span>
        </div>
        <textarea
          className="notes-area"
          placeholder="Jot down anything for today…"
          value={noteContent || ''}
          onChange={e => onNoteChange(e.target.value)}
          rows={7}
        />
      </div>
    </aside>
  )
}
