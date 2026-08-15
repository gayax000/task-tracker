// Tab Navigation Handling
document.addEventListener('DOMContentLoaded', () => {
  const btnAllTasks = document.getElementById('nav-all-tasks');
  const btnAddTask = document.getElementById('nav-add-task');
  const viewTaskList = document.getElementById('view-task-list');
  const viewAddTask = document.getElementById('view-add-task');

  // Switch to "All Tasks" View
  btnAllTasks.addEventListener('click', () => {
    btnAllTasks.classList.add('active');
    btnAddTask.classList.remove('active');
    viewTaskList.classList.remove('hidden');
    viewAddTask.classList.add('hidden');
  });

  // Switch to "Add Task" View
  btnAddTask.addEventListener('click', () => {
    btnAddTask.classList.add('active');
    btnAllTasks.classList.remove('active');
    viewAddTask.classList.remove('hidden');
    viewTaskList.classList.add('hidden');
  });
});