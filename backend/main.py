"""
AI Sign Language App — FastAPI backend
--------------------------------------
WebSocket endpoint for real-time hand detection + ASL classification.
REST endpoints for sign reference data and teaching mode.
"""

import asyncio
import base64
import json
import logging
from typing import Any

import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from classifier import ASLClassifier
from hand_tracker import HandTracker

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = FastAPI(title="AI Sign Language API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

tracker = HandTracker()
classifier = ASLClassifier()

# ---------------------------------------------------------------------------
# ASL sign reference data
# ---------------------------------------------------------------------------

ASL_SIGNS: dict[str, dict[str, Any]] = {
    "A": {"description": "Make a fist. Thumb rests on the side of the index finger.", "difficulty": "easy"},
    "B": {"description": "Hold four fingers together and straight up. Tuck thumb across palm.", "difficulty": "easy"},
    "C": {"description": "Curve all fingers and thumb to form the letter C.", "difficulty": "easy"},
    "D": {"description": "Curl middle, ring, and pinky. Touch thumb to middle fingertip. Point index up.", "difficulty": "medium"},
    "E": {"description": "Bend all fingers down. Tuck thumb under fingers.", "difficulty": "medium"},
    "F": {"description": "Touch thumb and index fingertips together. Hold other three fingers up.", "difficulty": "medium"},
    "G": {"description": "Point index finger sideways. Thumb points the same direction.", "difficulty": "medium"},
    "H": {"description": "Point index and middle fingers sideways together.", "difficulty": "medium"},
    "I": {"description": "Hold up only the pinky finger. Make a fist with other fingers.", "difficulty": "easy"},
    "J": {"description": "Start with I handshape, then trace a J arc in the air.", "difficulty": "medium"},
    "K": {"description": "Extend index and middle fingers in a V. Place thumb between them.", "difficulty": "hard"},
    "L": {"description": "Extend index finger up and thumb out to form an L shape.", "difficulty": "easy"},
    "M": {"description": "Tuck thumb under three fingers (index, middle, ring).", "difficulty": "hard"},
    "N": {"description": "Tuck thumb under two fingers (index and middle).", "difficulty": "hard"},
    "O": {"description": "Curve all fingers and thumb to touch — forming an O.", "difficulty": "easy"},
    "P": {"description": "Like K but point fingers downward.", "difficulty": "hard"},
    "Q": {"description": "Like G but point fingers downward.", "difficulty": "hard"},
    "R": {"description": "Cross index and middle fingers. Extend them upward.", "difficulty": "medium"},
    "S": {"description": "Make a fist. Thumb wraps over the front of the fingers.", "difficulty": "easy"},
    "T": {"description": "Tuck thumb between index and middle fingers.", "difficulty": "medium"},
    "U": {"description": "Hold index and middle fingers up together. Tuck other fingers.", "difficulty": "easy"},
    "V": {"description": "Extend index and middle fingers in a V shape.", "difficulty": "easy"},
    "W": {"description": "Extend index, middle, and ring fingers spread apart.", "difficulty": "medium"},
    "X": {"description": "Hook the index finger like a crooked finger.", "difficulty": "medium"},
    "Y": {"description": "Extend thumb out and pinky up. Curl other fingers.", "difficulty": "easy"},
    "Z": {"description": "Draw a Z in the air with your index finger.", "difficulty": "medium"},
}


# ---------------------------------------------------------------------------
# REST endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "classifier": "ml" if classifier.is_trained() else "heuristic"}


@app.get("/signs")
async def get_signs():
    return {"signs": ASL_SIGNS, "count": len(ASL_SIGNS)}


@app.get("/signs/{letter}")
async def get_sign(letter: str):
    letter = letter.upper()
    if letter not in ASL_SIGNS:
        return JSONResponse({"error": "Sign not found"}, status_code=404)
    return {"letter": letter, **ASL_SIGNS[letter]}


# ---------------------------------------------------------------------------
# WebSocket — real-time recognition
# ---------------------------------------------------------------------------

@app.websocket("/ws/recognize")
async def recognize(ws: WebSocket):
    await ws.accept()
    log.info("Client connected")

    # Smoothing buffer: last N predictions
    BUFFER = 5
    history: list[str] = []

    try:
        while True:
            data = await ws.receive_text()
            msg = json.loads(data)

            if msg.get("type") != "frame":
                continue

            frame_b64: str = msg["frame"]

            hands, annotated = tracker.process(frame_b64)

            if hands is None:
                await ws.send_text(json.dumps({
                    "type": "result",
                    "detected": False,
                    "letter": None,
                    "confidence": 0,
                    "history": history[-BUFFER:],
                }))
                continue

            hand = hands[0]
            letter, conf = classifier.predict(hand.features)

            # Smooth: only update if consistent across buffer
            history.append(letter)
            if len(history) > BUFFER * 3:
                history = history[-(BUFFER * 3):]

            recent = history[-BUFFER:]
            stable = max(set(recent), key=recent.count) if recent else letter
            stable_conf = recent.count(stable) / len(recent) if recent else conf

            # Encode annotated frame back
            _, buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 70])
            annotated_b64 = "data:image/jpeg;base64," + base64.b64encode(buf).decode()

            await ws.send_text(json.dumps({
                "type": "result",
                "detected": True,
                "letter": stable,
                "raw_letter": letter,
                "confidence": round(stable_conf, 3),
                "handedness": hand.handedness,
                "annotated_frame": annotated_b64,
                "history": history[-BUFFER:],
            }))

    except WebSocketDisconnect:
        log.info("Client disconnected")
    except Exception as e:
        log.error(f"WebSocket error: {e}")
        await ws.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
