import { useState, useMemo, useEffect } from 'react'
import { useIcaapNote } from '../hooks/useIcaapNote'
import './MessageDeskPro.css'

const CATEGORIES = ['All', 'Marketing', 'Support', 'Sales', 'Onboarding', 'Reminders', 'General']
const CAT_COLORS = {
  Marketing: '#e05c5c',
  Support: '#4a90d9',
  Sales: '#f0a040',
  Onboarding: '#5cb85c',
  Reminders: '#9b59b6',
  General: '#73a882',
}

const DEFAULT_TEMPLATES = [
  { id: '1', name: 'Welcome New Customer', category: 'Onboarding', content: 'Hi {{firstName}}! Welcome to {{companyName}}. We\'re excited to have you on board. Your account is now active and ready to use. Reply HELP for assistance or STOP to opt out.', variables: ['firstName', 'companyName'], tags: ['welcome', 'onboarding'], createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: '2', name: 'Appointment Reminder', category: 'Reminders', content: 'Hi {{firstName}}, this is a reminder about your appointment on {{date}} at {{time}} with {{providerName}}. Reply C to confirm or R to reschedule.', variables: ['firstName', 'date', 'time', 'providerName'], tags: ['appointment', 'reminder'], createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: '3', name: 'Payment Due Reminder', category: 'Reminders', content: 'Hi {{firstName}}, your payment of {{amount}} is due on {{dueDate}}. Visit {{paymentLink}} to pay. Reply STOP to opt out.', variables: ['firstName', 'amount', 'dueDate', 'paymentLink'], tags: ['payment', 'billing'], createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: '4', name: 'Flash Sale Announcement', category: 'Marketing', content: '🔥 Flash Sale! Get {{discount}}% off everything at {{storeName}} today only. Shop now: {{link}} Reply STOP to opt out.', variables: ['discount', 'storeName', 'link'], tags: ['sale', 'promotion'], createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: '5', name: 'Support Ticket Opened', category: 'Support', content: 'Hi {{firstName}}, your support ticket #{{ticketId}} has been opened. We\'ll respond within {{responseTime}} hours. Track it at {{trackingLink}}.', variables: ['firstName', 'ticketId', 'responseTime', 'trackingLink'], tags: ['support', 'ticket'], createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: '6', name: 'Order Shipped', category: 'General', content: 'Great news, {{firstName}}! Your order #{{orderId}} has shipped via {{carrier}}. Track it here: {{trackingLink}}. Est. delivery: {{deliveryDate}}.', variables: ['firstName', 'orderId', 'carrier', 'trackingLink', 'deliveryDate'], tags: ['order', 'shipping'], createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: '7', name: 'Follow-Up After Demo', category: 'Sales', content: 'Hi {{firstName}}, thanks for joining our demo today! As discussed, {{productName}} can help with {{painPoint}}. Ready to move forward? Reply or call {{phone}}.', variables: ['firstName', 'productName', 'painPoint', 'phone'], tags: ['sales', 'follow-up'], createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: '8', name: 'Re-engagement Campaign', category: 'Marketing', content: 'Hi {{firstName}}, we miss you! It\'s been a while since your last visit. Here\'s {{discount}}% off your next purchase: {{promoCode}}. Valid until {{expiryDate}}.', variables: ['firstName', 'discount', 'promoCode', 'expiryDate'], tags: ['re-engagement', 'winback'], createdAt: '2025-01-01', updatedAt: '2025-01-01' },
]

function extractVariables(content) {
  const matches = content.match(/\{\{(\w+)\}\}/g) || []
  return [...new Set(matches.map(m => m.slice(2, -2)))]
}

function smsSegments(text) {
  return Math.ceil(text.length / 160) || 1
}

export default function MessageDeskPro({ userId }) {
  const { content: raw, handleChange: saveRaw } = useIcaapNote(userId, 'messagedesk-templates')
  const [templates, setTemplates] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | { mode: 'create'|'edit', template?: {} }
  const [deleteId, setDeleteId] = useState(null)
  const [toast, setToast] = useState(null)

  // Load templates from persisted JSON; seed with defaults on first load
  useEffect(() => {
    if (raw === undefined) return
    if (raw) {
      try { setTemplates(JSON.parse(raw)) } catch { setTemplates(DEFAULT_TEMPLATES) }
    } else {
      setTemplates(DEFAULT_TEMPLATES)
    }
  }, [raw])

  function persist(next) {
    setTemplates(next)
    saveRaw(JSON.stringify(next))
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = useMemo(() => {
    if (!templates) return []
    return templates.filter(t => {
      const matchCat = activeCategory === 'All' || t.category === activeCategory
      const q = search.toLowerCase()
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.content.toLowerCase().includes(q) || t.tags.some(g => g.toLowerCase().includes(q))
      return matchCat && matchSearch
    })
  }, [templates, activeCategory, search])

  const catCounts = useMemo(() => {
    if (!templates) return {}
    const counts = { All: templates.length }
    for (const cat of CATEGORIES.slice(1)) counts[cat] = templates.filter(t => t.category === cat).length
    return counts
  }, [templates])

  function handleSave(formData, editId) {
    const vars = extractVariables(formData.content)
    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    const now = new Date().toISOString().slice(0, 10)
    if (editId) {
      persist(templates.map(t => t.id === editId ? { ...t, ...formData, variables: vars, tags, updatedAt: now } : t))
      showToast('Template updated')
    } else {
      const newT = { id: Date.now().toString(), ...formData, variables: vars, tags, createdAt: now, updatedAt: now }
      persist([...templates, newT])
      showToast('Template created')
    }
    setModal(null)
  }

  function handleDelete(id) {
    persist(templates.filter(t => t.id !== id))
    setDeleteId(null)
    showToast('Template deleted')
  }

  function handleCopy(content) {
    navigator.clipboard.writeText(content).then(() => showToast('Copied to clipboard!'))
  }

  if (!templates) return <div className="mdp-loading">Loading…</div>

  return (
    <div className="mdp-wrap">
      <div className="mdp-header">
        <div>
          <h1 className="mdp-title">💬 MessageDesk Pro</h1>
          <p className="mdp-subtitle">Message template library — {templates.length} template{templates.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="mdp-btn-primary" onClick={() => setModal({ mode: 'create' })}>+ New Template</button>
      </div>

      <div className="mdp-toolbar">
        <div className="mdp-cats">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`mdp-cat-btn${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              <span className="mdp-cat-count">{catCounts[cat] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="mdp-search-wrap">
          <input
            className="mdp-search"
            placeholder="Search templates…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="mdp-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mdp-empty">
          {search || activeCategory !== 'All' ? 'No templates match your filter.' : 'No templates yet. Create your first one!'}
        </div>
      ) : (
        <div className="mdp-grid">
          {filtered.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={() => setModal({ mode: 'edit', template: t })}
              onDelete={() => setDeleteId(t.id)}
              onCopy={() => handleCopy(t.content)}
            />
          ))}
        </div>
      )}

      {modal && (
        <TemplateModal
          mode={modal.mode}
          template={modal.template}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteId && (
        <div className="mdp-overlay" onClick={() => setDeleteId(null)}>
          <div className="mdp-confirm" onClick={e => e.stopPropagation()}>
            <h3>Delete template?</h3>
            <p>This action cannot be undone.</p>
            <div className="mdp-confirm-btns">
              <button className="mdp-btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="mdp-btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="mdp-toast">{toast}</div>}
    </div>
  )
}

function TemplateCard({ template, onEdit, onDelete, onCopy }) {
  const color = CAT_COLORS[template.category] || '#73a882'
  const segments = smsSegments(template.content)
  return (
    <div className="mdp-card">
      <div className="mdp-card-header">
        <span className="mdp-cat-badge" style={{ background: color + '22', color }}>{template.category}</span>
        <div className="mdp-card-actions">
          <button className="mdp-icon-btn" title="Copy" onClick={onCopy}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </button>
          <button className="mdp-icon-btn" title="Edit" onClick={onEdit}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button className="mdp-icon-btn mdp-icon-btn-danger" title="Delete" onClick={onDelete}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div>
      </div>
      <h3 className="mdp-card-name">{template.name}</h3>
      <p className="mdp-card-content">{template.content}</p>
      <div className="mdp-card-footer">
        <span className="mdp-sms-info">{template.content.length} chars · {segments} SMS</span>
        {template.variables.length > 0 && (
          <div className="mdp-vars">
            {template.variables.map(v => <span key={v} className="mdp-var">{`{{${v}}}`}</span>)}
          </div>
        )}
      </div>
    </div>
  )
}

function TemplateModal({ mode, template, onSave, onClose }) {
  const [form, setForm] = useState({
    name: template?.name || '',
    category: template?.category || 'General',
    content: template?.content || '',
    tags: template?.tags?.join(', ') || '',
  })

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const vars = extractVariables(form.content)
  const segments = smsSegments(form.content)
  const canSave = form.name.trim() && form.content.trim()

  return (
    <div className="mdp-overlay" onClick={onClose}>
      <div className="mdp-modal" onClick={e => e.stopPropagation()}>
        <div className="mdp-modal-header">
          <h2>{mode === 'create' ? 'New Template' : 'Edit Template'}</h2>
          <span className="mdp-sms-info">{form.content.length} chars · {segments} SMS segment{segments !== 1 ? 's' : ''}</span>
          <button className="mdp-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="mdp-modal-body">
          <label className="mdp-label">
            Template Name
            <input className="mdp-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Appointment Reminder" />
          </label>

          <label className="mdp-label">
            Category
            <select className="mdp-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
            </select>
          </label>

          <label className="mdp-label">
            Message Content
            <textarea
              className="mdp-textarea"
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Use {{variableName}} for dynamic fields…"
              rows={5}
            />
          </label>

          {vars.length > 0 && (
            <div className="mdp-detected">
              <span className="mdp-detected-label">Variables detected:</span>
              {vars.map(v => <span key={v} className="mdp-var">{`{{${v}}}`}</span>)}
            </div>
          )}

          <label className="mdp-label">
            Tags <span className="mdp-hint">(comma-separated)</span>
            <input className="mdp-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="welcome, onboarding" />
          </label>
        </div>

        <div className="mdp-modal-footer">
          <button className="mdp-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="mdp-btn-primary" disabled={!canSave} onClick={() => onSave(form, template?.id)}>
            {mode === 'create' ? 'Create Template' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
