const { ipcMain } = require('electron');
const store = require('./store');

function registerHandlers() {
  // Todos
  ipcMain.handle('todos:getAll', () => store.getAllTodos());
  ipcMain.handle('todos:create', (_, todoData) => store.createTodo(todoData));
  ipcMain.handle('todos:update', (_, id, updates) => store.updateTodo(id, updates));
  ipcMain.handle('todos:delete', (_, id) => store.deleteTodo(id));

  // Tags
  ipcMain.handle('tags:getAll', () => store.getAllTags());
  ipcMain.handle('tags:create', (_, tagData) => store.createTag(tagData));
  ipcMain.handle('tags:update', (_, id, updates) => store.updateTag(id, updates));
  ipcMain.handle('tags:delete', (_, id) => store.deleteTag(id));

  // Settings
  ipcMain.handle('settings:get', () => store.getSettings());
  ipcMain.handle('settings:update', (_, updates) => store.updateSettings(updates));
}

module.exports = { registerHandlers };
