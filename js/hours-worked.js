/**
 * Hours Worked functionality for Opus One Planner
 */

function renderTable() {
    const tbody = document.querySelector('#hours-worked-table tbody');
    const tfoot = document.querySelector('#hours-worked-table tfoot');
    if (!tbody || typeof hoursWorkedData === 'undefined') return;
    
    // Filter out existing "Grand Total" row if it exists in the data
    const dataRows = hoursWorkedData.filter(row => row.name !== 'Grand Total');
    
    const months = ['jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar', 'apr', 'may', 'jun'];
    
    const parseVal = (val) => {
        if (!val) return 0;
        return parseFloat(String(val).replace(/,/g, '')) || 0;
    };

    const formatVal = (val) => {
        if (val === 0) return '';
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Calculate column totals
    const columnTotals = months.reduce((acc, month) => {
        acc[month] = dataRows.reduce((sum, row) => sum + parseVal(row[month]), 0);
        return acc;
    }, {});
    
    let grandTotalSum = 0;

    tbody.innerHTML = dataRows.map(row => {
        const rowTotal = months.reduce((acc, month) => acc + parseVal(row[month]), 0);
        grandTotalSum += rowTotal;

        return `
            <tr>
                <td>${row.name}</td>
                <td>${row.jul}</td>
                <td>${row.aug}</td>
                <td>${row.sep}</td>
                <td>${row.oct}</td>
                <td>${row.nov}</td>
                <td>${row.dec}</td>
                <td>${row.jan}</td>
                <td>${row.feb}</td>
                <td>${row.mar}</td>
                <td>${row.apr}</td>
                <td>${row.may}</td>
                <td>${row.jun}</td>
                <td>${formatVal(rowTotal)}</td>
            </tr>
        `;
    }).join('');

    if (tfoot) {
        tfoot.innerHTML = `
            <tr class="total-row">
                <td><strong>Grand Total</strong></td>
                ${months.map(month => `<td><strong>${formatVal(columnTotals[month])}</strong></td>`).join('')}
                <td><strong>${formatVal(grandTotalSum)}</strong></td>
            </tr>
        `;
    }
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
    renderTable();
});
