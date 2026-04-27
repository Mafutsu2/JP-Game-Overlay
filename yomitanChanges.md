### Extension doesn't work without adding permissions

**`yomitan/js/data/permissions-util.js`** **`line 89`**

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

-----

### To be able to interact with popups, stop overlay click passthrough if popup is visible

**`yomitan/js/app/popup.js`** **`line 750`**

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

-----

### To change default theme to Dark + [Glassy](https://github.com/cakiya/yomitan-glass-theme)

**`yomitan/data/schemas/options-schema.json`** **`line 255`**

```json
"popupTheme": {
"type": "string",
"enum": ["light", "dark", "browser", "site"],
"default": "dark"
},
"popupOuterTheme": {
"type": "string",
"enum": ["light", "dark", "browser", "site", "none"],
"default": "dark"
},
"customPopupCss": {
"type": "string",
"default": ":root[data-theme=\"light\"] {\n    color-scheme: light !important; /* forces light theme so it works on google.com*/\n    --text-color: #202020;\n    --subtext-color: #535353;\n}\n\n:root[data-theme=\"dark\"] {\n    color-scheme: dark !important; /* forces dark theme so it works on google.com*/\n    --text-color: #dfdfdf;\n    --subtext-color: #acacac;\n}\n\nbody {\n    background: transparent !important; \n    color: var(--text-color); /* default text color */\n}\n\n/* furigana text */\n.headword-term > ruby > rt {\n    color: var(--subtext-color);\n}\n\n/* word text */\n.headword-term,\n.headword-term * {\n    color: var(--text-color);\n}\n\n/* pitch accent bars */\n.pronunciation-mora-line {\n    border-color: var(--subtext-color);\n}\n\n/* glossary */\n.gloss-sc-thead,\n.gloss-sc-tfoot,\n.gloss-sc-th {\n    background-color: transparent !important;\n}\n\n\n/* Hide scrollbar but keep scroll functionality */\nhtml, body, #content-scroll {\n    scrollbar-width: none !important;      /* Firefox */\n    -ms-overflow-style: none !important;   /* IE/Edge (legacy) */\n}\n\nhtml::-webkit-scrollbar,\nbody::-webkit-scrollbar,\n#content-scroll::-webkit-scrollbar {\n    display: none !important;              /* Chrome/Safari/Edge */\n}"
},
"customPopupOuterCss": {
"type": "string",
"default": "iframe.yomitan-popup[data-theme=\"light\"] {\n    color-scheme: light !important; /* forces light theme so it works on google.com*/\n    --outer-bg: rgba(210, 210, 215, 0.85);\n    --outer-border: rgba(0, 0, 0, 0.2);\n}\n\niframe.yomitan-popup[data-theme=\"dark\"] {\n    color-scheme: dark !important; /* forces dark theme so it works on google.com*/\n    --outer-bg: rgba(45, 45, 50, 0.85);\n    --outer-border: rgba(255, 255, 255, 0.2);\n}\n\niframe.yomitan-popup {\n    background: var(--outer-bg) !important;\n    backdrop-filter: blur(1px) !important;\n    -webkit-backdrop-filter: blur(1px) !important;\n    border-radius: 12px !important;\n    border: 1px solid var(--outer-border) !important;\n    /* forced-color-adjust: none !important; */\n\n    /* hide scrollbar */\n    scrollbar-width: none !important; /* Firefox */\n    -ms-overflow-style: none !important; /* IE, Edge (legacy) */\n}"
},
```
