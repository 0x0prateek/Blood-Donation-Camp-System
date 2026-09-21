#!/usr/bin/env bash
set -euo pipefail

BACKEND_PORT="${1:-8081}"
FRONTEND_PORT="${2:-3000}"
FRONTEND_URL="${3:-http://localhost:${FRONTEND_PORT}}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE="$ROOT_DIR/.env.example"

if [ ! -f "$ENV_FILE" ] && [ -f "$ENV_EXAMPLE" ]; then
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "Created .env from .env.example"
fi

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi

export FRONTEND_URL
export PORT="$BACKEND_PORT"
export VITE_PORT="$FRONTEND_PORT"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed or not on PATH. Install Node.js 20+ and try again."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not installed or not on PATH."
  exit 1
fi

ensure_dependencies() {
  local dir="$1"
  if [ ! -d "$dir/node_modules" ]; then
    echo "Installing dependencies in $dir"
    (cd "$dir" && npm install)
  fi
}

ensure_dependencies "$BACKEND_DIR"
ensure_dependencies "$FRONTEND_DIR"

BACKEND_LOG="$ROOT_DIR/backend-run.log"
FRONTEND_LOG="$ROOT_DIR/frontend-run.log"

if pgrep -f "node.*backend/src/index.js" >/dev/null 2>&1; then
  echo "Backend is already running."
else
  echo "Starting backend..."
  (cd "$BACKEND_DIR" && nohup env FRONTEND_URL="$FRONTEND_URL" PORT="$BACKEND_PORT" npm start > "$BACKEND_LOG" 2>&1 &) >/dev/null 2>&1 || true
fi

if pgrep -f "vite.*--port .*${FRONTEND_PORT}" >/dev/null 2>&1; then
  echo "Frontend is already running."
else
  echo "Starting frontend..."
  (cd "$FRONTEND_DIR" && nohup env VITE_PORT="$FRONTEND_PORT" npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT" > "$FRONTEND_LOG" 2>&1 &) >/dev/null 2>&1 || true
fi

sleep 2

echo
printf '\033[32mProject started successfully.\033[0m\n'
printf 'Backend URL: %s\n' "http://localhost:${BACKEND_PORT}/api"
printf 'Frontend URL: %s\n' "$FRONTEND_URL"
printf 'Backend log: %s\n' "$BACKEND_LOG"
printf 'Frontend log: %s\n' "$FRONTEND_LOG"
echo
printf '\033[33mUseful tips:\033[0m\n'
printf '  - Admin login: %s\n' "http://localhost:${FRONTEND_PORT}/login"
printf '  - Donor login: same page, then choose User\n'
printf '  - Stop the services with: pkill -f "backend/src/index.js|vite"\n'
