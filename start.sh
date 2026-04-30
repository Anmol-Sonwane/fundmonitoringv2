#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_DIR="$ROOT_DIR/AI/headcount-api"
API_DIR="$ROOT_DIR/fundmonitoring/fundmonitoring"
FRONTEND_DIR="$ROOT_DIR/monitoringportal"
SEED_SQL_FILE="$ROOT_DIR/fundmonitoringnew_backup.sql"

AI_HOST="${AI_HOST:-127.0.0.1}"
AI_PORT="${AI_PORT:-5050}"
API_URLS="${API_URLS:-http://127.0.0.1:8080}"
FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
FRONTEND_PORT="${FRONTEND_PORT:-3002}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-fundmonitoringnew}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-Anmol28*}"

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

seed_database_if_needed() {
  if [ ! -f "$SEED_SQL_FILE" ]; then
    warn "Seed file not found: $SEED_SQL_FILE (skipping DB seed)"
    return
  fi

  if ! command -v mysql >/dev/null 2>&1; then
    warn "mysql client not found. Install MySQL client to enable auto-seeding."
    return
  fi

  local mysql_base_cmd=(
    mysql
    --host="$DB_HOST"
    --port="$DB_PORT"
    --user="$DB_USER"
    --password="$DB_PASSWORD"
    --protocol=tcp
    --batch
    --skip-column-names
  )

  log "Checking database status for $DB_NAME ..."

  if ! "${mysql_base_cmd[@]}" -e "SELECT 1;" >/dev/null 2>&1; then
    warn "Cannot connect to MySQL at $DB_HOST:$DB_PORT as $DB_USER. Skipping DB seed."
    return
  fi

  "${mysql_base_cmd[@]}" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;" >/dev/null

  local table_count
  table_count="$("${mysql_base_cmd[@]}" -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME';")"

  if [ "${table_count:-0}" -gt 0 ]; then
    log "Database '$DB_NAME' already has tables ($table_count). Skipping seed."
    return
  fi

  log "Database '$DB_NAME' is empty. Importing seed from $SEED_SQL_FILE ..."
  "${mysql_base_cmd[@]}" "$DB_NAME" < "$SEED_SQL_FILE"
  log "Seed import completed."
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

seed_database_if_needed

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
- Script seeds DB only when empty using:
  $SEED_SQL_FILE
- Make sure local MySQL is running and credentials are correct:
  DB_HOST=$DB_HOST DB_PORT=$DB_PORT DB_NAME=$DB_NAME DB_USER=$DB_USER

Press Ctrl+C to stop everything.
EOF

wait
