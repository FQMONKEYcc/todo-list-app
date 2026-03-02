const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Todos
  getTodos: () => ipcRenderer.invoke('todos:getAll'),
  createTodo: (data) => ipcRenderer.invoke('todos:create', data),
  updateTodo: (id, data) => ipcRenderer.invoke('todos:update', id, data),
  deleteTodo: (id) => ipcRenderer.invoke('todos:delete', id),

  // Tags
  getTags: () => ipcRenderer.invoke('tags:getAll'),
  createTag: (data) => ipcRenderer.invoke('tags:create', data),
  updateTag: (id, data) => ipcRenderer.invoke('tags:update', id, data),
  deleteTag: (id) => ipcRenderer.invoke('tags:delete', id),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (data) => ipcRenderer.invoke('settings:update', data),

  // Events from main process
  onNewTodo: (callback) => ipcRenderer.on('action:newTodo', () => callback()),
  onNotificationClick: (callback) => ipcRenderer.on('notification:clicked', (_, todoId) => callback(todoId)),
  onTodosChanged: (callback) => ipcRenderer.on('todos:changed', () => callback())
});
