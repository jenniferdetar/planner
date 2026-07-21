import { useState, useEffect, useMemo, Fragment } from 'react'
import { supabase } from '../lib/supabase'

const SECTIONS = {
  income: { label: 'Income', key: 'income' },
  bill: { label: 'Bills', key: 'bill' },
  expense: { label: 'Expenses', key: 'expense' },
  savings: { label: 'Savings', key: 'savings' },
  debt: { label: 'Debt', key: 'debt' },
}
const SECTION_ORDER = ['income', 'bill', 'expense', 'savings', 'debt']
const REFERENCE_SECTIONS = ['bill', 'expense', 'savings', 'debt']
const REFERENCE_LOCK_PASSWORD = 'Ble$$ed1'

const STARTER_PRESETS = [
  { section: 'bill', name: 'ADT', default_amount: 50 },
  { section: 'bill', name: 'Apple Music', default_amount: 13 },
  { section: 'bill', name: 'Auto Insurance', default_amount: 417 },
  { section: 'bill', name: 'Cleaning Lady', default_amount: 200 },
  { section: 'bill', name: 'Department of Water & Power', default_amount: 50 },
  { section: 'bill', name: 'Home Owners Association', default_amount: 380 },
  { section: 'bill', name: 'Laundry', default_amount: 80 },
  { section: 'bill', name: 'Mortgage/Rent', default_amount: null },
  { section: 'bill', name: 'Registration', default_amount: 500 },
  { section: 'bill', name: 'Spectrum', default_amount: 120 },
  { section: 'bill', name: 'Verizon', default_amount: null },
  { section: 'expense', name: 'Auto Maintenance', default_amount: null },
  { section: 'expense', name: 'Clothing', default_amount: null },
  { section: 'expense', name: 'Gas', default_amount: 300 },
  { section: 'expense', name: 'Groceries', default_amount: 300 },
  { section: 'expense', name: 'Hair', default_amount: null },
  { section: 'expense', name: 'Manicure/Pedicure', default_amount: null },
  { section: 'expense', name: 'Tithe', default_amount: null },
  { section: 'expense', name: 'Travel', default_amount: null },
  { section: 'savings', name: 'Health Savings Account', default_amount: null },
  { section: 'savings', name: 'Savings - House', default_amount: null },
  { section: 'savings', name: 'Savings - Other', default_amount: null },
  { section: 'savings', name: 'Vacation', default_amount: null },
  { section: 'debt', name: 'Auto Payment', default_amount: 463 },
  { section: 'debt', name: 'Home Equity Line of Credit', default_amount: null },
  { section: 'debt', name: 'Credit Card 1', default_amount: null },
  { section: 'debt', name: 'Credit Card 2', default_amount: null },
]

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 })

function dateLabel(value) {
  if (!value) return '—'
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// Conservative budgeting convention: round money going out up (never
// under-budget an expense), and money coming in down (never over-count income).
function roundForSection(value, section) {
  const n = Number(value)
  if (value === '' || value === null || value === undefined || Number.isNaN(n)) return 0
  return section === 'income' ? Math.floor(n) : Math.ceil(n)
}

// ─── Period Card ──────────────────────────────────────────────────────────

function PeriodCard({ period, totals, onOpen, onDelete }) {
  const remaining = totals.income - totals.outflow
  return (
    <div className="goal-card" style={{ '--card-color': '#3164a0' }} onClick={onOpen} role="button" tabIndex={0}>
      <div className="goal-card-top" style={{ background: '#3164a0' }} />
      <button className="fin-bill-card-delete" onClick={(e) => { e.stopPropagation(); onDelete(period.id) }}>✕</button>
      <div className="goal-card-name">{period.label || 'Pay Period'}</div>
      <div className="goal-card-body">
        <span style={{ fontSize: 11, color: '#aaa' }}>{dateLabel(period.start_date)} – {dateLabel(period.end_date)}</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888' }}>
          <span>Income <strong style={{ color: '#41a700' }}>{fmt(totals.income)}</strong></span>
          <span>Spent <strong style={{ color: '#1e3070' }}>{fmt(totals.outflow)}</strong></span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: remaining < 0 ? '#cc0000' : '#41a700' }}>
          {fmt(remaining)} remaining
        </div>
      </div>
    </div>
  )
}

// ─── Periods List ─────────────────────────────────────────────────────────

function PeriodsList({ periods, entriesByPeriod, itemsById, onOpen, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [startDate, setStartDate] = useState(todayStr())
  const [endDate, setEndDate] = useState(addDays(todayStr(), 14))
  const [saving, setSaving] = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    const period = await onAdd({ label: label.trim() || null, start_date: startDate, end_date: endDate })
    setSaving(false)
    setLabel('')
    setShowForm(false)
    if (period) onOpen(period.id)
  }

  function totalsFor(periodId) {
    const entries = entriesByPeriod[periodId] || []
    let income = 0, outflow = 0
    entries.forEach((e) => {
      const item = itemsById[e.line_item_id]
      if (!item) return
      if (item.section === 'income') income += Number(e.amount) || 0
      else outflow += Number(e.amount) || 0
    })
    return { income, outflow }
  }

  const overall = periods.reduce((acc, p) => {
    const t = totalsFor(p.id)
    acc.income += t.income
    acc.outflow += t.outflow
    return acc
  }, { income: 0, outflow: 0 })

  return (
    <div className="fin-content">
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">Pay Periods</h2>
          <span className="fin-toolbar-label">Every paycheck gets its own budget</span>
        </div>
        <button className="fin-add-btn" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ New Pay Period'}</button>
      </div>

      {periods.length > 0 && (
        <div className="budget-summary-bar">
          <div className="budget-summary-item">
            <span className="budget-summary-lbl">Actual Income</span>
            <span className="budget-summary-val income">{fmt(overall.income)}</span>
          </div>
          <div className="budget-summary-item">
            <span className="budget-summary-lbl">Actual Spent</span>
            <span className="budget-summary-val expense">{fmt(overall.outflow)}</span>
          </div>
          <div className="budget-summary-item">
            <span className="budget-summary-lbl">Net Remaining</span>
            <span className="budget-summary-val" style={{ color: overall.income - overall.outflow < 0 ? '#cc0000' : '#41a700' }}>
              {fmt(overall.income - overall.outflow)}
            </span>
          </div>
        </div>
      )}

      {showForm && (
        <form className="fin-form" onSubmit={handleCreate}>
          <input className="fin-input" placeholder="Label (optional, e.g. July 1–15 paycheck)" value={label}
            onChange={(e) => setLabel(e.target.value)} autoFocus />
          <div className="fin-form-row">
            <input className="fin-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            <input className="fin-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </div>
          <div className="fin-form-actions">
            <button type="button" className="fin-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="fin-save" disabled={saving}>{saving ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      )}

      {periods.length === 0 ? (
        <p className="fin-empty">No pay periods yet. Create your first one to start budgeting.</p>
      ) : (
        <div className="fin-goals-grid">
          {periods.map((p) => (
            <PeriodCard key={p.id} period={p} totals={totalsFor(p.id)} onOpen={() => onOpen(p.id)} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Line item section (Income/Bills/Expenses/Savings/Debt) ────────────────

function LineItemSection({ title, section, items, referenceOptions, showDueDate, dueDateLabel, showPaid, showSinkingFund, manualBudget, computeBudget, computeActual, onAdd, onUpdate, onDelete }) {
  const [name, setName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [adding, setAdding] = useState(false)

  const budgetTotal = items.reduce((s, i) => s + computeBudget(i), 0)
  const actualTotal = items.reduce((s, i) => s + computeActual(i), 0)

  function handlePickReference(value) {
    setName(value)
    if (manualBudget) return
    const match = (referenceOptions || []).find((r) => r.name === value)
    if (match && match.default_amount != null) setBudgetAmount(String(match.default_amount))
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    setAdding(true)
    await onAdd({
      name: name.trim(),
      due_date: showDueDate && dueDate ? dueDate : null,
      budget_amount: budgetAmount ? roundForSection(budgetAmount, section) : 0,
    })
    setName('')
    setDueDate('')
    setBudgetAmount('')
    setAdding(false)
  }

  const datalistId = `refs-${section}`

  return (
    <div className="budget-wrap" style={{ flex: '1 1 340px', minWidth: 320 }}>
      <div className="budget-header">
        <h2 className="budget-title">{title}</h2>
      </div>
      <div className="budget-table-wrap">
        <table className="budget-table">
          <thead>
            <tr>
              <th className="budget-th cat">Item</th>
              {showDueDate && <th className="budget-th">{dueDateLabel}</th>}
              {showSinkingFund && <th className="budget-th">Sinking Fund</th>}
              <th className="budget-th">Budget</th>
              <th className="budget-th">Actual</th>
              {showPaid && <th className="budget-th">Paid</th>}
              <th className="budget-th del-col"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="budget-row">
                <td className="budget-td cat">{item.name}</td>
                {showDueDate && <td className="budget-td num">{dateLabel(item.due_date)}</td>}
                {showSinkingFund && (
                  <td className="budget-td num">
                    <input type="checkbox" checked={!!item.is_sinking_fund} onChange={(e) => onUpdate(item.id, { is_sinking_fund: e.target.checked })} />
                  </td>
                )}
                <td className="budget-td num">{fmt(computeBudget(item))}</td>
                <td className="budget-td num">{fmt(computeActual(item))}</td>
                {showPaid && (
                  <td className="budget-td num">
                    <input type="checkbox" checked={!!item.is_paid} onChange={(e) => onUpdate(item.id, { is_paid: e.target.checked })} />
                  </td>
                )}
                <td className="budget-td del-col">
                  <span className="budget-del" onClick={() => onDelete(item.id)}>✕</span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr className="budget-row"><td className="budget-td" colSpan={6}><span className="budget-empty">No items yet</span></td></tr>
            )}
          </tbody>
          <tfoot>
            <tr className="budget-net-row">
              <td className="budget-td cat">Total</td>
              {showDueDate && <td></td>}
              {showSinkingFund && <td></td>}
              <td className="budget-td num net-val">{fmt(budgetTotal)}</td>
              <td className="budget-td num net-val">{fmt(actualTotal)}</td>
              {showPaid && <td></td>}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <form className="fin-form" onSubmit={handleAdd}>
        <input list={datalistId} className="fin-input" placeholder={`Add ${title.toLowerCase()} item…`} value={name}
          onChange={(e) => handlePickReference(e.target.value)} />
        <datalist id={datalistId}>
          {(referenceOptions || []).map((r) => <option key={r.id} value={r.name} />)}
        </datalist>
        <div className="fin-form-row">
          {showDueDate && <input className="fin-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />}
          <input className="fin-input amount" type="number" step="0.01" placeholder={manualBudget ? 'Budget' : 'From References'}
            value={budgetAmount} readOnly={!manualBudget}
            title={manualBudget ? undefined : "Budget comes from the matching Reference preset"}
            onChange={(e) => manualBudget && setBudgetAmount(e.target.value)} />
        </div>
        <div className="fin-form-actions">
          <button type="submit" className="fin-save" disabled={adding}>{adding ? '…' : 'Add'}</button>
        </div>
      </form>
    </div>
  )
}

// ─── Transaction Tracker ────────────────────────────────────────────────────

function TransactionTracker({ entries, lineItems, onAdd, onDelete }) {
  const [entryDate, setEntryDate] = useState(todayStr())
  const [lineItemId, setLineItemId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!lineItemId && lineItems.length > 0) setLineItemId(lineItems[0].id)
  }, [lineItems, lineItemId])

  const itemsById = useMemo(() => Object.fromEntries(lineItems.map((i) => [i.id, i])), [lineItems])
  const total = entries.reduce((s, e) => s + (Number(e.amount) || 0), 0)

  const itemsBySection = SECTION_ORDER.map((section) => ({
    section,
    items: lineItems.filter((i) => i.section === section),
  })).filter((g) => g.items.length > 0)

  async function handleAdd(e) {
    e.preventDefault()
    if (!lineItemId || !amount) return
    setAdding(true)
    const section = itemsById[lineItemId]?.section
    await onAdd({ entry_date: entryDate, line_item_id: lineItemId, amount: roundForSection(amount, section), description })
    setAmount('')
    setDescription('')
    setAdding(false)
  }

  return (
    <div className="budget-wrap" style={{ marginTop: 12 }}>
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">Transaction Tracker</h2>
          <span className="fin-toolbar-label">The only place to log what actually happened</span>
        </div>
      </div>

      {lineItems.length === 0 ? (
        <p className="fin-empty">Add income, bills, expenses, savings, or debt above before logging transactions.</p>
      ) : (
        <>
          <form className="fin-form" onSubmit={handleAdd}>
            <div className="fin-form-row">
              <input className="fin-input" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
              <select className="fin-input" value={lineItemId} onChange={(e) => setLineItemId(e.target.value)}>
                {itemsBySection.map((group) => (
                  <optgroup key={group.section} label={SECTIONS[group.section].label}>
                    {group.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="fin-form-row">
              <input className="fin-input amount" type="number" step="0.01" placeholder="Amount" value={amount}
                onChange={(e) => setAmount(e.target.value)} required />
              <input className="fin-input" type="text" placeholder="Description (optional)" value={description}
                onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="fin-form-actions">
              <button type="submit" className="fin-save" disabled={adding}>{adding ? '…' : 'Log'}</button>
            </div>
          </form>

          <div className="budget-table-wrap">
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
                {entries.map((entry) => {
                  const item = itemsById[entry.line_item_id]
                  return (
                    <tr key={entry.id} className="budget-row">
                      <td className="budget-td num">{dateLabel(entry.entry_date)}</td>
                      <td className="budget-td cat">{item?.name || '—'}{item && <span style={{ color: '#aaa', fontSize: 11 }}> ({SECTIONS[item.section].label})</span>}</td>
                      <td className="budget-td cat">{entry.description}</td>
                      <td className="budget-td num">{fmt(entry.amount)}</td>
                      <td className="budget-td del-col"><span className="budget-del" onClick={() => onDelete(entry.id)}>✕</span></td>
                    </tr>
                  )
                })}
                {entries.length === 0 && (
                  <tr className="budget-row"><td className="budget-td" colSpan={5}><span className="budget-empty">No transactions logged yet</span></td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="budget-net-row">
                  <td className="budget-td cat" colSpan={3}>Total</td>
                  <td className="budget-td num net-val">{fmt(total)}</td>
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

// ─── Pay Period Detail ──────────────────────────────────────────────────────

function PayPeriodDetail({ userId, period, references, onBack, onUpdatePeriod }) {
  const [items, setItems] = useState([])
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [itemsRes, entriesRes] = await Promise.all([
          supabase.from('pay_period_line_items').select('*').eq('pay_period_id', period.id).order('name'),
          supabase.from('pay_period_expense_entries').select('*').eq('pay_period_id', period.id).order('entry_date', { ascending: false }),
        ])
        if (cancelled) return
        setItems(itemsRes.data || [])
        setEntries(entriesRes.data || [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [period.id])

  const bySection = useMemo(() => {
    const groups = { income: [], bill: [], expense: [], savings: [], debt: [] }
    items.forEach((i) => groups[i.section]?.push(i))
    return groups
  }, [items])

  const referencesBySection = useMemo(() => {
    const groups = { bill: [], expense: [], savings: [], debt: [] }
    references.forEach((r) => groups[r.section]?.push(r))
    return groups
  }, [references])

  const referenceAmountByKey = useMemo(() => {
    const map = {}
    references.forEach((r) => { if (r.default_amount != null) map[`${r.section}:${r.name}`] = Number(r.default_amount) })
    return map
  }, [references])

  function computeBudget(item) {
    const live = referenceAmountByKey[`${item.section}:${item.name}`]
    return live != null ? live : Number(item.budget_amount) || 0
  }

  function computeActual(item) {
    return entries.filter((e) => e.line_item_id === item.id).reduce((s, e) => s + (Number(e.amount) || 0), 0)
  }

  async function refreshItems() {
    const { data } = await supabase.from('pay_period_line_items').select('*').eq('pay_period_id', period.id).order('name')
    setItems(data || [])
  }

  async function handleAdd(section, fields) {
    await supabase.from('pay_period_line_items').insert({ pay_period_id: period.id, user_id: userId, section, ...fields })
    await refreshItems()
  }

  async function handleUpdate(id, fields) {
    await supabase.from('pay_period_line_items').update(fields).eq('id', id)
    await refreshItems()
  }

  async function handleDelete(id) {
    await supabase.from('pay_period_line_items').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
    setEntries((prev) => prev.filter((e) => e.line_item_id !== id))
  }

  async function handleAddEntry(fields) {
    const { data } = await supabase.from('pay_period_expense_entries').insert({ pay_period_id: period.id, user_id: userId, ...fields }).select().single()
    if (data) setEntries((prev) => [data, ...prev])
  }

  async function handleDeleteEntry(id) {
    await supabase.from('pay_period_expense_entries').delete().eq('id', id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  async function handleDatesChange(field, value) {
    await onUpdatePeriod(period.id, { [field]: value })
  }

  if (loading) return <div className="fin-content"><p className="fin-empty">Loading pay period…</p></div>

  const totals = {}
  for (const s of SECTION_ORDER) {
    totals[s] = {
      budget: bySection[s].reduce((a, i) => a + computeBudget(i), 0),
      actual: bySection[s].reduce((a, i) => a + computeActual(i), 0),
    }
  }
  const remainingBudget = totals.income.budget - (totals.bill.budget + totals.expense.budget + totals.savings.budget + totals.debt.budget)
  const remainingActual = totals.income.actual - (totals.bill.actual + totals.expense.actual + totals.savings.actual + totals.debt.actual)

  return (
    <div className="fin-content">
      <div className="budget-header">
        <div className="budget-header-titles">
          <button className="fin-cancel" onClick={onBack}>← All pay periods</button>
          <h2 className="budget-title">{period.label || 'Pay Period'}</h2>
        </div>
      </div>

      <div className="fin-form" style={{ margin: '10px 10px 0' }}>
        <div className="fin-form-row">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}>
            For the period:
            <input className="fin-input" type="date" value={period.start_date} onChange={(e) => handleDatesChange('start_date', e.target.value)} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}>
            to
            <input className="fin-input" type="date" value={period.end_date} onChange={(e) => handleDatesChange('end_date', e.target.value)} />
          </label>
        </div>
      </div>

      <div className="budget-summary-bar">
        <div className="budget-summary-item">
          <span className="budget-summary-lbl">Remaining (Budget)</span>
          <span className="budget-summary-val" style={{ color: remainingBudget < 0 ? '#cc0000' : '#41a700' }}>{fmt(remainingBudget)}</span>
        </div>
        <div className="budget-summary-item">
          <span className="budget-summary-lbl">Remaining (Actual)</span>
          <span className="budget-summary-val" style={{ color: remainingActual < 0 ? '#cc0000' : '#41a700' }}>{fmt(remainingActual)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 10 }}>
        <LineItemSection title="Income" section="income" items={bySection.income} showDueDate dueDateLabel="Date" manualBudget
          computeBudget={computeBudget} computeActual={computeActual}
          onAdd={(fields) => handleAdd('income', fields)} onUpdate={handleUpdate} onDelete={handleDelete} />

        <LineItemSection title="Bills" section="bill" items={bySection.bill} referenceOptions={referencesBySection.bill}
          showDueDate dueDateLabel="Due date" showPaid
          computeBudget={computeBudget} computeActual={computeActual}
          onAdd={(fields) => handleAdd('bill', fields)} onUpdate={handleUpdate} onDelete={handleDelete} />

        <LineItemSection title="Expenses" section="expense" items={bySection.expense} referenceOptions={referencesBySection.expense}
          computeBudget={computeBudget} computeActual={computeActual}
          onAdd={(fields) => handleAdd('expense', fields)} onUpdate={handleUpdate} onDelete={handleDelete} />

        <LineItemSection title="Savings" section="savings" items={bySection.savings} referenceOptions={referencesBySection.savings} showSinkingFund
          computeBudget={computeBudget} computeActual={computeActual}
          onAdd={(fields) => handleAdd('savings', fields)} onUpdate={handleUpdate} onDelete={handleDelete} />

        <LineItemSection title="Debt" section="debt" items={bySection.debt} referenceOptions={referencesBySection.debt}
          computeBudget={computeBudget} computeActual={computeActual}
          onAdd={(fields) => handleAdd('debt', fields)} onUpdate={handleUpdate} onDelete={handleDelete} />
      </div>

      <TransactionTracker entries={entries} lineItems={items} onAdd={handleAddEntry} onDelete={handleDeleteEntry} />
    </div>
  )
}

// ─── References Manager ─────────────────────────────────────────────────────

function ReferencesManager({ references, onAdd, onUpdate, onDelete, onSeedStarters }) {
  const [drafts, setDrafts] = useState(Object.fromEntries(REFERENCE_SECTIONS.map((s) => [s, { name: '', amount: '' }])))
  const [unlocked, setUnlocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [unlockError, setUnlockError] = useState('')
  const [seeding, setSeeding] = useState(false)

  function handleUnlock(e) {
    e.preventDefault()
    if (passwordInput === REFERENCE_LOCK_PASSWORD) {
      setUnlocked(true)
      setPasswordInput('')
      setUnlockError('')
    } else {
      setUnlockError('Incorrect password.')
    }
  }

  async function handleAdd(section, e) {
    e.preventDefault()
    if (!unlocked) return
    const draft = drafts[section]
    if (!draft.name.trim()) return
    await onAdd({ section, name: draft.name.trim(), default_amount: draft.amount === '' ? null : Math.ceil(Number(draft.amount)) })
    setDrafts((d) => ({ ...d, [section]: { name: '', amount: '' } }))
  }

  async function handleSeed() {
    setSeeding(true)
    await onSeedStarters()
    setSeeding(false)
  }

  return (
    <div className="fin-content">
      <div className="budget-header">
        <div className="budget-header-titles">
          <h2 className="budget-title">References</h2>
          <span className="fin-toolbar-label">Presets for recurring bills, expenses, savings, and debts</span>
        </div>
        {unlocked && <button className="fin-add-btn" onClick={() => setUnlocked(false)}>🔓 Unlocked — Lock</button>}
      </div>

      {!unlocked && (
        <form className="fin-form" onSubmit={handleUnlock}>
          <label style={{ fontSize: 12, color: '#888' }}>🔒 Enter password to change budgeted amounts</label>
          <input className="fin-input" type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} autoComplete="off" />
          {unlockError && <span style={{ color: '#cc0000', fontSize: 12 }}>{unlockError}</span>}
          <div className="fin-form-actions">
            <button type="submit" className="fin-save">Unlock</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 10 }}>
        {REFERENCE_SECTIONS.map((section) => {
          const sectionItems = references.filter((r) => r.section === section)
          const draft = drafts[section]
          return (
            <div key={section} className="budget-wrap" style={{ flex: '1 1 300px', minWidth: 280 }}>
              <div className="budget-header">
                <h2 className="budget-title">{SECTIONS[section].label}</h2>
              </div>
              <div className="budget-table-wrap">
                <table className="budget-table">
                  <thead>
                    <tr>
                      <th className="budget-th cat">Item</th>
                      <th className="budget-th">Default Amount</th>
                      {unlocked && <th className="budget-th del-col"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {sectionItems.map((item) => (
                      <tr key={item.id} className="budget-row">
                        <td className="budget-td cat">{item.name}</td>
                        <td className="budget-td num">
                          {unlocked ? (
                            <input className="budget-input" type="number" step="1" value={item.default_amount ?? ''}
                              onChange={(e) => onUpdate(item.id, { default_amount: e.target.value === '' ? null : Math.ceil(Number(e.target.value)) })} />
                          ) : (
                            item.default_amount != null ? fmt(item.default_amount) : <span className="budget-empty">—</span>
                          )}
                        </td>
                        {unlocked && <td className="budget-td del-col"><span className="budget-del" onClick={() => onDelete(item.id)}>✕</span></td>}
                      </tr>
                    ))}
                    {sectionItems.length === 0 && (
                      <tr className="budget-row"><td className="budget-td" colSpan={unlocked ? 3 : 2}><span className="budget-empty">No presets yet</span></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {unlocked && (
                <form className="fin-form" onSubmit={(e) => handleAdd(section, e)}>
                  <input className="fin-input" placeholder="Item name…" value={draft.name}
                    onChange={(e) => setDrafts((d) => ({ ...d, [section]: { ...d[section], name: e.target.value } }))} />
                  <input className="fin-input amount" type="number" step="1" placeholder="Default amount" value={draft.amount}
                    onChange={(e) => setDrafts((d) => ({ ...d, [section]: { ...d[section], amount: e.target.value } }))} />
                  <div className="fin-form-actions">
                    <button type="submit" className="fin-save">Add</button>
                  </div>
                </form>
              )}
            </div>
          )
        })}
      </div>

      {unlocked && references.length === 0 && (
        <div style={{ padding: '0 10px 10px' }}>
          <button className="fin-add-btn" onClick={handleSeed} disabled={seeding}>{seeding ? 'Loading…' : 'Load starter categories'}</button>
        </div>
      )}
    </div>
  )
}

// ─── Root ────────────────────────────────────────────────────────────────

export default function BudgetByPaycheck({ userId }) {
  const [view, setView] = useState('periods') // 'periods' | 'period' | 'references'
  const [periods, setPeriods] = useState([])
  const [references, setReferences] = useState([])
  const [entriesByPeriod, setEntriesByPeriod] = useState({})
  const [itemsById, setItemsById] = useState({})
  const [activePeriodId, setActivePeriodId] = useState(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!userId) return
    setLoading(true)
    try {
      const [periodsRes, refsRes, itemsRes, entriesRes] = await Promise.all([
        supabase.from('pay_periods').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
        supabase.from('budget_reference_items').select('*').eq('user_id', userId).order('section').order('name'),
        supabase.from('pay_period_line_items').select('id, section').eq('user_id', userId),
        supabase.from('pay_period_expense_entries').select('id, pay_period_id, line_item_id, amount').eq('user_id', userId),
      ])
      setPeriods(periodsRes.data || [])
      setReferences(refsRes.data || [])
      const byId = {}
      ;(itemsRes.data || []).forEach((i) => { byId[i.id] = i })
      setItemsById(byId)
      const byPeriod = {}
      ;(entriesRes.data || []).forEach((e) => {
        if (!byPeriod[e.pay_period_id]) byPeriod[e.pay_period_id] = []
        byPeriod[e.pay_period_id].push(e)
      })
      setEntriesByPeriod(byPeriod)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [userId])

  async function addPeriod(fields) {
    const { data, error } = await supabase.from('pay_periods').insert({ user_id: userId, ...fields }).select().single()
    if (error) { console.error(error); return null }
    setPeriods((prev) => [data, ...prev])
    return data
  }

  async function deletePeriod(id) {
    if (!window.confirm('Delete this pay period and all of its budget data? This cannot be undone.')) return
    await supabase.from('pay_periods').delete().eq('id', id)
    setPeriods((prev) => prev.filter((p) => p.id !== id))
  }

  async function updatePeriod(id, fields) {
    const { data } = await supabase.from('pay_periods').update(fields).eq('id', id).select().single()
    if (data) setPeriods((prev) => prev.map((p) => (p.id === id ? data : p)))
    return data
  }

  async function addReference(fields) {
    const { data, error } = await supabase.from('budget_reference_items').insert({ user_id: userId, ...fields }).select().single()
    if (error) { console.error(error); return }
    setReferences((prev) => [...prev, data])
  }

  async function updateReference(id, fields) {
    const { data } = await supabase.from('budget_reference_items').update(fields).eq('id', id).select().single()
    if (data) setReferences((prev) => prev.map((r) => (r.id === id ? data : r)))
  }

  async function deleteReference(id) {
    await supabase.from('budget_reference_items').delete().eq('id', id)
    setReferences((prev) => prev.filter((r) => r.id !== id))
  }

  async function seedStarterReferences() {
    const rows = STARTER_PRESETS.map((p) => ({ user_id: userId, ...p }))
    const { data, error } = await supabase.from('budget_reference_items').insert(rows).select()
    if (error) { console.error(error); return }
    setReferences((prev) => [...prev, ...(data || [])])
  }

  function openPeriod(id) {
    setActivePeriodId(id)
    setView('period')
  }

  if (loading) return <div className="fin-content"><p className="fin-empty">Loading budget…</p></div>

  const activePeriod = periods.find((p) => p.id === activePeriodId)

  return (
    <div className="budget-wrap">
      {view !== 'period' && (
        <div className="fin-tabs" style={{ height: 30 }}>
          <button className={`fin-tab ${view === 'periods' ? 'active' : ''}`} onClick={() => setView('periods')}>Pay Periods</button>
          <button className={`fin-tab ${view === 'references' ? 'active' : ''}`} onClick={() => setView('references')}>References</button>
        </div>
      )}

      {view === 'periods' && (
        <PeriodsList periods={periods} entriesByPeriod={entriesByPeriod} itemsById={itemsById}
          onOpen={openPeriod} onAdd={addPeriod} onDelete={deletePeriod} />
      )}

      {view === 'period' && activePeriod && (
        <PayPeriodDetail userId={userId} period={activePeriod} references={references}
          onBack={async () => { await refresh(); setView('periods') }} onUpdatePeriod={updatePeriod} />
      )}

      {view === 'references' && (
        <ReferencesManager references={references} onAdd={addReference} onUpdate={updateReference}
          onDelete={deleteReference} onSeedStarters={seedStarterReferences} />
      )}
    </div>
  )
}
