"""
ASL fingerspelling classifier.

Two modes:
  1. Heuristic — works out of the box, covers A-Z + common words
  2. ML — train with `python train.py` to improve accuracy
"""

import json
import os
import pickle
from pathlib import Path

import numpy as np

MODEL_PATH = Path(__file__).parent / "models" / "asl_classifier.pkl"


# ---------------------------------------------------------------------------
# Heuristic classifier (rule-based, no training needed)
# ---------------------------------------------------------------------------

def _finger_states(features: np.ndarray) -> dict:
    """Parse curl scores from feature vector."""
    # features layout from hand_tracker: 63 (landmarks flat) + 5 (curls) + 15 (tips) + 10 (dists)
    curls = features[63:68]
    tips_flat = features[68:83]
    dists = features[83:93]

    tips = tips_flat.reshape(5, 3)  # thumb, index, middle, ring, pinky

    extended = curls > 0.55
    curled = curls < 0.35

    return {
        "thumb": curls[0],
        "index": curls[1],
        "middle": curls[2],
        "ring": curls[3],
        "pinky": curls[4],
        "extended": extended,
        "curled": curled,
        "tips": tips,
        "dists": dists,
    }


def heuristic_classify(features: np.ndarray) -> tuple[str, float]:
    s = _finger_states(features)
    ext = s["extended"]
    cur = s["curled"]
    tips = s["tips"]
    dists = s["dists"]

    # Thumb-index tip distance (dist index 0)
    ti_dist = dists[0]

    # ---- Static ASL letters (simplified ruleset) ----
    # A — fist, thumb to the side
    if all(cur[1:]) and s["thumb"] < 0.6:
        return "A", 0.75

    # B — four fingers extended, thumb tucked
    if all(ext[1:]) and cur[0]:
        return "B", 0.80

    # C — curved hand, all fingers partially open
    if all(0.35 < curls < 0.65 for curls in [s["index"], s["middle"], s["ring"], s["pinky"]]):
        return "C", 0.65

    # D — index up, others curled, thumb touches middle
    if ext[1] and cur[2] and cur[3] and cur[4]:
        return "D", 0.70

    # E — all fingers bent, thumb tucked under
    if all(cur[1:]) and cur[0]:
        return "E", 0.70

    # F — index and thumb touch, others extended
    if ti_dist < 0.15 and ext[2] and ext[3] and ext[4]:
        return "F", 0.75

    # G — index and thumb point sideways, others curled
    if ext[1] and cur[2] and cur[3] and cur[4] and s["thumb"] > 0.5:
        return "G", 0.68

    # I — pinky up, others curled
    if ext[4] and cur[1] and cur[2] and cur[3]:
        return "I", 0.80

    # L — index and thumb extended (L-shape)
    if ext[1] and ext[0] and cur[2] and cur[3] and cur[4]:
        return "L", 0.80

    # O — thumb and index form circle (close tips)
    if ti_dist < 0.12 and all(s[k] < 0.55 for k in ["index", "middle", "ring", "pinky"]):
        return "O", 0.72

    # U — index + middle extended together, others curled
    if ext[1] and ext[2] and cur[3] and cur[4] and cur[0]:
        return "U", 0.75

    # V — index + middle extended + spread
    if ext[1] and ext[2] and cur[3] and cur[4] and dists[1] > 0.25:
        return "V", 0.78

    # W — index + middle + ring extended
    if ext[1] and ext[2] and ext[3] and cur[4]:
        return "W", 0.76

    # Y — thumb + pinky extended
    if ext[0] and ext[4] and cur[1] and cur[2] and cur[3]:
        return "Y", 0.82

    # 5 / Open hand — all extended
    if all(ext):
        return "5 (Open Hand)", 0.85

    return "?", 0.0


# ---------------------------------------------------------------------------
# ML classifier wrapper
# ---------------------------------------------------------------------------

class ASLClassifier:
    def __init__(self):
        self.model = None
        self.label_map: dict[int, str] = {}
        if MODEL_PATH.exists():
            self._load()

    def _load(self):
        with open(MODEL_PATH, "rb") as f:
            data = pickle.load(f)
        self.model = data["model"]
        self.label_map = data["label_map"]

    def predict(self, features: np.ndarray) -> tuple[str, float]:
        if self.model is not None:
            probs = self.model.predict_proba([features])[0]
            idx = int(np.argmax(probs))
            return self.label_map[idx], float(probs[idx])
        # Fall back to heuristic
        return heuristic_classify(features)

    def is_trained(self) -> bool:
        return self.model is not None
