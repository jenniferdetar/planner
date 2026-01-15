/**
 * Settings Module
 */

const settingsPage = {
    initialize: function() {
        console.log('Initializing Settings...');
        this.setupDate();
        this.loadSettings();
        this.setupEventListeners();
        this.applyTheme();
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

    setupEventListeners: function() {
        const form = document.getElementById('settings-form');
        if (form) {
            // Remove old listener if any
            form.removeEventListener('submit', this.handleSaveSettings.bind(this));
            form.addEventListener('submit', this.handleSaveSettings.bind(this));
        }
    },

    loadSettings: function() {
        if (typeof opusStorage === 'undefined') return;
        
        const preferences = opusStorage.getPreferences();
        
        const themeSelect = document.getElementById('theme');
        if (themeSelect && preferences.theme) {
            themeSelect.value = preferences.theme;
        }

        const defaultViewSelect = document.getElementById('defaultView');
        if (defaultViewSelect && preferences.defaultView) {
            defaultViewSelect.value = preferences.defaultView;
        }

        const workStartSelect = document.getElementById('workStartHour');
        if (workStartSelect && preferences.workStartHour) {
            workStartSelect.value = preferences.workStartHour;
        }

        const workEndSelect = document.getElementById('workEndHour');
        if (workEndSelect && preferences.workEndHour) {
            workEndSelect.value = preferences.workEndHour;
        }

        const weekStartSelect = document.getElementById('weekStartDay');
        if (weekStartSelect && preferences.weekStartDay) {
            weekStartSelect.value = preferences.weekStartDay;
        }

        const notificationsCheckbox = document.getElementById('notifications');
        if (notificationsCheckbox && preferences.notifications !== undefined) {
            notificationsCheckbox.checked = preferences.notifications;
        }

        const timeFormatSelect = document.getElementById('timeFormat');
        if (timeFormatSelect && preferences.timeFormat) {
            timeFormatSelect.value = preferences.timeFormat;
        }
    },

    handleSaveSettings: function(e) {
        e.preventDefault();

        try {
            const theme = document.getElementById('theme').value;
            const defaultView = document.getElementById('defaultView').value;
            const workStartHour = parseInt(document.getElementById('workStartHour').value);
            const workEndHour = parseInt(document.getElementById('workEndHour').value);
            const weekStartDay = document.getElementById('weekStartDay').value;
            const notifications = document.getElementById('notifications').checked;
            const timeFormat = document.getElementById('timeFormat').value;

            if (workStartHour >= workEndHour) {
                this.showToast('Work start hour must be before work end hour', 'error');
                return;
            }

            opusStorage.updatePreference('theme', theme);
            opusStorage.updatePreference('defaultView', defaultView);
            opusStorage.updatePreference('workStartHour', workStartHour);
            opusStorage.updatePreference('workEndHour', workEndHour);
            opusStorage.updatePreference('weekStartDay', weekStartDay);
            opusStorage.updatePreference('notifications', notifications);
            opusStorage.updatePreference('timeFormat', timeFormat);

            if (window.opusData) {
                opusData.syncFromStorage();
            }

            this.applyTheme();
            this.showToast('Settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('Error saving settings', 'error');
        }
    },

    applyTheme: function() {
        if (typeof opusStorage === 'undefined') return;
        const preferences = opusStorage.getPreferences();
        const theme = preferences.theme || 'light';
        
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    },

    resetSettings: function() {
        if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            return;
        }

        const DEFAULT_PREFERENCES = {
            theme: 'light',
            defaultView: 'daily',
            workStartHour: 6,
            workEndHour: 20,
            weekStartDay: 'Sunday',
            notifications: true,
            timeFormat: '12h'
        };

        try {
            Object.entries(DEFAULT_PREFERENCES).forEach(([key, value]) => {
                opusStorage.updatePreference(key, value);
            });

            if (window.opusData) {
                opusData.syncFromStorage();
            }
            
            this.loadSettings();
            this.applyTheme();
            this.showToast('Settings reset to defaults', 'success');
        } catch (error) {
            console.error('Error resetting settings:', error);
            this.showToast('Error resetting settings', 'error');
        }
    },

    showToast: function(message, type = 'info') {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

window.settingsPage = settingsPage;

// For the reset button onclick
window.resetSettings = () => settingsPage.resetSettings();
