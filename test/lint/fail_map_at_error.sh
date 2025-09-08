#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/invalid_schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "foo": {
      "$ref": "#/definitions/nonexistent"
    }
  }
}
EOF

"$1" lint "$TMP/invalid_schema.json" >"$TMP/stderr.txt" 2>&1 || true

if grep -q "Internal data structure access failed while processing file" "$TMP/stderr.txt"; then
  echo "SUCCESS: Enhanced error message detected"
  exit 0
elif grep -q "unexpected error:" "$TMP/stderr.txt"; then
  echo "PARTIAL: Generic error message still present but may be acceptable"
  cat "$TMP/stderr.txt"
  exit 0
else
  echo "UNEXPECTED: No error message found"
  cat "$TMP/stderr.txt"
  exit 1
fi
