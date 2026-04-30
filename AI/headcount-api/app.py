from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
import numpy as np
import cv2

app = FastAPI()

model = YOLO("yolov8n.pt")

@app.post("/count")
async def count_people(image: UploadFile = File(...)):
    contents = await image.read()

    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = model(img, conf=0.25)

    count = 0
    for r in results:
        if r.boxes is not None:
            for cls in r.boxes.cls:
                if int(cls.item()) == 0:
                    count += 1

    return {"count": count}