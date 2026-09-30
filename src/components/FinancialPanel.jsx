import { useState, useRef } from 'react'
import { useFinanceLedger } from '../hooks/useFinanceLedger'
import './FinancialPanel.css'

// Paycheck Ledger — plan each check, watch the month add up, log what you spend.
// Summary tiles first, detail tables below; one working column under a tab bar.

const TABS = [
  ['overview', 'Overview'], ['checks', 'Paychecks'], ['month', 'Monthly Budget'],
  ['register', 'Register'], ['debts', 'Debts'], ['savings', 'Savings'], ['setup', 'Setup'],
]
const GROUPS = ['Charity', 'Saving', 'Housing', 'Utilities', 'Transportation', 'Food', 'Health', 'Personal', 'Lifestyle', 'Debt']
const REC = { Charity: [10, 15], Saving: [5, 10], Housing: [25, 35], Utilities: [5, 10], Transportation: [10, 15], Food: [5, 15], Health: [5, 10], Personal: [5, 10], Lifestyle: [5, 10], Debt: [5, 15] }
const DEBT_PLANS = ['Self', 'MMI', 'Pending', 'Deferred', 'Mortgage', 'Paid']
const DEBT_ORDER = { Self: 0, MMI: 1, Pending: 2, Deferred: 3, Mortgage: 4, Paid: 5 }
const DEFAULT_CONFIG = { accounts: [{ id: '1', name: 'Checking', type: 'Checking' }], items: [] }

const money = (n, cents = true) => {
  n = +n || 0
  const s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })
  return (n < 0 ? '-$' : '$') + s
}
const sum = a => a.reduce((x, y) => x + (+y || 0), 0)
const num = v => { const n = parseFloat(String(v).replace(/[$,\s]/g, '')); return isFinite(n) ? Math.round(n * 100) / 100 : 0 }
const localISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fmtDate = s => { if (!s) return ''; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
const monthName = m => { const [y, mo] = m.split('-').map(Number); return new Date(y, mo - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }
const monthOnly = m => monthName(m).split(' ')[0]
const ord = n => { n = +n; if (!n) return ''; const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]) }
const allocSum = c => sum(Object.values(c.alloc || {}))
const newId = p => p + Date.now().toString(36)

function Tile({ label, children }) {
  return <div className="fin-tile"><div className="fin-lab">{label}</div><div className="fin-val">{children}</div></div>
}

// Uncontrolled input that commits on change (blur / enter), like a spreadsheet
// cell. Keyed on the saved value so it refreshes when the data does.
function Cell({ value, onCommit, className = 'fin-amt', ...rest }) {
  return (
    <input
      key={String(value ?? '')}
      className={className}
      defaultValue={value ?? ''}
      onBlur={e => { if (e.target.value !== String(value ?? '')) onCommit(e.target.value) }}
      onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
      {...rest}
    />
  )
}

function Bar({ pct, cls = '' }) {
  return <div className="fin-bar"><i className={cls} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /></div>
}

export default function FinancialPanel({ userId }) {
  const L = useFinanceLedger(userId)
  const todayISO = localISO(new Date())
  const [tab, setTab] = useState(() => { try { return localStorage.getItem('fin.tab') || 'overview' } catch { return 'overview' } })
  const [month, setMonth] = useState(todayISO.slice(0, 7))
  const [checkId, setCheckId] = useState(null)
  const [toastMsg, setToastMsg] = useState('')
  const toastTimer = useRef(null)
  const [armedDelete, setArmedDelete] = useState(null)

  function toast(m) {
    setToastMsg(m)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 1800)
  }
  async function write(fn, okMsg) {
    try { await fn(); if (okMsg) toast(okMsg) } catch { toast("That didn't save. Try again.") }
  }
  function go(k) { setTab(k); try { localStorage.setItem('fin.tab', k) } catch { /* ignore */ } }

  const cfg = L.config
  const items = cfg?.items || []
  const accounts = cfg?.accounts || []
  const activeItems = items.filter(i => i.active !== false)
  const itemById = id => items.find(i => i.id === id)
  const acctName = id => accounts.find(a => a.id === id)?.name || ''
  const checksIn = m => L.checks.filter(c => (c.date || '').startsWith(m)).sort((a, b) => a.date.localeCompare(b.date))
  const txnsIn = m => L.txns.filter(t => (t.date || '').startsWith(m))
  const saveCfg = next => write(() => L.setDoc('config', 'main', next), 'Saved')

  function monthStats(m) {
    const cks = checksIn(m), tx = txnsIn(m)
    const income = sum(cks.map(c => c.amount))
    const byItem = {}
    for (const it of items) byItem[it.id] = { it, plan: it.active === false ? 0 : (+it.monthly || 0), budget: 0, spent: 0 }
    for (const c of cks) for (const [k, v] of Object.entries(c.alloc || {})) (byItem[k] ||= { it: { id: k, name: k, group: 'Personal' }, plan: 0, budget: 0, spent: 0 }).budget += +v || 0
    for (const t of tx) (byItem[t.itemId] ||= { it: { id: t.itemId, name: t.itemId || 'Uncategorized', group: 'Personal' }, plan: 0, budget: 0, spent: 0 }).spent += +t.amount || 0
    const rows = Object.values(byItem)
    const assigned = sum(rows.map(r => r.budget)), spent = sum(rows.map(r => r.spent)), plan = sum(rows.map(r => r.plan))
    return { cks, tx, income, rows, assigned, spent, plan, left: income - assigned }
  }
  const groupRows = rows => GROUPS
    .map(g => ({ g, rows: rows.filter(r => (r.it.group || 'Personal') === g && (r.plan || r.budget || r.spent)) }))
    .filter(x => x.rows.length)

  /* ---------- Overview ---------- */
  function Overview() {
    const st = monthStats(month)
    const curMonth = todayISO.slice(0, 7)
    const dom = new Date().getDate()
    const upcoming = month < curMonth ? [] : activeItems
      .filter(i => +i.due && (month > curMonth || +i.due >= dom))
      .sort((a, b) => a.due - b.due)
    const selfDebts = L.debts.filter(x => x.plan === 'Self' && +x.balance > 0).sort((a, b) => a.balance - b.balance)
    const debtTotal = sum(L.debts.filter(x => x.plan !== 'Mortgage').map(x => x.balance))
    const groups = groupRows(st.rows)
    return (
      <div className="fin-stack">
        <div className="fin-tiles">
          <Tile label={`Income in ${monthOnly(month)}`}>{money(st.income)}</Tile>
          <Tile label="Assigned to bills">{money(st.assigned)}</Tile>
          <Tile label="Spent so far">{money(st.spent)}</Tile>
          <Tile label="Left to assign"><span className={st.left < 0 ? 'fin-neg' : st.left > 0 ? 'fin-pos' : ''}>{money(st.left)}</span></Tile>
        </div>
        <div className="fin-panel">
          <div className="fin-row fin-spread" style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>Paychecks this month</h3>
            <button className="fin-btn fin-ghost fin-small" onClick={() => go('checks')}>Open paychecks</button>
          </div>
          {st.cks.length ? (
            <div className="fin-checks">
              {st.cks.map(c => {
                const lo = (+c.amount || 0) - allocSum(c)
                return (
                  <button key={c.id} className="fin-chk" onClick={() => { setCheckId(c.id); go('checks') }}>
                    <div className="fin-d">{fmtDate(c.date)}</div>
                    <div className="fin-a">{c.amount ? money(c.amount) : <span className="fin-muted">Amount?</span>}</div>
                    <div style={{ fontSize: 12 }} className={lo < 0 ? 'fin-neg' : 'fin-muted'}>
                      {c.amount ? (lo < 0 ? `Short ${money(-lo)}` : `${money(lo)} left over`) : 'Not planned yet'}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : <div className="fin-muted">No paychecks dated this month. Add one on the Paychecks tab.</div>}
        </div>
        <div className="fin-grid2">
          <div className="fin-panel">
            <h3>Where the month stands</h3>
            {groups.length ? (
              <div className="fin-stack" style={{ gap: 10 }}>
                {groups.map(({ g, rows }) => {
                  const b = sum(rows.map(r => r.budget)), s = sum(rows.map(r => r.spent)), p = sum(rows.map(r => r.plan))
                  const base = Math.max(b, p) || 1
                  return (
                    <div key={g}>
                      <div className="fin-row fin-spread" style={{ fontSize: 14 }}>
                        <span>{g}</span>
                        <span className="fin-num fin-muted">{money(s, false)} spent of {money(b, false)} assigned</span>
                      </div>
                      <Bar pct={s / base * 100} cls={s > b && b > 0 ? 'over' : ''} />
                    </div>
                  )
                })}
              </div>
            ) : <div className="fin-muted">Nothing assigned or spent yet this month.</div>}
          </div>
          <div className="fin-stack">
            <div className="fin-panel">
              <h3>Bills still due in {monthOnly(month)}</h3>
              {upcoming.length ? (
                <table><tbody>
                  {upcoming.map(i => (
                    <tr key={i.id}><td>{i.name}</td><td className="fin-muted">{ord(i.due)}</td><td className="fin-num">{money(i.monthly)}</td></tr>
                  ))}
                </tbody></table>
              ) : <div className="fin-muted">No bills with a due date left this month.</div>}
            </div>
            <div className="fin-panel">
              <h3>Debt snapshot</h3>
              <div className="fin-row fin-spread"><span>Total owed, not counting the mortgage</span><span className="fin-num">{money(debtTotal, false)}</span></div>
              {selfDebts[0] && (
                <div className="fin-envelope" style={{ marginTop: 10 }}>
                  <div className="fin-muted fin-eyebrow">Next snowball target</div>
                  <div style={{ fontWeight: 600 }}>{selfDebts[0].name}</div>
                  <div className="fin-num" style={{ textAlign: 'left' }}>{money(selfDebts[0].balance)}{selfDebts[0].apr != null ? ` at ${selfDebts[0].apr}% APR` : ''}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ---------- Paychecks ---------- */
  function Paychecks() {
    const all = [...L.checks].sort((a, b) => a.date.localeCompare(b.date))
    let selId = checkId
    if (!selId || !all.find(c => c.id === selId)) {
      const next = all.find(c => c.date >= todayISO) || all[all.length - 1]
      selId = next?.id || null
    }
    const c = all.find(x => x.id === selId)

    function addCheck(e) {
      e.preventDefault()
      const f = e.target
      const date = f.ncDate.value
      if (!date) return
      const amount = num(f.ncAmt.value) || null
      const id = 'c' + date.replace(/-/g, '')
      write(async () => {
        await L.setDoc('checks', id, { date, amount, alloc: {} })
        setCheckId(id)
        if (date.slice(0, 7) !== month) setMonth(date.slice(0, 7))
      }, 'Paycheck added')
    }
    const addForm = (
      <form className="fin-add" onSubmit={addCheck}>
        <label>Payday<input type="date" name="ncDate" required /></label>
        <label>Take-home amount<input className="fin-amt" name="ncAmt" inputMode="decimal" placeholder="0.00" /></label>
        <button className="fin-btn fin-small" type="submit">Add paycheck</button>
      </form>
    )
    if (!c) return (
      <div className="fin-stack">
        <div className="fin-panel">{addForm}</div>
        <div className="fin-panel fin-empty">No paychecks yet. Add your next payday above.</div>
      </div>
    )

    const alloc = c.alloc || {}
    const list = items.filter(i => i.active !== false || alloc[i.id])
    const lo = (+c.amount || 0) - allocSum(c)
    const byAcct = {}
    for (const [k, v] of Object.entries(alloc)) {
      if (!+v) continue
      const a = itemById(k)?.account || accounts[0]?.id || ''
      byAcct[a] = (byAcct[a] || 0) + (+v)
    }
    const saveCheck = (patch, msg) => write(() => L.setDoc('checks', c.id, { ...c, ...patch }), msg)
    const setAlloc = (itemId, v) => saveCheck({ alloc: { ...alloc, [itemId]: num(v) } })
    function fill() {
      const next = { ...alloc }
      for (const i of activeItems) if (!next[i.id]) { const v = Math.ceil((+i.monthly || 0) / 2); if (v) next[i.id] = v }
      saveCheck({ alloc: next }, 'Filled from plan')
    }
    function del() {
      if (armedDelete === c.id) {
        setArmedDelete(null); setCheckId(null)
        write(() => L.deleteDoc('checks', c.id), 'Paycheck deleted')
      } else {
        setArmedDelete(c.id)
        setTimeout(() => setArmedDelete(a => (a === c.id ? null : a)), 3000)
      }
    }

    return (
      <div className="fin-stack">
        <div className="fin-panel">
          <div className="fin-checks">
            {all.map(x => {
              const xlo = (+x.amount || 0) - allocSum(x)
              return (
                <button key={x.id} className="fin-chk" aria-pressed={x.id === selId} onClick={() => setCheckId(x.id)}>
                  <div className="fin-d">{fmtDate(x.date)} <span className="fin-muted" style={{ fontWeight: 400 }}>{x.date.slice(0, 4)}</span></div>
                  <div className="fin-a">{x.amount ? money(x.amount) : <span className="fin-muted">Amount?</span>}</div>
                  <div style={{ fontSize: 12 }} className={xlo < 0 ? 'fin-neg' : 'fin-muted'}>
                    {x.label || (x.amount ? (xlo < 0 ? `Short ${money(-xlo)}` : `${money(xlo)} left`) : 'Not planned')}
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{ marginTop: 12 }}>{addForm}</div>
        </div>
        <div className="fin-grid2 fin-grid-main">
          <div className="fin-panel">
            <div className="fin-row fin-spread" style={{ marginBottom: 10 }}>
              <div>
                <h2>{fmtDate(c.date)}, {c.date.slice(0, 4)} check</h2>
                {c.label && <div className="fin-muted" style={{ fontSize: 13 }}>{c.label}</div>}
              </div>
              <div className="fin-row">
                <label className="fin-muted" style={{ fontSize: 13 }} htmlFor="finCkAmt">Take-home</label>
                <Cell id="finCkAmt" inputMode="decimal" placeholder="0.00" value={c.amount ?? ''} onCommit={v => saveCheck({ amount: num(v) }, 'Amount saved')} />
              </div>
            </div>
            <div className="fin-row" style={{ marginBottom: 10 }}>
              <button className="fin-btn fin-ghost fin-small" onClick={fill}>Fill empty lines from plan</button>
              <button className="fin-btn fin-ghost fin-small" onClick={del}>{armedDelete === c.id ? 'Click again to delete' : 'Delete this check'}</button>
              <span className="fin-muted" style={{ fontSize: 12 }}>Plan column is half of each bill's monthly amount.</span>
            </div>
            <div className="fin-tw">
              <table>
                <thead><tr><th>Item</th><th>Account</th><th className="fin-num">Plan</th><th className="fin-num">This check</th></tr></thead>
                <tbody>
                  {GROUPS.map(g => {
                    const its = list.filter(i => (i.group || 'Personal') === g)
                    if (!its.length) return null
                    return [
                      <tr key={g} className="fin-grp"><td colSpan={4}>{g}</td></tr>,
                      ...its.map(i => {
                        const sug = Math.ceil((+i.monthly || 0) / 2)
                        return (
                          <tr key={i.id}>
                            <td>{i.name}{i.due ? <span className="fin-muted" style={{ fontSize: 12 }}> due {ord(i.due)}</span> : null}</td>
                            <td className="fin-muted" style={{ fontSize: 13 }}>{i.account} {acctName(i.account)}</td>
                            <td className="fin-num fin-muted">{sug ? money(sug, false) : ''}</td>
                            <td className="fin-num">
                              <Cell inputMode="decimal" placeholder="0" aria-label={`${i.name} amount`} value={alloc[i.id] ? +alloc[i.id] : ''} onCommit={v => setAlloc(i.id, v)} />
                            </td>
                          </tr>
                        )
                      }),
                    ]
                  })}
                  {!list.length && <tr><td colSpan={4} className="fin-muted">Add bills on the Setup tab to plan this check.</td></tr>}
                  <tr className="fin-tot"><td colSpan={3}>Assigned</td><td className="fin-num">{money(allocSum(c))}</td></tr>
                  <tr className="fin-tot"><td colSpan={3}>Left over</td><td className={`fin-num ${lo < 0 ? 'fin-neg' : 'fin-pos'}`}>{money(lo)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="fin-stack">
            <div className="fin-panel">
              <h3>Transfers for this check</h3>
              {Object.keys(byAcct).length ? (
                <div className="fin-xfer">
                  {Object.entries(byAcct).sort().map(([a, v]) => [
                    <span key={a + 'i'} className="fin-id">{a}</span>,
                    <span key={a + 'n'}>{acctName(a) || `Account ${a}`}</span>,
                    <span key={a + 'v'} className="fin-num">{money(v)}</span>,
                  ])}
                </div>
              ) : <div className="fin-muted">Assign amounts and this shows how much goes to each SchoolsFirst account.</div>}
            </div>
            <div className={`fin-panel ${lo < 0 ? 'fin-short' : 'fin-envelope'}`}>
              <h3>{lo < 0 ? 'Short by' : 'Unassigned'}</h3>
              <div className="fin-big">{money(Math.abs(lo))}</div>
              <div className="fin-muted" style={{ fontSize: 13 }}>
                {lo < 0 ? 'Trim a line or move a bill to the next check.' : 'Give it a job: savings, snowball, or a cushion for the next shortfall.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ---------- Monthly budget ---------- */
  function MonthlyBudget() {
    const st = monthStats(month)
    const inc = st.income || 1
    const groups = groupRows(st.rows)
    return (
      <div className="fin-stack">
        <div className="fin-row fin-spread">
          <h2>{monthName(month)} zero-based budget</h2>
          <span className="fin-muted" style={{ fontSize: 13 }}>Assigned comes from this month's paychecks. Spent comes from the register.</span>
        </div>
        <div className="fin-tiles">
          <Tile label="Income">{money(st.income)}</Tile>
          <Tile label="Monthly plan">{money(st.plan)}</Tile>
          <Tile label="Assigned">{money(st.assigned)}</Tile>
          <Tile label="Every dollar a job">
            <span className={st.left === 0 ? 'fin-pos' : st.left < 0 ? 'fin-neg' : ''}>
              {st.left === 0 ? 'Done' : money(st.left) + (st.left < 0 ? ' over' : ' left')}
            </span>
          </Tile>
        </div>
        <div className="fin-panel fin-tw">
          {groups.length ? (
            <table>
              <thead><tr><th>Item</th><th className="fin-num">Plan</th><th className="fin-num">Assigned</th><th className="fin-num">Spent</th><th className="fin-num">Remaining</th><th>% of income</th></tr></thead>
              <tbody>
                {groups.map(({ g, rows }) => {
                  const b = sum(rows.map(r => r.budget)), s = sum(rows.map(r => r.spent)), p = sum(rows.map(r => r.plan))
                  const pct = st.income ? b / inc * 100 : 0
                  const [lo, hi] = REC[g] || [0, 100]
                  return [
                    <tr key={g} className="fin-grp">
                      <td>{g} <span className="fin-muted" style={{ fontWeight: 400, fontSize: 12 }}>rec. {lo} to {hi}%</span></td>
                      <td className="fin-num">{money(p)}</td>
                      <td className="fin-num">{money(b)}</td>
                      <td className="fin-num">{money(s)}</td>
                      <td className={`fin-num ${b - s < 0 ? 'fin-neg' : ''}`}>{money(b - s)}</td>
                      <td>{st.income ? <span className={`fin-pill ${pct > hi ? 'warn' : 'good'}`}>{pct.toFixed(1)}%</span> : null}</td>
                    </tr>,
                    ...rows.map(r => (
                      <tr key={g + r.it.id}>
                        <td style={{ paddingLeft: 18 }}>{r.it.name}</td>
                        <td className="fin-num fin-muted">{money(r.plan)}</td>
                        <td className="fin-num">{money(r.budget)}</td>
                        <td className="fin-num">{r.spent ? money(r.spent) : <span className="fin-muted">$0.00</span>}</td>
                        <td className={`fin-num ${r.budget - r.spent < 0 ? 'fin-neg' : ''}`}>{money(r.budget - r.spent)}</td>
                        <td />
                      </tr>
                    )),
                  ]
                })}
                <tr className="fin-tot">
                  <td>Total</td><td className="fin-num">{money(st.plan)}</td><td className="fin-num">{money(st.assigned)}</td>
                  <td className="fin-num">{money(st.spent)}</td><td className="fin-num">{money(st.assigned - st.spent)}</td><td />
                </tr>
              </tbody>
            </table>
          ) : <div className="fin-empty">Nothing planned for {monthName(month)} yet. Add paychecks dated this month, then assign them.</div>}
        </div>
      </div>
    )
  }

  /* ---------- Register ---------- */
  function Register() {
    const tx = txnsIn(month).sort((a, b) => b.date.localeCompare(a.date) || (b.created || 0) - (a.created || 0))
    const opts = activeItems.slice().sort((a, b) => a.name.localeCompare(b.name))
    const defDate = todayISO.startsWith(month) ? todayISO : month + '-01'
    function addTxn(e) {
      e.preventDefault()
      const f = e.target
      const date = f.ntDate.value, itemId = f.ntItem.value, amount = num(f.ntAmt.value), note = f.ntNote.value.trim()
      if (!date || !itemId || !amount) { toast('Add a date, category and amount.'); return }
      write(async () => { await L.addDoc('txns', { date, itemId, amount, note, created: Date.now() }); f.ntAmt.value = ''; f.ntNote.value = '' }, `Logged ${money(amount)}`)
    }
    return (
      <div className="fin-stack">
        <div className="fin-panel">
          <h3>Log a transaction</h3>
          <form className="fin-add" onSubmit={addTxn}>
            <label>Date<input type="date" name="ntDate" defaultValue={defDate} key={defDate} required /></label>
            <label>Category
              <select name="ntItem" required defaultValue="">
                <option value="">Choose…</option>
                {opts.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </label>
            <label>Amount<input className="fin-amt" name="ntAmt" inputMode="decimal" placeholder="0.00" required /></label>
            <label style={{ flex: '1 1 160px' }}>Note<input name="ntNote" placeholder="Store, check #, etc." /></label>
            <button className="fin-btn fin-small" type="submit">Add</button>
          </form>
        </div>
        <div className="fin-panel fin-tw">
          <div className="fin-row fin-spread" style={{ marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>{monthName(month)} register</h3>
            <span className="fin-num">{money(sum(tx.map(t => t.amount)))} spent</span>
          </div>
          {tx.length ? (
            <table>
              <thead><tr><th>Date</th><th>Category</th><th>Account</th><th>Note</th><th className="fin-num">Amount</th><th /></tr></thead>
              <tbody>
                {tx.map(t => {
                  const it = itemById(t.itemId)
                  return (
                    <tr key={t.id}>
                      <td>{fmtDate(t.date)}</td>
                      <td>{it?.name || t.itemId}</td>
                      <td className="fin-muted" style={{ fontSize: 13 }}>{acctName(it?.account)}</td>
                      <td>{t.note}</td>
                      <td className="fin-num">{money(t.amount)}</td>
                      <td><button className="fin-x" aria-label="Delete" onClick={() => write(() => L.deleteDoc('txns', t.id), 'Transaction removed')}>×</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : <div className="fin-empty">No transactions logged for {monthName(month)}. Add your first one above and it will count toward Spent on the Monthly Budget.</div>}
        </div>
      </div>
    )
  }

  /* ---------- Debts ---------- */
  function Debts() {
    const ds = [...L.debts].sort((a, b) => (DEBT_ORDER[a.plan] ?? 9) - (DEBT_ORDER[b.plan] ?? 9) || a.balance - b.balance)
    const nonMort = ds.filter(d => d.plan !== 'Mortgage')
    const target = ds.filter(d => d.plan === 'Self' && d.balance > 0).sort((a, b) => a.balance - b.balance)[0]
    const pillFor = d => {
      if (d.plan === 'Paid' || +d.balance <= 0) return <span className="fin-pill good">Paid off</span>
      if (d.plan === 'MMI') return <span className="fin-pill acc">MMI plan</span>
      if (d.plan === 'Self') return <span className="fin-pill">You pay</span>
      if (d.plan === 'Deferred') return <span className="fin-pill">Deferred</span>
      if (d.plan === 'Pending') return <span className="fin-pill warn">Waiting on MMI</span>
      return <span className="fin-pill">{d.plan}</span>
    }
    const saveDebt = (d, patch, msg) => write(() => L.setDoc('debts', d.id, { ...d, ...patch }), msg)
    function addDebt(e) {
      e.preventDefault()
      const f = e.target
      const name = f.ndName.value.trim()
      if (!name) return
      const balance = num(f.ndBal.value)
      const aprRaw = f.ndApr.value.trim()
      write(async () => {
        await L.addDoc('debts', {
          name, plan: f.ndPlan.value, balance, start: balance,
          apr: aprRaw === '' ? null : num(aprRaw), payment: num(f.ndPay.value),
          due: parseInt(f.ndDue.value) || null, asOf: todayISO,
        })
        f.reset()
      }, 'Debt added')
    }
    return (
      <div className="fin-stack">
        <div className="fin-tiles">
          <Tile label="Owed, not counting mortgage">{money(sum(nonMort.map(d => d.balance)), false)}</Tile>
          <Tile label="Monthly debt payments">{money(sum(nonMort.map(d => d.payment)))}</Tile>
          <Tile label="Paid off">{String(ds.filter(d => +d.balance <= 0).length)}</Tile>
        </div>
        <div className="fin-panel">
          {ds.length ? ds.map(d => {
            const start = +d.start || +d.balance || 1
            const paid = Math.max(0, Math.min(100, (1 - (+d.balance) / start) * 100))
            return (
              <div key={d.id} className="fin-debt">
                <div className="fin-row fin-spread">
                  <div className="fin-row" style={{ gap: 8 }}>
                    <strong>{d.name}</strong>{pillFor(d)}
                    {target && target.id === d.id && <span className="fin-pill acc">Snowball target</span>}
                  </div>
                  <div className="fin-row" style={{ gap: 6 }}>
                    <select value={d.plan} aria-label={`${d.name} plan`} onChange={e => saveDebt(d, { plan: e.target.value }, 'Saved')}>
                      {DEBT_PLANS.map(p => <option key={p}>{p}</option>)}
                    </select>
                    <label className="fin-muted" style={{ fontSize: 12 }}>Balance</label>
                    <Cell inputMode="decimal" aria-label={`${d.name} balance`} value={(+d.balance || 0).toFixed(2)} onCommit={v => saveDebt(d, { balance: num(v), asOf: todayISO }, 'Balance updated')} />
                    <button className="fin-x" aria-label={`Delete ${d.name}`} onClick={() => {
                      if (armedDelete === d.id) { setArmedDelete(null); write(() => L.deleteDoc('debts', d.id), 'Debt removed') }
                      else { setArmedDelete(d.id); toast('Click × again to delete') }
                    }}>×</button>
                  </div>
                </div>
                <Bar pct={paid} cls={paid >= 100 ? 'done' : ''} />
                <div className="fin-row fin-muted" style={{ fontSize: 13, gap: 16 }}>
                  {d.apr != null && <span>{d.apr}% APR</span>}
                  <span>{+d.payment ? `${money(d.payment)}/mo` : 'No payment due'}</span>
                  {d.due ? <span>due {ord(d.due)}</span> : null}
                  <span>{paid.toFixed(0)}% paid of {money(start, false)}</span>
                  {d.note && <span>{d.note}</span>}
                </div>
              </div>
            )
          }) : <div className="fin-empty">No debts added yet.</div>}
        </div>
        <div className="fin-panel">
          <h3>Add a debt</h3>
          <form className="fin-add" onSubmit={addDebt}>
            <label style={{ flex: '1 1 160px' }}>Name<input name="ndName" required /></label>
            <label>Plan<select name="ndPlan" defaultValue="Self">{DEBT_PLANS.map(p => <option key={p}>{p}</option>)}</select></label>
            <label>Balance<input className="fin-amt" name="ndBal" inputMode="decimal" placeholder="0.00" /></label>
            <label>APR %<input className="fin-amt" style={{ width: 70 }} name="ndApr" inputMode="decimal" placeholder="-" /></label>
            <label>Payment<input className="fin-amt" name="ndPay" inputMode="decimal" placeholder="0.00" /></label>
            <label>Due day<input className="fin-amt" style={{ width: 60 }} name="ndDue" inputMode="numeric" placeholder="-" /></label>
            <button className="fin-btn fin-small" type="submit">Add debt</button>
          </form>
        </div>
      </div>
    )
  }

  /* ---------- Savings ---------- */
  function Savings() {
    const fs = [...L.funds].sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || (a.name || '').localeCompare(b.name || ''))
    function addFund(e) {
      e.preventDefault()
      const f = e.target
      const name = f.nfName.value.trim()
      if (!name) return
      write(async () => {
        await L.addDoc('funds', {
          name, purpose: f.nfPurpose.value.trim(), account: f.nfAcct.value,
          balance: num(f.nfBal.value), target: num(f.nfTarget.value), monthly: num(f.nfMonthly.value),
          asOf: todayISO, order: fs.length,
        })
        f.reset()
      }, 'Fund added')
    }
    return (
      <div className="fin-stack">
        <div className="fin-tiles">
          <Tile label="Total saved">{money(sum(fs.map(f => f.balance)))}</Tile>
          <Tile label="Monthly contributions">{money(sum(fs.map(f => f.monthly)))}</Tile>
        </div>
        <div className="fin-fundgrid">
          {fs.length ? fs.map(f => {
            const pct = +f.target ? Math.min(100, f.balance / f.target * 100) : 0
            return (
              <div key={f.id} className="fin-panel fin-fund">
                <div className="fin-row fin-spread">
                  <strong>{f.name}</strong>
                  <div className="fin-row" style={{ gap: 4 }}>
                    {f.account && <span className="fin-pill">{f.account}</span>}
                    <button className="fin-x" aria-label={`Delete ${f.name}`} onClick={() => {
                      if (armedDelete === f.id) { setArmedDelete(null); write(() => L.deleteDoc('funds', f.id), 'Fund removed') }
                      else { setArmedDelete(f.id); toast('Click × again to delete') }
                    }}>×</button>
                  </div>
                </div>
                <div className="fin-muted" style={{ fontSize: 13 }}>{f.purpose || ''}</div>
                <div className="fin-row fin-spread">
                  <label className="fin-muted" style={{ fontSize: 12 }}>Balance</label>
                  <Cell inputMode="decimal" aria-label={`${f.name} balance`} value={(+f.balance || 0).toFixed(2)} onCommit={v => write(() => L.setDoc('funds', f.id, { ...f, balance: num(v), asOf: todayISO }), 'Balance updated')} />
                </div>
                {+f.target ? <>
                  <Bar pct={pct} cls={pct >= 100 ? 'done' : ''} />
                  <div className="fin-muted" style={{ fontSize: 12 }}>{pct.toFixed(0)}% of {money(f.target, false)} goal</div>
                </> : null}
                <div className="fin-muted" style={{ fontSize: 12 }}>
                  {+f.monthly ? `${money(f.monthly)}/mo` : 'No set contribution'}{f.asOf ? ` · as of ${fmtDate(f.asOf)}` : ''}
                </div>
              </div>
            )
          }) : <div className="fin-panel fin-empty">No savings funds yet.</div>}
        </div>
        <div className="fin-panel">
          <h3>Add a savings fund</h3>
          <form className="fin-add" onSubmit={addFund}>
            <label style={{ flex: '1 1 140px' }}>Name<input name="nfName" required /></label>
            <label style={{ flex: '1 1 160px' }}>Purpose<input name="nfPurpose" placeholder="Emergency, car, holidays…" /></label>
            <label>Account<select name="nfAcct" defaultValue="">
              <option value="">—</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.id} {a.name}</option>)}
            </select></label>
            <label>Balance<input className="fin-amt" name="nfBal" inputMode="decimal" placeholder="0.00" /></label>
            <label>Goal<input className="fin-amt" name="nfTarget" inputMode="decimal" placeholder="0" /></label>
            <label>Monthly<input className="fin-amt" name="nfMonthly" inputMode="decimal" placeholder="0" /></label>
            <button className="fin-btn fin-small" type="submit">Add fund</button>
          </form>
        </div>
      </div>
    )
  }

  /* ---------- Setup ---------- */
  function Setup() {
    const its = [...items].sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || a.name.localeCompare(b.name))
    const setItem = (id, field, value) => {
      const next = structuredClone(cfg)
      const it = next.items.find(i => i.id === id)
      it[field] = value
      saveCfg(next)
    }
    const setAcct = (id, field, value) => {
      const next = structuredClone(cfg)
      next.accounts.find(a => a.id === id)[field] = value
      saveCfg(next)
    }
    function addItem() {
      const next = structuredClone(cfg)
      next.items.push({ id: newId('i'), name: 'New line', group: 'Personal', account: accounts[0]?.id || '', monthly: 0, active: true })
      saveCfg(next)
    }
    function addAccount(e) {
      e.preventDefault()
      const f = e.target
      const id = f.naId.value.trim(), name = f.naName.value.trim()
      if (!id || !name) return
      if (accounts.some(a => a.id === id)) { toast('That account number is already listed.'); return }
      const next = structuredClone(cfg)
      next.accounts.push({ id, name, type: f.naType.value.trim() })
      saveCfg(next)
      f.reset()
    }
    function removeAccount(id) {
      if (items.some(i => i.account === id)) { toast('Move its bills to another account first.'); return }
      const next = structuredClone(cfg)
      next.accounts = next.accounts.filter(a => a.id !== id)
      saveCfg(next)
    }
    return (
      <div className="fin-stack">
        <div className="fin-panel fin-tw">
          <div className="fin-row fin-spread" style={{ marginBottom: 8 }}>
            <h2>Bills and categories</h2>
            <button className="fin-btn fin-small" onClick={addItem}>Add a line</button>
          </div>
          <p className="fin-muted" style={{ margin: '0 0 10px', fontSize: 13 }}>
            Monthly amount feeds the Plan column. Account is where the money moves on payday. Turn a line off to hide it from new paychecks without losing its history.
          </p>
          <table>
            <thead><tr><th>Name</th><th>Group</th><th>Account</th><th className="fin-num">Monthly</th><th className="fin-num">Due day</th><th>On</th></tr></thead>
            <tbody>
              {its.map(i => (
                <tr key={i.id}>
                  <td><Cell className="" style={{ width: '100%', minWidth: 130 }} value={i.name} aria-label="Name" onCommit={v => setItem(i.id, 'name', v)} /></td>
                  <td><select value={i.group} aria-label="Group" onChange={e => setItem(i.id, 'group', e.target.value)}>{GROUPS.map(g => <option key={g}>{g}</option>)}</select></td>
                  <td><select value={i.account} aria-label="Account" onChange={e => setItem(i.id, 'account', e.target.value)}>
                    {!accounts.some(a => a.id === i.account) && <option value={i.account}>{i.account || '—'}</option>}
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.id} {a.name}</option>)}
                  </select></td>
                  <td className="fin-num"><Cell inputMode="decimal" aria-label="Monthly" value={+i.monthly || 0} onCommit={v => setItem(i.id, 'monthly', num(v))} /></td>
                  <td className="fin-num"><Cell style={{ width: 60 }} inputMode="numeric" placeholder="-" aria-label="Due day" value={i.due || ''} onCommit={v => setItem(i.id, 'due', parseInt(v) || null)} /></td>
                  <td><input type="checkbox" checked={i.active !== false} aria-label="Active" onChange={e => setItem(i.id, 'active', e.target.checked)} /></td>
                </tr>
              ))}
              {!its.length && <tr><td colSpan={6} className="fin-muted">No bills yet. Use “Add a line” to start.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="fin-panel">
          <h3>SchoolsFirst accounts</h3>
          <div className="fin-xfer fin-xfer-edit">
            {accounts.map(a => [
              <span key={a.id + 'i'} className="fin-id">{a.id}</span>,
              <Cell key={a.id + 'n'} className="" value={a.name} aria-label="Account name" onCommit={v => setAcct(a.id, 'name', v)} />,
              <Cell key={a.id + 't'} className="" style={{ width: 110 }} value={a.type || ''} placeholder="Type" aria-label="Account type" onCommit={v => setAcct(a.id, 'type', v)} />,
              <button key={a.id + 'x'} className="fin-x" aria-label={`Remove ${a.name}`} onClick={() => removeAccount(a.id)}>×</button>,
            ])}
          </div>
          <form className="fin-add" style={{ marginTop: 12 }} onSubmit={addAccount}>
            <label>Number<input name="naId" style={{ width: 70 }} required /></label>
            <label style={{ flex: '1 1 140px' }}>Name<input name="naName" required /></label>
            <label>Type<input name="naType" placeholder="Checking" style={{ width: 110 }} /></label>
            <button className="fin-btn fin-small" type="submit">Add account</button>
          </form>
        </div>
      </div>
    )
  }

  let body
  if (!L.loaded) body = <div className="fin-empty">Loading your ledger…</div>
  else if (L.needsSetup) body = (
    <div className="fin-panel fin-empty">
      The ledger's storage table isn't set up yet. Run <code>supabase/finance_docs.sql</code> in the Supabase SQL editor, then reload.
    </div>
  )
  else if (!cfg) body = (
    <div className="fin-panel fin-empty">
      <p style={{ marginTop: 0 }}>No budget set up yet. Start one, then add your bills and accounts on the Setup tab.</p>
      <button className="fin-btn" onClick={() => { write(() => L.setDoc('config', 'main', DEFAULT_CONFIG), 'Budget started'); go('setup') }}>Start my budget</button>
    </div>
  )
  else body = { overview: Overview, checks: Paychecks, month: MonthlyBudget, register: Register, debts: Debts, savings: Savings, setup: Setup }[tab]?.() ?? Overview()

  return (
    <div className="fin-ledger">
      <header className="fin-top">
        <div>
          <h1>Paycheck Ledger</h1>
          <div className="fin-sub">Plan each check, watch the month add up, log what you spend.</div>
        </div>
        <div className="fin-row">
          <label className="fin-muted" htmlFor="finMonth" style={{ fontSize: 13 }}>Month</label>
          <input type="month" id="finMonth" value={month} onChange={e => e.target.value && setMonth(e.target.value)} />
        </div>
      </header>
      <nav className="fin-tabs" role="tablist">
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => go(k)}>{l}</button>
        ))}
      </nav>
      <main>{body}</main>
      <div className={`fin-toast${toastMsg ? ' on' : ''}`} role="status" aria-live="polite">{toastMsg}</div>
    </div>
  )
}
