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

"$1" compile -m "$TMP/schema.json" > "$TMP/output.json"

LINES=$(wc -l < "$TMP/output.json")
if [ "$LINES" -ne 1 ]; then
  echo "Expected single line output, got $LINES lines"
  exit 1
fi

grep -q '"dynamic"' < "$TMP/output.json"
