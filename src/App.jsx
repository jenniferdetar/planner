import { useState } from 'react'
import Sidebar from './components/Sidebar'
import DailyPlanner from './components/DailyPlanner'
import RightPanel from './components/RightPanel'
import './App.css'

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It's not about having time, it's about making time.", author: "Unknown" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Small steps every day.", author: "Unknown" },
]

export default function App() {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [masterTasks, setMasterTasks] = useState([
    { id: 1, text: 'Review Q2 goals', priority: 'high', done: false },
    { id: 2, text: 'Read 30 pages', priority: 'medium', done: false },
    { id: 3, text: 'Call dentist', priority: 'low', done: true },
    { id: 4, text: 'Update portfolio site', priority: 'medium', done: false },
    { id: 5, text: 'Plan weekend trip', priority: 'low', done: false },
  ])
  const [dailyTasks, setDailyTasks] = useState({})
  const [timeBlocks, setTimeBlocks] = useState({})
  const [view, setView] = useState('day')

  const dateKey = selectedDate.toISOString().split('T')[0]
  const quote = QUOTES[today.getDate() % QUOTES.length]

  const tasksForDay = dailyTasks[dateKey] || []
  const blocksForDay = timeBlocks[dateKey] || []

  function addMasterTask(text, priority) {
    setMasterTasks(prev => [...prev, { id: Date.now(), text, priority, done: false }])
  }

  function toggleMasterTask(id) {
    setMasterTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteMasterTask(id) {
    setMasterTasks(prev => prev.filter(t => t.id !== id))
  }

  function addDailyTask(text, priority) {
    setDailyTasks(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { id: Date.now(), text, priority, done: false }]
    }))
  }

  function toggleDailyTask(id) {
    setDailyTasks(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map(t => t.id === id ? { ...t, done: !t.done } : t)
    }))
  }

  function deleteDailyTask(id) {
    setDailyTasks(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter(t => t.id !== id)
    }))
  }

  function addTimeBlock(hour, text, color) {
    setTimeBlocks(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { id: Date.now(), hour, text, color }]
    }))
  }

  function deleteTimeBlock(id) {
    setTimeBlocks(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter(b => b.id !== id)
    }))
  }

  return (
    <div className="app">
      <Sidebar
        masterTasks={masterTasks}
        onAddTask={addMasterTask}
        onToggleTask={toggleMasterTask}
        onDeleteTask={deleteMasterTask}
        quote={quote}
      />
      <DailyPlanner
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        dailyTasks={tasksForDay}
        timeBlocks={blocksForDay}
        onAddTask={addDailyTask}
        onToggleTask={toggleDailyTask}
        onDeleteTask={deleteDailyTask}
        onAddBlock={addTimeBlock}
        onDeleteBlock={deleteTimeBlock}
        view={view}
        onViewChange={setView}
      />
      <RightPanel
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        dailyTasks={dailyTasks}
        timeBlocks={timeBlocks}
      />
    </div>
  )
}
