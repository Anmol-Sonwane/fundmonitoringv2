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
DOCKER_DB_PASSWORD="${DOCKER_DB_PASSWORD:-fundmonitoring_root_pwd}"
API_BASE="${API_URLS%%;*}"
PID_FILE="$ROOT_DIR/.local-dev.pids"

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

die() {
  printf '[start.sh][error] %s\n' "$*" >&2
  exit 1
}

extract_port() {
  local url="$1"
  if [[ "$url" =~ :([0-9]+)(/|$|\;) ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo ""
  fi
}

port_in_use() {
  local host="$1"
  local port="$2"

  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN -P -n >/dev/null 2>&1
    return $?
  fi

  python3 - "$host" "$port" <<'PY'
import socket
import sys

host, port = sys.argv[1], int(sys.argv[2])
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(0.5)
try:
    sys.exit(0 if sock.connect_ex((host, port)) == 0 else 1)
finally:
    sock.close()
PY
}

require_port_free() {
  local label="$1"
  local host="$2"
  local port="$3"
  local env_hint="$4"

  if port_in_use "$host" "$port"; then
    printf '[start.sh][error] %s port %s is still in use on %s.\n' "$label" "$port" "$host" >&2
    if command -v lsof >/dev/null 2>&1; then
      printf '[start.sh][error] Process using port %s:\n' "$port" >&2
      lsof -iTCP:"$port" -sTCP:LISTEN -P -n >&2 || true
    fi
    printf '[start.sh][error] Run: ./start.sh stop\n' >&2
    printf '[start.sh][error] Or use another port: %s\n' "$env_hint" >&2
    exit 1
  fi
}

kill_port_listeners() {
  local port="$1"
  if ! command -v lsof >/dev/null 2>&1; then
    return 0
  fi
  local pids=""
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    log "Stopping process on port $port (pid: $pids) ..."
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
  fi
}

stop_dev_stack() {
  local api_port
  api_port="$(extract_port "$API_BASE")"
  api_port="${api_port:-8080}"

  log "Stopping local dev stack ..."

  if [ -f "$PID_FILE" ]; then
    while IFS= read -r pid; do
      if [ -n "$pid" ] && kill -0 "$pid" >/dev/null 2>&1; then
        kill "$pid" >/dev/null 2>&1 || true
      fi
    done < "$PID_FILE"
    rm -f "$PID_FILE"
  fi

  kill_port_listeners "$AI_PORT"
  kill_port_listeners "$api_port"
  kill_port_listeners "$FRONTEND_PORT"
  sleep 1
}

save_pids() {
  : > "$PID_FILE"
  for pid in "${PIDS[@]}"; do
    echo "$pid" >> "$PID_FILE"
  done
}

dev_ports_in_use() {
  local api_port="$1"
  port_in_use "$AI_HOST" "$AI_PORT" \
    || port_in_use "127.0.0.1" "$api_port" \
    || port_in_use "$FRONTEND_HOST" "$FRONTEND_PORT"
}

verify_processes_running() {
  local failed=0
  for pid in "${PIDS[@]:-}"; do
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      warn "Service process $pid exited during startup."
      failed=1
    fi
  done
  if [ "$failed" -ne 0 ]; then
    die "One or more services failed to start. Scroll up for errors."
  fi
}

resolve_venv_python() {
  local venv_dir="$1"
  if [ -x "$venv_dir/bin/python" ]; then
    echo "$venv_dir/bin/python"
  elif [ -x "$venv_dir/Scripts/python.exe" ]; then
    echo "$venv_dir/Scripts/python.exe"
  elif [ -x "$venv_dir/Scripts/python" ]; then
    echo "$venv_dir/Scripts/python"
  else
    echo ""
  fi
}

remove_venv_dir() {
  local dir="$1"
  [ ! -d "$dir" ] && return 0

  python3 - "$dir" <<'PY' 2>/dev/null || true
import shutil
import sys
shutil.rmtree(sys.argv[1], ignore_errors=True)
PY

  if [ -d "$dir" ]; then
    rm -rf "$dir" 2>/dev/null || true
  fi

  if [ -d "$dir" ]; then
    die "Could not remove $dir (files in use). Stop ./start.sh, then run: rm -rf $dir"
  fi
}

setup_ai_venv() {
  local venv_dir="$AI_DIR/.venv"
  local attempt=1
  local max_attempts=2
  local venv_python=""

  cd "$AI_DIR"

  while [ "$attempt" -le "$max_attempts" ]; do
    if [ ! -d "$venv_dir" ] || [ "$attempt" -gt 1 ]; then
      if [ -d "$venv_dir" ]; then
        warn "Removing broken Python venv at $venv_dir ..."
        remove_venv_dir "$venv_dir"
      fi
      log "Creating Python virtual environment at $venv_dir ..."
      python3 -m venv "$venv_dir"
    fi

    venv_python="$(resolve_venv_python "$venv_dir")"
    if [ -z "$venv_python" ]; then
      warn "Could not find Python inside venv (attempt $attempt)."
      attempt=$((attempt + 1))
      continue
    fi

    log "Installing AI dependencies (attempt $attempt/$max_attempts) ..."
    if "$venv_python" -m pip install --upgrade pip setuptools wheel >/dev/null 2>&1 \
      && "$venv_python" -m pip install --no-cache-dir -r requirements.txt; then
      AI_VENV_PYTHON="$venv_python"
      log "AI dependencies ready."
      return 0
    fi

    warn "AI dependency install failed (attempt $attempt/$max_attempts)."
    attempt=$((attempt + 1))
  done

  die "Failed to install AI dependencies. Try manually: rm -rf $venv_dir && ./start.sh"
}

db_connection_string() {
  printf 'server=%s;port=%s;database=%s;user=%s;password=%s;' \
    "$DB_HOST" "$DB_PORT" "$DB_NAME" "$DB_USER" "$DB_PASSWORD"
}

mysql_probe() {
  local seed_script="$ROOT_DIR/scripts/seed_database.py"
  [ -f "$seed_script" ] || return 1
  python3 "$seed_script" \
    --probe \
    --host "$DB_HOST" \
    --port "$DB_PORT" \
    --user "$DB_USER" \
    --password "$DB_PASSWORD" \
    --database "$DB_NAME" >/dev/null 2>&1
}

try_docker_mysql_password() {
  if [ "$DB_PASSWORD" = "$DOCKER_DB_PASSWORD" ]; then
    return 1
  fi
  if python3 "$ROOT_DIR/scripts/seed_database.py" \
    --probe \
    --host "$DB_HOST" \
    --port "$DB_PORT" \
    --user "$DB_USER" \
    --password "$DOCKER_DB_PASSWORD" \
    --database "$DB_NAME" >/dev/null 2>&1; then
    warn "Using Docker MySQL password from previous container volume."
    DB_PASSWORD="$DOCKER_DB_PASSWORD"
    return 0
  fi
  return 1
}

ensure_mysql_running() {
  if mysql_probe; then
    log "MySQL is reachable at $DB_HOST:$DB_PORT"
    return 0
  fi

  try_docker_mysql_password && {
    log "MySQL is reachable at $DB_HOST:$DB_PORT (Docker credentials)"
    return 0
  }

  if ! command -v docker >/dev/null 2>&1; then
    warn "MySQL is not running at $DB_HOST:$DB_PORT and Docker is unavailable."
    warn "Install/start MySQL locally, or install Docker and rerun ./start.sh"
    return 1
  fi

  if [ ! -f "$ROOT_DIR/docker-compose.yml" ]; then
    warn "MySQL is not running and docker-compose.yml was not found."
    return 1
  fi

  log "MySQL not reachable — starting Docker MySQL (port $DB_PORT) ..."
  (
    cd "$ROOT_DIR"
    MYSQL_ROOT_PASSWORD="$DB_PASSWORD" MYSQL_PORT="$DB_PORT" docker compose up -d mysql
  )

  local attempt=1
  while [ "$attempt" -le 30 ]; do
    if mysql_probe || try_docker_mysql_password; then
      log "Docker MySQL is ready."
      return 0
    fi
    sleep 2
    attempt=$((attempt + 1))
  done

  die "Docker MySQL did not become ready on $DB_HOST:$DB_PORT"
}

seed_database_if_needed() {
  if [ ! -f "$SEED_SQL_FILE" ]; then
    warn "Seed file not found: $SEED_SQL_FILE (skipping DB seed)"
    return
  fi

  local seed_script="$ROOT_DIR/scripts/seed_database.py"

  if command -v mysql >/dev/null 2>&1; then
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
      warn "Start MySQL locally, or run: docker compose up -d mysql"
      return
    fi

    "${mysql_base_cmd[@]}" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;" >/dev/null

    local monthly_rows=0
    monthly_rows="$("${mysql_base_cmd[@]}" -e "
      SELECT COUNT(*)
      FROM information_schema.tables t
      WHERE t.table_schema='$DB_NAME' AND t.table_name='monthlycalculation';
    " 2>/dev/null || echo 0)"

    if [ "${monthly_rows:-0}" -gt 0 ]; then
      local data_rows
      data_rows="$("${mysql_base_cmd[@]}" -e "SELECT COUNT(*) FROM \`$DB_NAME\`.monthlycalculation;" 2>/dev/null || echo 0)"
      if [ "${data_rows:-0}" -gt 0 ]; then
        log "Database '$DB_NAME' already has data ($data_rows monthly rows). Skipping seed."
        return
      fi
    fi

    log "Database '$DB_NAME' is empty. Importing seed from $SEED_SQL_FILE ..."
    "${mysql_base_cmd[@]}" "$DB_NAME" < "$SEED_SQL_FILE"
    log "Seed import completed."
    return
  fi

  if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx 'fundmonitoring-mysql'; then
    log "Seeding via Docker MySQL container ..."
    if docker exec -i fundmonitoring-mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
      docker exec -i fundmonitoring-mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;" >/dev/null
      local docker_rows
      docker_rows="$(docker exec -i fundmonitoring-mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME' AND table_name='monthlycalculation';" 2>/dev/null || echo 0)"
      if [ "${docker_rows:-0}" -gt 0 ]; then
        local docker_data
        docker_data="$(docker exec -i fundmonitoring-mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" -N -e "SELECT COUNT(*) FROM \`$DB_NAME\`.monthlycalculation;" 2>/dev/null || echo 0)"
        if [ "${docker_data:-0}" -gt 0 ]; then
          log "Docker database '$DB_NAME' already has data. Skipping seed."
          return
        fi
      fi
      docker exec -i fundmonitoring-mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SEED_SQL_FILE"
      log "Seed import completed via Docker."
      return
    fi
  fi

  if [ -f "$seed_script" ]; then
    log "mysql client not found — seeding via Python helper ..."
    if ! python3 "$seed_script" \
      --host "$DB_HOST" \
      --port "$DB_PORT" \
      --user "$DB_USER" \
      --password "$DB_PASSWORD" \
      --database "$DB_NAME" \
      --sql-file "$SEED_SQL_FILE"; then
      warn "Database seed failed. Install MySQL and ensure it is running."
      warn "macOS: brew install mysql-client && brew services start mysql"
      warn "Or Docker: docker compose up -d mysql"
    fi
    return
  fi

  warn "mysql client not found and $seed_script missing. Skipping DB seed."
}

cleanup() {
  log "Stopping local services..."
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done
  rm -f "$PID_FILE"
}

if [ "${1:-}" = "stop" ]; then
  stop_dev_stack
  log "Stopped."
  exit 0
fi

if [ "${1:-}" = "help" ] || [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  cat <<EOF
Usage:
  ./start.sh         Start frontend, API, and AI (auto-stops previous session)
  ./start.sh stop    Stop processes from the last ./start.sh run

Ports (override with env vars):
  Frontend  http://$FRONTEND_HOST:$FRONTEND_PORT
  API       $API_URLS
  AI        http://$AI_HOST:$AI_PORT
EOF
  exit 0
fi

trap cleanup EXIT INT TERM

log "Checking required tools..."
require_cmd python3
require_cmd dotnet

ensure_mysql_running || true
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

API_PORT="$(extract_port "$API_BASE")"
if [ -z "$API_PORT" ]; then
  die "Could not parse API port from API_URLS=$API_URLS"
fi

if dev_ports_in_use "$API_PORT"; then
  warn "Previous local dev session detected on ports $AI_PORT / $API_PORT / $FRONTEND_PORT."
  stop_dev_stack
fi

require_port_free "AI" "$AI_HOST" "$AI_PORT" "AI_PORT=5051 ./start.sh"
require_port_free "API" "127.0.0.1" "$API_PORT" "API_URLS=http://127.0.0.1:8081 ./start.sh"
require_port_free "Frontend" "$FRONTEND_HOST" "$FRONTEND_PORT" "FRONTEND_PORT=3003 ./start.sh"

AI_VENV_PYTHON=""
setup_ai_venv

log "Starting AI service at http://$AI_HOST:$AI_PORT ..."
(
  cd "$AI_DIR"
  "$AI_VENV_PYTHON" -m uvicorn app:app --host "$AI_HOST" --port "$AI_PORT"
) &
PIDS+=("$!")

log "Starting .NET API at $API_URLS ..."
(
  cd "$API_DIR"
  export ASPNETCORE_URLS="$API_URLS"
  export DOTNET_ROLL_FORWARD="${DOTNET_ROLL_FORWARD:-LatestMajor}"
  export ConnectionStrings__DefaultConnection
  ConnectionStrings__DefaultConnection="$(db_connection_string)"
  dotnet run --no-launch-profile --urls "$API_URLS"
) &
PIDS+=("$!")

log "Starting frontend server at http://$FRONTEND_HOST:$FRONTEND_PORT (proxies /api and /uploads) ..."
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
    def _should_proxy(self):
        return self.path.startswith("/api/") or self.path.startswith("/uploads/")

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
        if self._should_proxy():
            self._proxy()
        else:
            super().do_GET()

    def do_POST(self):
        if self._should_proxy():
            self._proxy()
        else:
            self.send_error(405, "Method not allowed")

    def do_PUT(self):
        if self._should_proxy():
            self._proxy()
        else:
            self.send_error(405, "Method not allowed")

    def do_PATCH(self):
        if self._should_proxy():
            self._proxy()
        else:
            self.send_error(405, "Method not allowed")

    def do_DELETE(self):
        if self._should_proxy():
            self._proxy()
        else:
            self.send_error(405, "Method not allowed")

class ReusableTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True

with ReusableTCPServer((host, port), ProxyingHandler) as httpd:
    print(f"Serving frontend at http://{host}:{port} (proxying /api and /uploads -> {api_base})")
    httpd.serve_forever()
PY
  else
    warn "python3 not found for static frontend server."
    exit 1
  fi
) &
PIDS+=("$!")

sleep 3
verify_processes_running
save_pids

cat <<EOF

------------------------------------------------------------
Local development is running:
  Frontend : http://$FRONTEND_HOST:$FRONTEND_PORT
  API      : $API_BASE
  AI       : http://$AI_HOST:$AI_PORT
------------------------------------------------------------

Notes:
- Database is NOT started by this script.
- On first run, imports demo data from:
  $SEED_SQL_FILE
- Demo logins: admin/admin, user/user, nodal/nodal, student/student
- Make sure local MySQL is running and credentials are correct:
  DB_HOST=$DB_HOST DB_PORT=$DB_PORT DB_NAME=$DB_NAME DB_USER=$DB_USER

Press Ctrl+C to stop everything (or run: ./start.sh stop).
EOF

wait
