#!/usr/bin/env bash
#
# Safe database reset helper.
# - Default: backup snapshot only (no delete).
# - reset: always backs up first, then reseeds from fundmonitoringnew_backup.sql.
# - restore: load a chosen snapshot file.
#
# Usage:
#   ./reset.sh                    # backup only (safe)
#   ./reset.sh backup             # backup only
#   ./reset.sh reset --yes        # backup + drop DB + import seed (dev)
#   ./reset.sh restore <file.sql> # restore from snapshot
#
# Docker MySQL container:
#   DOCKER=1 ./reset.sh backup
#
# Remote / production host (blocked unless explicit):
#   ALLOW_REMOTE_RESET=1 DB_HOST=db.example.com ./reset.sh reset --yes

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEED_SQL_FILE="$ROOT_DIR/fundmonitoringnew_backup.sql"
SNAPSHOT_DIR="$ROOT_DIR/backups/snapshots"
DOCKER_CONTAINER="${DOCKER_CONTAINER:-fundmonitoring-mysql}"

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-fundmonitoringnew}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-Anmol28*}"
DOCKER="${DOCKER:-0}"

ACTION="${1:-backup}"
RESTORE_FILE="${2:-}"

log() { printf '[reset.sh] %s\n' "$*"; }
warn() { printf '[reset.sh][warn] %s\n' "$*" >&2; }
die() { printf '[reset.sh][error] %s\n' "$*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing command: $1"
}

is_local_host() {
  case "$DB_HOST" in
    127.0.0.1|localhost|::1) return 0 ;;
    *) return 1 ;;
  esac
}

guard_remote_reset() {
  if is_local_host; then
    return 0
  fi
  if [ "${ALLOW_REMOTE_RESET:-}" = "1" ]; then
    warn "Remote reset allowed (ALLOW_REMOTE_RESET=1) for host $DB_HOST"
    return 0
  fi
  die "Refusing reset on non-local host '$DB_HOST'. Backup-only is OK. For intentional remote reset: ALLOW_REMOTE_RESET=1"
}

mysql_client_available() {
  command -v mysql >/dev/null 2>&1 && command -v mysqldump >/dev/null 2>&1
}

docker_mysql_available() {
  command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "$DOCKER_CONTAINER"
}

run_mysql() {
  if [ "$DOCKER" = "1" ]; then
    docker exec -i "$DOCKER_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" "$@"
  else
    mysql --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" --password="$DB_PASSWORD" --protocol=tcp "$@"
  fi
}

run_mysqldump() {
  local outfile="$1"
  if [ "$DOCKER" = "1" ]; then
    docker exec "$DOCKER_CONTAINER" mysqldump -u"$DB_USER" -p"$DB_PASSWORD" \
      --single-transaction --routines --triggers "$DB_NAME" >"$outfile"
  else
    mysqldump --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" --password="$DB_PASSWORD" \
      --protocol=tcp --single-transaction --routines --triggers "$DB_NAME" >"$outfile"
  fi
}

import_sql_file() {
  local sql_file="$1"
  if [ "$DOCKER" = "1" ]; then
    docker exec -i "$DOCKER_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <"$sql_file"
  else
    run_mysql "$DB_NAME" <"$sql_file"
  fi
}

detect_mode() {
  if [ "$DOCKER" = "1" ]; then
    require_cmd docker
    docker_mysql_available || die "Docker container '$DOCKER_CONTAINER' is not running. Start: docker compose up -d"
    log "Using Docker MySQL container: $DOCKER_CONTAINER"
    return
  fi

  if mysql_client_available; then
    log "Using local mysql client ($DB_HOST:$DB_PORT)"
    return
  fi

  if docker_mysql_available; then
    DOCKER=1
    log "mysql client not found; falling back to Docker container: $DOCKER_CONTAINER"
    return
  fi

  die "No mysql/mysqldump CLI and Docker container '$DOCKER_CONTAINER' not running."
}

verify_connection() {
  if [ "$DOCKER" = "1" ]; then
    docker exec "$DOCKER_CONTAINER" mysqladmin ping -u"$DB_USER" -p"$DB_PASSWORD" --silent >/dev/null \
      || die "Cannot connect to MySQL in container $DOCKER_CONTAINER"
  else
    run_mysql -e "SELECT 1;" >/dev/null || die "Cannot connect to MySQL at $DB_HOST:$DB_PORT as $DB_USER"
  fi
}

create_snapshot() {
  mkdir -p "$SNAPSHOT_DIR"
  local stamp
  stamp="$(date +%Y-%m-%d_%H-%M-%S)"
  local outfile="$SNAPSHOT_DIR/${DB_NAME}_${stamp}.sql"

  log "Creating snapshot: $outfile"
  run_mysqldump "$outfile"

  if [ ! -s "$outfile" ]; then
    die "Snapshot file is empty: $outfile"
  fi

  log "Snapshot saved ($(wc -c <"$outfile" | tr -d ' ') bytes)"
  printf '%s\n' "$outfile"
}

do_backup() {
  verify_connection
  local snapshot
  snapshot="$(create_snapshot)"
  log "Backup complete: $snapshot"
  log "Snapshots directory: $SNAPSHOT_DIR"
  ls -1t "$SNAPSHOT_DIR"/*.sql 2>/dev/null | head -5 || true
}

do_reset() {
  guard_remote_reset

  if [ "${2:-}" != "--yes" ]; then
    die "Reset will DROP database '$DB_NAME' after backup. Re-run: ./reset.sh reset --yes"
  fi

  if [ ! -f "$SEED_SQL_FILE" ]; then
    die "Seed file not found: $SEED_SQL_FILE"
  fi

  verify_connection
  local snapshot
  snapshot="$(create_snapshot)"
  log "Safety snapshot: $snapshot"

  log "Dropping and recreating database '$DB_NAME' ..."
  if [ "$DOCKER" = "1" ]; then
    docker exec -i "$DOCKER_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" \
      -e "DROP DATABASE IF EXISTS \`$DB_NAME\`; CREATE DATABASE \`$DB_NAME\`;"
  else
    run_mysql -e "DROP DATABASE IF EXISTS \`$DB_NAME\`; CREATE DATABASE \`$DB_NAME\`;"
  fi

  log "Importing seed from $SEED_SQL_FILE ..."
  import_sql_file "$SEED_SQL_FILE"
  log "Reset complete. Previous data is in: $snapshot"
}

do_restore() {
  local file="${RESTORE_FILE:-}"
  if [ -z "$file" ]; then
    die "Usage: ./reset.sh restore <path-to-snapshot.sql>"
  fi
  if [ ! -f "$file" ]; then
    die "Snapshot not found: $file"
  fi

  verify_connection
  local snapshot
  snapshot="$(create_snapshot)"
  log "Pre-restore safety snapshot: $snapshot"

  log "Dropping and recreating database '$DB_NAME' ..."
  if [ "$DOCKER" = "1" ]; then
    docker exec -i "$DOCKER_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" \
      -e "DROP DATABASE IF EXISTS \`$DB_NAME\`; CREATE DATABASE \`$DB_NAME\`;"
  else
    run_mysql -e "DROP DATABASE IF EXISTS \`$DB_NAME\`; CREATE DATABASE \`$DB_NAME\`;"
  fi

  log "Restoring from $file ..."
  import_sql_file "$file"
  log "Restore complete."
}

detect_mode

case "$ACTION" in
  backup|"")
    do_backup
    ;;
  reset)
    do_reset "$@"
    ;;
  restore)
    do_restore
    ;;
  -h|--help|help)
    sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
    ;;
  *)
    die "Unknown action: $ACTION (use: backup | reset --yes | restore <file.sql>)"
    ;;
esac
