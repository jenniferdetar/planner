const marketPage = (() => {
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
    ]
  };

  let marketData = JSON.parse(JSON.stringify(MASTER_LIST));
  let saveTimeout;

  function initializePage() {
    loadData();
    // If after loading data, lists are empty or very small, and we haven't seen the master list yet, force it
    const fruitsEmpty = !marketData.fruits || marketData.fruits.length === 0;
    const vegetablesEmpty = !marketData.vegetables || marketData.vegetables.length === 0;
    const isPlaceholder = marketData.fruits.length < 5 && marketData.fruits.includes('Apples'); // Check for old defaults

    if ((fruitsEmpty && vegetablesEmpty) || isPlaceholder) {
      marketData = JSON.parse(JSON.stringify(MASTER_LIST));
      saveData();
    }

    ['fruits', 'vegetables', 'legumes'].forEach((type) => {
      if (!Array.isArray(marketData[type])) {
        marketData[type] = Array.isArray(MASTER_LIST[type])
          ? [...MASTER_LIST[type]]
          : [];
      }
      if (Array.isArray(marketData[type])) {
        if (type === 'legumes') {
          marketData[type] = marketData[type].map((item) =>
            item === 'Green Bean (Snap Bean)' ? 'Green Bean' : item
          );
        }
        marketData[type].sort((a, b) => String(a).localeCompare(String(b)));
      }
    });
    
    renderLists();
  }

  function loadData() {
    const saved = localStorage.getItem('opus-market-data');
    if (saved) {
      try {
        marketData = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing market data', e);
      }
    }
  }

  function saveData() {
    localStorage.setItem('opus-market-data', JSON.stringify(marketData));
  }

  function scheduleSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveData, 1000);
  }

  function renderLists() {
    renderList('fruits');
    renderList('vegetables');
    renderList('legumes');
  }

  function renderList(type) {
    const container = document.getElementById(`${type}-list`);
    if (!container) return;

    container.innerHTML = '';
    if (!Array.isArray(marketData[type])) {
      marketData[type] = [];
    }
    marketData[type].forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'list-item';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.value = item;
      input.addEventListener('input', (e) => {
        marketData[type][index] = e.target.value;
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

  function addItem(type) {
    marketData[type].push('');
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
    marketData[type].splice(index, 1);
    renderList(type);
    saveData();
  }

  function clearList(type) {
    if (confirm(`Are you sure you want to clear all ${type}?`)) {
      marketData[type] = [];
      renderList(type);
      saveData();
    }
  }

  return {
    initializePage,
    addItem,
    removeItem,
    clearList
  };
})();

// Global helpers for inline onclicks
function addItem(type) { marketPage.addItem(type); }
function clearList(type) { marketPage.clearList(type); }

document.addEventListener('DOMContentLoaded', marketPage.initializePage);
