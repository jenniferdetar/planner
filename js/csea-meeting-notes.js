const cseaMeetingNotes = (() => {
  const STORAGE_KEY = 'cseaMeetingNotes';
  const MEMBER_CSV_PATH = 'data/Membership File_092425_191812.csv';
  const STEWARDS_PATH = 'data/csea_stewards.json';
  const memberMap = new Map();

  function parseCsv(text, maxRows) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];
    const headers = lines[0].replace('\ufeff', '').split(',');
    const rows = lines.slice(1, maxRows ? maxRows + 1 : undefined);
    return rows.map(line => {
      const cols = line.split(',');
      const rec = {};
      headers.forEach((h, idx) => {
        rec[h.trim()] = (cols[idx] || '').trim();
      });
      return rec;
    });
  }

  function loadMembers() {
    const list = document.getElementById('member-list');
    if (!list) return;
    fetch(encodeURI(MEMBER_CSV_PATH), { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Member list unavailable');
        return res.text();
      })
      .then(text => {
        const records = parseCsv(text, 4000);
        const idKey = 'Member - MemberID';
        const firstKey = 'Member - First Name';
        const lastKey = 'Member - Last Name';
        records.forEach(rec => {
          const id = (rec[idKey] || '').trim();
          const first = (rec[firstKey] || '').trim();
          const last = (rec[lastKey] || '').trim();
          if (!id && !first && !last) return;
          const displayName = last && first ? `${last}, ${first}` : (last || first || id);
          const label = displayName;
          if (!memberMap.has(label)) {
            memberMap.set(label, id);
            const option = document.createElement('option');
            option.value = label;
            list.appendChild(option);
          }
        });
      })
      .catch(() => {
        const option = document.createElement('option');
        option.value = 'Membership file unavailable';
        list.appendChild(option);
      });
  }

  function loadStewards() {
    const stewardSelect = document.getElementById('steward-name');
    if (!stewardSelect) return;
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select steward';
    stewardSelect.appendChild(placeholder);
    fetch(encodeURI(STEWARDS_PATH), { cache: 'no-store' })
      .then(res => res.json())
      .then(list => {
        list.forEach(item => {
          const option = document.createElement('option');
          option.value = item.name;
          option.textContent = item.name;
          stewardSelect.appendChild(option);
        });
      })
      .catch(() => {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Stewards unavailable';
        stewardSelect.appendChild(option);
      });
  }

  function loadNotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveNotes(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function setToday() {
    const dateEl = document.getElementById('today-date');
    if (dateEl) {
      const now = new Date();
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
  }

  function handleMemberSelection() {
    const memberInput = document.getElementById('member-name');
    const memberIdInput = document.getElementById('member-id');
    if (!memberInput || !memberIdInput) return;
    memberInput.addEventListener('change', () => {
      const match = memberMap.get(memberInput.value);
      if (match) memberIdInput.value = match;
    });
  }

  function renderNotes(notes) {
    const tbody = document.getElementById('notes-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!notes.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 9;
      cell.textContent = 'No meeting notes saved yet.';
      cell.style.textAlign = 'center';
      cell.style.padding = '20px';
      row.appendChild(cell);
      tbody.appendChild(row);
      return;
    }

    notes.forEach(note => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${note.date || ''}</td>
        <td>${note.memberName || ''}</td>
        <td>${note.memberId || ''}</td>
        <td>${note.steward || ''}</td>
        <td>${note.summary || ''}</td>
        <td>${note.outcome || ''}</td>
        <td>${note.nextSteps || ''}</td>
        <td class="notes-attachments">${note.attachments.join(', ') || '-'}</td>
        <td class="notes-actions-cell">
          <button class="planner-button planner-button-small planner-button-danger" data-id="${note.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  function handleForm(notes) {
    const form = document.getElementById('meeting-notes-form');
    if (!form) return;
    form.addEventListener('submit', event => {
      event.preventDefault();
      const attachmentsInput = document.getElementById('meeting-attachments');
      const attachments = attachmentsInput?.files
        ? Array.from(attachmentsInput.files).map(file => file.name)
        : [];
      const note = {
        id: String(Date.now()),
        date: document.getElementById('meeting-date').value,
        memberName: document.getElementById('member-name').value.trim(),
        memberId: document.getElementById('member-id').value.trim(),
        steward: document.getElementById('steward-name').value.trim(),
        summary: document.getElementById('meeting-summary').value.trim(),
        outcome: document.getElementById('meeting-outcome').value.trim(),
        nextSteps: document.getElementById('meeting-next-steps').value.trim(),
        attachments
      };
      notes.unshift(note);
      saveNotes(notes);
      renderNotes(notes);
      form.reset();
    });
  }

  function handleDelete(notes) {
    const tbody = document.getElementById('notes-body');
    if (!tbody) return;
    tbody.addEventListener('click', event => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.matches('[data-id]')) return;
      const id = target.dataset.id;
      const next = notes.filter(note => note.id !== id);
      notes.length = 0;
      notes.push(...next);
      saveNotes(notes);
      renderNotes(notes);
    });
  }

  function initialize() {
    const notes = loadNotes();
    setToday();
    loadMembers();
    loadStewards();
    handleMemberSelection();
    handleForm(notes);
    handleDelete(notes);
    renderNotes(notes);
  }

  return { initialize };
})();

document.addEventListener('DOMContentLoaded', cseaMeetingNotes.initialize);
