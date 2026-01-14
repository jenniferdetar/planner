const monthlyReview = (() => {
  function initialize() {
    // Load data
    const savedData = opusStorage.getMetadata('monthly-review') || {};
    
    // Select all textareas
    const inputs = document.querySelectorAll('.handwriting-input');
    
    // Populate inputs with saved data
    inputs.forEach(input => {
      if (savedData[input.id] !== undefined) {
        input.value = savedData[input.id];
      }
      
      // Auto-save on change
      input.addEventListener('input', utils.debounce(() => {
        saveData(inputs);
      }, 500));
    });
  }

  function saveData(inputs) {
    const data = {};
    inputs.forEach(input => {
      data[input.id] = input.value;
    });
    opusStorage.updateMetadata('monthly-review', data);
  }

  return { initialize };
})();
