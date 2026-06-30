
# JP Game Overlay

An Electron app that adds an overlay on top of a window, allowing you to hover your mouse over any Japanese word to open a
dictionary. It only works on Windows for now.

It uses [meikiocr](https://github.com/rtr46/meikiocr) for the text recognition, [Yomitan](https://github.com/yomidevs/yomitan) for the popup definitions and [Glassy](https://github.com/cakiya/yomitan-glass-theme) for the glassy look.

https://github.com/user-attachments/assets/f5138e00-e8bc-4a0d-be28-b0821863a069

https://github.com/user-attachments/assets/db95461b-8dad-41e7-a258-a4ec40b26447

## Installation

1. Download and open the .exe in [releases](https://github.com/Mafutsu2/JP-Game-Overlay/releases).
2. When the app is installed, go to Yomitan settings by clicking the icon or pressing Alt+Shift+Y and download a dictionary (Jitendex is good).

https://github.com/user-attachments/assets/3ec5cdb8-9644-4128-a000-e0d2bf57ddef

## Building from source

1. Install [Node.js](https://nodejs.org/) and [Python](https://www.python.org/).
2. Clone the repo.
3. Run `npm install` to install node.js dependencies.
4. Run `cd ocr` to go in the ocr directory.
5. Run `python -m venv .venv` to create the virtual environment.
6. Run `.venv/Scripts/activate` to activate it.
7. Run `pip install -r requirements.txt` to install python dependencies.
8. Run `pyinstaller --onefile ocr.py` to make executable out of the ocr file.
9. Run `npm start` to run or `npm run make` to build the app.
