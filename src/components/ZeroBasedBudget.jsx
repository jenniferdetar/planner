import { useState, useMemo } from 'react'
import { useZeroBasedBudget } from '../hooks/useZeroBasedBudget'
import './ZeroBasedBudget.css'

const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function getMonthLabel(month) {
  const [year, mon] = month.split('-').map(Number)
  return new Date(year, mon - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
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

// ─── AssignModal ─────────────────────────────────────────────────────────────

function AssignModal({ paycheck, envelopes, allocations, onSave, onClose }) {
  const myAllocs = allocations.filter(a => a.paycheck_id === paycheck.id)
  const seed = {}
  myAllocs.forEach(a => { seed[a.envelope_id] = String(a.amount) })
  // Pre-fill defaults for envelopes with no existing allocation
  envelopes.forEach(env => {
    if (seed[env.id] === undefined && env.default_amount > 0) {
      seed[env.id] = String(env.default_amount)
    }
  })
  const [allocMap, setAllocMap] = useState(seed)
  const [saving, setSaving] = useState(false)

  const draftAssigned = Object.values(allocMap).reduce((s, v) => s + (Number(v) || 0), 0)
  const draftLeft = Number(paycheck.amount) - draftAssigned
  const overAllocated = draftLeft < -0.005

  async function handleSave() {
    setSaving(true)
    await onSave(paycheck.id, allocMap)
    setSaving(false)
    onClose()
  }

  // Group envelopes by section for the modal
  const sections = useMemo(() => {
    const map = new Map()
    envelopes.forEach(env => {
      if (!map.has(env.section)) map.set(env.section, [])
      map.get(env.section).push(env)
    })
    return map
  }, [envelopes])

  const dateLabel = paycheck.pay_date
    ? new Date(paycheck.pay_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '—'

  return (
    <div className="zbb-modal-overlay" onClick={onClose}>
      <div className="zbb-modal" onClick={e => e.stopPropagation()}>
        <div className="zbb-modal-header">
          <div>
            <div className="zbb-modal-title">Assign Paycheck</div>
            <div className="zbb-modal-subtitle">{dateLabel} — {fmt(paycheck.amount)}</div>
          </div>
          <button className="zbb-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="zbb-modal-summary">
          <span className={`zbb-modal-left ${overAllocated ? 'over' : draftLeft < 0.005 ? 'zero' : ''}`}>
            {overAllocated
              ? `${fmt(Math.abs(draftLeft))} over budget`
              : draftLeft < 0.005
                ? 'Fully allocated ✓'
                : `${fmt(draftLeft)} left to assign`}
          </span>
          <span className="zbb-modal-assigned">{fmt(draftAssigned)} of {fmt(paycheck.amount)}</span>
        </div>

        {overAllocated && (
          <div className="zbb-modal-warning">
            Over-allocated — reduce some envelopes before saving.
          </div>
        )}

        <div className="zbb-modal-envelopes">
          {Array.from(sections.entries()).map(([sectionName, sectionEnvs]) => (
            <div key={sectionName} className="zbb-modal-section">
              <div className="zbb-modal-section-header">{sectionName}</div>
              {sectionEnvs.map(env => (
                <div key={env.id} className="zbb-modal-env-row">
                  <label className="zbb-modal-env-name">{env.name}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={allocMap[env.id] ?? ''}
                    onChange={e => setAllocMap(prev => ({ ...prev, [env.id]: e.target.value }))}
                    className="zbb-modal-input"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="zbb-modal-actions">
          <button className="zbb-btn-save" onClick={handleSave} disabled={saving || overAllocated}>
            {saving ? 'Saving…' : 'Save Allocations'}
          </button>
          <button className="zbb-btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── IncomePanel ─────────────────────────────────────────────────────────────

function IncomePanel({ paychecks, envelopes, allocations, onAddPaycheck, onDeletePaycheck, onSaveAllocations }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [pcDate, setPcDate] = useState(todayStr())
  const [pcAmount, setPcAmount] = useState('')
  const [adding, setAdding] = useState(false)
  const [assigningPaycheckId, setAssigningPaycheckId] = useState(null)

  async function handleAdd(e) {
    e.preventDefault()
    if (!pcAmount || Number(pcAmount) <= 0) return
    setAdding(true)
    await onAddPaycheck(pcDate, pcAmount)
    setPcDate(todayStr())
    setPcAmount('')
    setAdding(false)
    setShowAddForm(false)
  }

  const assigningPaycheck = paychecks.find(p => p.id === assigningPaycheckId)

  return (
    <div className="zbb-income-panel">
      <div className="zbb-panel-col-header">Income Sources</div>

      {paychecks.length === 0 && (
        <div className="zbb-income-empty">No paychecks this month.</div>
      )}

      {paychecks.map((pc, idx) => {
        const myAllocs = allocations.filter(a => a.paycheck_id === pc.id)
        const assigned = myAllocs.reduce((s, a) => s + Number(a.amount), 0)
        const unassigned = Number(pc.amount) - assigned
        const dateLabel = pc.pay_date
          ? new Date(pc.pay_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '—'

        return (
          <div key={pc.id} className="zbb-income-pc-group">
            <div className="zbb-income-pc-label">Paycheck {idx + 1}</div>

            <div className="zbb-income-row">
              <span className="zbb-income-row-name">Jennifer</span>
              <span className="zbb-income-row-date">{dateLabel}</span>
              <span className="zbb-income-row-amt">{fmt(pc.amount)}</span>
              <div className="zbb-income-row-actions">
                <button
                  className="zbb-btn-assign"
                  onClick={() => setAssigningPaycheckId(pc.id)}
                  title="Assign this paycheck to envelopes"
                >
                  Assign
                </button>
                <button
                  className="zbb-btn-delete-sm"
                  onClick={() => onDeletePaycheck(pc.id)}
                  title="Delete paycheck"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="zbb-income-total-row">
              <span>Total</span>
              <span>{fmt(pc.amount)}</span>
            </div>
            <div className="zbb-income-unassigned-row">
              <span>Assigned</span>
              <span>{fmt(assigned)}</span>
            </div>
            <div className={`zbb-income-unassigned-row ${unassigned < -0.005 ? 'over' : unassigned < 0.005 ? 'zero' : ''}`}>
              <span>Unassigned</span>
              <span>{fmt(Math.abs(unassigned))}</span>
            </div>
          </div>
        )
      })}

      {showAddForm ? (
        <form className="zbb-add-pc-form" onSubmit={handleAdd}>
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
          <div className="zbb-add-pc-btns">
            <button type="submit" className="zbb-btn-save sm" disabled={adding}>
              {adding ? '…' : 'Add'}
            </button>
            <button type="button" className="zbb-btn-cancel sm" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="zbb-add-pc-btn" onClick={() => setShowAddForm(true)}>
          + Add Paycheck
        </button>
      )}

      {assigningPaycheck && (
        <AssignModal
          paycheck={assigningPaycheck}
          envelopes={envelopes}
          allocations={allocations}
          onSave={onSaveAllocations}
          onClose={() => setAssigningPaycheckId(null)}
        />
      )}
    </div>
  )
}

// ─── SpendingSubrows ─────────────────────────────────────────────────────────

function SpendingSubrows({ envelope, spending, onAddSpending, onDeleteSpending }) {
  const [showForm, setShowForm] = useState(false)
  const [spendAmount, setSpendAmount] = useState('')
  const [spendDesc, setSpendDesc] = useState('')
  const [spendDate, setSpendDate] = useState(todayStr())
  const [submitting, setSubmitting] = useState(false)

  const mySpending = spending
    .filter(s => s.envelope_id === envelope.id)
    .sort((a, b) => (b.spent_date || '').localeCompare(a.spent_date || ''))

  async function handleAdd(e) {
    e.preventDefault()
    if (!spendAmount || Number(spendAmount) <= 0) return
    setSubmitting(true)
    await onAddSpending(envelope.id, spendAmount, spendDesc, spendDate)
    setSpendAmount('')
    setSpendDesc('')
    setSpendDate(todayStr())
    setSubmitting(false)
    setShowForm(false)
  }

  return (
    <div className="zbb-spend-section">
      {mySpending.length === 0 && !showForm && (
        <div className="zbb-spend-empty">No spending entries yet.</div>
      )}

      {mySpending.map(s => (
        <div key={s.id} className="zbb-spend-entry">
          <span className="zbb-spend-date">
            {s.spent_date
              ? new Date(s.spent_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : '—'}
          </span>
          <span className="zbb-spend-desc">{s.description || <em>No description</em>}</span>
          <span className="zbb-spend-amt">{fmt(s.amount)}</span>
          <button className="zbb-spend-del" onClick={() => onDeleteSpending(s.id)} title="Delete">×</button>
        </div>
      ))}

      {showForm ? (
        <form className="zbb-spend-form" onSubmit={handleAdd}>
          <input
            type="number" min="0.01" step="0.01" placeholder="Amount"
            value={spendAmount} onChange={e => setSpendAmount(e.target.value)}
            className="zbb-spend-input amount" required autoFocus
          />
          <input
            type="text" placeholder="Description (optional)"
            value={spendDesc} onChange={e => setSpendDesc(e.target.value)}
            className="zbb-spend-input desc"
          />
          <input
            type="date" value={spendDate} onChange={e => setSpendDate(e.target.value)}
            className="zbb-spend-input date"
          />
          <button type="submit" className="zbb-btn-save sm" disabled={submitting}>
            {submitting ? '…' : 'Add'}
          </button>
          <button type="button" className="zbb-btn-cancel sm" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button
          className="zbb-add-spend-btn"
          onClick={e => { e.stopPropagation(); setShowForm(true) }}
        >
          + Add spending
        </button>
      )}
    </div>
  )
}

// ─── BudgetTrackerSection ─────────────────────────────────────────────────────

function BudgetTrackerSection({ sectionName, envelopes, allocations, spending, onAddEnvelope, onDeleteEnvelope, onAddSpending, onDeleteSpending }) {
  const [expandedId, setExpandedId] = useState(null)
  const [showAddEnv, setShowAddEnv] = useState(false)
  const [newEnvName, setNewEnvName] = useState('')
  const [adding, setAdding] = useState(false)

  const sectionBudgeted = envelopes.reduce((s, e) =>
    s + allocations.filter(a => a.envelope_id === e.id).reduce((x, a) => x + Number(a.amount), 0), 0)
  const sectionSpent = envelopes.reduce((s, e) =>
    s + spending.filter(sp => sp.envelope_id === e.id).reduce((x, sp) => x + Number(sp.amount), 0), 0)
  const sectionRemaining = sectionBudgeted - sectionSpent

  async function handleAddEnv(e) {
    e.preventDefault()
    if (!newEnvName.trim()) return
    setAdding(true)
    await onAddEnvelope(newEnvName.trim(), sectionName)
    setNewEnvName('')
    setAdding(false)
    setShowAddEnv(false)
  }

  return (
    <div className="zbb-tracker-section">
      {/* Section header row — dark navy */}
      <div className="zbb-tracker-section-header">
        <span className="zbb-tracker-section-name">{sectionName.toUpperCase()}</span>
        <span className="zbb-tracker-section-num">{fmt(sectionBudgeted)}</span>
        <span className="zbb-tracker-section-num">{fmt(sectionSpent)}</span>
        <span className={`zbb-tracker-section-num ${sectionRemaining < -0.005 ? 'over' : ''}`}>
          {fmt(sectionRemaining)}
        </span>
        <span className="zbb-tracker-del-col" />
      </div>

      {envelopes.map(env => {
        const budgeted = allocations.filter(a => a.envelope_id === env.id).reduce((s, a) => s + Number(a.amount), 0)
        const spent = spending.filter(s => s.envelope_id === env.id).reduce((s, sp) => s + Number(sp.amount), 0)
        const remaining = budgeted - spent
        const overSpent = remaining < -0.005
        const expanded = expandedId === env.id

        return (
          <div key={env.id} className="zbb-tracker-env-wrap">
            <div
              className="zbb-tracker-env-row"
              onClick={() => setExpandedId(expanded ? null : env.id)}
            >
              <span className="zbb-tracker-env-name">
                <span className="zbb-tracker-chevron">{expanded ? '▾' : '▸'}</span>
                {env.name}
              </span>
              <span className="zbb-tracker-num">
                {budgeted > 0 ? fmt(budgeted) : <span className="zbb-zero">—</span>}
              </span>
              <span className="zbb-tracker-num">
                {spent > 0 ? fmt(spent) : <span className="zbb-zero">—</span>}
              </span>
              <span className={`zbb-tracker-num ${overSpent ? 'over' : budgeted === 0 ? 'neutral' : 'ok'}`}>
                {(budgeted > 0 || spent > 0) ? fmt(remaining) : <span className="zbb-zero">—</span>}
              </span>
              <span
                className="zbb-tracker-del"
                onClick={e => { e.stopPropagation(); onDeleteEnvelope(env.id) }}
                title="Delete envelope"
              >
                ×
              </span>
            </div>

            {expanded && (
              <SpendingSubrows
                envelope={env}
                spending={spending}
                onAddSpending={onAddSpending}
                onDeleteSpending={onDeleteSpending}
              />
            )}
          </div>
        )
      })}

      {/* Section subtotal row — green */}
      <div className="zbb-tracker-subtotal-row">
        <span className="zbb-tracker-subtotal-label">Subtotal</span>
        <span className="zbb-tracker-subtotal-num">{fmt(sectionBudgeted)}</span>
        <span className="zbb-tracker-subtotal-num">{fmt(sectionSpent)}</span>
        <span className={`zbb-tracker-subtotal-num ${sectionRemaining < -0.005 ? 'over' : ''}`}>
          {fmt(sectionRemaining)}
        </span>
        <span className="zbb-tracker-del-col" />
      </div>

      {showAddEnv ? (
        <form className="zbb-add-env-form" onSubmit={handleAddEnv}>
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

// ─── BudgetTracker ────────────────────────────────────────────────────────────

function BudgetTracker({ sections, allocations, spending, onAddEnvelope, onDeleteEnvelope, onAddSpending, onDeleteSpending, onAddSection }) {
  const [showAddSection, setShowAddSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [addingSection, setAddingSection] = useState(false)

  async function handleAddSection(e) {
    e.preventDefault()
    if (!newSectionName.trim()) return
    setAddingSection(true)
    await onAddSection(newSectionName.trim())
    setNewSectionName('')
    setAddingSection(false)
    setShowAddSection(false)
  }

  return (
    <div className="zbb-tracker-panel">
      {/* Column headers */}
      <div className="zbb-tracker-col-headers">
        <span className="zbb-tracker-col-name">Item Name</span>
        <span className="zbb-tracker-col-num">Budgeted</span>
        <span className="zbb-tracker-col-num">Spent</span>
        <span className="zbb-tracker-col-num">Remaining</span>
        <span className="zbb-tracker-del-col" />
      </div>

      {Array.from(sections.entries()).map(([sectionName, sectionEnvelopes]) => (
        <BudgetTrackerSection
          key={sectionName}
          sectionName={sectionName}
          envelopes={sectionEnvelopes}
          allocations={allocations}
          spending={spending}
          onAddEnvelope={onAddEnvelope}
          onDeleteEnvelope={onDeleteEnvelope}
          onAddSpending={onAddSpending}
          onDeleteSpending={onDeleteSpending}
        />
      ))}

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
          + Add Section
        </button>
      )}
    </div>
  )
}

// ─── AllocationPlan ───────────────────────────────────────────────────────────

function AllocationPlan({ sections, paychecks, allocations, spending }) {
  // Flat ordered list of all envelopes for running-balance computation
  const envelopeList = useMemo(() => Array.from(sections.values()).flat(), [sections])

  // gridTemplateColumns: name col + one col per paycheck + actual spent col
  const gridCols = `180px ${paychecks.map(() => '120px').join(' ')} 90px`

  return (
    <div className="zbb-alloc-panel">
      {/* Column headers */}
      <div
        className="zbb-alloc-col-headers"
        style={{ gridTemplateColumns: gridCols }}
      >
        <span className="zbb-alloc-col-name">Envelope</span>
        {paychecks.map((pc, idx) => (
          <span key={pc.id} className="zbb-alloc-col-pc">
            PC{idx + 1}
          </span>
        ))}
        <span className="zbb-alloc-col-spent">Actual Spent</span>
      </div>

      {Array.from(sections.entries()).map(([sectionName, sectionEnvelopes]) => (
        <div key={sectionName} className="zbb-alloc-section">
          {/* Section header — dark navy */}
          <div
            className="zbb-alloc-section-header"
            style={{ gridTemplateColumns: gridCols }}
          >
            <span>{sectionName.toUpperCase()}</span>
            {paychecks.map(pc => <span key={pc.id} />)}
            <span />
          </div>

          {sectionEnvelopes.map(env => {
            const spent = spending
              .filter(s => s.envelope_id === env.id)
              .reduce((s, sp) => s + Number(sp.amount), 0)

            const envIdx = envelopeList.findIndex(e => e.id === env.id)
            const envsUpToAndIncluding = envelopeList.slice(0, envIdx + 1)

            return (
              <div
                key={env.id}
                className="zbb-alloc-env-row"
                style={{ gridTemplateColumns: gridCols }}
              >
                <span className="zbb-alloc-env-name">{env.name}</span>

                {paychecks.map(pc => {
                  const alloc = allocations.find(a => a.paycheck_id === pc.id && a.envelope_id === env.id)
                  const allocAmt = alloc ? Number(alloc.amount) : 0

                  // Running balance = paycheck total minus all allocations up to and including this envelope
                  const cumAlloc = envsUpToAndIncluding.reduce((s, e) => {
                    const a = allocations.find(al => al.paycheck_id === pc.id && al.envelope_id === e.id)
                    return s + (a ? Number(a.amount) : 0)
                  }, 0)
                  const runningBalance = Number(pc.amount) - cumAlloc

                  return (
                    <span key={pc.id} className={`zbb-alloc-cell ${allocAmt > 0 ? 'has-alloc' : ''}`}>
                      {allocAmt > 0
                        ? (
                          <>
                            {fmt(allocAmt)}
                            <span className="zbb-alloc-balance"> / {fmt(runningBalance)}</span>
                          </>
                        )
                        : <span className="zbb-alloc-balance-only">{fmt(runningBalance)}</span>
                      }
                    </span>
                  )
                })}

                <span className={`zbb-alloc-cell spent-cell ${spent > 0 ? 'has-spent' : ''}`}>
                  {spent > 0 ? fmt(spent) : <span className="zbb-zero">—</span>}
                </span>
              </div>
            )
          })}

          {/* Section subtotal row — green */}
          <div
            className="zbb-alloc-subtotal-row"
            style={{ gridTemplateColumns: gridCols }}
          >
            <span className="zbb-alloc-subtotal-label">Subtotal</span>
            {paychecks.map(pc => {
              const sectionAlloc = sectionEnvelopes.reduce((s, e) => {
                const a = allocations.find(al => al.paycheck_id === pc.id && al.envelope_id === e.id)
                return s + (a ? Number(a.amount) : 0)
              }, 0)
              return <span key={pc.id} className="zbb-alloc-subtotal-num">{fmt(sectionAlloc)}</span>
            })}
            <span className="zbb-alloc-subtotal-num">
              {fmt(sectionEnvelopes.reduce((s, e) =>
                s + spending.filter(sp => sp.envelope_id === e.id).reduce((x, sp) => x + Number(sp.amount), 0), 0))}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── ZeroBasedBudget (main) ───────────────────────────────────────────────────

export default function ZeroBasedBudget({ userId, bills = [] }) {
  const today = new Date().toISOString().slice(0, 7)
  const [month, setMonth] = useState(today)

  const {
    paychecks, envelopes, allocations, spending, loading,
    addPaycheck, deletePaycheck,
    addEnvelope, deleteEnvelope, addSection,
    saveAllocations,
    addSpending, deleteSpending,
  } = useZeroBasedBudget(userId, month)

  const totalIncome = paychecks.reduce((s, p) => s + Number(p.amount), 0)
  const totalAssigned = allocations.reduce((s, a) => s + Number(a.amount), 0)
  const totalUnassigned = totalIncome - totalAssigned
  const unassignedPositive = totalUnassigned > 0.005
  const unassignedZero = Math.abs(totalUnassigned) < 0.005

  // Group envelopes by section, preserving sort_order within each section
  const sections = useMemo(() => {
    const map = new Map()
    // envelopes already come sorted by sort_order from the hook
    envelopes.forEach(env => {
      if (!map.has(env.section)) map.set(env.section, [])
      map.get(env.section).push(env)
    })
    return map
  }, [envelopes])

  if (loading) {
    return <div className="zbb-loading">Loading budget…</div>
  }

  return (
    <div className="zbb-root">
      {/* ── Header bar ── */}
      <div className="zbb-header">
        <div className="zbb-header-left">
          <div className="zbb-month-nav">
            <button className="zbb-nav-btn" onClick={() => setMonth(prevMonth(month))}>&#8249;</button>
            <span className="zbb-month-label">{getMonthLabel(month)}</span>
            <button className="zbb-nav-btn" onClick={() => setMonth(nextMonth(month))}>&#8250;</button>
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
            <div className={`zbb-chip ${unassignedZero ? 'chip-green' : unassignedPositive ? 'chip-red' : 'chip-over'}`}>
              <span className="zbb-chip-label">Unassigned</span>
              <span className="zbb-chip-value">{fmt(Math.abs(totalUnassigned))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Three-column body ── */}
      <div className="zbb-body">
        {/* Left: Budget Tracker */}
        <BudgetTracker
          sections={sections}
          allocations={allocations}
          spending={spending}
          onAddEnvelope={addEnvelope}
          onDeleteEnvelope={deleteEnvelope}
          onAddSpending={addSpending}
          onDeleteSpending={deleteSpending}
          onAddSection={addSection}
        />

        {/* Middle: Income Sources */}
        <IncomePanel
          paychecks={paychecks}
          envelopes={envelopes}
          allocations={allocations}
          onAddPaycheck={addPaycheck}
          onDeletePaycheck={deletePaycheck}
          onSaveAllocations={saveAllocations}
        />

        {/* Right: Allocated Spending Plan */}
        {paychecks.length > 0 && (
          <AllocationPlan
            sections={sections}
            paychecks={paychecks}
            allocations={allocations}
            spending={spending}
          />
        )}
      </div>
    </div>
  )
}
