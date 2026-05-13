"""
Train the ASL classifier on your own data.

Usage:
  1. Collect samples:  python train.py collect --letter A
  2. Train model:      python train.py train
  3. Test accuracy:    python train.py test

Data is saved to ./data/<letter>/<timestamp>.npy
"""

import argparse
import os
import pickle
import sys
import time
from pathlib import Path

import cv2
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from hand_tracker import HandTracker

DATA_DIR = Path(__file__).parent / "data"
MODEL_PATH = Path(__file__).parent / "models" / "asl_classifier.pkl"

tracker = HandTracker()


def collect(letter: str, samples: int = 100):
    letter = letter.upper()
    out_dir = DATA_DIR / letter
    out_dir.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(0)
    print(f"Collecting {samples} samples for '{letter}'. Press SPACE to capture, Q to quit.")
    count = 0

    while count < samples:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        display = frame.copy()
        cv2.putText(display, f"{letter}: {count}/{samples}  [SPACE=capture, Q=quit]",
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.imshow("Collect", display)

        key = cv2.waitKey(1) & 0xFF
        if key == ord(" "):
            _, enc = cv2.imencode(".jpg", frame)
            b64 = "data:image/jpeg;base64," + __import__("base64").b64encode(enc).decode()
            hands, _ = tracker.process(b64)
            if hands:
                np.save(out_dir / f"{int(time.time()*1000)}.npy", hands[0].features)
                count += 1
                print(f"  Saved {count}/{samples}")
            else:
                print("  No hand detected — try again")
        elif key == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    print(f"Done! Collected {count} samples for '{letter}'")


def train():
    X, y = [], []
    if not DATA_DIR.exists():
        print("No data found. Run: python train.py collect --letter A")
        sys.exit(1)

    for letter_dir in sorted(DATA_DIR.iterdir()):
        letter = letter_dir.name
        files = list(letter_dir.glob("*.npy"))
        print(f"  {letter}: {len(files)} samples")
        for f in files:
            X.append(np.load(f))
            y.append(letter)

    if len(set(y)) < 2:
        print("Need at least 2 different letters. Collect more data first.")
        sys.exit(1)

    X = np.array(X)
    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y_enc, test_size=0.2, random_state=42)
    print(f"\nTraining on {len(X_train)} samples, testing on {len(X_test)}...")

    model = RandomForestClassifier(n_estimators=200, max_depth=None, n_jobs=-1, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump({
            "model": model,
            "label_map": {i: cls for i, cls in enumerate(le.classes_)},
        }, f)
    print(f"\nModel saved to {MODEL_PATH}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd")

    c = sub.add_parser("collect")
    c.add_argument("--letter", required=True)
    c.add_argument("--samples", type=int, default=100)

    sub.add_parser("train")

    args = parser.parse_args()
    if args.cmd == "collect":
        collect(args.letter, args.samples)
    elif args.cmd == "train":
        train()
    else:
        parser.print_help()
