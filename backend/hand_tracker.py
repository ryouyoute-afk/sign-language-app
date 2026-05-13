import base64
import cv2
import mediapipe as mp
import numpy as np
from dataclasses import dataclass
from typing import Optional

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# MediaPipe landmark indices
WRIST = 0
THUMB_CMC, THUMB_MCP, THUMB_IP, THUMB_TIP = 1, 2, 3, 4
INDEX_MCP, INDEX_PIP, INDEX_DIP, INDEX_TIP = 5, 6, 7, 8
MIDDLE_MCP, MIDDLE_PIP, MIDDLE_DIP, MIDDLE_TIP = 9, 10, 11, 12
RING_MCP, RING_PIP, RING_DIP, RING_TIP = 13, 14, 15, 16
PINKY_MCP, PINKY_PIP, PINKY_DIP, PINKY_TIP = 17, 18, 19, 20


@dataclass
class HandResult:
    landmarks: np.ndarray       # (21, 3) normalized [0,1]
    features: np.ndarray        # scale-invariant features
    handedness: str             # 'Left' or 'Right'
    confidence: float


class HandTracker:
    def __init__(self):
        self.hands = mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5,
        )

    def decode_frame(self, frame_b64: str) -> np.ndarray:
        data = frame_b64.split(",")[1] if "," in frame_b64 else frame_b64
        img_bytes = base64.b64decode(data)
        arr = np.frombuffer(img_bytes, np.uint8)
        return cv2.imdecode(arr, cv2.IMREAD_COLOR)

    def process(self, frame_b64: str) -> tuple[Optional[list[HandResult]], np.ndarray]:
        frame = self.decode_frame(frame_b64)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = self.hands.process(rgb)

        if not result.multi_hand_landmarks:
            return None, frame

        hands = []
        for lm, hd in zip(result.multi_hand_landmarks, result.multi_handedness):
            landmarks = np.array([[p.x, p.y, p.z] for p in lm.landmark])
            features = self._extract_features(landmarks)
            hands.append(HandResult(
                landmarks=landmarks,
                features=features,
                handedness=hd.classification[0].label,
                confidence=hd.classification[0].score,
            ))
            # Draw skeleton on frame
            mp_drawing.draw_landmarks(
                frame, lm, mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style(),
            )

        return hands, frame

    def _extract_features(self, lm: np.ndarray) -> np.ndarray:
        # Translate so wrist is origin
        centred = lm - lm[WRIST]
        # Scale by wrist-to-middle-MCP distance (hand size)
        scale = np.linalg.norm(centred[MIDDLE_MCP]) or 1.0
        centred /= scale

        # Finger curl scores (0=closed, 1=extended)
        curls = np.array([
            self._curl(centred, THUMB_CMC, THUMB_MCP, THUMB_IP, THUMB_TIP),
            self._curl(centred, INDEX_MCP, INDEX_PIP, INDEX_DIP, INDEX_TIP),
            self._curl(centred, MIDDLE_MCP, MIDDLE_PIP, MIDDLE_DIP, MIDDLE_TIP),
            self._curl(centred, RING_MCP, RING_PIP, RING_DIP, RING_TIP),
            self._curl(centred, PINKY_MCP, PINKY_PIP, PINKY_DIP, PINKY_TIP),
        ])

        # Tip positions (relative, 5 fingers × 3 coords = 15 values)
        tips = centred[[THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP]].flatten()

        # Pairwise tip distances (10 pairs)
        tip_indices = [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP]
        dists = []
        for i in range(len(tip_indices)):
            for j in range(i + 1, len(tip_indices)):
                dists.append(np.linalg.norm(centred[tip_indices[i]] - centred[tip_indices[j]]))
        dists = np.array(dists)

        return np.concatenate([centred.flatten(), curls, tips, dists])

    @staticmethod
    def _curl(lm: np.ndarray, mcp: int, pip: int, dip: int, tip: int) -> float:
        """Returns ~1 if finger is extended, ~0 if curled."""
        v1 = lm[pip] - lm[mcp]
        v2 = lm[tip] - lm[pip]
        cos = np.dot(v1[:2], v2[:2]) / (np.linalg.norm(v1[:2]) * np.linalg.norm(v2[:2]) + 1e-6)
        return float(np.clip((cos + 1) / 2, 0, 1))
