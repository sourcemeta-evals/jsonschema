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

"$1" compile "$TMP/schema.json" > "$TMP/template.json"

LINE_COUNT=$(wc -l < "$TMP/template.json")

if [ "$LINE_COUNT" -le 1 ]; then
  echo "error: Expected pretty-printed output with multiple lines, got $LINE_COUNT line(s)"
  exit 1
fi
