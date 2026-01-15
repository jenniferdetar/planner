window.missionPage = (() => {
  let currentValues = [];

  function initialize() {
    opusData.initialize().then(() => {
      loadMission();
      setupEventListeners();
      renderPreview();
    }).catch(error => {
      console.error('Error initializing page:', error);
      utils.showToast('Error loading data', 'error');
    });
  }

  function setupEventListeners() {
    const missionForm = document.getElementById('mission-form');
    if (missionForm) {
      missionForm.addEventListener('submit', handleMissionSave);
    }

    const addValueBtn = document.getElementById('add-value-btn');
    if (addValueBtn) {
      addValueBtn.addEventListener('click', handleAddValue);
    }

    const valueInput = document.getElementById('value-input');
    if (valueInput) {
      valueInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddValue();
        }
      });
    }

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', handleReset);
    }
  }

  function loadMission() {
    const mission = opusStorage.getMission();

    const statementInput = document.getElementById('mission-statement');
    if (statementInput) {
      statementInput.value = mission.statement || '';
    }

    currentValues = mission.values ? [...mission.values] : [];
    renderValues();
    renderPreview();

    if (mission.lastUpdated) {
      showUpdatedTime(mission.lastUpdated);
    }
  }

  function renderValues() {
    const valuesList = document.getElementById('values-list');
    if (!valuesList) return;

    valuesList.innerHTML = '';

    if (currentValues.length === 0) {
      return;
    }

    currentValues.forEach((value, index) => {
      const li = document.createElement('li');
      li.className = 'value-item';

      const text = document.createElement('span');
      text.textContent = value;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'value-remove';
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.title = 'Remove value';
      removeBtn.addEventListener('click', () => removeValue(index));

      li.appendChild(text);
      li.appendChild(removeBtn);
      valuesList.appendChild(li);
    });
  }

  function handleAddValue() {
    const valueInput = document.getElementById('value-input');
    if (!valueInput) return;

    const value = valueInput.value.trim();

    if (!value) {
      utils.showToast('Please enter a value', 'error');
      return;
    }

    if (currentValues.includes(value)) {
      utils.showToast('This value is already added', 'error');
      return;
    }

    if (currentValues.length >= 10) {
      utils.showToast('Maximum 10 values allowed', 'error');
      return;
    }

    currentValues.push(value);
    valueInput.value = '';
    renderValues();
    renderPreview();
  }

  function removeValue(index) {
    currentValues.splice(index, 1);
    renderValues();
    renderPreview();
  }

  function handleReset() {
    if (!confirm('Reset your mission statement and values?')) return;

    const statementInput = document.getElementById('mission-statement');
    if (statementInput) {
      statementInput.value = '';
    }

    currentValues = [];
    renderValues();
    renderPreview();

    const valueInput = document.getElementById('value-input');
    if (valueInput) {
      valueInput.value = '';
    }

    utils.showToast('Form reset', 'info');
  }

  function handleMissionSave(e) {
    e.preventDefault();

    const statement = document.getElementById('mission-statement').value.trim();

    if (!statement) {
      utils.showToast('Please enter your mission statement', 'error');
      return;
    }

    try {
      opusStorage.updateMission(statement, currentValues);
      opusData.syncFromStorage();
      opusData.notifyListeners('mission-updated', {
        statement,
        values: currentValues
      });

      showUpdatedTime(new Date().toISOString());
      utils.showToast('Mission saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving mission:', error);
      utils.showToast('Error saving mission', 'error');
    }
  }

  function renderPreview() {
    renderMissionPreview();
    renderValuesPreview();
  }

  function renderMissionPreview() {
    const previewContent = document.getElementById('mission-preview-content');
    if (!previewContent) return;

    const statement = document.getElementById('mission-statement');
    const missionText = statement ? statement.value.trim() : '';

    if (!missionText) {
      previewContent.innerHTML = '<p class="empty-preview">Your mission will appear here</p>';
      return;
    }

    previewContent.innerHTML = `<p>${utils.escapeHtml(missionText)}</p>`;
  }

  function renderValuesPreview() {
    const previewContainer = document.getElementById('values-preview');
    if (!previewContainer) return;

    if (currentValues.length === 0) {
      previewContainer.innerHTML = '<p class="empty-preview">Add your core values</p>';
      return;
    }

    previewContainer.innerHTML = '';

    currentValues.forEach(value => {
      const valueEl = document.createElement('div');
      valueEl.className = 'preview-value';
      valueEl.innerHTML = `<i class="fas fa-star"></i>${utils.escapeHtml(value)}`;
      previewContainer.appendChild(valueEl);
    });
  }

  function showUpdatedTime(timestamp) {
    const updatedElement = document.getElementById('mission-updated');
    const updatedTimeEl = document.getElementById('updated-time');

    if (!updatedElement || !updatedTimeEl) return;

    const date = new Date(timestamp);
    const timeStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    updatedTimeEl.textContent = timeStr;
    updatedElement.style.display = 'flex';
  }

  return {
    initialize
  };
})();
