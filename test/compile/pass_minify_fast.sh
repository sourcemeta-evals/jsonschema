#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$id": "https://example.com",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "additionalProperties": {
    "type": "string"
  }
}
EOF

"$1" compile "$TMP/schema.json" --minify --fast > "$TMP/output.txt"

lines=$(wc -l < "$TMP/output.txt")
if [ "$lines" -ne 1 ]; then
  echo "Expected 1 line but got $lines"
  exit 1
fi

grep -q '"dynamic"' "$TMP/output.txt"
grep -q '"track"' "$TMP/output.txt"
grep -q '"instructions"' "$TMP/output.txt"
