// ===== App - Main Entry Point =====

const App = {
  todos: [],
  tags: [],
  completedCollapsed: false,

  async init() {
    // Initialize modules
    TodoForm.init();
    FilterBar.init();
    TagManager.init();
    ThemeToggle.init();
    TodoList.init(
      document.getElementById('todoList'),
      document.getElementById('emptyState')
    );

    // Load theme first
    await ThemeToggle.load();

    // Load data
    this.todos = await window.api.getTodos();
    this.tags = await window.api.getTags();
    const settings = await window.api.getSettings();

    // Load completed collapsed state
    this.completedCollapsed = settings.completedCollapsed || false;

    // Setup completed toggle callback
    TodoList.onToggleCompleted = (collapsed) => {
      this.completedCollapsed = collapsed;
      window.api.updateSettings({ completedCollapsed: collapsed });
    };

    // Apply saved preferences
    FilterBar.loadPreferences(settings);
    FilterBar.renderTagFilters(this.tags);
    FilterBar.updateCounts(this.todos);

    // Render
    this.applyFilters();

    // Initialize view mode
    const viewBtns = document.querySelectorAll('.view-btn');
    const savedView = settings.viewMode || 'card';
    TodoList.setViewMode(savedView);
    viewBtns.forEach(btn => {
      if (btn.dataset.view === savedView) btn.classList.add('active');
      else btn.classList.remove('active');
      btn.addEventListener('click', () => {
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.view;
        TodoList.setViewMode(mode);
        window.api.updateSettings({ viewMode: mode });
      });
    });

    // Wire up buttons
    document.getElementById('btnNewTodo').addEventListener('click', () => this.newTodo());

    // Events from main process
    window.api.onNewTodo(() => this.newTodo());
    window.api.onNotificationClick((todoId) => {
      // Clear filters to ensure todo is visible
      FilterBar.currentStatus = 'all';
      FilterBar.currentTagIds = [];
      FilterBar.currentSearch = '';
      FilterBar.searchInput.value = '';
      FilterBar.statusFilters.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.status === 'all');
      });
      FilterBar.renderTagFilters(this.tags);
      this.applyFilters();
      setTimeout(() => TodoList.highlightTodo(todoId), 100);
    });

    // Sync when todos are changed externally (e.g., from widget quick-add)
    window.api.onTodosChanged(() => this.refresh());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+N: New todo
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        this.newTodo();
      }
      // Ctrl+F: Focus search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        FilterBar.searchInput.focus();
        FilterBar.searchInput.select();
      }
      // Escape: Close modals
      if (e.key === 'Escape') {
        TodoForm.close();
        TagManager.close();
      }
    });
  },

  async refresh() {
    this.todos = await window.api.getTodos();
    this.tags = await window.api.getTags();
    FilterBar.renderTagFilters(this.tags);
    FilterBar.updateCounts(this.todos);
    this.applyFilters();
  },

  applyFilters() {
    let filtered = FilterBar.filter(this.todos);
    filtered = FilterBar.sort(filtered);
    TodoList.render(filtered, this.tags, { completedCollapsed: this.completedCollapsed });
  },

  newTodo() {
    TodoForm.open(null, this.tags);
  },

  editTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) TodoForm.open(todo, this.tags);
  },

  async updateTodoStatus(id, newStatus) {
    await window.api.updateTodo(id, { status: newStatus });
    await this.refresh();
  },

  async deleteTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;
    if (confirm(`Delete "${todo.title}"?`)) {
      await window.api.deleteTodo(id);
      await this.refresh();
    }
  }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => App.init());
