/**
 * Form Sync Utility
 * Automatically syncs input fields, textareas, and checkboxes to opusStorage metadata
 */
const formSync = (() => {
  function init(options = {}) {
    const {
      storagePrefix = window.location.pathname,
      selector = 'input[id], textarea[id], select[id]',
      debounceTime = 500
    } = options;

    const elements = document.querySelectorAll(selector);
    
    // Load existing values
    elements.forEach(el => {
      const key = `${storagePrefix}:${el.id}`;
      const savedValue = opusStorage.getMetadata(key);
      
      if (savedValue !== undefined && savedValue !== null) {
        if (el.type === 'checkbox') {
          el.checked = savedValue;
        } else {
          el.value = savedValue;
        }
      }

      // Add event listeners
      const save = utils.debounce(() => {
        const val = el.type === 'checkbox' ? el.checked : el.value;
        opusStorage.updateMetadata(key, val);
      }, debounceTime);

      el.addEventListener('input', save);
      if (el.type === 'checkbox' || el.tagName === 'SELECT') {
        el.addEventListener('change', save);
      }
    });
  }

  return { init };
})();
