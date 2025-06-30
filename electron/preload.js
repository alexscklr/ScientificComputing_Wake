// electron/preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  readTurbineTypes: () => ipcRenderer.invoke('read-turbine-types'),
  writeTurbineTypes: (data) => ipcRenderer.invoke('write-turbine-types', data),
});