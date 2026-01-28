#!/usr/bin/env bash
set -euo pipefail

INCOMING_DIR="${PRINT_SPOOL_DIR:-/spool/incoming}"
PROCESSING_DIR="${PRINT_PROCESSING_DIR:-/spool/processing}"
DONE_DIR="${PRINT_DONE_DIR:-/spool/done}"
FAILED_DIR="${PRINT_FAILED_DIR:-/spool/failed}"

mkdir -p "$INCOMING_DIR" "$PROCESSING_DIR" "$DONE_DIR" "$FAILED_DIR"

unique_dest() {
  local dir="$1"
  local base="$2"
  local dest="${dir}/${base}"
  if [[ ! -e "$dest" ]]; then
    echo "$dest"
    return
  fi
  local ts
  ts="$(date -u +%Y%m%dT%H%M%SZ)"
  echo "${dir}/${ts}.$$-${base}"
}

process_one() {
  local src="$1"
  if [[ ! -f "$src" ]]; then
    return 0
  fi
  if [[ "${src,,}" != *.pdf ]]; then
    return 0
  fi

  local base processing done failed
  base="$(basename "$src")"
  processing="$(unique_dest "$PROCESSING_DIR" "$base")"
  mv "$src" "$processing"

  if /usr/local/bin/omnivore-print-upload "$processing"; then
    done="$(unique_dest "$DONE_DIR" "$(basename "$processing")")"
    mv "$processing" "$done"
  else
    failed="$(unique_dest "$FAILED_DIR" "$(basename "$processing")")"
    mv "$processing" "$failed"
  fi
}

while IFS= read -r -d '' f; do
  process_one "$f"
done < <(find "$INCOMING_DIR" -type f \( -iname '*.pdf' -o -iname '*.PDF' \) -print0 2>/dev/null || true)

echo "watching $INCOMING_DIR for printed PDFs..."

inotifywait -m -r \
  -e close_write \
  -e moved_to \
  --format '%w%f' \
  "$INCOMING_DIR" | while read -r path; do
    process_one "$path"
  done
