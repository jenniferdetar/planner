const dragDrop = (() => {
  let draggedElement = null;
  let draggedData = null;
  const dropZones = new Map();

  function initializeDragDrop(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.warn(`Container not found: ${containerSelector}`);
      return;
    }

    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('dragend', handleDragEnd);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragenter', handleDragEnter);
    container.addEventListener('dragleave', handleDragLeave);
  }

  function makeTaskDraggable(element, task) {
    if (!element) return;
    
    element.draggable = true;
    element.style.cursor = 'grab';
    element.dataset.taskId = task.id;
    element.dataset.taskData = JSON.stringify(task);

    element.addEventListener('dragstart', (e) => {
      draggedElement = element;
      draggedData = task;
      element.style.opacity = '0.5';
      element.style.cursor = 'grabbing';
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify(task));
      
      const dragImage = element.cloneNode(true);
      dragImage.style.opacity = '0.7';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    });

    element.addEventListener('dragend', (e) => {
      element.style.opacity = '1';
      element.style.cursor = 'grab';
      draggedElement = null;
      draggedData = null;
    });
  }

  function makeDropZone(element, onDrop) {
    if (!element) return;
    
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      element.classList.add('opus-drop-active');
    });

    element.addEventListener('dragleave', (e) => {
      if (e.target === element) {
        element.classList.remove('opus-drop-active');
      }
    });

    element.addEventListener('drop', (e) => {
      e.preventDefault();
      element.classList.remove('opus-drop-active');
      
      let data;
      try {
        const jsonData = e.dataTransfer.getData('application/json');
        data = jsonData ? JSON.parse(jsonData) : draggedData;
      } catch (error) {
        console.error('Error parsing drop data:', error);
        return;
      }

      if (data && onDrop) {
        onDrop(data, e, element);
      }
    });

    dropZones.set(element, onDrop);
  }

  function handleDragStart(e) {
    if (e.target.draggable === false) {
      e.preventDefault();
      return;
    }
  }

  function handleDragEnd(e) {
    const allElements = document.querySelectorAll('[draggable="true"]');
    allElements.forEach(el => {
      el.style.opacity = '1';
      el.classList.remove('opus-dragging');
    });
    document.querySelectorAll('.opus-drop-active').forEach(el => {
      el.classList.remove('opus-drop-active');
    });
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  function handleDragEnter(e) {
    if (e.target.classList && e.target.classList.contains('opus-drop-zone')) {
      e.target.classList.add('opus-drop-active');
    }
  }

  function handleDragLeave(e) {
    if (e.target.classList && e.target.classList.contains('opus-drop-zone')) {
      e.target.classList.remove('opus-drop-active');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.classList && e.target.classList.contains('opus-drop-zone')) {
      e.target.classList.remove('opus-drop-active');
    }
    return false;
  }

  function reprioritizeTask(task, newPosition) {
    const tasks = opusStorage.getTasks();
    const currentIndex = tasks.findIndex(t => t.id === task.id);
    
    if (currentIndex === -1) {
      console.warn('Task not found for reprioritization');
      return;
    }

    tasks.splice(currentIndex, 1);
    tasks.splice(newPosition, 0, task);

    tasks.forEach((t, index) => {
      t.order = index;
    });

    opusStorage.updateTask(task.id, { updatedAt: new Date().toISOString() });
    opusData.syncFromStorage();
    opusData.notifyListeners('task-reordered', { task, newPosition });
  }

  function scheduleDraggedTask(task, newDate, newTime = null) {
    try {
      const updatedTask = opusStorage.updateTask(task.id, {
        dueDate: newDate,
        dueTime: newTime
      });

      opusData.syncFromStorage();
      opusData.notifyListeners('task-scheduled', { task: updatedTask, newDate, newTime });

      return updatedTask;
    } catch (error) {
      console.error('Error scheduling task:', error);
      throw error;
    }
  }

  function scheduleTaskFromMaster(masterTask, date, time = null) {
    try {
      const scheduledTask = opusStorage.scheduleTask(masterTask.id, date, time);
      
      const masterIndex = opusStorage.getMasterTasks().findIndex(t => t.id === masterTask.id);
      if (masterIndex !== -1) {
        opusStorage.deleteMasterTask(masterTask.id);
      }

      opusData.syncFromStorage();
      opusData.notifyListeners('master-task-scheduled', { 
        masterTask, 
        scheduledTask, 
        date, 
        time 
      });

      return scheduledTask;
    } catch (error) {
      console.error('Error scheduling master task:', error);
      throw error;
    }
  }

  function enableTaskReordering(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.warn(`Container not found: ${containerSelector}`);
      return;
    }

    let draggedItem = null;
    let allItems = [];

    function setupReordering() {
      allItems = Array.from(container.querySelectorAll('[data-task-id]'));
      
      allItems.forEach((item, index) => {
        item.draggable = true;
        item.style.cursor = 'grab';
        
        item.addEventListener('dragstart', (e) => {
          draggedItem = item;
          item.classList.add('opus-dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/html', item.innerHTML);
        });

        item.addEventListener('dragend', (e) => {
          item.classList.remove('opus-dragging');
          draggedItem = null;
          allItems.forEach(i => i.classList.remove('opus-drop-active'));
        });

        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          
          if (item !== draggedItem) {
            item.classList.add('opus-drop-active');
          }
        });

        item.addEventListener('dragleave', (e) => {
          if (e.target === item) {
            item.classList.remove('opus-drop-active');
          }
        });

        item.addEventListener('drop', (e) => {
          e.preventDefault();
          item.classList.remove('opus-drop-active');

          if (draggedItem !== item) {
            const draggedIndex = allItems.indexOf(draggedItem);
            const targetIndex = allItems.indexOf(item);
            
            if (draggedIndex !== -1 && targetIndex !== -1) {
              allItems.splice(draggedIndex, 1);
              allItems.splice(targetIndex, 0, draggedItem);

              if (draggedIndex < targetIndex) {
                item.after(draggedItem);
              } else {
                item.before(draggedItem);
              }

              const taskId = draggedItem.dataset.taskId;
              if (taskId) {
                const task = opusStorage.getTaskById(taskId);
                if (task) {
                  reprioritizeTask(task, targetIndex);
                }
              }
            }
          }
        });
      });
    }

    setupReordering();

    const observer = new MutationObserver(() => {
      setupReordering();
    });

    observer.observe(container, {
      childList: true,
      subtree: true
    });
  }

  return {
    initializeDragDrop,
    makeTaskDraggable,
    makeDropZone,
    reprioritizeTask,
    scheduleDraggedTask,
    scheduleTaskFromMaster,
    enableTaskReordering,
    get draggedElement() { return draggedElement; },
    get draggedData() { return draggedData; }
  };
})();
