# TravelPartner backend MVP

TravelPartner is a TypeScript/Node.js backend MVP for generating and storing travel plans.

## Requirements

Required Node.js version: >= 20

Recommended: Node.js 20 LTS

## Local setup

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

## Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `PORT` | No | HTTP server port. Defaults to `3000`. |
| `DATABASE_PATH` | No | SQLite database path. Defaults to `./data/travelpartner.sqlite`. |
| `GEMINI_API_KEY` | Yes outside test | Gemini API key. Test uses `test-key`. |
| `NODE_ENV` | No | Runtime environment: `development`, `test`, or `production`. |

Do not commit `.env` to GitHub. Use `.env.example` as the template.

## API endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Service metadata. |
| `GET` | `/health` | Health check that does not require Gemini or database access. |
| `POST` | `/api/trips/generate-all` | Validate input, generate an MVP itinerary, and store a trip. |
| `GET` | `/api/trips/:id/dashboard` | Fetch a stored trip dashboard. |

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

## Test

```bash
npm run typecheck
npm run build
npm run test
npm run check
```

Tests run with:

```txt
NODE_ENV=test
DATABASE_PATH=./data/test.sqlite
GEMINI_API_KEY=test-key
```

The test database is isolated from the development database and is removed after tests.
