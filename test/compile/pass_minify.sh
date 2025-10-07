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

LINES=$(wc -l < "$TMP/output.json")
if [ "$LINES" -ne 1 ]; then
  echo "Error: Expected 1 line, got $LINES"
  exit 1
fi

if ! grep -q '"dynamic"' "$TMP/output.json"; then
  echo "Error: Output doesn't appear to be a valid template"
  exit 1
fi
