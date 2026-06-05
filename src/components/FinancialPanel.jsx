import { useState } from 'react'
import './FinancialPanel.css'

const EXPENSE_CATEGORIES = ['Housing', 'Food', 'Transport', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Savings', 'Other']
const GOAL_COLORS = ['#c9a96e', '#5cb85c', '#4a90d9', '#9b59b6', '#e05c5c', '#f0a040']

function fmt(n) {
  return Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

export default function FinancialPanel({
  transactions, onAddTransaction, onDeleteTransaction,
  bills, onAddBill, onToggleBillPaid, onDeleteBill,
  goals, onAddGoal, onUpdateGoalAmount, onDeleteGoal,
}) {
  const [tab, setTab] = useState('spending')

  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthlyTxns = transactions.filter(t => t.txn_date?.startsWith(thisMonth))
  const totalIncome = monthlyTxns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = monthlyTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const unpaidBills = bills.filter(b => !b.paid).reduce((s, b) => s + Number(b.amount), 0)

  return (
    <div className="fin-panel">
      <div className="fin-summary">
        <div className="fin-stat">
          <span className="fin-stat-num income">{fmt(totalIncome)}</span>
          <span className="fin-stat-lbl">Income</span>
        </div>
        <div className="fin-stat">
          <span className="fin-stat-num expense">{fmt(totalExpenses)}</span>
          <span className="fin-stat-lbl">Spent</span>
        </div>
        <div className="fin-stat">
          <span className="fin-stat-num">{fmt(unpaidBills)}</span>
          <span className="fin-stat-lbl">Bills Due</span>
        </div>
      </div>

      <div className="fin-tabs">
        {['spending', 'bills', 'goals'].map(t => (
          <button key={t} className={`fin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'spending' && <SpendingTab transactions={transactions} onAdd={onAddTransaction} onDelete={onDeleteTransaction} />}
      {tab === 'bills' && <BillsTab bills={bills} onAdd={onAddBill} onToggle={onToggleBillPaid} onDelete={onDeleteBill} />}
      {tab === 'goals' && <GoalsTab goals={goals} onAdd={onAddGoal} onUpdate={onUpdateGoalAmount} onDelete={onDeleteGoal} />}
    </div>
  )
}

function SpendingTab({ transactions, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'Other', description: '', txn_date: new Date().toISOString().split('T')[0] })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount) return
    await onAdd({ ...form, amount: parseFloat(form.amount) })
    setForm({ type: 'expense', amount: '', category: 'Other', description: '', txn_date: new Date().toISOString().split('T')[0] })
    setShowForm(false)
  }

  return (
    <div className="fin-content">
      <div className="fin-toolbar">
        <span className="fin-toolbar-label">This month's transactions</span>
        <button className="fin-add-btn" onClick={() => setShowForm(true)}>+ Add</button>
      </div>

      {showForm && (
        <form className="fin-form" onSubmit={handleSubmit}>
          <div className="fin-type-toggle">
            {['expense', 'income'].map(t => (
              <button key={t} type="button"
                className={`fin-type-btn ${form.type === t ? 'active ' + t : ''}`}
                onClick={() => setForm(f => ({ ...f, type: t }))}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="fin-form-row">
            <input className="fin-input amount" type="number" placeholder="0.00" step="0.01" min="0"
              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            <input className="fin-input" type="date" value={form.txn_date}
              onChange={e => setForm(f => ({ ...f, txn_date: e.target.value }))} />
          </div>
          <input className="fin-input" placeholder="Description" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <select className="fin-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="fin-form-actions">
            <button type="button" className="fin-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="fin-save">Save</button>
          </div>
        </form>
      )}

      <div className="fin-txn-list">
        {transactions.length === 0 && <p className="fin-empty">No transactions yet</p>}
        {transactions.map(t => (
          <div key={t.id} className="fin-txn">
            <div className="fin-txn-left">
              <span className={`fin-txn-amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</span>
              <span className="fin-txn-desc">{t.description || t.category}</span>
            </div>
            <div className="fin-txn-right">
              <span className="fin-txn-cat">{t.category}</span>
              <span className="fin-txn-date">{t.txn_date}</span>
              <button className="fin-delete-btn" onClick={() => onDelete(t.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BillsTab({ bills, onAdd, onToggle, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', due_day: '', frequency: 'monthly' })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.amount) return
    await onAdd({ ...form, amount: parseFloat(form.amount), due_day: parseInt(form.due_day) || null })
    setForm({ name: '', amount: '', due_day: '', frequency: 'monthly' })
    setShowForm(false)
  }

  const unpaid = bills.filter(b => !b.paid)
  const paid = bills.filter(b => b.paid)

  return (
    <div className="fin-content">
      <div className="fin-toolbar">
        <span className="fin-toolbar-label">{unpaid.length} bills remaining</span>
        <button className="fin-add-btn" onClick={() => setShowForm(true)}>+ Add Bill</button>
      </div>

      {showForm && (
        <form className="fin-form" onSubmit={handleSubmit}>
          <input className="fin-input" placeholder="Bill name *" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <div className="fin-form-row">
            <input className="fin-input amount" type="number" placeholder="Amount" step="0.01" min="0"
              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            <input className="fin-input" type="number" placeholder="Due day" min="1" max="31"
              value={form.due_day} onChange={e => setForm(f => ({ ...f, due_day: e.target.value }))} />
          </div>
          <select className="fin-input" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
          <div className="fin-form-actions">
            <button type="button" className="fin-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="fin-save">Save</button>
          </div>
        </form>
      )}

      <div className="fin-bill-list">
        {bills.length === 0 && <p className="fin-empty">No bills added yet</p>}
        {unpaid.map(b => <BillRow key={b.id} bill={b} onToggle={onToggle} onDelete={onDelete} />)}
        {paid.length > 0 && (
          <>
            <div className="fin-section-sep">Paid</div>
            {paid.map(b => <BillRow key={b.id} bill={b} onToggle={onToggle} onDelete={onDelete} />)}
          </>
        )}
      </div>
    </div>
  )
}

function BillRow({ bill, onToggle, onDelete }) {
  return (
    <div className={`fin-bill ${bill.paid ? 'paid' : ''}`}>
      <button className={`fin-bill-check ${bill.paid ? 'checked' : ''}`} onClick={() => onToggle(bill.id)}>
        {bill.paid ? '✓' : '○'}
      </button>
      <div className="fin-bill-info">
        <span className="fin-bill-name">{bill.name}</span>
        {bill.due_day && <span className="fin-bill-due">Due {bill.due_day}{bill.due_day === 1 ? 'st' : bill.due_day === 2 ? 'nd' : bill.due_day === 3 ? 'rd' : 'th'}</span>}
      </div>
      <span className="fin-bill-amount">{fmt(bill.amount)}</span>
      <button className="fin-delete-btn" onClick={() => onDelete(bill.id)}>✕</button>
    </div>
  )
}

function GoalsTab({ goals, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '', color: GOAL_COLORS[0] })
  const [editing, setEditing] = useState(null)
  const [editAmount, setEditAmount] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.target_amount) return
    await onAdd({
      ...form,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount) || 0,
    })
    setForm({ name: '', target_amount: '', current_amount: '', color: GOAL_COLORS[0] })
    setShowForm(false)
  }

  async function handleUpdateAmount(id) {
    await onUpdate(id, parseFloat(editAmount) || 0)
    setEditing(null)
  }

  return (
    <div className="fin-content">
      <div className="fin-toolbar">
        <span className="fin-toolbar-label">{goals.length} goal{goals.length !== 1 ? 's' : ''}</span>
        <button className="fin-add-btn" onClick={() => setShowForm(true)}>+ Add Goal</button>
      </div>

      {showForm && (
        <form className="fin-form" onSubmit={handleSubmit}>
          <input className="fin-input" placeholder="Goal name *" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <div className="fin-form-row">
            <input className="fin-input amount" type="number" placeholder="Target $" step="0.01" min="0"
              value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))} required />
            <input className="fin-input amount" type="number" placeholder="Saved so far $" step="0.01" min="0"
              value={form.current_amount} onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))} />
          </div>
          <div className="fin-color-row">
            {GOAL_COLORS.map(c => (
              <button key={c} type="button" className={`fin-color-swatch ${form.color === c ? 'active' : ''}`}
                style={{ background: c }} onClick={() => setForm(f => ({ ...f, color: c }))} />
            ))}
          </div>
          <div className="fin-form-actions">
            <button type="button" className="fin-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="fin-save">Save</button>
          </div>
        </form>
      )}

      <div className="fin-goals-list">
        {goals.length === 0 && <p className="fin-empty">No goals yet</p>}
        {goals.map(g => {
          const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100))
          return (
            <div key={g.id} className="fin-goal">
              <div className="fin-goal-header">
                <span className="fin-goal-name">{g.name}</span>
                <div className="fin-goal-actions">
                  <button className="fin-edit-btn" onClick={() => { setEditing(g.id); setEditAmount(String(g.current_amount)) }}>Edit</button>
                  <button className="fin-delete-btn" onClick={() => onDelete(g.id)}>✕</button>
                </div>
              </div>
              <div className="fin-goal-amounts">
                {editing === g.id ? (
                  <div className="fin-goal-edit">
                    <input className="fin-input amount" type="number" step="0.01" min="0"
                      value={editAmount} onChange={e => setEditAmount(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleUpdateAmount(g.id); if (e.key === 'Escape') setEditing(null) }}
                      autoFocus />
                    <button className="fin-save small" onClick={() => handleUpdateAmount(g.id)}>✓</button>
                    <button className="fin-cancel small" onClick={() => setEditing(null)}>✕</button>
                  </div>
                ) : (
                  <span className="fin-goal-saved" style={{ color: g.color }}>{fmt(g.current_amount)}</span>
                )}
                <span className="fin-goal-target">of {fmt(g.target_amount)}</span>
              </div>
              <div className="fin-progress-bar">
                <div className="fin-progress-fill" style={{ width: `${pct}%`, background: g.color }} />
              </div>
              <span className="fin-goal-pct">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
