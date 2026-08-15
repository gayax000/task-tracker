// ==========================================
// 1. DATA ARCHITECTURE & SEED DATA
// ==========================================

const SEED_TASKS = [
    {
        id: 1715000000001,
        title: "Setup MongoDB Database Schema",
        assignee: "Kasun",
        priority: "High",
        dueDate: "2026-08-18",
        status: "In Progress"
    },
    {
        id: 1715000000002,
        title: "Design Landing Page Mockups",
        assignee: "Sarah",
        priority: "Medium",
        dueDate: "2026-08-20",
        status: "To Do"
    },
    {
        id: 1715000000003,
        title: "Fix Authentication Middleware Bug",
        assignee: "Nimal",
        priority: "High",
        dueDate: "2026-08-16",
        status: "To Do"
    },
    {
        id: 1715000000004,
        title: "Write API Documentation",
        assignee: "Amaya",
        priority: "Low",
        dueDate: "2026-08-22",
        status: "Done"
    },
    {
        id: 1715000000005,
        title: "Configure Docker Container",
        assignee: "Kasun",
        priority: "Medium",
        dueDate: "2026-08-25",
        status: "To Do"
    }
];

function getTasksFromStorage() {
    const stored = localStorage.getItem('tasks');
    if (!stored) {
        localStorage.setItem('tasks', JSON.stringify(SEED_TASKS));
        return SEED_TASKS;
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse local storage JSON", e);
        return SEED_TASKS;
    }
}

function saveTasksToStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Security Helper
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// ==========================================
// 2. RENDERING & FILTERING ENGINE
// ==========================================

function populateAssigneeFilter(tasks) {
    const assigneeFilter = document.getElementById('filter-assignee');
    if (!assigneeFilter) return;

    const selectedAssignee = assigneeFilter.value || 'All';
    const uniqueAssignees = [...new Set(tasks.map(task => task.assignee).filter(Boolean))].sort();

    assigneeFilter.innerHTML = '<option value="All">All Assignees</option>';
    uniqueAssignees.forEach(assignee => {
        const option = document.createElement('option');
        option.value = assignee;
        option.textContent = assignee;
        if (assignee === selectedAssignee) option.selected = true;
        assigneeFilter.appendChild(option);
    });

    if (!uniqueAssignees.includes(selectedAssignee)) {
        assigneeFilter.value = 'All';
    }
}

function renderTasks() {
    const container = document.getElementById('tasks-container');
    if (!container) return;

    const allTasks = getTasksFromStorage();
    const searchInput = document.getElementById('search-title');
    const statusFilter = document.getElementById('filter-status');
    const assigneeFilter = document.getElementById('filter-assignee');

    populateAssigneeFilter(allTasks);

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedStatus = statusFilter ? statusFilter.value : 'All';
    const selectedAssignee = assigneeFilter ? assigneeFilter.value : 'All';

    // Apply Search + Status + Assignee Filters
    const filteredTasks = allTasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
            (task.assignee || '').toLowerCase().includes(searchTerm);
        const matchesStatus = selectedStatus === 'All' || task.status === selectedStatus;
        const matchesAssignee = selectedAssignee === 'All' || task.assignee === selectedAssignee;
        return matchesSearch && matchesStatus && matchesAssignee;
    });

    // Chronological Sort by Due Date (Ascending)
    const sortedTasks = filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    container.innerHTML = '';

    if (sortedTasks.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No tasks found matching your filter criteria.</p>`;
        updateSummaryCounters(allTasks);
        return;
    }

    sortedTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.setAttribute('data-id', task.id);

        card.innerHTML = `
      <div class="task-card-header">
        <h3 style="font-size: 1.05rem;">${escapeHTML(task.title)}</h3>
        <span class="priority-tag priority-${task.priority.toLowerCase()}">${task.priority}</span>
      </div>
      
      <p style="font-size: 0.88rem; color: var(--text-muted);">
        👤 <strong>Assignee:</strong> ${escapeHTML(task.assignee || 'Unassigned')}
      </p>
      
      <p style="font-size: 0.88rem; color: var(--text-muted);">
        📅 <strong>Due:</strong> ${task.dueDate}
      </p>

      <div class="task-card-actions">
        <label style="font-size: 0.85rem; font-weight: 600;">
          Status:
          <select class="status-select" data-id="${task.id}">
            <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
          </select>
        </label>
        
        <button class="btn-delete" data-id="${task.id}">Delete</button>
      </div>
    `;

        container.appendChild(card);
    });

    attachCardEventListeners();
    updateSummaryCounters(allTasks);
}

function updateSummaryCounters(tasks) {
    const countTotal = document.getElementById('count-total');
    const countTodo = document.getElementById('count-todo');
    const countProgress = document.getElementById('count-in-progress');
    const countDone = document.getElementById('count-done');

    if (countTotal) countTotal.textContent = tasks.length;
    if (countTodo) countTodo.textContent = tasks.filter(t => t.status === 'To Do').length;
    if (countProgress) countProgress.textContent = tasks.filter(t => t.status === 'In Progress').length;
    if (countDone) countDone.textContent = tasks.filter(t => t.status === 'Done').length;
}

function attachCardEventListeners() {
    // Handle Status Dropdown Changes
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const taskId = Number(e.target.getAttribute('data-id'));
            const newStatus = e.target.value;

            const tasks = getTasksFromStorage();
            const targetTask = tasks.find(t => t.id === taskId);
            if (targetTask) {
                targetTask.status = newStatus;
                saveTasksToStorage(tasks);
                renderTasks();
            }
        });
    });

    // Handle Task Deletion
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = Number(e.target.getAttribute('data-id'));

            let tasks = getTasksFromStorage();
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasksToStorage(tasks);
            renderTasks();
        });
    });
}

// ==========================================
// 3. INITIALIZATION & GLOBAL HANDLERS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const btnAllTasks = document.getElementById('nav-all-tasks');
    const btnAddTask = document.getElementById('nav-add-task');
    const viewTaskList = document.getElementById('view-task-list');
    const viewAddTask = document.getElementById('view-add-task');
    const taskForm = document.getElementById('task-form');
    const searchInput = document.getElementById('search-title');
    const statusFilter = document.getElementById('filter-status');
    const assigneeFilter = document.getElementById('filter-assignee');
    const dueDateInput = document.getElementById('task-due-date');

    // Prevent past dates in datepicker
    if (dueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.setAttribute('min', today);
    }

    // Navigation Switching
    if (btnAllTasks && btnAddTask && viewTaskList && viewAddTask) {
        btnAllTasks.addEventListener('click', () => {
            btnAllTasks.classList.add('active');
            btnAddTask.classList.remove('active');
            viewTaskList.classList.remove('hidden');
            viewAddTask.classList.add('hidden');
        });

        btnAddTask.addEventListener('click', () => {
            btnAddTask.classList.add('active');
            btnAllTasks.classList.remove('active');
            viewAddTask.classList.remove('hidden');
            viewTaskList.classList.add('hidden');
        });
    }

    // New Task Form Handler
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const titleInput = document.getElementById('task-title');
            const assigneeInput = document.getElementById('task-assignee');
            const priorityInput = document.getElementById('task-priority');

            if (!titleInput.value.trim() || !assigneeInput.value.trim() || !dueDateInput.value) {
                alert("Please fill out all required fields.");
                return;
            }

            const newTask = {
                id: Date.now(),
                title: titleInput.value.trim(),
                assignee: assigneeInput.value.trim(),
                priority: priorityInput.value,
                dueDate: dueDateInput.value,
                status: "To Do"
            };

            const tasks = getTasksFromStorage();
            tasks.push(newTask);
            saveTasksToStorage(tasks);

            taskForm.reset();
            renderTasks();
            btnAllTasks.click();
        });
    }

    // Real-time Search and Filter Listeners
    if (searchInput) searchInput.addEventListener('input', renderTasks);
    if (statusFilter) statusFilter.addEventListener('change', renderTasks);
    if (assigneeFilter) assigneeFilter.addEventListener('change', renderTasks);

    // Initial App Render
    renderTasks();
});