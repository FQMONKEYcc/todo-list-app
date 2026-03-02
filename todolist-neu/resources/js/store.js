// ===== Store — Data Layer (Neutralinojs filesystem) =====

const Store = {
  data: null,
  dataPath: '',
  saveTimer: null,

  DEFAULT_DATA: {
    version: 1,
    tags: [
      { id: 'tag_default_1', name: 'Work', color: '#4a90d9' },
      { id: 'tag_default_2', name: 'Personal', color: '#27ae60' },
      { id: 'tag_default_3', name: 'Urgent', color: '#e74c3c' }
    ],
    todos: [],
    settings: {
      theme: 'dark',
      sortBy: 'deadline',
      sortOrder: 'asc',
      filterStatus: 'all',
      filterTagIds: [],
      closeAction: 'ask',
      filterDateRange: 'all'
    }
  },

  async init() {
    // Use Neutralino storage directory (AppData or ~/.config)
    const dataDir = await Neutralino.os.getPath('data');
    const appDir = dataDir + '/TodoList';
    this.dataPath = appDir + '/todos.json';

    // Ensure app directory exists
    try {
      await Neutralino.filesystem.getStats(appDir);
    } catch {
      await Neutralino.filesystem.createDirectory(appDir);
    }

    await this.loadData();
  },

  async loadData() {
    try {
      await Neutralino.filesystem.getStats(this.dataPath);
      const raw = await Neutralino.filesystem.readFile(this.dataPath);
      this.data = JSON.parse(raw);
    } catch {
      // File doesn't exist or is corrupted — use defaults
      this.data = JSON.parse(JSON.stringify(this.DEFAULT_DATA));
      await this.writeDataSync();
    }
  },

  async writeDataSync() {
    try {
      const json = JSON.stringify(this.data, null, 2);
      await Neutralino.filesystem.writeFile(this.dataPath, json);
    } catch (err) {
      console.error('Failed to write data:', err);
    }
  },

  scheduleSave() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.writeDataSync();
    }, 300);
  },

  // ===== Todos CRUD =====

  getAllTodos() {
    return this.data.todos;
  },

  createTodo(todoData) {
    const now = new Date().toISOString();
    const todo = {
      id: 'todo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      title: todoData.title,
      description: todoData.description || '',
      status: todoData.status || '未开始',
      deadline: todoData.deadline || null,
      tagIds: todoData.tagIds || [],
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      notifiedAt: null
    };
    this.data.todos.push(todo);
    this.scheduleSave();
    return todo;
  },

  updateTodo(id, updates) {
    const idx = this.data.todos.findIndex(t => t.id === id);
    if (idx === -1) return null;

    const todo = this.data.todos[idx];
    if (updates.title !== undefined) todo.title = updates.title;
    if (updates.description !== undefined) todo.description = updates.description;
    if (updates.status !== undefined) {
      todo.status = updates.status;
      if (updates.status === '已完成' && !todo.completedAt) {
        todo.completedAt = new Date().toISOString();
      } else if (updates.status !== '已完成') {
        todo.completedAt = null;
      }
    }
    if (updates.deadline !== undefined) todo.deadline = updates.deadline;
    if (updates.tagIds !== undefined) todo.tagIds = updates.tagIds;
    if (updates.notifiedAt !== undefined) todo.notifiedAt = updates.notifiedAt;
    todo.updatedAt = new Date().toISOString();

    this.scheduleSave();
    return todo;
  },

  deleteTodo(id) {
    const idx = this.data.todos.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.data.todos.splice(idx, 1);
    this.scheduleSave();
    return true;
  },

  // ===== Tags CRUD =====

  getAllTags() {
    return this.data.tags;
  },

  createTag(tagData) {
    const tag = {
      id: 'tag_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name: tagData.name,
      color: tagData.color || '#6b7280'
    };
    this.data.tags.push(tag);
    this.scheduleSave();
    return tag;
  },

  updateTag(id, updates) {
    const tag = this.data.tags.find(t => t.id === id);
    if (!tag) return null;
    if (updates.name !== undefined) tag.name = updates.name;
    if (updates.color !== undefined) tag.color = updates.color;
    this.scheduleSave();
    return tag;
  },

  deleteTag(id) {
    const idx = this.data.tags.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.data.tags.splice(idx, 1);
    // Remove tag from all todos
    this.data.todos.forEach(todo => {
      todo.tagIds = todo.tagIds.filter(tid => tid !== id);
    });
    this.scheduleSave();
    return true;
  },

  // ===== Settings =====

  getSettings() {
    return this.data.settings;
  },

  updateSettings(updates) {
    Object.assign(this.data.settings, updates);
    this.scheduleSave();
    return this.data.settings;
  },

  // ===== Queries =====

  getNearestDeadlineTodos(count) {
    const now = new Date();
    return this.data.todos
      .filter(t => t.status !== '已完成' && t.deadline)
      .sort((a, b) => {
        const dlA = new Date(a.deadline);
        const dlB = new Date(b.deadline);
        const diffA = dlA - now;
        const diffB = dlB - now;
        const aUpcoming = diffA >= 0;
        const bUpcoming = diffB >= 0;
        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;
        return dlA - dlB;
      })
      .slice(0, count);
  }
};
