const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  openPdf: (bytes, name) => ipcRenderer.invoke('open-pdf', bytes, name)
});
