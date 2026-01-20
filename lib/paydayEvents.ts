export type PaydayEvent = {
  id: string;
  title: string;
  category: string;
  date: string;
  type: 'event';
};

const PAYDAY_DATES = [
  '2025-11-07',
  '2025-11-21',
  '2025-12-05',
  '2025-12-19',
  '2026-01-02',
  '2026-01-16',
  '2026-01-30',
  '2026-02-13',
  '2026-02-27',
  '2026-03-13',
  '2026-03-27',
  '2026-04-10',
  '2026-04-24',
  '2026-05-08',
  '2026-05-22',
  '2026-06-05',
  '2026-06-19'
];

const addDays = (dateStr: string, delta: number) => {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + delta);
  return date.toISOString().split('T')[0];
};

const inRange = (dateStr: string, start: string, end: string) =>
  dateStr >= start && dateStr <= end;

export const getPaydayEvents = (start: string, end: string): PaydayEvent[] => {
  const events: PaydayEvent[] = [];

  PAYDAY_DATES.forEach((dateStr) => {
    if (inRange(dateStr, start, end)) {
      events.push({
        id: `payday-${dateStr}`,
        title: "Jennifer's Payday",
        category: 'Payday',
        date: dateStr,
        type: 'event'
      });
    }

    const budgetDate = addDays(dateStr, -3);
    if (inRange(budgetDate, start, end)) {
      events.push({
        id: `budget-${dateStr}`,
        title: 'Budget/Pay Bills',
        category: 'Budget',
        date: budgetDate,
        type: 'event'
      });
    }
  });

  return events;
};
