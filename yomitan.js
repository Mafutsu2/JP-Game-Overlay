import { app, BrowserWindow } from 'electron';
import path from "path";

let yomitanSettingsWindow = null;

export const openYomitanSettings = (yomitanId) => {
  if (!yomitanId)
    return;
  if (yomitanSettingsWindow && !yomitanSettingsWindow.isDestroyed()) {
    yomitanSettingsWindow.show();
    yomitanSettingsWindow.focus();
    return;
  }
  yomitanSettingsWindow = new BrowserWindow({
    width: 1100,
    height: 600,
    icon: path.join(app.getAppPath(), 'icons', 'icon.ico'),
    webPreferences: {
      nodeIntegration: true
    }
  });
  yomitanSettingsWindow.removeMenu();
  yomitanSettingsWindow.loadURL(`chrome-extension://${yomitanId}/settings.html`);
  yomitanSettingsWindow.show();
};
