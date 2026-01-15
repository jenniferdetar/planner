/**
 * Finance Hub Module
 */

const financePage = {
    initialize: function() {
        console.log('Initializing Finance Hub...');
        this.setupDate();
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
    }
};

window.financePage = financePage;
