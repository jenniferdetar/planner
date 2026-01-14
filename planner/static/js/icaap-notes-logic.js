const icaapNotesModule = (() => {
  const notesField = () => document.getElementById('icaap-notes');
  const notesSaveButton = () => document.getElementById('icaap-notes-save');
  const notesStatus = () => document.getElementById('icaap-notes-status');
  const savedList = () => document.getElementById('icaap-saved-list');
  const tagInput = () => document.getElementById('icaap-tag-input');
  const tagAdd = () => document.getElementById('icaap-tag-add');
  const tagList = () => document.getElementById('icaap-tags-list');

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

  const loadSavedItems = () => {
    const raw = localStorage.getItem('icaapNotesSaved');
    if (!raw) return [];
    try {
      const items = JSON.parse(raw);
      return Array.isArray(items) ? items : [];
    } catch (error) {
      return [];
    }
  };

  const loadTags = () => {
    const raw = localStorage.getItem('icaapNotesTags');
    if (!raw) return [];
    try {
      const tags = JSON.parse(raw);
      return Array.isArray(tags) ? tags : [];
    } catch (error) {
      return [];
    }
  };

  const renderTags = () => {
    const listEl = tagList();
    if (!listEl) return;
    const tags = loadTags();
    listEl.innerHTML = tags.map((tag, index) => `
      <li class="icaap-tag">
        <span>${tag}</span>
        <button type="button" class="icaap-tag-delete" data-index="${index}">x</button>
      </li>
    `).join('');
    listEl.querySelectorAll('.icaap-tag-delete').forEach((button) => {
      button.addEventListener('click', () => {
        const idx = Number(button.getAttribute('data-index'));
        const tagsList = loadTags();
        if (Number.isNaN(idx) || idx < 0 || idx >= tagsList.length) return;
        tagsList.splice(idx, 1);
        localStorage.setItem('icaapNotesTags', JSON.stringify(tagsList));
        renderTags();
      });
    });
  };

  const addTag = () => {
    const inputEl = tagInput();
    if (!inputEl) return;
    const value = inputEl.value.trim();
    if (!value) return;
    const tags = loadTags();
    if (!tags.includes(value)) {
      tags.push(value);
      localStorage.setItem('icaapNotesTags', JSON.stringify(tags));
      renderTags();
    }
    inputEl.value = '';
  };

  const renderSavedItems = () => {
    const listEl = savedList();
    if (!listEl) return;
    const items = loadSavedItems();
    listEl.innerHTML = items.map((item, index) => `
      <li class="icaap-saved-item">
        <div class="icaap-saved-row">
          <div>
            <div class="icaap-saved-date">${formatSavedDate(item.savedAt)}</div>
            <p class="icaap-saved-text">${item.text}</p>
          </div>
          <button type="button" class="icaap-saved-delete" data-index="${index}">Delete</button>
        </div>
      </li>
    `).join('');
    listEl.querySelectorAll('.icaap-saved-delete').forEach((button) => {
      button.addEventListener('click', () => {
        const idx = Number(button.getAttribute('data-index'));
        const itemsList = loadSavedItems();
        if (Number.isNaN(idx) || idx < 0 || idx >= itemsList.length) return;
        itemsList.splice(idx, 1);
        localStorage.setItem('icaapNotesSaved', JSON.stringify(itemsList));
        renderSavedItems();
      });
    });
  };

  const initialize = () => {
    const field = notesField();
    if (field) {
      const storedNotes = localStorage.getItem('icaapNotes');
      if (storedNotes !== null) {
        field.value = storedNotes;
        const statusEl = notesStatus();
        if (statusEl) statusEl.textContent = 'Saved';
      }
      renderTags();
      renderSavedItems();
      field.addEventListener('input', () => {
        const statusEl = notesStatus();
        if (statusEl) statusEl.textContent = 'Not saved';
      });
      const inputEl = tagInput();
      if (inputEl) {
        inputEl.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            addTag();
          }
        });
      }
      const addBtn = tagAdd();
      if (addBtn) {
        addBtn.addEventListener('click', addTag);
      }
      const saveBtn = notesSaveButton();
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const text = field.value.trim();
          localStorage.setItem('icaapNotes', field.value);
          const statusEl = notesStatus();
          if (statusEl) statusEl.textContent = 'Saved';
          if (text) {
            const items = loadSavedItems();
            items.unshift({ text, savedAt: new Date().toISOString() });
            localStorage.setItem('icaapNotesSaved', JSON.stringify(items.slice(0, 20)));
            renderSavedItems();
          }
        });
      }
    }
  };

  return { initialize };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('icaap-notes-section')) {
    icaapNotesModule.initialize();
  }
});
