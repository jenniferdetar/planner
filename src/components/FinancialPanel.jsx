import { useState, useEffect, useMemo, Fragment } from 'react'
import { supabase } from '../lib/supabase'
import { useCheckBreakdownSync } from '../hooks/useCheckBreakdownSync'
import './FinancialPanel.css'
import './CseaTracker.css'

const TAB_LABELS = {
  coins: 'Cash on Hand',
  debt: 'Debt Snowball',
}

function fmt(n) {
  return Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

export function useFinancialPage({
  transactions, onAddTransaction, onDeleteTransaction,
  bills, onAddBill, onToggleBillPaid, onDeleteBill,
  paychecks = [], onAddPaycheck, onUpdatePaycheckAmount, onTogglePaycheckBill, onDeletePaycheck,
  userId, providerToken,
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
    paychecks, onAddPaycheck, onUpdatePaycheckAmount, onTogglePaycheckBill, onDeletePaycheck,
    userId, providerToken, tab, setTab, totalIncome, totalExpenses, unpaidBills,
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
        {['bills', 'coins', 'budget', 'debt', 'laundry', 'notes'].map(t => (
          <button key={t} className={`fin-tab ${api.tab === t ? 'active' : ''}`} onClick={() => api.setTab(t)}>
            {TAB_LABELS[t] || t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {api.tab === 'bills' && <BillsTab bills={api.bills} onAdd={api.onAddBill} onToggle={api.onToggleBillPaid} onDelete={api.onDeleteBill} />}
      {api.tab === 'coins' && <CoinsTab userId={api.userId} />}
      {api.tab === 'budget' && <PayPeriodBudgetTab userId={api.userId} providerToken={api.providerToken} bills={api.bills} onToggleBillPaid={api.onToggleBillPaid} />}
      {api.tab === 'debt' && <DebtSnowballTab userId={api.userId} />}
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
        <div className="budget-header-titles">
          <h2 className="budget-title">Bills</h2>
          <span className="fin-toolbar-label">{unpaid.length} bills remaining</span>
        </div>
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

// ─── Pay Period Budget ───────────────────────────────────────────────────────
// Ported from the "Budget by Paycheck" app: every paycheck gets its own budget
// with Income, Bills, Expenses, Savings, and Debt, each tracked as Budget vs.
// Actual. Reference presets auto-fill a line item's budget by name; the
// Transaction Tracker is the only place actuals get recorded.

const PP_SECTION_DEFS = [
  { key: 'income', label: 'Income', showDueDate: true, dueDateLabel: 'Date' },
  { key: 'bill', label: 'Bills', showDueDate: true, dueDateLabel: 'Due date', showPaid: true },
  { key: 'expense', label: 'Expenses' },
  { key: 'savings', label: 'Savings', showSinkingFund: true },
  { key: 'debt', label: 'Debt' },
]

const PP_REF_SECTIONS = ['income', 'bill', 'expense', 'savings', 'debt']

// A starter set of categories drawn from the original Budget by Paycheck
// Excel template's References sheet, to save re-typing common line items.
const PP_STARTER_PRESETS = [
  { section: 'bill', name: 'ADT', defaultAmount: 50 },
  { section: 'bill', name: 'Apple Music', defaultAmount: 13 },
  { section: 'bill', name: 'Auto Insurance', defaultAmount: 417 },
  { section: 'bill', name: 'Cleaning Lady', defaultAmount: 200 },
  { section: 'bill', name: 'Department of Water & Power', defaultAmount: 50 },
  { section: 'bill', name: 'Home Owners Association', defaultAmount: 380 },
  { section: 'bill', name: 'Laundry', defaultAmount: 80 },
  { section: 'bill', name: 'Mortgage/Rent', defaultAmount: null },
  { section: 'bill', name: 'Registration', defaultAmount: 500 },
  { section: 'bill', name: 'Spectrum', defaultAmount: 120 },
  { section: 'bill', name: 'Verizon', defaultAmount: null },
  { section: 'expense', name: 'Auto Maintenance', defaultAmount: null },
  { section: 'expense', name: 'Clothing', defaultAmount: null },
  { section: 'expense', name: 'Gas', defaultAmount: 300 },
  { section: 'expense', name: 'Groceries', defaultAmount: 300 },
  { section: 'expense', name: 'Hair', defaultAmount: null },
  { section: 'expense', name: 'Manicure/Pedicure', defaultAmount: null },
  { section: 'expense', name: 'Tithe', defaultAmount: null },
  { section: 'expense', name: 'Travel', defaultAmount: null },
  { section: 'savings', name: 'Health Savings Account', defaultAmount: null },
  { section: 'savings', name: 'Savings - House', defaultAmount: null },
  { section: 'savings', name: 'Savings - Other', defaultAmount: null },
  { section: 'savings', name: 'Vacation', defaultAmount: null },
  { section: 'debt', name: 'Auto Payment', defaultAmount: 463 },
  { section: 'debt', name: 'Home Equity Line of Credit', defaultAmount: null },
  { section: 'debt', name: 'Credit Card 1', defaultAmount: null },
  { section: 'debt', name: 'Credit Card 2', defaultAmount: null },
]

function ppFmt(n) {
  const v = Number(n) || 0
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function ppFmtDate(value) {
  if (!value) return ''
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ppTodayISO() {
  return new Date().toISOString().slice(0, 10)
}

// Conservative budgeting convention: round money going out up (never
// under-budget an expense), and money coming in down (never over-count income).
function ppRoundForSection(value, section) {
  const n = Number(value)
  if (value === '' || value == null || Number.isNaN(n)) return 0
  return section === 'income' ? Math.floor(n) : Math.ceil(n)
}

function PayPeriodLineSection({ def, items, referenceOptions, computeBudget, computeActual, onAdd, onUpdate, onDelete }) {
  const [name, setName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [adding, setAdding] = useState(false)

  const manualBudget = def.budgetSource === 'manual'
  const budgetTotal = items.reduce((acc, item) => acc + computeBudget(item), 0)
  const actualTotal = items.reduce((acc, item) => acc + computeActual(item), 0)
  const extraCols = (def.showDueDate ? 1 : 0) + (def.showSinkingFund ? 1 : 0) + (def.showPaid ? 1 : 0)

  function handlePickReference(value) {
    setName(value)
    if (manualBudget) return
    const match = referenceOptions.find(r => r.name === value)
    if (match && match.default_amount != null) setBudgetAmount(String(match.default_amount))
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    setAdding(true)
    try {
      await onAdd({
        name: name.trim(),
        due_date: def.showDueDate && dueDate ? dueDate : null,
        budget_amount: budgetAmount ? ppRoundForSection(budgetAmount, def.key) : 0,
      })
      setName('')
      setDueDate('')
      setBudgetAmount('')
    } finally {
      setAdding(false)
    }
  }

  const datalistId = `pp-refs-${def.key}`

  return (
    <div className="pp-card pp-section">
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">{def.label}</h2>
        </div>
      </div>
      <div className="pp-table-wrap">
        <table className="budget-table">
          <thead>
            <tr>
              <th className="budget-th cat">Item</th>
              {def.showDueDate && <th className="budget-th">{def.dueDateLabel}</th>}
              {def.showSinkingFund && <th className="budget-th">Sinking fund</th>}
              <th className="budget-th">Budget</th>
              <th className="budget-th">Actual</th>
              {def.showPaid && <th className="budget-th">Paid</th>}
              <th className="budget-th del-col"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="budget-row">
                <td className="budget-td cat">{item.name}</td>
                {def.showDueDate && (
                  <td className="budget-td num">{ppFmtDate(item.due_date) || <span className="budget-empty">—</span>}</td>
                )}
                {def.showSinkingFund && (
                  <td className="budget-td num">
                    <input type="checkbox" checked={!!item.is_sinking_fund} onChange={e => onUpdate(item.id, { is_sinking_fund: e.target.checked })} />
                  </td>
                )}
                <td className="budget-td num">{ppFmt(computeBudget(item))}</td>
                <td className="budget-td num">{ppFmt(computeActual(item))}</td>
                {def.showPaid && (
                  <td className="budget-td num">
                    <input type="checkbox" checked={!!item.is_paid} onChange={e => onUpdate(item.id, { is_paid: e.target.checked })} />
                  </td>
                )}
                <td className="budget-td del-col">
                  <span className="budget-del" onClick={() => onDelete(item.id)}>✕</span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={3 + extraCols} className="budget-td"><span className="budget-empty">No items yet</span></td></tr>
            )}
          </tbody>
          <tfoot>
            <tr className="budget-net-row">
              <td className="budget-td cat">Total</td>
              {def.showDueDate && <td></td>}
              {def.showSinkingFund && <td></td>}
              <td className="budget-td num net-val">{ppFmt(budgetTotal)}</td>
              <td className="budget-td num net-val">{ppFmt(actualTotal)}</td>
              {def.showPaid && <td></td>}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <form className="fin-form" onSubmit={handleAdd}>
        <input
          className="fin-input"
          list={datalistId}
          placeholder={`Add ${def.label.toLowerCase()} item…`}
          value={name}
          onChange={e => handlePickReference(e.target.value)}
        />
        <datalist id={datalistId}>
          {referenceOptions.map(r => <option key={r.id} value={r.name} />)}
        </datalist>
        <div className="fin-form-row">
          {def.showDueDate && (
            <input className="fin-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          )}
          <input
            className="fin-input amount"
            type="number" step="0.01"
            placeholder={manualBudget ? 'Budget' : 'From References'}
            value={budgetAmount}
            readOnly={!manualBudget}
            title={manualBudget ? undefined : "Budget comes from the matching References preset"}
            onChange={e => manualBudget && setBudgetAmount(e.target.value)}
          />
        </div>
        <div className="fin-form-actions">
          <button type="submit" className="fin-save" disabled={adding}>{adding ? '…' : 'Add'}</button>
        </div>
      </form>
    </div>
  )
}

function PayPeriodSummaryTable({ rows, remainingBudget, remainingActual }) {
  return (
    <div className="pp-card pp-section">
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">Summary</h2>
        </div>
      </div>
      <div className="pp-table-wrap">
        <table className="budget-table">
          <thead>
            <tr>
              <th className="budget-th cat">Total</th>
              <th className="budget-th">Budget</th>
              <th className="budget-th">Actual</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.label} className="budget-row">
                <td className="budget-td cat">{row.label}</td>
                <td className="budget-td num">{ppFmt(row.budget)}</td>
                <td className="budget-td num">{ppFmt(row.actual)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="budget-net-row">
              <td className="budget-td cat">Remaining</td>
              <td className="budget-td num net-val">{ppFmt(remainingBudget)}</td>
              <td className="budget-td num net-val">{ppFmt(remainingActual)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function PayPeriodTransactionTracker({ entries, lineItems, onAdd, onDelete }) {
  const [entryDate, setEntryDate] = useState(ppTodayISO())
  const [lineItemId, setLineItemId] = useState(lineItems[0]?.id || '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [adding, setAdding] = useState(false)

  const itemsById = Object.fromEntries(lineItems.map(i => [i.id, i]))
  const total = entries.reduce((s, e) => s + (Number(e.amount) || 0), 0)

  const itemsBySection = PP_SECTION_DEFS
    .map(def => ({ def, items: lineItems.filter(i => i.section === def.key) }))
    .filter(g => g.items.length > 0)

  async function handleAdd(e) {
    e.preventDefault()
    if (!lineItemId || !amount) return
    setAdding(true)
    try {
      const section = itemsById[lineItemId]?.section
      await onAdd({ entry_date: entryDate, line_item_id: lineItemId, amount: ppRoundForSection(amount, section), description })
      setAmount('')
      setDescription('')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="pp-card pp-section">
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">Transaction Tracker</h2>
          <span className="fin-toolbar-label">Log what actually happened</span>
        </div>
      </div>

      {lineItems.length === 0 ? (
        <p className="fin-empty">Add income, bills, expenses, savings, or debt above before logging transactions.</p>
      ) : (
        <>
          <form className="fin-form" onSubmit={handleAdd}>
            <div className="fin-form-row">
              <input className="fin-input" type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} />
              <select className="fin-input" value={lineItemId} onChange={e => setLineItemId(e.target.value)}>
                {itemsBySection.map(group => (
                  <optgroup key={group.def.key} label={group.def.label}>
                    {group.items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="fin-form-row">
              <input className="fin-input amount" type="number" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required />
              <input className="fin-input" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="fin-form-actions">
              <button type="submit" className="fin-save" disabled={adding}>{adding ? '…' : 'Log'}</button>
            </div>
          </form>

          <div className="pp-table-wrap">
            <table className="budget-table">
              <thead>
                <tr>
                  <th className="budget-th">Date</th>
                  <th className="budget-th cat">Category</th>
                  <th className="budget-th cat">Description</th>
                  <th className="budget-th">Amount</th>
                  <th className="budget-th del-col"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => {
                  const item = itemsById[entry.line_item_id]
                  const sectionLabel = item && PP_SECTION_DEFS.find(d => d.key === item.section)?.label
                  return (
                    <tr key={entry.id} className="budget-row">
                      <td className="budget-td num">{ppFmtDate(entry.entry_date)}</td>
                      <td className="budget-td cat">
                        {item?.name || <span className="budget-empty">—</span>}
                        {sectionLabel && <span className="fin-toolbar-label" style={{ marginLeft: 4, color: '#aaa' }}>({sectionLabel})</span>}
                      </td>
                      <td className="budget-td cat">{entry.description || <span className="budget-empty">—</span>}</td>
                      <td className="budget-td num">{ppFmt(entry.amount)}</td>
                      <td className="budget-td del-col">
                        <span className="budget-del" onClick={() => onDelete(entry.id)}>✕</span>
                      </td>
                    </tr>
                  )
                })}
                {entries.length === 0 && (
                  <tr><td colSpan={5} className="budget-td"><span className="budget-empty">No transactions logged yet</span></td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="budget-net-row">
                  <td className="budget-td cat" colSpan={3}>Total</td>
                  <td className="budget-td num net-val">{ppFmt(total)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function PayPeriodDetail({ userId, period, onBack, onDatesChange }) {
  const [items, setItems] = useState([])
  const [entries, setEntries] = useState([])
  const [references, setReferences] = useState([])
  const [loading, setLoading] = useState(true)

  async function refreshItems() {
    const { data } = await supabase.from('pay_period_line_items').select('*').eq('pay_period_id', period.id).order('name')
    setItems(data || [])
  }

  async function refreshEntries() {
    const { data } = await supabase.from('pay_period_expense_entries').select('*').eq('pay_period_id', period.id).order('entry_date', { ascending: false })
    setEntries(data || [])
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [itemsRes, entriesRes, refsRes] = await Promise.all([
        supabase.from('pay_period_line_items').select('*').eq('pay_period_id', period.id).order('name'),
        supabase.from('pay_period_expense_entries').select('*').eq('pay_period_id', period.id).order('entry_date', { ascending: false }),
        supabase.from('budget_reference_items').select('*').eq('user_id', userId).order('section').order('name'),
      ])
      if (cancelled) return
      setItems(itemsRes.data || [])
      setEntries(entriesRes.data || [])
      setReferences(refsRes.data || [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [period.id, userId])

  const bySection = useMemo(() => {
    const groups = { income: [], bill: [], expense: [], savings: [], debt: [] }
    items.forEach(item => groups[item.section]?.push(item))
    return groups
  }, [items])

  const actualById = useMemo(() => {
    const map = {}
    entries.forEach(e => {
      if (!e.line_item_id) return
      map[e.line_item_id] = (map[e.line_item_id] || 0) + (Number(e.amount) || 0)
    })
    return map
  }, [entries])

  const referenceAmountByKey = useMemo(() => {
    const map = {}
    references.forEach(r => {
      if (r.default_amount != null) map[`${r.section}:${r.name}`] = Number(r.default_amount)
    })
    return map
  }, [references])

  function computeActual(item) { return actualById[item.id] || 0 }
  function computeBudget(item) {
    const live = referenceAmountByKey[`${item.section}:${item.name}`]
    return live != null ? live : Number(item.budget_amount) || 0
  }

  const referencesBySection = useMemo(() => {
    const groups = { income: [], bill: [], expense: [], savings: [], debt: [] }
    references.forEach(r => groups[r.section]?.push(r))
    return groups
  }, [references])

  async function handleAdd(section, fields) {
    await supabase.from('pay_period_line_items').insert({ pay_period_id: period.id, user_id: userId, section, ...fields })
    await refreshItems()
  }

  async function handleUpdate(id, fields) {
    await supabase.from('pay_period_line_items').update(fields).eq('id', id)
    await refreshItems()
  }

  async function handleDelete(id) {
    await supabase.from('pay_period_expense_entries').delete().eq('line_item_id', id)
    await supabase.from('pay_period_line_items').delete().eq('id', id)
    await refreshItems()
    await refreshEntries()
  }

  async function handleAddEntry(fields) {
    await supabase.from('pay_period_expense_entries').insert({ pay_period_id: period.id, user_id: userId, ...fields })
    await refreshEntries()
  }

  async function handleDeleteEntry(id) {
    await supabase.from('pay_period_expense_entries').delete().eq('id', id)
    await refreshEntries()
  }

  if (loading) return <div className="fin-content"><p className="fin-empty">Loading…</p></div>

  const incomeBudget = bySection.income.reduce((a, i) => a + computeBudget(i), 0)
  const incomeActual = bySection.income.reduce((a, i) => a + computeActual(i), 0)
  const billsBudget = bySection.bill.reduce((a, i) => a + computeBudget(i), 0)
  const billsActual = bySection.bill.reduce((a, i) => a + computeActual(i), 0)
  const expensesBudget = bySection.expense.reduce((a, i) => a + computeBudget(i), 0)
  const expensesActual = bySection.expense.reduce((a, i) => a + computeActual(i), 0)
  const savingsBudget = bySection.savings.reduce((a, i) => a + computeBudget(i), 0)
  const savingsActual = bySection.savings.reduce((a, i) => a + computeActual(i), 0)
  const debtBudget = bySection.debt.reduce((a, i) => a + computeBudget(i), 0)
  const debtActual = bySection.debt.reduce((a, i) => a + computeActual(i), 0)
  const remainingBudget = incomeBudget - (billsBudget + expensesBudget + savingsBudget + debtBudget)
  const remainingActual = incomeActual - (billsActual + expensesActual + savingsActual + debtActual)

  return (
    <div className="fin-content pp-detail">
      <div className="budget-header">
        <div className="budget-header-titles">
          <button className="pp-back-link" onClick={onBack}>← All pay periods</button>
          <h2 className="budget-title">{period.label || 'Pay Period'}</h2>
        </div>
      </div>

      <div className="pp-period-dates">
        <span>For the period:</span>
        <input className="fin-input" type="date" value={period.start_date} onChange={e => onDatesChange('start_date', e.target.value)} />
        <span>to</span>
        <input className="fin-input" type="date" value={period.end_date} onChange={e => onDatesChange('end_date', e.target.value)} />
      </div>

      {PP_SECTION_DEFS.map(def => (
        <PayPeriodLineSection
          key={def.key}
          def={def}
          items={bySection[def.key]}
          referenceOptions={referencesBySection[def.key] || []}
          computeBudget={computeBudget}
          computeActual={computeActual}
          onAdd={fields => handleAdd(def.key, fields)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}

      <PayPeriodSummaryTable
        rows={[
          { label: 'Income', budget: incomeBudget, actual: incomeActual },
          { label: 'Bills', budget: billsBudget, actual: billsActual },
          { label: 'Expenses', budget: expensesBudget, actual: expensesActual },
          { label: 'Savings', budget: savingsBudget, actual: savingsActual },
          { label: 'Debt', budget: debtBudget, actual: debtActual },
        ]}
        remainingBudget={remainingBudget}
        remainingActual={remainingActual}
      />

      <PayPeriodTransactionTracker entries={entries} lineItems={items} onAdd={handleAddEntry} onDelete={handleDeleteEntry} />
    </div>
  )
}

function PayPeriodsList({ userId, onSelect }) {
  const [periods, setPeriods] = useState(null)
  const [totalsByPeriod, setTotalsByPeriod] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [startDate, setStartDate] = useState(ppTodayISO())
  const [endDate, setEndDate] = useState(ppTodayISO())
  const [saving, setSaving] = useState(false)

  async function refresh() {
    const { data } = await supabase.from('pay_periods').select('*').eq('user_id', userId).order('start_date', { ascending: false })
    const periodsData = data || []
    setPeriods(periodsData)

    const totalsEntries = await Promise.all(periodsData.map(async p => {
      const [itemsRes, entriesRes] = await Promise.all([
        supabase.from('pay_period_line_items').select('*').eq('pay_period_id', p.id),
        supabase.from('pay_period_expense_entries').select('*').eq('pay_period_id', p.id),
      ])
      const items = itemsRes.data || []
      const txns = entriesRes.data || []
      const actualById = {}
      txns.forEach(e => { if (e.line_item_id) actualById[e.line_item_id] = (actualById[e.line_item_id] || 0) + (Number(e.amount) || 0) })
      const actual = item => actualById[item.id] || 0
      const income = items.filter(i => i.section === 'income').reduce((a, i) => a + actual(i), 0)
      const outflow = items.filter(i => i.section !== 'income').reduce((a, i) => a + actual(i), 0)
      return [p.id, { income, outflow, remaining: income - outflow }]
    }))
    setTotalsByPeriod(Object.fromEntries(totalsEntries))
  }

  useEffect(() => { if (userId) refresh() }, [userId])

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    const { data, error } = await supabase.from('pay_periods')
      .insert({ user_id: userId, label: label.trim() || null, start_date: startDate, end_date: endDate })
      .select().single()
    setSaving(false)
    if (error || !data) return
    setShowForm(false)
    setLabel('')
    await refresh()
    onSelect(data)
  }

  async function handleDelete(id, e) {
    e.stopPropagation()
    await supabase.from('pay_period_expense_entries').delete().eq('pay_period_id', id)
    await supabase.from('pay_period_line_items').delete().eq('pay_period_id', id)
    await supabase.from('pay_periods').delete().eq('id', id)
    await refresh()
  }

  const overall = useMemo(() => {
    const values = Object.values(totalsByPeriod)
    return {
      income: values.reduce((s, v) => s + v.income, 0),
      outflow: values.reduce((s, v) => s + v.outflow, 0),
      remaining: values.reduce((s, v) => s + v.remaining, 0),
    }
  }, [totalsByPeriod])

  return (
    <div className="fin-content">
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">Pay Periods</h2>
          <span className="fin-toolbar-label">Every paycheck gets its own budget</span>
        </div>
        <button className="fin-add-btn" onClick={() => setShowForm(s => !s)}>{showForm ? 'Cancel' : '+ New pay period'}</button>
      </div>

      {showForm && (
        <form className="fin-form" onSubmit={handleCreate}>
          <input className="fin-input" placeholder="Label (e.g. July 1–15 paycheck)" value={label} onChange={e => setLabel(e.target.value)} />
          <div className="fin-form-row">
            <input className="fin-input" type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
            <input className="fin-input" type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="fin-form-actions">
            <button type="submit" className="fin-save" disabled={saving}>{saving ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      )}

      {periods === null && <p className="fin-empty">Loading…</p>}
      {periods !== null && periods.length === 0 && <p className="fin-empty">No pay periods yet. Create your first one to start budgeting.</p>}

      {periods !== null && periods.length > 0 && (
        <>
          <div className="budget-summary-bar">
            <div className="budget-summary-item">
              <span className="budget-summary-lbl">Actual Income</span>
              <span className="budget-summary-val income">{ppFmt(overall.income)}</span>
            </div>
            <div className="budget-summary-item">
              <span className="budget-summary-lbl">Actual Spent</span>
              <span className="budget-summary-val">{ppFmt(overall.outflow)}</span>
            </div>
            <div className="budget-summary-item">
              <span className="budget-summary-lbl">Net Remaining</span>
              <span className="budget-summary-val" style={{ color: overall.remaining < 0 ? '#cc0000' : '#41a700' }}>{ppFmt(overall.remaining)}</span>
            </div>
          </div>

          <div className="pp-period-grid">
            {periods.map(p => {
              const totals = totalsByPeriod[p.id] || { income: 0, outflow: 0, remaining: 0 }
              return (
                <div key={p.id} className="pp-period-card" onClick={() => onSelect(p)}>
                  <div className="pp-period-card-head">
                    <h3>{p.label || 'Pay Period'}</h3>
                    <span className="budget-del" onClick={e => handleDelete(p.id, e)}>✕</span>
                  </div>
                  <p className="pp-period-card-dates">{ppFmtDate(p.start_date)} – {ppFmtDate(p.end_date)}</p>
                  <div className="pp-period-card-totals">
                    <div><span>Income</span><strong>{ppFmt(totals.income)}</strong></div>
                    <div><span>Spent</span><strong>{ppFmt(totals.outflow)}</strong></div>
                    <div style={{ color: totals.remaining < 0 ? '#cc0000' : '#41a700' }}><span>Remaining</span><strong>{ppFmt(totals.remaining)}</strong></div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function ReferencesSubTab({ userId, providerToken }) {
  const [items, setItems] = useState(null)
  const [drafts, setDrafts] = useState(Object.fromEntries(PP_REF_SECTIONS.map(s => [s, { name: '', amount: '' }])))
  const [seeding, setSeeding] = useState(false)

  async function refresh() {
    const { data } = await supabase.from('budget_reference_items').select('*').eq('user_id', userId).order('section').order('name')
    setItems(data || [])
  }

  const { sync: syncCheckBreakdown, syncing, result: syncResult, error: syncError } = useCheckBreakdownSync(userId, providerToken, refresh)

  useEffect(() => { if (userId) refresh() }, [userId])

  async function handleAdd(section, e) {
    e.preventDefault()
    const draft = drafts[section]
    if (!draft.name.trim()) return
    await supabase.from('budget_reference_items').insert({
      user_id: userId, section, name: draft.name.trim(),
      default_amount: draft.amount ? Math.ceil(Number(draft.amount)) : null,
    })
    setDrafts(d => ({ ...d, [section]: { name: '', amount: '' } }))
    await refresh()
  }

  async function handleUpdateAmount(id, amount) {
    await supabase.from('budget_reference_items').update({ default_amount: amount === '' ? null : Math.ceil(Number(amount)) || 0 }).eq('id', id)
    await refresh()
  }

  async function handleDelete(id) {
    await supabase.from('budget_reference_items').delete().eq('id', id)
    await refresh()
  }

  async function handleSeedStarters() {
    setSeeding(true)
    try {
      const rows = PP_STARTER_PRESETS.map(p => ({
        user_id: userId, section: p.section, name: p.name,
        default_amount: p.defaultAmount != null ? Math.ceil(p.defaultAmount) : null,
      }))
      await supabase.from('budget_reference_items').insert(rows)
      await refresh()
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="fin-content">
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">References</h2>
          <span className="fin-toolbar-label">Reusable presets — auto-fill a pay period's budget</span>
        </div>
        <div className="pp-ref-actions">
          {syncResult && !syncError && (
            <span className="pp-sync-status">
              {syncResult.updated + syncResult.inserted === 0
                ? 'Already up to date'
                : `Synced — ${syncResult.inserted} added, ${syncResult.updated} updated`}
            </span>
          )}
          {syncError && <span className="pp-sync-status error">{syncError}</span>}
          <button className="fin-add-btn" onClick={syncCheckBreakdown} disabled={syncing} title="Pull the Reference Sheet from your Check Breakdown spreadsheet in Google Drive">
            {syncing ? 'Syncing…' : '⟳ Sync from Check Breakdown'}
          </button>
          {items && items.length === 0 && (
            <button className="fin-add-btn" onClick={handleSeedStarters} disabled={seeding}>{seeding ? 'Loading…' : 'Load starter categories'}</button>
          )}
        </div>
      </div>

      {items === null && <p className="fin-empty">Loading…</p>}

      {items !== null && (
        <div className="pp-references-grid">
          {PP_REF_SECTIONS.map(section => {
            const sectionItems = items.filter(i => i.section === section)
            const draft = drafts[section]
            const label = PP_SECTION_DEFS.find(d => d.key === section)?.label || section
            return (
              <div className="pp-card pp-section" key={section}>
                <div className="budget-header">
                  <div className="budget-header-titles"><h2 className="budget-title">{label}</h2></div>
                </div>
                <div className="pp-table-wrap">
                  <table className="budget-table">
                    <thead>
                      <tr>
                        <th className="budget-th cat">Item</th>
                        <th className="budget-th">Default amount</th>
                        <th className="budget-th del-col"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionItems.map(item => (
                        <tr key={item.id} className="budget-row">
                          <td className="budget-td cat">{item.name}</td>
                          <td className="budget-td num">
                            <input
                              className="budget-input"
                              type="number" step="1"
                              defaultValue={item.default_amount ?? ''}
                              onBlur={e => handleUpdateAmount(item.id, e.target.value)}
                            />
                          </td>
                          <td className="budget-td del-col">
                            <span className="budget-del" onClick={() => handleDelete(item.id)}>✕</span>
                          </td>
                        </tr>
                      ))}
                      {sectionItems.length === 0 && (
                        <tr><td colSpan={3} className="budget-td"><span className="budget-empty">No presets yet</span></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <form className="fin-form" onSubmit={e => handleAdd(section, e)}>
                  <input className="fin-input" placeholder="Item name…" value={draft.name}
                    onChange={e => setDrafts(d => ({ ...d, [section]: { ...d[section], name: e.target.value } }))} />
                  <div className="fin-form-row">
                    <input className="fin-input amount" type="number" step="1" placeholder="Default amount" value={draft.amount}
                      onChange={e => setDrafts(d => ({ ...d, [section]: { ...d[section], amount: e.target.value } }))} />
                    <button type="submit" className="fin-save">Add</button>
                  </div>
                </form>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Bill Calendar ──────────────────────────────────────────────────────────
// Ported from the "Bill & Debt Payment Calendar" bonus sheet in the Budget by
// Paycheck template: bills (with a monthly due day) laid out on a month grid,
// plus a running due/paid/remaining tally for the selected month.

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function BillCalendarSubTab({ userId, bills = [], onToggleBillPaid }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed

  // Every monthly/annual bill with a due day lands on the calendar. Weekly bills
  // have no single day, so they're listed separately below rather than pinned.
  const dueBills = bills.filter(b => b.due_day && b.frequency !== 'weekly')
  const billsByDay = useMemo(() => {
    const map = {}
    dueBills.forEach(b => {
      const day = Math.min(31, Math.max(1, b.due_day))
      if (!map[day]) map[day] = []
      map[day].push(b)
    })
    return map
  }, [bills, month, year])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()
  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const todayDay = now.getDate()

  const totalDue = dueBills.reduce((s, b) => s + Number(b.amount || 0), 0)
  const paidTotal = dueBills.filter(b => b.paid).reduce((s, b) => s + Number(b.amount || 0), 0)
  const remaining = totalDue - paidTotal

  function statusOf(b) {
    if (b.paid) return { label: 'Paid', cls: 'paid' }
    if (isCurrentMonth && b.due_day < todayDay) return { label: 'Overdue', cls: 'overdue' }
    return { label: 'Due', cls: 'due' }
  }

  function shift(delta) {
    let m = month + delta, y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMonth(m); setYear(y)
  }

  return (
    <div className="fin-content">
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">Bill Calendar</h2>
          <span className="fin-toolbar-label">{dueBills.length} scheduled bills</span>
        </div>
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => shift(-1)}>‹</button>
          <span className="cal-nav-label">{MONTH_NAMES[month]} {year}</span>
          <button className="cal-nav-btn" onClick={() => shift(1)}>›</button>
        </div>
      </div>

      <div className="budget-summary-bar">
        <div className="budget-summary-item">
          <span className="budget-summary-lbl">Total Due</span>
          <span className="budget-summary-val">{fmt(totalDue)}</span>
        </div>
        <div className="budget-summary-item">
          <span className="budget-summary-lbl">Paid</span>
          <span className="budget-summary-val income">{fmt(paidTotal)}</span>
        </div>
        <div className="budget-summary-item">
          <span className="budget-summary-lbl">Remaining</span>
          <span className="budget-summary-val" style={{ color: remaining > 0 ? '#cc0000' : '#41a700' }}>{fmt(remaining)}</span>
        </div>
      </div>

      {dueBills.length === 0 ? (
        <p className="fin-empty">No bills with a due day yet. Add bills (with a due day) in the Bills tab and they'll appear here.</p>
      ) : (
        <div className="cal-wrap">
          <div className="cal-grid">
            {DOW_LABELS.map(d => <div key={d} className="cal-dow">{d}</div>)}
            {cells.map((day, i) => {
              const dayBills = day ? (billsByDay[day] || []) : []
              const dayTotal = dayBills.reduce((s, b) => s + Number(b.amount || 0), 0)
              const isToday = isCurrentMonth && day === todayDay
              return (
                <div key={i} className={`cal-cell${day ? '' : ' empty'}${isToday ? ' today' : ''}`}>
                  {day && (
                    <>
                      <div className="cal-cell-head">
                        <span className="cal-cell-day">{day}</span>
                        {dayTotal > 0 && <span className="cal-cell-total">{ppFmt(dayTotal)}</span>}
                      </div>
                      <div className="cal-cell-bills">
                        {dayBills.map(b => {
                          const st = statusOf(b)
                          return (
                            <button
                              key={b.id}
                              className={`cal-bill-pill ${st.cls}`}
                              title={`${b.name} — ${fmt(b.amount)} · ${st.label} (click to toggle paid)`}
                              onClick={() => onToggleBillPaid && onToggleBillPaid(b.id)}
                            >
                              <span className="cal-bill-name">{b.name}</span>
                              <span className="cal-bill-amt">{ppFmt(b.amount)}</span>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          <div className="cal-legend">
            <span className="cal-legend-item"><i className="cal-dot due" />Due</span>
            <span className="cal-legend-item"><i className="cal-dot overdue" />Overdue</span>
            <span className="cal-legend-item"><i className="cal-dot paid" />Paid</span>
            <span className="cal-legend-hint">Tap a bill to mark it paid</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Spending Dashboard ─────────────────────────────────────────────────────
// Ported from the "Expenses Dashboard" of the Expense Tracker template: takes
// the actuals already logged against pay-period line items and rolls them up by
// section and by category for a chosen month, with a category breakdown chart.

function monthKey(dateStr) {
  return (dateStr || '').slice(0, 7) // YYYY-MM
}

function fmtMonthKey(key) {
  if (!key) return ''
  const [y, m] = key.split('-')
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`
}

function SpendingDashboardSubTab({ userId }) {
  const [entries, setEntries] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('all')

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    async function load() {
      setLoading(true)
      const [entRes, itemRes] = await Promise.all([
        supabase.from('pay_period_expense_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false }),
        supabase.from('pay_period_line_items').select('*').eq('user_id', userId),
      ])
      if (cancelled) return
      setEntries(entRes.data || [])
      setItems(itemRes.data || [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [userId])

  const itemsById = useMemo(() => Object.fromEntries(items.map(i => [i.id, i])), [items])

  const months = useMemo(() => {
    const set = new Set(entries.map(e => monthKey(e.entry_date)).filter(Boolean))
    return Array.from(set).sort().reverse()
  }, [entries])

  const filtered = useMemo(() => {
    if (selectedMonth === 'all') return entries
    return entries.filter(e => monthKey(e.entry_date) === selectedMonth)
  }, [entries, selectedMonth])

  // Roll the month's actuals up two ways: by section (Income/Bills/…) for the
  // summary tiles, and by individual line-item name for the breakdown chart.
  const { bySection, byCategory, totalOut, totalIn } = useMemo(() => {
    const sec = { income: 0, bill: 0, expense: 0, savings: 0, debt: 0 }
    const cat = {}
    let out = 0, incm = 0
    filtered.forEach(e => {
      const item = itemsById[e.line_item_id]
      const section = item?.section || 'expense'
      const amt = Number(e.amount) || 0
      sec[section] = (sec[section] || 0) + amt
      if (section === 'income') { incm += amt } else {
        out += amt
        const name = item?.name || 'Uncategorized'
        cat[name] = (cat[name] || 0) + amt
      }
    })
    const catRows = Object.entries(cat).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total)
    return { bySection: sec, byCategory: catRows, totalOut: out, totalIn: incm }
  }, [filtered, itemsById])

  const maxCat = byCategory.reduce((m, c) => Math.max(m, c.total), 0)
  const SECTION_TILES = [
    { key: 'income', label: 'Income', color: '#41a700' },
    { key: 'bill', label: 'Bills', color: '#1e3070' },
    { key: 'expense', label: 'Expenses', color: '#c77b3a' },
    { key: 'savings', label: 'Savings', color: '#2a8a7a' },
    { key: 'debt', label: 'Debt', color: '#a23b3b' },
  ]

  return (
    <div className="fin-content">
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">Spending Dashboard</h2>
          <span className="fin-toolbar-label">Where the money actually went</span>
        </div>
        <select className="budget-month-sel" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          <option value="all">All time</option>
          {months.map(m => <option key={m} value={m}>{fmtMonthKey(m)}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="fin-empty">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="fin-empty">No transactions logged yet. Log spending against a pay period's line items and it will roll up here.</p>
      ) : (
        <>
          <div className="dash-tiles">
            {SECTION_TILES.map(t => (
              <div key={t.key} className="dash-tile" style={{ borderTopColor: t.color }}>
                <span className="dash-tile-lbl">{t.label}</span>
                <span className="dash-tile-val" style={{ color: t.color }}>{fmt(bySection[t.key] || 0)}</span>
              </div>
            ))}
          </div>

          <div className="dash-netline">
            <span>Money in <strong className="income">{fmt(totalIn)}</strong></span>
            <span>Money out <strong>{fmt(totalOut)}</strong></span>
            <span>Net <strong style={{ color: totalIn - totalOut < 0 ? '#cc0000' : '#41a700' }}>{fmt(totalIn - totalOut)}</strong></span>
          </div>

          <div className="dash-section-title">Spending by category</div>
          {byCategory.length === 0 ? (
            <p className="fin-empty">No outflow recorded for this period.</p>
          ) : (
            <div className="dash-cat-list">
              {byCategory.map(c => {
                const pct = totalOut > 0 ? (c.total / totalOut) * 100 : 0
                return (
                  <div key={c.name} className="dash-cat-row">
                    <div className="dash-cat-head">
                      <span className="dash-cat-name">{c.name}</span>
                      <span className="dash-cat-amt">{fmt(c.total)} <span className="dash-cat-pct">{pct.toFixed(0)}%</span></span>
                    </div>
                    <div className="dash-cat-bar-wrap">
                      <div className="dash-cat-bar" style={{ width: `${maxCat > 0 ? (c.total / maxCat) * 100 : 0}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Emergency Fund Calculator & Tracker ────────────────────────────────────
// Ported from the Emergency Fund Calculator & Tracker template: monthly
// essential-expense categories drive 1-, 3-, and N-month savings goals; a
// contribution log tracks progress and projects a "fully funded by" date.

const EF_STARTER_CATEGORIES = [
  { name: 'Mortgage / Rent', monthly_avg: 0 },
  { name: 'Utilities', monthly_avg: 0 },
  { name: 'Groceries', monthly_avg: 0 },
  { name: 'Insurance', monthly_avg: 0 },
  { name: 'Transportation / Gas', monthly_avg: 0 },
  { name: 'Phone & Internet', monthly_avg: 0 },
  { name: 'Minimum Debt Payments', monthly_avg: 0 },
  { name: 'Healthcare', monthly_avg: 0 },
]

// EOMONTH(balanceDate, monthsNeeded-1): the last day of the month `monthsNeeded`
// months of contributions out. monthsNeeded 0 means the goal is already met.
function efFundedByDate(balanceDateISO, monthsNeeded) {
  if (!balanceDateISO || monthsNeeded == null) return null
  const d = new Date(`${balanceDateISO}T00:00:00`)
  if (Number.isNaN(d.getTime())) return null
  if (monthsNeeded <= 0) return d
  return new Date(d.getFullYear(), d.getMonth() + monthsNeeded, 0)
}

function efFmtDate(d) {
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function EmergencyFundGoalCard({ label, goal, saved, monthlyContribution, balanceDate, accent }) {
  const remaining = Math.max(0, goal - saved)
  const pct = goal > 0 ? Math.min(100, (saved / goal) * 100) : 0
  const monthsNeeded = remaining <= 0 ? 0 : (monthlyContribution > 0 ? Math.ceil(remaining / monthlyContribution) : null)
  const fundedBy = efFundedByDate(balanceDate, monthsNeeded)
  const completed = remaining <= 0 && goal > 0
  return (
    <div className="ef-goal-card" style={{ borderTopColor: accent }}>
      <div className="ef-goal-head">
        <span className="ef-goal-label">{label}</span>
        {completed && <span className="ef-goal-check">✅</span>}
      </div>
      <div className="ef-goal-target" style={{ color: accent }}>{fmt(goal)}</div>
      <div className="ef-goal-bar-wrap">
        <div className="ef-goal-bar" style={{ width: `${pct}%`, background: accent }} />
      </div>
      <div className="ef-goal-stats">
        <div><span>Saved</span><strong>{fmt(saved)}</strong></div>
        <div><span>Remaining</span><strong>{fmt(remaining)}</strong></div>
        <div><span>Funded by</span><strong>{completed ? 'Done' : (monthsNeeded == null ? 'Set contribution' : efFmtDate(fundedBy))}</strong></div>
      </div>
    </div>
  )
}

function EmergencyFundSubTab({ userId }) {
  const [config, setConfig] = useState(null)
  const [categories, setCategories] = useState([])
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [catDraft, setCatDraft] = useState({ name: '', monthly_avg: '' })
  const [entryDraft, setEntryDraft] = useState({ entry_date: ppTodayISO(), amount: '', note: '' })
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    async function load() {
      setLoading(true)
      const [cfgRes, catRes, entRes] = await Promise.all([
        supabase.from('emergency_fund').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('emergency_fund_categories').select('*').eq('user_id', userId).order('sort_order').order('created_at'),
        supabase.from('emergency_fund_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false }),
      ])
      if (cancelled) return
      setConfig(cfgRes.data || { balance_date: ppTodayISO(), current_balance: 0, monthly_contribution: 0, months_to_cover: 6 })
      setCategories(catRes.data || [])
      setEntries(entRes.data || [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [userId])

  async function saveConfig(patch) {
    const next = { ...config, ...patch }
    setConfig(next)
    await supabase.from('emergency_fund').upsert({
      user_id: userId,
      balance_date: next.balance_date || null,
      current_balance: Number(next.current_balance) || 0,
      monthly_contribution: Number(next.monthly_contribution) || 0,
      months_to_cover: parseInt(next.months_to_cover) || 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  async function addCategory(e) {
    e.preventDefault()
    if (!catDraft.name.trim()) return
    const { data } = await supabase.from('emergency_fund_categories').insert({
      user_id: userId, name: catDraft.name.trim(), monthly_avg: Number(catDraft.monthly_avg) || 0, sort_order: categories.length,
    }).select().single()
    if (data) setCategories(c => [...c, data])
    setCatDraft({ name: '', monthly_avg: '' })
  }

  async function updateCategoryAmount(id, amount) {
    const val = amount === '' ? 0 : Number(amount) || 0
    await supabase.from('emergency_fund_categories').update({ monthly_avg: val }).eq('id', id)
    setCategories(c => c.map(x => x.id === id ? { ...x, monthly_avg: val } : x))
  }

  async function deleteCategory(id) {
    await supabase.from('emergency_fund_categories').delete().eq('id', id)
    setCategories(c => c.filter(x => x.id !== id))
  }

  async function seedStarters() {
    setSeeding(true)
    try {
      const rows = EF_STARTER_CATEGORIES.map((c, i) => ({ user_id: userId, name: c.name, monthly_avg: c.monthly_avg, sort_order: i }))
      const { data } = await supabase.from('emergency_fund_categories').insert(rows).select()
      if (data) setCategories(data)
    } finally {
      setSeeding(false)
    }
  }

  async function addEntry(e) {
    e.preventDefault()
    if (!entryDraft.amount) return
    const { data } = await supabase.from('emergency_fund_entries').insert({
      user_id: userId, entry_date: entryDraft.entry_date, amount: Number(entryDraft.amount) || 0, note: entryDraft.note.trim() || null,
    }).select().single()
    if (data) setEntries(en => [data, ...en])
    setEntryDraft({ entry_date: ppTodayISO(), amount: '', note: '' })
  }

  async function deleteEntry(id) {
    await supabase.from('emergency_fund_entries').delete().eq('id', id)
    setEntries(en => en.filter(x => x.id !== id))
  }

  if (loading || !config) return <div className="fin-content"><p className="fin-empty">Loading…</p></div>

  const monthlyTotal = categories.reduce((s, c) => s + Number(c.monthly_avg || 0), 0)
  const contributed = entries.reduce((s, e) => s + Number(e.amount || 0), 0)
  const saved = (Number(config.current_balance) || 0) + contributed
  const monthlyContribution = Number(config.monthly_contribution) || 0
  const N = parseInt(config.months_to_cover) || 6

  return (
    <div className="fin-content">
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">Emergency Fund</h2>
          <span className="fin-toolbar-label">Cover {N} months of essentials</span>
        </div>
      </div>

      <div className="ef-inputs">
        <label className="ef-field">
          <span>Balance date</span>
          <input className="fin-input" type="date" value={config.balance_date || ''} onChange={e => saveConfig({ balance_date: e.target.value })} />
        </label>
        <label className="ef-field">
          <span>Starting balance</span>
          <input className="fin-input" type="number" step="0.01" defaultValue={config.current_balance ?? 0} onBlur={e => saveConfig({ current_balance: e.target.value })} />
        </label>
        <label className="ef-field">
          <span>Monthly contribution</span>
          <input className="fin-input" type="number" step="0.01" defaultValue={config.monthly_contribution ?? 0} onBlur={e => saveConfig({ monthly_contribution: e.target.value })} />
        </label>
        <label className="ef-field">
          <span>Months to cover</span>
          <input className="fin-input" type="number" step="1" min="1" defaultValue={config.months_to_cover ?? 6} onBlur={e => saveConfig({ months_to_cover: e.target.value })} />
        </label>
      </div>

      <div className="ef-goals">
        <EmergencyFundGoalCard label="1-Month Goal" goal={monthlyTotal} saved={saved} monthlyContribution={monthlyContribution} balanceDate={config.balance_date} accent="#41a700" />
        <EmergencyFundGoalCard label="3-Months Goal" goal={monthlyTotal * 3} saved={saved} monthlyContribution={monthlyContribution} balanceDate={config.balance_date} accent="#1e3070" />
        <EmergencyFundGoalCard label={`${N}-Months Goal`} goal={monthlyTotal * N} saved={saved} monthlyContribution={monthlyContribution} balanceDate={config.balance_date} accent="#a23b3b" />
      </div>

      <div className="ef-columns">
        <div className="pp-card pp-section ef-col">
          <div className="budget-header">
            <div className="budget-header-titles"><h2 className="budget-title">Monthly Essentials</h2></div>
            {categories.length === 0 && (
              <button className="fin-add-btn" onClick={seedStarters} disabled={seeding}>{seeding ? 'Loading…' : 'Load starters'}</button>
            )}
          </div>
          <div className="pp-table-wrap">
            <table className="budget-table">
              <thead>
                <tr>
                  <th className="budget-th cat">Category</th>
                  <th className="budget-th">Monthly avg</th>
                  <th className="budget-th del-col"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id} className="budget-row">
                    <td className="budget-td cat">{c.name}</td>
                    <td className="budget-td num">
                      <input className="budget-input" type="number" step="0.01" defaultValue={c.monthly_avg ?? 0} onBlur={e => updateCategoryAmount(c.id, e.target.value)} />
                    </td>
                    <td className="budget-td del-col"><span className="budget-del" onClick={() => deleteCategory(c.id)}>✕</span></td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={3} className="budget-td"><span className="budget-empty">No categories yet</span></td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="budget-net-row">
                  <td className="budget-td cat">Monthly total</td>
                  <td className="budget-td num net-val">{fmt(monthlyTotal)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <form className="fin-form" onSubmit={addCategory}>
            <input className="fin-input" placeholder="Category name…" value={catDraft.name} onChange={e => setCatDraft(d => ({ ...d, name: e.target.value }))} />
            <div className="fin-form-row">
              <input className="fin-input amount" type="number" step="0.01" placeholder="Monthly avg" value={catDraft.monthly_avg} onChange={e => setCatDraft(d => ({ ...d, monthly_avg: e.target.value }))} />
              <button type="submit" className="fin-save">Add</button>
            </div>
          </form>
        </div>

        <div className="pp-card pp-section ef-col">
          <div className="budget-header">
            <div className="budget-header-titles">
              <h2 className="budget-title">Contributions</h2>
              <span className="fin-toolbar-label">{fmt(contributed)} logged</span>
            </div>
          </div>
          <form className="fin-form" onSubmit={addEntry}>
            <div className="fin-form-row">
              <input className="fin-input" type="date" value={entryDraft.entry_date} onChange={e => setEntryDraft(d => ({ ...d, entry_date: e.target.value }))} />
              <input className="fin-input amount" type="number" step="0.01" placeholder="Amount" value={entryDraft.amount} onChange={e => setEntryDraft(d => ({ ...d, amount: e.target.value }))} required />
            </div>
            <div className="fin-form-row">
              <input className="fin-input" placeholder="Note (optional)" value={entryDraft.note} onChange={e => setEntryDraft(d => ({ ...d, note: e.target.value }))} />
              <button type="submit" className="fin-save">Log</button>
            </div>
          </form>
          <div className="pp-table-wrap">
            <table className="budget-table">
              <thead>
                <tr>
                  <th className="budget-th">Date</th>
                  <th className="budget-th cat">Note</th>
                  <th className="budget-th">Amount</th>
                  <th className="budget-th del-col"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map(en => (
                  <tr key={en.id} className="budget-row">
                    <td className="budget-td num">{ppFmtDate(en.entry_date)}</td>
                    <td className="budget-td cat">{en.note || <span className="budget-empty">—</span>}</td>
                    <td className="budget-td num">{fmt(en.amount)}</td>
                    <td className="budget-td del-col"><span className="budget-del" onClick={() => deleteEntry(en.id)}>✕</span></td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr><td colSpan={4} className="budget-td"><span className="budget-empty">No contributions logged yet</span></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Debt Strategy (Snowball vs Avalanche vs Minimum) ───────────────────────
// Ported from the Debt Payoff "Strategy Analysis" dashboard: simulate paying
// off the same debts three ways so the interest and time each one costs can be
// compared side by side, factoring in an optional extra monthly payment.

// General month-by-month payoff simulator. Interest accrues monthly, then
// payments apply. `rolling` strategies (snowball/avalanche) throw every freed-up
// minimum plus the extra payment at whichever debt `orderFn` ranks first;
// `minimum` pays each debt only its own minimum. Returns months to debt-free,
// total interest paid, and total paid.
function simulatePayoffStrategy(debts, orderFn, extraPayment, rolling) {
  const items = debts.map(d => ({ balance: Number(d.balance) || 0, minimum: Number(d.minimum) || 0, rate: Number(d.rate) || 0, paidMonth: null }))
  if (items.length === 0) return { months: 0, totalInterest: 0, totalPaid: 0 }
  const MAX_MONTHS = 1200
  let month = 0, totalInterest = 0, totalPaid = 0
  items.forEach(it => { if (it.balance <= 0.005) it.paidMonth = 0 })

  while (items.some(it => it.paidMonth === null) && month < MAX_MONTHS) {
    month++
    items.forEach(it => {
      if (it.paidMonth === null) {
        const interest = it.balance * (it.rate / 100 / 12)
        it.balance += interest
        totalInterest += interest
      }
    })
    const unpaid = items.filter(it => it.paidMonth === null)
    if (rolling) {
      const freed = items.reduce((s, it) => it.paidMonth !== null ? s + it.minimum : s, 0)
      let pool = (Number(extraPayment) || 0) + freed
      unpaid.forEach(it => {
        const pay = Math.min(it.minimum, it.balance)
        it.balance -= pay; totalPaid += pay
      })
      const targets = orderFn([...unpaid])
      for (const it of targets) {
        if (pool <= 0.005) break
        if (it.balance <= 0.005) continue
        const pay = Math.min(pool, it.balance)
        it.balance -= pay; totalPaid += pay; pool -= pay
      }
    } else {
      unpaid.forEach(it => {
        const pay = Math.min(it.minimum, it.balance)
        it.balance -= pay; totalPaid += pay
      })
    }
    items.forEach(it => { if (it.paidMonth === null && it.balance <= 0.005) it.paidMonth = month })
  }
  const done = items.every(it => it.paidMonth !== null)
  return { months: done ? month : null, totalInterest, totalPaid }
}

const SNOWBALL_ORDER = arr => arr.sort((a, b) => a.balance - b.balance || b.rate - a.rate)
const AVALANCHE_ORDER = arr => arr.sort((a, b) => b.rate - a.rate || a.balance - b.balance)

function DebtStrategySubTab({ userId }) {
  const [debts, setDebts] = useState([])
  const [extraPayment, setExtraPayment] = useState(0)
  const [strategy, setStrategy] = useState('snowball')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    async function load() {
      setLoading(true)
      const [debtRes, setRes] = await Promise.all([
        supabase.from('debts').select('*').eq('user_id', userId),
        supabase.from('debt_payoff_settings').select('*').eq('user_id', userId).maybeSingle(),
      ])
      if (cancelled) return
      setDebts(debtRes.data || [])
      if (setRes.data) { setExtraPayment(Number(setRes.data.extra_payment) || 0); setStrategy(setRes.data.strategy || 'snowball') }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [userId])

  async function saveSettings(patch) {
    const next = { extra_payment: extraPayment, strategy, ...patch }
    await supabase.from('debt_payoff_settings').upsert({
      user_id: userId, extra_payment: Number(next.extra_payment) || 0, strategy: next.strategy, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  // The mortgage sits outside the payoff race (Ramsey's Baby Step 6), matching
  // the Debt Snowball tab's exclusion.
  const activeDebts = useMemo(() => debts.filter(d => !isMortgageDebt(d)).map(d => ({
    id: d.id,
    name: d.name,
    balance: effectivePayoff(d),
    minimum: Number(d.minimum_payment) || 0,
    rate: extractRate(d.name),
  })).filter(d => d.balance > 0), [debts])

  const results = useMemo(() => ({
    minimum: simulatePayoffStrategy(activeDebts, null, 0, false),
    snowball: simulatePayoffStrategy(activeDebts, SNOWBALL_ORDER, extraPayment, true),
    avalanche: simulatePayoffStrategy(activeDebts, AVALANCHE_ORDER, extraPayment, true),
  }), [activeDebts, extraPayment])

  const payoffOrder = useMemo(() => {
    const ordered = strategy === 'avalanche' ? AVALANCHE_ORDER([...activeDebts]) : SNOWBALL_ORDER([...activeDebts])
    return ordered
  }, [activeDebts, strategy])

  const totalBalance = activeDebts.reduce((s, d) => s + d.balance, 0)
  const totalMin = activeDebts.reduce((s, d) => s + d.minimum, 0)

  function monthsLabel(m) {
    if (m == null) return '100+ yrs'
    const y = Math.floor(m / 12), mo = m % 12
    return y > 0 ? `${y}y ${mo}m` : `${mo}m`
  }

  const minInterest = results.minimum.totalInterest
  const STRATS = [
    { key: 'minimum', label: 'Minimum Only', desc: 'No extra, no rolling', color: '#8a95a8' },
    { key: 'snowball', label: 'Snowball', desc: 'Lowest balance first', color: '#1e3070' },
    { key: 'avalanche', label: 'Avalanche', desc: 'Highest interest first', color: '#a23b3b' },
  ]

  return (
    <div className="fin-content">
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">Debt Strategy</h2>
          <span className="fin-toolbar-label">Snowball vs Avalanche vs Minimum</span>
        </div>
      </div>

      {loading ? (
        <p className="fin-empty">Loading…</p>
      ) : activeDebts.length === 0 ? (
        <p className="fin-empty">No non-mortgage debts on file. Add debts in the Debt Snowball tab and compare payoff strategies here.</p>
      ) : (
        <>
          <div className="budget-summary-bar">
            <div className="budget-summary-item">
              <span className="budget-summary-lbl">Total Balance</span>
              <span className="budget-summary-val">{fmt(totalBalance)}</span>
            </div>
            <div className="budget-summary-item">
              <span className="budget-summary-lbl">Total Minimums</span>
              <span className="budget-summary-val">{fmt(totalMin)}</span>
            </div>
            <div className="budget-summary-item">
              <span className="budget-summary-lbl">Extra / Month</span>
              <span className="budget-summary-val income">{fmt(extraPayment)}</span>
            </div>
          </div>

          <div className="ds-extra-row">
            <label className="ef-field">
              <span>Extra monthly payment</span>
              <input
                className="fin-input" type="number" step="0.01" min="0"
                defaultValue={extraPayment}
                onBlur={e => { const v = Number(e.target.value) || 0; setExtraPayment(v); saveSettings({ extra_payment: v }) }}
              />
            </label>
            <p className="ds-extra-hint">The extra is thrown at the top-priority debt each month, then rolls forward as debts clear.</p>
          </div>

          <div className="ds-cards">
            {STRATS.map(s => {
              const r = results[s.key]
              const saved = minInterest - r.totalInterest
              return (
                <div key={s.key} className={`ds-card${strategy === s.key ? ' active' : ''}`} style={{ borderTopColor: s.color }}
                  onClick={() => { if (s.key !== 'minimum') { setStrategy(s.key); saveSettings({ strategy: s.key }) } }}>
                  <div className="ds-card-head">
                    <span className="ds-card-label" style={{ color: s.color }}>{s.label}</span>
                    <span className="ds-card-desc">{s.desc}</span>
                  </div>
                  <div className="ds-card-stat">
                    <span className="ds-card-stat-lbl">Debt-free in</span>
                    <span className="ds-card-stat-val">{monthsLabel(r.months)}</span>
                    <span className="ds-card-stat-sub">{r.months != null ? payoffLabel(r.months) : ''}</span>
                  </div>
                  <div className="ds-card-stat">
                    <span className="ds-card-stat-lbl">Interest paid</span>
                    <span className="ds-card-stat-val">{fmt(r.totalInterest)}</span>
                    {s.key !== 'minimum' && saved > 0.5 && <span className="ds-card-stat-sub saved">saves {fmt(saved)}</span>}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="dash-section-title">Payoff order — {strategy === 'avalanche' ? 'Avalanche' : 'Snowball'}</div>
          <div className="pp-table-wrap">
            <table className="budget-table">
              <thead>
                <tr>
                  <th className="budget-th cat">#</th>
                  <th className="budget-th cat">Debt</th>
                  <th className="budget-th">Balance</th>
                  <th className="budget-th">Minimum</th>
                  <th className="budget-th">Rate</th>
                </tr>
              </thead>
              <tbody>
                {payoffOrder.map((d, i) => (
                  <tr key={d.id} className="budget-row">
                    <td className="budget-td cat">{i + 1}</td>
                    <td className="budget-td cat">{d.name}</td>
                    <td className="budget-td num">{fmt(d.balance)}</td>
                    <td className="budget-td num">{fmt(d.minimum)}</td>
                    <td className="budget-td num">{d.rate ? `${d.rate.toFixed(2)}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function PayPeriodBudgetTab({ userId, providerToken, bills, onToggleBillPaid }) {
  const [subView, setSubView] = useState('periods')
  const [selectedPeriod, setSelectedPeriod] = useState(null)

  async function handleDatesChange(field, value) {
    const { data } = await supabase.from('pay_periods').update({ [field]: value }).eq('id', selectedPeriod.id).select().single()
    if (data) setSelectedPeriod(data)
  }

  if (selectedPeriod) {
    return (
      <PayPeriodDetail
        userId={userId}
        period={selectedPeriod}
        onBack={() => setSelectedPeriod(null)}
        onDatesChange={handleDatesChange}
      />
    )
  }

  const SUBVIEWS = [
    { key: 'periods', label: 'Pay Periods' },
    { key: 'calendar', label: 'Bill Calendar' },
    { key: 'spending', label: 'Spending' },
    { key: 'emergency', label: 'Emergency Fund' },
    { key: 'strategy', label: 'Debt Strategy' },
    { key: 'references', label: 'References' },
  ]

  return (
    <div className="pp-root">
      <div className="pp-subnav">
        {SUBVIEWS.map(v => (
          <button key={v.key} className={`pp-subnav-btn ${subView === v.key ? 'active' : ''}`} onClick={() => setSubView(v.key)}>{v.label}</button>
        ))}
      </div>
      {subView === 'periods' && <PayPeriodsList userId={userId} onSelect={setSelectedPeriod} />}
      {subView === 'calendar' && <BillCalendarSubTab userId={userId} bills={bills} onToggleBillPaid={onToggleBillPaid} />}
      {subView === 'spending' && <SpendingDashboardSubTab userId={userId} />}
      {subView === 'emergency' && <EmergencyFundSubTab userId={userId} />}
      {subView === 'strategy' && <DebtStrategySubTab userId={userId} />}
      {subView === 'references' && <ReferencesSubTab userId={userId} providerToken={providerToken} />}
    </div>
  )
}

// ─── Debt Snowball ──────────────────────────────────────────────────────────

// Debt names carry their APR in parens, e.g. "Mastercard Inspire ****0902 (17.90%)"
// or "Chevrolet Equinox (SchoolsFirst FCU, 4.94%)". Pulls the number right before
// the closing paren; debts with no rate on file (settlements, deferred loans) get 0%.
function extractRate(name) {
  const m = /([\d.]+)\s*%\)/.exec(name || '')
  return m ? parseFloat(m[1]) : 0
}

// A debt in a settlement program is "settled" once a payoff amount has been
// negotiated with the creditor. Until then settlement_amount is null.
function isSettled(d) {
  return d && d.settlement_amount != null && d.settlement_amount !== ''
}

// The balance the snowball should actually attack. Once a settlement is
// negotiated, the negotiated amount is what clears the debt — not the original
// balance — so ordering, simulation, and totals all run off this figure.
function effectivePayoff(d) {
  return isSettled(d) ? Number(d.settlement_amount) : Number(d.total_payoff)
}

// Simulates the snowball month by month. Interest accrues monthly on every
// outstanding balance before that month's payments are applied, then minimum
// payments move (plus the full rolled-in payment once a debt becomes the
// active target). Rows must already be sorted smallest-balance-first.
function simulateSnowball(rows) {
  const n = rows.length
  const monthsPaidOff = new Array(n).fill(null)
  if (n === 0) return { monthsPaidOff, totalMonths: 0 }

  const balances = rows.map(r => r.total_payoff)
  const mins = rows.map(r => r.minimum_payment)
  const rates = rows.map(r => r.rate || 0)
  const MAX_MONTHS = 1200 // 100-year safety cap

  balances.forEach((b, i) => { if (b <= 0.005) monthsPaidOff[i] = 0 })

  let month = 0
  while (monthsPaidOff.includes(null) && month < MAX_MONTHS) {
    month++
    for (let j = 0; j < n; j++) {
      if (monthsPaidOff[j] === null) balances[j] *= 1 + rates[j] / 100 / 12
    }
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

// Ramsey's debt snowball explicitly excludes the mortgage — it's tackled
// separately in Baby Step 6, after every other debt is gone.
function isMortgageDebt(d) {
  return /mortgage/i.test(d.name) || /mortgage/i.test(d.group_name || '')
}

// Groups debts sharing a group_name into one snowball-order entry (blending
// member APRs by balance); ungrouped debts stay individual. Returns rows
// sorted smallest-balance-first, with ties broken by the higher rate — Ramsey's
// method ignores interest for ordering except as a tiebreaker on equal balances.
function buildSnowballRows(debtsList) {
  const groupMap = new Map()
  const singles = []
  debtsList.forEach(d => {
    if (d.group_name) {
      if (!groupMap.has(d.group_name)) groupMap.set(d.group_name, [])
      groupMap.get(d.group_name).push(d)
    } else {
      singles.push({ isGroup: false, key: d.id, name: d.name, total_payoff: effectivePayoff(d), minimum_payment: Number(d.minimum_payment), rate: extractRate(d.name), owner: d.owner || '', goalMonths: d.goal_months ?? null, debt: d })
    }
  })
  const groups = Array.from(groupMap.entries()).map(([name, members]) => {
    const ownerSet = new Set(members.map(m => m.owner || ''))
    const goalSet = new Set(members.map(m => m.goal_months ?? null))
    const groupBalance = members.reduce((s, m) => s + effectivePayoff(m), 0)
    // Blend member APRs weighted by (effective) balance, since a group can mix rates (e.g. Sallie Mae 14.75%/10.75%)
    const blendedRate = groupBalance > 0
      ? members.reduce((s, m) => s + effectivePayoff(m) * extractRate(m.name), 0) / groupBalance
      : 0
    return {
      isGroup: true,
      key: `group:${name}`,
      name,
      total_payoff: groupBalance,
      minimum_payment: members.reduce((s, m) => s + Number(m.minimum_payment), 0),
      rate: blendedRate,
      members: [...members].sort((a, b) => effectivePayoff(a) - effectivePayoff(b)),
      owner: ownerSet.size === 1 ? [...ownerSet][0] : 'Mixed',
      goalMonths: goalSet.size === 1 ? [...goalSet][0] : null,
    }
  })
  return [...groups, ...singles].sort((a, b) => a.total_payoff - b.total_payoff || b.rate - a.rate)
}

// ─── Loan terms (variable-rate index/margin, interest-only draw, maturity) ───
// HELOCs and similar loans carry structure the balance/minimum can't capture:
// a variable rate, an interest-only draw period, and a maturity date. These
// helpers render that on a single (non-grouped) debt.
const TERM_FIELDS = ['rate_index', 'rate_margin', 'draw_end_date', 'maturity_date', 'notes']

function hasLoanTerms(debt) {
  return !!debt && TERM_FIELDS.some(f => debt[f] != null && debt[f] !== '')
}

function fmtTermMonth(dateStr) {
  if (!dateStr) return null
  const d = new Date(`${dateStr}T12:00:00`)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function monthsUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(`${dateStr}T12:00:00`)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  return (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth())
}

function rateSummary(debt) {
  if (!debt.rate_index) return null
  const margin = debt.rate_margin != null && debt.rate_margin !== '' ? ` + ${Number(debt.rate_margin)}%` : ''
  return `${debt.rate_index}${margin}`
}

// A one-line status for the draw period: interest-only vs. amortizing, and how
// far off the conversion is — the moment the minimum payment jumps.
function drawStatusHint(drawEndDate) {
  const m = monthsUntil(drawEndDate)
  if (m == null) return null
  const label = fmtTermMonth(drawEndDate)
  if (m <= 0) return `Amortizing repayment phase (interest-only draw ended ${label})`
  const yrs = Math.floor(m / 12)
  const mos = m % 12
  const span = yrs > 0 ? `${yrs}y ${mos}m` : `${mos}m`
  return `Interest-only until ${label} (~${span} away), then amortizes`
}

function termsSummary(debt) {
  const parts = []
  const rate = rateSummary(debt)
  if (rate) parts.push(rate)
  if (debt.draw_end_date) {
    const m = monthsUntil(debt.draw_end_date)
    parts.push(m != null && m <= 0
      ? `amortizing (draw ended ${fmtTermMonth(debt.draw_end_date)})`
      : `interest-only until ${fmtTermMonth(debt.draw_end_date)}`)
  }
  if (debt.maturity_date) parts.push(`matures ${fmtTermMonth(debt.maturity_date)}`)
  return parts.join(' · ')
}

// Editable detail panel shown when a single debt's terms row is expanded.
function DebtTermsDetail({ debt, colSpan, onSave }) {
  const [draft, setDraft] = useState({
    rate_index: debt.rate_index || '',
    rate_margin: debt.rate_margin ?? '',
    draw_end_date: debt.draw_end_date || '',
    maturity_date: debt.maturity_date || '',
    notes: debt.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function set(field, val) { setDraft(d => ({ ...d, [field]: val })); setSaved(false) }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(debt.id, {
        rate_index: draft.rate_index.trim() || null,
        rate_margin: draft.rate_margin === '' ? null : (parseFloat(draft.rate_margin) || 0),
        draw_end_date: draft.draw_end_date || null,
        maturity_date: draft.maturity_date || null,
        notes: draft.notes.trim() || null,
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const hint = drawStatusHint(draft.draw_end_date)

  return (
    <tr className="budget-row debt-terms-row">
      <td className="budget-td" colSpan={colSpan}>
        <div className="debt-terms-panel">
          <div className="debt-terms-grid">
            <label className="debt-terms-field">
              <span>Rate index</span>
              <input className="fin-input" placeholder="e.g. WSJ Prime" value={draft.rate_index}
                onChange={e => set('rate_index', e.target.value)} />
            </label>
            <label className="debt-terms-field">
              <span>Margin (%)</span>
              <input className="fin-input" type="number" step="0.001" placeholder="e.g. 2.5" value={draft.rate_margin}
                onChange={e => set('rate_margin', e.target.value)} />
            </label>
            <label className="debt-terms-field">
              <span>Interest-only draw ends</span>
              <input className="fin-input" type="date" value={draft.draw_end_date}
                onChange={e => set('draw_end_date', e.target.value)} />
            </label>
            <label className="debt-terms-field">
              <span>Maturity date</span>
              <input className="fin-input" type="date" value={draft.maturity_date}
                onChange={e => set('maturity_date', e.target.value)} />
            </label>
            <label className="debt-terms-field debt-terms-notes-field">
              <span>Notes</span>
              <textarea className="fin-input" rows={2} placeholder="Anything else about the terms…" value={draft.notes}
                onChange={e => set('notes', e.target.value)} />
            </label>
          </div>
          <div className="debt-terms-footer">
            {hint && <span className="debt-terms-hint">{hint}</span>}
            <button type="button" className="fin-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save terms'}
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}

// The "Total Payoff" cell for a concrete debt (a single row or a group member).
// Once a settlement is negotiated, the negotiated amount is what the snowball
// attacks, so it becomes the primary figure with the original balance shown
// struck through beneath it. Both are click-to-edit; a not-yet-settled debt
// still in the program gets a "＋ settlement" affordance and a status pill.
function PayoffCell({ debt, editCell, setEditCell, editVal, setEditVal, saveField, saveSettlement }) {
  const settled = isSettled(debt)
  const editingPayoff = editCell?.id === debt.id && editCell.field === 'total_payoff'
  const editingSettle = editCell?.id === debt.id && editCell.field === 'settlement_amount'

  if (editingSettle) {
    return (
      <input className="budget-input" type="number" autoFocus value={editVal}
        onChange={e => setEditVal(e.target.value)}
        onBlur={() => saveSettlement(debt, editVal)}
        onKeyDown={e => e.key === 'Enter' && saveSettlement(debt, editVal)}
        min="0" step="0.01" placeholder="settlement $ (blank = pending)" />
    )
  }
  if (editingPayoff) {
    return (
      <input className="budget-input" type="number" autoFocus value={editVal}
        onChange={e => setEditVal(e.target.value)}
        onBlur={() => saveField(debt, 'total_payoff', editVal)}
        onKeyDown={e => e.key === 'Enter' && saveField(debt, 'total_payoff', editVal)}
        min="0" step="0.01" />
    )
  }

  const startPayoff = () => { setEditCell({ id: debt.id, field: 'total_payoff' }); setEditVal(String(debt.total_payoff)) }
  const startSettle = () => { setEditCell({ id: debt.id, field: 'settlement_amount' }); setEditVal(settled ? String(debt.settlement_amount) : '') }
  const statusPill = debt.settlement_status && (
    <span className="debt-settle-status" title={debt.settlement_fee != null ? `Settlement fee ${fmt(debt.settlement_fee)}` : undefined}>
      {debt.settlement_status}
    </span>
  )

  if (settled) {
    return (
      <div className="debt-payoff-cell">
        <span className="budget-cell-val debt-settle-amt" title="Negotiated settlement — click to edit" onClick={startSettle}>
          {fmt(debt.settlement_amount)}
        </span>
        <span className="debt-payoff-orig" title="Original balance — click to edit" onClick={startPayoff}>
          was {fmt(debt.total_payoff)}
        </span>
        {statusPill}
      </div>
    )
  }
  return (
    <div className="debt-payoff-cell">
      <span className="budget-cell-val" onClick={startPayoff}>{fmt(debt.total_payoff)}</span>
      <span className="debt-settle-add" title="Enter a negotiated settlement amount" onClick={startSettle}>＋ settlement</span>
      {statusPill}
    </div>
  )
}

// One row of the Debt Snowball table, plus its expanded group members if any.
function DebtSnowballRow({ row, editCell, setEditCell, editVal, setEditVal, saveField, saveSettlement, saveOwner, saveGoal, saveTerms, deleteDebt, expanded, toggleExpand }) {
  return (
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
          ) : (
            <div className="debt-single-cell">
              <div className="debt-single-head">
                <span className="debt-single-name">{row.name}</span>
                <button type="button" className="debt-terms-toggle" onClick={() => toggleExpand(row.key)}>
                  {expanded[row.key] ? '▾ terms' : (hasLoanTerms(row.debt) ? '▸ terms' : '＋ terms')}
                </button>
              </div>
              {!expanded[row.key] && hasLoanTerms(row.debt) && termsSummary(row.debt) && (
                <span className="debt-terms-summary">{termsSummary(row.debt)}</span>
              )}
            </div>
          )}
        </td>
        <td className="budget-td num">
          {row.isGroup ? fmt(row.total_payoff) : (
            <PayoffCell debt={row.debt} editCell={editCell} setEditCell={setEditCell} editVal={editVal}
              setEditVal={setEditVal} saveField={saveField} saveSettlement={saveSettlement} />
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

      {!row.isGroup && expanded[row.key] && (
        <DebtTermsDetail debt={row.debt} colSpan={8} onSave={saveTerms} />
      )}

      {row.isGroup && expanded[row.name] && row.members.map(m => (
        <tr key={m.id} className="budget-row debt-group-member-row">
          <td className="budget-td cat debt-group-member-name">{m.name}</td>
          <td className="budget-td num">
            <PayoffCell debt={m} editCell={editCell} setEditCell={setEditCell} editVal={editVal}
              setEditVal={setEditVal} saveField={saveField} saveSettlement={saveSettlement} />
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
  )
}

function DebtSnowballTab({ userId }) {
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', total_payoff: '', minimum_payment: '', group_name: '', owner: '', goal_months: '', rate_index: '', rate_margin: '', draw_end_date: '', maturity_date: '', notes: '' })
  const [showTerms, setShowTerms] = useState(false)
  const [editCell, setEditCell] = useState(null) // { id, field }
  const [editVal, setEditVal] = useState('')
  const [expanded, setExpanded] = useState({}) // { [groupName | debtId]: bool }

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
      rate_index: form.rate_index.trim() || null,
      rate_margin: form.rate_margin.trim() === '' ? null : parseFloat(form.rate_margin) || 0,
      draw_end_date: form.draw_end_date || null,
      maturity_date: form.maturity_date || null,
      notes: form.notes.trim() || null,
    }
    const { data } = await supabase.from('debts').insert(payload).select().single()
    if (data) setDebts(d => [...d, data])
    setForm({ name: '', total_payoff: '', minimum_payment: '', group_name: '', owner: '', goal_months: '', rate_index: '', rate_margin: '', draw_end_date: '', maturity_date: '', notes: '' })
    setShowTerms(false)
    setShowForm(false)
  }

  async function saveField(debt, field, value) {
    const val = parseFloat(value) || 0
    await supabase.from('debts').update({ [field]: val }).eq('id', debt.id)
    setDebts(d => d.map(x => x.id === debt.id ? { ...x, [field]: val } : x))
    setEditCell(null)
  }

  // Settlement amount is nullable — an empty value clears it back to "pending"
  // (original balance drives the snowball again). Distinct from saveField, which
  // coerces blanks to 0.
  async function saveSettlement(debt, value) {
    const raw = String(value ?? '').trim()
    const val = raw === '' ? null : (parseFloat(raw) || 0)
    await supabase.from('debts').update({ settlement_amount: val }).eq('id', debt.id)
    setDebts(d => d.map(x => x.id === debt.id ? { ...x, settlement_amount: val } : x))
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

  async function saveTerms(id, fields) {
    await supabase.from('debts').update(fields).eq('id', id)
    setDebts(d => d.map(x => x.id === id ? { ...x, ...fields } : x))
  }

  async function deleteDebt(id) {
    await supabase.from('debts').delete().eq('id', id)
    setDebts(d => d.filter(x => x.id !== id))
  }

  function toggleExpand(groupName) {
    setExpanded(e => ({ ...e, [groupName]: !e[groupName] }))
  }

  // The mortgage sits outside the snowball attack order (Ramsey's Baby Step 6)
  const mortgageDebts = debts.filter(isMortgageDebt)
  const snowballDebts = debts.filter(d => !isMortgageDebt(d))

  const sorted = buildSnowballRows(snowballDebts)

  let running = 0
  const withPayment = sorted.map(row => {
    running += row.minimum_payment
    return { ...row, newPayment: running }
  })

  const { monthsPaidOff, totalMonths } = simulateSnowball(sorted)
  const rows = withPayment.map((row, i) => ({ ...row, monthsToPayoff: monthsPaidOff[i] }))
  const overallMonths = rows.length > 0 ? monthsPaidOff[monthsPaidOff.length - 1] : null

  // The mortgage doesn't share the snowball's rolling payment — it just rides on
  // its own minimum (with interest) until every non-mortgage debt above is gone.
  const mortgageRows = buildSnowballRows(mortgageDebts).map(row => {
    const { monthsPaidOff: mp } = simulateSnowball([row])
    return { ...row, newPayment: row.minimum_payment, monthsToPayoff: mp[0] }
  })

  const totalPayoff = debts.reduce((s, d) => s + effectivePayoff(d), 0)
  const totalMinimum = debts.reduce((s, d) => s + Number(d.minimum_payment), 0)

  return (
    <div className="budget-wrap">
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">Debt Snowball</h2>
          <span className="fin-toolbar-label">
            Smallest balance first, excl. mortgage — snowball order
            {rows.length > 0 && (
              <span className="debt-payoff-caveat">
                {' '}· {overallMonths != null ? `~${overallMonths} mo to debt-free` : '100+ years to debt-free'} at current minimums, incl. interest (mortgage tackled separately after)
              </span>
            )}
          </span>
        </div>
        <button className="fin-add-btn" onClick={() => setShowForm(s => !s)}>+ Add Debt</button>
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
          <span className="budget-summary-lbl">Debt-Free By (excl. mortgage)</span>
          <span className="budget-summary-val">{rows.length > 0 ? payoffLabel(overallMonths) : '—'}</span>
        </div>
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
          <button type="button" className="debt-terms-toggle debt-terms-toggle--form" onClick={() => setShowTerms(s => !s)}>
            {showTerms ? '▾ Loan terms' : '▸ Loan terms (optional — rate index, interest-only draw, maturity)'}
          </button>
          {showTerms && (
            <div className="debt-terms-grid debt-terms-grid--form">
              <label className="debt-terms-field">
                <span>Rate index</span>
                <input className="fin-input" placeholder="e.g. WSJ Prime" value={form.rate_index}
                  onChange={e => setForm(f => ({ ...f, rate_index: e.target.value }))} />
              </label>
              <label className="debt-terms-field">
                <span>Margin (%)</span>
                <input className="fin-input" type="number" step="0.001" placeholder="e.g. 2.5" value={form.rate_margin}
                  onChange={e => setForm(f => ({ ...f, rate_margin: e.target.value }))} />
              </label>
              <label className="debt-terms-field">
                <span>Interest-only draw ends</span>
                <input className="fin-input" type="date" value={form.draw_end_date}
                  onChange={e => setForm(f => ({ ...f, draw_end_date: e.target.value }))} />
              </label>
              <label className="debt-terms-field">
                <span>Maturity date</span>
                <input className="fin-input" type="date" value={form.maturity_date}
                  onChange={e => setForm(f => ({ ...f, maturity_date: e.target.value }))} />
              </label>
              <label className="debt-terms-field debt-terms-notes-field">
                <span>Notes</span>
                <textarea className="fin-input" rows={2} placeholder="Anything else about the terms…" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </label>
            </div>
          )}
          <div className="fin-form-actions">
            <button type="button" className="fin-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="fin-save">Save</button>
          </div>
        </form>
      )}

      <div className="budget-table-wrap">
        {!loading && rows.length === 0 && mortgageRows.length === 0 && <p className="fin-empty">No debts added yet.</p>}
        {(rows.length > 0 || mortgageRows.length > 0) && (
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
                <DebtSnowballRow key={row.key} row={row} editCell={editCell} setEditCell={setEditCell}
                  editVal={editVal} setEditVal={setEditVal} saveField={saveField} saveSettlement={saveSettlement} saveOwner={saveOwner}
                  saveGoal={saveGoal} saveTerms={saveTerms} deleteDebt={deleteDebt} expanded={expanded} toggleExpand={toggleExpand} />
              ))}
              {mortgageRows.length > 0 && (
                <tr className="budget-row debt-section-divider">
                  <td className="budget-td cat" colSpan={8}>Mortgage — Baby Step 6, tackled after the debts above are paid off</td>
                </tr>
              )}
              {mortgageRows.map(row => (
                <DebtSnowballRow key={row.key} row={row} editCell={editCell} setEditCell={setEditCell}
                  editVal={editVal} setEditVal={setEditVal} saveField={saveField} saveSettlement={saveSettlement} saveOwner={saveOwner}
                  saveGoal={saveGoal} saveTerms={saveTerms} deleteDebt={deleteDebt} expanded={expanded} toggleExpand={toggleExpand} />
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

// ─── Laundry Tracker ────────────────────────────────────────────────────────

const MACHINE_TYPES = [
  { key: 'top_load', label: 'Top Load Washer', costPerLoad: 1.75, defaultMinutes: 45, type: 'wash' },
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
    minutes: 45,
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
    setForm({ session_date: new Date().toISOString().split('T')[0], type: 'wash', machine_type: 'top_load', loads: 1, quarters: 7, minutes: 45, notes: '' })
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
        <div className="budget-header-titles">
          <h2 className="budget-title">Laundry Tracker</h2>
          <span className="fin-toolbar-label">Log a wash or dry cycle</span>
          <span className="laundry-note">
            Top Load: $1.75 (7 quarters) · Front Load: $2.00 (8 quarters) · Dryer: $1.75 for 45 min base (7 quarters), +1 quarter = +6 min
          </span>
        </div>
        <button className="fin-add-btn" onClick={() => setShowForm(s => !s)}>+ Log Load</button>
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

const CHECKBOX_LINE = /^(\s*)(☐|☑)(.*)$/

function NoteBody({ text, onToggleLine }) {
  const lines = text.split('\n')
  return (
    <div className="interaction-disc-text">
      {lines.map((line, i) => {
        const match = line.match(CHECKBOX_LINE)
        if (match) {
          const [, indent, mark, rest] = match
          const checked = mark === '☑'
          return (
            <label key={i} className="fin-note-checkbox-row" style={{ paddingLeft: indent.length * 6 }}>
              <input type="checkbox" checked={checked} onChange={() => onToggleLine(i)} />
              <span className={checked ? 'fin-note-checked' : ''}>{rest.replace(/^\s/, '')}</span>
            </label>
          )
        }
        return <div key={i} className="fin-note-line">{line || ' '}</div>
      })}
    </div>
  )
}

function FinNoteGroup({ note: n, onDelete, onUpdate }) {
  const [collapsed, setCollapsed] = useState(true)
  const snippet = n.note.length > 60 ? n.note.slice(0, 60).trim() + '…' : n.note
  const title = n.topic || snippet

  async function toggleLine(idx) {
    const lines = n.note.split('\n')
    const line = lines[idx]
    lines[idx] = line.includes('☐') ? line.replace('☐', '☑') : line.replace('☑', '☐')
    const newText = lines.join('\n')
    onUpdate?.(n.id, newText)
    await supabase.from('financial_notes').update({ note: newText }).eq('id', n.id)
  }

  return (
    <div className={`interaction-group${collapsed ? '' : ' expanded'}`}>
      <div className="interaction-group-header" style={{ cursor: 'pointer' }} onClick={() => setCollapsed(c => !c)}>
        <span className="interaction-group-name">{title}</span>
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
              <button className="interaction-delete-btn" title="Delete" onClick={() => onDelete?.(n.id)}>✕</button>
            </div>
            {n.source && <p className="interaction-who-text">Source: {n.source}</p>}
            <NoteBody text={n.note} onToggleLine={toggleLine} />
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

  function updateNoteText(id, newText) {
    setNotes(ns => ns.map(x => (x.id === id ? { ...x, note: newText } : x)))
  }

  return (
    <div className="fin-content">
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">Financial Notes</h2>
          <span className="fin-toolbar-label">Dated notes, reminders, account details</span>
        </div>
        <button className="fin-add-btn" onClick={() => setShowAdd(true)}>+ Add Note</button>
      </div>
      <div className="csea-panel">
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
            <FinNoteGroup key={n.id} note={n} onDelete={deleteNote} onUpdate={updateNoteText} />
          ))}
        </div>
      </div>
    </div>
  )
}
