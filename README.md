# SignAI — AI Sign Language App

Real-time ASL recognition, learning, and practice using MediaPipe + FastAPI + React.

## Features

| Mode | Description |
|------|-------------|
| **Recognize** | Live webcam → hand skeleton → ASL letter prediction |
| **Learn** | Browse all 26 ASL letters with step-by-step descriptions |
| **Practice** | Random target letter + hold-to-confirm scoring system |

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# → http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Open http://localhost:5173 in your browser, click **Start Camera**, and start signing!

---

## Improving Accuracy (Train Your Own Model)

The default classifier uses heuristic rules. For much better accuracy, collect your own training data:

```bash
cd backend
source venv/bin/activate

# Collect 100 samples per letter (press SPACE to capture)
python train.py collect --letter A
python train.py collect --letter B
# ... repeat for each letter you want

# Train the Random Forest model
python train.py train
```

The trained model is saved to `backend/models/asl_classifier.pkl` and loaded automatically on next server start.

---

## Architecture

```
sign-language-app/
├── backend/
│   ├── main.py          # FastAPI + WebSocket server
│   ├── hand_tracker.py  # MediaPipe hand landmark extraction
│   ├── classifier.py    # Heuristic + ML classifier
│   ├── train.py         # Data collection + training script
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx
        └── components/
            ├── Camera.jsx       # WebSocket + webcam capture
            ├── SignDisplay.jsx  # Prediction + sentence builder
            ├── LearnMode.jsx    # Browse ASL alphabet
            └── PracticeMode.jsx # Interactive practice with scoring
```

## Extending for Other Sign Languages

1. Collect data using `train.py collect` for your target language
2. Add sign descriptions to `main.py` → `ASL_SIGNS` dict
3. Train and deploy — the classifier is language-agnostic
