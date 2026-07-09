// Maps a raw item from the Notion HOA workspace (see api/notion-hoa.js) to an
// hoa_items record. Most items come from plain child pages nested under an
// Open Items bucket or a Completed items page rather than from structured
// Notion properties, so category/status are largely inferred from which
// bucket/page an item lives under (see api/notion-hoa.js SECTIONS) rather
// than read off a Notion select field.
const STATUS_MAP = {
  Open: 'Not Started',
  'In progress': 'In Progress',
  Done: 'Completed',
}

const CATEGORY_MAP = {
  // Legacy "Category " select values from data-source rows.
  Insurance: 'Insurance',
  Maintenance: 'Maintenance',
  Admin: 'General',
  Incident: 'Legal',
  // Bucket/Completed-items page names for nested child pages.
  Financials: 'Financials',
  Maintainence: 'Maintenance',
  'Maintaince & Repairs': 'Maintenance',
  Incidents: 'Legal',
  'Cleaning Scope of Work': 'Maintenance',
  Legal: 'Legal',
  Governance: 'General',
}

export function notionItemToHoaItem(item) {
  const unit = /^\d{1,4}$/.test((item.unitArea || '').trim()) ? item.unitArea.trim() : null
  const notes = unit ? null : (item.unitArea || null)

  return {
    category: CATEGORY_MAP[item.category] || 'General',
    unit,
    title: item.title || '(untitled)',
    priority: item.priority || 'Medium',
    status: STATUS_MAP[item.status] || 'Not Started',
    item_date: item.date,
    notes,
  }
}
