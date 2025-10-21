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

LINE_COUNT=$(wc -l < "$TMP/template.json")

if [ "$LINE_COUNT" -ne 1 ]; then
  echo "error: Expected minified output with 1 line, got $LINE_COUNT line(s)"
  exit 1
fi

"$1" compile "$TMP/schema.json" > "$TMP/pretty.json"

if cmp -s "$TMP/template.json" "$TMP/pretty.json"; then
  echo "error: Minified and pretty outputs should be different"
  exit 1
fi
