const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const DATA_FILE = 'todos.json';
let dataPath = '';
let data = null;
let saveTimer = null;

const DEFAULT_DATA = {
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
};

function init() {
  const userDataPath = app.getPath('userData');
  dataPath = path.join(userDataPath, DATA_FILE);
  loadData();
}

function loadData() {
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      data = JSON.parse(raw);
    } else {
      data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      writeDataSync();
    }
  } catch (err) {
    console.error('Failed to load data, using defaults:', err);
    data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    writeDataSync();
  }
}

function writeDataSync() {
  try {
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tmpPath = dataPath + '.tmp';
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, dataPath);
  } catch (err) {
    console.error('Failed to write data:', err);
  }
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    writeDataSync();
  }, 300);
}

// ===== Todos CRUD =====

function getAllTodos() {
  return data.todos;
}

function createTodo(todoData) {
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
  data.todos.push(todo);
  scheduleSave();
  return todo;
}

function updateTodo(id, updates) {
  const idx = data.todos.findIndex(t => t.id === id);
  if (idx === -1) return null;

  const todo = data.todos[idx];
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

  scheduleSave();
  return todo;
}

function deleteTodo(id) {
  const idx = data.todos.findIndex(t => t.id === id);
  if (idx === -1) return false;
  data.todos.splice(idx, 1);
  scheduleSave();
  return true;
}

// ===== Tags CRUD =====

function getAllTags() {
  return data.tags;
}

function createTag(tagData) {
  const tag = {
    id: 'tag_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    name: tagData.name,
    color: tagData.color || '#6b7280'
  };
  data.tags.push(tag);
  scheduleSave();
  return tag;
}

function updateTag(id, updates) {
  const tag = data.tags.find(t => t.id === id);
  if (!tag) return null;
  if (updates.name !== undefined) tag.name = updates.name;
  if (updates.color !== undefined) tag.color = updates.color;
  scheduleSave();
  return tag;
}

function deleteTag(id) {
  const idx = data.tags.findIndex(t => t.id === id);
  if (idx === -1) return false;
  data.tags.splice(idx, 1);
  // Remove tag from all todos
  data.todos.forEach(todo => {
    todo.tagIds = todo.tagIds.filter(tid => tid !== id);
  });
  scheduleSave();
  return true;
}

// ===== Settings =====

function getSettings() {
  return data.settings;
}

function updateSettings(updates) {
  Object.assign(data.settings, updates);
  scheduleSave();
  return data.settings;
}

// ===== Queries =====

function getNearestDeadlineTodos(count) {
  const now = new Date();
  return data.todos
    .filter(t => t.status !== '已完成' && t.deadline)
    .sort((a, b) => {
      const dlA = new Date(a.deadline);
      const dlB = new Date(b.deadline);
      const diffA = dlA - now;
      const diffB = dlB - now;
      // Upcoming (positive diff) first sorted ascending, then overdue sorted by most recent
      const aUpcoming = diffA >= 0;
      const bUpcoming = diffB >= 0;
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      return dlA - dlB;
    })
    .slice(0, count);
}

function getWidgetTodos(count) {
  const now = new Date();

  // Active todos: sorted by deadline proximity
  const active = data.todos
    .filter(t => t.status !== '已完成')
    .sort((a, b) => {
      // Todos with deadline first
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      if (a.deadline && b.deadline) {
        const dlA = new Date(a.deadline);
        const dlB = new Date(b.deadline);
        const diffA = dlA - now;
        const diffB = dlB - now;
        const aUpcoming = diffA >= 0;
        const bUpcoming = diffB >= 0;
        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;
        return dlA - dlB;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  // Completed todos: most recently completed first
  const completed = data.todos
    .filter(t => t.status === '已完成')
    .sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt));

  return [...active.slice(0, count), ...completed.slice(0, Math.max(5, count - active.length))];
}

module.exports = {
  init,
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  getSettings,
  updateSettings,
  getNearestDeadlineTodos,
  getWidgetTodos
};
