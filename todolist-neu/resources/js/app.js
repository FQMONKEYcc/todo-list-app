// ===== App — Main Entry Point (Neutralinojs) =====

const App = {
  todos: [],
  tags: [],
  notificationTimer: null,

  async init() {
    // Initialize Store (filesystem-based)
    await Store.init();

    // Initialize UI modules
    TodoForm.init();
    FilterBar.init();
    TagManager.init();
    ThemeToggle.init();
    TodoList.init(
      document.getElementById('todoList'),
      document.getElementById('emptyState')
    );

    // Load theme
    ThemeToggle.load();

    // Load data (synchronous from Store)
    this.todos = Store.getAllTodos();
    this.tags = Store.getAllTags();
    const settings = Store.getSettings();

    // Apply saved preferences
    FilterBar.loadPreferences(settings);
    FilterBar.renderTagFilters(this.tags);
    FilterBar.updateCounts(this.todos);

    // Render
    this.applyFilters();

    // Wire up buttons
    document.getElementById('btnNewTodo').addEventListener('click', () => this.newTodo());

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

    // Setup system tray
    this.setupTray();

    // Setup deadline notifications
    this.startNotificationCheck();

    // Handle window close → minimize to tray
    Neutralino.events.on('windowClose', () => this.onWindowClose());
  },

  // ===== System Tray =====
  widgetWindowId: null,

  async setupTray() {
    try {
      await Neutralino.os.setTray({
        icon: '/resources/icons/trayIcon.png',
        menuItems: [
          { id: 'show', text: 'Show Todo List' },
          { id: 'widget', text: 'Show Widget' },
          { id: 'new', text: 'New Todo' },
          { text: '-' },
          { id: 'quit', text: 'Quit' }
        ]
      });

      // Tray icon click (single/double click) — restore main window
      Neutralino.events.on('trayMenuItemClicked', (event) => {
        switch (event.detail.id) {
          case 'show':
            this.restoreMainWindow();
            break;
          case 'widget':
            this.showWidget();
            break;
          case 'new':
            this.restoreMainWindow();
            setTimeout(() => this.newTodo(), 200);
            break;
          case 'quit':
            this.quitApp();
            break;
        }
      });
    } catch (err) {
      console.warn('Tray setup failed (may not be supported):', err);
    }
  },

  // Restore main window from tray
  async restoreMainWindow() {
    try {
      await Neutralino.window.show();
      await Neutralino.window.focus();
      // Also unminimize if it was minimized
      await Neutralino.window.setAlwaysOnTop(true);
      setTimeout(async () => {
        try { await Neutralino.window.setAlwaysOnTop(false); } catch {}
      }, 100);
    } catch (err) {
      console.error('restoreMainWindow failed:', err);
    }
  },

  // Quit app — kill widget child process, then exit main process
  async quitApp() {
    // 1. Try broadcast first (works if widget is still connected)
    try {
      await Neutralino.events.broadcast('appQuit', '');
    } catch {}

    // 2. Forcefully kill widget child process if we have its PID
    if (this.widgetWindowId && typeof this.widgetWindowId === 'number') {
      try {
        // On Windows, taskkill /PID; on other platforms, kill
        const isWin = navigator.platform.toLowerCase().includes('win');
        const cmd = isWin
          ? `taskkill /F /PID ${this.widgetWindowId}`
          : `kill -9 ${this.widgetWindowId}`;
        await Neutralino.os.execCommand(cmd);
      } catch {}
    }

    // 3. Exit main process after a small delay
    setTimeout(() => {
      Neutralino.app.exit();
    }, 300);
  },

  // ===== Deadline Notifications =====
  startNotificationCheck() {
    // Check every 60 seconds
    this.checkDeadlines();
    this.notificationTimer = setInterval(() => this.checkDeadlines(), 60000);
  },

  async checkDeadlines() {
    const now = new Date();
    const todos = Store.getAllTodos();

    for (const todo of todos) {
      if (todo.status === '已完成' || !todo.deadline) continue;

      const dl = new Date(todo.deadline);
      const diffMs = dl - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      // Notify if deadline is within 24 hours and not yet notified
      if (diffHours > 0 && diffHours <= 24 && !todo.notifiedAt) {
        const hoursLeft = Math.floor(diffHours);
        try {
          await Neutralino.os.showNotification(
            'Deadline Approaching',
            `"${todo.title}" is due in ${hoursLeft} hour(s)!`,
            'WARNING'
          );
          Store.updateTodo(todo.id, { notifiedAt: now.toISOString() });
        } catch (err) {
          console.warn('Notification failed:', err);
        }
      }

      // Notify if overdue and not yet notified for overdue
      if (diffMs < 0 && !todo.notifiedAt) {
        try {
          await Neutralino.os.showNotification(
            'Deadline Overdue',
            `"${todo.title}" is past due!`,
            'ERROR'
          );
          Store.updateTodo(todo.id, { notifiedAt: now.toISOString() });
        } catch (err) {
          console.warn('Notification failed:', err);
        }
      }
    }
  },

  // ===== Window Close Handling =====
  async onWindowClose() {
    const settings = Store.getSettings();

    if (settings.closeAction === 'minimize') {
      await Neutralino.window.hide();
      await this.showWidget();
      return;
    }

    if (settings.closeAction === 'quit') {
      Neutralino.app.exit();
      return;
    }

    // Default: hide to tray and show widget
    try {
      await Neutralino.window.hide();
      await this.showWidget();
    } catch (err) {
      console.error('onWindowClose error:', err);
    }
  },

  // ===== Widget Window =====
  async showWidget() {
    // Prevent duplicate widget windows
    if (this.widgetWindowId) {
      // If we have a tracked widget, assume it's alive
      // (broadcast would succeed even if widget is gone, so not a reliable check)
      return;
    }

    try {
      // Get primary screen dimensions
      const displays = await Neutralino.computer.getDisplays();
      const primary = displays.find(d => d.id === 0) || displays[0];

      const widgetWidth = 320;
      const widgetHeight = 360;
      const x = primary.resolution.width - widgetWidth - 20;
      const y = primary.resolution.height - widgetHeight - 60;

      // Create widget window
      // title: ' ' (single space) — avoids displaying a visible name in taskbar
      const proc = await Neutralino.window.create('/widget.html', {
        title: ' ',
        width: widgetWidth,
        height: widgetHeight,
        minWidth: 280,
        minHeight: 300,
        x,
        y,
        alwaysOnTop: true,
        resizable: false,
        borderless: true,
        enableInspector: false,
        exitProcessOnClose: true
      });

      // proc.pid is the OS process ID of the child window
      this.widgetWindowId = (proc && proc.pid) ? proc.pid : true;

      // Listen for widget closed signal to clear tracking
      const onWidgetClosed = () => {
        this.widgetWindowId = null;
        Neutralino.events.off('widgetClosed', onWidgetClosed);
      };
      Neutralino.events.on('widgetClosed', onWidgetClosed);

    } catch (err) {
      console.error('Failed to create widget window:', err);
      this.widgetWindowId = null;
    }
  },

  // ===== Data Operations =====
  refresh() {
    this.todos = Store.getAllTodos();
    this.tags = Store.getAllTags();
    FilterBar.renderTagFilters(this.tags);
    FilterBar.updateCounts(this.todos);
    this.applyFilters();
  },

  applyFilters() {
    let filtered = FilterBar.filter(this.todos);
    filtered = FilterBar.sort(filtered);
    TodoList.render(filtered, this.tags);
  },

  newTodo() {
    TodoForm.open(null, this.tags);
  },

  editTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) TodoForm.open(todo, this.tags);
  },

  updateTodoStatus(id, newStatus) {
    Store.updateTodo(id, { status: newStatus });
    this.refresh();
  },

  deleteTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;
    if (confirm(`Delete "${todo.title}"?`)) {
      Store.deleteTodo(id);
      this.refresh();
    }
  }
};

// Start the app after Neutralino initializes
Neutralino.init();

Neutralino.events.on('ready', async () => {
  try {
    await App.init();
  } catch (err) {
    console.error('App init failed:', err);
  }
});
