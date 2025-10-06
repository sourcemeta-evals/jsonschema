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
  "type": "object"
}
EOF

"$1" compile "$TMP/schema.json" --minify > "$TMP/output.json"

LINES=$(wc -l < "$TMP/output.json")
if [ "$LINES" -ne 1 ]; then
  echo "Expected minified output to be on a single line, got $LINES lines"
  exit 1
fi

"$1" compile "$TMP/schema.json" > "$TMP/pretty.json"

if ! grep -q '"dynamic"' "$TMP/output.json"; then
  echo "Output doesn't appear to be valid template JSON"
  exit 1
fi
