> [!NOTE]  
> This project is in developement, it doesn't fully work yet.

# JP Game Overlay

This app adds an overlay on top of a window, allowing you to hover your mouse over any Japanese word to open a
dictionary.

#### Made with Electron and uses:

- [meikiocr](https://github.com/rtr46/meikiocr)
- [Yomitan](https://github.com/yomidevs/yomitan)

https://github.com/user-attachments/assets/97a1eac8-fdd1-4c07-a8ca-04216c6ad961

## Building from source

1. Install [Node.js](https://nodejs.org/) and [Python](https://www.python.org/).
2. Clone the repo.
3. Run `npm install` to install node.js dependencies.
4. Run `cd ocr` to go in the ocr directory.
5. Run `python -m venv .venv` to create the virtual environment.
6. Run `.venv/Scripts/activate` to activate it.
7. Run `pip install -r requirements.txt` to install python dependencies.
8. Run `pyinstaller --onefile ocr.py` to make executable out of the ocr file.
9. Run `npm start` to run or `npm make` to build the app.
