import { useState } from 'react'
import './FinancialPanel.css'

const EXPENSE_CATEGORIES = ['Housing', 'Food', 'Transport', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Savings', 'Other']
const GOAL_COLORS = ['#c9a96e', '#5cb85c', '#4a90d9', '#9b59b6', '#e05c5c', '#f0a040']

function fmt(n) {
  return Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

// Bills that appear at full monthly amount (not halved per paycheck)
const FULL_AMOUNT_BILLS = ['Mortgage', 'HOA', 'HELOC (California Credit Union)']

export default function FinancialPanel({
  transactions, onAddTransaction, onDeleteTransaction,
  bills, onAddBill, onToggleBillPaid, onDeleteBill,
  goals, onAddGoal, onUpdateGoalAmount, onDeleteGoal,
  paychecks = [], onAddPaycheck, onUpdatePaycheckAmount, onTogglePaycheckBill, onDeletePaycheck,
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
        {['spending', 'bills', 'tracker', 'goals'].map(t => (
          <button key={t} className={`fin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'tracker' ? 'Paycheck' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'spending' && <SpendingTab transactions={transactions} onAdd={onAddTransaction} onDelete={onDeleteTransaction} />}
      {tab === 'bills' && <BillsTab bills={bills} onAdd={onAddBill} onToggle={onToggleBillPaid} onDelete={onDeleteBill} />}
      {tab === 'tracker' && <PaycheckTracker bills={bills} paychecks={paychecks} onAdd={onAddPaycheck} onUpdateAmount={onUpdatePaycheckAmount} onToggleBill={onTogglePaycheckBill} onDelete={onDeletePaycheck} />}
      {tab === 'goals' && <GoalsTab goals={goals} onUpdate={onUpdateGoalAmount} />}
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
  const [form, setForm] = useState({ name: '', amount: '', due_day: '', frequency: 'monthly', payment_method: 'Bill Pay' })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.amount) return
    await onAdd({ ...form, amount: parseFloat(form.amount), due_day: parseInt(form.due_day) || null })
    setForm({ name: '', amount: '', due_day: '', frequency: 'monthly', payment_method: 'Bill Pay' })
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
          <div className="fin-form-row">
            <select className="fin-input" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
            <select className="fin-input" value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
              <option value="Bill Pay">Bill Pay</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
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
      {bill.payment_method && (
        <span className={`fin-bill-method ${bill.payment_method === 'Cash' ? 'cash' : 'billpay'}`}>
          {bill.payment_method}
        </span>
      )}
      <button className="fin-delete-btn" onClick={() => onDelete(bill.id)}>✕</button>
    </div>
  )
}

function GoalsTab({ goals, onUpdate }) {
  const [editing, setEditing] = useState(null) // { id, col } col = '3mo'|'6mo'
  const [editVal, setEditVal] = useState('')

  // Group goals into rows by bill name (strip " – 3mo" / " – 6mo" suffix)
  const rows = {}
  goals.forEach(g => {
    const is3 = g.name.endsWith('– 3mo') || g.name.endsWith('- 3mo')
    const is6 = g.name.endsWith('– 6mo') || g.name.endsWith('- 6mo')
    if (!is3 && !is6) return
    const billName = g.name.replace(/\s*[–-]\s*[36]mo$/, '').trim()
    if (!rows[billName]) rows[billName] = { name: billName, mo3: null, mo6: null }
    if (is3) rows[billName].mo3 = g
    if (is6) rows[billName].mo6 = g
  })
  const sortedRows = Object.values(rows).sort((a, b) => a.name.localeCompare(b.name))

  const total3 = sortedRows.reduce((s, r) => s + Number(r.mo3?.current_amount || 0), 0)
  const total6 = sortedRows.reduce((s, r) => s + Number(r.mo6?.current_amount || 0), 0)
  const target3 = sortedRows.reduce((s, r) => s + Number(r.mo3?.target_amount || 0), 0)
  const target6 = sortedRows.reduce((s, r) => s + Number(r.mo6?.target_amount || 0), 0)

  function startEdit(goal, col) {
    setEditing({ id: goal.id, col })
    setEditVal(String(goal.current_amount))
  }

  async function commitEdit() {
    if (!editing) return
    await onUpdate(editing.id, parseFloat(editVal) || 0)
    setEditing(null)
  }

  function GoalCell({ goal }) {
    if (!goal) return <td className="goals-cell empty">—</td>
    const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0
    const isEditing = editing?.id === goal.id
    return (
      <td className="goals-cell" onClick={() => !isEditing && startEdit(goal, '')}>
        {isEditing ? (
          <input
            className="goals-cell-input"
            type="number" step="0.01" min="0"
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null) }}
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <>
            <span className="goals-saved">{fmt(goal.current_amount)}</span>
            <span className="goals-target">/ {fmt(goal.target_amount)}</span>
            <div className="goals-bar"><div className="goals-fill" style={{ width: `${pct}%` }} /></div>
          </>
        )}
      </td>
    )
  }

  return (
    <div className="fin-content">
      <div className="fin-toolbar">
        <span className="fin-toolbar-label">Emergency fund targets — click a cell to update saved amount</span>
      </div>
      <div className="goals-table-wrap">
        <table className="goals-table">
          <thead>
            <tr>
              <th className="goals-th-name">Bill</th>
              <th className="goals-th-col mo3">3 Months</th>
              <th className="goals-th-col mo6">6 Months</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(row => (
              <tr key={row.name}>
                <td className="goals-name">{row.name}</td>
                <GoalCell goal={row.mo3} />
                <GoalCell goal={row.mo6} />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="goals-total-row">
              <td className="goals-name">Total</td>
              <td className="goals-cell total">
                <span className="goals-saved">{fmt(total3)}</span>
                <span className="goals-target">/ {fmt(target3)}</span>
              </td>
              <td className="goals-cell total">
                <span className="goals-saved">{fmt(total6)}</span>
                <span className="goals-target">/ {fmt(target6)}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ── Paycheck Tracker ─────────────────────────────────────────────────────────
function PaycheckTracker({ bills, paychecks, onAdd, onUpdateAmount, onToggleBill, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [formDate, setFormDate] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [editingAmount, setEditingAmount] = useState(null)
  const [editAmountVal, setEditAmountVal] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    if (!formDate || !formAmount) return
    await onAdd(formDate, parseFloat(formAmount))
    setFormDate('')
    setFormAmount('')
    setShowForm(false)
  }

  function billAmount(bill) {
    return FULL_AMOUNT_BILLS.includes(bill.name) ? Number(bill.amount) : Number(bill.amount) / 2
  }

  const active = paychecks.find(p => p.id === activeId) || paychecks[0] || null

  const allocatedTotal = bills.reduce((s, b) => s + billAmount(b), 0)
  const paidTotal = active ? bills.filter(b => (active.paid_bill_ids || []).includes(b.id)).reduce((s, b) => s + billAmount(b), 0) : 0
  const leftOver = active ? Number(active.amount) - allocatedTotal : 0
  const remaining = active ? Number(active.amount) - paidTotal : 0

  return (
    <div className="fin-content">
      <div className="fin-toolbar">
        <span className="fin-toolbar-label">Semi-monthly paycheck tracker</span>
        <button className="fin-add-btn" onClick={() => setShowForm(s => !s)}>+ Add Paycheck</button>
      </div>

      {showForm && (
        <form className="fin-form" onSubmit={handleAdd}>
          <div className="fin-form-row">
            <input className="fin-input" type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required />
            <input className="fin-input amount" type="number" placeholder="Paycheck amount" step="0.01" min="0"
              value={formAmount} onChange={e => setFormAmount(e.target.value)} required />
          </div>
          <div className="fin-form-actions">
            <button type="button" className="fin-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="fin-save">Save</button>
          </div>
        </form>
      )}

      {/* Paycheck selector pills */}
      {paychecks.length > 0 && (
        <div className="pc-pills">
          {paychecks.slice(0, 8).map(p => (
            <button key={p.id}
              className={`pc-pill ${(active?.id === p.id) ? 'active' : ''}`}
              onClick={() => setActiveId(p.id)}>
              {new Date(p.pay_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="pc-detail">
          {/* Paycheck amount header */}
          <div className="pc-header">
            <div className="pc-header-left">
              <span className="pc-label">Jennifer's Check</span>
              <span className="pc-date">{new Date(active.pay_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {editingAmount === active.id ? (
              <div className="pc-amount-edit">
                <input type="number" className="fin-input amount" value={editAmountVal}
                  onChange={e => setEditAmountVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { onUpdateAmount(active.id, parseFloat(editAmountVal)); setEditingAmount(null) }
                    if (e.key === 'Escape') setEditingAmount(null)
                  }} autoFocus />
                <button className="fin-save" onClick={() => { onUpdateAmount(active.id, parseFloat(editAmountVal)); setEditingAmount(null) }}>✓</button>
              </div>
            ) : (
              <button className="pc-amount-btn" onClick={() => { setEditingAmount(active.id); setEditAmountVal(String(active.amount)) }}>
                {active.amount > 0 ? fmt(active.amount) : 'Enter amount'}
              </button>
            )}
          </div>

          {/* Summary bar */}
          <div className="pc-summary-bar">
            <div className="pc-summary-item">
              <span className="pc-summary-val">{fmt(allocatedTotal)}</span>
              <span className="pc-summary-lbl">Bills</span>
            </div>
            <div className="pc-summary-item">
              <span className="pc-summary-val" style={{ color: '#5cb85c' }}>{fmt(paidTotal)}</span>
              <span className="pc-summary-lbl">Paid</span>
            </div>
            <div className="pc-summary-item">
              <span className="pc-summary-val" style={{ color: remaining >= 0 ? '#4a90d9' : '#e05c5c' }}>{fmt(remaining)}</span>
              <span className="pc-summary-lbl">Remaining</span>
            </div>
          </div>

          {/* Bill rows */}
          <div className="pc-bill-list">
            {bills.map(bill => {
              const amt = billAmount(bill)
              const paid = (active.paid_bill_ids || []).includes(bill.id)
              return (
                <div key={bill.id} className={`pc-bill-row ${paid ? 'paid' : ''}`}
                  onClick={() => onToggleBill(active.id, bill.id)}>
                  <span className={`pc-check ${paid ? 'checked' : ''}`}>{paid ? '✓' : '○'}</span>
                  <span className="pc-bill-name">{bill.name}</span>
                  <span className={`pc-bill-method ${bill.payment_method === 'Cash' ? 'cash' : 'billpay'}`}>
                    {bill.payment_method || 'Bill Pay'}
                  </span>
                  <span className="pc-bill-amt">{fmt(amt)}</span>
                </div>
              )
            })}
            {/* Left Over row */}
            <div className="pc-bill-row leftover">
              <span className="pc-check" />
              <span className="pc-bill-name">Left Over</span>
              <span className="pc-bill-amt" style={{ color: leftOver >= 0 ? '#5cb85c' : '#e05c5c' }}>{fmt(leftOver)}</span>
            </div>
          </div>

          <button className="pc-delete-btn" onClick={() => { onDelete(active.id); setActiveId(null) }}>Delete this paycheck</button>
        </div>
      )}

      {paychecks.length === 0 && <p className="fin-empty">No paychecks added yet. Click "+ Add Paycheck" to start tracking.</p>}
    </div>
  )
}

// ── Paycheck Tracker ─────────────────────────────────────────────────────────
function PaycheckTracker({ bills, paychecks, onAdd, onUpdateAmount, onToggleBill, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [formDate, setFormDate] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [editingAmount, setEditingAmount] = useState(null)
  const [editAmountVal, setEditAmountVal] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    if (!formDate || !formAmount) return
    await onAdd(formDate, parseFloat(formAmount))
    setFormDate('')
    setFormAmount('')
    setShowForm(false)
  }

  function billAmount(bill) {
    return FULL_AMOUNT_BILLS.includes(bill.name) ? Number(bill.amount) : Number(bill.amount) / 2
  }

  const active = paychecks.find(p => p.id === activeId) || paychecks[0] || null

  const allocatedTotal = bills.reduce((s, b) => s + billAmount(b), 0)
  const paidTotal = active ? bills.filter(b => (active.paid_bill_ids || []).includes(b.id)).reduce((s, b) => s + billAmount(b), 0) : 0
  const leftOver = active ? Number(active.amount) - allocatedTotal : 0
  const remaining = active ? Number(active.amount) - paidTotal : 0

  return (
    <div className="fin-content">
      <div className="fin-toolbar">
        <span className="fin-toolbar-label">Semi-monthly paycheck tracker</span>
        <button className="fin-add-btn" onClick={() => setShowForm(s => !s)}>+ Add Paycheck</button>
      </div>

      {showForm && (
        <form className="fin-form" onSubmit={handleAdd}>
          <div className="fin-form-row">
            <input className="fin-input" type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required />
            <input className="fin-input amount" type="number" placeholder="Paycheck amount" step="0.01" min="0"
              value={formAmount} onChange={e => setFormAmount(e.target.value)} required />
          </div>
          <div className="fin-form-actions">
            <button type="button" className="fin-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="fin-save">Save</button>
          </div>
        </form>
      )}

      {/* Paycheck selector pills */}
      {paychecks.length > 0 && (
        <div className="pc-pills">
          {paychecks.slice(0, 8).map(p => (
            <button key={p.id}
              className={`pc-pill ${(active?.id === p.id) ? 'active' : ''}`}
              onClick={() => setActiveId(p.id)}>
              {new Date(p.pay_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="pc-detail">
          {/* Paycheck amount header */}
          <div className="pc-header">
            <div className="pc-header-left">
              <span className="pc-label">Jennifer's Check</span>
              <span className="pc-date">{new Date(active.pay_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {editingAmount === active.id ? (
              <div className="pc-amount-edit">
                <input type="number" className="fin-input amount" value={editAmountVal}
                  onChange={e => setEditAmountVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { onUpdateAmount(active.id, parseFloat(editAmountVal)); setEditingAmount(null) }
                    if (e.key === 'Escape') setEditingAmount(null)
                  }} autoFocus />
                <button className="fin-save" onClick={() => { onUpdateAmount(active.id, parseFloat(editAmountVal)); setEditingAmount(null) }}>✓</button>
              </div>
            ) : (
              <button className="pc-amount-btn" onClick={() => { setEditingAmount(active.id); setEditAmountVal(String(active.amount)) }}>
                {active.amount > 0 ? fmt(active.amount) : 'Enter amount'}
              </button>
            )}
          </div>

          {/* Summary bar */}
          <div className="pc-summary-bar">
            <div className="pc-summary-item">
              <span className="pc-summary-val">{fmt(allocatedTotal)}</span>
              <span className="pc-summary-lbl">Bills</span>
            </div>
            <div className="pc-summary-item">
              <span className="pc-summary-val" style={{ color: '#5cb85c' }}>{fmt(paidTotal)}</span>
              <span className="pc-summary-lbl">Paid</span>
            </div>
            <div className="pc-summary-item">
              <span className="pc-summary-val" style={{ color: remaining >= 0 ? '#4a90d9' : '#e05c5c' }}>{fmt(remaining)}</span>
              <span className="pc-summary-lbl">Remaining</span>
            </div>
          </div>

          {/* Bill rows */}
          <div className="pc-bill-list">
            {bills.map(bill => {
              const amt = billAmount(bill)
              const paid = (active.paid_bill_ids || []).includes(bill.id)
              return (
                <div key={bill.id} className={`pc-bill-row ${paid ? 'paid' : ''}`}
                  onClick={() => onToggleBill(active.id, bill.id)}>
                  <span className={`pc-check ${paid ? 'checked' : ''}`}>{paid ? '✓' : '○'}</span>
                  <span className="pc-bill-name">{bill.name}</span>
                  <span className={`pc-bill-method ${bill.payment_method === 'Cash' ? 'cash' : 'billpay'}`}>
                    {bill.payment_method || 'Bill Pay'}
                  </span>
                  <span className="pc-bill-amt">{fmt(amt)}</span>
                </div>
              )
            })}
            {/* Left Over row */}
            <div className="pc-bill-row leftover">
              <span className="pc-check" />
              <span className="pc-bill-name">Left Over</span>
              <span className="pc-bill-amt" style={{ color: leftOver >= 0 ? '#5cb85c' : '#e05c5c' }}>{fmt(leftOver)}</span>
            </div>
          </div>

          <button className="pc-delete-btn" onClick={() => { onDelete(active.id); setActiveId(null) }}>Delete this paycheck</button>
        </div>
      )}

      {paychecks.length === 0 && <p className="fin-empty">No paychecks added yet. Click "+ Add Paycheck" to start tracking.</p>}
    </div>
  )
}
