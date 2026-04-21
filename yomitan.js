import { BrowserWindow } from 'electron';

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
    webPreferences: {
      nodeIntegration: true
    }
  });
  yomitanSettingsWindow.removeMenu();
  yomitanSettingsWindow.loadURL(`chrome-extension://${yomitanId}/settings.html`);
  yomitanSettingsWindow.show();
};
