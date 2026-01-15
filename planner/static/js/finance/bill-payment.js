/**
 * Bill Payment Schedule Module
 * Standardized initialization for bill-payment-schedule page
 */

const billPaymentPage = {
    initialize: function() {
        console.log('Initializing Bill Payment Schedule...');
        this.setupDate();
        this.setupCheckboxes();
    },

    setupDate: function() {
        const todayDate = document.getElementById('today-date');
        if (todayDate) {
            todayDate.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    },

    setupCheckboxes: function() {
        const storageKey = 'bill-payment-schedule:checked';
        const boxes = document.querySelectorAll('.month-box');
        
        if (typeof opusStorage === 'undefined') {
            console.error('opusStorage not found, skipping checkbox state load');
            return;
        }

        // Load state
        const checkedState = opusStorage.getMetadata(storageKey) || {};
        
        boxes.forEach((box, index) => {
            const row = box.closest('tr');
            if (!row) return;
            
            const itemElement = row.querySelector('[data-label="Item"]');
            if (!itemElement) return;
            
            const item = itemElement.textContent.trim();
            const boxKey = `${item}:${index % 12}`;
            
            if (checkedState[boxKey]) {
                box.classList.add('checked');
            }
            
            box.addEventListener('click', () => {
                box.classList.toggle('checked');
                checkedState[boxKey] = box.classList.contains('checked');
                opusStorage.updateMetadata(storageKey, checkedState);
            });
        });
    }
};

// Also expose to window for auth-check.js
window.billPaymentPage = billPaymentPage;
