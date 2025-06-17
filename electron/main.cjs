// electron/main.cjs

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // meistens false für React Apps
      contextIsolation: true,
    },
  });

  // Pfad zur gebauten React-App (dist oder build Ordner)
  win.loadURL(`file://${path.resolve(__dirname, '../dist/index.html').replace(/\\/g, '/')}`);

}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
