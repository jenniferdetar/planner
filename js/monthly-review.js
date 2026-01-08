document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'opus-monthly-review';
  
  // Load data
  const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  
  // Select all textareas
  const inputs = document.querySelectorAll('.handwriting-input');
  
  // Populate inputs with saved data
  inputs.forEach(input => {
    if (savedData[input.id] !== undefined) {
      input.value = savedData[input.id];
    }
    
    // Auto-save on change
    input.addEventListener('input', utils.debounce(() => {
      saveData();
    }, 500));
  });

  function saveData() {
    const data = {};
    inputs.forEach(input => {
      data[input.id] = input.value;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
});
