window.notesPage = (() => {
  let currentDate = utils.getCurrentDateISO();
  let currentTags = [];
  let allNotes = [];
  let searchQuery = '';
  let autoSaveTimeout;

  function initialize() {
    opusData.initialize().then(() => {
      setupEventListeners();
      setDefaultDate();
      loadNotesForDate(currentDate);
      renderNoteHistory();
      setupDataListeners();
    }).catch(error => {
      console.error('Error initializing page:', error);
      utils.showToast('Error loading data', 'error');
    });
  }

  function setupEventListeners() {
    utils.on('#notes-date', 'change', (e) => {
      currentDate = e.target.value;
      loadNotesForDate(currentDate);
      updateDateDisplay();
    });

    utils.on('#prev-date-btn', 'click', navigatePreviousDate);
    utils.on('#next-date-btn', 'click', navigateNextDate);
    utils.on('#note-content', 'input', () => {
      renderPreview();
      scheduleAutoSave();
    });
    utils.on('#notes-form', 'submit', handleSaveNote);
    utils.on('#add-tag-btn', 'click', handleAddTag);
    utils.on('#tag-input', 'keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
    });

    const searchInput = document.getElementById('notes-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderNoteHistory();
      });
    }
  }

  function setupDataListeners() {
    opusData.addEventListener('note-created', () => {
      allNotes = opusStorage.getNotes();
      renderNoteHistory();
    });
    opusData.addEventListener('note-updated', () => {
      allNotes = opusStorage.getNotes();
      renderNoteHistory();
    });
    opusData.addEventListener('note-deleted', () => {
      allNotes = opusStorage.getNotes();
      renderNoteHistory();
    });
    opusData.addEventListener('data-updated', () => {
      allNotes = opusStorage.getNotes();
      renderNoteHistory();
      // Also reload current note if it might have changed
      loadNotesForDate(currentDate);
    });
  }

  function setDefaultDate() {
    const dateInput = document.getElementById('notes-date');
    if (dateInput) {
      dateInput.value = currentDate;
    }
    updateDateDisplay();
  }

  function updateDateDisplay() {
    const display = document.getElementById('selected-date-display');
    if (display) {
      display.textContent = utils.formatDate(currentDate, 'dddd, MMM DD');
    }
  }

  function navigatePreviousDate() {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    currentDate = date.toISOString().split('T')[0];
    const dateInput = document.getElementById('notes-date');
    if (dateInput) {
      dateInput.value = currentDate;
    }
    updateDateDisplay();
    loadNotesForDate(currentDate);
  }

  function navigateNextDate() {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    currentDate = date.toISOString().split('T')[0];
    const dateInput = document.getElementById('notes-date');
    if (dateInput) {
      dateInput.value = currentDate;
    }
    updateDateDisplay();
    loadNotesForDate(currentDate);
  }

  function loadNotesForDate(date) {
    const note = opusStorage.getNotesByDate(date);

    if (note) {
      document.getElementById('note-content').value = note.content || '';
      currentTags = note.tags ? [...note.tags] : [];
    } else {
      document.getElementById('note-content').value = '';
      currentTags = [];
    }

    renderTags();
    renderPreview();
  }

  function renderPreview() {
    renderNotePreview();
    renderTagsPreview();
  }

  function renderNotePreview() {
    const previewContent = document.getElementById('note-preview-content');
    if (!previewContent) return;

    const content = document.getElementById('note-content').value.trim();

    if (!content) {
      previewContent.textContent = 'Start typing to see preview';
      return;
    }

    const preview = content.length > 300 ? content.substring(0, 300) + '...' : content;
    previewContent.textContent = preview;
  }

  function renderTagsPreview() {
    const previewContainer = document.getElementById('tags-preview');
    if (!previewContainer) return;

    if (currentTags.length === 0) {
      previewContainer.innerHTML = '<p class="empty-preview">Add tags to your notes</p>';
      return;
    }

    previewContainer.innerHTML = '';

    currentTags.forEach(tag => {
      const tagEl = document.createElement('div');
      tagEl.className = 'preview-tag';
      tagEl.innerHTML = `<i class="fas fa-tag"></i>${utils.escapeHtml(tag)}`;
      previewContainer.appendChild(tagEl);
    });
  }

  function renderTags() {
    const tagsList = document.getElementById('tags-list');
    if (!tagsList) return;

    tagsList.innerHTML = '';

    if (currentTags.length === 0) {
      return;
    }

    currentTags.forEach((tag, index) => {
      const li = document.createElement('li');
      li.className = 'tag-item';

      const text = document.createElement('span');
      text.textContent = tag;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'tag-remove';
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.title = 'Remove tag';
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        removeTag(index);
      });

      li.appendChild(text);
      li.appendChild(removeBtn);
      tagsList.appendChild(li);
    });
  }

  function handleAddTag() {
    const tagInput = document.getElementById('tag-input');
    if (!tagInput) return;

    const tag = tagInput.value.trim();

    if (!tag) {
      utils.showToast('Please enter a tag', 'error');
      return;
    }

    if (currentTags.includes(tag)) {
      utils.showToast('This tag is already added', 'error');
      return;
    }

    if (currentTags.length >= 10) {
      utils.showToast('Maximum 10 tags allowed', 'error');
      return;
    }

    currentTags.push(tag);
    tagInput.value = '';
    renderTags();
    renderPreview();
    scheduleAutoSave();
  }

  function removeTag(index) {
    currentTags.splice(index, 1);
    renderTags();
    renderPreview();
    scheduleAutoSave();
  }

  function scheduleAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      handleSaveNote({ preventDefault: () => {} });
    }, 2000);
  }

  function handleSaveNote(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const content = document.getElementById('note-content').value.trim();

    const existingNote = opusStorage.getNotesByDate(currentDate);

    try {
      if (existingNote) {
        opusStorage.updateNote(existingNote.id, content, currentTags);
        opusData.syncFromStorage();
        opusData.notifyListeners('note-updated', {
          id: existingNote.id,
          date: currentDate,
          content,
          tags: currentTags
        });
      } else {
        const note = opusStorage.createNote({
          date: currentDate,
          content,
          tags: currentTags
        });
        opusData.syncFromStorage();
        opusData.notifyListeners('note-created', note);
      }

      showUpdatedTime(new Date().toISOString());
      utils.showToast('Note saved successfully!', 'success');
      allNotes = opusStorage.getNotes();
      renderNoteHistory();
    } catch (error) {
      console.error('Error saving note:', error);
      utils.showToast('Error saving note', 'error');
    }
  }

  function renderNoteHistory() {
    const historyList = document.getElementById('notes-history-list');
    if (!historyList) return;

    allNotes = opusStorage.getNotes();

    let filteredNotes = allNotes;

    if (searchQuery) {
      filteredNotes = allNotes.filter(note => {
        const contentMatch = note.content.toLowerCase().includes(searchQuery);
        const tagMatch = note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery));
        return contentMatch || tagMatch;
      });
    }

    filteredNotes.sort((a, b) => b.date.localeCompare(a.date));

    if (filteredNotes.length === 0) {
      historyList.innerHTML = '<li class="empty-history">No notes found</li>';
      return;
    }

    historyList.innerHTML = '';

    filteredNotes.forEach(note => {
      const li = document.createElement('li');
      li.className = 'history-note-item';
      li.addEventListener('click', () => {
        currentDate = note.date;
        const dateInput = document.getElementById('notes-date');
        if (dateInput) {
          dateInput.value = currentDate;
        }
        updateDateDisplay();
        loadNotesForDate(currentDate);
      });

      const dateEl = document.createElement('div');
      dateEl.className = 'history-note-date';
      dateEl.textContent = utils.formatDate(note.date, 'MMM DD, YYYY');

      const previewEl = document.createElement('div');
      previewEl.className = 'history-note-preview';
      const preview = note.content.substring(0, 60);
      previewEl.textContent = preview;

      li.appendChild(dateEl);
      li.appendChild(previewEl);

      if (note.tags && note.tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'history-note-tags';

        note.tags.slice(0, 3).forEach(tag => {
          const tagEl = document.createElement('span');
          tagEl.className = 'history-tag';
          tagEl.textContent = tag;
          tagsContainer.appendChild(tagEl);
        });

        if (note.tags.length > 3) {
          const moreEl = document.createElement('span');
          moreEl.className = 'history-tag';
          moreEl.textContent = `+${note.tags.length - 3}`;
          tagsContainer.appendChild(moreEl);
        }

        li.appendChild(tagsContainer);
      }

      historyList.appendChild(li);
    });
  }

  function showUpdatedTime(timestamp) {
    const updatedElement = document.getElementById('notes-updated');
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
