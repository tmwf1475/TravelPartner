# TravelPartner MVP

TravelPartner is a TypeScript/Node.js travel planning MVP with an Express backend, Gemini itinerary generation, SQLite storage, and a React/Vite frontend.

## Requirements

Required Node.js version: >= 20

Recommended: Node.js 20 LTS

## Backend local setup

```bash
git clone https://github.com/tmwf1475/TravelPartner.git
cd TravelPartner
npm install
cp .env.example .env
npm run typecheck
npm run build
npm run test
npm run dev
```

## Frontend local setup

Start the backend first, then run:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/health` and `/api` to the backend in development.

## Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `PORT` | No | HTTP server port. Defaults to `3000`. |
| `DATABASE_PATH` | No | SQLite database path. Defaults to `./data/travelpartner.sqlite`. |
| `GEMINI_API_KEY` | Yes outside test | Gemini API key. Test uses `test-key`. |
| `NODE_ENV` | No | Runtime environment: `development`, `test`, or `production`. |

Frontend environment variables:

| Name | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | No | Backend base URL for deployed frontend builds. Empty by default for Vite dev proxy. |

Do not commit `.env` to GitHub. Use `.env.example` as the template.

## API endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Service metadata. |
| `GET` | `/health` | Health check that does not require Gemini or database access. |
| `POST` | `/api/trips/generate-all` | Validate input, generate a Gemini itinerary, and store a trip. |
| `GET` | `/api/trips/:id/dashboard` | Fetch a stored trip dashboard. |

## API contract

Generate trip request:

```json
{
  "destination": "東京",
  "days": 3,
  "style": "自由行、美食、動漫",
  "start_date": "2026-08-01"
}
```

Trip response:

```json
{
  "trip": {
    "id": "uuid",
    "destination": "東京",
    "days": 3,
    "style": "自由行、美食、動漫",
    "start_date": "2026-08-01",
    "created_at": "2026-06-30T00:00:00.000Z",
    "itinerary": {
      "summary": "Trip summary",
      "highlights": ["Highlight"],
      "days": [
        {
          "day": 1,
          "title": "Day title",
          "morning": "Morning plan",
          "afternoon": "Afternoon plan",
          "evening": "Evening plan",
          "food": ["Food idea"],
          "tips": ["Travel tip"]
        }
      ]
    }
  }
}
```

Gemini is called only after request validation succeeds. In `NODE_ENV=test`, the backend uses a deterministic test itinerary and does not call Gemini.

## Error format

All API errors use this shape:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

Supported error codes include `VALIDATION_ERROR`, `NOT_FOUND`, and `INTERNAL_ERROR`.

## Health check

```bash
curl http://localhost:3000/health
```

## API example

```bash
curl -X POST http://localhost:3000/api/trips/generate-all \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "東京",
    "days": 3,
    "style": "自由行、美食、動漫",
    "start_date": "2026-08-01"
  }'
```

## Docker

```bash
docker build -t travelpartner .
docker run --env-file .env -p 3000:3000 -v $(pwd)/data:/app/data travelpartner
```

Docker Compose:

```bash
docker compose up --build
```

Backend: `http://localhost:3000`

Frontend preview: `http://localhost:4173`

## Test

```bash
npm run typecheck
npm run build
npm run test
npm run check
```

Frontend checks:

```bash
cd frontend
npm run typecheck
npm run build
```

Tests run with:

```txt
NODE_ENV=test
DATABASE_PATH=./data/test.sqlite
GEMINI_API_KEY=test-key
```

The test database is isolated from the development database and is removed after tests.
