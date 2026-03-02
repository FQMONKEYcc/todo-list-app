// ===== Widget Renderer (Neutralinojs) =====

const widgetList = document.getElementById('widgetList');
let refreshTimer = null;

// ===== Window Drag via JS =====
// -webkit-app-region: drag is unreliable in Neutralino child windows on WebView2.
// Use JS mousedown + Neutralino.window.move() instead, with RAF throttling.
(function initDrag() {
  const header = document.querySelector('.widget-header');
  if (!header) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let winStartX = 0;
  let winStartY = 0;
  let rafPending = false;

  header.addEventListener('mousedown', async (e) => {
    // Ignore clicks on buttons inside header
    if (e.target.closest('.widget-add-btn')) return;
    if (e.button !== 0) return; // left button only

    isDragging = true;
    startX = e.screenX;
    startY = e.screenY;

    try {
      const pos = await Neutralino.window.getPosition();
      winStartX = pos.x;
      winStartY = pos.y;
    } catch {
      isDragging = false;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || rafPending) return;

    rafPending = true;
    const dx = e.screenX - startX;
    const dy = e.screenY - startY;

    requestAnimationFrame(async () => {
      try {
        await Neutralino.window.move(winStartX + dx, winStartY + dy);
      } catch (err) {
        console.warn('Drag move failed:', err);
      }
      rafPending = false;
    });
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    rafPending = false;
  });
})();

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

async function renderTodos() {
  try {
    const todos = await WidgetStore.getNearestDeadlineTodos(10);

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
        await WidgetStore.completeTodo(todo.id);
        await renderTodos(); // Refresh list
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
  } catch (err) {
    console.error('Failed to render todos:', err);
    widgetList.innerHTML = '<div class="widget-empty" style="color:#EF4444">Error loading todos</div>';
  }
}

// Right-click to close widget
document.addEventListener('contextmenu', async (e) => {
  e.preventDefault();
  try {
    await Neutralino.window.hide();
  } catch (err) {
    console.error('Failed to hide window:', err);
  }
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

async function submitForm() {
  if (isSubmitting) return;

  const title = addTitle.value.trim();
  if (!title) {
    addTitle.classList.add('shake');
    setTimeout(() => addTitle.classList.remove('shake'), 400);
    return;
  }

  isSubmitting = true;
  addSubmit.disabled = true;
  addForm.style.opacity = '0.6';

  try {
    const todoData = {
      title,
      deadline: addDeadline.value ? new Date(addDeadline.value).toISOString() : null
    };

    await WidgetStore.createTodo(todoData);

    // Success feedback
    addForm.classList.add('success');
    setTimeout(() => addForm.classList.remove('success'), 600);

    // Clear and keep form open for continuous adding
    addTitle.value = '';
    addDeadline.value = '';
    addTitle.focus();

    // Refresh list
    await renderTodos();

  } catch (err) {
    console.error('Failed to create todo:', err);
    addForm.classList.add('error');
    setTimeout(() => addForm.classList.remove('error'), 1000);
  } finally {
    isSubmitting = false;
    addSubmit.disabled = false;
    addForm.style.opacity = '';
  }
}

// Event listeners
addBtn.addEventListener('click', toggleForm);
addSubmit.addEventListener('click', submitForm);

addTitle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitForm();
  } else if (e.key === 'Escape') {
    closeForm();
  }
});

addDeadline.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitForm();
  } else if (e.key === 'Escape') {
    closeForm();
  }
});

// Click outside form to close
document.addEventListener('click', (e) => {
  if (formOpen && !addForm.contains(e.target) && !addBtn.contains(e.target)) {
    closeForm();
  }
});

// ===== Theme Support =====
// Widget reads theme from shared data file and listens for broadcast changes.

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme || 'dark');
}

async function loadThemeFromStore() {
  try {
    const data = await WidgetStore.loadData();
    const theme = (data.settings && data.settings.theme) || 'dark';
    applyTheme(theme);
  } catch {
    applyTheme('dark');
  }
}

// ===== Initialize Widget =====

Neutralino.init();

Neutralino.events.on('ready', async () => {
  try {
    await WidgetStore.init();

    // Load and apply theme before rendering
    await loadThemeFromStore();

    await renderTodos();

    // Auto-refresh every 60 seconds
    refreshTimer = setInterval(renderTodos, 60000);

    // Listen for theme changes broadcast from main window
    Neutralino.events.on('themeChanged', (event) => {
      const theme = event.detail;
      if (theme) {
        applyTheme(theme);
      }
    });

    // Listen for app quit broadcast — exit this child process
    Neutralino.events.on('appQuit', () => {
      if (refreshTimer) clearInterval(refreshTimer);
      Neutralino.app.exit();
    });
  } catch (err) {
    console.error('Widget init failed:', err);
  }
});

// Cleanup and notify main window on close
Neutralino.events.on('windowClose', async () => {
  if (refreshTimer) clearInterval(refreshTimer);
  // Notify main window that widget has been closed
  try {
    await Neutralino.events.broadcast('widgetClosed', '');
  } catch {}
});
