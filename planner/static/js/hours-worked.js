/**
 * Hours Worked functionality for Opus One Planner
 * Fetches data from Supabase and renders the hours-only table.
 */

const months = ['jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar', 'apr', 'may', 'jun'];

async function renderTable() {
    const tbody = document.querySelector('#hours-only-table tbody');
    const tfoot = document.querySelector('#hours-only-table tfoot');
    if (!tbody) return;

    if (!window.supabaseClient) {
        console.error('Supabase client not initialized');
        tbody.innerHTML = '<tr><td colspan="14" style="text-align:center;">Supabase not initialized.</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="14" style="text-align:center;">Loading hours data...</td></tr>';

    try {
        const { data: hoursRows, error } = await window.supabaseClient
            .from('Hours Worked')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        const dataRows = (hoursRows || []).filter(row => row.name !== 'Grand Total');

        if (dataRows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="14" style="text-align:center;">No data found.</td></tr>';
            return;
        }

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
                    ${months.map(m => `<td>${row[m] || ''}</td>`).join('')}
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
    } catch (err) {
        console.error('Error rendering hours table:', err);
        tbody.innerHTML = `<tr><td colspan="14" style="text-align:center; color: red;">Error: ${err.message}</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderTable();
});
