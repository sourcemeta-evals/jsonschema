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

lines=$(wc -l < "$TMP/output.json")
if [ "$lines" -ne 1 ]; then
  echo "Expected minified output to be on a single line, but got $lines lines"
  exit 1
fi

if ! grep -q '"dynamic":false' "$TMP/output.json"; then
  echo "Expected output to contain compiled template structure"
  exit 1
fi
