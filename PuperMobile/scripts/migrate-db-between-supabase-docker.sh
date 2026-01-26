#!/usr/bin/env bash

# Supabase -> Supabase DB migration using Docker (no local pg_dump/pg_restore required)
#
# What it does:
#  1) Dumps the SOURCE project's public schema (schema + data) to a custom-format dump
#  2) Restores that dump into the TARGET project's public schema (pre-data, data, post-data)
#  3) Runs repo SQL: /SUPABASE_TARGET_POST_MIGRATION.sql (storage policies + URL rewrites)
#
# Required env:
#   SOURCE_DB_URL  e.g. postgresql://postgres:PASSWORD@db.<source-ref>.supabase.co:5432/postgres?sslmode=require
#   TARGET_DB_URL  e.g. postgresql://postgres:PASSWORD@db.<target-ref>.supabase.co:5432/postgres?sslmode=require
#
# Safety env:
#   ALLOW_OVERWRITE=1   Allow restoring into a target that already has public tables
#   CLEAN_RESTORE=1     Add --clean --if-exists to pg_restore (DANGEROUS; drops objects)

set -euo pipefail

if [[ -z "${SOURCE_DB_URL:-}" || -z "${TARGET_DB_URL:-}" ]]; then
  echo "Missing env. Set SOURCE_DB_URL and TARGET_DB_URL." >&2
  exit 1
fi

# If libpq was installed via Homebrew, it's keg-only and not on PATH by default.
# Auto-prepend it so users don't have to manually export PATH.
if ! command -v pg_dump >/dev/null 2>&1 || ! command -v pg_restore >/dev/null 2>&1 || ! command -v psql >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    LIBPQ_PREFIX="$(brew --prefix libpq 2>/dev/null || true)"
    if [[ -n "${LIBPQ_PREFIX:-}" && -x "$LIBPQ_PREFIX/bin/pg_dump" && -x "$LIBPQ_PREFIX/bin/pg_restore" && -x "$LIBPQ_PREFIX/bin/psql" ]]; then
      export PATH="$LIBPQ_PREFIX/bin:$PATH"
    fi
  fi
fi

# Choose how to run Postgres client tools.
# Default: use local tools if available, otherwise fall back to Docker.
MODE=""
if [[ "${FORCE_LOCAL:-0}" == "1" ]]; then
  MODE="local"
elif [[ "${FORCE_DOCKER:-0}" == "1" ]]; then
  MODE="docker"
elif command -v pg_dump >/dev/null 2>&1 && command -v pg_restore >/dev/null 2>&1 && command -v psql >/dev/null 2>&1; then
  MODE="local"
else
  MODE="docker"
fi

if [[ "$MODE" == "docker" ]]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is required (docker command not found)." >&2
    echo "Either install Docker Desktop, or install local Postgres tools and re-run with FORCE_LOCAL=1." >&2
    exit 1
  fi
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PUPER_MOBILE_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd -- "$PUPER_MOBILE_DIR/.." && pwd)"
WORK_DIR="$REPO_ROOT/.supabase-migrate"
SQL_FILE="$REPO_ROOT/SUPABASE_TARGET_POST_MIGRATION.sql"
IMG="postgres:16"

mkdir -p "$WORK_DIR"

# -----------------------------------------------------------------------------
# Networking note (macOS / some networks):
# Supabase DB hostnames often resolve to both IPv4 (A) and IPv6 (AAAA). Some
# networks have broken/blocked IPv6, which can cause libpq tools to error with:
#   "Network is unreachable" (attempting an IPv6 address)
#
# To make this script robust, we resolve the hostname to an IPv4 address and
# pass it via the libpq connection parameter `hostaddr`.
# -----------------------------------------------------------------------------

extract_hostname_from_pgurl() {
  python3 - "$1" <<'PY'
from urllib.parse import urlparse
import sys
u = urlparse(sys.argv[1])
print(u.hostname or "")
PY
}

resolve_ipv4() {
  python3 - "$1" <<'PY'
import socket, sys
host = sys.argv[1]
try:
  print(socket.gethostbyname(host))
except Exception:
  print("")
PY
}

add_hostaddr_to_pgurl() {
  python3 - "$1" "$2" <<'PY'
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
import sys

url = sys.argv[1]
hostaddr = sys.argv[2]
u = urlparse(url)
q = dict(parse_qsl(u.query, keep_blank_values=True))

if hostaddr and 'hostaddr' not in q:
  q['hostaddr'] = hostaddr

new_u = u._replace(query=urlencode(q))
print(urlunparse(new_u))
PY
}

SOURCE_HOST="$(extract_hostname_from_pgurl "$SOURCE_DB_URL")"
TARGET_HOST="$(extract_hostname_from_pgurl "$TARGET_DB_URL")"

SOURCE_HOSTADDR_V4=""
TARGET_HOSTADDR_V4=""

if [[ -n "$SOURCE_HOST" ]]; then
  SOURCE_HOSTADDR_V4="$(resolve_ipv4 "$SOURCE_HOST")"
fi

if [[ -n "$TARGET_HOST" ]]; then
  TARGET_HOSTADDR_V4="$(resolve_ipv4 "$TARGET_HOST")"
fi

SOURCE_DB_URL_EFFECTIVE="$SOURCE_DB_URL"
TARGET_DB_URL_EFFECTIVE="$TARGET_DB_URL"

if [[ -n "$SOURCE_HOSTADDR_V4" ]]; then
  echo "[net] SOURCE host $SOURCE_HOST -> IPv4 $SOURCE_HOSTADDR_V4"
  SOURCE_DB_URL_EFFECTIVE="$(add_hostaddr_to_pgurl "$SOURCE_DB_URL" "$SOURCE_HOSTADDR_V4")"
fi

if [[ -n "$TARGET_HOSTADDR_V4" ]]; then
  echo "[net] TARGET host $TARGET_HOST -> IPv4 $TARGET_HOSTADDR_V4"
  TARGET_DB_URL_EFFECTIVE="$(add_hostaddr_to_pgurl "$TARGET_DB_URL" "$TARGET_HOSTADDR_V4")"
fi

# NOTE: Supabase DB hostnames can be IPv6-only (AAAA record with no A record).
# Docker Desktop on macOS commonly cannot reach IPv6 destinations from containers
# unless IPv6 networking is explicitly enabled.
if [[ "$MODE" == "docker" && -z "$TARGET_HOSTADDR_V4" && "${ALLOW_DOCKER_IPV6:-0}" != "1" ]]; then
  echo "[net] TARGET resolves to IPv6-only (no IPv4 A record detected)." >&2
  echo "[net] Docker Desktop on macOS often cannot reach IPv6 from containers." >&2
  echo "Fix options:" >&2
  echo "  A) Install local Postgres tools and re-run with FORCE_LOCAL=1 (recommended)." >&2
  echo "     - brew install libpq" >&2
  echo "     - export PATH=\"\$(brew --prefix libpq)/bin:\$PATH\"" >&2
  echo "  B) Enable IPv6 networking in Docker Desktop, then re-run (advanced)." >&2
  echo "  C) If you KNOW Docker IPv6 works, re-run with ALLOW_DOCKER_IPV6=1" >&2
  exit 1
fi

run_psql() {
  # usage: run_psql <db_url> [psql args...]
  local url="$1"; shift
  if [[ "$MODE" == "docker" ]]; then
    docker run --rm "$IMG" psql "$url" "$@"
  else
    psql "$url" "$@"
  fi
}

run_pg_dump() {
  # usage: run_pg_dump <db_url> <out_file>
  local url="$1"; shift
  local out_file="$1"; shift
  if [[ "$MODE" == "docker" ]]; then
    docker run --rm -v "$WORK_DIR:/work" "$IMG" \
      pg_dump "$url" -Fc --no-owner --no-privileges --schema=public -f "/work/$(basename "$out_file")"
  else
    pg_dump "$url" -Fc --no-owner --no-privileges --schema=public -f "$out_file"
  fi
}

run_pg_restore() {
  # usage: run_pg_restore <db_url> <dump_file> [extra flags...]
  local url="$1"; shift
  local dump_file="$1"; shift
  if [[ "$MODE" == "docker" ]]; then
    docker run --rm -v "$WORK_DIR:/work" "$IMG" \
      pg_restore "$@" -d "$url" "/work/$(basename "$dump_file")"
  else
    pg_restore "$@" -d "$url" "$dump_file"
  fi
}

if [[ ! -f "$SQL_FILE" ]]; then
  echo "Missing file: $SQL_FILE" >&2
  echo "Expected SUPABASE_TARGET_POST_MIGRATION.sql at repo root." >&2
  exit 1
fi

echo "[1/6] Checking target for existing public tables..."
TARGET_TABLES_COUNT="$(
  run_psql "$TARGET_DB_URL_EFFECTIVE" -tA -v ON_ERROR_STOP=1 \
    -c "select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE';" \
  | tr -d '[:space:]'
)"

if [[ "${TARGET_TABLES_COUNT:-0}" != "0" && "${ALLOW_OVERWRITE:-0}" != "1" ]]; then
  echo "Refusing to restore: target already has $TARGET_TABLES_COUNT public tables." >&2
  echo "If you're sure this is the correct TARGET project, re-run with ALLOW_OVERWRITE=1" >&2
  exit 1
fi

DUMP_FILE="$WORK_DIR/puper_public.dump"

echo "[2/6] Dumping SOURCE public schema/data -> $DUMP_FILE"
run_pg_dump "$SOURCE_DB_URL_EFFECTIVE" "$DUMP_FILE"

RESTORE_CLEAN_FLAGS=()
if [[ "${CLEAN_RESTORE:-0}" == "1" ]]; then
  RESTORE_CLEAN_FLAGS=(--clean --if-exists)
fi

echo "[3/6] Restoring TARGET public schema (pre-data)"
run_pg_restore "$TARGET_DB_URL_EFFECTIVE" "$DUMP_FILE" "${RESTORE_CLEAN_FLAGS[@]}" --no-owner --no-privileges --schema=public --section=pre-data

echo "[4/6] Restoring TARGET public schema (data)"
run_pg_restore "$TARGET_DB_URL_EFFECTIVE" "$DUMP_FILE" --no-owner --no-privileges --schema=public --section=data

echo "[5/6] Restoring TARGET public schema (post-data)"
run_pg_restore "$TARGET_DB_URL_EFFECTIVE" "$DUMP_FILE" --no-owner --no-privileges --schema=public --section=post-data

echo "[6/6] Running post-migration SQL (storage policies + URL rewrites)"
if [[ "$MODE" == "docker" ]]; then
  docker run --rm -v "$REPO_ROOT:/repo" "$IMG" \
    psql "$TARGET_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 -f /repo/SUPABASE_TARGET_POST_MIGRATION.sql
else
  psql "$TARGET_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
fi

echo "\nDone. Quick sanity check (public tables):"
run_psql "$TARGET_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 \
  -c "select table_name from information_schema.tables where table_schema='public' order by 1;"

echo "\nNEXT: copy Storage objects (images) between projects (requires service role keys)."
echo "From PuperMobile/:"
echo "  BUCKETS=review-photos,user-avatars,restroom-photos node scripts/migrate-storage-between-supabase.js"
