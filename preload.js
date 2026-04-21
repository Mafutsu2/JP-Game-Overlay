const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld('electronAPI', {
  startOverlay: (options) => ipcRenderer.send('start-overlay', options),
  refreshWindows: () => ipcRenderer.send('refresh-windows'),
  openYomitan: () => ipcRenderer.send('open-yomitan'),
  popupChange: (isShown) => ipcRenderer.send('popup-change', isShown),
  onUpdateWindows: (callback) => ipcRenderer.on('update-windows', (_event, value) => callback(value)),
  onUpdateText: (callback) => ipcRenderer.on('update-text', (_event, value) => callback(value)),
  onStateChanged: (callback) => ipcRenderer.on('state-changed', (_event, value) => callback(value)),
});
