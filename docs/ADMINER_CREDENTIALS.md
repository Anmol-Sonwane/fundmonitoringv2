# Adminer credentials

Use these in the Adminer login form (System: **MySQL**).

## Local development (`./start.sh`)

MySQL must be running on your machine. Adminer is **not** started by `start.sh` — install Adminer separately or use MySQL Workbench / CLI.

| Field | Value |
|-------|--------|
| **Server** | `127.0.0.1` or `localhost` |
| **Username** | `root` |
| **Password** | `Anmol28*` |
| **Database** | `fundmonitoringnew` (optional; leave empty to list DBs) |

Same values as `fundmonitoring/fundmonitoring/appsettings.json` and `start.sh` defaults.

Override when running scripts:

```bash
DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=root DB_PASSWORD='Anmol28*' DB_NAME=fundmonitoringnew
```

---

## Docker Compose (this repo)

Start stack: `docker compose up -d`  
Adminer UI: **http://localhost:8080**

| Field | Value |
|-------|--------|
| **Server** | `mysql` |
| **Username** | `root` |
| **Password** | `fundmonitoring_root_pwd` |
| **Database** | `fundmonitoringnew` |

`mysql` is the Docker **service name** (hostname inside the compose network). Do not use `127.0.0.1` from inside Adminer — that points at the Adminer container itself, not MySQL.

Custom root password:

```bash
MYSQL_ROOT_PASSWORD=your_secret docker compose up -d
```

Use that same password in Adminer.

---

## Deployed server (example: VPS Adminer)

If Adminer is opened at something like `http://82.112.238.93:8080` and **Server** is `db`, that is your host’s compose/service name (not necessarily `mysql` from this repo).

| Field | Typical value |
|-------|----------------|
| **Server** | `db` (or whatever your `docker-compose` MySQL service is named) |
| **Username** | `root` |
| **Password** | Value of `MYSQL_ROOT_PASSWORD` on that server |
| **Database** | `fundmonitoringnew` |

Get the password on the server:

```bash
docker compose exec mysql printenv MYSQL_ROOT_PASSWORD
# or inspect compose / .env on the VPS
```

**Do not** use local passwords (`Anmol28*`, `fundmonitoring_root_pwd`) on production unless you set them there on purpose.

---

## Quick reference

| Environment | Adminer URL | Server | User | Password | Database |
|-------------|-------------|--------|------|----------|------------|
| Local MySQL | (your tool) | `127.0.0.1` | `root` | `Anmol28*` | `fundmonitoringnew` |
| Docker (repo) | http://localhost:8080 | `mysql` | `root` | `fundmonitoring_root_pwd` | `fundmonitoringnew` |
| VPS / production | http://&lt;host&gt;:8080 | `db` (your service name) | `root` | `MYSQL_ROOT_PASSWORD` on server | `fundmonitoringnew` |

---

## DB reset / backup (safe)

Never drop production data without a snapshot.

| Script | Purpose |
|--------|---------|
| `./reset.sh` | **Backup only** → `backups/snapshots/*.sql` |
| `./reset.sh reset --yes` | Backup first, then reseed from `fundmonitoringnew_backup.sql` (dev only) |
| `./reset.sh restore backups/snapshots/&lt;file&gt;.sql` | Restore a snapshot |

On Windows (Git Bash): `./reset.sh` or `reset.bat backup`
