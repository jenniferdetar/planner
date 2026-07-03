import { useState, useCallback } from 'react'
import { useHoaItems, CATEGORIES, PRIORITIES, STATUSES } from '../hooks/useHoaItems'
import { useYahooHoaSync } from '../hooks/useYahooHoaSync'
import { useGmailHoaSync } from '../hooks/useGmailHoaSync'
import './HoaPanel.css'

const STATUS_COLORS = {
  'Not Started': '#aaa',
  'In Progress': '#f0a040',
  'Completed':   '#5cb85c',
  'Resolved':    '#5c9ee0',
}
const PRIORITY_COLORS = { High: '#e05c5c', Medium: '#f0a040', Low: '#5c9ee0' }
const CAT_COLORS = {
  Maintenance: '#1e3070',
  Financials:  '#3a5c4a',
  Insurance:   '#4a7ab5',
  Legal:       '#a05050',
  General:     '#888',
}

const BLANK = { category: 'Maintenance', unit: '', title: '', priority: 'Medium', status: 'In Progress', item_date: '', notes: '' }

// Board Member Packets pulled from the HOA Google Drive folder
// https://drive.google.com/drive/u/0/folders/1DPzR6n9aPRHdGtBagWXVygwqLh8Hm5oV
const HOA_DOCUMENTS = [
  { id: '1wv2AN58xec2YDEnynog3QN28dOauOBQE', title: 'Board Member Packet — Jan 2024' },
  { id: '1h-7f6dhFwpAEpyNIUlnyGcH05xAHJcOw', title: 'Board Member Packet — Feb 2024' },
  { id: '1ZeGmCwBcAbAUK0_4mdAN5Th6SlQLGp-m', title: 'Board Member Packet — Apr 2024' },
  { id: '1MgETqM7M4EDjvSVlhatNUky8VFs-ZbV0', title: 'Board Member Packet — May 2024' },
  { id: '1LQyPsnjOLRPqqSaLLMAR0QsVGXvaarcC', title: 'Board Member Packet — Jun 2024' },
  { id: '1XKu--0UeWgNF1ZsjqVGMpH20Y80kCtU2', title: 'Board Member Packet — Jul 2024' },
  { id: '1Ij5F2FRxYwcD8c0JoEkRfPY_P2heFhGz', title: 'Board Member Packet — Sep 2024' },
  { id: '1aIvXmf8Ol8OjqrBbP0fjlt_mKCcv5MF2', title: 'Board Member Packet — Oct 2024' },
  { id: '1aBXR0EmAOQhXG_TcXhMHjS5_z0_GiHvk', title: 'Board Member Packet — Nov 2024' },
  { id: '1LBzAgsy3GODMkC-qcxXGNLmcV97h2kPR', title: 'Board Member Packet — Dec 2024' },
  { id: '1jbaHr99QhI14moBzKqFaaWSi5qWQkjOE', title: 'Board Member Packet — Jan 2025' },
  { id: '19VlHDMhTYu8vyPAJNfuCIIY9EKFgWfPE', title: 'Board Member Packet — Feb 2025' },
  { id: '1yQQOxo8CryxFfQZILwVKdzBbrGvK6HLU', title: 'Board Member Packet — Apr 2025' },
  { id: '1idbmHBmTZmPWSFH_r3SyBFyLZiaaAfIz', title: 'Board Member Packet — May 2025' },
  { id: '1bkey6UkJwQbawYzb02_Trn9OsEBU5Cll', title: 'Board Member Packet — Jun 2025' },
  { id: '11ci-Ovd_u7W_L8RWwSOOqNtBbo7h0DPw', title: 'Board Member Packet — Jul 2025' },
  { id: '10JWSkMl_Z-fOfHaqZeiY8Lfif8Lex0zO', title: 'Board Member Packet — Aug 2025' },
  { id: '1UxwpH8OIuytYT_gPI_nM4uknoc2l07r8', title: 'Board Member Packet — Sep 2025' },
  { id: '1b0HZBKcKaGgpKK9DITEUh7iXxYP-TqOF', title: 'Board Member Packet — Oct 2025' },
  { id: '1NjMitsQaTKSt7pD3qKUnxh1q6TVFbcii', title: 'Board Member Packet — Nov 2025' },
  { id: '1Fbqk5-uGowoSQOwM5aqV65nj-PXJE5Q8', title: 'Board Member Packet — Dec 2025' },
  { id: '1EczD8IEv11e2PKQzhnTRzIT9JXgv5uca', title: 'Board Member Packet — Jan 2026' },
  { id: '1hUh2lB4f2y1MTIM_SxGzURBri539FYR1', title: 'Board Member Packet — Feb 2026' },
  { id: '1kPnz_THZsDM2-9XvJbD8HKk3H5s9eVlP', title: 'Board Member Packet — Mar 2026' },
  { id: '1Tpua6LoxnXvzZAI2cWGwXCmu189ptU-T', title: 'Board Member Packet — Apr 2026' },
  { id: '1Vh5US5NUKaPNaI-nbNFbtE6KgG56Bm0H', title: 'Board Member Packet — May 2026' },
].map(d => ({ ...d, url: `https://drive.google.com/file/d/${d.id}/view` })).reverse()

// Monthly financial summary pulled from the Board Member Packets above
// (Balance Sheet / Cash Flow / Annual Budget sections of each PDF)
const HOA_FINANCIALS_RAW = [
  { month: 'Jun 2025', operating_cash: 117647.19, reserve_assets: 508434.67, total_assets: 626081.86, total_reserves: 719774.18, net_income_mtd: 31292.18, net_income_ytd: -12879.57, total_income_mtd: 55407.11, total_expense_mtd: 24114.93 },
  { month: 'Jul 2025', operating_cash: 126271.37, reserve_assets: 513478.92, total_assets: 639750.29, total_reserves: 724818.43, net_income_mtd: 8624.18, net_income_ytd: -4255.39, total_income_mtd: 62203.88, total_expense_mtd: 53579.70 },
  { month: 'Aug 2025', operating_cash: 157376.66, reserve_assets: 368702.34, total_assets: 526079.00, total_reserves: 729827.85, net_income_mtd: -118680.71, net_income_ytd: -122936.10, total_income_mtd: 58087.19, total_expense_mtd: 176767.90 },
  { month: 'Sep 2025', operating_cash: 142149.25, reserve_assets: 373664.75, total_assets: 515814.00, total_reserves: 734790.26, net_income_mtd: -15327.41, net_income_ytd: -138263.51, total_income_mtd: 61584.97, total_expense_mtd: 76912.38 },
  { month: 'Oct 2025', operating_cash: 71289.05, reserve_assets: 393095.14, total_assets: 464384.19, total_reserves: 739765.67, net_income_mtd: -56405.22, net_income_ytd: -194668.73, total_income_mtd: 64408.70, total_expense_mtd: 120813.92 },
  { month: 'Nov 2025', operating_cash: 50117.37, reserve_assets: 398074.13, total_assets: 448191.50, total_reserves: 744744.66, net_income_mtd: -21271.68, net_income_ytd: -215940.41, total_income_mtd: 50386.74, total_expense_mtd: 71658.42 },
  { month: 'Dec 2025', operating_cash: 142905.37, reserve_assets: 338235.21, total_assets: 481140.58, total_reserves: 684905.74, net_income_mtd: 92788.00, net_income_ytd: -123152.41, total_income_mtd: 70647.77, total_expense_mtd: -22140.23 },
  { month: 'Jan 2026', operating_cash: 116713.12, reserve_assets: 279332.30, total_assets: 396045.42, total_reserves: 626002.83, net_income_mtd: -26192.25, net_income_ytd: -26192.25, total_income_mtd: 71279.82, total_expense_mtd: 97472.07 },
  { month: 'Feb 2026', operating_cash: 144554.52, reserve_assets: 285204.30, total_assets: 429758.82, total_reserves: 631874.83, net_income_mtd: 27741.40, net_income_ytd: 1549.15, total_income_mtd: 69102.66, total_expense_mtd: 41361.26 },
  { month: 'Mar 2026', operating_cash: 124824.77, reserve_assets: 291083.27, total_assets: 415908.04, total_reserves: 637753.80, net_income_mtd: -19829.75, net_income_ytd: -18280.60, total_income_mtd: 84555.52, total_expense_mtd: 104385.27 },
  { month: 'Apr 2026', operating_cash: 159467.33, reserve_assets: 296965.58, total_assets: 456432.91, total_reserves: 643636.11, net_income_mtd: 34642.56, net_income_ytd: 16361.96, total_income_mtd: 61207.50, total_expense_mtd: 26564.94 },
  { month: 'May 2026', operating_cash: 155541.61, reserve_assets: 302851.92, total_assets: 458393.53, total_reserves: 649522.45, net_income_mtd: -3925.72, net_income_ytd: 12436.24, total_income_mtd: 66618.28, total_expense_mtd: 70544.00 },
]

const HOA_FINANCIALS = HOA_FINANCIALS_RAW.map(m => {
  const doc = HOA_DOCUMENTS.find(d => d.title.endsWith(m.month))
  return { ...m, docUrl: doc?.url }
})

function fmtUSD(n) {
  if (n === null || n === undefined) return '—'
  return Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// Shared state so the header/stats/form and the item groups can render on
// separate binder pages while staying in sync.
export function useHoaPage(userId, providerToken) {
  const { items, loading, addItem, updateItem, deleteItem, reload } = useHoaItems(userId)
  const [tab, setTab] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [editId, setEditId] = useState(null)
  const [showArchived, setShowArchived] = useState(false)

  const onImported = useCallback(() => reload?.(), [reload])
  const { sync: syncYahoo, syncing: yahooSyncing, newCount: yahooNewCount, error: yahooError } = useYahooHoaSync(userId, onImported)
  const { sync: syncGmail, syncing: gmailSyncing, newCount: gmailNewCount, error: gmailError } = useGmailHoaSync(userId, providerToken, onImported)

  const tabs = ['All', ...CATEGORIES]
  const visibleItems = showArchived ? items : items.filter(i => !i.archived)
  const filtered = tab === 'All' ? visibleItems : visibleItems.filter(i => i.category === tab)

  const counts = {}
  CATEGORIES.forEach(c => { counts[c] = items.filter(i => i.category === c && !i.archived && i.status !== 'Completed' && i.status !== 'Resolved').length })

  function openAdd() {
    setForm(BLANK)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(item) {
    setForm({
      category: item.category,
      unit: item.unit || '',
      title: item.title,
      priority: item.priority,
      status: item.status,
      item_date: item.item_date || '',
      notes: item.notes || '',
    })
    setEditId(item.id)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const fields = { ...form, unit: form.unit || null, item_date: form.item_date || null, notes: form.notes || null }
    if (editId) {
      await updateItem(editId, fields)
    } else {
      await addItem(fields)
    }
    setShowForm(false)
    setEditId(null)
    setForm(BLANK)
  }

  const groupEntries = Object.entries(
    filtered.reduce((groups, item) => {
      const key = item.unit ? `Unit ${item.unit}` : 'General / Board-Wide'
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
      return groups
    }, {})
  ).sort(([a], [b]) => {
    if (a === 'General / Board-Wide') return 1
    if (b === 'General / Board-Wide') return -1
    return a.localeCompare(b, undefined, { numeric: true })
  })

  return {
    tabs, tab, setTab, showForm, setShowForm, form, setForm, editId, setEditId, showArchived, setShowArchived,
    syncYahoo, yahooSyncing, yahooNewCount, yahooError,
    syncGmail, gmailSyncing, gmailNewCount, gmailError, hasGmailToken: !!providerToken,
    counts, loading, filtered,
    groups: groupEntries,
    openAdd, openEdit, handleSubmit, deleteItem,
  }
}

function HoaFinancials() {
  const latest = HOA_FINANCIALS[HOA_FINANCIALS.length - 1]
  const maxAssets = Math.max(...HOA_FINANCIALS.map(m => m.total_assets || 0), 1)
  return (
    <div className="hoa-fin">
      {latest && (
        <div className="hoa-fin-stats">
          <div className="hoa-fin-stat">
            <span className="hoa-fin-stat-lbl">Total Assets</span>
            <span className="hoa-fin-stat-num">{fmtUSD(latest.total_assets)}</span>
          </div>
          <div className="hoa-fin-stat">
            <span className="hoa-fin-stat-lbl">Reserve Funds</span>
            <span className="hoa-fin-stat-num">{fmtUSD(latest.total_reserves)}</span>
          </div>
          <div className="hoa-fin-stat">
            <span className="hoa-fin-stat-lbl">Operating Cash</span>
            <span className="hoa-fin-stat-num">{fmtUSD(latest.operating_cash)}</span>
          </div>
          <div className="hoa-fin-stat">
            <span className="hoa-fin-stat-lbl">Net Income (MTD)</span>
            <span className={`hoa-fin-stat-num ${Number(latest.net_income_mtd) < 0 ? 'neg' : 'pos'}`}>{fmtUSD(latest.net_income_mtd)}</span>
          </div>
        </div>
      )}

      <p className="hoa-fin-asof">{latest ? `As of ${latest.month}` : 'No financial data available yet.'} — pulled from the Board Member Packets in the HOA Google Drive folder.</p>

      {HOA_FINANCIALS.length > 0 && (
        <div className="hoa-fin-chart">
          <span className="hoa-fin-chart-title">Total Assets by Month</span>
          <div className="hoa-fin-bars">
            {HOA_FINANCIALS.map(m => (
              <div key={m.month} className="hoa-fin-bar-col" title={`${m.month}: ${fmtUSD(m.total_assets)}`}>
                <div className="hoa-fin-bar" style={{ height: `${Math.max(4, (m.total_assets / maxAssets) * 100)}%` }} />
                <span className="hoa-fin-bar-lbl">{m.month.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {HOA_FINANCIALS.length > 0 && (
        <div className="hoa-fin-table-wrap">
          <table className="hoa-fin-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Assets</th>
                <th>Reserves</th>
                <th>Operating Cash</th>
                <th>Income (MTD)</th>
                <th>Expense (MTD)</th>
                <th>Net Income (MTD)</th>
                <th>Net Income (YTD)</th>
              </tr>
            </thead>
            <tbody>
              {[...HOA_FINANCIALS].reverse().map(m => (
                <tr key={m.month}>
                  <td>{m.docUrl ? <a href={m.docUrl} target="_blank" rel="noreferrer noopener">{m.month}</a> : m.month}</td>
                  <td>{fmtUSD(m.total_assets)}</td>
                  <td>{fmtUSD(m.total_reserves)}</td>
                  <td>{fmtUSD(m.operating_cash)}</td>
                  <td>{fmtUSD(m.total_income_mtd)}</td>
                  <td>{fmtUSD(m.total_expense_mtd)}</td>
                  <td className={Number(m.net_income_mtd) < 0 ? 'neg' : 'pos'}>{fmtUSD(m.net_income_mtd)}</td>
                  <td className={Number(m.net_income_ytd) < 0 ? 'neg' : 'pos'}>{fmtUSD(m.net_income_ytd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function HoaForm({ api }) {
  const { form, setForm, editId, handleSubmit, setShowForm, setEditId } = api
  return (
    <form className="hoa-form" onSubmit={handleSubmit}>
      <div className="hoa-form-row">
        <select className="hoa-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input className="hoa-input hoa-input-sm" placeholder="Unit #" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
        <input type="date" className="hoa-input hoa-input-sm" value={form.item_date} onChange={e => setForm(f => ({ ...f, item_date: e.target.value }))} />
      </div>
      <input className="hoa-input" placeholder="Title *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      <div className="hoa-form-row">
        <div className="hoa-btn-group">
          {PRIORITIES.map(p => (
            <button key={p} type="button"
              className={`hoa-btn-option ${form.priority === p ? 'active' : ''}`}
              style={{ '--bc': PRIORITY_COLORS[p] }}
              onClick={() => setForm(f => ({ ...f, priority: p }))}>{p}</button>
          ))}
        </div>
        <div className="hoa-btn-group">
          {STATUSES.map(s => (
            <button key={s} type="button"
              className={`hoa-btn-option ${form.status === s ? 'active' : ''}`}
              style={{ '--bc': STATUS_COLORS[s] }}
              onClick={() => setForm(f => ({ ...f, status: s }))}>{s}</button>
          ))}
        </div>
      </div>
      <textarea className="hoa-textarea" rows={3} placeholder="Notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      <div className="hoa-form-actions">
        <button type="button" className="hoa-cancel-btn" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</button>
        <button type="submit" className="hoa-save-btn">{editId ? 'Save Changes' : 'Add Item'}</button>
      </div>
    </form>
  )
}

function HoaUnitGroup({ unit, items, onEdit, onDelete }) {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <div className={`hoa-group${collapsed ? '' : ' expanded'}`}>
      <div className="hoa-group-header" onClick={() => setCollapsed(c => !c)}>
        <span className="hoa-group-name">{unit}</span>
        <span className="hoa-group-count">{items.length}</span>
        <button className="hoa-group-toggle" onClick={e => { e.stopPropagation(); setCollapsed(c => !c) }}>
          {collapsed ? '▾' : '▴'}
        </button>
      </div>
      {!collapsed && (
        <div className="hoa-group-items">
          {items.map(item => (
            <div key={item.id} className="hoa-group-card">
              <div className="hoa-group-card-header">
                <span className="hoa-group-cat-badge" style={{ background: CAT_COLORS[item.category] + '22', color: CAT_COLORS[item.category] }}>{item.category}</span>
                <span className="hoa-group-priority" style={{ color: PRIORITY_COLORS[item.priority] }}>{item.priority}</span>
                <span className="hoa-group-status" style={{ background: STATUS_COLORS[item.status] + '22', color: STATUS_COLORS[item.status] }}>{item.status}</span>
                {item.item_date && <span className="hoa-group-date">{new Date(item.item_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                <button className="hoa-group-del" title="Delete" onClick={() => onDelete(item.id)}>✕</button>
              </div>
              <p className="hoa-group-title">{item.title}</p>
              {item.notes && <p className="hoa-group-notes">{item.notes}</p>}
              <button className="hoa-group-edit" onClick={() => onEdit(item)}>Edit</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HoaGroupList({ groups, api }) {
  return (
    <div className="hoa-groups">
      {api.loading && <p className="hoa-empty">Loading…</p>}
      {!api.loading && groups.length === 0 && <p className="hoa-empty">No items in this category.</p>}
      {groups.map(([unit, unitItems]) => (
        <HoaUnitGroup key={unit} unit={unit} items={unitItems} onEdit={api.openEdit} onDelete={api.deleteItem} />
      ))}
    </div>
  )
}

function HoaPanelInner({ api }) {
  return (
    <div className="hoa-panel">
      <div className="hoa-header">
        <span className="hoa-header-title">Park Reseda HOA</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className={`hoa-sync-btn${api.yahooSyncing ? ' spinning' : ''}`}
            onClick={api.syncYahoo}
            disabled={api.yahooSyncing}
            title={api.yahooError || (api.yahooNewCount != null ? `Last sync: ${api.yahooNewCount} new` : 'Sync Yahoo HOA emails')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            {api.yahooNewCount > 0 && <span className="hoa-sync-badge">{api.yahooNewCount}</span>}
          </button>
          {api.hasGmailToken && (
            <button
              className={`hoa-sync-btn${api.gmailSyncing ? ' spinning' : ''}`}
              onClick={api.syncGmail}
              disabled={api.gmailSyncing}
              title={api.gmailError || (api.gmailNewCount != null ? `Last sync: ${api.gmailNewCount} new` : 'Sync Gmail for elevator-related emails')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16v16H4z"/>
                <path d="m4 6 8 7 8-7"/>
              </svg>
              {api.gmailNewCount > 0 && <span className="hoa-sync-badge">{api.gmailNewCount}</span>}
            </button>
          )}
          <button className="hoa-add-btn" style={{ opacity: 0.75, fontSize: '10px' }} onClick={() => api.setShowArchived(a => !a)}>
            {api.showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
          {api.tab !== 'Financials' && <button className="hoa-add-btn" onClick={api.openAdd}>+ Add Item</button>}
        </div>
      </div>

      <div className="hoa-stats">
        {CATEGORIES.map(c => (
          <div key={c} className="hoa-stat" style={{ '--cat': CAT_COLORS[c] }}>
            <span className="hoa-stat-num">{api.counts[c]}</span>
            <span className="hoa-stat-lbl">{c}</span>
          </div>
        ))}
      </div>

      <div className="hoa-tabs">
        {api.tabs.map(t => (
          <button
            key={t}
            className={`hoa-tab ${api.tab === t ? 'active' : ''}`}
            style={{ '--tab-col': t === 'All' ? '#1e3070' : t === 'Financials' ? '#3a5c4a' : CAT_COLORS[t] }}
            onClick={() => api.setTab(t)}
          >{t}</button>
        ))}
      </div>

      {api.tab === 'Financials' && <HoaFinancials />}
      {api.tab !== 'Financials' && api.showForm && <HoaForm api={api} />}
      {api.tab !== 'Financials' && <HoaGroupList groups={api.groups} api={api} />}
    </div>
  )
}

export default function HoaPanel({ userId, providerToken }) {
  const api = useHoaPage(userId, providerToken)
  return <HoaPanelInner api={api} />
}
