const bulkImportTasks = (taskArray) => {
  if (!Array.isArray(taskArray)) {
    throw new Error('Task import must be an array');
  }

  const results = {
    imported: 0,
    failed: 0,
    errors: []
  };

  taskArray.forEach((item, index) => {
    try {
      if (!item.text && !item.title) {
        throw new Error('Task must have a title (text or title field)');
      }

      const title = item.text || item.title || '';
      const dueDate = item.due || null;
      const completed = item.completed || false;
      const priority = item.priority || 'Medium';

      if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
        throw new Error(`Invalid date format: ${dueDate}. Expected YYYY-MM-DD`);
      }

      const task = opusStorage.createTask({
        title,
        description: item.description || '',
        dueDate,
        dueTime: null,
        priority,
        category: item.category || 'Daily',
        linkedGoalIds: item.linkedGoalIds || [],
        subtasks: item.subtasks || []
      });

      if (completed && task.id) {
        opusStorage.updateTask(task.id, { completed: true });
      }

      results.imported++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Row ${index + 1}: ${error.message}`);
    }
  });

  opusStorage.saveToLocalStorage();
  return results;
};
