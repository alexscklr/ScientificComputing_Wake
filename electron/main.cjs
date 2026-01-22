// electron/main.cjs

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { dialog } = require('electron');
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: process.execPath,
    files: [
      '**/*.js',
      '**/*.html',
      '**/*.css'
    ]
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, '../public/logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, '/preload.js'), // Preload Skript einfügen
      contextIsolation: true,
    },
  });

  win.loadURL(`file://${path.resolve(__dirname, '../dist/index.html').replace(/\\/g, '/')}`);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});