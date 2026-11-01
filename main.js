const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
if (!app.requestSingleInstanceLock()) { app.quit(); }
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

function createWindow() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 900, minHeight: 600,
    title: 'Radhe Study Care', backgroundColor: '#EEF0FA', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file:')) { e.preventDefault(); if (/^https?:/i.test(url)) shell.openExternal(url); }
  });
}

ipcMain.handle('open-pdf', async (_e, bytes, name) => {
  const dir = path.join(app.getPath('temp'), 'RadheStudyCare');
  fs.mkdirSync(dir, { recursive: true });
  const safe = String(name || 'file').replace(/[\\/:*?"<>|]/g, '_').slice(0, 80) || 'file';
  const p = path.join(dir, safe + '.pdf');
  fs.writeFileSync(p, Buffer.from(bytes));
  return await shell.openPath(p);
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
