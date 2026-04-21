import asyncio
import json
from urllib.request import urlopen

import cv2
import numpy as np
from meikiocr import MeikiOCR
from websockets.asyncio.server import serve

ocr = MeikiOCR()

def analyse_image(screenshotPath):
    with urlopen(screenshotPath) as resp:
        image = cv2.imdecode(np.asarray(bytearray(resp.read()), dtype="uint8"), cv2.IMREAD_COLOR)
    results = ocr.run_ocr(image)
    return results

async def handler(websocket):
    async for message in websocket:
        data = json.loads(message)
        response = analyse_image(data['screenshotPath'])
        await websocket.send(json.dumps(response))

async def main():
    async with serve(handler, "localhost", 0) as server:
        print("connected on port:" + str(server.sockets[0].getsockname()[1]), end="", flush=True)
        await server.serve_forever()

asyncio.run(main())
