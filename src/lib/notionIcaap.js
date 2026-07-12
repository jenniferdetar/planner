// Maps a raw item from the Notion iCAAP database (see api/notion-icaap.js)
// to an icaap_items record.
const STATUS_MAP = {
  'To Do': 'To Do',
  'In Progress': 'In Progress',
  Done: 'Done',
  Blocked: 'Blocked',
}

export function notionItemToIcaapItem(item) {
  return {
    title: item.title || '(untitled)',
    status: STATUS_MAP[item.status] || 'To Do',
    priority: item.priority || 'Medium',
    category: item.category || null,
    due_date: item.dueDate,
    description: item.description || null,
    notes: item.notes || null,
    archived: item.status === 'Done',
  }
}
