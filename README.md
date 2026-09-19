# Shoulder Dodge — MoveNet (React + Django)

This project is a modular, full-stack recreation and extension of `flexigame.html`, powered by **React (Vite)** on the frontend and **Django** on the backend.

---

## 📁 Architecture Overview

```
VoiceCheck/
│
├── backend/                       # Django Backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── backend/                   # Settings, CORS, root urls
│   └── game_api/                  # Game API app
│       ├── models.py              # GameScore & GameConfig
│       ├── views.py               # Health, Leaderboard, Scores, Config
│       ├── urls.py                # API routing (/api/...)
│       ├── utils.py               # JSON formatting and serialization
│       └── admin.py               # Django admin registration
│
├── frontend/                      # React Frontend (Vite)
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── components/            # Reusable UI components
│       │   ├── Header.jsx         # Title, Django status badge, Leaderboard trigger
│       │   ├── HUD.jsx            # Score, Lives hearts, Level
│       │   ├── WebcamFeed.jsx     # Mirrored webcam + real-time skeleton overlay
│       │   ├── GameCanvas.jsx     # 2D game arena canvas
│       │   ├── Overlays.jsx       # Start game & Game Over modal with score submit
│       │   ├── StatusBar.jsx      # Live MoveNet / camera status
│       │   └── LeaderboardModal.jsx # High scores table
│       │
│       ├── hooks/                 # Custom React hooks
│       │   ├── useCamera.js       # getUserMedia webcam access
│       │   ├── useMoveNet.js      # MoveNet pose tracking & coordinate mapping
│       │   └── useGameEngine.js   # Game physics, bullet loop, dodge scoring, sound
│       │
│       ├── utils/                 # Pure JavaScript utilities
│       │   ├── audioEngine.js     # Web Audio API violin melody & sound effects
│       │   ├── renderer.js        # Canvas grid, shoulders glow, bullet particle trails
│       │   └── collision.js       # Euclidean distance collision & bullet spawning
│       │
│       ├── constants/             # Game configuration & melody note definitions
│       │   ├── gameConfig.js
│       │   └── melodyNotes.js
│       │
│       ├── services/
│       │   └── api.js             # API client calling Django endpoints
│       │
│       ├── pages/
│       │   └── GamePage.jsx       # Main game screen coordinating all modules
│       │
│       └── styles/
│           └── game.css           # Sci-fi dark neon theme & hit flash animation
│
└── flexigame.html                 # Original single-file game preserved for reference
```

---

## 🚀 Running the Project

### 1. Start the Django Backend (Port 8000)
```bash
cd backend
python manage.py runserver 127.0.0.1:8000
```
- API Health: `http://127.0.0.1:8000/api/health/`
- API Leaderboard: `http://127.0.0.1:8000/api/leaderboard/`
- Django Admin: `http://127.0.0.1:8000/admin/`

### 2. Start the React Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
- Open in browser: `http://127.0.0.1:5173`

