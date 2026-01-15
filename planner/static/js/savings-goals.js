/**
 * Savings Goals Module
 */

const savingsGoalsPage = {
    initialize: function() {
        console.log('Initializing Savings Goals...');
        this.setupDate();
    },

    setupDate: function() {
        const todayDate = document.getElementById('today-date');
        if (todayDate) {
            todayDate.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
};

window.savingsGoalsPage = savingsGoalsPage;
