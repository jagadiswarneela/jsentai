# JsentiAI

Text sentiment dashboard: type or speak, get the mood, watch the charts fill up.
Stack: React (Vite) + Flask + MongoDB. UI palette follows Thor: stormy night, lightning blue, cape red, Mjolnir steel, Asgard gold.

## Run locally (two terminals)

Backend:
```
cd backend
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
copy .env.example .env
flask --app app run --debug --port 5000
```
Check http://127.0.0.1:5000/api/health, it should show `"database": "connected"`.

Frontend (Node 20.19+ or 22.12+):
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

## Docker (backend + MongoDB)
```
docker compose up --build
```

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/health | Flask and MongoDB status |
| POST | /api/sentiment | `{"text": "..."}` returns label, score, breakdown, and saves it |
| GET | /api/predictions?limit=10 | Saved analyses, newest first |
| GET | /api/stats | Counts per label and recent scores for the charts |

Positive is lightning blue, negative is cape red, neutral is steel. Sentiment engine: VADER.
