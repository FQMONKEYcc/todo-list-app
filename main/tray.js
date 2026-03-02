const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let tray = null;

function createTray(mainWindow, app) {
  // Create a simple 16x16 tray icon programmatically
  const iconPath = path.join(__dirname, '..', 'assets', 'icons', 'tray-icon.png');
  let icon;
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) throw new Error('empty');
  } catch (e) {
    // Fallback: create a simple colored icon
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon.isEmpty() ? createFallbackIcon() : icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Window',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'New Todo',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('action:newTodo');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Todo List');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

function createFallbackIcon() {
  // Create a 16x16 icon with a simple check mark design
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Draw a filled rounded square with primary color
      const inBounds = x >= 2 && x < 14 && y >= 2 && y < 14;
      if (inBounds) {
        canvas[idx] = 0x4a;     // R
        canvas[idx + 1] = 0x62; // G
        canvas[idx + 2] = 0x74; // B
        canvas[idx + 3] = 0xff; // A
      } else {
        canvas[idx + 3] = 0x00; // transparent
      }
    }
  }
  return nativeImage.createFromBuffer(canvas, { width: size, height: size });
}

function updateTooltip(pendingCount) {
  if (tray) {
    tray.setToolTip(`Todo List - ${pendingCount} item${pendingCount !== 1 ? 's' : ''} pending`);
  }
}

module.exports = { createTray, updateTooltip };
