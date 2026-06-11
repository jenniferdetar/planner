import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './FinancialPanel.css'

const EXPENSE_CATEGORIES = ['Housing', 'Food', 'Transport', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Savings', 'Other']

function fmt(n) {
  return Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

const FULL_AMOUNT_BILLS = ['Mortgage', 'HOA', 'HELOC (California Credit Union)']

export default function FinancialPanel({
  transactions, onAddTransaction, onDeleteTransaction,
  bills, onAddBill, onToggleBillPaid, onDeleteBill,
  goals, onAddGoal, onUpdateGoalAmount, onDeleteGoal,
  paychecks = [], onAddPaycheck, onUpdatePaycheckAmount, onTogglePaycheckBill, onDeletePaycheck,
  userId,
}) {
  const [tab, setTab] = useState('tracker')

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
        {['bills', 'tracker', 'goals', 'coins'].map(t => (
          <button key={t} className={`fin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'tracker' ? 'Paycheck' : t === 'coins' ? 'Cash on Hand' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'bills' && <BillsTab bills={bills} onAdd={onAddBill} onToggle={onToggleBillPaid} onDelete={onDeleteBill} />}
      {tab === 'tracker' && <PaycheckTracker bills={bills} paychecks={paychecks} onAdd={onAddPaycheck} onUpdateAmount={onUpdatePaycheckAmount} onToggleBill={onTogglePaycheckBill} onDelete={onDeletePaycheck} />}
      {tab === 'goals' && <GoalsTab goals={goals} onUpdate={onUpdateGoalAmount} />}
      {tab === 'coins' && <CoinsTab userId={userId} />}
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

  const total3 = sortedRows.reduce((s, r) => s + Number(r.mo3?.current_amount || 0), 0)
  const total6 = sortedRows.reduce((s, r) => s + Number(r.mo6?.current_amount || 0), 0)
  const target3 = sortedRows.reduce((s, r) => s + Number(r.mo3?.target_amount || 0), 0)
  const target6 = sortedRows.reduce((s, r) => s + Number(r.mo6?.target_amount || 0), 0)

  function startEdit(goal) {
    setEditing(goal.id)
    setEditVal(String(goal.current_amount))
  }

  async function commitEdit() {
    if (!editing) return
    await onUpdate(editing, parseFloat(editVal) || 0)
    setEditing(null)
  }

  function GoalCell({ goal }) {
    if (!goal) return <td className="goals-cell empty">—</td>
    const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0
    const isEditing = editing === goal.id
    return (
      <td className="goals-cell" onClick={() => !isEditing && startEdit(goal)}>
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
  { name: '$100 Bills', value: 100.00, symbol: '$100' },
  { name: '$50 Bills', value: 50.00, symbol: '$50' },
  { name: '$20 Bills', value: 20.00, symbol: '$20' },
  { name: '$10 Bills', value: 10.00, symbol: '$10' },
  { name: '$5 Bills', value: 5.00, symbol: '$5' },
  { name: '$2 Bills', value: 2.00, symbol: '$2' },
  { name: '$1 Bills', value: 1.00, symbol: '$1' },
]

const COIN_TYPES = [
  { name: 'Half Dollars', value: 0.50, symbol: '50¢' },
  { name: 'Quarters', value: 0.25, symbol: '25¢' },
  { name: 'Dimes', value: 0.10, symbol: '10¢' },
  { name: 'Nickels', value: 0.05, symbol: '5¢' },
  { name: 'Pennies', value: 0.01, symbol: '1¢' },
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
      <div className="coins-table-wrap">
        <table className="coins-table">
          <thead>
            <tr>
              <th>Denomination</th>
              <th>Value</th>
              <th>Count</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {ALL_DENOMINATIONS.map((coin, i) => (
              <>
                {i === BILL_TYPES.length && (
                  <tr key="divider" className="coins-section-divider">
                    <td colSpan={4}>Coins</td>
                  </tr>
                )}
                <tr key={coin.name} className="coins-row">
                  <td className="coins-td-name">{coin.name}</td>
                  <td className="coins-td-val">{coin.symbol}</td>
                  <td className="coins-td-count">
                    <button className="coins-btn" onClick={() => update(coin.name, -1)}>−</button>
                    <input
                      className="coins-input"
                      type="number" min="0"
                      value={counts[coin.name] || 0}
                      onChange={e => setDirect(coin.name, e.target.value)}
                    />
                    <button className="coins-btn" onClick={() => update(coin.name, 1)}>+</button>
                  </td>
                  <td className="coins-td-sub">{fmt((counts[coin.name] || 0) * coin.value)}</td>
                </tr>
              </>
            ))}
          </tbody>
          <tfoot>
            <tr className="coins-total-row">
              <td colSpan={3} className="coins-td-total-label">Total</td>
              <td className="coins-td-total">{fmt(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
