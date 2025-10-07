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

"$1" compile "$TMP/schema.json" --minify > "$TMP/template.json"

LINES=$(wc -l < "$TMP/template.json")
if [ "$LINES" -ne 1 ]; then
  echo "Expected 1 line, got $LINES"
  exit 1
fi

if ! grep -q '"dynamic"' "$TMP/template.json"; then
  echo "Output doesn't contain expected content"
  exit 1
fi
