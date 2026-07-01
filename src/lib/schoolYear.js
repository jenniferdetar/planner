// School year runs July 1 – June 30. Returns the July 1 start date of the
// school year currently in progress (or most recently completed) for `date`.
export function currentSchoolYearStart(date = new Date()) {
  const year = date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1
  return new Date(year, 6, 1)
}

// True if dateStr (YYYY-MM-DD) falls before the start of the current school year —
// i.e. it belongs to a school year that has already ended.
export function isBeforeCurrentSchoolYear(dateStr, today = new Date()) {
  if (!dateStr) return false
  const d = new Date(dateStr + 'T12:00:00')
  return d < currentSchoolYearStart(today)
}
