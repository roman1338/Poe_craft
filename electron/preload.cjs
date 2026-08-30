const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: () => true,
  startCraft: (ahkScriptContent) => ipcRenderer.send('start-craft', ahkScriptContent),
  stopCraft: () => ipcRenderer.send('stop-craft'),
  onLog: (callback) => ipcRenderer.on('log-message', (_event, value) => callback(value)),
  onStatusChange: (callback) => ipcRenderer.on('status-change', (_event, value) => callback(value))
});
