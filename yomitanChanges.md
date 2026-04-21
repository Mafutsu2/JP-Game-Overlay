added in yomitan/js/data/permissions-util.js

```js
export function getAllPermissions() {
  return new Promise((resolve, reject) => {
    resolve({
      "origins": [
        "<all_urls>",
        "chrome://favicon/*",
        "file:///*",
        "http://*/*",
        "https://*/*"
      ],
      "permissions": [
        "storage",
        "clipboardWrite",
        "unlimitedStorage",
        "declarativeNetRequest",
        "scripting",
        "offscreen",
        "contextMenus"
      ]
    });
  });
}
```

added in yomitan/js/app/popup.js

```js
_onVisibleChange({ value })
{
  if (this._visibleValue === value) {
    return;
  }
  this._visibleValue = value;
  this._frame.style.setProperty('visibility', value ? 'visible' : 'hidden', 'important');
  void this._invokeSafe('displayVisibilityChanged', { value });
  if (value) {
    window.dispatchEvent(new CustomEvent('yomitan-popup-shown'));
  } else {
    window.dispatchEvent(new CustomEvent('yomitan-popup-hidden'));
  }
}
```
