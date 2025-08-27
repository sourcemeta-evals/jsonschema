#!/usr/bin/env bash
# shellcheck disable=SC1091

set -euo pipefail

source "$(dirname "$0")/../utils.sh"

init_tmpdir

cat > "$TMPDIR/schema.json" <<'JSON'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": { "type": "string" }
  }
}
JSON

if ! "$JSONSCHEMA" lint "$TMPDIR" -i "$TMPDIR" 2>stderr.txt 1>stdout.txt; then
  echo "Expected success when all inputs are excluded"
  echo "StdErr:"
  cat stderr.txt || true
  exit 1
fi

assert_file_not_contains stderr.txt "unexpected error: map::at"
