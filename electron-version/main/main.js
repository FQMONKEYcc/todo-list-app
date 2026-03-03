const { app, BrowserWindow, dialog, ipcMain, screen } = require('electron');
const path = require('path');
const store = require('./store');
const { registerHandlers } = require('./ipc-handlers');
const { createTray } = require('./tray');
const notifications = require('./notifications');

let mainWindow = null;
let widgetWindow = null;
let widgetUpdateTimer = null;
app.isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false,
    backgroundColor: '#1a1b26'
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle close with user preference
  mainWindow.on('close', async (event) => {
    if (app.isQuitting) return;

    const settings = store.getSettings();
    const closeAction = settings.closeAction || 'ask';

    if (closeAction === 'minimize') {
      event.preventDefault();
      mainWindow.hide();
      showWidget();
      return;
    }

    if (closeAction === 'quit') {
      app.isQuitting = true;
      return;
    }

    // closeAction === 'ask'
    event.preventDefault();
    const { response, checkboxChecked } = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      title: 'Close Window',
      message: 'What would you like to do?',
      buttons: ['Minimize to Tray', 'Quit', 'Cancel'],
      defaultId: 0,
      cancelId: 2,
      checkboxLabel: "Don't ask again",
      checkboxChecked: false
    });

    if (response === 0) {
      // Minimize
      if (checkboxChecked) {
        store.updateSettings({ closeAction: 'minimize' });
      }
      mainWindow.hide();
      showWidget();
    } else if (response === 1) {
      // Quit
      if (checkboxChecked) {
        store.updateSettings({ closeAction: 'quit' });
      }
      app.isQuitting = true;
      mainWindow.close();
    }
    // response === 2 (Cancel): do nothing
  });

  mainWindow.on('show', () => {
    hideWidget();
  });

  mainWindow.on('minimize', () => {
    showWidget();
  });

  mainWindow.on('restore', () => {
    hideWidget();
  });
}

// ===== Widget Window =====

function createWidgetWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = primaryDisplay.workAreaSize;
  const widgetW = 320;
  const widgetH = 360;

  widgetWindow = new BrowserWindow({
    width: widgetW,
    height: widgetH,
    x: screenW - widgetW - 20,
    y: screenH - widgetH - 20,
    frame: false,
    transparent: true,
    skipTaskbar: true,
    alwaysOnTop: false,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'widget-preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  widgetWindow.loadFile(path.join(__dirname, '..', 'renderer', 'widget.html'));

  widgetWindow.on('closed', () => {
    widgetWindow = null;
  });
}

function showWidget() {
  if (!widgetWindow) {
    createWidgetWindow();
  }
  widgetWindow.showInactive();
  sendWidgetUpdate();
  startWidgetUpdates();
}

function hideWidget() {
  stopWidgetUpdates();
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.hide();
  }
}

function sendWidgetUpdate() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    const todos = store.getWidgetTodos(20);
    widgetWindow.webContents.send('widget:todosUpdate', todos);
  }
}

function startWidgetUpdates() {
  stopWidgetUpdates();
  widgetUpdateTimer = setInterval(sendWidgetUpdate, 60000);
}

function stopWidgetUpdates() {
  if (widgetUpdateTimer) {
    clearInterval(widgetUpdateTimer);
    widgetUpdateTimer = null;
  }
}

// ===== Widget IPC =====

ipcMain.handle('widget:getInitialData', () => {
  return store.getWidgetTodos(20);
});

ipcMain.on('widget:close', () => {
  hideWidget();
});

ipcMain.handle('widget:completeTodo', (_, id) => {
  store.updateTodo(id, { status: '已完成' });
  sendWidgetUpdate();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('todos:changed');
  }
  return true;
});

ipcMain.handle('widget:createTodo', (_, todoData) => {
  // Validate input from renderer
  if (!todoData || typeof todoData.title !== 'string') {
    throw new Error('Invalid todo data');
  }
  const title = todoData.title.trim();
  if (!title || title.length > 500) {
    throw new Error('Title must be 1-500 characters');
  }
  const deadline = todoData.deadline ? String(todoData.deadline) : null;

  const todo = store.createTodo({
    title,
    deadline,
    status: '未开始',
    tagIds: [],
    description: ''
  });
  sendWidgetUpdate();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('todos:changed');
  }
  return todo;
});

// ===== App Lifecycle =====

app.whenReady().then(() => {
  store.init();
  registerHandlers();
  createWindow();
  createTray(mainWindow, app);
  notifications.start(mainWindow);
});

app.on('before-quit', () => {
  app.isQuitting = true;
  notifications.stop();
  stopWidgetUpdates();
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.destroy();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
  }
});
