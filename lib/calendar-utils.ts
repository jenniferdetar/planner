export const toKey = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const startOfGrid = (date: Date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return start;
};

export const parseISO = (str: string | null) => {
  if (!str) return null;
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isHoliday = (date: Date) => {
  const holidays = [
    '01-01', '01-20', '02-17', '03-17', '05-26', '07-04', '09-07', '11-11', '11-27', '12-25'
  ];
  const monthDay = String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  return holidays.includes(monthDay);
};

export const classifyEvent = (item: any) => {
  const text = (item.title || '').toLowerCase();
  const category = (item.category || '').toLowerCase();
  const holidays = /new year|ml king|groundhog|valentine|president|chinese new year|mardi gras|ash wednesday|st\.? patrick|easter|april fool|passover|good friday|cinco de mayo|mother's day|armed forces|memorial|juneteenth|father's day|independence|labor|patriot|rosh hashanah|grandparent|constitution|yom kippur|columbus|boss's|united nations|halloween|veteran|daylight saving|thanksgiving|christmas|kwanzaa|new year's eve|pearl harbor/i;

  if (/🎂/.test(text) || category === 'birthday' || /birthday/i.test(text)) return 'birthday';
  if (/payday/i.test(text)) return 'payday';
  if (/budget.*pay|pay.*bills/i.test(text)) return 'budgetpay';
  if (/budget/i.test(text) || category === 'budget') return 'budget';
  if (category === 'christmas' || /christmas/i.test(text)) return 'christmas';
  if (/due/i.test(text) || category === 'finance') return 'due';
  if (holidays.test(text) || category === 'holiday') return 'holiday';
  if (/csea/i.test(text) || /la fed/i.test(text) || category === 'csea') return 'csea';
  if (/stay at|travel|hotel|vacation/i.test(text) || category === 'travel') return 'travel';
  if (/laundry|sweeping|cleaning|home care/i.test(text) || category === 'home') return 'home';
  if (/shower|bedtime|self care/i.test(text) || category === 'personal') return 'personal';
  return 'default';
};

export const styleMap: Record<string, { bg: string, border: string, text: string }> = {
  due:    { bg: '#ffd6e2', border: '#ff6b98', text: '#7a0f2b' },
  holiday:{ bg: '#ffe1b0', border: '#f59e0b', text: '#9a4d00' },
  csea:   { bg: '#b7dbff', border: '#3b82f6', text: '#0b3b70' },
  payday: { bg: '#c9f5dd', border: '#22c55e', text: '#0f4d2c' },
  budget: { bg: '#ffd4a8', border: '#f97316', text: '#9a3412' },
  budgetpay: { bg: '#bff0d4', border: '#10b981', text: '#0b4a3a' },
  christmas: { bg: '#0f6b3a', border: '#dc2626', text: '#ffffff' },
  birthday:{ bg: '#ffd9b5', border: '#fb923c', text: '#8a2d0f' },
  travel:  { bg: '#e0ccff', border: '#8b5cf6', text: '#4c1d95' },
  home:    { bg: '#ffeab5', border: '#eab308', text: '#7a5b00' },
  personal:{ bg: '#dbeafe', border: '#60a5fa', text: '#1e3a8a' },
  default:{ bg: '#e5e7eb', border: '#9ca3af', text: '#111827' }
};

export function expandPlannerForMonth(planner: any[], year: number, month: number) {
  const map: Record<string, any[]> = {};
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const rangeStart = new Date(monthStart);
  rangeStart.setDate(rangeStart.getDate() - 7);
  const rangeEnd = new Date(monthEnd);
  rangeEnd.setDate(rangeEnd.getDate() + 7);

  const pushEvent = (date: Date, item: any) => {
    const key = toKey(date);
    map[key] ??= [];
    map[key].push({ title: item.title, category: item.category || '' });
  };

  planner.forEach(item => {
    if (item.frequency === 'monthly' && item.pattern) {
      addMonthlyPatternOccurrences(item, rangeStart, rangeEnd, date => {
        if (date >= monthStart && date <= monthEnd) pushEvent(date, item);
      });
    } else if (item.frequency === 'monthly' && Number.isFinite(item.dayOfMonth)) {
      addMonthlyDayOccurrences(item, rangeStart, rangeEnd, date => {
        if (date >= monthStart && date <= monthEnd) pushEvent(date, item);
      });
    } else if (item.frequency === 'biweekly') {
      addBiweeklyOccurrences(item, rangeStart, rangeEnd, date => {
        if (date >= monthStart && date <= monthEnd) pushEvent(date, item);
      });
    } else if (item.frequency === 'weekly' && Array.isArray(item.weekdays)) {
      if ((item.title || '').toLowerCase() === 'lunch') return;
      if ((item.title || '').toLowerCase() === 'wake up') return;
      addWeeklyOccurrences(item, rangeStart, rangeEnd, date => {
        if (date >= monthStart && date <= monthEnd) pushEvent(date, item);
      });
    }
  });

  return map;
}

function addMonthlyPatternOccurrences(item: any, rangeStart: Date, rangeEnd: Date, onDate: (d: Date) => void) {
  let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const last = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);

  while (cursor <= last) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const baseDate = getPatternDate(year, month, item.pattern);

    if (baseDate) {
      if (!isSkippedMonth(baseDate, item.skipMonths)) {
        let finalDate = adjustForHolidayRule(baseDate, item.holidayRule, item.skipHolidays);
        if (finalDate >= rangeStart && finalDate <= rangeEnd) {
          if (withinSeries(finalDate, item.startDate, item.endDate)) {
            onDate(finalDate);
          }
        }
      }
    }
    cursor = new Date(year, month + 1, 1);
  }
}

function addMonthlyDayOccurrences(item: any, rangeStart: Date, rangeEnd: Date, onDate: (d: Date) => void) {
  let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const last = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);

  while (cursor <= last) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const candidate = new Date(year, month, item.dayOfMonth);
    if (candidate.getMonth() === month) {
      if (withinSeries(candidate, item.startDate, item.endDate) && !isSkippedMonth(candidate, item.skipMonths)) {
        const adjusted = adjustForHolidayRule(candidate, item.holidayRule, item.skipHolidays);
        if (adjusted >= rangeStart && adjusted <= rangeEnd) {
          onDate(adjusted);
        }
      }
    }
    cursor = new Date(year, month + 1, 1);
  }
}

function addBiweeklyOccurrences(item: any, rangeStart: Date, rangeEnd: Date, onDate: (d: Date) => void) {
  const anchor = parseISO(item.startDate);
  if (!anchor) return;
  let current = new Date(anchor);

  while (current < rangeStart) {
    current.setDate(current.getDate() + 14);
  }

  while (current <= rangeEnd) {
    if (withinSeries(current, item.startDate, item.endDate) && !isSkippedMonth(current, item.skipMonths)) {
      onDate(new Date(current));
    }
    current.setDate(current.getDate() + 14);
  }
}

function addWeeklyOccurrences(item: any, rangeStart: Date, rangeEnd: Date, onDate: (d: Date) => void) {
  const weekdays = Array.isArray(item.weekdays) ? item.weekdays : [];
  let current = new Date(rangeStart);
  const skipDates = new Set((item.skipDates || []).filter(Boolean));

  while (current <= rangeEnd) {
    const iso = current.toISOString().slice(0, 10);
    if (!skipDates.has(iso)) {
      if (weekdays.includes(current.getDay())) {
        if (withinSeries(current, item.startDate, item.endDate) && !isSkippedMonth(current, item.skipMonths)) {
          if (!(item.skipHolidays && isHoliday(current))) {
            onDate(new Date(current));
          }
        }
      }
    }
    current.setDate(current.getDate() + 1);
  }
}

function getPatternDate(year: number, month: number, pattern: string) {
  const match = pattern.match(/^(first|second|third|fourth|last)\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/i);
  if (!match) return null;
  const ordinalMap: Record<string, number> = { first: 0, second: 1, third: 2, fourth: 3, last: 4 };
  const dayMap: Record<string, number> = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 };
  const ordinal = ordinalMap[match[1].toLowerCase()];
  const dayOfWeek = dayMap[match[2].toLowerCase()];

  let count = 0;
  let target = null;

  for (let day = 1; day <= 31; day++) {
    const date = new Date(year, month, day);
    if (date.getMonth() !== month) break;
    if (date.getDay() === dayOfWeek) {
      if (ordinal === 4) {
        target = date;
      } else if (count === ordinal) {
        target = date;
        break;
      }
      count++;
    }
  }

  return target;
}

function isSkippedMonth(date: Date, skipMonths: string[]) {
  if (!Array.isArray(skipMonths) || skipMonths.length === 0) return false;
  const monthName = date.toLocaleDateString("en-US", { month: "long" });
  return skipMonths.some(month => monthName.toLowerCase() === String(month).toLowerCase());
}

function adjustForHolidayRule(date: Date, holidayRule: string, skipHolidays: boolean) {
  if (!holidayRule && !skipHolidays) return date;
  if (holidayRule === 'prevBusinessDay') {
    const adjusted = new Date(date);
    while (isHoliday(adjusted) || adjusted.getDay() === 0 || adjusted.getDay() === 6) {
      adjusted.setDate(adjusted.getDate() - 1);
    }
    return adjusted;
  }
  if ((skipHolidays || holidayRule === 'nextWeek') && isHoliday(date)) {
    const adjusted = new Date(date);
    adjusted.setDate(adjusted.getDate() + 7);
    return adjusted;
  }
  return date;
}

function withinSeries(date: Date, startDateStr: string | null, endDateStr: string | null) {
  const startDate = parseISO(startDateStr);
  const endDate = parseISO(endDateStr);
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}
