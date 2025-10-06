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

# Verify output is on a single line (minified)
LINES=$(wc -l < "$TMP/output.json")
if [ "$LINES" -ne 1 ]; then
  echo "Expected minified output to be on a single line, got $LINES lines"
  exit 1
fi

# Verify it's valid JSON containing expected keys
grep -q '"dynamic"' "$TMP/output.json"
grep -q '"instructions"' "$TMP/output.json"
