// Maps a raw item from the Notion CSEA database (see api/notion-csea.js) to
// a member_interactions record.
const CATEGORY_MAP = {
  General: 'General',
  Grievance: 'Grievance',
  Benefits: 'Benefits',
  Discipline: 'Discipline',
  Contract: 'Contract',
  Other: 'Other',
}

export function notionItemToInteraction(item) {
  const date = item.dateSpoken || (item.createdTime ? item.createdTime.split('T')[0] : new Date().toISOString().split('T')[0])
  const memberName = item.memberName || item.title || 'Unknown'

  return {
    category: CATEGORY_MAP[item.category] || 'General',
    date_spoke: date,
    member_name: memberName,
    work_location: item.workLocation || '',
    discussion: item.discussion || item.title || '',
    who_involved: 'Jennifer Detar',
    contact_person: memberName,
    point_of_contact: item.pointOfContact || '',
    archived: false,
  }
}
