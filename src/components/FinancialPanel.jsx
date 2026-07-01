import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useIcaapNote } from '../hooks/useIcaapNote'
import './FinancialPanel.css'
import ZeroBasedBudget from './ZeroBasedBudget'

const EXPENSE_CATEGORIES = ['Housing', 'Food', 'Transport', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Savings', 'Other']

function fmt(n) {
  return Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

const FULL_AMOUNT_BILLS = ['Mortgage', 'HOA', 'HELOC (California Credit Union)']
const PALETTE = ['#3164a0', '#c77b3a', '#4a7a6a', '#9b59b6', '#c0392b', '#1abc9c', '#e07a5f', '#2e7d32']

// Shared state so the tabbed content (Bills/Goals/Cash on Hand/Laundry/Notes)
// can render on the left binder page while the budget envelopes always show
// on the right page, staying in sync on the underlying data.
export function useFinancialPage({
  transactions, onAddTransaction, onDeleteTransaction,
  bills, onAddBill, onToggleBillPaid, onDeleteBill,
  goals, onAddGoal, onUpdateGoalAmount, onDeleteGoal,
  paychecks = [], onAddPaycheck, onUpdatePaycheckAmount, onTogglePaycheckBill, onDeletePaycheck,
  userId,
}) {
  const [tab, setTab] = useState('bills')

  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthlyTxns = transactions.filter(t => t.txn_date?.startsWith(thisMonth))
  const totalIncome = monthlyTxns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = monthlyTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const unpaidBills = bills.filter(b => !b.paid).reduce((s, b) => s + Number(b.amount), 0)

  return {
    transactions, onAddTransaction, onDeleteTransaction,
    bills, onAddBill, onToggleBillPaid, onDeleteBill,
    goals, onAddGoal, onUpdateGoalAmount, onDeleteGoal,
    paychecks, onAddPaycheck, onUpdatePaycheckAmount, onTogglePaycheckBill, onDeletePaycheck,
    userId, tab, setTab, totalIncome, totalExpenses, unpaidBills,
  }
}

// Left binder page: summary stats + tabs (Bills/Goals/Cash on Hand/Laundry/Notes).
export function FinancialPageLeft({ api }) {
  return (
    <div className="fin-panel">
      <div className="fin-summary">
        <div className="fin-stat">
          <div className="fin-stat-header fin-stat-header--income">
            <span className="fin-stat-lbl">Income</span>
          </div>
          <span className="fin-stat-num income">{fmt(api.totalIncome)}</span>
        </div>
        <div className="fin-stat">
          <div className="fin-stat-header fin-stat-header--expense">
            <span className="fin-stat-lbl">Spent</span>
          </div>
          <span className="fin-stat-num expense">{fmt(api.totalExpenses)}</span>
        </div>
        <div className="fin-stat">
          <div className="fin-stat-header fin-stat-header--bills">
            <span className="fin-stat-lbl">Bills Due</span>
          </div>
          <span className="fin-stat-num bills-due">{fmt(api.unpaidBills)}</span>
        </div>
      </div>

      <div className="fin-tabs">
        {['bills', 'goals', 'coins', 'laundry', 'notes'].map(t => (
          <button key={t} className={`fin-tab ${api.tab === t ? 'active' : ''}`} onClick={() => api.setTab(t)}>
            {t === 'coins' ? 'Cash on Hand' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {api.tab === 'bills' && <BillsTab bills={api.bills} onAdd={api.onAddBill} onToggle={api.onToggleBillPaid} onDelete={api.onDeleteBill} />}
      {api.tab === 'goals' && <GoalsTab goals={api.goals} onUpdate={api.onUpdateGoalAmount} />}
      {api.tab === 'coins' && <CoinsTab userId={api.userId} />}
      {api.tab === 'laundry' && <LaundryTab userId={api.userId} />}
      {api.tab === 'notes' && <NotesTab userId={api.userId} />}
    </div>
  )
}

// Right binder page: budget envelopes, always visible.
export function FinancialPageRight({ api }) {
  return (
    <div className="fin-panel">
      <div className="fin-page-header"><span>Zero-Based Budget</span></div>
      <ZeroBasedBudget userId={api.userId} bills={api.bills} />
    </div>
  )
}

export default function FinancialPanel(props) {
  const api = useFinancialPage(props)
  return (
    <div className="fin-panel-wrap">
      <FinancialPageLeft api={api} />
      <FinancialPageRight api={api} />
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

      <div className="fin-bill-grid">
        {bills.length === 0 && <p className="fin-empty">No bills added yet</p>}
        {unpaid.map((b, i) => <BillCard key={b.id} bill={b} index={i} onToggle={onToggle} onDelete={onDelete} />)}
        {paid.length > 0 && unpaid.length > 0 && <div className="fin-bill-grid-sep">Paid</div>}
        {paid.map((b, i) => <BillCard key={b.id} bill={b} index={unpaid.length + i} onToggle={onToggle} onDelete={onDelete} />)}
      </div>
    </div>
  )
}

function BillCard({ bill, index, onToggle, onDelete }) {
  const suffix = bill.due_day === 1 ? 'st' : bill.due_day === 2 ? 'nd' : bill.due_day === 3 ? 'rd' : 'th'
  const color = bill.paid ? '#5cb85c' : PALETTE[index % PALETTE.length]
  return (
    <div className={`fin-bill-card ${bill.paid ? 'paid' : ''}`} onClick={() => onToggle(bill.id)}>
      <div className="fin-bill-card-top" style={{ background: color }} />
      <button className="fin-bill-card-delete" onClick={e => { e.stopPropagation(); onDelete(bill.id) }}>✕</button>
      <div className="fin-bill-card-amount">{fmt(bill.amount)}</div>
      <div className="fin-bill-card-name">{bill.name}</div>
      <div className="fin-bill-card-meta">
        {bill.due_day && <span>Due {bill.due_day}{suffix}</span>}
        {bill.payment_method && <span className={`fin-bill-method ${bill.payment_method === 'Cash' ? 'cash' : 'billpay'}`}>{bill.payment_method}</span>}
      </div>
      {bill.paid && <div className="fin-bill-card-paid-badge">✓ Paid</div>}
    </div>
  )
}

export function GoalsTab({ goals, onUpdate }) {
  const [editing, setEditing] = useState(null)
  const [editVal, setEditVal] = useState('')

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

  function startEdit(goal, e) {
    e.stopPropagation()
    setEditing(goal.id)
    setEditVal(String(goal.current_amount))
  }

  async function commitEdit() {
    if (!editing) return
    await onUpdate(editing, parseFloat(editVal) || 0)
    setEditing(null)
  }

  function GoalBar({ goal, label }) {
    if (!goal) return null
    const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0
    const isEditing = editing === goal.id
    return (
      <div className="goal-card-row">
        <span className="goal-card-label">{label}</span>
        {isEditing ? (
          <input
            className="goal-card-input"
            type="number" step="0.01" min="0"
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null) }}
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="goal-card-amounts" onClick={e => startEdit(goal, e)}>
            <span className="goal-card-saved">{fmt(goal.current_amount)}</span>
            <span className="goal-card-target">/ {fmt(goal.target_amount)}</span>
          </span>
        )}
        <div className="goal-card-bar">
          <div className="goal-card-fill" style={{ width: `${pct}%`, background: pct >= 100 ? '#5cb85c' : 'var(--card-color, #3164a0)' }} />
        </div>
        <span className="goal-card-pct">{pct}%</span>
      </div>
    )
  }

  return (
    <div className="fin-content">
      <div className="fin-goals-grid">
        {sortedRows.map((row, idx) => {
          const color = PALETTE[idx % PALETTE.length]
          return (
            <div key={row.name} className="goal-card" style={{ '--card-color': color }}>
              <div className="goal-card-top" style={{ background: color }} />
              <div className="goal-card-name">{row.name}</div>
              <div className="goal-card-body">
                <GoalBar goal={row.mo3} label="3 mo" />
                <GoalBar goal={row.mo6} label="6 mo" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PaycheckTracker({ bills, paychecks, onAdd, onUpdateAmount, onToggleBill, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [formDate, setFormDate] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [editingCell, setEditingCell] = useState(null) // { paycheckId }
  const [editVal, setEditVal] = useState('')

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

  function fmtDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
  }

  const sorted = [...paychecks].sort((a, b) => a.pay_date.localeCompare(b.pay_date))
  const allocatedTotal = bills.reduce((s, b) => s + billAmount(b), 0)

  return (
    <div className="fin-content pc-table-content">
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

      {paychecks.length === 0 && <p className="fin-empty">No paychecks yet. Click "+ Add Paycheck" to start.</p>}

      {paychecks.length > 0 && (
        <div className="pc-table-wrap">
          <table className="pc-table">
            <thead>
              <tr>
                <th className="pc-th-account">Account</th>
                {sorted.map(p => (
                  <th key={p.id} className="pc-th-date">
                    {fmtDate(p.pay_date)}
                    <button className="pc-col-del" onClick={() => onDelete(p.id)} title="Delete">✕</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Jennifer's Check row — paycheck amount, editable */}
              <tr className="pc-row-check">
                <td className="pc-td-account pc-td-check-label">Jennifer's Check</td>
                {sorted.map(p => (
                  <td key={p.id} className="pc-td-check-amount"
                    onClick={() => { setEditingCell(p.id); setEditVal(String(p.amount)) }}>
                    {editingCell === p.id ? (
                      <input
                        className="pc-cell-input"
                        type="number" step="0.01" min="0"
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={() => { onUpdateAmount(p.id, parseFloat(editVal) || 0); setEditingCell(null) }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { onUpdateAmount(p.id, parseFloat(editVal) || 0); setEditingCell(null) }
                          if (e.key === 'Escape') setEditingCell(null)
                        }}
                        autoFocus
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      p.amount > 0 ? fmt(p.amount) : '—'
                    )}
                  </td>
                ))}
              </tr>

              {/* Bill rows */}
              {bills.map(bill => {
                const amt = billAmount(bill)
                return (
                  <tr key={bill.id} className="pc-row-bill">
                    <td className="pc-td-account">
                      <span className="pc-td-bill-name">{bill.name}</span>
                      <span className={`pc-td-method ${bill.payment_method === 'Cash' ? 'cash' : 'billpay'}`}>
                        {bill.payment_method || 'Bill Pay'}
                      </span>
                    </td>
                    {sorted.map(p => {
                      const paid = (p.paid_bill_ids || []).includes(bill.id)
                      return (
                        <td key={p.id}
                          className={`pc-td-cell ${paid ? 'paid' : ''}`}
                          onClick={() => onToggleBill(p.id, bill.id)}>
                          {paid ? <span className="pc-cell-check">✓</span> : null}
                          <span className="pc-cell-amt">{fmt(amt)}</span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}

              {/* Totals row */}
              <tr className="pc-row-total">
                <td className="pc-td-account pc-td-total-label">Total Bills</td>
                {sorted.map(p => (
                  <td key={p.id} className="pc-td-total">{fmt(allocatedTotal)}</td>
                ))}
              </tr>

              {/* Left over row */}
              <tr className="pc-row-leftover">
                <td className="pc-td-account pc-td-leftover-label">Left Over</td>
                {sorted.map(p => {
                  const lo = Number(p.amount) - allocatedTotal
                  return (
                    <td key={p.id} className="pc-td-leftover" style={{ color: lo >= 0 ? '#5cb85c' : '#e05c5c' }}>
                      {fmt(lo)}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const BILL_TYPES = [
  { name: '$1 Bills', value: 1.00, symbol: '$1' },
  { name: '$2 Bills', value: 2.00, symbol: '$2' },
  { name: '$5 Bills', value: 5.00, symbol: '$5' },
  { name: '$10 Bills', value: 10.00, symbol: '$10' },
  { name: '$20 Bills', value: 20.00, symbol: '$20' },
  { name: '$50 Bills', value: 50.00, symbol: '$50' },
  { name: '$100 Bills', value: 100.00, symbol: '$100' },
]

const COIN_TYPES = [
  { name: 'Pennies', value: 0.01, symbol: '1¢' },
  { name: 'Nickels', value: 0.05, symbol: '5¢' },
  { name: 'Dimes', value: 0.10, symbol: '10¢' },
  { name: 'Quarters', value: 0.25, symbol: '25¢' },
  { name: 'Half Dollars', value: 0.50, symbol: '50¢' },
]

const ALL_DENOMINATIONS = [...BILL_TYPES, ...COIN_TYPES]

function CoinsTab({ userId }) {
  const [counts, setCounts] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!userId) return
    supabase.from('coin_counts').select('coin_name, count').eq('user_id', userId)
      .then(({ data }) => {
        if (data) {
          const obj = {}
          data.forEach(r => { obj[r.coin_name] = r.count })
          setCounts(obj)
        }
      })
  }, [userId])

  async function save(next) {
    if (!userId) return
    setSaving(true)
    const upserts = Object.entries(next).map(([coin_name, count]) => ({ user_id: userId, coin_name, count }))
    await supabase.from('coin_counts').upsert(upserts, { onConflict: 'user_id,coin_name' })
    setSaving(false)
  }

  function update(name, delta) {
    setCounts(prev => {
      const next = { ...prev, [name]: Math.max(0, (prev[name] || 0) + delta) }
      save(next)
      return next
    })
  }

  function setDirect(name, val) {
    const n = Math.max(0, parseInt(val) || 0)
    setCounts(prev => {
      const next = { ...prev, [name]: n }
      save(next)
      return next
    })
  }

  async function reset() {
    const empty = {}
    setCounts(empty)
    if (userId) await supabase.from('coin_counts').delete().eq('user_id', userId)
  }

  const total = ALL_DENOMINATIONS.reduce((s, c) => s + (counts[c.name] || 0) * c.value, 0)

  return (
    <div className="fin-content">
      <div className="fin-toolbar">
        <span className="fin-toolbar-label">Cash on Hand</span>
        <span className="coins-total-badge">{fmt(total)}</span>
        {saving && <span style={{ fontSize: 11, color: '#999' }}>Saving…</span>}
        <button className="fin-cancel" onClick={reset}>Reset</button>
      </div>
      <div className="coins-split-wrap">
        <div className="coins-half">
          <div className="coins-half-title">Bills</div>
          <table className="coins-table">
            <thead><tr><th>Denomination</th><th>Count</th><th>Subtotal</th></tr></thead>
            <tbody>
              {BILL_TYPES.map(coin => (
                <tr key={coin.name} className="coins-row">
                  <td className="coins-td-name">{coin.name} <span className="coins-td-val">{coin.symbol}</span></td>
                  <td className="coins-td-count">
                    <button className="coins-btn" onClick={() => update(coin.name, -1)}>−</button>
                    <input className="coins-input" type="number" min="0" value={counts[coin.name] || 0} onChange={e => setDirect(coin.name, e.target.value)} />
                    <button className="coins-btn" onClick={() => update(coin.name, 1)}>+</button>
                  </td>
                  <td className="coins-td-sub">{fmt((counts[coin.name] || 0) * coin.value)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="coins-total-row">
                <td className="coins-td-total-label">Bills Total</td>
                <td></td>
                <td className="coins-td-total">{fmt(BILL_TYPES.reduce((s,c) => s + (counts[c.name]||0)*c.value, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="coins-half">
          <div className="coins-half-title">Coins</div>
          <table className="coins-table">
            <thead><tr><th>Denomination</th><th>Count</th><th>Subtotal</th></tr></thead>
            <tbody>
              {COIN_TYPES.map(coin => (
                <tr key={coin.name} className="coins-row">
                  <td className="coins-td-name">{coin.name} <span className="coins-td-val">{coin.symbol}</span></td>
                  <td className="coins-td-count">
                    <button className="coins-btn" onClick={() => update(coin.name, -1)}>−</button>
                    <input className="coins-input" type="number" min="0" value={counts[coin.name] || 0} onChange={e => setDirect(coin.name, e.target.value)} />
                    <button className="coins-btn" onClick={() => update(coin.name, 1)}>+</button>
                  </td>
                  <td className="coins-td-sub">{fmt((counts[coin.name] || 0) * coin.value)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="coins-total-row">
                <td className="coins-td-total-label">Coins Total</td>
                <td></td>
                <td className="coins-td-total">{fmt(COIN_TYPES.reduce((s,c) => s + (counts[c.name]||0)*c.value, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

const BUDGET_SECTIONS = [
  { key: 'Income',    label: 'INCOME',             color: '#1a6b2a' },
  { key: 'Fixed',     label: 'FIXED EXPENSES',     color: '#1e3070' },
  { key: 'Variable',  label: 'VARIABLE EXPENSES',  color: '#7d3c98' },
  { key: 'Savings',   label: 'SAVINGS & DEBT',     color: '#b34d00' },
]

const DEFAULT_ROWS = [
  { section: 'Income',   category: 'Salary / Wages',         budgeted: 0, sort_order: 0 },
  { section: 'Income',   category: 'Other Income',            budgeted: 0, sort_order: 1 },
  { section: 'Fixed',    category: 'Bills',                   budgeted: 0, sort_order: 2 },
  { section: 'Fixed',    category: 'Mortgage / Rent',         budgeted: 0, sort_order: 3 },
  { section: 'Fixed',    category: 'Insurance',               budgeted: 0, sort_order: 4 },
  { section: 'Variable', category: 'Food & Groceries',        budgeted: 0, sort_order: 5 },
  { section: 'Variable', category: 'Transport',               budgeted: 0, sort_order: 6 },
  { section: 'Variable', category: 'Healthcare',              budgeted: 0, sort_order: 7 },
  { section: 'Variable', category: 'Entertainment',           budgeted: 0, sort_order: 8 },
  { section: 'Variable', category: 'Personal / Shopping',     budgeted: 0, sort_order: 9 },
  { section: 'Variable', category: 'Other',                   budgeted: 0, sort_order: 10 },
  { section: 'Savings',  category: 'Savings',                 budgeted: 0, sort_order: 11 },
  { section: 'Savings',  category: 'Debt Payments',           budgeted: 0, sort_order: 12 },
]

function BudgetTab({ bills, userId }) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 3 + i)
    return d.toISOString().slice(0, 7)
  })
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [rows, setRows] = useState([])
  const [editBudget, setEditBudget] = useState({})
  const [editActual, setEditActual] = useState({})
  const [adding, setAdding] = useState(null)
  const [newCat, setNewCat] = useState('')
  const [loaded, setLoaded] = useState(false)

  const billsTotal = bills.reduce((s, b) => s + Number(b.amount), 0)

  useEffect(() => {
    if (!userId) return
    setLoaded(false)
    supabase.from('budget_categories').select('*')
      .eq('user_id', userId).eq('month', month).order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setRows(data)
        } else {
          setRows(DEFAULT_ROWS.map(r => ({ ...r, id: null, user_id: userId, actual: 0, month })))
        }
        setLoaded(true)
      })
  }, [userId, month])

  function getActual(row) {
    if (row.category === 'Bills') return billsTotal
    return Number(row.actual) || 0
  }

  async function saveField(row, field, value) {
    const val = parseFloat(value) || 0
    const updated = { ...row, [field]: val }
    if (row.id) {
      await supabase.from('budget_categories').update({ [field]: val }).eq('id', row.id)
      setRows(r => r.map(x => x.category === row.category && x.section === row.section ? updated : x))
    } else {
      const { data } = await supabase.from('budget_categories')
        .insert({ user_id: userId, category: row.category, section: row.section, budgeted: updated.budgeted, actual: updated.actual, sort_order: row.sort_order, month })
        .select().single()
      if (data) setRows(r => r.map(x => x.category === row.category && x.section === row.section ? data : x))
    }
    setEditBudget(e => ({ ...e, [row.category]: undefined }))
    setEditActual(e => ({ ...e, [row.category]: undefined }))
  }

  async function addRow(section) {
    if (!newCat.trim()) return
    const sort_order = rows.filter(r => r.section === section).length + rows.indexOf(rows.filter(r => r.section === section).slice(-1)[0])
    const newRow = { user_id: userId, category: newCat.trim(), section, budgeted: 0, actual: 0, sort_order, month }
    const { data } = await supabase.from('budget_categories').insert(newRow).select().single()
    if (data) setRows(r => [...r, data])
    setNewCat(''); setAdding(null)
  }

  async function deleteRow(row) {
    if (row.id) await supabase.from('budget_categories').delete().eq('id', row.id)
    setRows(r => r.filter(x => !(x.category === row.category && x.section === row.section)))
  }

  const monthLabel = m => { const [y, mo] = m.split('-'); return new Date(y, mo - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }

  const totalIncome = rows.filter(r => r.section === 'Income').reduce((s, r) => s + Number(r.budgeted), 0)
  const totalExpenses = rows.filter(r => r.section !== 'Income').reduce((s, r) => s + Number(r.budgeted), 0)
  const netBudget = totalIncome - totalExpenses
  const totalActualIncome = rows.filter(r => r.section === 'Income').reduce((s, r) => s + getActual(r), 0)
  const totalActualExpenses = rows.filter(r => r.section !== 'Income').reduce((s, r) => s + getActual(r), 0)
  const netActual = totalActualIncome - totalActualExpenses

  return (
    <div className="budget-wrap">
      <div className="budget-header">
        <h2 className="budget-title">Personal Finance Tracker</h2>
        <select className="budget-month-sel" value={month} onChange={e => setMonth(e.target.value)}>
          {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
      </div>

      <div className="budget-summary-bar">
        <div className="budget-summary-item" style={{ background: '#1a6b2a22' }}>
          <span className="budget-summary-lbl" style={{ color: '#1a6b2a' }}>Income</span>
          <span className="budget-summary-val" style={{ color: '#1a6b2a' }}>{fmt(totalActualIncome)}</span>
        </div>
        <div className="budget-summary-item" style={{ background: '#b34d0022' }}>
          <span className="budget-summary-lbl" style={{ color: '#b34d00' }}>Expenses</span>
          <span className="budget-summary-val" style={{ color: '#b34d00' }}>{fmt(totalActualExpenses)}</span>
        </div>
        <div className="budget-summary-item" style={{ background: netActual >= 0 ? '#1a6b2a22' : '#e05c5c22' }}>
          <span className="budget-summary-lbl">Net</span>
          <span className="budget-summary-val" style={{ color: netActual >= 0 ? '#1a6b2a' : '#e05c5c' }}>{fmt(netActual)}</span>
        </div>
      </div>

      <div className="budget-table-wrap">
        <table className="budget-table">
          <thead>
            <tr>
              <th className="budget-th cat">Category</th>
              <th className="budget-th">Budgeted</th>
              <th className="budget-th">Actual</th>
              <th className="budget-th">Difference</th>
              <th className="budget-th del-col"></th>
            </tr>
          </thead>
          <tbody>
            {BUDGET_SECTIONS.map(sec => {
              const secRows = rows.filter(r => r.section === sec.key)
              const secBudget = secRows.reduce((s, r) => s + Number(r.budgeted), 0)
              const secActual = secRows.reduce((s, r) => s + getActual(r), 0)
              const secDiff = sec.key === 'Income' ? secActual - secBudget : secBudget - secActual
              return [
                <tr key={`hd-${sec.key}`} className="budget-section-row">
                  <td colSpan={5} className="budget-section-hd" style={{ background: sec.color }}>
                    {sec.label}
                  </td>
                </tr>,
                ...secRows.map(row => {
                  const actual = getActual(row)
                  const budgeted = Number(row.budgeted)
                  const diff = sec.key === 'Income' ? actual - budgeted : budgeted - actual
                  const diffColor = diff >= 0 ? '#2a7a2a' : '#e05c5c'
                  return (
                    <tr key={`${sec.key}-${row.category}`} className="budget-row">
                      <td className="budget-td cat">{row.category}</td>
                      <td className="budget-td num">
                        {editBudget[row.category] !== undefined ? (
                          <input className="budget-input" type="number" autoFocus value={editBudget[row.category]}
                            onChange={e => setEditBudget(ed => ({ ...ed, [row.category]: e.target.value }))}
                            onBlur={() => saveField(row, 'budgeted', editBudget[row.category])}
                            onKeyDown={e => e.key === 'Enter' && saveField(row, 'budgeted', editBudget[row.category])}
                            min="0" step="0.01" />
                        ) : (
                          <span className="budget-cell-val" onClick={() => setEditBudget(ed => ({ ...ed, [row.category]: row.budgeted }))}>
                            {budgeted > 0 ? fmt(budgeted) : <span className="budget-empty">—</span>}
                          </span>
                        )}
                      </td>
                      <td className="budget-td num">
                        {row.category === 'Bills' ? (
                          <span>{fmt(actual)}</span>
                        ) : editActual[row.category] !== undefined ? (
                          <input className="budget-input" type="number" autoFocus value={editActual[row.category]}
                            onChange={e => setEditActual(ed => ({ ...ed, [row.category]: e.target.value }))}
                            onBlur={() => saveField(row, 'actual', editActual[row.category])}
                            onKeyDown={e => e.key === 'Enter' && saveField(row, 'actual', editActual[row.category])}
                            min="0" step="0.01" />
                        ) : (
                          <span className="budget-cell-val" onClick={() => setEditActual(ed => ({ ...ed, [row.category]: row.actual }))}>
                            {actual > 0 ? fmt(actual) : <span className="budget-empty">—</span>}
                          </span>
                        )}
                      </td>
                      <td className="budget-td num" style={{ color: diffColor, fontWeight: 600 }}>
                        {budgeted > 0 || actual > 0 ? fmt(Math.abs(diff)) : '—'}
                      </td>
                      <td className="budget-td del-col">
                        <button className="budget-del" onClick={() => deleteRow(row)}>×</button>
                      </td>
                    </tr>
                  )
                }),
                <tr key={`ft-${sec.key}`} className="budget-section-total" style={{ background: sec.color + '22' }}>
                  <td className="budget-td cat" style={{ color: sec.color, fontWeight: 700 }}>Subtotal</td>
                  <td className="budget-td num total-val" style={{ color: sec.color }}>{fmt(secBudget)}</td>
                  <td className="budget-td num total-val" style={{ color: sec.color }}>{fmt(secActual)}</td>
                  <td className="budget-td num total-val" style={{ color: secDiff >= 0 ? '#2a7a2a' : '#e05c5c' }}>{fmt(Math.abs(secDiff))}</td>
                  <td></td>
                </tr>,
                <tr key={`add-${sec.key}`} className="budget-add-row-tr">
                  <td colSpan={5} className="budget-td">
                    {adding === sec.key ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input className="budget-new-input" value={newCat} onChange={e => setNewCat(e.target.value)}
                          placeholder="New category" autoFocus onKeyDown={e => e.key === 'Enter' && addRow(sec.key)} />
                        <button className="fin-add-btn" onClick={() => addRow(sec.key)}>Add</button>
                        <button className="budget-del" onClick={() => { setAdding(null); setNewCat('') }}>×</button>
                      </div>
                    ) : (
                      <button className="budget-add-cat" onClick={() => setAdding(sec.key)}>+ Add row</button>
                    )}
                  </td>
                </tr>
              ]
            })}
            <tr className="budget-net-row">
              <td className="budget-td cat">NET (Income − Expenses)</td>
              <td className="budget-td num net-val" style={{ color: netBudget >= 0 ? '#2a7a2a' : '#e05c5c' }}>{fmt(netBudget)}</td>
              <td className="budget-td num net-val" style={{ color: netActual >= 0 ? '#2a7a2a' : '#e05c5c' }}>{fmt(netActual)}</td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Laundry Tracker ────────────────────────────────────────────────────────

const MACHINE_TYPES = [
  { key: 'top_load', label: 'Top Load Washer', costPerLoad: 1.75, defaultMinutes: 40, type: 'wash' },
  { key: 'front_load', label: 'Front Load Washer', costPerLoad: 2.00, defaultMinutes: null, type: 'wash' },
  { key: 'dryer', label: 'Dryer', costPerLoad: 1.75, defaultMinutes: 45, type: 'dry' },
]

function quartersFor(cost) { return Math.round(cost / 0.25) }

function LaundryTab({ userId }) {
  const [sessions, setSessions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    session_date: new Date().toISOString().split('T')[0],
    type: 'wash',
    machine_type: 'top_load',
    loads: 1,
    quarters: 7,
    minutes: 40,
    notes: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase.from('laundry_sessions').select('*').eq('user_id', userId)
      .order('session_date', { ascending: false }).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setSessions(data); setLoading(false) })
  }, [userId])

  function onMachineChange(machineKey) {
    const m = MACHINE_TYPES.find(x => x.key === machineKey)
    setForm(f => ({
      ...f,
      machine_type: machineKey,
      type: m.type,
      quarters: quartersFor(m.costPerLoad * f.loads),
      minutes: m.defaultMinutes || f.minutes,
    }))
  }

  function onLoadsChange(loads) {
    const n = parseInt(loads) || 1
    const m = MACHINE_TYPES.find(x => x.key === form.machine_type)
    setForm(f => ({ ...f, loads: n, quarters: quartersFor(m.costPerLoad * n) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form, user_id: userId, loads: parseInt(form.loads), quarters: parseInt(form.quarters), minutes: parseInt(form.minutes) }
    const { data } = await supabase.from('laundry_sessions').insert(payload).select().single()
    if (data) setSessions(s => [data, ...s])
    setShowForm(false)
    setForm({ session_date: new Date().toISOString().split('T')[0], type: 'wash', machine_type: 'top_load', loads: 1, quarters: 7, minutes: 40, notes: '' })
  }

  async function deleteSession(id) {
    await supabase.from('laundry_sessions').delete().eq('id', id)
    setSessions(s => s.filter(x => x.id !== id))
  }

  const byDate = {}
  sessions.forEach(s => {
    if (!byDate[s.session_date]) byDate[s.session_date] = []
    byDate[s.session_date].push(s)
  })
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a))

  function fmtDate(d) {
    const dt = new Date(d + 'T12:00:00')
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  function machineLabel(key) {
    return MACHINE_TYPES.find(m => m.key === key)?.label || key
  }

  return (
    <div className="fin-content laundry-content">
      <div className="fin-toolbar">
        <span className="fin-toolbar-label">Laundry Tracker</span>
        <button className="fin-add-btn" onClick={() => setShowForm(s => !s)}>+ Log Load</button>
      </div>

      <div className="laundry-note">
        Top Load: $1.75 (7 quarters) · Front Load: $2.00 (8 quarters) · Dryer: $1.75/load (45 min default)
      </div>

      {showForm && (
        <form className="fin-form laundry-form" onSubmit={handleSubmit}>
          <div className="fin-form-row">
            <input className="fin-input" type="date" value={form.session_date}
              onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))} required />
            <select className="fin-input" value={form.machine_type} onChange={e => onMachineChange(e.target.value)}>
              {MACHINE_TYPES.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          <div className="fin-form-row">
            <label className="laundry-lbl">
              <span>Loads</span>
              <input className="fin-input" type="number" min="1" value={form.loads} onChange={e => onLoadsChange(e.target.value)} />
            </label>
            <label className="laundry-lbl">
              <span>Quarters</span>
              <input className="fin-input" type="number" min="0" value={form.quarters} onChange={e => setForm(f => ({ ...f, quarters: e.target.value }))} />
            </label>
            <label className="laundry-lbl">
              <span>Minutes</span>
              <input className="fin-input" type="number" min="0" value={form.minutes} onChange={e => setForm(f => ({ ...f, minutes: e.target.value }))} />
            </label>
          </div>
          <input className="fin-input" placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="fin-form-actions">
            <button type="button" className="fin-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="fin-save">Save</button>
          </div>
        </form>
      )}

      {loading && <p className="fin-empty">Loading…</p>}
      {!loading && sessions.length === 0 && <p className="fin-empty">No laundry sessions yet.</p>}

      <div className="laundry-days-grid">
        {dates.map(date => {
          const daySessions = byDate[date]
          const washSessions = daySessions.filter(s => s.type === 'wash')
          const drySessions = daySessions.filter(s => s.type === 'dry')
          const totalQuarters = daySessions.reduce((s, x) => s + x.quarters, 0)
          const totalCost = totalQuarters * 0.25

          return (
            <div key={date} className="laundry-day">
              <div className="laundry-day-header">
                <span className="laundry-day-date">{fmtDate(date)}</span>
                <span className="laundry-day-total">{totalQuarters} quarters · {fmt(totalCost)}</span>
              </div>

              {washSessions.length > 0 && (
                <div className="laundry-section">
                  <div className="laundry-section-title laundry-section-title--wash">Washing</div>
                  <div className="laundry-card-grid">
                    {washSessions.map(s => (
                      <div key={s.id} className="laundry-session-card">
                        <button className="laundry-card-del" onClick={() => deleteSession(s.id)}>✕</button>
                        <div className="laundry-card-machine">{machineLabel(s.machine_type)}</div>
                        <div className="laundry-card-stats">
                          <span>{s.loads} {s.loads === 1 ? 'load' : 'loads'}</span>
                          <span>{s.quarters}q</span>
                          <span>{s.minutes} min</span>
                        </div>
                        <div className="laundry-card-cost">{fmt(s.quarters * 0.25)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {drySessions.length > 0 && (
                <div className="laundry-section">
                  <div className="laundry-section-title laundry-section-title--dry">Drying</div>
                  <div className="laundry-card-grid">
                    {drySessions.map(s => (
                      <div key={s.id} className="laundry-session-card">
                        <button className="laundry-card-del" onClick={() => deleteSession(s.id)}>✕</button>
                        <div className="laundry-card-machine">{machineLabel(s.machine_type)}</div>
                        <div className="laundry-card-stats">
                          <span>{s.loads} {s.loads === 1 ? 'load' : 'loads'}</span>
                          <span>{s.quarters}q</span>
                          <span>{s.minutes} min</span>
                        </div>
                        <div className="laundry-card-cost">{fmt(s.quarters * 0.25)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Notes ──────────────────────────────────────────────────────────────────

function NotesTab({ userId }) {
  const { content, handleChange, saved } = useIcaapNote(userId, 'financial')

  return (
    <div className="fin-content">
      <div className="fin-toolbar">
        <span className="fin-toolbar-label">Financial Notes</span>
        <span className="fin-notes-saved">{saved ? 'Saved' : 'Saves automatically'}</span>
      </div>
      <textarea
        className="fin-notes-area"
        placeholder="Jot down financial notes, reminders, account details…"
        value={content}
        onChange={e => handleChange(e.target.value)}
      />
    </div>
  )
}
