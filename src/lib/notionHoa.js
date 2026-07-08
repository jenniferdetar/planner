// Maps a raw row from the Notion "Open Items" data source (see api/notion-hoa.js)
// to an hoa_items record. Notion's schema is structured, so this is a direct
// field mapping rather than the keyword-guessing hoaEmail.js does for emails.
const STATUS_MAP = {
  Open: 'Not Started',
  'In progress': 'In Progress',
  Done: 'Completed',
}

const CATEGORY_MAP = {
  Insurance: 'Insurance',
  Maintenance: 'Maintenance',
  Admin: 'General',
  Incident: 'Legal',
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
