import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { openWindows } from 'get-windows';
import { openYomitanSettings } from './yomitan.js';
import overlay from './overlay.js';
import * as constants from './constants.js';

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
    win.once('ready-to-show', async () => {
      win.show();
      let allWindows = await changeWindows(win);
      const options = loadOptions(allWindows);
      win.webContents.send('update-options', options);
    });
    ipcMain.on('start-overlay', (event, options) => {
      if (options.window.id === -1)
        return;
      saveOptions(options);
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

const loadOptions = (allWindows) => {
  const userDataPath = app.getPath('userData');
  let options;
  try {
    const file = fs.readFileSync(`${userDataPath}/${constants.OPTIONS_FILE}`, { encoding: 'utf8' });
    options = JSON.parse(file);
  } catch (e) {
    console.log(e);
  }
  if (!options)
    options = {};

  options.window = allWindows.find((w) => w.name === options.window?.name && w.owner === options.window?.owner);
  if (!options.window)
    options.window = allWindows.find((w) => w.owner === options.window?.owner) || constants.DEFAULT_WINDOW;
  options.delay = options.delay || constants.DEFAULT_DELAY;
  options.yomitanHotkey = options.yomitanHotkey || constants.DEFAULT_YOMITAN_HOTKEY;
  options.exitHotkey = options.exitHotkey || constants.DEFAULT_EXIT_HOTKEY;
  options.activationHotkey = options.activationHotkey || constants.DEFAULT_ACTIVATION_HOTKEY;
  options.activation = options.activation || constants.DEFAULT_ACTIVATION;
  return options;
};

const saveOptions = (options) => {
  options.delay = isNaN(parseFloat(options.delay)) ? constants.DEFAULT_DELAY : parseFloat(options.delay);
  options.yomitanHotkey = options.yomitanHotkey ? unformatHotkey(options.yomitanHotkey) : constants.DEFAULT_YOMITAN_HOTKEY;
  options.exitHotkey = options.exitHotkey ? unformatHotkey(options.exitHotkey) : constants.DEFAULT_EXIT_HOTKEY;
  options.activationHotkey = options.activationHotkey ? unformatHotkey(options.activationHotkey) : constants.DEFAULT_ACTIVATION_HOTKEY;
  options.activation = isNaN(parseInt(options.activation)) ? constants.DEFAULT_ACTIVATION : parseInt(options.activation);

  const userDataPath = app.getPath('userData');
  try {
    if (!fs.existsSync(userDataPath))
      fs.mkdirSync(userDataPath)
    fs.writeFileSync(`${userDataPath}/${constants.OPTIONS_FILE}`, JSON.stringify(options), { encoding: 'utf8' });
  } catch (e) {
    console.log(e);
  }
};

const unformatHotkey = (hotkey) => {
  return hotkey.replaceAll(' ', '');
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
  return allWindows;
};

app.whenReady().then(start);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit();
});
