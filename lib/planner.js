export const WORK_TIMES = [
  '5am','6am','7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm'
];

export const WORK_DAY_NAMES = [
  'SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'
];

export const DAY_CLASSES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export const WORK_HIGHLIGHTS = {
  0: { '10am': 'Take time to rest today!' },
  1: { '5am': '', '8am': 'Standup' },
  3: { '5am': "NEW YEAR'S EVE" },
  4: { '5am': "NEW YEAR'S DAY" },
  5: { '8am': 'Paylogs' }
};

export const HABITS = {
  'habit-home-care': ["Make beds", "Ana - Cleaning", "Recycling"],
  'habit-self-care': ["Shower", "Read", "Bring lunch to work"],
  'habit-week-days': ["Get up at 5:00 am", "Leave work at 3:30 pm", "Take train to work", "Listen to Bible app"],
  'habit-weekends': ["Get up at 7:00 am", "Plan/prep meals for the week", "Laundry"]
};

const PAYDAYS = [
  '2025-07-08', '2025-07-23', '2025-08-08', '2025-08-22', '2025-09-08', '2025-09-23',
  '2025-10-08', '2025-10-23', '2025-11-07', '2025-11-21', '2025-12-08', '2025-12-23',
  '2026-01-08', '2026-01-23', '2026-02-06', '2026-02-23', '2026-03-06', '2026-03-23',
  '2026-04-08', '2026-04-23', '2026-05-08', '2026-05-22', '2026-06-08', '2026-06-23'
];

const BUDGET_DAYS = [
  '2025-07-05', '2025-07-20', '2025-08-05', '2025-08-19', '2025-09-05', '2025-09-20',
  '2025-10-05', '2025-10-20', '2025-11-04', '2025-11-18', '2025-12-05', '2025-12-20',
  '2026-01-05', '2026-01-20', '2026-02-03', '2026-02-20', '2026-03-03', '2026-03-20',
  '2026-04-05', '2026-04-20', '2026-05-05', '2026-05-19', '2026-06-05', '2026-06-20'
];

export function getStartOfWeek(date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

export function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function getWeekRangeLabel(weekStart) {
  const start = new Date(weekStart);
  const end = addDays(start, 6);
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return `${fmt.format(start).toUpperCase()} - ${fmt.format(end).toUpperCase()}`;
}

export function getDayLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();
}

export function getPillClass(title) {
  const t = String(title || '').toUpperCase();
  if (t.includes('CSEA') || t.includes('LA FED')) return 'event-pill event-csea';
  if (t.includes('DUE')) return 'event-pill event-due';
  if (t.includes("JENNIFER'S PAYDAY") || t.includes('BUDGET/PAY BILLS')) return 'event-pill event-payday';
  return 'event-pill';
}

export function getStaticWeeklyInfo(dateStr) {
  const info = { tasks: [], notes: [], holiday: '', spending: '' };
  const dStr = dateStr.slice(0, 10);
  const d = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = d.getDay();

  if (PAYDAYS.includes(dStr)) info.notes.push("Jennifer's Payday");
  if (BUDGET_DAYS.includes(dStr)) info.notes.push('Budget/Pay Bills');

  const defaultTasks = {
    0: ['Make menu plan', 'Grocery shop', 'Clean out purse'],
    1: ['Dust furniture', 'Vacuum house'],
    2: ['Clean out fridge', 'Mop hard surfaces', 'Take out all trash', 'Clean microwave & stovetop'],
    3: ['Clean bathrooms', 'Change towels in bathrooms', 'Re-stock toilet paper'],
    4: ['Change bedroom sheets'],
    5: ['Clean electronic screens', 'Sort paperwork & mail', 'Take out all trash'],
    6: ['Clean car']
  };

  info.tasks = [...(defaultTasks[dayOfWeek] || [])];

  if (dStr === '2025-12-31') info.holiday = "NEW YEAR'S EVE";
  else if (dStr === '2026-01-01') {
    info.notes.push('HOA Due $520', 'Mortgage Due $2250');
    info.holiday = "NEW YEAR'S DAY";
    info.spending = '$ 2,770';
  }

  return info;
}

export function getMonthInfo(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const monthLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

  return { year, month, daysInMonth, startDayOfWeek, monthLabel, firstDay, lastDay };
}

export function parseEventTime(title) {
  const timeMatch = String(title || '').match(/^(\d{1,2}(am|pm))/i);
  return timeMatch ? timeMatch[1].toLowerCase() : '8am';
}
