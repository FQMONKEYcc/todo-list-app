// ===== Todo List Rendering — Bento Grid Style =====

const TodoList = {
  container: null,
  emptyState: null,
  todos: [],
  tags: [],

  init(container, emptyState) {
    this.container = container;
    this.emptyState = emptyState;
  },

  // Callback for when completed section is toggled
  onToggleCompleted: null,

  render(todos, tags, options = {}) {
    this.todos = todos;
    this.tags = tags;

    this.container.innerHTML = '';

    if (todos.length === 0) {
      this.container.style.display = 'none';
      this.emptyState.style.display = 'flex';
      return;
    }

    this.container.style.display = 'grid';
    this.emptyState.style.display = 'none';

    // Split into active vs completed
    const activeTodos = todos.filter(t => t.status !== '已完成');
    const completedTodos = todos.filter(t => t.status === '已完成');

    // Render active todos
    activeTodos.forEach((todo, index) => {
      const card = this.createCard(todo);
      const delay = Math.min(index * 30, 300);
      card.style.animationDelay = `${delay}ms`;
      this.container.appendChild(card);
    });

    // Render completed section with divider
    if (completedTodos.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'completed-divider';
      divider.innerHTML = `
        <div class="completed-divider-header" id="completedToggle">
          <svg class="completed-chevron${options.completedCollapsed ? '' : ' expanded'}" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
          </svg>
          <span>Done (${completedTodos.length})</span>
        </div>
      `;
      this.container.appendChild(divider);

      const completedContainer = document.createElement('div');
      completedContainer.className = 'completed-section';
      completedContainer.id = 'completedSection';
      if (options.completedCollapsed) {
        completedContainer.style.display = 'none';
      }

      completedTodos.forEach((todo) => {
        const card = this.createCard(todo);
        completedContainer.appendChild(card);
      });

      this.container.appendChild(completedContainer);

      // Bind toggle event
      divider.querySelector('.completed-divider-header').addEventListener('click', () => {
        const section = document.getElementById('completedSection');
        const chevron = divider.querySelector('.completed-chevron');
        if (section.style.display === 'none') {
          section.style.display = '';
          chevron.classList.add('expanded');
          if (this.onToggleCompleted) this.onToggleCompleted(false);
        } else {
          section.style.display = 'none';
          chevron.classList.remove('expanded');
          if (this.onToggleCompleted) this.onToggleCompleted(true);
        }
      });
    }
  },

  createCard(todo) {
    const card = document.createElement('div');
    card.className = 'todo-card';
    card.dataset.id = todo.id;
    card.dataset.status = todo.status;

    const deadlineStatus = getDeadlineStatus(todo.deadline);
    const deadlineText = formatDeadline(todo.deadline);

    // Tag chips HTML
    const tagChips = todo.tagIds.map(tid => {
      const tag = this.tags.find(t => t.id === tid);
      if (!tag) return '';
      return `<span class="todo-tag-chip" style="background:${tag.color}">${this.escapeHtml(tag.name)}</span>`;
    }).join('');

    // Deadline HTML
    let deadlineHtml = '';
    if (todo.deadline) {
      deadlineHtml = `<span class="todo-deadline ${deadlineStatus}">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
        ${deadlineText}
      </span>`;
    }

    card.innerHTML = `
      <button class="todo-status-btn" data-status="${todo.status}" title="Click to change status"></button>
      <div class="todo-body">
        <div class="todo-title">${this.escapeHtml(todo.title)}</div>
        ${todo.description ? `<div class="todo-desc">${this.escapeHtml(todo.description)}</div>` : ''}
        <div class="todo-meta">
          ${deadlineHtml}
          ${tagChips}
        </div>
      </div>
      <div class="todo-actions">
        <button class="btn-todo-action edit" title="Edit">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </button>
        <button class="btn-todo-action delete" title="Delete">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    `;

    // Status button click
    const statusBtn = card.querySelector('.todo-status-btn');
    statusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Add visual feedback
      statusBtn.style.transform = 'scale(1.3)';
      setTimeout(() => { statusBtn.style.transform = ''; }, 200);

      const newStatus = nextStatus(todo.status);
      if (typeof App !== 'undefined') App.updateTodoStatus(todo.id, newStatus);
    });

    // Edit button
    card.querySelector('.edit').addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof App !== 'undefined') App.editTodo(todo.id);
    });

    // Delete button
    card.querySelector('.delete').addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof App !== 'undefined') App.deleteTodo(todo.id);
    });

    // Click card to edit
    card.addEventListener('click', () => {
      if (typeof App !== 'undefined') App.editTodo(todo.id);
    });

    return card;
  },

  highlightTodo(todoId) {
    const card = this.container.querySelector(`[data-id="${todoId}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.boxShadow = '0 0 0 3px var(--primary), var(--shadow-lg)';
      card.style.transform = 'scale(1.02)';
      setTimeout(() => {
        card.style.boxShadow = '';
        card.style.transform = '';
      }, 2000);
    }
  },

  setViewMode(mode) {
    const container = this.container;
    if (!container) return;
    if (mode === 'compact') {
      container.classList.add('view-compact');
    } else {
      container.classList.remove('view-compact');
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
