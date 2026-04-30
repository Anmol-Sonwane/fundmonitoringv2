#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_DIR="$ROOT_DIR/AI/headcount-api"
API_DIR="$ROOT_DIR/fundmonitoring/fundmonitoring"
FRONTEND_DIR="$ROOT_DIR/monitoringportal"

AI_HOST="${AI_HOST:-127.0.0.1}"
AI_PORT="${AI_PORT:-5050}"
API_URLS="${API_URLS:-http://127.0.0.1:8080}"
FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
FRONTEND_PORT="${FRONTEND_PORT:-3002}"

PIDS=()

log() {
  printf '[start.sh] %s\n' "$*"
}

warn() {
  printf '[start.sh][warn] %s\n' "$*" >&2
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    printf '[start.sh][error] Missing command: %s\n' "$cmd" >&2
    exit 1
  fi
}

cleanup() {
  log "Stopping local services..."
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done
}

trap cleanup EXIT INT TERM

log "Checking required tools..."
require_cmd python3
require_cmd dotnet

if [ ! -d "$AI_DIR" ]; then
  printf '[start.sh][error] AI service folder not found: %s\n' "$AI_DIR" >&2
  exit 1
fi

if [ ! -d "$API_DIR" ]; then
  printf '[start.sh][error] API folder not found: %s\n' "$API_DIR" >&2
  exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
  printf '[start.sh][error] Frontend folder not found: %s\n' "$FRONTEND_DIR" >&2
  exit 1
fi

log "Starting AI service at http://$AI_HOST:$AI_PORT ..."
(
  cd "$AI_DIR"

  if [ ! -d ".venv" ]; then
    log "Creating Python virtual environment at $AI_DIR/.venv ..."
    python3 -m venv .venv
  fi

  # shellcheck disable=SC1091
  source ".venv/bin/activate"
  pip install -r requirements.txt >/dev/null

  uvicorn app:app --host "$AI_HOST" --port "$AI_PORT"
) &
PIDS+=("$!")

log "Starting .NET API at $API_URLS ..."
(
  cd "$API_DIR"
  export ASPNETCORE_URLS="$API_URLS"
  dotnet run
) &
PIDS+=("$!")

log "Starting static frontend server at http://$FRONTEND_HOST:$FRONTEND_PORT ..."
(
  cd "$FRONTEND_DIR"
  if command -v python3 >/dev/null 2>&1; then
    python3 -m http.server "$FRONTEND_PORT" --bind "$FRONTEND_HOST"
  else
    warn "python3 not found for static frontend server."
    exit 1
  fi
) &
PIDS+=("$!")

cat <<EOF

------------------------------------------------------------
Local development is running:
  Frontend : http://$FRONTEND_HOST:$FRONTEND_PORT
  API      : $API_URLS
  AI       : http://$AI_HOST:$AI_PORT
------------------------------------------------------------

Notes:
- Database is NOT started by this script.
- Make sure your local MySQL is running and matches:
  $API_DIR/appsettings.json

Press Ctrl+C to stop everything.
EOF

wait
