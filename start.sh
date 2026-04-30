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
API_BASE="${API_URLS%%;*}"

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

  local_venv_python=""
  if [ -x ".venv/bin/python" ]; then
    local_venv_python=".venv/bin/python"
  elif [ -x ".venv/Scripts/python.exe" ]; then
    local_venv_python=".venv/Scripts/python.exe"
  elif [ -x ".venv/Scripts/python" ]; then
    local_venv_python=".venv/Scripts/python"
  else
    warn "Could not find Python inside .venv. Using system python3."
    local_venv_python="python3"
  fi

  "$local_venv_python" -m pip install -r requirements.txt >/dev/null
  "$local_venv_python" -m uvicorn app:app --host "$AI_HOST" --port "$AI_PORT"
) &
PIDS+=("$!")

log "Starting .NET API at $API_URLS ..."
(
  cd "$API_DIR"
  export ASPNETCORE_URLS="$API_URLS"
  dotnet run --no-launch-profile --urls "$API_URLS"
) &
PIDS+=("$!")

log "Starting frontend server with /api proxy at http://$FRONTEND_HOST:$FRONTEND_PORT ..."
(
  cd "$FRONTEND_DIR"
  if command -v python3 >/dev/null 2>&1; then
    FRONTEND_DIR="$FRONTEND_DIR" FRONTEND_HOST="$FRONTEND_HOST" FRONTEND_PORT="$FRONTEND_PORT" API_BASE="$API_BASE" python3 - <<'PY'
import http.server
import os
import socketserver
import urllib.request
import urllib.error

frontend_dir = os.environ["FRONTEND_DIR"]
host = os.environ["FRONTEND_HOST"]
port = int(os.environ["FRONTEND_PORT"])
api_base = os.environ["API_BASE"].rstrip("/")

os.chdir(frontend_dir)

class ProxyingHandler(http.server.SimpleHTTPRequestHandler):
    def _proxy(self):
        target = f"{api_base}{self.path}"
        body = None
        if self.command in ("POST", "PUT", "PATCH"):
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length) if length > 0 else None

        request_headers = {
            key: value
            for key, value in self.headers.items()
            if key.lower() not in {"host", "connection", "content-length"}
        }

        req = urllib.request.Request(target, data=body, method=self.command, headers=request_headers)

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                self.send_response(resp.status)
                for key, value in resp.getheaders():
                    if key.lower() in {"transfer-encoding", "connection"}:
                        continue
                    self.send_header(key, value)
                self.end_headers()
                self.wfile.write(resp.read())
        except urllib.error.HTTPError as exc:
            self.send_response(exc.code)
            for key, value in exc.headers.items():
                if key.lower() in {"transfer-encoding", "connection"}:
                    continue
                self.send_header(key, value)
            self.end_headers()
            self.wfile.write(exc.read())
        except Exception as exc:
            body = f"Proxy error: {exc}\n".encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith("/api/"):
            self._proxy()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            self._proxy()
        else:
            self.send_error(405, "Method not allowed")

    def do_PUT(self):
        if self.path.startswith("/api/"):
            self._proxy()
        else:
            self.send_error(405, "Method not allowed")

    def do_PATCH(self):
        if self.path.startswith("/api/"):
            self._proxy()
        else:
            self.send_error(405, "Method not allowed")

    def do_DELETE(self):
        if self.path.startswith("/api/"):
            self._proxy()
        else:
            self.send_error(405, "Method not allowed")

class ReusableTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True

with ReusableTCPServer((host, port), ProxyingHandler) as httpd:
    print(f"Serving frontend at http://{host}:{port} (proxying /api -> {api_base})")
    httpd.serve_forever()
PY
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
  API      : $API_BASE
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
