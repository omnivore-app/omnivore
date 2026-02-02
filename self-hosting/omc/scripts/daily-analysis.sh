#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/Volumes/devel/personal/omnivore-content-system}"
BATCH_SIZE="${BATCH_SIZE:-5}"
HOURS="${HOURS:-24}"

cd "$REPO_DIR"

mkdir -p content/corpus-reports

# Ensure dependencies/build are available. Prefer Corepack-managed pnpm so native modules
# (better-sqlite3) are built for the active Node version.
if command -v corepack >/dev/null 2>&1; then
  corepack install >/dev/null 2>&1 || true
fi

corepack pnpm -s run build

node dist/bin/omc.js queue add --hours "$HOURS"
node dist/bin/omc.js analyze auto --batch-size "$BATCH_SIZE"
node dist/bin/omc.js analyze retry --failed

node dist/bin/omc.js report corpus > "content/corpus-reports/$(date +%Y-%m-%d)-daily.md"

