const DataManagementModule = (() => {
  let selectedFile = null;

  function initializePage() {
    opusData.initialize().then(() => {
      setupEventListeners();
      updateDataInfo();
    }).catch(error => {
      console.error('Error initializing page:', error);
      showToast('Error loading data', 'error');
    });
  }

  function setupEventListeners() {
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', handleExport);
    }

    const importFile = document.getElementById('import-file');
    if (importFile) {
      importFile.addEventListener('change', handleFileSelected);
    }

    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        document.getElementById('import-file').click();
      });
    }

    const bulkImportFile = document.getElementById('bulk-import-file');
    if (bulkImportFile) {
      bulkImportFile.addEventListener('change', handleBulkImportFile);
    }

    const bulkImportBtn = document.getElementById('bulk-import-btn');
    if (bulkImportBtn) {
      bulkImportBtn.addEventListener('click', () => {
        document.getElementById('bulk-import-file').click();
      });
    }

    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', handleClearData);
    }
  }

  function handleExport() {
    try {
      const data = opusStorage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `opus-one-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      localStorage.setItem('lastBackup', new Date().toISOString());
      updateDataInfo();

      showToast('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Error exporting data', 'error');
    }
  }

  function handleFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    selectedFile = file;
    const fileName = document.getElementById('file-name');
    if (fileName) {
      fileName.textContent = file.name;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target.result;
        JSON.parse(jsonString);
        showToast(`File ready to import: ${file.name}`, 'success');
        performImport(jsonString);
      } catch (error) {
        showToast('Invalid JSON file. Please select a valid backup file.', 'error');
      }
    };
    reader.readAsText(file);
  }

  function handleBulkImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const bulkFileName = document.getElementById('bulk-file-name');
    if (bulkFileName) {
      bulkFileName.textContent = file.name;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target.result;
        const taskArray = JSON.parse(jsonString);
        if (!Array.isArray(taskArray)) {
          showToast('Invalid format. File must contain a JSON array of tasks.', 'error');
          return;
        }
        performBulkImport(taskArray);
      } catch (error) {
        showToast('Invalid JSON file. Please select a valid tasks file.', 'error');
      }
    };
    reader.readAsText(file);
  }

  function performBulkImport(taskArray) {
    if (!confirm(`Import ${taskArray.length} tasks? Existing tasks will not be deleted.`)) {
      return;
    }

    try {
      const results = bulkImportTasks(taskArray);
      opusData.syncFromStorage();
      updateDataInfo();

      let message = `Successfully imported ${results.imported} tasks`;
      if (results.failed > 0) {
        message += ` (${results.failed} failed)`;
      }
      showToast(message, 'success');

      if (results.errors.length > 0) {
        console.warn('Import errors:', results.errors);
      }

      const fileInput = document.getElementById('bulk-import-file');
      if (fileInput) {
        fileInput.value = '';
      }
      const bulkFileName = document.getElementById('bulk-file-name');
      if (bulkFileName) {
        bulkFileName.textContent = '';
      }
    } catch (error) {
      console.error('Error importing tasks:', error);
      showToast(error.message || 'Error importing tasks', 'error');
    }
  }

  function performImport(jsonString) {
    if (!confirm('This will replace all your current data with the data from the file. This action cannot be undone. Continue?')) {
      return;
    }

    try {
      opusStorage.importData(jsonString);
      opusData.syncFromStorage();
      updateDataInfo();
      showToast('Data imported successfully', 'success');

      const fileInput = document.getElementById('import-file');
      if (fileInput) {
        fileInput.value = '';
      }
      const fileName = document.getElementById('file-name');
      if (fileName) {
        fileName.textContent = '';
      }
    } catch (error) {
      console.error('Error importing data:', error);
      showToast(error.message || 'Error importing data', 'error');
    }
  }

  function handleClearData() {
    if (!confirm('Are you sure you want to delete all your data? This action cannot be undone. All tasks, goals, notes, meetings, and master tasks will be permanently deleted.')) {
      return;
    }

    if (!confirm('This is your last chance. Type "DELETE" in your next action to confirm.')) {
      return;
    }

    const confirmed = prompt('Type DELETE to permanently erase all data:');
    if (confirmed !== 'DELETE') {
      showToast('Data deletion cancelled', 'error');
      return;
    }

    try {
      opusStorage.clearAllData();
      opusData.syncFromStorage();
      updateDataInfo();
      showToast('All data has been cleared', 'success');
    } catch (error) {
      console.error('Error clearing data:', error);
      showToast('Error clearing data', 'error');
    }
  }

  function updateDataInfo() {
    const tasks = opusStorage.getTasks();
    const goals = opusStorage.getGoals();
    const notes = opusStorage.getNotes();
    const meetings = opusStorage.getMeetings();
    const masterTasks = opusStorage.getMasterTasks();

    const taskCount = document.getElementById('task-count');
    if (taskCount) {
      taskCount.textContent = tasks.length;
    }

    const goalCount = document.getElementById('goal-count');
    if (goalCount) {
      goalCount.textContent = goals.length;
    }

    const noteCount = document.getElementById('note-count');
    if (noteCount) {
      noteCount.textContent = notes.length;
    }

    const meetingCount = document.getElementById('meeting-count');
    if (meetingCount) {
      meetingCount.textContent = meetings.length;
    }

    const masterTaskCount = document.getElementById('master-task-count');
    if (masterTaskCount) {
      masterTaskCount.textContent = masterTasks.length;
    }

    const lastBackupEl = document.getElementById('last-backup');
    if (lastBackupEl) {
      const lastBackup = localStorage.getItem('lastBackup');
      if (lastBackup) {
        const date = new Date(lastBackup);
        lastBackupEl.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      } else {
        lastBackupEl.textContent = 'Never';
      }
    }
  }

  function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
  } else {
    initializePage();
  }

  return {
    updateDataInfo
  };
})();
