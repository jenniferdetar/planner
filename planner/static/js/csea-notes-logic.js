const cseaNotesModule = (() => {
  const cseaNotesField = () => document.getElementById('csea-notes');
  const cseaNotesSave = () => document.getElementById('csea-notes-save');
  const cseaNotesStatus = () => document.getElementById('csea-notes-status');
  const cseaNotesClear = () => document.getElementById('csea-notes-clear');
  const cseaSavedList = () => document.getElementById('csea-saved-list');
  const cseaSavedClear = () => document.getElementById('csea-saved-clear');
  const cseaTagInput = () => document.getElementById('csea-tag-input');
  const cseaTagAdd = () => document.getElementById('csea-tag-add');
  const cseaTagsList = () => document.getElementById('csea-tags-list');
  const cseaSearchInput = () => document.getElementById('csea-search');

  const formatSavedDate = (isoString) => {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadSavedItems = () => opusStorage.getCseaNotesSaved() || [];
  const saveSavedItems = (items) => opusStorage.setCseaNotesSaved(items.slice(0, 50));
  const loadCurrentTags = () => opusStorage.getCseaNotesTags() || [];
  const saveCurrentTags = (tags) => opusStorage.setCseaNotesTags(tags);

  const renderTags = () => {
    const listEl = cseaTagsList();
    if (!listEl) return;
    const tags = loadCurrentTags();
    listEl.innerHTML = tags.map((tag, index) => `
      <li class="csea-tag">
        <span>${tag}</span>
        <button type="button" class="csea-tag-delete" data-index="${index}">x</button>
      </li>
    `).join('');
    listEl.querySelectorAll('.csea-tag-delete').forEach((button) => {
      button.addEventListener('click', () => {
        const idx = Number(button.getAttribute('data-index'));
        const tagsList = loadCurrentTags();
        if (Number.isNaN(idx) || idx < 0 || idx >= tagsList.length) return;
        tagsList.splice(idx, 1);
        saveCurrentTags(tagsList);
        renderTags();
      });
    });
  };

  const addTag = () => {
    const inputEl = cseaTagInput();
    if (!inputEl) return;
    const value = inputEl.value.trim();
    if (!value) return;
    const tags = loadCurrentTags();
    if (!tags.includes(value)) {
      tags.push(value);
      saveCurrentTags(tags);
      renderTags();
    }
    inputEl.value = '';
  };

  const renderSavedItems = () => {
    const listEl = cseaSavedList();
    if (!listEl) return;
    const items = loadSavedItems();
    const query = (cseaSearchInput()?.value || '').toLowerCase().trim();
    const filtered = query
      ? items.filter(({ text, tags = [] }) =>
          text.toLowerCase().includes(query) || (tags && tags.some(tag => tag.toLowerCase().includes(query))))
      : items;

    if (filtered.length === 0) {
      listEl.innerHTML = '<li class="csea-saved-item">No saved items</li>';
      return;
    }

    listEl.innerHTML = filtered.map((item, index) => {
      const tagsMarkup = item.tags && item.tags.length
        ? `<div class="csea-saved-tags">${item.tags.map(tag => `<span class="csea-tag">${tag}</span>`).join('')}</div>`
        : '';
      return `
      <li class="csea-saved-item">
        <div class="csea-saved-row">
          <div>
            <div class="csea-saved-date">${formatSavedDate(item.savedAt)}</div>
            <p class="csea-saved-text">${item.text}</p>
            ${tagsMarkup}
          </div>
          <button type="button" class="csea-saved-delete" data-index="${index}">Delete</button>
        </div>
      </li>`;
    }).join('');

    listEl.querySelectorAll('.csea-saved-delete').forEach((button) => {
      button.addEventListener('click', () => {
        const idx = Number(button.getAttribute('data-index'));
        const itemsList = loadSavedItems();
        if (Number.isNaN(idx) || idx < 0 || idx >= itemsList.length) return;
        itemsList.splice(idx, 1);
        saveSavedItems(itemsList);
        renderSavedItems();
      });
    });
  };

  const initialize = () => {
    const saveBtn = cseaNotesSave();
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const text = cseaNotesField()?.value.trim();
        if (!text) return;
        const items = loadSavedItems();
        items.unshift({
          text,
          tags: loadCurrentTags(),
          savedAt: new Date().toISOString()
        });
        saveSavedItems(items);
        saveCurrentTags([]);
        if (cseaNotesField()) cseaNotesField().value = '';
        renderTags();
        renderSavedItems();
        const statusEl = cseaNotesStatus();
        if (statusEl) {
          statusEl.textContent = 'Saved!';
          setTimeout(() => { if (statusEl) statusEl.textContent = 'Not saved'; }, 2000);
        }
      });
    }

    const clearBtn = cseaNotesClear();
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (cseaNotesField()) cseaNotesField().value = '';
        saveCurrentTags([]);
        renderTags();
      });
    }

    const savedClearBtn = cseaSavedClear();
    if (savedClearBtn) {
      savedClearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all saved notes?')) {
          saveSavedItems([]);
          renderSavedItems();
        }
      });
    }

    const tagAddBtn = cseaTagAdd();
    if (tagAddBtn) {
      tagAddBtn.addEventListener('click', addTag);
    }

    const tagInputEl = cseaTagInput();
    if (tagInputEl) {
      tagInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTag();
      });
    }

    const searchInputEl = cseaSearchInput();
    if (searchInputEl) {
      searchInputEl.addEventListener('input', renderSavedItems);
    }

    renderTags();
    renderSavedItems();
  };

  return { initialize };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('csea-notes-section')) {
    cseaNotesModule.initialize();
  }
});
