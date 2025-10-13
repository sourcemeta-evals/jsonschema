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
  "type": "string"
}
EOF

"$1" compile "$TMP/schema.json" --minify > "$TMP/output.txt"

LINE_COUNT="$(wc -l < "$TMP/output.txt")"
[ "$LINE_COUNT" = "1" ]

grep -q '{"dynamic"' "$TMP/output.txt"
