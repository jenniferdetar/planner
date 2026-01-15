window.healthPage = (() => {
  const MEDICATION_TITLE_CASE = new Map([
    ['OZEMPIC 4 MG/3ML INJ NOVO', 'Ozempic 4 mg/3ml Inj Novo'],
    ['GLIPIZIDE 5 MG TAB APOT', 'Glipizide 5 mg Tab Apot'],
    ['OZEMPIC 8 MG/3ML INJ NOVO', 'Ozempic 8 mg/3ml Inj Novo'],
    ['ROSUVASTATIN 20 MG TAB TORR', 'Rosuvastatin 20 mg Tab Torr'],
    ['OZEMPIC 2 MG/3ML INJ NOVO', 'Ozempic 2 mg/3ml Inj Novo'],
    ['BUSPIRONE 10 MG TAB UNIC', 'Buspirone 10 mg Tab Unic'],
    ['JARDIANCE 25 MG TAB BOEH', 'Jardiance 25 mg Tab Boeh'],
    ['METFORMIN 1,000 MG TAB GRAN', 'Metformin 1,000 mg Tab Gran'],
    ['ESTRADIOL 2 MG TAB NORT', 'Estradiol 2 mg Tab Nort'],
    ['BUPROPION XL 300 MG TAB LUPI', 'Bupropion XL 300 mg Tab Lupi'],
    ['NEXIUM 24HR 20 MG ORAL CPDR SR CAP', 'Nexium 24HR 20 mg Oral Cpdr Sr Cap']
  ]);

  const MASTER_LIST = {
    fruits: [
      'Apple', 'Banana', 'Blackberry', 'Blueberry', 'Cantaloupes', 'Date', 'Fig', 'Grape','Honeydew', 'Pear', 'Raspberry',
      'Strawberries', 'Watermelon'
    ],
    vegetables: [
      'Basil', 'Beet Root','Broccoli', 'Carrot','Celery', 'Chives', 'Cilantro','Corn', 'Cucumber', 'Daikon', 'Dill',
      'Garlic', 'Ginger', 'Iceberg Lettuce','Lettuce', 'Mustard', 'Onion', 'Parsley', 'Peppers', 'Potato', 'Romaine Lettuce', 'Spinach', 'Thyme', 'Tomato', 
    ],
    legumes: [
      'Acorns', 'Almonds', 'Cashews', 'Green Bean', 'Peanuts', 'Peas', 'Pecans', 'Walnuts'
    ],
    medication: [
      'Ozempic 4 mg/3ml Inj Novo',
      'Glipizide 5 mg Tab Apot',
      'Ozempic 8 mg/3ml Inj Novo',
      'Rosuvastatin 20 mg Tab Torr',
      'Ozempic 2 mg/3ml Inj Novo',
      'Buspirone 10 mg Tab Unic',
      'Jardiance 25 MG Tab Boeh',
      'Metformin 1,000 mg Tab Gran',
      'Estradiol 2 mg Tab Nort',
      'Bupropion XL 300 mg Tab Lupi',
      'Nexium 24HR 20 mg Oral Cpdr Sr Cap'
    ]
  };

  let healthData = JSON.parse(JSON.stringify(MASTER_LIST));
  let saveTimeout;

  function loadData() {
    healthData = opusStorage.getMetadata('opus-health-data') || JSON.parse(JSON.stringify(MASTER_LIST));
  }

  function saveData() {
    opusStorage.updateMetadata('opus-health-data', healthData);
  }

  function scheduleSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveData, 1000);
  }

  function renderList(type) {
    const container = document.getElementById(`${type}-list`);
    if (!container) return;

    container.innerHTML = '';
    if (!Array.isArray(healthData[type])) {
      healthData[type] = [];
    }
    healthData[type].forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'list-item';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.value = item;
      input.addEventListener('input', (e) => {
        healthData[type][index] = e.target.value;
        scheduleSave();
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '✕';
      deleteBtn.title = 'Delete item';
      deleteBtn.onclick = () => removeItem(type, index);

      itemEl.appendChild(input);
      itemEl.appendChild(deleteBtn);
      container.appendChild(itemEl);
    });
  }

  function renderLists() {
    renderList('fruits');
    renderList('vegetables');
    renderList('legumes');
    renderList('medication');
  }

  function addItem(type) {
    if (!healthData[type]) healthData[type] = [];
    healthData[type].push('');
    renderList(type);
    
    // Focus the new input
    const container = document.getElementById(`${type}-list`);
    const inputs = container.querySelectorAll('input');
    if (inputs.length > 0) {
      inputs[inputs.length - 1].focus();
    }
    saveData();
  }

  function removeItem(type, index) {
    healthData[type].splice(index, 1);
    renderList(type);
    saveData();
  }

  function clearList(type) {
    if (confirm(`Are you sure you want to clear all ${type}?`)) {
      healthData[type] = [];
      renderList(type);
      saveData();
    }
  }

  function switchTab(tabId) {
    document.querySelectorAll('.health-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    const activeTab = Array.from(document.querySelectorAll('.health-tab')).find(t => t.getAttribute('onclick')?.includes(tabId));
    if (activeTab) activeTab.classList.add('active');
    
    const content = document.getElementById(`${tabId}-tab`);
    if (content) content.classList.add('active');
  }

  async function initialize() {
    const todayDateEl = document.getElementById('today-date');
    if (todayDateEl) {
      todayDateEl.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    if (window.opusStorage) {
      await window.opusStorage.initializeStorage();
    }
    
    loadData();
    
    // Migration from old market data if it exists and new data is empty
    const oldSaved = localStorage.getItem('opus-market-data');
    if (oldSaved && (!healthData.fruits || healthData.fruits.length === 0)) {
      try {
        const oldData = JSON.parse(oldSaved);
        healthData.fruits = oldData.fruits || MASTER_LIST.fruits;
        healthData.vegetables = oldData.vegetables || MASTER_LIST.vegetables;
        healthData.legumes = oldData.legumes || MASTER_LIST.legumes;
        saveData();
      } catch (e) {
        console.error('Error migrating market data', e);
      }
    }

    // Default initialization
    ['fruits', 'vegetables', 'legumes', 'medication'].forEach((type) => {
      if (!Array.isArray(healthData[type])) {
        healthData[type] = Array.isArray(MASTER_LIST[type])
          ? [...MASTER_LIST[type]]
          : [];
      }
      if (type === 'medication') {
        const banned = ['onetouch', 'simethicone'];
        healthData[type] = healthData[type]
          .map((item) => {
            const normalized = String(item || '').trim();
            return MEDICATION_TITLE_CASE.get(normalized.toUpperCase()) || item;
          })
          .filter((item) => {
            const lower = String(item || '').toLowerCase();
            return !banned.some((term) => lower.includes(term));
          });
        healthData[type].sort((a, b) => String(a).localeCompare(String(b)));
      }
      if (Array.isArray(healthData[type]) && type !== 'medication') {
        healthData[type].sort((a, b) => String(a).localeCompare(String(b)));
      }
    });
    
    renderLists();
  }

  return {
    initialize,
    addItem,
    removeItem,
    clearList,
    switchTab
  };
})();

// Global helpers for inline onclicks in HTML
function addItem(type) { healthPage.addItem(type); }
function clearList(type) { healthPage.clearList(type); }
function switchTab(tabId) { healthPage.switchTab(tabId); }
