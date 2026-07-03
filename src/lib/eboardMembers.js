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

const EBOARD_SET = new Set(EBOARD_MEMBERS.map(n => n.trim().toLowerCase()))

export function isEboardMember(name) {
  if (!name) return false
  return EBOARD_SET.has(name.trim().toLowerCase())
}
