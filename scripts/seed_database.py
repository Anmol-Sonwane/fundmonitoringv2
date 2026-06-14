#!/usr/bin/env python3
"""Seed fundmonitoringnew from backup SQL when database has no demo data."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


def ensure_pymysql():
    script_dir = Path(__file__).resolve().parent
    venv_dir = script_dir / ".seed-venv"
    venv_python = venv_dir / "bin" / "python"
    if sys.platform == "win32":
        venv_python = venv_dir / "Scripts" / "python.exe"

    if not venv_python.exists():
        subprocess.check_call([sys.executable, "-m", "venv", str(venv_dir)])
        subprocess.check_call(
            [str(venv_python), "-m", "pip", "install", "pymysql", "-q"],
            stdout=subprocess.DEVNULL,
        )

    if str(venv_dir / "bin") not in sys.path and str(venv_dir / "Scripts") not in sys.path:
        site_packages = venv_dir / "lib"
        if site_packages.exists():
            for candidate in site_packages.glob("python*/site-packages"):
                sys.path.insert(0, str(candidate))
                break

    import pymysql  # noqa: F401


def connect(args):
    import pymysql

    return pymysql.connect(
        host=args.host,
        port=args.port,
        user=args.user,
        password=args.password,
        charset="utf8mb4",
        autocommit=True,
    )


def table_exists(cursor, database: str, table: str) -> bool:
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = %s AND table_name = %s
        """,
        (database, table),
    )
    return cursor.fetchone()[0] > 0


def row_count(cursor, table: str) -> int:
    cursor.execute(f"SELECT COUNT(*) FROM `{table}`")
    return int(cursor.fetchone()[0])


def needs_seed(cursor, database: str) -> bool:
    key_tables = ("organization", "monthlycalculation", "yearlycalculation")
    existing = [t for t in key_tables if table_exists(cursor, database, t)]
    if not existing:
        return True
    totals = [row_count(cursor, t) for t in existing]
    return sum(totals) == 0


def iter_statements(sql_path: Path):
    buffer: list[str] = []
    for line in sql_path.read_text(encoding="utf-8", errors="replace").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("--"):
            continue
        buffer.append(line)
        if stripped.endswith(";"):
            yield "\n".join(buffer)
            buffer = []


def import_sql(cursor, sql_path: Path) -> None:
    for statement in iter_statements(sql_path):
        try:
            cursor.execute(statement)
        except Exception as exc:  # pragma: no cover - dev seed helper
            preview = statement.strip().splitlines()[0][:120]
            raise RuntimeError(f"Failed SQL statement ({preview}...): {exc}") from exc


def print_summary(cursor) -> None:
    tables = (
        "organization",
        "information",
        "monthlycalculation",
        "yearlycalculation",
        "monthlyinfrastructure",
        "login",
        "studentinformation",
    )
    print("[seed] Database summary:")
    for table in tables:
        if not table_exists(cursor, "fundmonitoringnew", table):
            continue
        count = row_count(cursor, table)
        print(f"  - {table}: {count} rows")

    if table_exists(cursor, "fundmonitoringnew", "monthlycalculation"):
        cursor.execute("SELECT COALESCE(SUM(total), 0) FROM monthlycalculation")
        monthly_total = cursor.fetchone()[0]
        cursor.execute("SELECT COALESCE(SUM(total), 0) FROM yearlycalculation")
        yearly_total = cursor.fetchone()[0]
        cursor.execute("SELECT COALESCE(SUM(total), 0) FROM monthlyinfrastructure")
        infra_total = cursor.fetchone()[0]
        print(
            "[seed] Landing totals:"
            f" monthly=₹{monthly_total:,.2f},"
            f" yearly=₹{yearly_total:,.2f},"
            f" infra=₹{infra_total:,.2f}"
        )

    if table_exists(cursor, "fundmonitoringnew", "login"):
        print("[seed] Demo logins: admin/admin, user/user, nodal/nodal, student/student")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=3306)
    parser.add_argument("--user", default="root")
    parser.add_argument("--password", default="")
    parser.add_argument("--database", default="fundmonitoringnew")
    parser.add_argument("--sql-file", default="")
    parser.add_argument("--probe", action="store_true", help="Only test MySQL connectivity")
    args = parser.parse_args()

    if args.probe:
        ensure_pymysql()
        import pymysql

        try:
            conn = connect(args)
            conn.close()
            return 0
        except pymysql.Error:
            return 1

    if not args.sql_file:
        print("[seed][error] --sql-file is required unless using --probe", file=sys.stderr)
        return 1

    sql_path = Path(args.sql_file)
    if not sql_path.is_file():
        print(f"[seed][error] SQL file not found: {sql_path}", file=sys.stderr)
        return 1

    ensure_pymysql()
    import pymysql

    try:
        conn = connect(args)
    except pymysql.Error as exc:
        print(
            f"[seed][error] Cannot connect to MySQL at {args.host}:{args.port} "
            f"as {args.user}: {exc}",
            file=sys.stderr,
        )
        return 1

    try:
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{args.database}`")
            cursor.execute(f"USE `{args.database}`")

            if not needs_seed(cursor, args.database):
                print(f"[seed] Database '{args.database}' already has data. Skipping import.")
                print_summary(cursor)
                return 0

            print(f"[seed] Importing {sql_path.name} into '{args.database}' ...")
            import_sql(cursor, sql_path)
            print("[seed] Import completed.")
            print_summary(cursor)
            return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
