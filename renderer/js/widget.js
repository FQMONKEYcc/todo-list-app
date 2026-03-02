// ===== Widget Renderer =====

const widgetList = document.getElementById('widgetList');

function getDeadlineStatus(deadline) {
  if (!deadline) return 'none';
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) return 'overdue';
  if (diffHours <= 24) return 'imminent';
  if (diffHours <= 72) return 'approaching';
  return 'normal';
}

function formatDeadline(deadline) {
  if (!deadline) return '';
  const dl = new Date(deadline);
  const now = new Date();
  const diffMs = dl - now;

  if (diffMs < 0) {
    const hours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
    if (hours < 24) return `Overdue ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Overdue ${days}d`;
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  if (days <= 7) return `${days}d left`;

  const month = dl.getMonth() + 1;
  const day = dl.getDate();
  const hour = dl.getHours().toString().padStart(2, '0');
  const min = dl.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hour}:${min}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderTodos(todos) {
  if (!todos || todos.length === 0) {
    widgetList.innerHTML = '<div class="widget-empty">No upcoming deadlines</div>';
    return;
  }

  widgetList.innerHTML = '';
  todos.forEach(todo => {
    const statusClass = todo.status === '进行中' ? 'progress' : 'pending';
    const dlStatus = getDeadlineStatus(todo.deadline);
    const dlText = formatDeadline(todo.deadline);

    const item = document.createElement('div');
    item.className = 'widget-item';
    item.dataset.id = todo.id;

    const checkBtn = document.createElement('button');
    checkBtn.className = `widget-check-btn ${statusClass}`;
    checkBtn.title = 'Mark as done';
    checkBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      item.classList.add('completing');
      await window.widgetApi.completeTodo(todo.id);
    });

    const body = document.createElement('div');
    body.className = 'widget-item-body';
    body.innerHTML = `
      <div class="widget-item-title">${escapeHtml(todo.title)}</div>
      <div class="widget-item-deadline ${dlStatus}">${dlText}</div>
    `;

    item.appendChild(checkBtn);
    item.appendChild(body);
    widgetList.appendChild(item);
  });
}

// Right-click to close
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  window.widgetApi.closeWidget();
});

// ===== Quick Add Form Logic =====

const addBtn = document.getElementById('widgetAddBtn');
const addForm = document.getElementById('widgetAddForm');
const addTitle = document.getElementById('widgetAddTitle');
const addDeadline = document.getElementById('widgetAddDeadline');
const addSubmit = document.getElementById('widgetAddSubmit');
let formOpen = false;
let isSubmitting = false;

function toggleForm() {
  formOpen = !formOpen;
  addForm.classList.toggle('open', formOpen);
  addBtn.classList.toggle('active', formOpen);
  addBtn.setAttribute('aria-expanded', String(formOpen));
  if (formOpen) {
    addTitle.focus();
  } else {
    addTitle.value = '';
    addDeadline.value = '';
  }
}

function closeForm() {
  if (!formOpen) return;
  formOpen = false;
  addForm.classList.remove('open');
  addBtn.classList.remove('active');
  addBtn.setAttribute('aria-expanded', 'false');
  addTitle.value = '';
  addDeadline.value = '';
}

async function submitTodo() {
  if (isSubmitting) return;
  const title = addTitle.value.trim();
  if (!title) {
    addTitle.classList.add('shake');
    setTimeout(() => addTitle.classList.remove('shake'), 300);
    addTitle.focus();
    return;
  }

  const deadline = addDeadline.value || null;
  isSubmitting = true;

  try {
    await window.widgetApi.createTodo({ title, deadline });

    // Success feedback
    addTitle.value = '';
    addDeadline.value = '';
    addTitle.classList.add('success');
    addTitle.placeholder = 'Added!';
    setTimeout(() => {
      addTitle.classList.remove('success');
      addTitle.placeholder = 'Type a todo title...';
    }, 800);
    addTitle.focus();
  } catch (err) {
    console.error('Failed to create todo:', err);
    // Error feedback — show red border and "Failed" placeholder
    addTitle.classList.add('shake');
    addTitle.placeholder = 'Failed to add. Try again...';
    setTimeout(() => {
      addTitle.classList.remove('shake');
      addTitle.placeholder = 'Type a todo title...';
    }, 1500);
  } finally {
    isSubmitting = false;
  }
}

addBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleForm();
});

addSubmit.addEventListener('click', (e) => {
  e.stopPropagation();
  submitTodo();
});

addTitle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitTodo();
  }
  if (e.key === 'Escape') {
    closeForm();
  }
});

addDeadline.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitTodo();
  }
  if (e.key === 'Escape') {
    closeForm();
  }
});

// Close form when clicking outside
document.addEventListener('click', (e) => {
  if (formOpen && !addForm.contains(e.target) && e.target !== addBtn && !addBtn.contains(e.target)) {
    closeForm();
  }
});

// Initialize
async function init() {
  const data = await window.widgetApi.getInitialData();
  renderTodos(data);
}

// Listen for updates
window.widgetApi.onTodosUpdate((data) => {
  renderTodos(data);
});

init();
