// ===== Widget Store — Lightweight Read-Only =====
// Widget only reads data and creates todos. Main window handles the full Store.

const WidgetStore = {
  dataPath: '',

  async init() {
    const dataDir = await Neutralino.os.getPath('data');
    const appDir = dataDir + '/TodoList';
    this.dataPath = appDir + '/todos.json';
  },

  async loadData() {
    try {
      await Neutralino.filesystem.getStats(this.dataPath);
      const raw = await Neutralino.filesystem.readFile(this.dataPath);
      return JSON.parse(raw);
    } catch {
      // Return empty data if file doesn't exist
      return {
        version: 1,
        tags: [],
        todos: [],
        settings: {}
      };
    }
  },

  async getNearestDeadlineTodos(count = 10) {
    const data = await this.loadData();
    const now = new Date();

    return data.todos
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
  },

  async createTodo(todoData) {
    const data = await this.loadData();
    const now = new Date().toISOString();
    const todo = {
      id: 'todo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      title: todoData.title,
      description: '',
      status: '未开始',
      deadline: todoData.deadline || null,
      tagIds: [],
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      notifiedAt: null
    };
    data.todos.push(todo);

    // Write back
    const json = JSON.stringify(data, null, 2);
    await Neutralino.filesystem.writeFile(this.dataPath, json);

    return todo;
  },

  async completeTodo(id) {
    const data = await this.loadData();
    const todo = data.todos.find(t => t.id === id);
    if (!todo) return null;

    todo.status = '已完成';
    todo.completedAt = new Date().toISOString();
    todo.updatedAt = new Date().toISOString();

    // Write back
    const json = JSON.stringify(data, null, 2);
    await Neutralino.filesystem.writeFile(this.dataPath, json);

    return todo;
  }
};
