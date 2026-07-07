import { useState, useEffect, Fragment } from 'react'
import { supabase } from '../lib/supabase'
import './FinancialPanel.css'
import './CseaTracker.css'
import ZeroBasedBudget from './ZeroBasedBudget'

const TAB_LABELS = {
  coins: 'Cash on Hand',
  debt: 'Debt Snowball',
  networth: 'Net Worth',
  savings: 'Sinking Funds',
}

function fmt(n) {
  return Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

const PALETTE = ['#3164a0', '#c77b3a', '#4a7a6a', '#9b59b6', '#c0392b', '#1abc9c', '#e07a5f', '#2e7d32']

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

function FinancialPanelInner({ api }) {
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
        {['bills', 'goals', 'coins', 'budget', 'debt', 'networth', 'savings', 'laundry', 'notes'].map(t => (
          <button key={t} className={`fin-tab ${api.tab === t ? 'active' : ''}`} onClick={() => api.setTab(t)}>
            {TAB_LABELS[t] || t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {api.tab === 'bills' && <BillsTab bills={api.bills} onAdd={api.onAddBill} onToggle={api.onToggleBillPaid} onDelete={api.onDeleteBill} />}
      {api.tab === 'goals' && <GoalsTab goals={api.goals} onUpdate={api.onUpdateGoalAmount} />}
      {api.tab === 'coins' && <CoinsTab userId={api.userId} />}
      {api.tab === 'budget' && <ZeroBasedBudget userId={api.userId} bills={api.bills} />}
      {api.tab === 'debt' && <DebtSnowballTab userId={api.userId} />}
      {api.tab === 'networth' && <NetWorthTab userId={api.userId} />}
      {api.tab === 'savings' && <SinkingFundsTab userId={api.userId} />}
      {api.tab === 'laundry' && <LaundryTab userId={api.userId} />}
      {api.tab === 'notes' && <NotesTab userId={api.userId} />}
    </div>
  )
}

export default function FinancialPanel(props) {
  const api = useFinancialPage(props)
  return (
    <FinancialPanelInner api={api} />
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
      <div className="budget-header">
        <h2 className="budget-title">Bills</h2>
      </div>
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

      <div className="budget-table-wrap">
        {bills.length === 0 && <p className="fin-empty">No bills added yet</p>}
        {bills.length > 0 && (
          <table className="budget-table bills-table">
            <thead>
              <tr>
                <th className="budget-th cat">Bill</th>
                <th className="budget-th">Amount</th>
                <th className="budget-th">Due</th>
                <th className="budget-th">Method</th>
                <th className="budget-th">Paid</th>
                <th className="budget-th del-col"></th>
              </tr>
            </thead>
            <tbody>
              {unpaid.map((b, i) => <BillRow key={b.id} bill={b} index={i} onToggle={onToggle} onDelete={onDelete} />)}
              {paid.length > 0 && unpaid.length > 0 && (
                <tr><td colSpan={6} className="fin-bill-table-sep">Paid</td></tr>
              )}
              {paid.map((b, i) => <BillRow key={b.id} bill={b} index={unpaid.length + i} onToggle={onToggle} onDelete={onDelete} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function BillRow({ bill, onToggle, onDelete }) {
  const suffix = bill.due_day === 1 ? 'st' : bill.due_day === 2 ? 'nd' : bill.due_day === 3 ? 'rd' : 'th'
  return (
    <tr className={`budget-row${bill.paid ? ' paid' : ''}`}>
      <td className="budget-td cat">{bill.name}</td>
      <td className="budget-td num">{fmt(bill.amount)}</td>
      <td className="budget-td num">{bill.due_day ? `${bill.due_day}${suffix}` : <span className="budget-empty">—</span>}</td>
      <td className="budget-td">
        {bill.payment_method && <span className={`fin-bill-method ${bill.payment_method === 'Cash' ? 'cash' : 'billpay'}`}>{bill.payment_method}</span>}
      </td>
      <td className="budget-td num">
        <input type="checkbox" checked={!!bill.paid} onChange={() => onToggle(bill.id)} />
      </td>
      <td className="budget-td del-col">
        <span className="budget-del" onClick={() => onDelete(bill.id)}>✕</span>
      </td>
    </tr>
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
  const dueDateLabel = d => {
    if (!d) return null
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
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

  function GoalCell({ goal, color }) {
    if (!goal) return <td className="budget-td goal-td"><span className="budget-empty">—</span></td>
    const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0
    const isEditing = editing === goal.id
    return (
      <td className="budget-td goal-td">
        <div className="goal-card-row">
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
          <div className="goal-card-bar" style={{ '--card-color': color }}>
            <div className="goal-card-fill" style={{ width: `${pct}%`, background: pct >= 100 ? '#5cb85c' : 'var(--card-color, #3164a0)' }} />
          </div>
          <span className="goal-card-pct">{pct}%</span>
        </div>
      </td>
    )
  }

  return (
    <div className="fin-content">
      <div className="budget-header">
        <h2 className="budget-title">Emergency Fund Goals</h2>
      </div>
      <div className="budget-table-wrap">
        {sortedRows.length === 0 && <p className="fin-empty">No goals added yet.</p>}
        {sortedRows.length > 0 && (
          <table className="budget-table">
            <thead>
              <tr>
                <th className="budget-th cat">Goal Name</th>
                <th className="budget-th">3 Months</th>
                <th className="budget-th">6 Months</th>
                <th className="budget-th">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, idx) => {
                const color = PALETTE[idx % PALETTE.length]
                const due = dueDateLabel((row.mo3 || row.mo6)?.due_date)
                return (
                  <tr key={row.name} className="budget-row">
                    <td className="budget-td cat">{row.name}</td>
                    <GoalCell goal={row.mo3} color={color} />
                    <GoalCell goal={row.mo6} color={color} />
                    <td className="budget-td">{due ? `Due ${due}` : <span className="budget-empty">—</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
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
      <div className="budget-header">
        <h2 className="budget-title">Cash on Hand</h2>
      </div>
      <div className="fin-toolbar">
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

// ─── Debt Snowball ──────────────────────────────────────────────────────────

// Simulates the snowball month by month (no interest — balances only move via
// minimum payments, plus the full rolled-in payment once a debt becomes the
// active target). Rows must already be sorted smallest-balance-first.
function simulateSnowball(rows) {
  const n = rows.length
  const monthsPaidOff = new Array(n).fill(null)
  if (n === 0) return { monthsPaidOff, totalMonths: 0 }

  const balances = rows.map(r => r.total_payoff)
  const mins = rows.map(r => r.minimum_payment)
  const MAX_MONTHS = 1200 // 100-year safety cap

  balances.forEach((b, i) => { if (b <= 0.005) monthsPaidOff[i] = 0 })

  let month = 0
  while (monthsPaidOff.includes(null) && month < MAX_MONTHS) {
    month++
    const target = monthsPaidOff.findIndex(m => m === null)
    // Every already-paid-off debt's minimum permanently rolls into whichever debt is currently active
    const rolledIn = mins.reduce((s, m, j) => (monthsPaidOff[j] !== null ? s + m : s), 0)
    balances[target] = Math.max(0, balances[target] - (mins[target] + rolledIn))
    for (let j = 0; j < n; j++) {
      if (j === target || monthsPaidOff[j] !== null) continue
      balances[j] = Math.max(0, balances[j] - mins[j])
    }
    // A lower-priority debt can finish "in the background" from its own minimum before its turn
    for (let j = 0; j < n; j++) {
      if (monthsPaidOff[j] === null && balances[j] <= 0.005) monthsPaidOff[j] = month
    }
  }
  return { monthsPaidOff, totalMonths: month }
}

function payoffLabel(months) {
  if (months == null) return '100+ yrs'
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function DebtSnowballTab({ userId }) {
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', total_payoff: '', minimum_payment: '', group_name: '', owner: '', goal_months: '' })
  const [editCell, setEditCell] = useState(null) // { id, field }
  const [editVal, setEditVal] = useState('')
  const [expanded, setExpanded] = useState({}) // { [groupName]: bool }

  useEffect(() => {
    if (!userId) return
    supabase.from('debts').select('*').eq('user_id', userId)
      .then(({ data }) => { if (data) setDebts(data); setLoading(false) })
  }, [userId])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    const payload = {
      user_id: userId,
      name: form.name.trim(),
      total_payoff: parseFloat(form.total_payoff) || 0,
      minimum_payment: parseFloat(form.minimum_payment) || 0,
      group_name: form.group_name.trim() || null,
      owner: form.owner.trim() || null,
      goal_months: form.goal_months.trim() === '' ? null : parseInt(form.goal_months, 10) || null,
    }
    const { data } = await supabase.from('debts').insert(payload).select().single()
    if (data) setDebts(d => [...d, data])
    setForm({ name: '', total_payoff: '', minimum_payment: '', group_name: '', owner: '', goal_months: '' })
    setShowForm(false)
  }

  async function saveField(debt, field, value) {
    const val = parseFloat(value) || 0
    await supabase.from('debts').update({ [field]: val }).eq('id', debt.id)
    setDebts(d => d.map(x => x.id === debt.id ? { ...x, [field]: val } : x))
    setEditCell(null)
  }

  async function saveOwner(ids, value) {
    const val = value.trim() || null
    await supabase.from('debts').update({ owner: val }).in('id', ids)
    setDebts(d => d.map(x => ids.includes(x.id) ? { ...x, owner: val } : x))
    setEditCell(null)
  }

  async function saveGoal(ids, value) {
    const val = value.trim() === '' ? null : parseInt(value, 10) || null
    await supabase.from('debts').update({ goal_months: val }).in('id', ids)
    setDebts(d => d.map(x => ids.includes(x.id) ? { ...x, goal_months: val } : x))
    setEditCell(null)
  }

  async function deleteDebt(id) {
    await supabase.from('debts').delete().eq('id', id)
    setDebts(d => d.filter(x => x.id !== id))
  }

  function toggleExpand(groupName) {
    setExpanded(e => ({ ...e, [groupName]: !e[groupName] }))
  }

  // Roll grouped debts up into a single snowball-order entry; ungrouped debts stay individual
  const groupMap = new Map()
  const singles = []
  debts.forEach(d => {
    if (d.group_name) {
      if (!groupMap.has(d.group_name)) groupMap.set(d.group_name, [])
      groupMap.get(d.group_name).push(d)
    } else {
      singles.push({ isGroup: false, key: d.id, name: d.name, total_payoff: Number(d.total_payoff), minimum_payment: Number(d.minimum_payment), owner: d.owner || '', goalMonths: d.goal_months ?? null, debt: d })
    }
  })
  const groups = Array.from(groupMap.entries()).map(([name, members]) => {
    const ownerSet = new Set(members.map(m => m.owner || ''))
    const goalSet = new Set(members.map(m => m.goal_months ?? null))
    return {
      isGroup: true,
      key: `group:${name}`,
      name,
      total_payoff: members.reduce((s, m) => s + Number(m.total_payoff), 0),
      minimum_payment: members.reduce((s, m) => s + Number(m.minimum_payment), 0),
      members: [...members].sort((a, b) => Number(a.total_payoff) - Number(b.total_payoff)),
      owner: ownerSet.size === 1 ? [...ownerSet][0] : 'Mixed',
      goalMonths: goalSet.size === 1 ? [...goalSet][0] : null,
    }
  })

  // Smallest balance first, per the snowball method
  const sorted = [...groups, ...singles].sort((a, b) => a.total_payoff - b.total_payoff)

  let running = 0
  const withPayment = sorted.map(row => {
    running += row.minimum_payment
    return { ...row, newPayment: running }
  })

  const { monthsPaidOff, totalMonths } = simulateSnowball(sorted)
  const rows = withPayment.map((row, i) => ({ ...row, monthsToPayoff: monthsPaidOff[i] }))
  const overallMonths = rows.length > 0 ? monthsPaidOff[monthsPaidOff.length - 1] : null

  const totalPayoff = debts.reduce((s, d) => s + Number(d.total_payoff), 0)
  const totalMinimum = debts.reduce((s, d) => s + Number(d.minimum_payment), 0)

  return (
    <div className="budget-wrap">
      <div className="budget-header">
        <h2 className="budget-title">Debt Snowball</h2>
      </div>

      <div className="budget-summary-bar">
        <div className="budget-summary-item">
          <span className="budget-summary-lbl">Total Debt</span>
          <span className="budget-summary-val">{fmt(totalPayoff)}</span>
        </div>
        <div className="budget-summary-item">
          <span className="budget-summary-lbl">Total Minimums</span>
          <span className="budget-summary-val">{fmt(totalMinimum)}</span>
        </div>
        <div className="budget-summary-item">
          <span className="budget-summary-lbl">Debt-Free By</span>
          <span className="budget-summary-val">{rows.length > 0 ? payoffLabel(overallMonths) : '—'}</span>
        </div>
      </div>

      <div className="fin-toolbar">
        <span className="fin-toolbar-label">
          Smallest balance first — snowball order
          {rows.length > 0 && (
            <span className="debt-payoff-caveat">
              {' '}· {overallMonths != null ? `~${overallMonths} mo to debt-free` : '100+ years to debt-free'} at current minimums (excludes interest)
            </span>
          )}
        </span>
        <button className="fin-add-btn" onClick={() => setShowForm(s => !s)}>+ Add Debt</button>
      </div>

      {showForm && (
        <form className="fin-form" onSubmit={handleAdd}>
          <input className="fin-input" placeholder="Debt name (e.g. Visa, Loan 6306) *" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required autoFocus />
          <div className="fin-form-row">
            <input className="fin-input amount" type="number" placeholder="Total payoff" step="0.01" min="0"
              value={form.total_payoff} onChange={e => setForm(f => ({ ...f, total_payoff: e.target.value }))} />
            <input className="fin-input amount" type="number" placeholder="Minimum payment" step="0.01" min="0"
              value={form.minimum_payment} onChange={e => setForm(f => ({ ...f, minimum_payment: e.target.value }))} />
          </div>
          <div className="fin-form-row">
            <input className="fin-input" placeholder="Group (optional, e.g. Nelnet – Student Loans)" value={form.group_name}
              onChange={e => setForm(f => ({ ...f, group_name: e.target.value }))} />
            <input className="fin-input" placeholder="Owner (optional, e.g. Jennifer)" value={form.owner}
              onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} />
          </div>
          <input className="fin-input" type="number" min="0" step="1" placeholder="Payoff goal in months (optional, e.g. 60 for 5 years)" value={form.goal_months}
            onChange={e => setForm(f => ({ ...f, goal_months: e.target.value }))} />
          <div className="fin-form-actions">
            <button type="button" className="fin-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="fin-save">Save</button>
          </div>
        </form>
      )}

      <div className="budget-table-wrap">
        {!loading && rows.length === 0 && <p className="fin-empty">No debts added yet.</p>}
        {rows.length > 0 && (
          <table className="budget-table">
            <thead>
              <tr>
                <th className="budget-th cat">Debt</th>
                <th className="budget-th">Total Payoff</th>
                <th className="budget-th">Minimum</th>
                <th className="budget-th">Snowball Payment</th>
                <th className="budget-th">Payoff</th>
                <th className="budget-th">Goal</th>
                <th className="budget-th">Owner</th>
                <th className="budget-th del-col"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <Fragment key={row.key}>
                  <tr className="budget-row">
                    <td className="budget-td cat">
                      {row.isGroup ? (
                        <button
                          type="button"
                          className="debt-group-toggle"
                          onClick={() => toggleExpand(row.name)}
                        >
                          <span className="debt-group-chevron">{expanded[row.name] ? '▾' : '▸'}</span>
                          {row.name}
                          <span className="debt-group-count">({row.members.length} loans — show breakdown)</span>
                        </button>
                      ) : row.name}
                    </td>
                    <td className="budget-td num">
                      {row.isGroup ? fmt(row.total_payoff) : (
                        editCell?.id === row.debt.id && editCell.field === 'total_payoff' ? (
                          <input className="budget-input" type="number" autoFocus value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => saveField(row.debt, 'total_payoff', editVal)}
                            onKeyDown={e => e.key === 'Enter' && saveField(row.debt, 'total_payoff', editVal)}
                            min="0" step="0.01" />
                        ) : (
                          <span className="budget-cell-val" onClick={() => { setEditCell({ id: row.debt.id, field: 'total_payoff' }); setEditVal(String(row.debt.total_payoff)) }}>
                            {fmt(row.total_payoff)}
                          </span>
                        )
                      )}
                    </td>
                    <td className="budget-td num">
                      {row.isGroup ? fmt(row.minimum_payment) : (
                        editCell?.id === row.debt.id && editCell.field === 'minimum_payment' ? (
                          <input className="budget-input" type="number" autoFocus value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => saveField(row.debt, 'minimum_payment', editVal)}
                            onKeyDown={e => e.key === 'Enter' && saveField(row.debt, 'minimum_payment', editVal)}
                            min="0" step="0.01" />
                        ) : (
                          <span className="budget-cell-val" onClick={() => { setEditCell({ id: row.debt.id, field: 'minimum_payment' }); setEditVal(String(row.debt.minimum_payment)) }}>
                            {fmt(row.minimum_payment)}
                          </span>
                        )
                      )}
                    </td>
                    <td className="budget-td num" style={{ fontWeight: 700, color: '#1e3070' }}>{fmt(row.newPayment)}</td>
                    <td className="budget-td num" style={row.goalMonths != null ? { fontWeight: 700, color: row.monthsToPayoff != null && row.monthsToPayoff <= row.goalMonths ? '#1a6b2a' : '#cc0000' } : undefined}>
                      {payoffLabel(row.monthsToPayoff)}
                      {row.goalMonths != null && (
                        <span className="debt-goal-badge">{row.monthsToPayoff != null && row.monthsToPayoff <= row.goalMonths ? '✓ on track' : '⚠ behind'}</span>
                      )}
                    </td>
                    <td className="budget-td num">
                      {editCell?.id === row.key && editCell.field === 'goal_months' ? (
                        <input className="budget-input" type="number" autoFocus value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={() => saveGoal(row.isGroup ? row.members.map(m => m.id) : [row.debt.id], editVal)}
                          onKeyDown={e => e.key === 'Enter' && saveGoal(row.isGroup ? row.members.map(m => m.id) : [row.debt.id], editVal)}
                          min="0" step="1" placeholder="months" />
                      ) : (
                        <span className="budget-cell-val" onClick={() => { setEditCell({ id: row.key, field: 'goal_months' }); setEditVal(row.goalMonths != null ? String(row.goalMonths) : '') }}>
                          {row.goalMonths != null ? `${row.goalMonths}mo (${payoffLabel(row.goalMonths)})` : <span className="budget-empty">—</span>}
                        </span>
                      )}
                    </td>
                    <td className="budget-td cat">
                      {editCell?.id === row.key && editCell.field === 'owner' ? (
                        <input className="budget-input text" type="text" autoFocus value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={() => saveOwner(row.isGroup ? row.members.map(m => m.id) : [row.debt.id], editVal)}
                          onKeyDown={e => e.key === 'Enter' && saveOwner(row.isGroup ? row.members.map(m => m.id) : [row.debt.id], editVal)} />
                      ) : (
                        <span className="budget-cell-val" onClick={() => { setEditCell({ id: row.key, field: 'owner' }); setEditVal(row.owner === 'Mixed' ? '' : row.owner) }}>
                          {row.owner || <span className="budget-empty">—</span>}
                        </span>
                      )}
                    </td>
                    <td className="budget-td del-col">
                      {!row.isGroup && <button className="budget-del" onClick={() => deleteDebt(row.debt.id)}>×</button>}
                    </td>
                  </tr>

                  {row.isGroup && expanded[row.name] && row.members.map(m => (
                    <tr key={m.id} className="budget-row debt-group-member-row">
                      <td className="budget-td cat debt-group-member-name">{m.name}</td>
                      <td className="budget-td num">
                        {editCell?.id === m.id && editCell.field === 'total_payoff' ? (
                          <input className="budget-input" type="number" autoFocus value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => saveField(m, 'total_payoff', editVal)}
                            onKeyDown={e => e.key === 'Enter' && saveField(m, 'total_payoff', editVal)}
                            min="0" step="0.01" />
                        ) : (
                          <span className="budget-cell-val" onClick={() => { setEditCell({ id: m.id, field: 'total_payoff' }); setEditVal(String(m.total_payoff)) }}>
                            {fmt(m.total_payoff)}
                          </span>
                        )}
                      </td>
                      <td className="budget-td num">
                        {editCell?.id === m.id && editCell.field === 'minimum_payment' ? (
                          <input className="budget-input" type="number" autoFocus value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => saveField(m, 'minimum_payment', editVal)}
                            onKeyDown={e => e.key === 'Enter' && saveField(m, 'minimum_payment', editVal)}
                            min="0" step="0.01" />
                        ) : (
                          <span className="budget-cell-val" onClick={() => { setEditCell({ id: m.id, field: 'minimum_payment' }); setEditVal(String(m.minimum_payment)) }}>
                            {fmt(m.minimum_payment)}
                          </span>
                        )}
                      </td>
                      <td className="budget-td num"></td>
                      <td className="budget-td num"></td>
                      <td className="budget-td num"></td>
                      <td className="budget-td cat">
                        {editCell?.id === m.id && editCell.field === 'owner' ? (
                          <input className="budget-input text" type="text" autoFocus value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => saveOwner([m.id], editVal)}
                            onKeyDown={e => e.key === 'Enter' && saveOwner([m.id], editVal)} />
                        ) : (
                          <span className="budget-cell-val" onClick={() => { setEditCell({ id: m.id, field: 'owner' }); setEditVal(m.owner || '') }}>
                            {m.owner || <span className="budget-empty">—</span>}
                          </span>
                        )}
                      </td>
                      <td className="budget-td del-col">
                        <button className="budget-del" onClick={() => deleteDebt(m.id)}>×</button>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
              <tr className="budget-net-row">
                <td className="budget-td cat">TOTAL</td>
                <td className="budget-td num net-val">{fmt(totalPayoff)}</td>
                <td className="budget-td num net-val">{fmt(totalMinimum)}</td>
                <td colSpan={5}></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Net Worth ──────────────────────────────────────────────────────────────

function NetWorthTab({ userId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ item: '', value: '', debt: '', link_url: '' })
  const [editCell, setEditCell] = useState(null)
  const [editVal, setEditVal] = useState('')

  useEffect(() => {
    if (!userId) return
    supabase.from('net_worth_items').select('*').eq('user_id', userId).order('sort_order')
      .then(({ data }) => { if (data) setItems(data); setLoading(false) })
  }, [userId])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.item.trim()) return
    const payload = {
      user_id: userId,
      item: form.item.trim(),
      value: parseFloat(form.value) || 0,
      debt: parseFloat(form.debt) || 0,
      link_url: form.link_url.trim() || null,
      sort_order: items.length,
    }
    const { data } = await supabase.from('net_worth_items').insert(payload).select().single()
    if (data) setItems(i => [...i, data])
    setForm({ item: '', value: '', debt: '', link_url: '' })
    setShowForm(false)
  }

  async function saveField(row, field, value) {
    const val = parseFloat(value) || 0
    await supabase.from('net_worth_items').update({ [field]: val }).eq('id', row.id)
    setItems(i => i.map(x => x.id === row.id ? { ...x, [field]: val } : x))
    setEditCell(null)
  }

  async function saveLink(row, value) {
    const val = value.trim() || null
    await supabase.from('net_worth_items').update({ link_url: val }).eq('id', row.id)
    setItems(i => i.map(x => x.id === row.id ? { ...x, link_url: val } : x))
    setEditCell(null)
  }

  async function deleteItem(id) {
    await supabase.from('net_worth_items').delete().eq('id', id)
    setItems(i => i.filter(x => x.id !== id))
  }

  const totalValue = items.reduce((s, r) => s + Number(r.value), 0)
  const totalDebt = items.reduce((s, r) => s + Number(r.debt), 0)
  const netWorth = totalValue - totalDebt

  return (
    <div className="budget-wrap">
      <div className="budget-header">
        <h2 className="budget-title">Net Worth</h2>
      </div>

      <div className="budget-summary-bar">
        <div className="budget-summary-item">
          <span className="budget-summary-lbl">Assets</span>
          <span className="budget-summary-val">{fmt(totalValue)}</span>
        </div>
        <div className="budget-summary-item">
          <span className="budget-summary-lbl">Debt</span>
          <span className="budget-summary-val">{fmt(totalDebt)}</span>
        </div>
        <div className="budget-summary-item" style={{ background: netWorth >= 0 ? '#1a6b2a22' : '#e05c5c22' }}>
          <span className="budget-summary-lbl">Net Worth</span>
          <span className="budget-summary-val" style={{ color: netWorth >= 0 ? '#1a6b2a' : '#e05c5c' }}>{fmt(netWorth)}</span>
        </div>
      </div>

      <div className="fin-toolbar">
        <span className="fin-toolbar-label">Assets and what's owed against them</span>
        <button className="fin-add-btn" onClick={() => setShowForm(s => !s)}>+ Add Item</button>
      </div>

      {showForm && (
        <form className="fin-form" onSubmit={handleAdd}>
          <input className="fin-input" placeholder="Item (e.g. Real Estate, Car, Checking Account) *" value={form.item}
            onChange={e => setForm(f => ({ ...f, item: e.target.value }))} required autoFocus />
          <div className="fin-form-row">
            <input className="fin-input amount" type="number" placeholder="Value" step="0.01" min="0"
              value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
            <input className="fin-input amount" type="number" placeholder="Debt owed" step="0.01" min="0"
              value={form.debt} onChange={e => setForm(f => ({ ...f, debt: e.target.value }))} />
          </div>
          <input className="fin-input" type="url" placeholder="Link (optional)" value={form.link_url}
            onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} />
          <div className="fin-form-actions">
            <button type="button" className="fin-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="fin-save">Save</button>
          </div>
        </form>
      )}

      <div className="budget-table-wrap">
        {!loading && items.length === 0 && <p className="fin-empty">No items added yet.</p>}
        {items.length > 0 && (
          <table className="budget-table">
            <thead>
              <tr>
                <th className="budget-th cat">Item</th>
                <th className="budget-th">Value</th>
                <th className="budget-th">Debt</th>
                <th className="budget-th">Equity</th>
                <th className="budget-th del-col"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(row => {
                const equity = Number(row.value) - Number(row.debt)
                return (
                  <tr key={row.id} className="budget-row">
                    <td className="budget-td cat">
                      <span className="nw-item-name">
                        {row.link_url ? (
                          <a href={row.link_url} target="_blank" rel="noopener noreferrer" className="nw-item-link" title={row.link_url}>
                            {row.item}
                          </a>
                        ) : row.item}
                      </span>
                      {editCell?.id === row.id && editCell.field === 'link_url' ? (
                        <input
                          className="nw-link-input"
                          type="url"
                          autoFocus
                          placeholder="https://…"
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={() => saveLink(row, editVal)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveLink(row, editVal)
                            if (e.key === 'Escape') setEditCell(null)
                          }}
                        />
                      ) : (
                        <button
                          className="nw-link-btn"
                          title={row.link_url ? 'Edit link' : 'Add link'}
                          onClick={() => { setEditCell({ id: row.id, field: 'link_url' }); setEditVal(row.link_url || '') }}
                        >
                          {row.link_url ? '🔗' : '+ link'}
                        </button>
                      )}
                    </td>
                    <td className="budget-td num">
                      {editCell?.id === row.id && editCell.field === 'value' ? (
                        <input className="budget-input" type="number" autoFocus value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={() => saveField(row, 'value', editVal)}
                          onKeyDown={e => e.key === 'Enter' && saveField(row, 'value', editVal)}
                          min="0" step="0.01" />
                      ) : (
                        <span className="budget-cell-val" onClick={() => { setEditCell({ id: row.id, field: 'value' }); setEditVal(String(row.value)) }}>
                          {fmt(row.value)}
                        </span>
                      )}
                    </td>
                    <td className="budget-td num">
                      {editCell?.id === row.id && editCell.field === 'debt' ? (
                        <input className="budget-input" type="number" autoFocus value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={() => saveField(row, 'debt', editVal)}
                          onKeyDown={e => e.key === 'Enter' && saveField(row, 'debt', editVal)}
                          min="0" step="0.01" />
                      ) : (
                        <span className="budget-cell-val" onClick={() => { setEditCell({ id: row.id, field: 'debt' }); setEditVal(String(row.debt)) }}>
                          {fmt(row.debt)}
                        </span>
                      )}
                    </td>
                    <td className="budget-td num" style={{ fontWeight: 700, color: equity >= 0 ? '#1a6b2a' : '#e05c5c' }}>{fmt(equity)}</td>
                    <td className="budget-td del-col">
                      <button className="budget-del" onClick={() => deleteItem(row.id)}>×</button>
                    </td>
                  </tr>
                )
              })}
              <tr className="budget-net-row">
                <td className="budget-td cat">TOTAL</td>
                <td className="budget-td num net-val">{fmt(totalValue)}</td>
                <td className="budget-td num net-val">{fmt(totalDebt)}</td>
                <td className="budget-td num net-val">{fmt(netWorth)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Sinking Funds ──────────────────────────────────────────────────────────

const SUGGESTED_FUNDS = [
  'Emergency Fund', 'Retirement Fund', 'College Fund', 'Car Replacement',
  'Home Repairs', 'Homeowner\'s Insurance', 'Health Insurance', 'Vacation', 'Gifts',
]

function SinkingFundsTab({ userId }) {
  const [funds, setFunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [editing, setEditing] = useState(null)
  const [editVal, setEditVal] = useState('')

  useEffect(() => {
    if (!userId) return
    supabase.from('sinking_funds').select('*').eq('user_id', userId).order('sort_order')
      .then(({ data }) => { if (data) setFunds(data); setLoading(false) })
  }, [userId])

  async function addFund(name) {
    if (!name.trim() || funds.some(f => f.name.toLowerCase() === name.trim().toLowerCase())) return
    const payload = { user_id: userId, name: name.trim(), balance: 0, sort_order: funds.length }
    const { data } = await supabase.from('sinking_funds').insert(payload).select().single()
    if (data) setFunds(f => [...f, data])
    setNewName('')
    setShowForm(false)
  }

  async function saveBalance(fund, value) {
    const val = parseFloat(value) || 0
    await supabase.from('sinking_funds').update({ balance: val, updated_at: new Date().toISOString() }).eq('id', fund.id)
    setFunds(f => f.map(x => x.id === fund.id ? { ...x, balance: val } : x))
    setEditing(null)
  }

  async function deleteFund(id) {
    await supabase.from('sinking_funds').delete().eq('id', id)
    setFunds(f => f.filter(x => x.id !== id))
  }

  const total = funds.reduce((s, f) => s + Number(f.balance), 0)
  const available = SUGGESTED_FUNDS.filter(n => !funds.some(f => f.name.toLowerCase() === n.toLowerCase()))

  return (
    <div className="fin-content">
      <div className="budget-header">
        <h2 className="budget-title">Sinking Funds</h2>
      </div>
      <div className="fin-toolbar">
        <span className="coins-total-badge">{fmt(total)}</span>
        <button className="fin-add-btn" onClick={() => setShowForm(s => !s)}>+ Add Fund</button>
      </div>

      {showForm && (
        <form className="fin-form" onSubmit={e => { e.preventDefault(); addFund(newName) }}>
          <input className="fin-input" placeholder="Fund name" value={newName}
            onChange={e => setNewName(e.target.value)} autoFocus />
          {available.length > 0 && (
            <div className="fin-form-row" style={{ flexWrap: 'wrap', gap: 6 }}>
              {available.map(n => (
                <button key={n} type="button" className="fin-edit-btn" onClick={() => addFund(n)}>{n}</button>
              ))}
            </div>
          )}
          <div className="fin-form-actions">
            <button type="button" className="fin-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="fin-save">Save</button>
          </div>
        </form>
      )}

      {!loading && funds.length === 0 && <p className="fin-empty">No sinking funds yet.</p>}

      <div className="fin-goals-grid">
        {funds.map((fund, idx) => {
          const color = PALETTE[idx % PALETTE.length]
          const isEditing = editing === fund.id
          return (
            <div key={fund.id} className="goal-card" style={{ '--card-color': color }}>
              <div className="goal-card-top" style={{ background: color }} />
              <button className="fin-bill-card-delete" onClick={() => deleteFund(fund.id)}>✕</button>
              <div className="goal-card-name">{fund.name}</div>
              <div className="goal-card-body">
                {isEditing ? (
                  <input
                    className="goal-card-input"
                    type="number" step="0.01" min="0"
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    onBlur={() => saveBalance(fund, editVal)}
                    onKeyDown={e => { if (e.key === 'Enter') saveBalance(fund, editVal); if (e.key === 'Escape') setEditing(null) }}
                    autoFocus
                  />
                ) : (
                  <span className="goal-card-saved" style={{ cursor: 'pointer' }}
                    onClick={() => { setEditing(fund.id); setEditVal(String(fund.balance)) }}>
                    {fmt(fund.balance)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
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

// Dryer pricing: $1.75 (7 quarters) buys a 45-minute base cycle. Each additional
// quarter beyond the base buys 6 more minutes.
const DRYER_BASE_QUARTERS = 7
const DRYER_BASE_MINUTES = 45
const DRYER_MINUTES_PER_QUARTER = 6

function dryerQuartersForMinutes(minutes) {
  const extraMinutes = Math.max(0, (parseInt(minutes) || 0) - DRYER_BASE_MINUTES)
  return DRYER_BASE_QUARTERS + Math.ceil(extraMinutes / DRYER_MINUTES_PER_QUARTER)
}

function perLoadQuartersFor(machine, minutes) {
  return machine.key === 'dryer' ? dryerQuartersForMinutes(minutes) : quartersFor(machine.costPerLoad)
}

function sumSessions(list) {
  return list.reduce((acc, s) => ({
    loads: acc.loads + s.loads,
    quarters: acc.quarters + s.quarters,
    minutes: acc.minutes + s.minutes,
  }), { loads: 0, quarters: 0, minutes: 0 })
}

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
    setForm(f => {
      const minutes = m.defaultMinutes || f.minutes
      return {
        ...f,
        machine_type: machineKey,
        type: m.type,
        minutes,
        quarters: perLoadQuartersFor(m, minutes) * f.loads,
      }
    })
  }

  function onLoadsChange(loads) {
    const n = parseInt(loads) || 1
    const m = MACHINE_TYPES.find(x => x.key === form.machine_type)
    setForm(f => ({ ...f, loads: n, quarters: perLoadQuartersFor(m, f.minutes) * n }))
  }

  function onMinutesChange(minutes) {
    const m = MACHINE_TYPES.find(x => x.key === form.machine_type)
    if (m.key !== 'dryer') {
      setForm(f => ({ ...f, minutes }))
      return
    }
    setForm(f => ({ ...f, minutes, quarters: dryerQuartersForMinutes(minutes) * f.loads }))
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

  const washTotals = sumSessions(sessions.filter(s => s.type === 'wash'))
  const dryTotals = sumSessions(sessions.filter(s => s.type === 'dry'))

  return (
    <div className="fin-content laundry-content">
      <div className="budget-header">
        <h2 className="budget-title">Laundry Tracker</h2>
      </div>
      <div className="fin-toolbar">
        <span className="fin-toolbar-label">Log a wash or dry cycle</span>
        <button className="fin-add-btn" onClick={() => setShowForm(s => !s)}>+ Log Load</button>
      </div>

      <div className="laundry-note">
        Top Load: $1.75 (7 quarters) · Front Load: $2.00 (8 quarters) · Dryer: $1.75 for 45 min base (7 quarters), +1 quarter = +6 min
      </div>

      <div className="budget-summary-bar">
        <div className="budget-summary-item">
          <span className="budget-summary-lbl" style={{ color: '#1e3070' }}>Wash Total</span>
          <span className="budget-summary-val" style={{ color: '#1e3070' }}>{fmt(washTotals.quarters * 0.25)}</span>
          <span className="laundry-summary-sub">{washTotals.loads} {washTotals.loads === 1 ? 'load' : 'loads'} · {washTotals.quarters}q</span>
        </div>
        <div className="budget-summary-item">
          <span className="budget-summary-lbl" style={{ color: '#c77b3a' }}>Dryer Total</span>
          <span className="budget-summary-val" style={{ color: '#c77b3a' }}>{fmt(dryTotals.quarters * 0.25)}</span>
          <span className="laundry-summary-sub">{dryTotals.loads} {dryTotals.loads === 1 ? 'load' : 'loads'} · {dryTotals.quarters}q · {dryTotals.minutes} min</span>
        </div>
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
            {form.machine_type === 'dryer' && (
              <label className="laundry-lbl">
                <span>Minutes</span>
                <input className="fin-input" type="number" min="0" value={form.minutes} onChange={e => onMinutesChange(e.target.value)} />
              </label>
            )}
            <div className="laundry-computed">
              <span>Cost</span>
              <div className="laundry-computed-val">{fmt(form.quarters * 0.25)}</div>
              <div className="laundry-computed-sub">{form.quarters} {form.quarters === 1 ? 'quarter' : 'quarters'}</div>
            </div>
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
          const dayWashTotals = sumSessions(washSessions)
          const dayDryTotals = sumSessions(drySessions)

          return (
            <div key={date} className="laundry-day">
              <div className="laundry-day-header">
                <span className="laundry-day-date">{fmtDate(date)}</span>
                <span className="laundry-day-total">{totalQuarters} quarters · {fmt(totalCost)}</span>
              </div>

              {washSessions.length > 0 && (
                <div className="laundry-section">
                  <div className="laundry-section-title-row">
                    <div className="laundry-section-title laundry-section-title--wash">Washing</div>
                    <div className="laundry-section-total">{dayWashTotals.loads} {dayWashTotals.loads === 1 ? 'load' : 'loads'} · {dayWashTotals.quarters}q · {fmt(dayWashTotals.quarters * 0.25)}</div>
                  </div>
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
                  <div className="laundry-section-title-row">
                    <div className="laundry-section-title laundry-section-title--dry">Drying</div>
                    <div className="laundry-section-total">{dayDryTotals.loads} {dayDryTotals.loads === 1 ? 'load' : 'loads'} · {dayDryTotals.quarters}q · {fmt(dayDryTotals.quarters * 0.25)} · {dayDryTotals.minutes} min</div>
                  </div>
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

function FinNoteGroup({ note: n, onDelete }) {
  const [collapsed, setCollapsed] = useState(true)
  const snippet = n.note.length > 60 ? n.note.slice(0, 60).trim() + '…' : n.note
  return (
    <div className={`interaction-group${collapsed ? '' : ' expanded'}`}>
      <div className="interaction-group-header" style={{ cursor: 'pointer' }} onClick={() => setCollapsed(c => !c)}>
        <span className="interaction-group-name">{snippet}</span>
        {n.created_at && (
          <span className="interaction-date-badge">
            {new Date(n.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
        <span className="interaction-group-toggle">{collapsed ? '▾' : '▴'}</span>
      </div>
      {!collapsed && (
        <div className="interaction-group-items">
          <div className="interaction-card">
            <div className="interaction-header">
              {n.topic && <span className="interaction-cat-badge">{n.topic}</span>}
              <button className="interaction-delete-btn" title="Delete" onClick={() => onDelete?.(n.id)}>✕</button>
            </div>
            {n.source && <p className="interaction-who-text">Source: {n.source}</p>}
            <p className="interaction-disc-text">{n.note}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function NotesTab({ userId }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [noteTopic, setNoteTopic] = useState('')
  const [noteSource, setNoteSource] = useState('')
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    if (!userId) return
    supabase.from('financial_notes').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setNotes(data); setLoading(false) })
  }, [userId])

  async function handleAdd(e) {
    e.preventDefault()
    if (!noteText.trim()) return
    const payload = { user_id: userId, note: noteText.trim(), topic: noteTopic.trim() || null, source: noteSource.trim() || null }
    const { data } = await supabase.from('financial_notes').insert(payload).select().single()
    if (data) setNotes(n => [data, ...n])
    setNoteTopic('')
    setNoteSource('')
    setNoteText('')
    setShowAdd(false)
  }

  async function deleteNote(id) {
    await supabase.from('financial_notes').delete().eq('id', id)
    setNotes(n => n.filter(x => x.id !== id))
  }

  return (
    <div className="fin-content">
      <div className="budget-header">
        <h2 className="budget-title">Financial Notes</h2>
      </div>
      <div className="csea-panel">
        <div className="csea-toolbar">
          <span className="fin-toolbar-label">Dated notes, reminders, account details</span>
          <button className="csea-add-btn" onClick={() => setShowAdd(true)}>+ Add Note</button>
        </div>

        {showAdd && (
          <form className="csea-form" onSubmit={handleAdd}>
            <div className="csea-notes-form-row">
              <input
                className="csea-input"
                placeholder="Topic (optional)"
                value={noteTopic}
                onChange={e => setNoteTopic(e.target.value)}
                autoFocus
              />
              <input
                className="csea-input"
                placeholder="Source (optional)"
                value={noteSource}
                onChange={e => setNoteSource(e.target.value)}
              />
            </div>
            <textarea
              className="csea-textarea"
              placeholder="Details *"
              rows={2}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            />
            <div className="csea-form-actions" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="csea-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="csea-save">Add</button>
            </div>
          </form>
        )}

        <div className="csea-issue-list csea-interactions-grid">
          {!loading && notes.length === 0 && <p className="csea-empty">No notes yet</p>}
          {notes.map(n => (
            <FinNoteGroup key={n.id} note={n} onDelete={deleteNote} />
          ))}
        </div>
      </div>
    </div>
  )
}
