export const SHEET_SECTIONS = [
  { label: 'Physical', tone: 'mint' },
  { label: 'Mental', tone: 'mint' },
  { label: 'Relational', tone: 'mint' },
  { label: 'Self-Care', tone: 'rose' },
  { label: 'Hobbies', tone: 'rose' },
  { label: 'Home', tone: 'rose' },
  { label: 'Career', tone: 'slate' },
  { label: 'Financial', tone: 'slate' },
  { label: 'Organizational', tone: 'slate' },
  { label: 'Screen Time', tone: 'sand' },
  { label: 'Learn', tone: 'sand' },
  { label: 'CSEA', tone: 'sand' }
];

export const TITLE_SECTION_MAP: Record<string, string> = {
  'lose 50 lbs': 'Physical',
  'exercise more (start with walking)': 'Physical',
  'journal at least 3x a week': 'Mental',
  'attend church more often': 'Mental',
  'read': 'Hobbies',
  'get nails done': 'Self-Care',
  'make more home made meals': 'Self-Care',
  'can meals': 'Home',
  'save up for a freeze dryer': 'Home',
  'promote, if possible': 'Career',
  'get side gigs to leave lausd': 'Career',
  'help jeff with disability': 'Financial',
  'fully funded emergency fund': 'Financial',
  'de-clutter the living room': 'Organizational',
  'clean up the office': 'Organizational',
  "donate what's not being used": 'Organizational',
  'keep to commuter/work only': 'Screen Time',
  'complete coding course strong': 'Learn',
  'complete mba': 'Learn',
  'build relationships/network': 'CSEA',
  'talk to more members': 'CSEA',
  're-elected for mb committee': 'CSEA',
  'represent more members': 'CSEA',
  'find ways to grow meetings': 'CSEA'
};

export const CATEGORY_SECTION_MAP: Record<string, string> = {
  Health: 'Physical',
  Learning: 'Learn',
  Relationships: 'Relational',
  Career: 'Career',
  Financial: 'Financial',
  CSEA: 'CSEA',
  Personal: 'Self-Care',
  Hobbies: 'Hobbies'
};

export function normalizeGoalTitle(title: string) {
  return title.replace(/\s*\(.*\)\s*$/, '').trim();
}

export function getSheetSection(goal: { title: string; category: string }) {
  const titleKey = normalizeGoalTitle(goal.title).toLowerCase();
  
  if (titleKey === 'attend church more often' && goal.category === 'Relationships') {
    return 'Relational';
  }

  if (TITLE_SECTION_MAP[titleKey]) {
    return TITLE_SECTION_MAP[titleKey];
  }

  return CATEGORY_SECTION_MAP[goal.category] || goal.category || 'Other';
}
