const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('widgetApi', {
  getInitialData: () => ipcRenderer.invoke('widget:getInitialData'),
  closeWidget: () => ipcRenderer.send('widget:close'),
  completeTodo: (id) => ipcRenderer.invoke('widget:completeTodo', id),
  createTodo: (data) => ipcRenderer.invoke('widget:createTodo', data),
  onTodosUpdate: (callback) => ipcRenderer.on('widget:todosUpdate', (_, data) => callback(data))
});
