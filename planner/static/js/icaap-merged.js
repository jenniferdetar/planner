const months = [
  { key: 'jul', label: 'Jul<br/>2025' },
  { key: 'aug', label: 'Aug<br/>2025' },
  { key: 'sep', label: 'Sep<br/>2025' },
  { key: 'oct', label: 'Oct<br/>2025' },
  { key: 'nov', label: 'Nov<br/>2025' },
  { key: 'dec', label: 'Dec<br/>2025' },
  { key: 'jan', label: 'Jan<br/>2026' },
  { key: 'feb', label: 'Feb<br/>2026' },
  { key: 'mar', label: 'Mar<br/>2026' },
  { key: 'apr', label: 'Apr<br/>2026' },
  { key: 'may', label: 'May<br/>2026' },
  { key: 'jun', label: 'Jun<br/>2026' }
];

const toKey = (name) => (name || '').toLowerCase();

const parseVal = (val) => {
  if (!val) return 0;
  return parseFloat(String(val).replace(/,/g, '')) || 0;
};

const formatDateTwoLine = (val) => {
  if (!val) return '';
  const text = String(val).trim();
  const match = text.match(/^([A-Za-z]{3} \d{1,2}),\s*(\d{4})$/);
  if (match) {
    return `${match[1]}<br>${match[2]}`;
  }
  const parts = text.split(',');
  if (parts.length >= 2) {
    const left = parts[0].trim();
    const right = parts.slice(1).join(',').trim();
    if (left && right) {
      return `${left}<br>${right}`;
    }
  }
  return text;
};

async function buildMaps() {
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return { names: [], nameMap: new Map(), hoursMap: new Map(), paylogMap: new Map(), approvalMap: new Map() };
  }

  const [
    { data: hoursRows },
    { data: paylogRows },
    { data: approvalRows }
  ] = await Promise.all([
    window.supabaseClient.from('Hours Worked').select('*'),
    window.supabaseClient.from('Paylog Submission').select('*'),
    window.supabaseClient.from('Hours Worked Approved').select('*')
  ]);

  const filteredHoursRows = (hoursRows || []).filter((row) => row.name !== 'Grand Total');
  const filteredPaylogRows = paylogRows || [];
  const filteredApprovalRows = approvalRows || [];

  const nameMap = new Map();
  const hoursMap = new Map();
  const paylogMap = new Map();
  const approvalMap = new Map();

  filteredHoursRows.forEach((row) => {
    const key = toKey(row.name);
    if (!nameMap.has(key)) {
      nameMap.set(key, row.name);
    }
    hoursMap.set(key, row);
  });

  filteredPaylogRows.forEach((row) => {
    const key = toKey(row.name);
    if (!nameMap.has(key)) {
      nameMap.set(key, row.name);
    }
    paylogMap.set(key, row);
  });

  filteredApprovalRows.forEach((row) => {
    const key = toKey(row.name);
    if (!nameMap.has(key)) {
      nameMap.set(key, row.name);
    }
    approvalMap.set(key, row);
  });

  const names = Array.from(nameMap.values()).sort((a, b) => a.localeCompare(b));

  return { names, nameMap, hoursMap, paylogMap, approvalMap };
}

async function renderMergedTable() {
  const tbody = document.querySelector('#hours-worked-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="37" style="text-align:center; padding: 20px;">Loading data from Supabase...</td></tr>';

  try {
    const { names, hoursMap, paylogMap, approvalMap } = await buildMaps();

    if (names.length === 0) {
      tbody.innerHTML = '<tr><td colspan="37" style="text-align:center; padding: 20px;">No data found in Supabase.</td></tr>';
      return;
    }

    tbody.innerHTML = names.map((name) => {
      const key = toKey(name);
      const hours = hoursMap.get(key) || {};
      const paylog = paylogMap.get(key) || {};
      const approval = approvalMap.get(key) || {};

      const monthCells = months.map((month) => {
        const hoursVal = hours[month.key] || '';
        const paylogVal = formatDateTwoLine(paylog[month.key] || '');
        const approvalVal = formatDateTwoLine(approval[month.key] || '');

        return `
          <td>${hoursVal}</td>
          <td>${paylogVal}</td>
          <td>${approvalVal}</td>
        `;
      }).join('');

      return `
        <tr>
          <td>${name}</td>
          ${monthCells}
        </tr>
      `;
    }).join('');

    // Re-apply filter if needed after rendering
    const select = document.getElementById('month-filter');
    if (select && select.value !== 'all') {
      applyMonthFilter(select.value);
    }
  } catch (error) {
    console.error('Error rendering table:', error);
    tbody.innerHTML = `<tr><td colspan="37" style="text-align:center; padding: 20px; color: red;">Error loading data: ${error.message}</td></tr>`;
  }
}

function applyMonthFilter(value) {
  const table = document.getElementById('hours-worked-table');
  if (!table) return;

  const showAll = value === 'all';
  const rows = Array.from(table.rows);
  if (rows.length < 2) return;

  const headerRow = rows[0];
  const subHeaderRow = rows[1];

  Array.from(headerRow.cells).forEach((cell, index) => {
    if (index === 0) {
      cell.style.display = '';
      return;
    }
    const monthKey = months[index - 1]?.key;
    cell.style.display = showAll || monthKey === value ? '' : 'none';
  });

  Array.from(subHeaderRow.cells).forEach((cell, index) => {
    if (index === 0) {
      cell.style.display = '';
      return;
    }
    const monthIndex = Math.floor((index - 1) / 3);
    const monthKey = months[monthIndex]?.key;
    cell.style.display = showAll || monthKey === value ? '' : 'none';
  });

  rows.slice(2).forEach((row) => {
    Array.from(row.cells).forEach((cell, index) => {
      if (index === 0) {
        cell.style.display = '';
        return;
      }
      const monthIndex = Math.floor((index - 1) / 3);
      const monthKey = months[monthIndex]?.key;
      cell.style.display = showAll || monthKey === value ? '' : 'none';
    });
  });
}

function setupMonthFilter() {
  const select = document.getElementById('month-filter');
  if (!select) return;
  select.addEventListener('change', () => applyMonthFilter(select.value));
  applyMonthFilter(select.value || 'all');
}

function updateDate() {
  const todayDateElement = document.getElementById('today-date');
  if (!todayDateElement) return;

  const today = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  todayDateElement.textContent = today.toLocaleDateString('en-US', options);
}

document.addEventListener('DOMContentLoaded', () => {
  updateDate();
  renderMergedTable();
  setupMonthFilter();
});
