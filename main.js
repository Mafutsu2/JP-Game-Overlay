import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { openWindows } from 'get-windows';
import { openYomitanSettings } from './yomitan.js';
import overlay from './overlay.js';

const start = async () => {
  try {
    let yomitanId;
    let win = new BrowserWindow({
      width: 800,
      height: 600,
      resizable: true,
      fullscreen: false,
      show: false,
      webPreferences: {
        preload: path.join(app.getAppPath(), 'preload.js'),
      }
    });
    //win.webContents.openDevTools();
    win.setMenuBarVisibility(false);
    win.loadFile('./view/index.html');
    win.on('closed', function () {
      win = null;
    });
    win.once('ready-to-show', () => {
      win.show();
      changeWindows(win);
    });
    ipcMain.on('start-overlay', (event, options) => {
      if (options.windowId === -1)
        return;
      options.delay = isNaN(options.delay) ? 2 : parseFloat(options.delay);
      overlay(app.getAppPath(), options, yomitanId, win);
      win.hide();
    });
    ipcMain.on('refresh-windows', (event) => changeWindows(win));
    ipcMain.on('open-yomitan', (event) => openYomitanSettings(yomitanId));

    const ses = win.webContents.session;
    ses.extensions.loadExtension(app.getAppPath() + '\\yomitan', { allowFileAccess: true }).then(({ id }) => {
      yomitanId = id;
      console.log('Yomitan loaded');
    });
  } catch (e) {
    console.log(e);
  }
};

const changeWindows = async (win) => {
  let allWindows = await openWindows();
  allWindows = allWindows.map(w => ({
    id: w.id,
    title: w.title,
    owner: w.owner.name,
  }));
  allWindows.splice(0, 1);
  win.webContents.send('update-windows', allWindows);
};

app.whenReady().then(start);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit();
});
