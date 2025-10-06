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

"$1" compile "$TMP/schema.json" --minify > "$TMP/output.txt"

lines=$(wc -l < "$TMP/output.txt")
if [ "$lines" -ne 1 ]; then
  echo "Expected 1 line, got $lines"
  exit 1
fi

grep -q '"dynamic":false' "$TMP/output.txt" || exit 1
grep -q '"track":true' "$TMP/output.txt" || exit 1
grep -q '"instructions":\[' "$TMP/output.txt" || exit 1
