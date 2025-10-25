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
  "type": "string"
}
SCHEMA

"$1" compile "$TMP/schema.json" --minify > "$TMP/template.json"

# Verify the output is on a single line (minified/stringified)
LINES=$(wc -l < "$TMP/template.json")
if [ "$LINES" -ne 1 ]; then
  echo "Expected minified output to be on a single line, but got $LINES lines"
  exit 1
fi

# Verify the output is valid JSON and contains expected fields
cat << 'EXPECTED' > "$TMP/expected.json"
{"dynamic":false,"track":true,"instructions":[{"t":11,"s":"/type","i":"","k":"https://example.com#/type","r":2,"v":{"t":8,"v":4},"c":[]}]}
EXPECTED

diff "$TMP/template.json" "$TMP/expected.json"
