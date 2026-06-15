import { useState, useMemo } from 'react'
import { useZeroBasedBudget } from '../hooks/useZeroBasedBudget'
import './ZeroBasedBudget.css'

const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function getMonthLabel(month) {
  const [year, mon] = month.split('-').map(Number)
  const date = new Date(year, mon - 1, 1)
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

function prevMonth(month) {
  const [year, mon] = month.split('-').map(Number)
  if (mon === 1) return `${year - 1}-12`
  return `${year}-${String(mon - 1).padStart(2, '0')}`
}

function nextMonth(month) {
  const [year, mon] = month.split('-').map(Number)
  if (mon === 12) return `${year + 1}-01`
  return `${year}-${String(mon + 1).padStart(2, '0')}`
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// ─── PaycheckItem ────────────────────────────────────────────────────────────

function PaycheckItem({ paycheck, envelopes, allocations, onSaveAllocations, onDelete }) {
  const [open, setOpen] = useState(false)
  const [allocMap, setAllocMap] = useState({})
  const [saving, setSaving] = useState(false)

  // Allocations for THIS paycheck
  const myAllocs = allocations.filter(a => a.paycheck_id === paycheck.id)
  const assignedTotal = myAllocs.reduce((s, a) => s + Number(a.amount), 0)
  const unassigned = Number(paycheck.amount) - assignedTotal

  function openAssign() {
    // Seed allocMap from existing allocations
    const seed = {}
    myAllocs.forEach(a => { seed[a.envelope_id] = String(a.amount) })
    setAllocMap(seed)
    setOpen(true)
  }

  function closeAssign() { setOpen(false) }

  function handleAllocChange(envId, value) {
    setAllocMap(prev => ({ ...prev, [envId]: value }))
  }

  const draftAssigned = Object.values(allocMap).reduce((s, v) => s + (Number(v) || 0), 0)
  const draftLeft = Number(paycheck.amount) - draftAssigned
  const overAllocated = draftLeft < -0.005

  async function handleSave() {
    setSaving(true)
    await onSaveAllocations(paycheck.id, allocMap)
    setSaving(false)
    setOpen(false)
  }

  const dateLabel = paycheck.pay_date
    ? new Date(paycheck.pay_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '—'

  return (
    <div className="zbb-paycheck-item">
      <div className="zbb-paycheck-row">
        <div className="zbb-paycheck-info">
          <span className="zbb-paycheck-date">{dateLabel}</span>
          <span className="zbb-paycheck-amount">{fmt(paycheck.amount)}</span>
        </div>
        <div className="zbb-paycheck-status">
          <span className="zbb-paycheck-assigned">
            {fmt(assignedTotal)} assigned
          </span>
          <span className={`zbb-paycheck-unassigned ${unassigned < -0.005 ? 'over' : unassigned < 0.005 ? 'zero' : ''}`}>
            {fmt(Math.abs(unassigned))} {unassigned < -0.005 ? 'over' : unassigned < 0.005 ? '✓' : 'left'}
          </span>
        </div>
        <div className="zbb-paycheck-actions">
          <button className="zbb-btn-assign" onClick={open ? closeAssign : openAssign}>
            {open ? 'Cancel' : 'Assign'}
          </button>
          <button className="zbb-btn-delete-sm" onClick={() => onDelete(paycheck.id)} title="Delete paycheck">×</button>
        </div>
      </div>

      {open && (
        <div className="zbb-alloc-form">
          <div className="zbb-alloc-summary">
            <span>
              {fmt(draftAssigned)} assigned of {fmt(paycheck.amount)}
            </span>
            <span className={`zbb-alloc-left ${overAllocated ? 'over' : draftLeft < 0.005 ? 'zero' : ''}`}>
              {overAllocated
                ? `${fmt(Math.abs(draftLeft))} over budget`
                : draftLeft < 0.005
                  ? 'Fully allocated ✓'
                  : `${fmt(draftLeft)} left to assign`}
            </span>
          </div>

          {overAllocated && (
            <div className="zbb-alloc-warning">
              Over-allocated — reduce some envelopes before saving.
            </div>
          )}

          <div className="zbb-alloc-envelopes">
            {envelopes.map(env => (
              <div key={env.id} className="zbb-alloc-row">
                <label className="zbb-alloc-label">
                  <span className="zbb-alloc-section">{env.section}</span>
                  <span className="zbb-alloc-name">{env.name}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={allocMap[env.id] ?? ''}
                  onChange={e => handleAllocChange(env.id, e.target.value)}
                  className="zbb-alloc-input"
                />
              </div>
            ))}
          </div>

          <div className="zbb-alloc-actions">
            <button
              className="zbb-btn-save"
              onClick={handleSave}
              disabled={saving || overAllocated}
            >
              {saving ? 'Saving…' : 'Save Allocations'}
            </button>
            <button className="zbb-btn-cancel" onClick={closeAssign}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── EnvelopeRow ─────────────────────────────────────────────────────────────

function EnvelopeRow({ envelope, budgeted, spent, spending, onAddSpending, onDeleteSpending, onDeleteEnvelope }) {
  const [expanded, setExpanded] = useState(false)
  const [showSpendForm, setShowSpendForm] = useState(false)
  const [spendAmount, setSpendAmount] = useState('')
  const [spendDesc, setSpendDesc] = useState('')
  const [spendDate, setSpendDate] = useState(todayStr())
  const [submitting, setSubmitting] = useState(false)

  const remaining = budgeted - spent
  const pct = budgeted > 0 ? Math.min(100, (spent / budgeted) * 100) : 0
  const overSpent = remaining < -0.005

  const mySpending = spending.filter(s => s.envelope_id === envelope.id)
    .sort((a, b) => b.spent_date?.localeCompare(a.spent_date))

  async function handleAddSpending(e) {
    e.preventDefault()
    if (!spendAmount || Number(spendAmount) <= 0) return
    setSubmitting(true)
    await onAddSpending(envelope.id, spendAmount, spendDesc, spendDate)
    setSpendAmount('')
    setSpendDesc('')
    setSpendDate(todayStr())
    setSubmitting(false)
    setShowSpendForm(false)
  }

  return (
    <div className={`zbb-envelope-row-wrap ${expanded ? 'expanded' : ''}`}>
      <div className="zbb-envelope-row" onClick={() => setExpanded(e => !e)}>
        <div className="zbb-env-name">
          <span className="zbb-env-chevron">{expanded ? '▾' : '▸'}</span>
          {envelope.name}
        </div>
        <div className="zbb-env-budgeted">{budgeted > 0 ? fmt(budgeted) : <span className="zbb-env-zero">—</span>}</div>
        <div className="zbb-env-spent">{spent > 0 ? fmt(spent) : <span className="zbb-env-zero">—</span>}</div>
        <div className={`zbb-env-remaining ${overSpent ? 'over' : budgeted === 0 ? 'neutral' : 'ok'}`}>
          {budgeted > 0 || spent > 0 ? fmt(remaining) : <span className="zbb-env-zero">—</span>}
          {budgeted > 0 && (
            <div className="zbb-bar-track">
              <div
                className={`zbb-bar-fill ${overSpent ? 'over' : ''}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
        <div className="zbb-env-del" onClick={e => { e.stopPropagation(); onDeleteEnvelope(envelope.id) }} title="Delete envelope">
          ×
        </div>
      </div>

      {expanded && (
        <div className="zbb-spend-section">
          {mySpending.length === 0 && !showSpendForm && (
            <p className="zbb-spend-empty">No spending entries yet.</p>
          )}
          {mySpending.map(s => (
            <div key={s.id} className="zbb-spend-entry">
              <span className="zbb-spend-date">
                {new Date(s.spent_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="zbb-spend-desc">{s.description || <em>No description</em>}</span>
              <span className="zbb-spend-amt">{fmt(s.amount)}</span>
              <button
                className="zbb-spend-del"
                onClick={() => onDeleteSpending(s.id)}
                title="Delete entry"
              >×</button>
            </div>
          ))}

          {showSpendForm ? (
            <form className="zbb-spend-form" onSubmit={handleAddSpending}>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Amount"
                value={spendAmount}
                onChange={e => setSpendAmount(e.target.value)}
                className="zbb-spend-input amount"
                required
                autoFocus
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={spendDesc}
                onChange={e => setSpendDesc(e.target.value)}
                className="zbb-spend-input desc"
              />
              <input
                type="date"
                value={spendDate}
                onChange={e => setSpendDate(e.target.value)}
                className="zbb-spend-input date"
              />
              <button type="submit" className="zbb-btn-save sm" disabled={submitting}>
                {submitting ? '…' : 'Add'}
              </button>
              <button type="button" className="zbb-btn-cancel sm" onClick={() => setShowSpendForm(false)}>
                Cancel
              </button>
            </form>
          ) : (
            <button className="zbb-add-spend-btn" onClick={e => { e.stopPropagation(); setShowSpendForm(true) }}>
              + Add spending
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── EnvelopeSection ─────────────────────────────────────────────────────────

function EnvelopeSection({
  sectionName, envelopes, allocations, spending,
  onAddEnvelope, onDeleteEnvelope, onAddSpending, onDeleteSpending,
}) {
  const [showAddEnv, setShowAddEnv] = useState(false)
  const [newEnvName, setNewEnvName] = useState('')
  const [adding, setAdding] = useState(false)

  const sectionBudgeted = envelopes.reduce((s, e) => {
    return s + allocations.filter(a => a.envelope_id === e.id).reduce((x, a) => x + Number(a.amount), 0)
  }, 0)
  const sectionSpent = envelopes.reduce((s, e) => {
    return s + spending.filter(sp => sp.envelope_id === e.id).reduce((x, sp) => x + Number(sp.amount), 0)
  }, 0)

  async function handleAddEnvelope(e) {
    e.preventDefault()
    if (!newEnvName.trim()) return
    setAdding(true)
    await onAddEnvelope(newEnvName.trim(), sectionName)
    setNewEnvName('')
    setAdding(false)
    setShowAddEnv(false)
  }

  return (
    <div className="zbb-section">
      <div className="zbb-section-header">
        <span className="zbb-section-name">{sectionName}</span>
        <span className="zbb-section-totals">
          <span className="zbb-section-budgeted">{fmt(sectionBudgeted)}</span>
          <span className="zbb-section-spent">{fmt(sectionSpent)}</span>
          <span className={`zbb-section-remaining ${sectionBudgeted - sectionSpent < -0.005 ? 'over' : ''}`}>
            {fmt(sectionBudgeted - sectionSpent)}
          </span>
          <span className="zbb-section-del-spacer" />
        </span>
      </div>

      <div className="zbb-env-list">
        {envelopes.map(env => {
          const budgeted = allocations
            .filter(a => a.envelope_id === env.id)
            .reduce((s, a) => s + Number(a.amount), 0)
          const spent = spending
            .filter(s => s.envelope_id === env.id)
            .reduce((s, sp) => s + Number(sp.amount), 0)
          return (
            <EnvelopeRow
              key={env.id}
              envelope={env}
              budgeted={budgeted}
              spent={spent}
              spending={spending}
              onAddSpending={onAddSpending}
              onDeleteSpending={onDeleteSpending}
              onDeleteEnvelope={onDeleteEnvelope}
            />
          )
        })}
      </div>

      {showAddEnv ? (
        <form className="zbb-add-env-form" onSubmit={handleAddEnvelope}>
          <input
            type="text"
            placeholder="Envelope name"
            value={newEnvName}
            onChange={e => setNewEnvName(e.target.value)}
            className="zbb-add-env-input"
            autoFocus
          />
          <button type="submit" className="zbb-btn-save sm" disabled={adding}>
            {adding ? '…' : 'Add'}
          </button>
          <button type="button" className="zbb-btn-cancel sm" onClick={() => setShowAddEnv(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button className="zbb-add-env-btn" onClick={() => setShowAddEnv(true)}>
          + Add envelope
        </button>
      )}
    </div>
  )
}

// ─── ZeroBasedBudget (main) ───────────────────────────────────────────────────

function dueSuffix(day) {
  if (!day) return ''
  const d = Number(day)
  if (d >= 11 && d <= 13) return `${d}th`
  const s = ['th','st','nd','rd']
  const v = d % 10
  return `${d}${s[v] || 'th'}`
}

export default function ZeroBasedBudget({ userId, bills = [] }) {
  const today = new Date().toISOString().slice(0, 7)
  const [month, setMonth] = useState(today)
  const [showAddPaycheck, setShowAddPaycheck] = useState(false)
  const [pcDate, setPcDate] = useState(todayStr())
  const [pcAmount, setPcAmount] = useState('')
  const [addingPc, setAddingPc] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [addingSection, setAddingSection] = useState(false)

  const {
    paychecks, envelopes, allocations, spending, loading,
    addPaycheck, deletePaycheck,
    addEnvelope, deleteEnvelope, addSection,
    saveAllocations,
    addSpending, deleteSpending,
  } = useZeroBasedBudget(userId, month)

  // ── Derived summary numbers ──
  const totalIncome = paychecks.reduce((s, p) => s + Number(p.amount), 0)
  const totalAssigned = allocations.reduce((s, a) => s + Number(a.amount), 0)
  const totalUnassigned = totalIncome - totalAssigned

  // Group envelopes by section, preserving insertion order of sections
  const sections = useMemo(() => {
    const map = new Map()
    envelopes.forEach(env => {
      if (!map.has(env.section)) map.set(env.section, [])
      map.get(env.section).push(env)
    })
    return map
  }, [envelopes])

  // ── Add paycheck ──
  async function handleAddPaycheck(e) {
    e.preventDefault()
    if (!pcAmount || Number(pcAmount) <= 0) return
    setAddingPc(true)
    await addPaycheck(pcDate, pcAmount)
    setPcDate(todayStr())
    setPcAmount('')
    setAddingPc(false)
    setShowAddPaycheck(false)
  }

  // ── Add section ──
  async function handleAddSection(e) {
    e.preventDefault()
    if (!newSectionName.trim()) return
    setAddingSection(true)
    await addSection(newSectionName.trim())
    setNewSectionName('')
    setAddingSection(false)
    setShowAddSection(false)
  }

  if (loading) {
    return <div className="zbb-loading">Loading budget…</div>
  }

  const unassignedPositive = totalUnassigned > 0.005
  const unassignedZero = Math.abs(totalUnassigned) < 0.005

  return (
    <div className="zbb-root">
      {/* ── Header bar ── */}
      <div className="zbb-header">
        <div className="zbb-month-nav">
          <button className="zbb-nav-btn" onClick={() => setMonth(prevMonth(month))}>‹</button>
          <span className="zbb-month-label">{getMonthLabel(month)}</span>
          <button className="zbb-nav-btn" onClick={() => setMonth(nextMonth(month))}>›</button>
        </div>
        <div className="zbb-chips">
          <div className="zbb-chip">
            <span className="zbb-chip-label">Income</span>
            <span className="zbb-chip-value">{fmt(totalIncome)}</span>
          </div>
          <div className="zbb-chip">
            <span className="zbb-chip-label">Assigned</span>
            <span className="zbb-chip-value">{fmt(totalAssigned)}</span>
          </div>
          <div className={`zbb-chip ${unassignedPositive ? 'chip-red' : unassignedZero ? 'chip-green' : 'chip-over'}`}>
            <span className="zbb-chip-label">Unassigned</span>
            <span className="zbb-chip-value">{fmt(Math.abs(totalUnassigned))}</span>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="zbb-body">
        {/* ── Income panel ── */}
        <div className="zbb-income-panel">
          <div className="zbb-panel-heading">
            <span>Paychecks</span>
            <span className="zbb-panel-total">{fmt(totalIncome)}</span>
          </div>

          <div className="zbb-paycheck-list">
            {paychecks.length === 0 && (
              <p className="zbb-empty-msg">No paychecks this month.</p>
            )}
            {paychecks.map(pc => (
              <PaycheckItem
                key={pc.id}
                paycheck={pc}
                envelopes={envelopes}
                allocations={allocations}
                onSaveAllocations={saveAllocations}
                onDelete={deletePaycheck}
              />
            ))}
          </div>

          {/* ── Bills ── */}
          {bills.length > 0 && (
            <div className="zbb-bills-section">
              <div className="zbb-panel-heading sm">
                <span>Bills</span>
                <span className="zbb-panel-total">
                  {fmt(bills.reduce((s, b) => s + Number(b.amount), 0))} / mo
                </span>
              </div>
              {bills.sort((a, b) => (a.due_day || 99) - (b.due_day || 99)).map(bill => (
                <div key={bill.id} className={`zbb-bill-row ${bill.paid ? 'paid' : ''}`}>
                  <span className="zbb-bill-name">{bill.name}</span>
                  <span className="zbb-bill-due">{bill.due_day ? `Due ${dueSuffix(bill.due_day)}` : ''}</span>
                  <span className="zbb-bill-amount">{fmt(bill.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {showAddPaycheck ? (
            <form className="zbb-add-pc-form" onSubmit={handleAddPaycheck}>
              <input
                type="date"
                value={pcDate}
                onChange={e => setPcDate(e.target.value)}
                className="zbb-pc-input"
                required
              />
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Amount"
                value={pcAmount}
                onChange={e => setPcAmount(e.target.value)}
                className="zbb-pc-input"
                required
                autoFocus
              />
              <button type="submit" className="zbb-btn-save sm" disabled={addingPc}>
                {addingPc ? '…' : 'Add'}
              </button>
              <button type="button" className="zbb-btn-cancel sm" onClick={() => setShowAddPaycheck(false)}>
                Cancel
              </button>
            </form>
          ) : (
            <button className="zbb-add-pc-btn" onClick={() => setShowAddPaycheck(true)}>
              + Add Paycheck
            </button>
          )}
        </div>

        {/* ── Envelopes panel ── */}
        <div className="zbb-envelopes-panel">
          {/* Column headers */}
          <div className="zbb-env-col-headers">
            <span className="zbb-col-name">Envelope</span>
            <span className="zbb-col-budgeted">Budgeted</span>
            <span className="zbb-col-spent">Spent</span>
            <span className="zbb-col-remaining">Remaining</span>
            <span className="zbb-col-del" />
          </div>

          {Array.from(sections.entries()).map(([sectionName, sectionEnvelopes]) => (
            <EnvelopeSection
              key={sectionName}
              sectionName={sectionName}
              envelopes={sectionEnvelopes}
              allocations={allocations}
              spending={spending}
              onAddEnvelope={addEnvelope}
              onDeleteEnvelope={deleteEnvelope}
              onAddSpending={addSpending}
              onDeleteSpending={deleteSpending}
            />
          ))}

          {/* Add section */}
          {showAddSection ? (
            <form className="zbb-add-section-form" onSubmit={handleAddSection}>
              <input
                type="text"
                placeholder="Section name (e.g. Entertainment)"
                value={newSectionName}
                onChange={e => setNewSectionName(e.target.value)}
                className="zbb-add-section-input"
                autoFocus
              />
              <button type="submit" className="zbb-btn-save sm" disabled={addingSection}>
                {addingSection ? '…' : 'Add Section'}
              </button>
              <button type="button" className="zbb-btn-cancel sm" onClick={() => setShowAddSection(false)}>
                Cancel
              </button>
            </form>
          ) : (
            <button className="zbb-add-section-btn" onClick={() => setShowAddSection(true)}>
              + Add section
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
