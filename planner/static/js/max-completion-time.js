/**
 * Max Completion Time functionality for Opus One Planner
 */

function renderTable() {
    const tbody = document.querySelector('#paylog-submission-table tbody');
    if (!tbody || typeof maxCompletionTimeData === 'undefined') return;
    
    tbody.innerHTML = maxCompletionTimeData.map(row => `
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
      </tr>
    `).join('');
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
