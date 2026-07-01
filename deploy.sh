#!/usr/bin/env bash
set -euo pipefail

# TravelPartner VPS deploy / update script
# Usage:
#   First deploy : bash deploy.sh
#   Update       : bash deploy.sh

REPO="https://github.com/tmwf1475/TravelPartner.git"
APP_DIR="$HOME/TravelPartner"

echo "==> TravelPartner deploy"

# ── 1. clone or pull ──────────────────────────────────────────────────────────
if [ -d "$APP_DIR/.git" ]; then
  echo "--> pulling latest changes"
  git -C "$APP_DIR" pull origin main
else
  echo "--> cloning repo"
  git clone "$REPO" "$APP_DIR"
fi

cd "$APP_DIR"

# ── 2. ensure .env exists ─────────────────────────────────────────────────────
if [ ! -f .env ]; then
  echo ""
  echo "ERROR: .env not found."
  echo "Please create $APP_DIR/.env before running this script."
  echo ""
  echo "Minimum required content:"
  echo "  NODE_ENV=production"
  echo "  PORT=3000"
  echo "  DATABASE_PATH=/app/data/travelpartner.sqlite"
  echo "  GEMINI_API_KEY=<your-key>"
  echo ""
  exit 1
fi

# ── 3. ensure data dir exists ─────────────────────────────────────────────────
mkdir -p data

# ── 4. install Node if needed ─────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "--> installing Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "--> node $(node -v), npm $(npm -v)"

# ── 5. install dependencies & build ──────────────────────────────────────────
echo "--> installing backend dependencies"
npm install

echo "--> building backend"
npm run build

echo "--> installing frontend dependencies"
npm install --prefix frontend

echo "--> building frontend"
npm run build --prefix frontend

# ── 6. build & start docker containers ───────────────────────────────────────
echo "--> starting containers"
docker-compose up --build -d

# ── 7. wait for health ────────────────────────────────────────────────────────
echo "--> waiting for backend health"
STATUS="000"
for i in $(seq 1 20); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo "--> backend is healthy"
    break
  fi
  echo "    attempt $i/20 (status: $STATUS)"
  sleep 3
done

if [ "$STATUS" != "200" ]; then
  echo "WARNING: backend health check did not pass. Check logs:"
  echo "  docker-compose logs backend"
  exit 1
fi

# ── 8. smoke test ─────────────────────────────────────────────────────────────
echo "--> smoke testing API"
HEALTH=$(curl -s http://localhost/health)
echo "    /health → $HEALTH"

SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo '<YOUR_IP>')

echo ""
echo "==> Deploy complete"
echo "    Frontend : http://${SERVER_IP}"
echo "    Health   : http://${SERVER_IP}/health"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f backend     # backend logs"
echo "  docker-compose logs -f frontend    # frontend logs"
echo "  docker-compose logs -f nginx       # nginx logs"
echo "  docker-compose ps                  # container status"
echo "  docker-compose restart             # restart all"
