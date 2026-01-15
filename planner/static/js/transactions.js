/**
 * Transactions Module
 */

const transactionsPage = (() => {
    let tableBody, tableHeader;
    
    let accounts = [
        "Currently in Checking",
        "Jennifer's Check",
        "Tithe",
        "ADT",
        "Amazon",
        "Auto Maintenance",
        "Blow",
        "Cleaning Lady",
        "DWP",
        "Gas",
        "Groceries",
        "Hair",
        "HSA",
        "Laundry",
        "Mercury Auto Insurance",
        "Orkin",
        "Summer Saver",
        "Schools First Loan",
        "Spectrum",
        "Tahoe Registration",
        "Trailblazer Registration",
        "Verizon"
    ];

    let dates = [
        "2025-07-08", "2025-07-23", "2025-08-08", "2025-08-23",
        "2025-09-08", "2025-09-23", "2025-10-08", "2025-10-23",
        "2025-11-08", "2025-11-23", "2025-12-08", "2025-12-23",
        "2026-01-08"
    ];

    function initialize() {
        console.log('Initializing Transactions...');
        tableBody = document.getElementById('transactions-body');
        tableHeader = document.getElementById('transactions-header');
        
        this.setupDate();

        if (window.opusStorage) {
            // Check if we already registered a listener to avoid duplicates
            // opusStorage.on(render); // If opusStorage supports multiple listeners
            this.render();
        }
    }

    function setupDate() {
        const todayDate = document.getElementById('today-date');
        if (todayDate) {
            todayDate.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    function render() {
        if (!tableHeader || !tableBody) return;

        const transactions = opusStorage.getTransactions() || [];

        // Render Header
        let headerHtml = '<tr><th class="account-header">Account</th>';
        dates.forEach(date => {
            const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
            headerHtml += `<th><div class="header-date">💵 ${formattedDate}</div></th>`;
        });
        headerHtml += '</tr>';
        tableHeader.innerHTML = headerHtml;

        // Render Body
        let bodyHtml = '';
        accounts.forEach(account => {
            bodyHtml += `<tr><td>${account}</td>`;
            dates.forEach(date => {
                const tx = transactions.find(t => t.date === date && t.account === account);
                const value = tx ? tx.amount : 0;
                const txId = tx ? tx.id : `new-${account}-${date}`;
                const formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
                
                bodyHtml += `
                    <td>
                        <input type="text" 
                               class="amount-input ${value < 0 ? 'negative-amount' : ''}" 
                               value="${formattedValue}" 
                               data-account="${account}" 
                               data-date="${date}"
                               data-id="${txId}"
                               onblur="transactionsPage.handleBlur(this)"
                               onfocus="transactionsPage.handleFocus(this)">
                    </td>`;
            });
            bodyHtml += '</tr>';
        });
        tableBody.innerHTML = bodyHtml;
    }

    function handleFocus(input) {
        const value = parseFloat(input.value.replace(/[^0-9.-]+/g, "")) || 0;
        input.value = value === 0 ? '' : value;
    }

    function handleBlur(input) {
        const newValue = parseFloat(input.value) || 0;
        const account = input.dataset.account;
        const date = input.dataset.date;
        const txId = input.dataset.id;

        const transactions = opusStorage.getTransactions() || [];
        const existing = transactions.find(t => t.date === date && t.account === account);

        if (existing) {
            if (existing.amount !== newValue) {
                opusStorage.updateTransaction(existing.id, { amount: newValue });
            }
        } else if (newValue !== 0) {
            const newTx = {
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
                date,
                account,
                amount: newValue,
                category: 'General'
            };
            transactions.push(newTx);
            opusStorage.setTransactions(transactions);
        }
        
        // Local re-render to format currency
        input.value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(newValue);
        input.classList.toggle('negative-amount', newValue < 0);
    }

    return { initialize, setupDate, render, handleBlur, handleFocus };
})();

window.transactionsPage = transactionsPage;
