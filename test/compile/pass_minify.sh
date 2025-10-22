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
  "additionalProperties": {
    "type": "string"
  }
}
EOF

"$1" compile "$TMP/schema.json" > "$TMP/pretty.json"
"$1" compile --minify "$TMP/schema.json" > "$TMP/minified.json"

MINIFIED_LINES=$(wc -l < "$TMP/minified.json")
if [ "$MINIFIED_LINES" -ne 1 ]; then
  echo "error: Expected minified output to be 1 line, got $MINIFIED_LINES"
  exit 1
fi

PRETTY_LINES=$(wc -l < "$TMP/pretty.json")
if [ "$PRETTY_LINES" -le 1 ]; then
  echo "error: Expected pretty output to be more than 1 line, got $PRETTY_LINES"
  exit 1
fi

if grep -q ': ' "$TMP/minified.json"; then
  echo "error: Minified output contains ': ' (should be ':')"
  exit 1
fi

if ! grep -q ': ' "$TMP/pretty.json"; then
  echo "error: Pretty output does not contain ': '"
  exit 1
fi
