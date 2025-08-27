#!/usr/bin/env bash
# shellcheck disable=SC1091

set -euo pipefail

source "$(dirname "$0")/../utils.sh"

init_tmpdir

cat > "$TMPDIR/tsconfig.app.json" <<'JSON'
/** invalid json */
JSON

cat > "$TMPDIR/tsconfig.doc.json" <<'JSON'
/** invalid json */
JSON

if "$JSONSCHEMA" lint "$TMPDIR/tsconfig.app.json" "$TMPDIR/tsconfig.doc.json" 2>stderr.txt 1>stdout.txt; then
  echo "Expected non-zero exit for invalid JSON inputs"
  exit 1
fi

assert_file_contains stderr.txt "error: Failed to parse the JSON document"
assert_file_not_contains stderr.txt "unexpected error: map::at"
