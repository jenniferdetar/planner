// Chapter 500 Executive Board + Union Stewards (csea.com/chapters/500/contacts) —
// used to split the Interactions tab into E-Board vs. general Members.
export const EBOARD_MEMBERS = [
  // Executive Board
  'Letetsia Fox',
  'Jennifer Detar',
  'Carol Turckel',
  'Anita Persoff',
  'Ron Baucume',
  'Ronald Baucume',
  'Belva Douglas',
  'Christan Williams',
  'Franny Parrish',
  'Frances Parrish',
  'Gema Larios',
  // Union Stewards
  'Helen Lopez',
  'Marcia Scott',
]

// CSEA Labor Relations Representatives assigned to the chapter.
export const LABOR_REPS = [
  'Emily Raab',
  'Christopher Crump',
  'Matthew Korn',
  'Jennifer Rener',
  'Espie Medellin',
]

// Area I Council members/officers.
export const AREA_I_MEMBERS = []

// CSEA state-level officers/staff, and state-level contacts/topics.
export const STATE_MEMBERS = [
  'CSEA Member Benefits',
  "CSEA's 100th Annual Conference",
  'Jerry White',
  'Jessica Albert',
  'Travel Requests',
]

function toSet(names) {
  return new Set(names.map(n => n.trim().toLowerCase()))
}

const EBOARD_SET = toSet(EBOARD_MEMBERS)
const LABOR_REPS_SET = toSet(LABOR_REPS)
const AREA_I_SET = toSet(AREA_I_MEMBERS)
const STATE_SET = toSet(STATE_MEMBERS)

export function isEboardMember(name) {
  if (!name) return false
  return EBOARD_SET.has(name.trim().toLowerCase())
}

export function isLaborRep(name) {
  if (!name) return false
  return LABOR_REPS_SET.has(name.trim().toLowerCase())
}

export function isAreaIMember(name) {
  if (!name) return false
  return AREA_I_SET.has(name.trim().toLowerCase())
}

export function isStateMember(name) {
  if (!name) return false
  return STATE_SET.has(name.trim().toLowerCase())
}
