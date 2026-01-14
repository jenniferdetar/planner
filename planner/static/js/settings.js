const SettingsModule = (() => {
  const DEFAULT_PREFERENCES = {
    theme: 'light',
    defaultView: 'daily',
    workStartHour: 6,
    workEndHour: 20,
    weekStartDay: 'Sunday',
    notifications: true,
    timeFormat: '12h'
  };

  function initializePage() {
    opusData.initialize().then(() => {
      setupEventListeners();
      loadSettings();
      applyTheme();
    }).catch(error => {
      console.error('Error initializing page:', error);
      showToast('Error loading settings', 'error');
    });
  }

  function setupEventListeners() {
    const form = document.getElementById('settings-form');
    if (form) {
      form.addEventListener('submit', handleSaveSettings);
    }
  }

  function loadSettings() {
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
  }

  function handleSaveSettings(e) {
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
        showToast('Work start hour must be before work end hour', 'error');
        return;
      }

      opusStorage.updatePreference('theme', theme);
      opusStorage.updatePreference('defaultView', defaultView);
      opusStorage.updatePreference('workStartHour', workStartHour);
      opusStorage.updatePreference('workEndHour', workEndHour);
      opusStorage.updatePreference('weekStartDay', weekStartDay);
      opusStorage.updatePreference('notifications', notifications);
      opusStorage.updatePreference('timeFormat', timeFormat);

      opusData.syncFromStorage();

      applyTheme();

      showToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Error saving settings', 'error');
    }
  }

  function applyTheme() {
    const preferences = opusStorage.getPreferences();
    const theme = preferences.theme || 'light';
    
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  function resetSettings() {
    if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      return;
    }

    try {
      Object.entries(DEFAULT_PREFERENCES).forEach(([key, value]) => {
        opusStorage.updatePreference(key, value);
      });

      opusData.syncFromStorage();
      loadSettings();
      applyTheme();

      showToast('Settings reset to defaults', 'success');
    } catch (error) {
      console.error('Error resetting settings:', error);
      showToast('Error resetting settings', 'error');
    }
  }

  function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
  } else {
    initializePage();
  }

  return {
    resetSettings
  };
})();

function resetSettings() {
  SettingsModule.resetSettings();
}
