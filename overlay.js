import { BrowserWindow, globalShortcut, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { pathToFileURL } from 'url';
import WebSocket from 'ws';
import kill from 'tree-kill';
import { openWindows } from 'get-windows';
import { Window } from 'node-screenshots';
import { openYomitanSettings } from './yomitan.js';

const overlay = (appPath, options, yomitanId, originalWin) => {
  let win = null;
  let socket = null;
  let child = null;
  let isInitializing = false;
  let isMainWindowOpen = false;
  let windowBounds = null;
  let lastHoldPress = null;
  let windowBoundsNeedResize = false;
  let windowBoundsInterval = null;
  let overlayInterval = null;
  let closeOverlayInterval = null;

  const registerShortcuts = () => {
    if (options.openTypeId != 0 && !globalShortcut.isRegistered('`'))
      globalShortcut.register('`', () => onOpenOverlay());
    if (!globalShortcut.isRegistered('Alt+Shift+Q'))
      globalShortcut.register('Alt+Shift+Q', () => win.close());
    if (!globalShortcut.isRegistered('Alt+Shift+Y'))
      globalShortcut.register('Alt+Shift+Y', () => openYomitanSettings(yomitanId));
  };

  const unregisterShortcuts = () => {
    globalShortcut.unregister('`');
    globalShortcut.unregister('Alt+Shift+Q');
    globalShortcut.unregister('Alt+Shift+Y');
  };

  const onOpenOverlay = () => {
    if (options.openTypeId === 1) {// on toggle
      if (win.isMinimized()) {
        win.restore();
        win.webContents.send('state-changed', true);
      } else {
        win.webContents.send('state-changed', false);
        setTimeout(() => win.minimize(), 120);
        win.minimize();
      }
    } else if (options.openTypeId === 2) {// on hold
      if (win.isMinimized()) {
        win.restore();
        win.webContents.send('state-changed', true);
      }

      if (closeOverlayInterval) {
        clearInterval(closeOverlayInterval);
        closeOverlayInterval = null;
      }

      const closingDelay = lastHoldPress && Date.now() - lastHoldPress > 100 ? 750 : 100;
      lastHoldPress = Date.now();
      closeOverlayInterval = setInterval(() => {
        win.webContents.send('state-changed', false);
        if (!win.isMinimized()) {
          setTimeout(() => win.minimize(), 120);
        }
        clearInterval(closeOverlayInterval);
        closeOverlayInterval = null;
      }, closingDelay);
    }
  };

  const updateWindowBounds = async () => {
    if (!win)
      return;

    const allWindows = await openWindows();
    const newWindowBounds = allWindows.find(w => w.id === options.windowId)?.contentBounds;
    if (!newWindowBounds) {
      win.close();
      return;
    }

    if (windowBoundsNeedResize && newWindowBounds.width !== 0 && newWindowBounds.height !== 0 && !win.isMinimized()) {
      win.setBounds({
        x: newWindowBounds.x,
        y: newWindowBounds.y,
        width: newWindowBounds.width,
        height: newWindowBounds.height
      });
      windowBoundsNeedResize = false;
    }

    if (newWindowBounds.width !== 0 && newWindowBounds.height !== 0 && (newWindowBounds.x !== windowBounds?.x || newWindowBounds.y !== windowBounds?.y || newWindowBounds.width !== windowBounds?.width || newWindowBounds.height !== windowBounds?.height)) {
      if (!win.isMinimized()) {
        win.setBounds({
          x: newWindowBounds.x,
          y: newWindowBounds.y,
          width: newWindowBounds.width,
          height: newWindowBounds.height
        });
      } else {
        windowBoundsNeedResize = true;
      }
    }
    windowBounds = newWindowBounds;

    if (isInitializing)
      return;

    updateWindowVisibility(allWindows);
  };

  const updateWindowVisibility = (allWindows) => {
    //main window is in front and not minimized
    if (allWindows[1].id === options.windowId && windowBounds.width !== 0 && windowBounds.height !== 0) {
      if (!isMainWindowOpen) {
        isMainWindowOpen = true;
        if (options.openTypeId === 0 && win.isMinimized())
          win.restore();
        registerShortcuts();
        overlayInterval = setInterval(() => {
          const screenshotPath = path.join(appPath, 'screenshots', 'window.png');
          makeScreenshot(screenshotPath);
        }, options.delay * 1000);
      }
    } else {
      if (isMainWindowOpen) {
        isMainWindowOpen = false;
        if (!win.isMinimized()) {
          win.minimize();
        }
        unregisterShortcuts();
        clearInterval(overlayInterval);
        overlayInterval = null;
      }
    }
  };

  const makeScreenshot = (screenshotPath) => {
    let windows = Window.all();
    windows.forEach((item) => {
      if (item.id() === options.windowId && item.width() > 0 && item.height() > 0) {
        let image = item.captureImageSync();
        fs.writeFile(screenshotPath, image.toPngSync(), (err) => {
          if (err) {
            console.error('Error writing file:', err);
            return;
          }
          if (socket !== null)
            socket.send(JSON.stringify({ screenshotPath: pathToFileURL(screenshotPath).href }));
          else
            console.error('Can\'t send data, websocket is null');
        });
      }
    });
  };

  const initPythonScript = () => {
    isInitializing = true;
    child = spawn("./ocr/dist/ocr.exe");

    child.stdout.on('data', (data) => {
      let output = data?.toString()?.split(':');
      if (output && output[0] === 'connected on port')
        initWebsocket(output[1]);
    });
    child.stderr.on('data', (data) => {
      console.log('stderr: ' + data);
    });
  };

  const killPythonScript = () => {
    console.log('kill');
    if (child)
      kill(child.pid);
  };

  const initWebsocket = (port) => {
    console.log('initWebsocket');
    socket = new WebSocket('ws://localhost:' + port);

    socket.addEventListener('open', () => {
      console.log('WebSocket connection established on port: ' + port);
      isInitializing = false;
    });

    socket.addEventListener('message', event => {
      console.log('Message from server received', new Date());
      const json = JSON.parse(event.data);
      if (win)
        win.webContents.send('update-text', json);
    });

    socket.addEventListener('close', event => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      socket = null;
    });

    socket.addEventListener('error', error => {
      console.error('WebSocket error:', error);
    });
  };

  win = new BrowserWindow({
    width: 100,
    height: 100,
    minWidth: 0,
    minHeight: 0,
    transparent: true,
    frame: false,
    titleBarStyle: 'hidden',
    resizable: false,
    fullscreen: false,
    show: false,
    webPreferences: {
      preload: path.join(appPath, 'preload.js'),
      additionalArguments: [ '' + options.openTypeId ],
    }
  });
  //win.webContents.openDevTools();
  win.loadFile('./view/overlay.html');
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setIgnoreMouseEvents(options.openTypeId === 0, { forward: options.openTypeId === 0 });

  const popupChangeHandler = (event, isShown) => {
    if (options.openTypeId === 0)
      win.setIgnoreMouseEvents(!isShown, { forward: !isShown });
  };
  ipcMain.on('popup-change', popupChangeHandler);

  win.on('closed', () => {
    clearInterval(windowBoundsInterval);
    windowBoundsInterval = null;
    if (overlayInterval) {
      clearInterval(overlayInterval);
      overlayInterval = null;
    }
    win = null;
    unregisterShortcuts();
    ipcMain.off('popup-change', popupChangeHandler);
    killPythonScript();
    originalWin.show();
  });
  win.once('ready-to-show', () => {
    console.log('ready-to-show');
    initPythonScript();
    windowBoundsInterval = setInterval(() => updateWindowBounds(), 500);
    win.show();
  });
  win.once('show', async () => {
    console.log('show');
    if (options.openTypeId !== 0) {
      win.minimize();
    }
  });
  registerShortcuts();
};

export default overlay;
