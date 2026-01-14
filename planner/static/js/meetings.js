const meetingsPage = (() => {
  let currentFilter = 'all';
  let editingMeetingId = null;
  let currentAttendees = [];
  let stewardOptions = [];

  function initialize() {
    opusData.initialize().then(() => {
      ensureDefaultMeetings();
      return loadStewards();
    }).then(() => {
      setupEventListeners();
      populateStewardSelect();
      setDefaultDate();
      renderMeetings();
      setupDataListeners();
    }).catch(error => {
      console.error('Error initializing page:', error);
      utils.showToast('Error loading data', 'error');
    });
  }

  function ensureDefaultMeetings() {
    const meetings = opusData.meetings;
    const csealaMeeting = meetings.find(m => m.title === 'CSEA Stewards Meeting' && m.date === '2026-01-12');
    if (!csealaMeeting) {
      opusStorage.createMeeting({
        title: 'CSEA Stewards Meeting',
        date: '2026-01-12',
        startTime: '16:00',
        endTime: '17:00',
        location: '',
        agenda: '',
        attendees: []
      });
      opusData.syncFromStorage();
    }
  }

  function loadStewards() {
    return fetch('data/csea_stewards.json')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          stewardOptions = data.map(item => item.name).filter(Boolean);
        }
      })
      .catch(() => {
        stewardOptions = [];
      });
  }

  function populateStewardSelect() {
    const select = document.getElementById('attendee-select');
    if (!select) return;
    select.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = stewardOptions.length ? 'Select steward attendee' : 'Select attendee';
    select.appendChild(placeholder);

    stewardOptions.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  }

  function setupEventListeners() {
    utils.on('#meeting-form', 'submit', handleCreateMeeting);
    utils.on('#edit-meeting-form', 'submit', handleEditMeeting);
    utils.on('#modal-delete', 'click', handleDeleteMeeting);
    utils.on('#modal-cancel', 'click', closeMeetingModal);
    utils.on('#add-attendee-btn', 'click', handleAddAttendee);
    utils.on('#attendee-input', 'keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddAttendee();
      }
    });
    utils.on('#attendee-select', 'change', (e) => {
      if (e.target && e.target.value) {
        handleAddAttendee();
      }
    });
    utils.setupToggleButtons('.filter-button', 'active', (data) => {
      currentFilter = data.filter;
      renderMeetings();
    });
    const firstFilterBtn = document.querySelector('[data-filter="all"]');
    if (firstFilterBtn) firstFilterBtn.classList.add('active');
  }

  function setupDataListeners() {
    opusData.addEventListener('meeting-created', renderMeetings);
    opusData.addEventListener('meeting-updated', renderMeetings);
    opusData.addEventListener('meeting-deleted', renderMeetings);
    opusData.addEventListener('data-updated', renderMeetings);
  }

  function setDefaultDate() {
    const dateInput = document.getElementById('meeting-date');
    if (dateInput) {
      dateInput.value = utils.getCurrentDateISO();
    }
  }

  function handleCreateMeeting(e) {
    e.preventDefault();

    const title = document.getElementById('meeting-title').value.trim();
    const date = document.getElementById('meeting-date').value;
    const startTime = document.getElementById('meeting-start-time').value;
    const endTime = document.getElementById('meeting-end-time').value;
    const location = document.getElementById('meeting-location').value.trim();
    const agenda = document.getElementById('meeting-agenda').value.trim();

    if (!title || !date || !startTime || !endTime) {
      utils.showToast('Please fill in all required fields', 'error');
      return;
    }

    if (endTime <= startTime) {
      utils.showToast('End time must be after start time', 'error');
      return;
    }

    try {
      const meeting = opusStorage.createMeeting({
        title,
        date,
        startTime,
        endTime,
        location,
        agenda,
        attendees: currentAttendees
      });

      opusData.syncFromStorage();
      opusData.notifyListeners('meeting-created', meeting);

      e.target.reset();
      currentAttendees = [];
      renderAttendees();
      setDefaultDate();
      utils.showToast(`Meeting "${title}" created successfully`, 'success');
    } catch (error) {
      console.error('Error creating meeting:', error);
      utils.showToast('Error creating meeting', 'error');
    }
  }

  function handleEditMeeting(e) {
    e.preventDefault();

    if (!editingMeetingId) return;

    const title = document.getElementById('edit-meeting-title').value.trim();
    const date = document.getElementById('edit-meeting-date').value;
    const startTime = document.getElementById('edit-meeting-start-time').value;
    const endTime = document.getElementById('edit-meeting-end-time').value;
    const location = document.getElementById('edit-meeting-location').value.trim();
    const agenda = document.getElementById('edit-meeting-agenda').value.trim();
    const attendeesText = document.getElementById('edit-meeting-attendees').value.trim();

    const attendees = attendeesText
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    if (!title || !date || !startTime || !endTime) {
      utils.showToast('Please fill in all required fields', 'error');
      return;
    }

    if (endTime <= startTime) {
      utils.showToast('End time must be after start time', 'error');
      return;
    }

    try {
      const updatedMeeting = opusStorage.updateMeeting(editingMeetingId, {
        title,
        date,
        startTime,
        endTime,
        location,
        agenda,
        attendees
      });

      opusData.syncFromStorage();
      opusData.notifyListeners('meeting-updated', updatedMeeting);

      closeMeetingModal();
      utils.showToast('Meeting updated successfully', 'success');
    } catch (error) {
      console.error('Error updating meeting:', error);
      utils.showToast('Error updating meeting', 'error');
    }
  }

  function handleDeleteMeeting() {
    if (!editingMeetingId) return;

    try {
      opusStorage.deleteMeeting(editingMeetingId);
      opusData.syncFromStorage();
      opusData.notifyListeners('meeting-deleted', { id: editingMeetingId });
      closeMeetingModal();
      utils.showToast('Meeting deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      utils.showToast('Error deleting meeting', 'error');
    }
  }

  function handleAddAttendee() {
    const attendeeInput = document.getElementById('attendee-input');
    const attendeeSelect = document.getElementById('attendee-select');

    let attendee = '';
    if (attendeeSelect && attendeeSelect.value) {
      attendee = attendeeSelect.value.trim();
    } else if (attendeeInput) {
      attendee = attendeeInput.value.trim();
    }

    if (!attendee) {
      utils.showToast('Please select or enter an attendee name', 'error');
      return;
    }

    if (currentAttendees.includes(attendee)) {
      utils.showToast('This attendee is already added', 'error');
      return;
    }

    if (currentAttendees.length >= 20) {
      utils.showToast('Maximum 20 attendees allowed', 'error');
      return;
    }

    currentAttendees.push(attendee);
    if (attendeeInput) attendeeInput.value = '';
    if (attendeeSelect) attendeeSelect.value = '';
    renderAttendees();
  }

  function removeAttendee(index) {
    currentAttendees.splice(index, 1);
    renderAttendees();
  }

  function renderAttendees() {
    const attendeesList = document.getElementById('attendees-list') || document.getElementById('attendees-display');
    if (!attendeesList) return;

    attendeesList.innerHTML = '';

    if (currentAttendees.length === 0) {
      return;
    }

    currentAttendees.forEach((attendee, index) => {
      const li = document.createElement('div');
      li.className = 'attendee-item';

      const text = document.createElement('span');
      text.textContent = attendee;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'attendee-remove';
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.title = 'Remove attendee';
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        removeAttendee(index);
      });

      li.appendChild(text);
      li.appendChild(removeBtn);
      attendeesList.appendChild(li);
    });
  }

  function getMeetingsForDisplay() {
    let meetings = opusData.meetings;
    const today = utils.getCurrentDateISO();

    if (currentFilter === 'upcoming') {
      meetings = meetings.filter(m => m.date >= today);
    } else if (currentFilter === 'past') {
      meetings = meetings.filter(m => m.date < today);
    }

    return meetings.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }

  function renderMeetings() {
    const meetings = getMeetingsForDisplay();
    const container = document.getElementById('meetings-container');
    const emptyState = document.getElementById('empty-state');

    if (!container) return;

    if (meetings.length === 0) {
      container.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';
    container.innerHTML = '';

    meetings.forEach(meeting => {
      const meetingElement = createMeetingCard(meeting);
      container.appendChild(meetingElement);
    });
  }

  function createMeetingCard(meeting) {
    const today = utils.getCurrentDateISO();
    const isUpcoming = meeting.date >= today;

    const div = document.createElement('div');
    div.className = `meeting-card ${isUpcoming ? 'upcoming' : 'past'}`;
    div.dataset.meetingId = meeting.id;

    const content = document.createElement('div');
    content.className = 'meeting-card-content';

    const header = document.createElement('div');
    header.className = 'meeting-card-header';

    const title = document.createElement('h3');
    title.className = 'meeting-card-title';
    title.textContent = meeting.title;

    const statusBadge = document.createElement('span');
    statusBadge.className = `meeting-status-badge ${isUpcoming ? '' : 'past'}`;
    statusBadge.textContent = isUpcoming ? 'Upcoming' : 'Past';

    header.appendChild(title);
    header.appendChild(statusBadge);
    content.appendChild(header);

    const details = document.createElement('div');
    details.className = 'meeting-details';

    const dateItem = document.createElement('div');
    dateItem.className = 'meeting-detail-item';
    dateItem.innerHTML = `<i class="fas fa-calendar"></i> ${utils.formatDate(meeting.date, 'MMM DD, YYYY')}`;
    details.appendChild(dateItem);

    const timeItem = document.createElement('div');
    timeItem.className = 'meeting-detail-item';
    timeItem.innerHTML = `<i class="fas fa-clock"></i> ${utils.formatTime(meeting.startTime)} - ${utils.formatTime(meeting.endTime)}`;
    details.appendChild(timeItem);

    if (meeting.location) {
      const locationItem = document.createElement('div');
      locationItem.className = 'meeting-detail-item';
      locationItem.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${utils.escapeHtml(meeting.location)}`;
      details.appendChild(locationItem);
    }

    content.appendChild(details);

    if (meeting.agenda) {
      const agenda = document.createElement('div');
      agenda.className = 'meeting-agenda';
      agenda.innerHTML = `<strong>Agenda:</strong> ${utils.escapeHtml(meeting.agenda)}`;
      content.appendChild(agenda);
    }

    if (meeting.attendees && meeting.attendees.length > 0) {
      const attendeesContainer = document.createElement('div');
      attendeesContainer.style.marginTop = 'var(--opus-spacing-md)';

      const attendeesLabel = document.createElement('strong');
      attendeesLabel.style.display = 'block';
      attendeesLabel.style.marginBottom = 'var(--opus-spacing-sm)';
      attendeesLabel.style.color = 'var(--opus-text-primary)';
      attendeesLabel.style.fontSize = '0.9rem';
      attendeesLabel.textContent = `Attendees (${meeting.attendees.length})`;
      attendeesContainer.appendChild(attendeesLabel);

      const attendeesList = document.createElement('div');
      attendeesList.className = 'meeting-attendees';

      meeting.attendees.forEach(attendee => {
        const badge = document.createElement('span');
        badge.className = 'attendee-badge';
        badge.textContent = attendee;
        attendeesList.appendChild(badge);
      });

      attendeesContainer.appendChild(attendeesList);
      content.appendChild(attendeesContainer);
    }

    div.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'meeting-card-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'meeting-action-btn';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editBtn.addEventListener('click', () => openMeetingModal(meeting));
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'meeting-action-btn delete';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteBtn.addEventListener('click', () => {
      editingMeetingId = meeting.id;
      handleDeleteMeeting();
    });
    actions.appendChild(deleteBtn);

    div.appendChild(actions);

    return div;
  }

  function openMeetingModal(meeting) {
    editingMeetingId = meeting.id;

    document.getElementById('edit-meeting-title').value = meeting.title;
    document.getElementById('edit-meeting-date').value = meeting.date;
    document.getElementById('edit-meeting-start-time').value = meeting.startTime;
    document.getElementById('edit-meeting-end-time').value = meeting.endTime;
    document.getElementById('edit-meeting-location').value = meeting.location || '';
    document.getElementById('edit-meeting-agenda').value = meeting.agenda || '';
    document.getElementById('edit-meeting-attendees').value = (meeting.attendees || []).join(', ');

    const editSection = document.getElementById('meeting-edit-section');
    if (editSection) {
      editSection.style.display = 'block';
      editSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function closeMeetingModal() {
    editingMeetingId = null;
    const editSection = document.getElementById('meeting-edit-section');
    if (editSection) {
      editSection.style.display = 'none';
    }
  }

  return {
    initialize
  };
})();
