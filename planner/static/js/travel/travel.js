/**
 * Travel Itinerary Module
 */

const travelPage = {
    initialize: function() {
        console.log('Initializing Travel Itinerary...');
        this.setupDate();
    },

    setupDate: function() {
        const todayDateEl = document.getElementById('today-date');
        if (todayDateEl) {
            todayDateEl.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }
};

window.travelPage = travelPage;
