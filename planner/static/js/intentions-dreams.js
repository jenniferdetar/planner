document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'opus-intentions-dreams';
  
  // Load data
  const savedData = opusStorage.getIntentionsDreams();
  
  // Select all relevant inputs
  const inputs = document.querySelectorAll('.handwriting-input, .handwriting-input-single, .handwriting-inline, .other-input, input[type="checkbox"]');
  
  // Populate inputs with saved data
  inputs.forEach(input => {
    if (savedData[input.id] !== undefined) {
      if (input.type === 'checkbox') {
        input.checked = savedData[input.id];
      } else {
        input.value = savedData[input.id];
      }
    }
    
    // Auto-save on change
    input.addEventListener('input', utils.debounce(() => {
      saveData();
    }, 500));
    
    if (input.type === 'checkbox') {
      input.addEventListener('change', () => {
        saveData();
      });
    }
  });

  function saveData() {
    const data = {};
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        data[input.id] = input.checked;
      } else {
        data[input.id] = input.value;
      }
    });
    opusStorage.setIntentionsDreams(data);
  }
});
