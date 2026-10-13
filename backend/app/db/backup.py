"""
AEGIS SQLite Database Backup & Verification Utility.
Performs safe, live, point-in-time backups using SQLite's Online Backup API
compatible with WAL mode and concurrent active connections.
"""
import os
import sys
import sqlite3
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Tuple

logger = logging.getLogger("aegis.backup")


def create_backup(source_db_path: str, backup_dir: str = None) -> Tuple[Path, Dict[str, Any]]:
    """
    Safely creates a consistent point-in-time SQLite backup using the Online Backup API.
    Compatible with active WAL journaling without requiring exclusive database locks.
    """
    src_path = Path(source_db_path).resolve()
    if not src_path.exists():
        raise FileNotFoundError(f"Source database not found at {src_path}")

    if backup_dir is None:
        backup_dir = src_path.parent / "backups"
    else:
        backup_dir = Path(backup_dir).resolve()

    os.makedirs(backup_dir, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"aegis_backup_{timestamp}.db"

    # Connect to source in read-only URI mode to avoid dirty reads
    src_uri = f"file:{src_path}?mode=ro"
    src_conn = sqlite3.connect(src_uri, uri=True)
    dst_conn = sqlite3.connect(str(backup_file))

    try:
        # sqlite3 Online Backup API copies all pages consistently including WAL frames
        src_conn.backup(dst_conn, pages=-1)
    finally:
        dst_conn.close()
        src_conn.close()

    verification = verify_backup(str(src_path), str(backup_file))
    return backup_file, verification


def verify_backup(source_db_path: str, backup_db_path: str) -> Dict[str, Any]:
    """
    Verifies the integrity of a backup database and verifies table row counts
    match the source database.
    """
    b_conn = sqlite3.connect(f"file:{backup_db_path}?mode=ro", uri=True)
    b_cur = b_conn.cursor()

    # 1. Integrity check
    integrity_rows = b_cur.execute("PRAGMA integrity_check;").fetchall()
    integrity_status = "ok" if len(integrity_rows) == 1 and integrity_rows[0][0] == "ok" else "failed"

    # 2. Foreign key check
    fk_check = b_cur.execute("PRAGMA foreign_key_check;").fetchall()

    # 3. Tables and row count comparison
    tables = [
        row[0] for row in b_cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
        ).fetchall()
    ]

    s_conn = sqlite3.connect(f"file:{source_db_path}?mode=ro", uri=True)
    s_cur = s_conn.cursor()

    table_counts: Dict[str, Dict[str, int]] = {}
    mismatches = []

    for t in tables:
        b_count = b_cur.execute(f"SELECT COUNT(*) FROM {t};").fetchone()[0]
        s_count = s_cur.execute(f"SELECT COUNT(*) FROM {t};").fetchone()[0]
        table_counts[t] = {"source": s_count, "backup": b_count}
        if b_count != s_count:
            mismatches.append(t)

    b_size = Path(backup_db_path).stat().st_size

    b_conn.close()
    s_conn.close()

    is_valid = (integrity_status == "ok") and (len(mismatches) == 0)

    return {
        "is_valid": is_valid,
        "backup_path": str(backup_db_path),
        "backup_size_bytes": b_size,
        "integrity_status": integrity_status,
        "foreign_key_violations": len(fk_check),
        "table_counts": table_counts,
        "mismatches": mismatches
    }


if __name__ == "__main__":
    from app.core.config import settings
    db_file = settings.DATABASE_URL.replace("sqlite:///", "")
    print(f"Starting SQLite backup for {db_file}...")
    b_path, result = create_backup(db_file)
    print(f"Backup created at: {b_path}")
    print(f"Verification: {'PASSED' if result['is_valid'] else 'FAILED'}")
    print(f"Integrity status: {result['integrity_status']}")
    print(f"Table counts: {result['table_counts']}")
