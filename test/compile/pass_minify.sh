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

"$1" compile "$TMP/schema.json" --minify > "$TMP/output.json"

LINE_COUNT=$(wc -l < "$TMP/output.json")
if [ "$LINE_COUNT" -ne 1 ]; then
  echo "Expected single line output, got $LINE_COUNT lines"
  exit 1
fi

grep -q '{"dynamic":' "$TMP/output.json"
