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

LINES=$(wc -l < "$TMP/output.txt")
if [ "$LINES" -ne 1 ]; then
  echo "Expected minified output to be on a single line, but got $LINES lines"
  exit 1
fi

if ! grep -q '"dynamic":false' "$TMP/output.txt"; then
  echo "Expected output to contain '\"dynamic\":false'"
  exit 1
fi

if ! grep -q '"track":true' "$TMP/output.txt"; then
  echo "Expected output to contain '\"track\":true'"
  exit 1
fi

if ! grep -q '"instructions":\[' "$TMP/output.txt"; then
  echo "Expected output to contain '\"instructions\":['"
  exit 1
fi
