#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'SCHEMA' > "$TMP/schema.json"
{
  "$id": "https://example.com",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "additionalProperties": {
    "type": "string"
  }
}
SCHEMA

"$1" compile "$TMP/schema.json" --minify > "$TMP/template.json"

# Check that the output is on a single line (minified)
LINES=$(wc -l < "$TMP/template.json")
if [ "$LINES" -ne 1 ]; then
  echo "Expected minified output to be on a single line, but got $LINES lines"
  exit 1
fi

# Check that the output is valid JSON
grep -q '"dynamic"' "$TMP/template.json"
grep -q '"track"' "$TMP/template.json"
grep -q '"instructions"' "$TMP/template.json"
